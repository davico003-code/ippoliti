// DELETE /api/ronda/pedidos/{id} — lo elimina quien lo publicó (también desde
// otro teléfono: mismo WhatsApp) o un moderador con CRON_SECRET.

import { NextResponse } from 'next/server'
import { sinAcceso } from '@/lib/ronda/acceso'
import { borrarPedido, pedidoPorId } from '@/lib/ronda/almacen'
import { sesionDe } from '@/lib/ronda/sesion'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = String(params.id || '')
  if (!/^[A-Za-z0-9_-]{6,24}$/.test(id)) return NextResponse.json({ error: 'No existe.' }, { status: 404 })
  const secreto = process.env.CRON_SECRET
  const modera = Boolean(secreto) && req.headers.get('authorization') === `Bearer ${secreto}`
  if (!modera) {
    const cerrado = await sinAcceso(req)
    if (cerrado) return cerrado
  }
  const sesion = modera ? null : sesionDe(req)
  if (!modera && !sesion) return NextResponse.json({ error: 'Primero cargá tus datos para entrar a la ronda.' }, { status: 401 })
  try {
    const pedido = await pedidoPorId(id)
    if (!pedido) return NextResponse.json({ ok: true })
    const suyo = pedido.agente.id === sesion?.aid || pedido.agente.whatsapp === sesion?.whatsapp
    if (!modera && !suyo) return NextResponse.json({ error: 'Solo lo puede eliminar quien lo publicó.' }, { status: 403 })
    await borrarPedido(id)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'No se pudo eliminar. Probá de nuevo.' }, { status: 503 })
  }
}
