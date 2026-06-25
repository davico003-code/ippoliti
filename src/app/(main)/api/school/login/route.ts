// Valida el acceso a SI School contra el env (SCHOOL_PASSWORD o, por
// compatibilidad, SI_TEAM_CODE). El password ya no vive en el bundle del
// cliente: se tipea, se manda acá y el server compara. Devuelve {ok} o 401.

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const PASSWORD = process.env.SCHOOL_PASSWORD || process.env.SI_TEAM_CODE || ''

export async function POST(req: Request) {
  try {
    const { password } = await req.json().catch(() => ({ password: '' }))
    if (!PASSWORD || password !== PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
