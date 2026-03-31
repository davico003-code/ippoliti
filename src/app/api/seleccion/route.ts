import { NextRequest, NextResponse } from 'next/server'
import { crearSeleccion, listarSelecciones, listarSeleccionesPorAgente, listarTodasSelecciones, redis } from '@/lib/redis'
import { verifyAgentToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Legacy format support
    const adminKey = req.headers.get('x-admin-key')
    if (adminKey && body.title && body.propertyIds) {
      const id = Math.random().toString(36).slice(2, 10)
      const data = { title: body.title, propertyIds: body.propertyIds, createdAt: Date.now() }
      await redis.set(`seleccion:${id}`, JSON.stringify(data), { ex: 2592000 })
      return NextResponse.json({ id, url: `https://siinmobiliaria.com/seleccion/${id}` })
    }

    // Read agent from JWT cookie
    const token = req.cookies.get('si_agent_token')?.value
    let agentId = 'david'
    let agentName = 'David Flores'
    if (token) {
      const agent = await verifyAgentToken(token)
      if (agent) { agentId = agent.id; agentName = agent.name }
    }

    const { clientName, clientPhone, days, note, properties } = body
    if (!clientName || !properties?.length) {
      return NextResponse.json({ error: 'clientName y al menos 1 propiedad requeridos' }, { status: 400 })
    }

    const selToken = await crearSeleccion({
      clientName,
      clientPhone: clientPhone || '',
      agent: agentName,
      agentId,
      agentName,
      days: days || 10,
      note: note || '',
      properties,
    })

    return NextResponse.json({ token: selToken, url: `/seleccion/${selToken}` })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    // Read agent from JWT cookie
    const jwtToken = req.cookies.get('si_agent_token')?.value
    if (jwtToken) {
      const agent = await verifyAgentToken(jwtToken)
      if (agent) {
        const sessions = agent.role === 'admin'
          ? await listarTodasSelecciones()
          : await listarSeleccionesPorAgente(agent.id)
        return NextResponse.json(sessions)
      }
    }

    // Fallback: query param
    const agentParam = req.nextUrl.searchParams.get('agent') || undefined
    const sessions = await listarSelecciones(agentParam)
    return NextResponse.json(sessions)
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}
