import { NextResponse } from 'next/server'
import { getSeleccion, guardarDeslizadas } from '@/lib/redis'
import { rateLimit } from '@/lib/feedback'

// POST /api/seleccion/[token]/deslizadas — el cliente de un asesor deslizó
// casas en el mazo (/conoce-tu-hogar?s=<token>): la línea de lo que le gustó y
// lo que pasó (lib/mazo-deslizadas.ts) queda en su link de seguimiento y HILO
// se la muestra al asesor con sus ♥. Público como /reaccion: rate-limit por IP
// y el link tiene que existir.
export async function POST(req: Request, { params }: { params: { token: string } }) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (!(await rateLimit(ip, 'deslizadas', 20, 60))) {
      return NextResponse.json({ error: 'Demasiadas acciones seguidas' }, { status: 429 })
    }
    const sel = await getSeleccion(params.token)
    if (!sel) return NextResponse.json({ error: 'Selección no encontrada' }, { status: 404 })
    const { texto } = (await req.json().catch(() => ({}))) as { texto?: unknown }
    // Una línea corta que empieza como la arma el mazo: nada de texto libre.
    const limpio = typeof texto === 'string' ? texto.replace(/[\n\r]+/g, ' ').trim().slice(0, 300) : ''
    if (!limpio.startsWith('Deslizó ')) return NextResponse.json({ error: 'texto inválido' }, { status: 400 })
    await guardarDeslizadas(params.token, limpio)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
