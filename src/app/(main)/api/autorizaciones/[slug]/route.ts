// GET /api/autorizaciones/[slug] → detalle (panel agente)
// Auth: header x-team-code (SI_TEAM_CODE).

import { NextResponse } from 'next/server'
import { assertTeamCode } from '@/lib/team-auth'
import { getAutorizacion } from '@/lib/autorizaciones'

export const dynamic = 'force-dynamic'

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const unauth = assertTeamCode(req)
  if (unauth) return unauth

  const slug = params.slug
  if (!slug || !/^[a-z0-9]{10}$/.test(slug)) {
    return NextResponse.json({ error: 'Slug inválido' }, { status: 400 })
  }

  const auth = await getAutorizacion(slug)
  if (!auth) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })

  return NextResponse.json({ ok: true, item: auth })
}
