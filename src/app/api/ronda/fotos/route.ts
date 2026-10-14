// POST /api/ronda/fotos   (cuerpo: un JPEG)
//
// Sube UNA foto de una propiedad cargada a mano en la Ronda. El teléfono la
// achica antes de mandarla (lado mayor 1600 px), así cada pedido pesa poco y
// entra en el tope de una función. Queda en el almacén público de las fichas,
// bajo "ronda/": al publicar solo se aceptan fotos de esa carpeta.

import { NextResponse } from 'next/server'
import { sinAcceso } from '@/lib/ronda/acceso'
import { put } from '@vercel/blob'
import { nanoid } from 'nanoid'
import { rateLimit } from '@/lib/feedback'
import { blobToken } from '@/lib/rehost-fotos'
import { sesionDe } from '@/lib/ronda/sesion'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const MAX_BYTES = 4_000_000

const error = (mensaje: string, status = 400) => NextResponse.json({ error: mensaje }, { status })

export async function POST(req: Request) {
  const cerrado = await sinAcceso(req)
  if (cerrado) return cerrado

  const sesion = sesionDe(req)
  if (!sesion) return error('Primero cargá tus datos para entrar a la ronda.', 401)

  if ((req.headers.get('content-type') || '').split(';')[0].trim() !== 'image/jpeg') return error('La foto tiene que ser una imagen.', 415)
  if (Number(req.headers.get('content-length') || 0) > MAX_BYTES) return error('La foto es demasiado pesada.', 413)
  if (!(await rateLimit(sesion.aid, 'ronda-foto', 40, 3600))) return error('Subiste muchas fotos seguidas. Probá de nuevo en un rato.', 429)

  const token = blobToken()
  if (!token) return error('No se pueden subir fotos en este momento.', 503)

  try {
    const foto = Buffer.from(await req.arrayBuffer())
    if (foto.length > MAX_BYTES) return error('La foto es demasiado pesada.', 413)
    // Un JPEG de verdad empieza con FF D8 FF.
    if (foto.length < 1000 || foto[0] !== 0xff || foto[1] !== 0xd8 || foto[2] !== 0xff) return error('La foto tiene que ser una imagen.', 415)
    const mes = new Date().toISOString().slice(0, 7)
    const { url } = await put(`ronda/${mes}/${sesion.aid}-${nanoid(10)}.jpg`, foto, {
      access: 'public',
      contentType: 'image/jpeg',
      addRandomSuffix: false,
      token,
    })
    return NextResponse.json({ url }, { status: 201 })
  } catch (e) {
    console.error('[ronda] foto', e)
    return error('No se pudo subir la foto. Probá de nuevo.', 503)
  }
}
