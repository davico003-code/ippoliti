// Repaso diario de IndexNow (7:30 AR). El aviso al instante sale de
// /api/revalidate cada vez que Hilo cambia una propiedad; esto es la red: compara
// el sitemap de hoy con el de la última corrida y avisa lo NUEVO, lo que CAMBIÓ
// (lastmod) y lo que SE FUE (fichas dadas de baja, páginas que salieron). La
// primera corrida avisa el sitio entero. También deja al día el mapa
// id → ruta de las fichas que usa el aviso al instante para las bajas.

import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { CLAVE_FICHAS, SITIO, avisarIndexNow } from '@/lib/indexnow'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

const CLAVE_FOTO = 'indexnow:sitemap'

export async function GET(req: Request) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const xml = await fetch(`${SITIO}/sitemap.xml`, { cache: 'no-store', signal: AbortSignal.timeout(30_000) }).then((r) => (r.ok ? r.text() : ''))
  const hoy: Record<string, string> = {}
  for (const m of Array.from(xml.matchAll(/<url>([\s\S]*?)<\/url>/g))) {
    const loc = (m[1].match(/<loc>([^<]+)<\/loc>/) || [])[1]?.replace(/&amp;/g, '&')
    if (loc) hoy[loc] = (m[1].match(/<lastmod>([^<]+)<\/lastmod>/) || [])[1] ?? ''
  }
  const antes = (await redis.get<Record<string, string>>(CLAVE_FOTO).catch(() => null)) ?? null
  const nHoy = Object.keys(hoy).length
  const nAntes = antes ? Object.keys(antes).length : 0
  // Guardia anti-truncado: si el sitemap vino corto (Hilo caído al armarlo), no
  // se toma como "se fueron cientos de páginas" ni se pisa la foto buena.
  if (nHoy < 100 || (antes && nHoy < nAntes * 0.7)) {
    console.error('[cron/indexnow] sitemap sospechoso', { nHoy, nAntes })
    return NextResponse.json({ ok: false, motivo: 'sitemap_corto', nHoy, nAntes })
  }

  const nuevas = Object.keys(hoy).filter((u) => !antes || !(u in antes))
  const cambiadas = antes ? Object.keys(hoy).filter((u) => u in antes && antes[u] !== hoy[u]) : []
  const idas = antes ? Object.keys(antes).filter((u) => !(u in hoy)) : []
  const resultado = await avisarIndexNow([...nuevas, ...cambiadas, ...idas], 'repaso diario')
  // La foto se guarda solo si IndexNow aceptó (200/202) o no había nada que
  // avisar: fuera de producción no se avisa, y si rechaza (403 mientras valida
  // la clave, 429…) mañana se reintenta lo mismo. Pasó el 16-oct: la primera
  // corrida, a minutos de publicar la clave, dio 403.
  const aceptado = resultado.enviadas === 0 ? !resultado.omitido : resultado.estado === 200 || resultado.estado === 202
  if (!aceptado) return NextResponse.json({ ok: !!resultado.omitido, urls: nHoy, nuevas: nuevas.length, cambiadas: cambiadas.length, idas: idas.length, indexnow: resultado })

  const fichas: Record<string, string> = {}
  for (const u of Object.keys(hoy)) {
    const ruta = u.slice(SITIO.length)
    const id = ruta.match(/^\/propiedades\/(\d+)-/)?.[1]
    if (id) fichas[id] = ruta
  }
  await Promise.all([
    redis.set(CLAVE_FOTO, hoy),
    Object.keys(fichas).length ? redis.hset(CLAVE_FICHAS, fichas) : null,
  ]).catch((e) => console.error('[cron/indexnow] no se pudo guardar la foto', e))

  return NextResponse.json({ ok: true, urls: nHoy, nuevas: nuevas.length, cambiadas: cambiadas.length, idas: idas.length, indexnow: resultado })
}
