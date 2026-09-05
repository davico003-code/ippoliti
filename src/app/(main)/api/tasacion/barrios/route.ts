import { NextResponse } from 'next/server'
import { obtenerBarrios } from '@/lib/tasacion/hilo'

// Proxy a Hilo GET /api/public/tasacion/barrios. Cache de 1 h (revalidate del
// fetch interno + del route). En mock devuelve fixtures.
export const revalidate = 3600

export async function GET() {
  const barrios = await obtenerBarrios()
  return NextResponse.json(
    { barrios },
    { headers: { 'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400' } },
  )
}
