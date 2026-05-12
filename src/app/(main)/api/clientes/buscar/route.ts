import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export const dynamic = 'force-dynamic'

interface CachedProp {
  id: number
  direccion: string
  barrio: string
  ciudad: string
  tipo: string
  precio: number | null
  moneda: string
  foto: string | null
}

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q')?.trim().toLowerCase() || ''
    if (q.length < 2) return NextResponse.json([])

    const raw = await redis.get('props_cache')
    if (!raw) return NextResponse.json({ error: 'sync_needed', message: 'Sincronizá primero' }, { status: 404 })

    const all: CachedProp[] = typeof raw === 'string' ? JSON.parse(raw) : raw as CachedProp[]

    const filtered = all.filter(p => {
      const haystack = `${p.direccion} ${p.barrio} ${p.ciudad} ${p.tipo}`.toLowerCase()
      return haystack.includes(q)
    }).slice(0, 50)

    // Map to expected format
    const results = filtered.map(p => ({
      id: p.id,
      publication_title: p.direccion,
      address: p.direccion,
      photo: p.foto,
      price: p.precio,
      currency: p.moneda,
      type: p.tipo,
    }))

    return NextResponse.json(results)
  } catch {
    return NextResponse.json({ error: 'Algo salió mal' }, { status: 500 })
  }
}
