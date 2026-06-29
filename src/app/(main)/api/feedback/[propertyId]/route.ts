// DELETE /api/feedback/[propertyId] — borra todo el feedback de una propiedad.
// Solo admin (mismo gate que el panel que muestra esta data con PII).

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyAgentToken } from '@/lib/auth'
import { deletePropertyFeedback } from '@/lib/feedback-admin'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function DELETE(
  _req: Request,
  { params }: { params: { propertyId: string } },
) {
  const token = cookies().get('si_agent_token')?.value
  const agent = token ? await verifyAgentToken(token) : null
  if (!agent || agent.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = params.propertyId
  if (!id) {
    return NextResponse.json({ error: 'falta propertyId' }, { status: 400 })
  }

  try {
    await deletePropertyFeedback(id)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
