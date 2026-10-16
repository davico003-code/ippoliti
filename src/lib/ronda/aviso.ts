// Ronda Funes Roldán — del link que pega el colega a la propiedad de la grilla.
//
// Lee el aviso (la ficha pública de Tokko, un aviso de Zonaprop o una propiedad
// de siinmobiliaria.com; no hay carga a mano) y, al publicar, arma su ficha neutra de verficha.casa con
// el MISMO armador que el resto de las fichas (crearFicha / crearFichaExterna).
// Nunca inventa: si el aviso no se puede leer, tira un Error con el motivo.

import { buildSnapshotFromTokko, crearFicha, crearFichaExterna, getFicha, type FichaSnapshot } from '@/lib/ficha'
import { rehostFotos } from '@/lib/rehost-fotos'
import { getPropertyById } from '@/lib/tokko'
import { copiaDeZonaprop, guardarPublicacion, type CopiaZonaprop } from './almacen'
import { leerAvisoExterno } from './aviso-externo'
import {
  barrioVisible,
  comodidadesDe,
  descripcionNeutra,
  direccionVisible,
  textoDeZonaprop,
  detectarCiudad,
  etiquetaTipo,
  grupoDeTipo,
  idDeZonaprop,
  origenDeLink,
  textoOperacion,
  tituloRonda,
  type CiudadRonda,
  type DetallePublicacion,
  type GrupoTipo,
  type Publicacion,
} from './reglas'
import { avisoZonapropPorBusqueda, fotosDePosting, numeroDePosting, precioDePosting, ubicacionDePosting, type PostingZonaprop } from './zonaprop-busqueda'

const MAX_FOTOS = 20

export const ENLACE_NO_SIRVE = 'Ese enlace no se puede leer. Pegá el aviso de Zonaprop o la ficha de Tokko.'

/**
 * El aviso no se puede convertir solo: la pantalla pide otro enlace. `motivo`
 * separa "Zonaprop no respondió" (falla nuestra o de ellos) de "ya no está
 * publicado" (el link es viejo) para el vigía (salud.ts).
 */
export class AvisoSinLectura extends Error {
  constructor(
    message: string,
    readonly motivo: 'caida' | 'no-figura' | 'otro' = 'otro',
  ) {
    super(message)
  }
}

export interface AvisoRonda {
  origen: 'tokko' | 'web' | 'zonaprop'
  url: string
  tipo: string
  grupo: GrupoTipo
  operacion: string
  /** La que nombra el aviso; si no nombra ninguna de las dos, la elige quien publica. */
  ciudad: CiudadRonda | null
  barrio: string | null
  precio: number | null
  moneda: 'USD' | 'ARS'
  /** La superficie que se muestra: terreno en un lote, total (o cubierta) en lo demás. */
  m2: number | null
  m2Cubiertos: number | null
  m2Terreno: number | null
  ambientes: number | null
  dormitorios: number | null
  banos: number | null
  cocheras: number | null
  fotos: string[]
  descripcion: string | null
  /** Solo para limpiar la descripción: nunca va a la ficha. */
  direccion: string | null
  tags: string[]
  /** Propiedad de siinmobiliaria.com: su número. */
  propertyId?: number
  /** Copia guardada (Zonaprop): cuándo se leyó y quién lo publica (solo para limpiar la descripción). */
  leidoEl?: string
  anunciante?: string | null
}

const entero = (n: number | null | undefined) => (typeof n === 'number' && Number.isFinite(n) && n > 0 ? Math.round(n) : null)

export async function leerAviso(url: string): Promise<AvisoRonda> {
  const origen = origenDeLink(url)
  if (!origen) throw new Error(ENLACE_NO_SIRVE)
  if (origen === 'web') return leerDeLaWeb(url)
  if (origen === 'zonaprop') return leerDeZonaprop(url)
  return leerFichaTokko(url)
}

/**
 * Zonaprop, en este orden (igual que "Cargar para compartir" de Hilo):
 *  1. el aviso EN EL MOMENTO, por la búsqueda por número (precio y estado de
 *     hoy, 8 fotos), completado con la copia guardada si la hay (todas las
 *     fotos y la descripción con sus renglones);
 *  2. si hoy no figura publicado o Zonaprop no respondió, la copia sola: dice
 *     de cuándo es y deja corregir el precio;
 *  3. si no hay nada, la pantalla pide otro enlace (se publica SOLO con link).
 * En las casas de Zonaprop la "superficie total" es el lote; la cubierta, lo construido.
 */
