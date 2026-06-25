import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Validación server-side contra env (nunca viaja al bundle). El acceso de admin
// usa SI_TEAM_CODE (o ADMIN_PASSWORD si se define). Sin literales en el código.
const PASSWORD = process.env.ADMIN_PASSWORD || process.env.SI_TEAM_CODE || ''

function getRedis(): Redis {
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  })
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('x-admin-password')
  if (!PASSWORD || auth !== PASSWORD) {
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
    console.error('[api/admin/leads]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
