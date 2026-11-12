// GET /api/ronda/inmobiliarias
//
// La lista que se autocompleta cuando un colega entra a la Ronda y empieza a
// escribir el nombre de su inmobiliaria. Pide la clave de acceso de la Ronda.

import { NextResponse } from 'next/server'
import { sinAcceso } from '@/lib/ronda/acceso'
import { listarInmobiliarias } from '@/lib/ronda/almacen'
import { inmobiliariaDeSala, salaDe } from '@/lib/ronda/sala'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: Request) {
  const cerrado = await sinAcceso(req)
  if (cerrado) return cerrado

  try {
    // En una sala, solo las suyas.
    const sala = salaDe(req)
    const lista = (await listarInmobiliarias()).filter((i) => inmobiliariaDeSala(sala, i.nombre))
    return NextResponse.json(
      { inmobiliarias: lista.map(({ id, nombre, matriculado, matricula }) => ({ id, nombre, matriculado, matricula })) },
      { headers: { 'Cache-Control': 'private, no-store' } },
    )
  } catch {
    return NextResponse.json({ error: 'No se pudo cargar la lista de inmobiliarias.' }, { status: 503 })
  }
}