async function leerDeZonaprop(url: string): Promise<AvisoRonda> {
  const id = idDeZonaprop(url)
  if (!id) throw new AvisoSinLectura('Ese enlace no es de un aviso de Zonaprop.')
  const [busqueda, copia] = await Promise.all([avisoZonapropPorBusqueda(id), copiaDeZonaprop(id).catch(() => null)])
  if (busqueda.posting) return avisoDePosting(url, busqueda.posting, copia)
  if (copia) return avisoDeCopia(url, copia)
  throw new AvisoSinLectura(
    busqueda.caida ? 'Zonaprop no respondió en este momento.' : 'Ese aviso ya no figura publicado en Zonaprop.',
    busqueda.caida ? 'caida' : 'no-figura',
  )
}

function avisoDePosting(url: string, p: PostingZonaprop, copia: CopiaZonaprop | null): AvisoRonda {
  const { operacion, precio, moneda } = precioDePosting(p)
  const { ciudad, barrio } = ubicacionDePosting(p)
  const tipo = etiquetaTipo(p.realEstateType?.name ?? '')
  const grupo = grupoDeTipo(tipo)
  const cubierta = numeroDePosting(p, /cubierta/i)
  const total = numeroDePosting(p, /superficie total/i)
  const deHoy = fotosDePosting(p)
  return {
    origen: 'zonaprop',
    url,
    tipo,
    grupo,
    operacion: textoOperacion(operacion),
    ciudad: detectarCiudad(ciudad) ?? detectarCiudad(barrio, p.title),
    barrio,
    precio,
    moneda,
    m2: grupo === 'Lote' ? (total ?? cubierta) : (cubierta ?? total),
    m2Cubiertos: grupo === 'Lote' ? null : cubierta,
    m2Terreno: total,
    ambientes: numeroDePosting(p, /^ambiente/i),
    dormitorios: numeroDePosting(p, /^dormitorio/i),
    banos: numeroDePosting(p, /^baño/i),
    cocheras: numeroDePosting(p, /^cochera/i),
    // La copia trae TODAS las fotos; la búsqueda, las primeras 8.
    fotos: (copia && copia.fotos.length > deHoy.length ? copia.fotos : deHoy).slice(0, MAX_FOTOS),
    descripcion: textoDeZonaprop(copia?.descripcion || p.descriptionNormalized).trim() || null,
    direccion: p.postingLocation?.address?.name ?? null,
    tags: comodidadesDe(copia?.caracteristicas),
    anunciante: p.publisher?.name ?? copia?.anunciante ?? null,
  }
}

function avisoDeCopia(url: string, c: CopiaZonaprop): AvisoRonda {
  const tipo = etiquetaTipo(c.tipo)
  const grupo = grupoDeTipo(tipo)
  const cubierta = entero(c.supCub)
  const total = entero(c.supTotal)
  return {
    origen: 'zonaprop',
    url,
    tipo,
    grupo,
    operacion: textoOperacion(c.operacion),
    ciudad: detectarCiudad(c.localidad),
    barrio: c.barrio,
    precio: c.precio,
    moneda: c.moneda,
    m2: grupo === 'Lote' ? (total ?? cubierta) : (cubierta ?? total),
    m2Cubiertos: grupo === 'Lote' ? null : cubierta,
    m2Terreno: total,
    ambientes: c.ambientes,
    dormitorios: c.dormitorios,
    banos: c.banos,
    cocheras: c.cocheras,
    fotos: c.fotos.slice(0, MAX_FOTOS),
    descripcion: textoDeZonaprop(c.descripcion).trim() || null,
    direccion: null,
    tags: comodidadesDe(c.caracteristicas),
    leidoEl: c.leido,
    anunciante: c.anunciante,
  }
}

