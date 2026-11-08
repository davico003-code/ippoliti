import { NextResponse } from 'next/server'
import { cuentaDeBarrio } from '@/lib/cuenta-lote/hilo'

// "La cuenta del lote" de un barrio, para el panel de la ficha en la compu
// (PropertyPanel arma la ficha del lado del cliente y no recibe lo que la
// página ya leyó de Hilo). Mismos números que la ficha del celu: el barrio del
// piloto, leído de Hilo con una hora de cache; una hora más en el CDN.

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get('barrio') ?? ''
  if (!/^[a-z0-9-]{2,60}$/.test(slug)) return NextResponse.json({ error: 'barrio' }, { status: 400 })
  const cuenta = await cuentaDeBarrio(slug)
  if (!cuenta) return NextResponse.json({ error: 'sin_datos' }, { status: 404, headers: { 'Cache-Control': 'public, s-maxage=600' } })
  return NextResponse.json(cuenta, { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } })
}
