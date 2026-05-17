// GET /api/visitas/listar
//   ?status=pendiente|confirmada|realizada|cancelada|all  (default: all)
//   &propiedad_id=NNN
//   &limit=30&offset=0
//
// Auth: header x-team-code (SI_TEAM_CODE).

import { NextResponse } from 'next/server'
import { assertTeamCode } from '@/lib/team-auth'
import { listVisitas, type ListVisitasStatus, type VisitaStatus } from '@/lib/visitas'

export const dynamic = 'force-dynamic'

const STATUSES: VisitaStatus[] = ['pendiente', 'confirmada', 'realizada', 'cancelada']

export async function GET(req: Request) {
  const unauth = assertTeamCode(req)
  if (unauth) return unauth

  const url = new URL(req.url)
  const statusRaw = url.searchParams.get('status') || 'all'
  const status: ListVisitasStatus =
    (STATUSES as readonly string[]).includes(statusRaw)
      ? (statusRaw as VisitaStatus)
      : 'all'

  const propIdRaw = url.searchParams.get('propiedad_id')
  const propiedadId =
    propIdRaw && Number.isFinite(Number(propIdRaw)) ? Number(propIdRaw) : undefined

  const limitRaw = Number(url.searchParams.get('limit'))
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 && limitRaw <= 200 ? limitRaw : 30

  const offsetRaw = Number(url.searchParams.get('offset'))
  const offset = Number.isFinite(offsetRaw) && offsetRaw >= 0 ? offsetRaw : 0

  try {
    const result = await listVisitas({ status, propiedadId, limit, offset })
    return NextResponse.json({ ok: true, ...result })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error listando'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
