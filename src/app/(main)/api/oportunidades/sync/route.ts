// Ingest del feed de OPORTUNIDADES (frutillas curadas) del motor de Cowork.
//
// Contrato (ENVIAR_A_HILO.md del motor): POST con oportunidades.json completo,
// respuesta {"ok":true,"insertadas","actualizadas","cerradas","precios_registrados"}.
// El feed se guarda entero en Redis (oportunidades:feed) y alimenta el panel
// /agentes/stock (las frutillas traen foto; el stock ancho no).
//
// OJO: esto es DISTINTO del popup público de oportunidades (oportunidades:items,
// /api/oportunidades) que se cura a mano desde /agentes/oportunidades.
//
// Auth: misma tríada que /api/stock/sync (Bearer FEEDS_SYNC_SECRET,
// x-team-code, o cookie de agente admin).

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyAgentToken } from '@/lib/auth'
import { ingestOppFeed, validarOppFeed } from '@/lib/stock-colegas'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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
  if (!validarOppFeed(body)) {
    return NextResponse.json(
      { ok: false, error: 'Feed inválido: se espera oportunidades.json con {generado, oportunidades[]}' },
      { status: 400 },
    )
  }
  const r = await ingestOppFeed(body)
  return NextResponse.json({ ok: true, ...r })
}
