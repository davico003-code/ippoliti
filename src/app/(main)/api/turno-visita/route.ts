// POST /api/turno-visita — turno de visita elegido en la hoja del WhatsApp con
// datos (17-oct-2026, el "segundo filtro"): después de dejar nombre + celular y
// abrirse WhatsApp, la persona eligió día + franja. Se reenvía a Hilo
// (/api/public/visita-turno, server-to-server con el secreto), que agenda la
// visita al agente de ESA conversación. La conversación se identifica con el
// id que devolvió /api/leads más el celular que dejó: sin los dos no sirve.
//
// Público (lo dispara el cliente final), con el mismo rate-limit que agendar-visita.

import { NextRequest, NextResponse } from 'next/server'
import { pedirTurnoAHilo } from '@/lib/hilo-leads'
import { rateLimit } from '@/lib/feedback'

export const dynamic = 'force-dynamic'

const RE_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const RE_FECHA = /^\d{4}-\d{2}-\d{2}$/
const RE_FRANJA = /^[a-z]{1,20}$/
const SIN_TURNO = 'No pudimos pedir el turno. Coordinalo por WhatsApp.'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!(await rateLimit(ip, 'visita', 6, 60))) {
    return NextResponse.json({ error: 'Demasiados envíos seguidos. Esperá un momento y reintentá.' }, { status: 429 })
  }

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }
  const str = (v: unknown) => (typeof v === 'string' ? v.trim().slice(0, 64) : '')
  const conversationId = str(body.conversationId)
  const phone = str(body.whatsapp || body.phone).replace(/\D/g, '')
  const fecha = str(body.fecha)
  const franja = str(body.franja)
  if (!RE_UUID.test(conversationId) || phone.length < 10 || !RE_FECHA.test(fecha) || !RE_FRANJA.test(franja)) {
    return NextResponse.json({ error: 'Elegí un día y una franja.' }, { status: 400 })
  }

  const r = await pedirTurnoAHilo({ conversationId, phone, fecha, franja })
  if (r.ok) return NextResponse.json({ ok: true })
  // 400 (turno que ya no está) y 404 (consulta que no es suya) vienen escritos
  // desde Hilo para la persona; el resto es un problema nuestro.
  if (r.status === 400 || r.status === 404) return NextResponse.json({ error: r.error ?? SIN_TURNO }, { status: r.status })
  return NextResponse.json({ error: SIN_TURNO }, { status: 502 })
}
