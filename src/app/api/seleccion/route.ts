import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export async function POST(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key')
  if (adminKey !== (process.env.ADMIN_SECRET ?? 'siadmin2024')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, propertyIds } = await req.json()
  if (!title || !propertyIds?.length) {
    return NextResponse.json({ error: 'title and propertyIds required' }, { status: 400 })
  }

  const id = Math.random().toString(36).slice(2, 10)
  const data = { title, propertyIds, createdAt: Date.now() }

  await redis.set(`seleccion:${id}`, JSON.stringify(data), { ex: 2592000 })

  return NextResponse.json({
    id,
    url: `https://siinmobiliaria.com/seleccion/${id}`,
  })
}
