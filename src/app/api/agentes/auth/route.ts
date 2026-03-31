import { NextResponse } from 'next/server'
import { findAgent } from '@/lib/agents'
import { createAgentToken, COOKIE_NAME } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()
    const agent = findAgent((username || '').toLowerCase().trim(), password || '')

    if (!agent) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
    }

    const token = await createAgentToken(agent)

    const res = NextResponse.json({ ok: true, agent: { id: agent.id, name: agent.name, role: agent.role } })
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      path: '/',
      maxAge: 604800,
      sameSite: 'lax',
    })

    return res
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
