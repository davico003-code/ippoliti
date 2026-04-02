import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

function parse<T>(raw: unknown): T | null {
  if (!raw) return null
  return typeof raw === 'string' ? JSON.parse(raw) : raw as T
}

export async function GET() {
  try {
    const index = parse<string[]>(await redis.get('clientes_index')) || []
    const clientes = []
    for (const slug of index) {
      const c = parse<Record<string, unknown>>(await redis.get(`cliente:${slug}`))
      if (c) clientes.push(c)
    }
    return NextResponse.json(clientes)
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, slug, description, coverImage } = await req.json()
    if (!name || !slug) return NextResponse.json({ error: 'name y slug requeridos' }, { status: 400 })

    const existing = await redis.get(`cliente:${slug}`)
    if (existing) return NextResponse.json({ error: 'Slug ya existe' }, { status: 409 })

    const cliente = { name, slug, description: description || '', coverImage: coverImage || '', createdAt: new Date().toISOString() }
    await redis.set(`cliente:${slug}`, JSON.stringify(cliente))

    const index = parse<string[]>(await redis.get('clientes_index')) || []
    index.push(slug)
    await redis.set('clientes_index', JSON.stringify(index))

    return NextResponse.json(cliente, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get('slug')
    if (!slug) return NextResponse.json({ error: 'slug requerido' }, { status: 400 })

    // Delete edificios
    const edIndex = parse<string[]>(await redis.get(`cliente_edificios_index:${slug}`)) || []
    for (const edId of edIndex) {
      await redis.del(`cliente_edificio:${slug}:${edId}`)
      await redis.del(`cliente_edificio_props:${edId}`)
    }
    await redis.del(`cliente_edificios_index:${slug}`)
    await redis.del(`cliente_props_sueltas:${slug}`)
    await redis.del(`cliente:${slug}`)

    // Update index
    const index = parse<string[]>(await redis.get('clientes_index')) || []
    await redis.set('clientes_index', JSON.stringify(index.filter(s => s !== slug)))

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
