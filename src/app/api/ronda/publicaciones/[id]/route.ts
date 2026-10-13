// DELETE /api/ronda/publicaciones/{id}
//
// Dar de baja una propiedad de la Ronda antes de que venza. La baja quien la
// publicó (su pase) o un moderador con CRON_SECRET. La ficha neutra que ya
// recibió un cliente sigue viva: es una copia.

import { NextResponse } from 'next/server'
import { borrarPublicacion, publicacionPorId } from '@/lib/ronda/almacen'
import { sesionDe } from '@/lib/ronda/sesion'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = String(params.id || '')
  if (!/^[A-Za-z0-9_-]{6,24}$/.test(id)) return NextResponse.json({ error: 'No existe.' }, { status: 404 })

  const secreto = process.env.CRON_SECRET
  const modera = Boolean(secreto) && req.headers.get('authorization') === `Bearer ${secreto}`
  const sesion = modera ? null : sesionDe(req)
  if (!modera && !sesion) return NextResponse.json({ error: 'Primero cargá tus datos para entrar a la ronda.' }, { status: 401 })

  try {
    const publicacion = await publicacionPorId(id)
    if (!publicacion) return NextResponse.json({ ok: true })
    if (!modera && publicacion.agente.id !== sesion?.aid) {
      return NextResponse.json({ error: 'Solo la puede dar de baja quien la publicó.' }, { status: 403 })
    }
    await borrarPublicacion(id)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'No se pudo dar de baja. Probá de nuevo.' }, { status: 503 })
  }
}
