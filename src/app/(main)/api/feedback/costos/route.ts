import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

// Feedback de caritas de la calculadora de costos de construcción.
// Contadores en Redis: feedback:costos:{up|mid|down} (el total se calcula
// sumando los tres al leer). Cambio de voto: DECR del anterior (piso 0)
// + INCR del nuevo. Sin rate limit dedicado: el localStorage del cliente
// es la barrera principal (no hay patrón de rate limit en el repo).

const VOTOS = ['up', 'mid', 'down'] as const
type Voto = (typeof VOTOS)[number]

const esVoto = (v: unknown): v is Voto => typeof v === 'string' && VOTOS.includes(v as Voto)

const key = (voto: Voto) => `feedback:costos:${voto}`

export async function POST(req: Request) {
  let body: { voto?: unknown; votoAnterior?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { voto, votoAnterior } = body ?? {}
  if (!esVoto(voto)) {
    return NextResponse.json({ error: 'voto inválido' }, { status: 400 })
  }
  if (votoAnterior !== undefined && !esVoto(votoAnterior)) {
    return NextResponse.json({ error: 'votoAnterior inválido' }, { status: 400 })
  }

  // Mismo voto que antes: no-op (no inflar contadores)
  if (votoAnterior === voto) {
    return NextResponse.json({ ok: true })
  }

  try {
    await redis.incr(key(voto))
    if (votoAnterior && esVoto(votoAnterior)) {
      const restante = await redis.decr(key(votoAnterior))
      if (restante < 0) {
        // Piso en 0: nunca dejar contadores negativos
        await redis.set(key(votoAnterior), 0)
      }
    }
  } catch {
    // Redis caído no debe romperle nada al visitante
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: true })
}
