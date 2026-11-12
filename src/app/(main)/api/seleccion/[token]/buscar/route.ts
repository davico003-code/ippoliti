import { NextResponse } from 'next/server'
import { getSeleccion } from '@/lib/redis'
import { rateLimit } from '@/lib/feedback'
import { pedirParecidas } from '@/lib/seleccion-items'

export const dynamic = 'force-dynamic'

/**
 * "Buscá con IA" de la selección (David, 6-oct-2026): el cliente escribe qué
 * busca y HILO lo pasa a filtros (Haiku) y elige nuestras y de colegas con la
 * misma banda que las parecidas. Lo que escribió le queda al asesor en el
 * historial del contacto.
 */
export async function POST(req: Request, { params }: { params: { token: string } }) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  // Cada búsqueda es una llamada a la IA (HILO además tiene un tope diario por selección).
  if (!(await rateLimit(ip, 'seleccion-buscar', 8, 60))) {
    return NextResponse.json({ error: 'Esperá un minuto y probá de nuevo' }, { status: 429 })
  }

  const sel = await getSeleccion(params.token)
  if (!sel) return NextResponse.json({ error: 'Selección no encontrada' }, { status: 404 })

  const body = (await req.json().catch(() => null)) as { texto?: unknown; excluir?: unknown; asesor?: unknown } | null
  const texto = typeof body?.texto === 'string' ? body.texto.replace(/\s+/g, ' ').trim().slice(0, 300) : ''
  if (texto.length < 3) return NextResponse.json({ error: 'Contame qué buscás' }, { status: 400 })
  const excluir = (Array.isArray(body?.excluir) ? body.excluir : [])
    .filter((x): x is string => typeof x === 'string' && x.length > 0 && x.length <= 120)
    .slice(0, 200)

  try {
    const r = await pedirParecidas(params.token, { texto, excluir, soloMirar: body?.asesor === true })
    return NextResponse.json(r, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (e) {
    if (e instanceof Error && e.message === 'limite') {
      return NextResponse.json({ error: 'Por hoy ya buscaste mucho. Escribile a tu asesor y te ayuda.' }, { status: 429 })
    }
    console.error('[seleccion/buscar]', params.token, e instanceof Error ? e.message : e)
    return NextResponse.json({ error: 'No pude buscar ahora. Probá de nuevo en un rato.' }, { status: 502 })
  }
}
