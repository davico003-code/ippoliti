import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const PASSWORD = 'siadmin2024'

function getRedis(): Redis {
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  })
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('x-admin-password')
  if (auth !== PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const redis = getRedis()
    const raw = await redis.lrange('leads:all', 0, 500)

    const leads = raw.map(item => {
      if (typeof item === 'string') {
        try { return JSON.parse(item) } catch { return item }
      }
      return item
    })

    return NextResponse.json({ leads })
  } catch (err) {
    return NextResponse.json({ error: 'Redis error', detail: String(err) }, { status: 500 })
  }
}
