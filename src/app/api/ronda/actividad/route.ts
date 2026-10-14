// POST /api/ronda/actividad  { tipo: 'contacto' | 'ficha', id }
//
// La pantalla avisa cuando un colega le escribe por WhatsApp al que publicó
// ('contacto') o le manda la ficha a un cliente ('ficha'): con eso se arma el
// contador "actividad del mes" (David, 14-oct-2026: "algo que denote actividad
// real en el sistema"). Solo cuenta sobre oportunidades vigentes de OTRA
// inmobiliaria; lo demás se ignora. Responde 204 siempre que el pedido sea sano:
// la pantalla no espera nada.

import { NextResponse } from 'next/server'
import { sinAcceso } from '@/lib/ronda/acceso'
import { rateLimit } from '@/lib/feedback'
import { anotarActividad, publicacionPorId, type TipoActividad } from '@/lib/ronda/almacen'
import { sesionDe } from '@/lib/ronda/sesion'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const TIPOS: TipoActividad[] = ['contacto', 'ficha']

export async function POST(req: Request) {
  const cerrado = await sinAcceso(req)
  if (cerrado) return cerrado

  const sesion = sesionDe(req)
  if (!sesion) return NextResponse.json({ error: 'Primero cargá tus datos para entrar a la ronda.' }, { status: 401 })

  let tipo: unknown
  let id = ''
  try {
    const body = await req.json()
    tipo = body.tipo
    id = String(body.id ?? '')
  } catch {
    return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 })
  }
  if (!TIPOS.includes(tipo as TipoActividad) || !/^[A-Za-z0-9_-]{6,24}$/.test(id)) {
    return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 })
  }

  try {
    if (await rateLimit(sesion.aid, 'ronda-actividad', 120, 3600)) {
      const p = await publicacionPorId(id)
      if (p && p.vence > Date.now() && p.inmobiliaria.id !== sesion.iid) await anotarActividad(tipo as TipoActividad, sesion.aid, id)
    }
  } catch {
    // El contador nunca frena al colega: si Redis no responde, ese toque no suma.
  }
  return new NextResponse(null, { status: 204 })
}
