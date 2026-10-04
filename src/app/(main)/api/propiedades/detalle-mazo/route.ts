import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/feedback'

// GET /api/propiedades/detalle-mazo?id=n:123|propia:455077|meli:MLA… — el "Ver
// detalles" de una tarjeta del Tinder (David, 4-oct-2026): ubicación y
// características de un vistazo, sin salir del mazo. Lo arma HILO con el mismo
// formato que la ficha neutra; acá se cachea en el CDN (es igual para todos).

const ID = /^(?:n:[1-9]\d{0,11}|propia:[1-9]\d{0,9}|meli:MLA\d{6,14})$/

export async function GET(request: NextRequest) {
  const id = (request.nextUrl.searchParams.get('id') ?? '').trim()
  if (!ID.test(id)) return NextResponse.json({ error: 'id inválido' }, { status: 400 })
  const secret = process.env.HILO_INGEST_SECRET
  if (!secret) return NextResponse.json({ error: 'sin_detalle' }, { status: 503 })
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!(await rateLimit(ip, 'detalle-mazo', 60, 60))) {
    return NextResponse.json({ error: 'Demasiados pedidos seguidos' }, { status: 429, headers: { 'Cache-Control': 'no-store' } })
  }
  const base = process.env.HILO_LEADS_URL || 'https://meethilo.com'
  try {
    const res = await fetch(`${base}/api/public/en-red/detalle?id=${encodeURIComponent(id)}`, {
      headers: { 'x-hilo-ingest-secret': secret },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    })
    if (res.status === 404) return NextResponse.json({ error: 'no_disponible' }, { status: 404, headers: { 'Cache-Control': 'public, s-maxage=300' } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return NextResponse.json(await res.json(), {
      headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400' },
    })
  } catch (e) {
    console.warn('[detalle-mazo]', e instanceof Error ? e.message : e)
    return NextResponse.json({ error: 'sin_detalle' }, { status: 502, headers: { 'Cache-Control': 'no-store' } })
  }
}
