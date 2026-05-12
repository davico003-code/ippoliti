import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import type { GuiaRegistro } from '@/app/api/guia/acceso/route'

export const dynamic = 'force-dynamic'

function authorize(req: Request): boolean {
  const expected = process.env.ADMIN_EXPORT_TOKEN
  if (!expected) return false
  const header = req.headers.get('x-admin-token')
  const url = new URL(req.url)
  const qp = url.searchParams.get('token')
  const token = header ?? qp
  return token === expected
}

async function readAll(): Promise<GuiaRegistro[]> {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return []
  const redis = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  })
  // LRANGE devuelve array de strings o ya parseados según cliente.
  const raw = await redis.lrange('guia:registros:all', 0, -1)
  const items: GuiaRegistro[] = []
  for (const r of raw) {
    try {
      const parsed = typeof r === 'string' ? JSON.parse(r) : (r as unknown as GuiaRegistro)
      if (parsed && typeof parsed === 'object' && 'email' in parsed) {
        items.push(parsed as GuiaRegistro)
      }
    } catch { /* ignore malformed row */ }
  }
  // LPUSH inserts at head, so array is already newest-first. Sort to be safe.
  items.sort((a, b) => (b.fecha > a.fecha ? 1 : -1))
  return items
}

export async function GET(req: Request) {
  if (!authorize(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const items = await readAll()
  return NextResponse.json({ total: items.length, items })
}
