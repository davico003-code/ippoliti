// GET /api/ronda/salud — ¿la Ronda sigue convirtiendo los links? (ver src/lib/ronda/salud.ts)
//
// Servidor a servidor: lo llama el vigía diario de Hilo con el secreto que HILO
// y la web ya comparten (HILO_INGEST_SECRET, header x-hilo-ingest-secret), o a
// mano con Bearer CRON_SECRET. Responde siempre 200 con { ok, problemas, sondas, uso }:
// quien avisa es Hilo (mail), porque el WhatsApp de la web por Twilio no llega.

import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { chequearRonda } from '@/lib/ronda/salud'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

function igual(esperado: string | undefined, recibido: string | null): boolean {
  if (!esperado || !recibido) return false
  const a = Buffer.from(esperado)
  const b = Buffer.from(recibido)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function GET(req: Request) {
  const autorizado =
    igual(process.env.HILO_INGEST_SECRET, req.headers.get('x-hilo-ingest-secret')) ||
    igual(process.env.CRON_SECRET ? `Bearer ${process.env.CRON_SECRET}` : undefined, req.headers.get('authorization'))
  if (!autorizado) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })

  try {
    return NextResponse.json(await chequearRonda(), { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (e) {
    return NextResponse.json(
      { ok: false, problemas: [`el chequeo de la Ronda se cortó (${(e as Error).message})`] },
      { headers: { 'Cache-Control': 'private, no-store' } },
    )
  }
}
