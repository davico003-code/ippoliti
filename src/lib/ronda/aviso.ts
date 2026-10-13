// Ronda Funes Roldán — del link que pega el colega a la propiedad de la grilla.
//
// Lee el aviso (la ficha pública de Tokko, un aviso de Zonaprop o una propiedad
// de siinmobiliaria.com; lo demás se carga a mano) y, al publicar, arma su ficha neutra de verficha.casa con
// el MISMO armador que el resto de las fichas (crearFicha / crearFichaExterna).
// Nunca inventa: si el aviso no se puede leer, tira un Error con el motivo.

import { buildSnapshotFromTokko, crearFicha, crearFichaExterna } from '@/lib/ficha'
import { rehostFotos } from '@/lib/rehost-fotos'
import { getPropertyById } from '@/lib/tokko'
import { copiaDeZonaprop, type CopiaZonaprop } from './almacen'
import { leerAvisoExterno } from './aviso-externo'
import {
  barrioVisible,
  descripcionNeutra,
  detectarCiudad,
  etiquetaTipo,
  grupoDeTipo,
  idDeZonaprop,
  origenDeLink,
  textoOperacion,
  tituloRonda,
  type CiudadRonda,
  type DatosManual,
  type GrupoTipo,
} from './reglas'
import { avisoZonapropPorBusqueda, fotosDePosting, numeroDePosting, precioDePosting, ubicacionDePosting, type PostingZonaprop } from './zonaprop-busqueda'

const MAX_FOTOS = 20

export const ENLACE_NO_SIRVE = 'Ese enlace no se puede leer solo. Pegá la ficha de Tokko o cargá la propiedad a mano.'

/** El aviso no se puede convertir solo: la pantalla pasa a la carga a mano. */
export class AvisoSinLectura extends Error {}

export interface AvisoRonda {
  origen: 'tokko' | 'web' | 'zonaprop' | 'manual'
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
 *  3. si no hay nada, la pantalla pasa a la carga a mano.
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
    descripcion: copia?.descripcion || (p.descriptionNormalized ?? '').trim() || null,
    direccion: p.postingLocation?.address?.name ?? null,
    tags: [],
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
    descripcion: c.descripcion || null,
    direccion: null,
    tags: [],
    leidoEl: c.leido,
    anunciante: c.anunciante,
  }
}

async function leerFichaTokko(url: string): Promise<AvisoRonda> {
  const a = await leerAvisoExterno(url)
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
    direccion: a.direccion,
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

/** Lo que el colega cargó a mano, con la forma de un aviso leído. */
export function avisoManual(d: DatosManual): AvisoRonda {
  const grupo = grupoDeTipo(d.tipo)
  return {
    origen: 'manual',
    url: d.enlace ?? '',
    tipo: d.tipo,
    grupo,
    operacion: d.operacion,
    ciudad: null,
    barrio: d.barrio,
    precio: d.precio,
    moneda: d.moneda,
    m2: d.m2,
    m2Cubiertos: grupo === 'Lote' ? null : d.m2,
    m2Terreno: grupo === 'Lote' ? d.m2 : null,
    ambientes: null,
    dormitorios: d.dormitorios,
    banos: d.banos,
    cocheras: null,
    fotos: d.fotos,
    descripcion: d.descripcion || null,
    direccion: null,
    tags: [],
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
): Promise<{ url: string; foto: string | null; fotos: number }> {
  const { ciudad, marcas, ip, userAgent } = opciones

  if (aviso.origen === 'web' && aviso.propertyId) {
    const { url, ficha } = await crearFicha({ propertyId: aviso.propertyId, ip, userAgent })
    return { url, foto: ficha.snapshot.fotos[0] ?? null, fotos: ficha.snapshot.fotos.length }
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
      caracteristicas: aviso.tags,
    },
    sourceUrl: aviso.url,
    ip,
    userAgent,
  })
  return { url, foto: snapshot.fotos[0] ?? null, fotos: snapshot.fotos.length }
}
