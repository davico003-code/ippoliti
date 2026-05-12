import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

interface IndexEntry { date: string; value: number }

const KEYS = ['IPC', 'IPC_NUCLEO', 'CER', 'UVA'] as const

export async function GET() {
  const indices: Record<string, IndexEntry[]> = {}
  const monthlyPct: Record<string, number | null> = {}

  for (const key of KEYS) {
    try {
      const raw = await redis.get(`indices:${key}`)
      if (raw) {
        indices[key] = typeof raw === 'string' ? JSON.parse(raw) : raw as IndexEntry[]
      } else {
        indices[key] = []
      }
      const pct = await redis.get(`indices:monthly_pct:${key}`)
      monthlyPct[key] = pct && pct !== 'null' ? parseFloat(String(pct)) : null
    } catch {
      indices[key] = []
      monthlyPct[key] = null
    }
  }

  const lastUpdated = await redis.get('indices:last_updated') as string | null

  // If Redis is empty, return empty with flag
  const hasData = Object.values(indices).some(arr => arr.length > 0)

  return NextResponse.json({
    indices,
    monthlyPct,
    lastUpdated,
    hasData,
  })
}
