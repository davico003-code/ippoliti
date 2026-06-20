// GET /api/feedback/admin?propertyId=123
//
// Lectura agregada del feedback de una propiedad. PROTEGIDO con SI_TEAM_CODE
// (header x-team-code) porque expone agregados privados + PII (los leads de
// "avisame si baja"). El panel visual en /agentes es OTRA branch; este handler
// existe sólo para no perder data y poder inspeccionarla manualmente.

import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { assertTeamCode } from '@/lib/team-auth'
import { fbKey, parsePropertyId, REACT_CHOICES, OBJECTION_CHOICES } from '@/lib/feedback'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function toNum(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export async function GET(req: Request) {
  const fail = assertTeamCode(req)
  if (fail) return fail

  const { searchParams } = new URL(req.url)
  const propertyId = parsePropertyId(searchParams.get('propertyId'))
  if (!propertyId) {
    return NextResponse.json({ error: 'invalid_property_id' }, { status: 400 })
  }

  const base = fbKey(propertyId)

  try {
    const [likeCount, reactRaw, valuationVals, objectionRaw, alertsRaw] = await Promise.all([
      redis.scard(`${base}:like`),
      Promise.all(REACT_CHOICES.map((c) => redis.get<number>(`${base}:react:${c}`))),
      redis.hvals(`${base}:valuation`),
      Promise.all(OBJECTION_CHOICES.map((c) => redis.get<number>(`${base}:objection:${c}`))),
      redis.lrange(`${base}:alert`, 0, -1),
    ])

    const react: Record<string, number> = {}
    REACT_CHOICES.forEach((c, i) => (react[c] = toNum(reactRaw[i])))

    const objection: Record<string, number> = {}
    OBJECTION_CHOICES.forEach((c, i) => (objection[c] = toNum(objectionRaw[i])))

    const values = ((valuationVals ?? []) as unknown[]).map(toNum).filter((n: number) => n > 0)
    const valuation = {
      count: values.length,
      avg: values.length ? Math.round(values.reduce((a: number, b: number) => a + b, 0) / values.length) : null,
      min: values.length ? Math.min(...values) : null,
      max: values.length ? Math.max(...values) : null,
    }

    const alerts = (alertsRaw ?? []).map((raw) => {
      try {
        return typeof raw === 'string' ? JSON.parse(raw) : raw
      } catch {
        return null
      }
    })

    return NextResponse.json({
      propertyId,
      likes: toNum(likeCount),
      react,
      valuation,
      objection,
      alerts,
    })
  } catch (e) {
    return NextResponse.json(
      { error: 'redis_error', message: e instanceof Error ? e.message : 'unknown' },
      { status: 500 },
    )
  }
}
