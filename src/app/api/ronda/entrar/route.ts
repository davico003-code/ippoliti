// POST /api/ronda/entrar  { clave }
//
// La puerta de la Ronda: con la clave de acceso correcta devuelve el pase que
// después acompaña cada pedido (encabezado x-ronda-acceso). Tope de intentos
// por conexión para que nadie la adivine probando.

import { NextResponse } from 'next/server'
import { rateLimit } from '@/lib/feedback'
import { pasePara } from '@/lib/ronda/acceso'
import { ipDe } from '@/lib/ronda/sesion'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const responder = (cuerpo: Record<string, unknown>, status: number) =>
  NextResponse.json(cuerpo, { status, headers: { 'Cache-Control': 'private, no-store' } })

export async function POST(req: Request) {
  let clave: unknown
  try {
    clave = (await req.json()).clave
  } catch {
    return responder({ error: 'Datos inválidos.' }, 400)
  }
  if (!(await rateLimit(ipDe(req), 'ronda-clave', 8, 600))) {
    return responder({ error: 'Demasiados intentos. Probá de nuevo en unos minutos.' }, 429)
  }
  try {
    const { pase, sinClave } = await pasePara(clave)
    if (sinClave) return responder({ error: 'La ronda todavía no está abierta.' }, 503)
    if (!pase) return responder({ error: 'Esa no es la clave. Revisala y probá de nuevo.' }, 401)
    return responder({ acceso: pase }, 200)
  } catch {
    return responder({ error: 'No se pudo comprobar la clave. Probá de nuevo.' }, 503)
  }
}
