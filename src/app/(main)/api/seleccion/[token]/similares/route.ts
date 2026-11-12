import { NextRequest, NextResponse } from 'next/server'
import { getSeleccion } from '@/lib/redis'
import { rateLimit } from '@/lib/feedback'
import { pedirParecidas } from '@/lib/seleccion-items'

export const dynamic = 'force-dynamic'

/**
 * Parecidas a una selección, para el cliente al que no le cerró ninguna o que
 * quiere ver más. La página las pide apenas carga (así aparecen al instante
 * cuando termina de mirar). `excluir` = las que ya vio y descartó. Las elige
 * HILO (banda −10/+15 sobre lo que le mostraron, nuestras y de colegas).
 */
export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!(await rateLimit(ip, 'seleccion-similares', 20, 60))) {
    return NextResponse.json({ error: 'Demasiados pedidos seguidos' }, { status: 429 })
  }

  const sel = await getSeleccion(params.token)
  if (!sel) return NextResponse.json({ error: 'Selección no encontrada' }, { status: 404 })

  const excluir = (req.nextUrl.searchParams.get('excluir') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 200)

  try {
    const { items } = await pedirParecidas(params.token, { excluir })
    // Depende de la selección y de stock de colegas con permisos revocables.
    return NextResponse.json({ items }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (e) {
    // Sin parecidas el cierre igual le dice que el asesor le busca otras; queda en el log.
    console.error('[seleccion/similares]', params.token, e instanceof Error ? e.message : e)
    return NextResponse.json({ items: [] }, { status: 200 })
  }
}
