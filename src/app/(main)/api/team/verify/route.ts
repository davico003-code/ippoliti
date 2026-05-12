// POST /api/team/verify → valida que el header X-Team-Code matchea SI_TEAM_CODE.
// Lo usa CompartirFichaModal en su Estado 0 (input del código de equipo)
// para confirmar antes de persistir en localStorage. Sin side effects.

import { NextResponse } from 'next/server'
import { requireTeamCode } from '@/lib/teamAuth'

export async function POST(req: Request) {
  const block = requireTeamCode(req)
  if (block) return block
  return NextResponse.json({ ok: true })
}
