// Auth simple por código compartido del equipo SI.
//
// Algunos endpoints internos (generación de audio con ElevenLabs, listados
// admin) requieren el header `x-team-code` con el valor de la env var
// SI_TEAM_CODE. La idea es bloquear consumo de créditos de APIs pagas a
// terceros que descubran el endpoint, sin montar todo un sistema de auth.
//
// En el front, el código se guarda en localStorage tras un input gate
// (key "si_team_access") y se reenvía como header en cada fetch.

import { NextResponse } from 'next/server'

const HEADER = 'x-team-code'

export interface TeamAuthFailure {
  response: NextResponse
}

/**
 * Valida el header x-team-code contra SI_TEAM_CODE.
 * Devuelve `null` si la auth pasa, o un `NextResponse` 401/500 si falla
 * (para que el caller lo `return`-ee directo).
 */
export function assertTeamCode(req: Request): NextResponse | null {
  const expected = process.env.SI_TEAM_CODE
  if (!expected) {
    return NextResponse.json(
      { error: 'SI_TEAM_CODE no configurada en el server' },
      { status: 500 },
    )
  }
  const provided = req.headers.get(HEADER) || ''
  if (provided !== expected) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  return null
}
