// GET /api/ronda/inmobiliarias
//
// La lista que se autocompleta cuando un colega entra a la Ronda y empieza a
// escribir el nombre de su inmobiliaria. Pública: hace falta antes de tener pase.

import { NextResponse } from 'next/server'
import { listarInmobiliarias } from '@/lib/ronda/almacen'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const lista = await listarInmobiliarias()
    return NextResponse.json(
      { inmobiliarias: lista.map(({ id, nombre, matriculado, matricula }) => ({ id, nombre, matriculado, matricula })) },
      { headers: { 'Cache-Control': 'public, s-maxage=20, stale-while-revalidate=60' } },
    )
  } catch {
    return NextResponse.json({ error: 'No se pudo cargar la lista de inmobiliarias.' }, { status: 503 })
  }
}
