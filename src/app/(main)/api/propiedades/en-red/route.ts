import { NextRequest, NextResponse } from 'next/server'
import type { FeedEnRed } from '@/lib/feed-en-red'

// Propiedades de otras inmobiliarias de la zona ("En red") para el feed de la
// ficha. Las elige Hilo (fichas armadas de Red Propia y MELI: mismo barrio,
// precio parecido, las más vistas primero) y acá solo se cachean en el CDN.
// Server-to-server con el secreto de Hilo: el navegador nunca lo ve.

const VACIO: FeedEnRed = { barrio: null, tarjetas: [] }

export async function GET(request: NextRequest) {
  const id = Number(request.nextUrl.searchParams.get('id'))
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const secret = process.env.HILO_INGEST_SECRET
  if (!secret) return NextResponse.json(VACIO)
  const base = process.env.HILO_LEADS_URL || 'https://meethilo.com'
  try {
    const res = await fetch(`${base}/api/public/en-red?id=${id}`, {
      headers: { 'x-hilo-ingest-secret': secret },
      cache: 'no-store',
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = (await res.json()) as FeedEnRed
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=86400' },
    })
  } catch (e) {
    console.warn('[en-red]', e instanceof Error ? e.message : e)
    // Sin "En red" la ficha sigue igual: el bloque simplemente no aparece.
    return NextResponse.json(VACIO, { headers: { 'Cache-Control': 'public, s-maxage=60' } })
  }
}
