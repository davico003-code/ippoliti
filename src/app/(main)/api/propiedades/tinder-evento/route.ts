import { NextResponse } from 'next/server'
import { rateLimit } from '@/lib/feedback'
import { EVENTOS_TINDER, type EventoTinder } from '@/lib/tinder-contador'
import { EVENTOS_WCD } from '@/lib/whatsapp-con-datos'
import { sumarEventoDelDia } from '@/lib/contador-dia'

// POST /api/propiedades/tinder-evento { evento, origen, v } — suma un paso del
// Tinder en el Redis compartido (lo lee Hilo en Resultados → Tinder web). Las
// claves están en lib/contador-dia.ts.
//
// { contador: 'wcd', evento: 'toque' | 'datos', origen: 'ficha', v } (16-oct-2026):
// la prueba del WhatsApp con datos de la ficha ("de cada 100 que tocan el botón
// viniendo de la pauta, cuántos dejan sus datos"), con prefijo propio.

// TINDER_PREFIJO / WCD_PREFIJO solo para pruebas locales (no ensuciar el contador real).
const PREFIJO = process.env.TINDER_PREFIJO || 'tinder'
const PREFIJO_WCD = process.env.WCD_PREFIJO || 'wcd'
const BOT = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|preview|headless|lighthouse/i

export async function POST(req: Request) {
  if (BOT.test(req.headers.get('user-agent') ?? '')) return new NextResponse(null, { status: 204 })
  const body = (await req.json().catch(() => null)) as { contador?: unknown; evento?: unknown; origen?: unknown; v?: unknown } | null
  const esWcd = body?.contador === 'wcd'
  const evento = esWcd
    ? EVENTOS_WCD.find((e) => e === body?.evento)
    : (EVENTOS_TINDER.find((e) => e === body?.evento) as EventoTinder | undefined)
  // 'pauta' (anuncio) y 'cliente' (link del asesor) desde el 5-oct: Hilo los muestra aparte.
  const origen = (esWcd ? ['ficha'] : ['ficha', 'home', 'pauta', 'cliente']).find((o) => o === body?.origen) ?? null
  const v = typeof body?.v === 'string' && /^[A-Za-z0-9-]{4,64}$/.test(body.v) ? body.v : null
  if (!evento || !origen || !v) return NextResponse.json({ error: 'evento inválido' }, { status: 400 })
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!(await rateLimit(ip, 'tinder-evento', 120, 60))) return new NextResponse(null, { status: 204 })
  try {
    await sumarEventoDelDia(esWcd ? PREFIJO_WCD : PREFIJO, evento, origen, v)
  } catch (e) {
    console.warn('[tinder-evento]', e instanceof Error ? e.message : e)
  }
  return new NextResponse(null, { status: 204 })
}
