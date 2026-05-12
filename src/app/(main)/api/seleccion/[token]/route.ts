import { NextRequest, NextResponse } from 'next/server'
import { getSeleccion, getReacciones, redis } from '@/lib/redis'
import { verifyAgentToken } from '@/lib/auth'

export async function GET(
  _req: Request,
  { params }: { params: { token: string } }
) {
  const session = await getSeleccion(params.token)
  if (!session) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  const reactions = await getReacciones(params.token)
  return NextResponse.json({ session, reactions })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  // Verify agent
  const jwt = req.cookies.get('si_agent_token')?.value
  if (!jwt) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const agent = await verifyAgentToken(jwt)
  if (!agent) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const session = await getSeleccion(params.token)
  if (!session) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  // Only owner or admin can delete
  if (agent.role !== 'admin' && session.agentId !== agent.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await redis.del(`seleccion:${params.token}`)
  await redis.del(`reacciones:${params.token}`)

  return NextResponse.json({ ok: true })
}
