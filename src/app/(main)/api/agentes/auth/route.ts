import { NextResponse } from 'next/server'
import { findAgent } from '@/lib/agents'
import { createAgentToken, COOKIE_NAME } from '@/lib/auth'
import { getIp, rateLimit } from '@/lib/feedback'

export async function POST(req: Request) {
  try {
    // El login del panel es público y la contraseña es compartida: sin freno,
    // se puede probar de a miles por minuto hasta acertar. Una sesión de agente
    // da acceso a datos de clientes, así que la puerta se cierra acá.
    // 8 intentos cada 5 minutos por IP alcanzan de sobra para un login humano.
    if (!(await rateLimit(getIp(req), 'agentes-login', 8, 300))) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Esperá unos minutos.' },
        { status: 429 },
      )
    }

    const { username, password } = await req.json()
    const agent = findAgent((username || '').toLowerCase().trim(), password || '')

    if (!agent) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
    }

    const token = await createAgentToken(agent)

    const res = NextResponse.json({ ok: true, agent: { id: agent.id, name: agent.name, role: agent.role } })
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 2592000,
      sameSite: 'lax',
    })

    return res
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
