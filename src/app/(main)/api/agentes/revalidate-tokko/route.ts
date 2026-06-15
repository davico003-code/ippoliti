// POST /api/agentes/revalidate-tokko
//
// Igual que /api/admin/revalidate-propiedades pero autenticado con la cookie
// del panel de agentes (si_agent_token), para que el botón "Actualizar Tokko"
// del dashboard no tenga que manejar el SI_TEAM_CODE en el cliente.
//
// Devuelve { ok, redisKeysDeleted, tagsRevalidated, pathsRevalidated, errors, timestamp }.

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyAgentToken } from '@/lib/auth'
import { revalidarPropiedades } from '@/lib/tokko-revalidate'

export const dynamic = 'force-dynamic'

export async function POST() {
  const token = cookies().get('si_agent_token')?.value
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agent = await verifyAgentToken(token)
  if (!agent) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const result = await revalidarPropiedades()
  return NextResponse.json(result, { status: result.ok ? 200 : 500 })
}
