// GET /api/admin/audio/cron-status
//
// Devuelve estado del cron de audio (enabled, maxPerDay, lastRun, charsMes)
// para hidratar la card del panel /admin/audio sin disparar el batch.
// Auth: header x-team-code (SI_TEAM_CODE).

import { NextResponse } from 'next/server'
import { getCronStatus } from '@/lib/audio-batch'
import { assertTeamCode } from '@/lib/team-auth'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const unauth = assertTeamCode(req)
  if (unauth) return unauth

  try {
    const status = await getCronStatus()
    return NextResponse.json({ ok: true, ...status })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error obteniendo estado'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
