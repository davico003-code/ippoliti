// Cron diario de salud de Upstash Redis (9:00 AR).
//
// Contexto: el 25-ago-2026 la base agotó el límite mensual del plan free
// (500K comandos) y TODO lo que depende de Redis falló en silencio durante
// días: link para colega (fichas verficha), selecciones, leads, redirects del
// blog. Nadie se enteró hasta que un colega reportó el botón roto.
//
// Este cron hace un PING barato por día y deja el "todo bien" para el vigía de
// Hilo (lib/vigia.ts). Si Redis falla (cuota agotada, credenciales, caída) no
// puede dejar nada: el vigía nota que falta el reporte y avisa por mail con el
// fix (Vercel → Storage → Upstash). Detecta la rotura el día 1 en vez de por
// reporte de un usuario.

import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { reportarAlVigia } from '@/lib/vigia'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const pong = await redis.ping()
    await reportarAlVigia('redis', [])
    return NextResponse.json({ ok: true, pong, timestamp: new Date().toISOString() })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    const esCuota = /max requests limit exceeded/i.test(msg)
    // Sin Redis no hay dónde dejar el aviso: lo da el vigía de Hilo por ausencia.
    console.error(`[redis-salud] ${esCuota ? 'Upstash sin cuota' : 'Upstash caído'}:`, msg)

    return NextResponse.json(
      { ok: false, error: msg, cuotaAgotada: esCuota, timestamp: new Date().toISOString() },
      { status: 500 },
    )
  }
}
