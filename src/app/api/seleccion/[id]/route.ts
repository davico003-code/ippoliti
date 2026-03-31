import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const raw = await redis.get(`seleccion:${params.id}`)
  if (!raw) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data = typeof raw === 'string' ? JSON.parse(raw) : raw
  return NextResponse.json(data)
}
