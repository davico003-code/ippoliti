// /api/ronda/publicaciones
//
// GET  → la grilla de la semana (pública; la cachea el CDN unos segundos).
// POST → publica una propiedad por 7 días, de dos maneras:
//          { url, ciudad, oportunidad }     un enlace que se lee solo (ficha de Tokko)
//          { manual, ciudad, oportunidad }  cargada a mano, con sus fotos ya subidas
//                                           (y, si tiene, el enlace de su aviso en el portal)
//        Reglas: hace falta el pase del agente, hasta 2 propiedades vigentes por
//        inmobiliaria y un enlace no se publica dos veces. Arma la ficha neutra
//        de verficha.casa en el momento.

import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import {
  guardarLectura,
  guardarPublicacion,
  inmobiliariaPorId,
  lecturaGuardada,
  limpiarVencidas,
  listarPublicaciones,
} from '@/lib/ronda/almacen'
import { avisoManual, crearFichaDeAviso, ENLACE_NO_SIRVE, leerAviso, type AvisoRonda } from '@/lib/ronda/aviso'
import {
  barrioVisible,
  claveDeUrl,
  DIA_MS,
  DIAS_PUBLICACION,
  esCiudadRonda,
  leerDatosManual,
  MAX_POR_INMOBILIARIA,
  ocupadas,
  origenDeLink,
  tituloRonda,
  type Publicacion,
} from '@/lib/ronda/reglas'
import { ipDe, sesionDe } from '@/lib/ronda/sesion'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

const ORIGEN = { tokko: 'Tokko', web: 'Web', manual: 'Manual' } as const

const error = (mensaje: string, status = 400, extra: Record<string, unknown> = {}) =>
  NextResponse.json({ error: mensaje, ...extra }, { status })

export async function GET() {
  try {
    const publicaciones = await listarPublicaciones()
    return NextResponse.json(
      { publicaciones, ahora: Date.now() },
      { headers: { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30' } },
    )
  } catch {
    return error('No se pudo cargar la ronda. Probá de nuevo.', 503)
  }
}

export async function POST(req: Request) {
  const sesion = sesionDe(req)
  if (!sesion) return error('Primero cargá tus datos para entrar a la ronda.', 401)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return error('Datos inválidos.')
  }
  const ciudad = body.ciudad
  const oportunidad = String(body.oportunidad ?? '').replace(/\s+/g, ' ').trim().slice(0, 350)
  if (!esCiudadRonda(ciudad)) return error('Elegí si la propiedad está en Funes o en Roldán.')

  const aMano = body.manual !== undefined
  const manual = aMano ? leerDatosManual(body.manual) : null
  if (manual && 'error' in manual) return error(manual.error)
  // A mano, el enlace es opcional y no se lee: queda para que el colega abra el aviso.
  const url = manual ? (manual.datos.enlace ?? '') : String(body.url ?? '').trim().slice(0, 600)
  if (!aMano && !origenDeLink(url)) return error(ENLACE_NO_SIRVE)

  try {
    const inmobiliaria = await inmobiliariaPorId(sesion.iid)
    if (!inmobiliaria) return error('Tu inmobiliaria ya no está en la lista. Volvé a cargar tus datos.', 401)

    await limpiarVencidas()
    const grilla = await listarPublicaciones(true)
    if (ocupadas(grilla, sesion.iid) >= MAX_POR_INMOBILIARIA) {
      return error(
        `Tu inmobiliaria ya tiene ${MAX_POR_INMOBILIARIA} propiedades en la ronda, que es el máximo. Para publicar otra, dá de baja una o esperá a que venza.`,
        409,
        { limite: true },
      )
    }

    const clave = url ? claveDeUrl(url) : ''
    if (clave && grilla.some((p) => p.urlOriginal && claveDeUrl(p.urlOriginal) === clave)) return error('Esa propiedad ya está en la ronda.', 409)

    let aviso: AvisoRonda | null
    if (manual) {
      aviso = avisoManual(manual.datos)
    } else {
      aviso = await lecturaGuardada<AvisoRonda>(clave)
      if (!aviso) {
        aviso = await leerAviso(url)
        await guardarLectura(clave, aviso)
      }
    }
    if (aviso.fotos.length === 0) return error('Hace falta al menos una foto para publicar.', 422)

    const ficha = await crearFichaDeAviso(aviso, {
      ciudad,
      marcas: [inmobiliaria.nombre, inmobiliaria.matriculado, sesion.nombre],
      ip: ipDe(req),
      userAgent: req.headers.get('user-agent') || 'unknown',
    })

    const barrio = barrioVisible(aviso.barrio, ciudad)
    const ahora = Date.now()
    const publicacion: Publicacion = {
      id: nanoid(10),
      tipo: aviso.tipo,
      grupo: aviso.grupo,
      operacion: aviso.operacion,
      ciudad,
      barrio,
      titulo: tituloRonda({ tipo: aviso.tipo, operacion: aviso.operacion, barrio, ciudad }),
      precio: aviso.precio,
      moneda: aviso.moneda,
      m2: aviso.m2,
      dormitorios: aviso.dormitorios,
      banos: aviso.banos,
      foto: ficha.foto,
      fotos: ficha.fotos,
      ficha: ficha.url,
      origen: ORIGEN[aviso.origen],
      urlOriginal: url,
      oportunidad,
      agente: { id: sesion.aid, nombre: sesion.nombre, whatsapp: sesion.whatsapp },
      inmobiliaria: {
        id: inmobiliaria.id,
        nombre: inmobiliaria.nombre,
        matriculado: inmobiliaria.matriculado,
        matricula: inmobiliaria.matricula,
      },
      creada: ahora,
      vence: ahora + DIAS_PUBLICACION * DIA_MS,
    }
    await guardarPublicacion(publicacion)
    return NextResponse.json({ publicacion }, { status: 201 })
  } catch (e) {
    console.error('[ronda] publicar', e)
    return error(e instanceof Error && e.message ? e.message : 'No se pudo publicar. Probá de nuevo.', 422)
  }
}
