import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

const SERIES: Record<string, { url: string; label: string }> = {
  IPC: {
    url: 'https://apis.datos.gob.ar/series/api/series/?ids=148.3_INIVELNAL_DICI_M_26&start_date=2024-01-01&limit=36&format=json',
    label: 'IPC Nivel General',
  },
  IPC_NUCLEO: {
    url: 'https://apis.datos.gob.ar/series/api/series/?ids=148.3_INUCLEONAL_DICI_M_19&start_date=2024-01-01&limit=36&format=json',
    label: 'IPC Núcleo',
  },
  CER: {
    url: 'https://apis.datos.gob.ar/series/api/series/?ids=94.2_CD_D_0_0_10&collapse=month&collapse_aggregation=avg&start_date=2024-01-01&limit=36&format=json',
    label: 'CER',
  },
  UVA: {
    url: 'https://apis.datos.gob.ar/series/api/series/?ids=94.2_UVAD_D_0_0_10&collapse=month&collapse_aggregation=avg&start_date=2024-01-01&limit=36&format=json',
    label: 'UVA',
  },
}

const TTL = 3456000 // 40 days

interface IndecResponse {
  data: [string, number | null][]
}

export async function GET(req: NextRequest) {
  // Auth check: Vercel cron sends this automatically, or manual with header
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: Record<string, { count: number; lastDate: string; monthlyPct: number | null }> = {}

  for (const [key, { url }] of Object.entries(SERIES)) {
    try {
      const res = await fetch(url)
      if (!res.ok) {
        results[key] = { count: 0, lastDate: 'fetch error', monthlyPct: null }
        continue
      }
      const json = (await res.json()) as IndecResponse
      const data = (json.data || [])
        .filter((d): d is [string, number] => d[1] != null)
        .map(d => ({ date: d[0], value: d[1] }))

      if (data.length === 0) {
        results[key] = { count: 0, lastDate: 'no data', monthlyPct: null }
        continue
      }

      // Monthly % change
      let monthlyPct: number | null = null
      if (data.length >= 2) {
        const last = data[data.length - 1].value
        const prev = data[data.length - 2].value
        monthlyPct = ((last - prev) / prev) * 100
      }

      // Store in Redis
      await redis.set(`indices:${key}`, JSON.stringify(data), { ex: TTL })
      await redis.set(`indices:monthly_pct:${key}`, monthlyPct?.toFixed(2) ?? 'null', { ex: TTL })

      results[key] = {
        count: data.length,
        lastDate: data[data.length - 1].date,
        monthlyPct,
      }
    } catch (err) {
      results[key] = { count: 0, lastDate: `error: ${err instanceof Error ? err.message : 'unknown'}`, monthlyPct: null }
    }
  }

  // Store last updated timestamp
  const now = new Date().toISOString()
  await redis.set('indices:last_updated', now, { ex: TTL })

  return NextResponse.json({ success: true, updated: now, series: results })
}
