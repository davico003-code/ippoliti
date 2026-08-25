// Cron diario de salud de Upstash Redis (9:00 AR).
//
// Contexto: el 25-ago-2026 la base agotó el límite mensual del plan free
// (500K comandos) y TODO lo que depende de Redis falló en silencio durante
// días: link para colega (fichas verficha), selecciones, leads, redirects del
// blog. Nadie se enteró hasta que un colega reportó el botón roto.
//
// Este cron hace un PING barato por día. Si Redis responde, no hace nada.
// Si falla (cuota agotada, credenciales, caída), manda WhatsApp al admin con
// el error y el fix. Detecta la rotura el día 1 en vez de por reporte de un
// usuario.

import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { enviarWhatsAppAdmin } from '@/agents/blog/lib/whatsapp'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const pong = await redis.ping()
    return NextResponse.json({ ok: true, pong, timestamp: new Date().toISOString() })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    const esCuota = /max requests limit exceeded/i.test(msg)

    const alerta = esCuota
      ? `🔴 *Upstash Redis sin cuota* (ippoliti)\n\n` +
        `La base cunning-stork-86667 agotó el límite mensual de comandos. ` +
        `Están caídos: link para colega (verficha), selecciones, leads a Redis, ` +
        `redirects del blog y audio de fichas.\n\n` +
        `Fix: Vercel → Storage → Upstash → upgrade a pay-as-you-go ` +
        `(o esperar al reset del mes).\n\nError: ${msg.slice(0, 200)}`
      : `🔴 *Upstash Redis caído* (ippoliti)\n\nEl PING diario falló: ${msg.slice(0, 300)}`

    try {
      await enviarWhatsAppAdmin(alerta)
    } catch (waErr) {
      console.error('[redis-salud] No se pudo mandar el WhatsApp:', waErr)
    }

    return NextResponse.json(
      { ok: false, error: msg, cuotaAgotada: esCuota, timestamp: new Date().toISOString() },
      { status: 500 },
    )
  }
}