async function leerFichaTokko(url: string): Promise<AvisoRonda> {
  let a: Awaited<ReturnType<typeof leerAvisoExterno>>
  try {
    a = await leerAvisoExterno(url)
  } catch (e) {
    // Para el vigía: un link mal copiado o dado de baja no es una falla de la
    // Ronda. Tokko contesta 500 (no 404) a una ficha que no existe, así que todo
    // error HTTP cuenta como link viejo; la caída real de Tokko la ve la sonda
    // diaria con fichas que andan (salud.ts). Que no responda (0), sí es caída.
    const status = (e as { status?: number }).status
    const vieja = (status !== undefined && status >= 400) || /no trae la propiedad/.test((e as Error).message)
    throw new AvisoSinLectura((e as Error).message, vieja ? 'no-figura' : status === undefined ? 'otro' : 'caida')
  }
  const tipo = etiquetaTipo(a.property_type)
  const grupo = grupoDeTipo(tipo)
  const ciudad = detectarCiudad(a.ciudad, a.barrio)
  const m2Cubiertos = entero(a.m2Cubiertos)
  const m2Terreno = entero(a.m2Terreno)
  const m2Total = entero(a.m2Total)
  return {
    origen: 'tokko',
    url,
    tipo,
    grupo,
    operacion: textoOperacion(a.operacion),
    ciudad,
    barrio: a.barrio,
    precio: a.precio,
    moneda: a.moneda,
    m2: grupo === 'Lote' ? (m2Terreno ?? m2Total) : (m2Total ?? m2Cubiertos ?? m2Terreno),
    m2Cubiertos,
    m2Terreno,
    ambientes: a.ambientes,
    dormitorios: a.dormitorios,
    banos: a.banos,
    cocheras: a.cocheras,
    fotos: a.fotos.slice(0, MAX_FOTOS),
    descripcion: a.descripcion,
    // La real si tiene altura; si el agente puso solo el barrio ("San Marino (Funes
    // Hills)"), la pública que muestra Tokko ("Fuerza Aerea al 2300").
    direccion: /\d/.test(a.direccion ?? '') ? a.direccion : a.direccionPublica || a.direccion,
    tags: a.tags.slice(0, 24),
  }
}

async function leerDeLaWeb(url: string): Promise<AvisoRonda> {
  const id = Number(/\/propiedades\/(\d+)/.exec(new URL(url).pathname)?.[1])
  if (!Number.isFinite(id) || id <= 0) throw new Error('No encontré esa propiedad. Revisá el enlace.')
  let s: ReturnType<typeof buildSnapshotFromTokko>
  try {
    s = buildSnapshotFromTokko(await getPropertyById(id))
  } catch {
    throw new Error('Esa propiedad ya no está publicada.')
  }
  const tipo = etiquetaTipo(s.tipo)
  const grupo = grupoDeTipo(tipo)
  const zona = s.zonaCompleta || s.zonaAprox || ''
  const partes = zona.split(',').map((x) => x.trim()).filter(Boolean)
  const m2Cubiertos = entero(s.m2cubiertos)
  const m2Terreno = entero(s.m2terreno)
  const m2Total = entero(s.m2totales)
  return {
    origen: 'web',
    url,
    tipo,
    grupo,
    operacion: textoOperacion(s.operacion),
    ciudad: detectarCiudad(zona),
    barrio: partes.length > 1 ? partes[0] : null,
    precio: s.precioRaw > 0 ? s.precioRaw : null,
    moneda: s.moneda === 'ARS' ? 'ARS' : 'USD',
    m2: grupo === 'Lote' ? (m2Terreno ?? m2Total) : (m2Total ?? m2Cubiertos ?? m2Terreno),
    m2Cubiertos,
    m2Terreno,
    ambientes: s.ambientes,
    dormitorios: s.dormitorios,
    banos: s.banos,
    cocheras: s.cocheras,
    fotos: s.fotos.slice(0, MAX_FOTOS),
    descripcion: null,
    direccion: null,
    tags: [],
    propertyId: id,
  }
}

/**
 * La ficha neutra para el cliente. `marcas` = lo que no puede aparecer en la
 * descripción (inmobiliaria, matriculado, agente): quien recibe la ficha de un
 * colega no tiene que llegar al que publicó.
 */
