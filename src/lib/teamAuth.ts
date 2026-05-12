// Team-code guard for verficha.casa admin endpoints.
// Cualquier route handler que toque colegas o fichas (excepto el GET público
// /api/ficha/[slug]) debe llamar requireTeamCode(req) al entrar.

import { NextResponse } from 'next/server'

export const TEAM_CODE_HEADER = 'x-team-code'

function getExpectedCode(): string {
  return process.env.SI_TEAM_CODE || 'si2026'
}

export function verifyTeamCode(req: Request): boolean {
  const provided = req.headers.get(TEAM_CODE_HEADER)
  if (!provided) return false
  return provided === getExpectedCode()
}

// Helper para usar al inicio de un route handler.
// Devuelve un NextResponse de 401 si el header no matchea, o null si todo OK.
//
//   const block = requireTeamCode(req); if (block) return block
//
export function requireTeamCode(req: Request): NextResponse | null {
  if (verifyTeamCode(req)) return null
  return NextResponse.json({ error: 'Código de equipo inválido' }, { status: 401 })
}
