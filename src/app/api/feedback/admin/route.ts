// GET /api/feedback/admin?propertyId=123
//
// Lectura agregada del feedback de una propiedad. PROTEGIDO con SI_TEAM_CODE
// (header x-team-code) porque expone agregados privados + PII (los leads de
// "avisame si baja"). Inspección manual; el panel visual vive en /agentes.

import { NextResponse } from 'next/server'
import { assertTeamCode } from '@/lib/team-auth'
import { parsePropertyId } from '@/lib/feedback'
import { getPropertyFeedback } from '@/lib/feedback-admin'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: Request) {
  const fail = assertTeamCode(req)
  if (fail) return fail

  const { searchParams } = new URL(req.url)
  const propertyId = parsePropertyId(searchParams.get('propertyId'))
  if (!propertyId) {
    return NextResponse.json({ error: 'invalid_property_id' }, { status: 400 })
  }

  try {
    const agg = await getPropertyFeedback(propertyId)
    return NextResponse.json(agg)
  } catch (e) {
    return NextResponse.json(
      { error: 'redis_error', message: e instanceof Error ? e.message : 'unknown' },
      { status: 500 },
    )
  }
}