export async function crearFichaDeAviso(
  aviso: AvisoRonda,
  opciones: { ciudad: CiudadRonda; marcas: string[]; ip: string; userAgent: string },
): Promise<{ url: string; foto: string | null; fotos: number; detalle: DetallePublicacion }> {
  const { ciudad, marcas, ip, userAgent } = opciones

  if (aviso.origen === 'web' && aviso.propertyId) {
    const { url, ficha } = await crearFicha({ propertyId: aviso.propertyId, ip, userAgent })
    return { url, foto: ficha.snapshot.fotos[0] ?? null, fotos: ficha.snapshot.fotos.length, detalle: detalleDeSnapshot(ficha.snapshot) }
  }

  // La ficha de Tokko se comparte TAL CUAL (David, 14-oct-2026): el enlace para el
  // cliente es la ficha original; no se arma ficha neutra. La Ronda solo muestra
  // sus fotos y sus datos.
  if (aviso.origen === 'tokko') {
    return {
      url: aviso.url,
      foto: aviso.fotos[0] ?? null,
      fotos: aviso.fotos.length,
      detalle: {
        fotos: aviso.fotos.slice(0, MAX_FOTOS),
        m2Cubiertos: entero(aviso.m2Cubiertos),
        m2Terreno: entero(aviso.m2Terreno),
        ambientes: entero(aviso.ambientes),
        cocheras: entero(aviso.cocheras),
        comodidades: [],
        descripcion: descripcionNeutra(aviso.descripcion, [...marcas, aviso.direccion]).slice(0, 1200),
      },
    }
  }

  const barrio = barrioVisible(aviso.barrio, ciudad)
  const mes = new Date().toISOString().slice(0, 7)
  const subidas = await rehostFotos(aviso.fotos, `ronda/${mes}/${Date.now()}`)
  // De la copia de Zonaprop solo sirven las fotos que se pudieron traer: una que
  // ya no existe en el portal dejaría un hueco en la ficha del cliente.
  const fotos = aviso.origen === 'zonaprop' ? subidas.fotos.filter((u) => !subidas.fallidas.includes(u)) : subidas.fotos
  if (fotos.length === 0) throw new AvisoSinLectura('No pudimos traer las fotos de ese aviso.')
  const { url, snapshot } = await crearFichaExterna({
    manual: {
      titulo: tituloRonda({ tipo: aviso.tipo, operacion: aviso.operacion, barrio, ciudad }),
      descripcion: descripcionNeutra(aviso.descripcion, [...marcas, aviso.direccion, aviso.anunciante]).slice(0, 5000),
      fotos,
      operacion: aviso.operacion,
      tipo: aviso.tipo,
      precioRaw: aviso.precio ?? 0,
      moneda: aviso.moneda,
      zona: [barrio, ciudad].filter(Boolean).join(', '),
      m2cubiertos: aviso.m2Cubiertos,
      m2terreno: aviso.m2Terreno,
      ambientes: aviso.ambientes,
      dormitorios: aviso.dormitorios,
      banos: aviso.banos,
      cocheras: aviso.cocheras,
      // Sin comodidades (David, 14-oct-2026): la ficha lista solo los datos (dormitorios, m²…).
      caracteristicas: [],
    },
    sourceUrl: aviso.url,
    ip,
    userAgent,
  })
  return { url, foto: snapshot.fotos[0] ?? null, fotos: snapshot.fotos.length, detalle: detalleDeSnapshot(snapshot) }
}

/** Lo que la Ronda muestra sin entrar a la ficha sale de la MISMA ficha (fotos, datos, descripción limpia). */
export function detalleDeSnapshot(s: FichaSnapshot): DetallePublicacion {
  return {
    fotos: (s.fotos || []).slice(0, MAX_FOTOS),
    m2Cubiertos: entero(s.m2cubiertos),
    m2Terreno: entero(s.m2terreno),
    ambientes: entero(s.ambientes),
    cocheras: entero(s.cocheras),
    comodidades: [],
    descripcion: String(s.descripcion || '').trim().slice(0, 1200),
  }
}

/**
 * Las publicaciones de antes del 14-oct-2026 no guardaban la galería ni los
 * datos: se completan una vez desde su ficha y quedan guardadas.
 */
export async function completarDetalles(publicaciones: Publicacion[]): Promise<Publicacion[]> {
  const faltan = publicaciones.filter((p) => !p.detalle)
  if (faltan.length === 0) return publicaciones
  const completas = await Promise.all(
    faltan.map(async (p): Promise<Publicacion | null> => {
      try {
        const ficha = await getFicha(p.ficha.split('/').pop() || '')
        if (!ficha?.snapshot) return null
        const lista = { ...p, detalle: detalleDeSnapshot(ficha.snapshot) }
        await guardarPublicacion(lista)
        return lista
      } catch {
        return null
      }
    }),
  )
  const porId = new Map<string, Publicacion>()
  for (const p of completas) if (p) porId.set(p.id, p)
  return publicaciones.map((p) => porId.get(p.id) ?? p)
}

/**
 * Las publicadas antes de guardar la dirección (16-oct-2026) la buscan UNA vez en
 * su aviso; si no la trae queda null y no se vuelve a buscar.
 */
export async function completarDirecciones(publicaciones: Publicacion[]): Promise<Publicacion[]> {
  const faltan = publicaciones.filter((p) => p.direccion === undefined && p.urlOriginal)
  if (faltan.length === 0) return publicaciones
  const completas = await Promise.all(
    faltan.map(async (p): Promise<Publicacion> => {
      let direccion: string | null = null
      try {
        direccion = direccionVisible((await leerAviso(p.urlOriginal)).direccion, p.ciudad, p.barrio)
      } catch {
        // El aviso ya no se lee (dado de baja): queda sin dirección.
      }
      const lista = { ...p, direccion }
      await guardarPublicacion(lista).catch(() => undefined)
      return lista
    }),
  )
  const porId = new Map(completas.map((p) => [p.id, p]))
  return publicaciones.map((p) => porId.get(p.id) ?? p)
}
