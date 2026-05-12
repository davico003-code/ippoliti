import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export const revalidate = 86400 // 24h

const CACHE_KEY = 'tokko:agents:14045'
const CACHE_TTL_SECONDS = 86400 // 24h

export type TokkoAgent = {
  id: number
  name: string
  email: string
  phone: string
  cellphone: string
  picture: string | null
  position: string
}

type TokkoUserResponse = {
  objects: Array<{
    id: number
    name: string
    email?: string
    phone?: string
    cellphone?: string
    picture?: string | null
    position?: string
  }>
}

export async function GET() {
  // Try cache first
  try {
    const cached = await redis.get<TokkoAgent[]>(CACHE_KEY)
    if (Array.isArray(cached) && cached.length > 0) {
      return NextResponse.json({ agents: cached, cached: true })
    }
  } catch {
    // continue without cache
  }

  const key = process.env.TOKKO_API_KEY || process.env.NEXT_PUBLIC_TOKKO_API_KEY
  if (!key) {
    return NextResponse.json({ error: 'TOKKO_API_KEY missing' }, { status: 500 })
  }

  try {
    const res = await fetch(
      `https://www.tokkobroker.com/api/v1/user/?key=${key}&format=json&limit=100`,
      { next: { revalidate: 86400, tags: ['tokko-agents'] } }
    )
    if (!res.ok) {
      return NextResponse.json({ error: `Tokko ${res.status}` }, { status: res.status })
    }
    const data = (await res.json()) as TokkoUserResponse
    const agents: TokkoAgent[] = (data.objects ?? []).map((u) => ({
      id: u.id,
      name: u.name?.trim() ?? '',
      email: (u.email ?? '').trim(),
      phone: (u.phone ?? '').trim(),
      cellphone: (u.cellphone ?? '').trim(),
      picture: u.picture ?? null,
      position: (u.position ?? '').trim(),
    }))

    try {
      await redis.set(CACHE_KEY, JSON.stringify(agents), { ex: CACHE_TTL_SECONDS })
    } catch {
      // cache write failure non-fatal
    }

    return NextResponse.json({ agents, cached: false })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'unknown' },
      { status: 500 }
    )
  }
}
