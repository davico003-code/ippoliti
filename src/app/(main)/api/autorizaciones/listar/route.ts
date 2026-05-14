// GET /api/autorizaciones/listar?status=pendiente|firmada|all&limit=20&offset=0
// Auth: header x-team-code (SI_TEAM_CODE).

import { NextResponse } from 'next/server'
import { assertTeamCode } from '@/lib/team-auth'
import { listAutorizaciones } from '@/lib/autorizaciones'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const unauth = assertTeamCode(req)
  if (unauth) return unauth

  const url = new URL(req.url)
  const statusRaw = url.searchParams.get('status') || 'all'
  const status: 'pendiente' | 'firmada' | 'all' =
    statusRaw === 'pendiente' || statusRaw === 'firmada' ? statusRaw : 'all'

  const limitRaw = Number(url.searchParams.get('limit'))
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 && limitRaw <= 100 ? limitRaw : 20
  const offsetRaw = Number(url.searchParams.get('offset'))
  const offset = Number.isFinite(offsetRaw) && offsetRaw >= 0 ? offsetRaw : 0

  try {
    const result = await listAutorizaciones({ status, limit, offset })
    return NextResponse.json({ ok: true, ...result })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error listando'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
