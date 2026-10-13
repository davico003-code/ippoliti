// POST /api/ronda/leer  { url }
//
// Paso 1 de publicar: lee el aviso del link y devuelve lo que se va a mostrar,
// para que el colega lo revise. No publica nada. Si el aviso no se puede
// convertir solo (un Zonaprop que no está en la copia), responde 422 con
// `aMano: true` y la pantalla pasa a la carga a mano. El aviso leído queda 30 min
// guardado: al confirmar no se vuelve a leer.

import { NextResponse } from 'next/server'
import { rateLimit } from '@/lib/feedback'
import { guardarLectura, listarPublicaciones } from '@/lib/ronda/almacen'
import { AvisoSinLectura, ENLACE_NO_SIRVE, leerAviso } from '@/lib/ronda/aviso'
import { barrioVisible, claveDeUrl, MAX_POR_INMOBILIARIA, ocupadas, origenDeLink } from '@/lib/ronda/reglas'
import { sesionDe } from '@/lib/ronda/sesion'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

const error = (mensaje: string, status = 400, extra: Record<string, unknown> = {}) =>
  NextResponse.json({ error: mensaje, ...extra }, { status })

export async function POST(req: Request) {
  const sesion = sesionDe(req)
  if (!sesion) return error('Primero cargá tus datos para entrar a la ronda.', 401)

  let url = ''
  try {
    url = String((await req.json()).url ?? '').trim().slice(0, 600)
  } catch {
    return error('Datos inválidos.')
  }
  if (!origenDeLink(url)) return error(ENLACE_NO_SIRVE)

  try {
    const grilla = await listarPublicaciones(true)
    if (ocupadas(grilla, sesion.iid) >= MAX_POR_INMOBILIARIA) {
      return error(
        `Tu inmobiliaria ya tiene ${MAX_POR_INMOBILIARIA} propiedades en la ronda, que es el máximo. Para publicar otra, dá de baja una o esperá a que venza.`,
        409,
        { limite: true },
      )
    }
    const clave = claveDeUrl(url)
    if (grilla.some((p) => p.urlOriginal && claveDeUrl(p.urlOriginal) === clave)) return error('Esa propiedad ya está en la ronda.', 409)

    if (!(await rateLimit(sesion.aid, 'ronda-leer', 10, 3600))) {
      return error('Revisaste muchos enlaces seguidos. Probá de nuevo en un rato.', 429)
    }

    const aviso = await leerAviso(url)
    if (aviso.fotos.length === 0) return error('Ese aviso no tiene fotos. Publicá uno que las tenga.', 422)
    await guardarLectura(clave, aviso)

    return NextResponse.json({
      aviso: {
        tipo: aviso.tipo,
        operacion: aviso.operacion,
        ciudad: aviso.ciudad,
        barrio: aviso.ciudad ? barrioVisible(aviso.barrio, aviso.ciudad) : aviso.barrio,
        precio: aviso.precio,
        moneda: aviso.moneda,
        m2: aviso.m2,
        dormitorios: aviso.dormitorios,
        banos: aviso.banos,
        foto: aviso.fotos[0] ?? null,
        fotos: aviso.fotos.length,
        // Copia guardada: la pantalla avisa de cuándo es y deja corregir el precio.
        leidoEl: aviso.leidoEl ?? null,
      },
    })
  } catch (e) {
    if (e instanceof AvisoSinLectura) return error(e.message, 422, { aMano: true })
    return error(e instanceof Error && e.message ? e.message : 'No se pudo leer el aviso.', 422)
  }
}
