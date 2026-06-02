import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { assertTeamCode } from '@/lib/team-auth'

export const dynamic = 'force-dynamic'
const BASE_URL = 'https://siinmobiliaria.com'

async function revalidar(slug: string) {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret) return
  try {
    // /api/revalidate, con {slug}, revalida también el índice /blog.
    await fetch(`${BASE_URL}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
      body: JSON.stringify({ slug }),
    })
  } catch {
    /* no crítico */
  }
}

export async function POST(req: Request) {
  const unauth = assertTeamCode(req)
  if (unauth) return unauth

  let body: { slug?: string; destino?: string; accion?: 'eliminar' | 'restaurar' }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const slug = (body.slug ?? '').trim()
  const accion = body.accion ?? 'eliminar'
  if (!slug) return NextResponse.json({ error: 'Falta slug' }, { status: 400 })

  if (accion === 'restaurar') {
    await redis.hdel('blog:redirects', slug)
    await revalidar(slug)
    return NextResponse.json({ ok: true, restaurado: slug })
  }

  const destino = (body.destino ?? '').trim()
  if (!destino || !(destino.startsWith('/') || destino.startsWith('http'))) {
    return NextResponse.json(
      { error: 'destino inválido (ruta /… o URL http…)' },
      { status: 400 },
    )
  }

  // Guard de loops/cadenas: el destino no puede ser la misma nota ni apuntar a
  // un slug que ya esté redirigido (evita A→B→A y A→B→C).
  const match = destino.match(/\/blog\/([^/?#]+)/)
  if (match) {
    const targetSlug = match[1]
    if (targetSlug === slug) {
      return NextResponse.json(
        { error: 'el destino no puede ser la misma nota' },
        { status: 400 },
      )
    }
    const yaRedirigido = await redis.hget('blog:redirects', targetSlug)
    if (yaRedirigido) {
      return NextResponse.json(
        { error: `el destino /blog/${targetSlug} ya está redirigido (evitar cadenas)` },
        { status: 400 },
      )
    }
  }

  // Soft-delete: tombstone + fuente del 301. NO se toca el Blob (reversible).
  await redis.hset('blog:redirects', { [slug]: destino })
  await revalidar(slug)
  return NextResponse.json({ ok: true, eliminado: slug, destino })
}
