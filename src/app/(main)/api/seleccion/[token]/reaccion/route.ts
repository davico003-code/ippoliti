import { NextResponse } from 'next/server'
import { patchReaccion, getSeleccion, sumarASeleccion } from '@/lib/redis'
import { rateLimit } from '@/lib/feedback'
import { propiedadSugerida } from '@/lib/seleccion-items'

export async function PATCH(
  req: Request,
  { params }: { params: { token: string } }
) {
  try {
    // Rate-limit por IP: es un endpoint público (el cliente reacciona a su
    // selección), sin esto se puede escribir en Redis sin límite.
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (!(await rateLimit(ip, 'reaccion', 30, 60))) {
      return NextResponse.json({ error: 'Demasiadas acciones seguidas' }, { status: 429 })
    }

    // La selección tiene que existir: antes se escribía una reacción para
    // cualquier token (incluso inexistente) → basura permanente en Redis.
    const sel = await getSeleccion(params.token)
    if (!sel) return NextResponse.json({ error: 'Selección no encontrada' }, { status: 404 })

    const { propertyId, liked, wantVisit, comment, reaction, sugerida } = await req.json()
    if (!propertyId) return NextResponse.json({ error: 'propertyId required' }, { status: 400 })

    // Parecida que le gustó (o quiere visitar): se suma a la selección para que
    // el asesor la vea en HILO con su título, junto a las que eligió él.
    const enSeleccion = (sel.properties ?? []).some((p: { id: string }) => p.id === propertyId)
    if (!enSeleccion && sugerida === true && (liked === true || wantVisit === true)) {
      if (!/^\d{5,12}$/.test(String(propertyId))) {
        return NextResponse.json({ error: 'Propiedad inválida' }, { status: 400 })
      }
      const prop = await propiedadSugerida(Number(propertyId))
      if (!prop || !(await sumarASeleccion(params.token, prop))) {
        return NextResponse.json({ error: 'No se pudo sumar la propiedad' }, { status: 400 })
      }
    }

    const safeComment = typeof comment === 'string' ? comment.slice(0, 1000) : comment
    await patchReaccion(params.token, propertyId, { liked, wantVisit, comment: safeComment, reaction })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
