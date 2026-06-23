// Importa una propiedad externa (Zonaprop) y la convierte en una ficha PROPIA de
// verficha.casa. Flujo automático: el agente pega la URL → acá scrapeamos vía
// Microlink (que pasa el Cloudflare de Zonaprop), re-hosteamos las fotos en
// Vercel Blob y minteamos la ficha. Devuelve el link verficha listo.
//
// Acepta overrides manuales opcionales (titulo, precioRaw, etc.) para corregir o
// para el fallback cuando el scraping no alcanza.
//
// Seguridad: SOLO agentes autenticados (cookie si_agent_token). Las fotos se
// validan (content-type image/*, tamaño máximo) antes de subirlas.

import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { verifyAgentToken } from '@/lib/auth'
import { crearFichaExterna, type FichaExternaInput } from '@/lib/ficha'
import { fetchZonaprop, isZonapropUrl } from '@/lib/zonaprop'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // el scraping vía Microlink puede tardar ~30s

const MAX_FOTOS = 16
const MAX_BYTES = 6 * 1024 * 1024 // 6MB por foto

function toNum(v: unknown): number | null {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(/[^\d.]/g, ''))
  return Number.isFinite(n) && n > 0 ? n : null
}

async function rehostFoto(url: string, idx: number): Promise<string | null> {
  if (!/^https?:\/\//i.test(url)) return null
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(12000),
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'image/*' },
    })
    if (!res.ok) return null
    const ct = res.headers.get('content-type') || ''
    if (!ct.startsWith('image/')) return null
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.byteLength === 0 || buf.byteLength > MAX_BYTES) return null
    const ext = (ct.split('/')[1] || 'jpg').split(';')[0].replace(/[^a-z0-9]/gi, '') || 'jpg'
    const blob = await put(`fichas-externas/${Date.now()}-${idx}.${ext}`, buf, {
      access: 'public',
      contentType: ct,
    })
    return blob.url
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  // ── Auth ──
  const token = req.cookies.get('si_agent_token')?.value
  const agent = token ? await verifyAgentToken(token) : null
  if (!agent) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const sourceUrl = String(body.url ?? body.sourceUrl ?? '').trim()
  if (!/^https?:\/\//i.test(sourceUrl)) {
    return NextResponse.json({ error: 'Pegá una URL válida' }, { status: 400 })
  }

  // ── Scraping automático (Zonaprop) ──
  const scraped = isZonapropUrl(sourceUrl) ? await fetchZonaprop(sourceUrl) : null

  // Overrides manuales (corrección o fallback). Solo pisan si vienen presentes.
  const ov = (body.manual ?? {}) as Record<string, unknown>
  const has = (k: string) => ov[k] !== undefined && ov[k] !== ''
  const pick = (k: string, fb: string) =>
    has(k) ? String(ov[k]).trim() : (scraped?.[k as keyof typeof scraped] as string) ?? fb
  const pickNum = (k: string) =>
    has(k) ? toNum(ov[k]) : ((scraped?.[k as keyof typeof scraped] as number | null) ?? null)

  const titulo = pick('titulo', '').slice(0, 200)
  if (!titulo && !scraped) {
    return NextResponse.json(
      { error: 'No se pudo leer el aviso (Zonaprop puede estar lento o bloqueando). Reintentá o cargá los datos a mano.' },
      { status: 422 },
    )
  }
  if (!titulo) {
    return NextResponse.json({ error: 'El aviso no tiene título legible; cargalo a mano.' }, { status: 422 })
  }

  // Fotos: del scraping + adicionales manuales. Cap + re-host a Blob.
  const fotosManual = Array.isArray(ov.fotos) ? (ov.fotos as unknown[]).map(String) : []
  const candidatas = [...(scraped?.fotos ?? []), ...fotosManual]
    .filter(u => /^https?:\/\//i.test(u))
    .slice(0, MAX_FOTOS)
  const rehosted = (await Promise.all(candidatas.map((u, i) => rehostFoto(u, i)))).filter(
    (u): u is string => !!u,
  )

  const manual: FichaExternaInput = {
    titulo,
    descripcion: pick('descripcion', '').slice(0, 5000),
    fotos: rehosted,
    operacion: pick('operacion', 'Venta').slice(0, 40),
    tipo: pick('tipo', 'Propiedad').slice(0, 60),
    precioRaw: pickNum('precioRaw') ?? 0,
    moneda: pick('moneda', 'USD').slice(0, 8),
    zona: pick('zona', '').slice(0, 120),
    m2cubiertos: pickNum('m2cubiertos'),
    m2terreno: pickNum('m2terreno'),
    ambientes: pickNum('ambientes'),
    dormitorios: pickNum('dormitorios'),
    banos: pickNum('banos'),
    cocheras: pickNum('cocheras'),
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'

  try {
    const { slug, url, snapshot } = await crearFichaExterna({
      manual,
      sourceUrl,
      ip,
      userAgent: req.headers.get('user-agent') || 'unknown',
    })

    const card = {
      title: snapshot.tituloGenerico,
      image: snapshot.fotos[0] || null,
      location: snapshot.zonaAprox,
      price: snapshot.precio && snapshot.precio !== 'Consultar' ? snapshot.precio : null,
      rooms: snapshot.dormitorios || 0,
      baths: snapshot.banos || 0,
      area: snapshot.m2cubiertos || snapshot.m2terreno || 0,
    }

    return NextResponse.json({ slug, url, snapshot: card, fotos: snapshot.fotos.length })
  } catch {
    return NextResponse.json({ error: 'No se pudo crear la ficha' }, { status: 500 })
  }
}
