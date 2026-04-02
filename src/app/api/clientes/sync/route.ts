import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const apiKey = process.env.TOKKO_API_KEY || process.env.NEXT_PUBLIC_TOKKO_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 })

    const all: { id: number; direccion: string; barrio: string; ciudad: string; tipo: string; precio: number | null; moneda: string; foto: string | null }[] = []
    const pageSize = 40
    const maxPages = 20

    for (let page = 0; page < maxPages; page++) {
      const params = new URLSearchParams({
        key: apiKey, format: 'json', lang: 'es',
        limit: String(pageSize), offset: String(page * pageSize),
      })

      const res = await fetch(`https://www.tokkobroker.com/api/v1/property/?${params.toString()}`, { cache: 'no-store' })
      if (!res.ok) break

      const data = await res.json()
      const objects = data.objects || []

      for (const p of objects) {
        const photos = (p.photos || []).filter((ph: { is_blueprint?: boolean }) => !ph.is_blueprint)
        const cover = photos.find((ph: { is_front_cover?: boolean }) => ph.is_front_cover) || photos[0]
        const price = p.operations?.[0]?.prices?.[0]
        const loc = p.location || {}

        all.push({
          id: p.id,
          direccion: p.publication_title || p.address || p.fake_address || '',
          barrio: loc.short_location || loc.name || '',
          ciudad: (loc.full_location || '').split('|').pop()?.trim() || '',
          tipo: p.type?.name || '',
          precio: price?.price || null,
          moneda: price?.currency || 'USD',
          foto: cover?.image || cover?.thumb || null,
        })
      }

      if (objects.length < pageSize) break
    }

    const ts = Date.now().toString()
    await redis.set('props_cache', JSON.stringify(all))
    await redis.set('props_cache_ts', ts)

    return NextResponse.json({ ok: true, total: all.length, timestamp: ts })
  } catch {
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const ts = await redis.get('props_cache_ts')
    if (!ts) return NextResponse.json({ total: 0, timestamp: null })

    const raw = await redis.get('props_cache')
    const arr = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : []
    return NextResponse.json({ total: Array.isArray(arr) ? arr.length : 0, timestamp: ts })
  } catch {
    return NextResponse.json({ total: 0, timestamp: null })
  }
}
