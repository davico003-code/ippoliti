// Ingest del Stock de Colegas (costura Cowork → Hilo).
//
//   POST → el motor (vía navegador de David, mismo origen) manda stock.json
//          completo; se reemplaza el feed en Redis y se responde el diff.
//   GET  → salud/última sincronización (para el panel y para el diario).
//
// Auth (cualquiera de las tres, en este orden):
//   1. Authorization: Bearer <FEEDS_SYNC_SECRET>   (contrato original del motor)
//   2. x-team-code: <SI_TEAM_CODE>                 (patrón interno existente;
//      el navegador lo tiene en localStorage "si_team_access")
//   3. cookie si_agent_token con rol admin          (envío same-origin logueado)
//
// El feed llega YA deduplicado y verificado por el motor — acá no se re-filtra.

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyAgentToken } from '@/lib/auth'
import { getStockMeta, ingestStockFeed, validarStockFeed } from '@/lib/stock-colegas'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

async function syncAutorizado(req: Request): Promise<boolean> {
  const auth = req.headers.get('authorization') || ''
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
  const secret = process.env.FEEDS_SYNC_SECRET
  if (secret && bearer && bearer === secret) return true

  const team = process.env.SI_TEAM_CODE
  if (team && (req.headers.get('x-team-code') || '') === team) return true

  const token = cookies().get('si_agent_token')?.value
  if (token) {
    const agent = await verifyAgentToken(token)
    if (agent?.role === 'admin') return true
  }
  return false
}

export async function POST(req: Request) {
  if (!(await syncAutorizado(req))) {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 })
  }
  const body = await req.json().catch(() => null)
  if (!validarStockFeed(body)) {
    return NextResponse.json(
      { ok: false, error: 'Feed inválido: se espera stock.json con {generado, propiedades[...]} no vacío' },
      { status: 400 },
    )
  }
  const meta = await ingestStockFeed(body, 'sync')
  return NextResponse.json({
    ok: true,
    insertadas: meta.insertadas,
    actualizadas: meta.actualizadas,
    cerradas: meta.cerradas,
    total_propiedades: meta.total_propiedades,
    generado: meta.generado,
  })
}

export async function GET(req: Request) {
  if (!(await syncAutorizado(req))) {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 })
  }
  const meta = await getStockMeta()
  return NextResponse.json({ ok: true, meta })
}
