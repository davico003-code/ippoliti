// /api/ronda/publicaciones
//
// GET  → la grilla del mes, los pedidos de búsqueda (cruzados con las oportunidades:
//        `buscan` en cada oportunidad, `encajan` en cada pedido) y la actividad del mes.
// POST → publica una oportunidad por 30 días (con su motivo, obligatorio), SOLO pegando el link
//        (David, 14-oct-2026: no hay carga a mano):
//          { url, ciudad, oportunidad }     un enlace que se convierte solo (ficha de Tokko,
//                                           o un Zonaprop: si sale de la copia, acepta `precio`)
//        Reglas: hace falta el pase del agente, hasta 3 vigentes por inmobiliaria
//        (`reemplaza: <id>` cambia una propia por otra que arranca de cero) y la
//        misma inmobiliaria no repite un enlace (dos inmobiliarias sí pueden). Arma la ficha neutra
//        de verficha.casa en el momento.

import { NextResponse } from 'next/server'
import { sinAcceso } from '@/lib/ronda/acceso'
import { nanoid } from 'nanoid'
import {
  actividadDelMes,
  borrarPublicacion,
  guardarLectura,
  guardarPublicacion,
  inmobiliariaPorId,
  lecturaGuardada,
  limpiarVencidas,
  listarPedidos,
  listarPublicaciones,
} from '@/lib/ronda/almacen'
import { AvisoSinLectura, completarDetalles, completarDirecciones, crearFichaDeAviso, ENLACE_NO_SIRVE, leerAviso, type AvisoRonda } from '@/lib/ronda/aviso'
import {
  barrioVisible,
  chequeoAlPublicar,
  claveDeUrl,
  direccionVisible,
  encaja,
  DIA_MS,
  DIAS_PUBLICACION,
  esCiudadRonda,
  leerMotivo,
  leerPrecio,
  origenDeLink,
  tituloRonda,
  type Publicacion,
} from '@/lib/ronda/reglas'
import { ciudadesDe, fueraDeSala, inmobiliariaDeSala, salaDe } from '@/lib/ronda/sala'
import { ipDe, sesionDe } from '@/lib/ronda/sesion'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

const ORIGEN = { tokko: 'Tokko', zonaprop: 'Zonaprop', web: 'Web' } as const

const error = (mensaje: string, status = 400, extra: Record<string, unknown> = {}) =>
  NextResponse.json({ error: mensaje, ...extra }, { status })

export async function GET(req: Request) {
  const cerrado = await sinAcceso(req)
  if (cerrado) return cerrado

  const sala = salaDe(req)
  try {
    const publicaciones = (await completarDirecciones(await completarDetalles(await listarPublicaciones(false, sala)))).map((p) =>
      ({
        ...p,
        // Tokko se comparte tal cual: también las publicadas antes del cambio (14-oct-2026).
        ...(p.origen === 'Tokko' && p.urlOriginal ? { ficha: p.urlOriginal } : {}),
        detalle: p.detalle && { ...p.detalle, comodidades: [] },
        // La guardada antes de la limpieza (16-oct-2026) también sale prolija.
        direccion: p.direccion === undefined ? undefined : direccionVisible(p.direccion, p.ciudad, p.barrio),
      }),
    )
    // El contador y los pedidos no pueden tirar abajo la grilla: si fallan, la pantalla no los muestra.
    const [actividad, pedidos] = await Promise.all([
      sala ? null : actividadDelMes().catch(() => null),
      listarPedidos(false, sala).catch(() => []),
    ])
    const conPedidos = publicaciones.map((p) => ({ ...p, buscan: pedidos.filter((q) => encaja(q, p)).map((q) => q.id) }))
    const pedidosCruzados = pedidos.map((q) => ({ ...q, encajan: publicaciones.filter((p) => encaja(q, p)).map((p) => p.id) }))
    return NextResponse.json(
      { publicaciones: conPedidos, pedidos: pedidosCruzados, actividad, ahora: Date.now() },
      { headers: { 'Cache-Control': 'private, no-store' } },
    )
  } catch {
    return error('No se pudo cargar la ronda. Probá de nuevo.', 503)
  }
}

export async function POST(req: Request) {
  const cerrado = await sinAcceso(req)
  if (cerrado) return cerrado

  const sesion = sesionDe(req)
  if (!sesion) return error('Primero cargá tus datos para entrar a la ronda.', 401)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return error('Datos inválidos.')
  }
  const ciudad = body.ciudad
  const motivo = leerMotivo(body.oportunidad)
  if ('error' in motivo) return error(motivo.error)
  const oportunidad = motivo.motivo
  const sala = salaDe(req)
  const ciudades = ciudadesDe(sala)
  if (!esCiudadRonda(ciudad, ciudades)) return error(`Elegí si la propiedad está en ${ciudades.join(' o en ')}.`)

  // Se publica solo pegando el link (David, 14-oct-2026): no hay carga a mano.
  if (body.manual !== undefined) return error(ENLACE_NO_SIRVE)
  const url = String(body.url ?? '').trim().slice(0, 600)
  if (!origenDeLink(url)) return error(ENLACE_NO_SIRVE)

  try {
    const inmobiliaria = await inmobiliariaPorId(sesion.iid)
    if (!inmobiliaria) return error('Tu inmobiliaria ya no está en la lista. Volvé a cargar tus datos.', 401)
    if (sala && !inmobiliariaDeSala(sala, inmobiliaria.nombre)) return error(fueraDeSala(sala), 403, { fueraDeSala: true })

    await limpiarVencidas(sala)
    const grilla = await listarPublicaciones(true, sala)
    const reemplaza = typeof body.reemplaza === 'string' ? body.reemplaza.slice(0, 24) : null
    const traba = chequeoAlPublicar(grilla, { agenteId: sesion.aid, inmobiliariaId: sesion.iid }, { url, reemplaza }, Date.now(), sala?.maxCaptacionesPorAgente ?? null)
    if (traba) return error(traba.error, traba.status, traba.limite ? { limite: true } : {})
    const clave = claveDeUrl(url)

    let aviso = await lecturaGuardada<AvisoRonda>(clave)
    if (!aviso) {
      aviso = await leerAviso(url)
      await guardarLectura(clave, aviso)
    }
    if (aviso.fotos.length === 0) return error('Hace falta al menos una foto para publicar.', 422)
    // La copia de Zonaprop puede tener un precio viejo: quien publica lo corrige.
    if (aviso.origen === 'zonaprop' && body.precio !== undefined) aviso = { ...aviso, precio: leerPrecio(body.precio) }

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
      direccion: direccionVisible(aviso.direccion, ciudad, barrio),
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
      detalle: ficha.detalle,
    }
    await guardarPublicacion(publicacion, sala)
    // Reemplazo: la nueva ya está; la vieja sale (y su lugar queda para la nueva, que arranca de cero).
    if (reemplaza) await borrarPublicacion(reemplaza, sala)
    return NextResponse.json({ publicacion, reemplazada: reemplaza }, { status: 201 })
  } catch (e) {
    if (e instanceof AvisoSinLectura) return error(e.message, 422, { aMano: true })
    console.error('[ronda] publicar', e)
    return error(e instanceof Error && e.message ? e.message : 'No se pudo publicar. Probá de nuevo.', 422)
  }
}
