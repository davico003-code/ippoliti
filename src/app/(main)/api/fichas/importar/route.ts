// Importa una propiedad externa (Zonaprop / colega) y la convierte en una ficha
// PROPIA de verficha.casa. Flujo: el agente carga los datos a mano (con prefill
// de Microlink) → acá re-hosteamos las fotos en Vercel Blob y minteamos la ficha.
//
// Seguridad: SOLO agentes autenticados (cookie si_agent_token). Las fotos se
// validan (content-type image/*, tamaño máximo) antes de subirlas.

import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { verifyAgentToken } from '@/lib/auth'
import { crearFichaExterna, type FichaExternaInput } from '@/lib/ficha'

export const dynamic = 'force-dynamic'

const MAX_FOTOS = 12
const MAX_BYTES = 5 * 1024 * 1024 // 5MB por foto

function toNum(v: unknown): number | null {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''))
  return Number.isFinite(n) && n > 0 ? n : null
}

// Descarga una imagen y la re-hostea en Vercel Blob (store público). Devuelve la
// URL del blob, o null si falla / no es imagen / pesa de más.
async function rehostFoto(url: string, idx: number): Promise<string | null> {
  if (!/^https?:\/\//i.test(url)) return null
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
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

  const titulo = String(body.titulo ?? '').trim().slice(0, 200)
  if (!titulo) {
    return NextResponse.json({ error: 'El título es obligatorio' }, { status: 400 })
  }

  // Fotos candidatas: principal + adicionales. Capeamos cantidad y re-hosteamos.
  const fotosRaw = Array.isArray(body.fotos)
    ? (body.fotos as unknown[]).map(String).filter(Boolean)
    : []
  const candidatas = fotosRaw.slice(0, MAX_FOTOS)
  const rehosted = (await Promise.all(candidatas.map((u, i) => rehostFoto(u, i)))).filter(
    (u): u is string => !!u,
  )

  const manual: FichaExternaInput = {
    titulo,
    descripcion: String(body.descripcion ?? '').trim().slice(0, 5000),
    fotos: rehosted,
    operacion: String(body.operacion ?? 'Venta').trim().slice(0, 40),
    tipo: String(body.tipo ?? 'Propiedad').trim().slice(0, 60),
    precioRaw: toNum(body.precioRaw) ?? 0,
    moneda: String(body.moneda ?? 'USD').trim().slice(0, 8),
    zona: String(body.zona ?? '').trim().slice(0, 120),
    m2cubiertos: toNum(body.m2cubiertos),
    m2terreno: toNum(body.m2terreno),
    ambientes: toNum(body.ambientes),
    dormitorios: toNum(body.dormitorios),
    banos: toNum(body.banos),
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'

  try {
    const { slug, url, snapshot } = await crearFichaExterna({
      manual,
      sourceUrl: String(body.sourceUrl ?? '').trim().slice(0, 500),
      ip,
      userAgent: req.headers.get('user-agent') || 'unknown',
    })

    // Snapshot reducido para la tarjeta del seguimiento (ClientShortlist).
    const card = {
      title: snapshot.tituloGenerico,
      image: snapshot.fotos[0] || null,
      location: snapshot.zonaAprox,
      price: snapshot.precio && snapshot.precio !== 'Consultar' ? snapshot.precio : null,
      rooms: snapshot.dormitorios || 0,
      baths: snapshot.banos || 0,
      area: snapshot.m2cubiertos || snapshot.m2terreno || 0,
    }

    return NextResponse.json({ slug, url, snapshot: card })
  } catch {
    return NextResponse.json({ error: 'No se pudo crear la ficha' }, { status: 500 })
  }
}
