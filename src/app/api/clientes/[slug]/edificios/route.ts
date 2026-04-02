import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

function parse<T>(raw: unknown): T | null {
  if (!raw) return null
  return typeof raw === 'string' ? JSON.parse(raw) : raw as T
}

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  try {
    const index = parse<string[]>(await redis.get(`cliente_edificios_index:${params.slug}`)) || []
    const edificios = []
    for (const edId of index) {
      const e = parse<Record<string, unknown>>(await redis.get(`cliente_edificio:${params.slug}:${edId}`))
      if (e) edificios.push(e)
    }
    edificios.sort((a, b) => (a.orden as number) - (b.orden as number))
    return NextResponse.json(edificios)
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { nombre, descripcion } = await req.json()
    if (!nombre) return NextResponse.json({ error: 'nombre requerido' }, { status: 400 })

    const edId = Date.now().toString()
    const edificio = { id: edId, nombre, descripcion: descripcion || '', orden: Date.now() }
    await redis.set(`cliente_edificio:${params.slug}:${edId}`, JSON.stringify(edificio))
    await redis.set(`cliente_edificio_props:${edId}`, JSON.stringify([]))

    const index = parse<string[]>(await redis.get(`cliente_edificios_index:${params.slug}`)) || []
    index.push(edId)
    await redis.set(`cliente_edificios_index:${params.slug}`, JSON.stringify(index))

    return NextResponse.json(edificio, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const edId = req.nextUrl.searchParams.get('edId')
    if (!edId) return NextResponse.json({ error: 'edId requerido' }, { status: 400 })

    await redis.del(`cliente_edificio:${params.slug}:${edId}`)
    await redis.del(`cliente_edificio_props:${edId}`)

    const index = parse<string[]>(await redis.get(`cliente_edificios_index:${params.slug}`)) || []
    await redis.set(`cliente_edificios_index:${params.slug}`, JSON.stringify(index.filter(id => id !== edId)))

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
