// POST /api/feedback/archivar
//
// Snapshot del feedback agregado (Redis) → Neon Postgres, una fila por
// propiedad en `property_feedback`. Redis sigue siendo la captura en vivo;
// Neon es el archivo durable que después se interpreta inteligentemente.
//
// Body: { propertyId?: string }  → si viene, archiva solo esa; si no, todas.
// Auth: token de agente con role admin (cookie si_agent_token). Guarda PII
// (leads) → SOLO admin.

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyAgentToken } from '@/lib/auth'
import { parsePropertyId } from '@/lib/feedback'
import { buildPanelRow, getFeedbackPanelRows, type PanelRow } from '@/lib/feedback-admin'
import { getSql, ensurePropertyFeedbackTable } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function requireAdmin(): Promise<boolean> {
  const token = cookies().get('si_agent_token')?.value
  if (!token) return false
  const agent = await verifyAgentToken(token)
  return !!agent && agent.role === 'admin'
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'no_autorizado' }, { status: 401 })
  }

  let body: { propertyId?: unknown } = {}
  try {
    body = await req.json()
  } catch {
    /* body opcional */
  }

  // Filas a archivar
  let rows: PanelRow[]
  try {
    const single = parsePropertyId(body.propertyId)
    if (single) {
      const row = await buildPanelRow(single)
      rows = row ? [row] : []
    } else {
      rows = await getFeedbackPanelRows(1000)
    }
  } catch (e) {
    return NextResponse.json(
      { error: 'aggregate_error', message: e instanceof Error ? e.message : 'unknown' },
      { status: 500 },
    )
  }

  if (rows.length === 0) {
    return NextResponse.json({ ok: true, archived: 0 })
  }

  // Upsert a Neon
  try {
    const sql = getSql()
    await ensurePropertyFeedbackTable()
    for (const row of rows) {
      await sql`
        INSERT INTO property_feedback
          (property_id, address, price_label, published_price, likes, react, valuation, objection, leads, total, updated_at)
        VALUES
          (${row.propertyId}, ${row.address}, ${row.priceLabel}, ${row.publishedPrice},
           ${row.likes}, ${JSON.stringify(row.react)}::jsonb, ${JSON.stringify(row.valuation)}::jsonb,
           ${JSON.stringify(row.objection)}::jsonb, ${JSON.stringify(row.alerts)}::jsonb, ${row.total}, now())
        ON CONFLICT (property_id) DO UPDATE SET
          address = EXCLUDED.address,
          price_label = EXCLUDED.price_label,
          published_price = EXCLUDED.published_price,
          likes = EXCLUDED.likes,
          react = EXCLUDED.react,
          valuation = EXCLUDED.valuation,
          objection = EXCLUDED.objection,
          leads = EXCLUDED.leads,
          total = EXCLUDED.total,
          updated_at = now()
      `
    }
  } catch (e) {
    return NextResponse.json(
      { error: 'db_error', message: e instanceof Error ? e.message : 'unknown' },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true, archived: rows.length })
}
