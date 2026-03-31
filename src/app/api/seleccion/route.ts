import { NextRequest, NextResponse } from 'next/server'
import { crearSeleccion, listarSelecciones, redis } from '@/lib/redis'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Support legacy format (x-admin-key)
    const adminKey = req.headers.get('x-admin-key')
    if (adminKey && body.title && body.propertyIds) {
      const id = Math.random().toString(36).slice(2, 10)
      const data = { title: body.title, propertyIds: body.propertyIds, createdAt: Date.now() }
      await redis.set(`seleccion:${id}`, JSON.stringify(data), { ex: 2592000 })
      return NextResponse.json({ id, url: `https://siinmobiliaria.com/seleccion/${id}` })
    }

    // New format
    const { clientName, clientPhone, agent, days, note, properties } = body
    if (!clientName || !properties?.length) {
      return NextResponse.json({ error: 'clientName y al menos 1 propiedad requeridos' }, { status: 400 })
    }

    const token = await crearSeleccion({
      clientName,
      clientPhone: clientPhone || '',
      agent: agent || 'David',
      days: days || 10,
      note: note || '',
      properties,
    })

    return NextResponse.json({ token, url: `/seleccion/${token}` })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const agent = req.nextUrl.searchParams.get('agent') || undefined
    const sessions = await listarSelecciones(agent)
    return NextResponse.json(sessions)
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}
