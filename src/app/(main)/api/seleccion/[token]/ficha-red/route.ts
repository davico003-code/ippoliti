import { NextRequest, NextResponse } from 'next/server'
import { getSeleccion, redis } from '@/lib/redis'
import { rateLimit } from '@/lib/feedback'
import { pedirAHilo, redIdDe } from '@/lib/seleccion-red'
import { fichaNeutraEmbebida, slugVerficha } from '@/lib/seleccion-items'

export const dynamic = 'force-dynamic'

const TTL = 90 * 24 * 60 * 60

/**
 * GET /api/seleccion/<token>/ficha-red?id=propia:123 — la ficha neutra de una
 * parecida En red para abrirla ADENTRO de la selección. La arma HILO (~0,5 s)
 * la primera vez; después queda guardada para esa selección.
 */
export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  const redId = redIdDe(req.nextUrl.searchParams.get('id') ?? '')
  if (!redId) return NextResponse.json({ error: 'id inválido' }, { status: 400 })

  const clave = `seleccion:${params.token}:fichas-red`
  const guardada = await redis.hget<string>(clave, redId)
  if (guardada) return NextResponse.json({ fichaUrl: guardada })

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!(await rateLimit(ip, 'seleccion-ficha-red', 20, 60))) {
    return NextResponse.json({ error: 'Demasiados pedidos seguidos' }, { status: 429 })
  }
  if (!(await getSeleccion(params.token))) return NextResponse.json({ error: 'Selección no encontrada' }, { status: 404 })

  const r = await pedirAHilo(params.token, redId, 'ficha')
  const slug = r.ok && r.url ? slugVerficha(r.url) : null
  if (!slug) return NextResponse.json({ error: r.status === 410 ? 'no_disponible' : 'sin_ficha' }, { status: r.status === 410 ? 410 : 502 })

  const fichaUrl = fichaNeutraEmbebida(slug)
  await redis.hset(clave, { [redId]: fichaUrl })
  await redis.expire(clave, TTL)
  return NextResponse.json({ fichaUrl })
}
