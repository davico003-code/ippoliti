// GET/POST /api/audio/cron-batch
//
// Cron diario que auto-genera audio narrado para propiedades de venta nuevas.
// Auth dual:
//   - Vercel cron → header Authorization: Bearer ${CRON_SECRET}
//   - Manual desde /admin/audio → header x-team-code (SI_TEAM_CODE)
//
// Returns: { ok: true, ...BatchResult }
//
// GET para que el scheduler de Vercel pueda pegarle (Vercel cron usa GET).
// POST para el botón manual del panel.

import { NextResponse } from 'next/server'
import { processBatch, type BatchTrigger } from '@/lib/audio-batch'

export const dynamic = 'force-dynamic'
// Cap del plan actual de Vercel. El batch es secuencial: si se corta antes
// de terminar, los audios ya generados quedan persistidos en Redis y la
// próxima corrida (al día siguiente) los saltea.
export const maxDuration = 300

type AuthResult =
  | { ok: true; trigger: BatchTrigger }
  | { ok: false; response: NextResponse }

function authorize(req: Request): AuthResult {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.get('authorization') || ''
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return { ok: true, trigger: 'cron' }
  }

  const teamCode = process.env.SI_TEAM_CODE
  const provided = req.headers.get('x-team-code') || ''
  if (teamCode && provided === teamCode) {
    return { ok: true, trigger: 'manual' }
  }

  return {
    ok: false,
    response: NextResponse.json({ error: 'No autorizado' }, { status: 401 }),
  }
}

async function handle(req: Request) {
  const auth = authorize(req)
  if (!auth.ok) return auth.response

  try {
    const result = await processBatch({ trigger: auth.trigger })
    return NextResponse.json({ ok: true, ...result })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error en el batch'
    console.error('[cron-batch] fatal:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function GET(req: Request) {
  return handle(req)
}

export async function POST(req: Request) {
  return handle(req)
}
