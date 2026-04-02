import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

function parse<T>(raw: unknown): T | null {
  if (!raw) return null
  return typeof raw === 'string' ? JSON.parse(raw) : raw as T
}

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  try {
    const ids = parse<string[]>(await redis.get(`cliente_props_sueltas:${params.slug}`)) || []
    return NextResponse.json(ids)
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { tokkoId, action } = await req.json()
    if (!tokkoId || !action) return NextResponse.json({ error: 'tokkoId y action requeridos' }, { status: 400 })

    const ids = parse<string[]>(await redis.get(`cliente_props_sueltas:${params.slug}`)) || []

    if (action === 'add' && !ids.includes(String(tokkoId))) {
      ids.push(String(tokkoId))
    } else if (action === 'remove') {
      const filtered = ids.filter(id => id !== String(tokkoId))
      await redis.set(`cliente_props_sueltas:${params.slug}`, JSON.stringify(filtered))
      return NextResponse.json(filtered)
    }

    await redis.set(`cliente_props_sueltas:${params.slug}`, JSON.stringify(ids))
    return NextResponse.json(ids)
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
