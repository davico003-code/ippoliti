// Lo que la página de selección muestra de cada propiedad, armado en el server:
// título, ubicación, specs, precio, TODAS las fotos y la ficha para abrir adentro
// de la página. Antes lo pedía el navegador después de cargar (con corte a los
// 5 s) y el cliente veía tarjetas grises hasta que llegaba.
//
// Las de colegas (Red Propia / MELI) llegan desde HILO con su ficha neutra ya
// armada (verficha): de ahí salen TODAS sus fotos y datos, no solo la portada.
//
// También el motor de "parecidas": cuando al cliente no le cierra ninguna, le
// ofrecemos otras nuestras (mismo criterio que "Propiedades similares" de la
// ficha) y de la red En red de HILO (Red Propia + MELI, las más vistas
// primero), intercaladas.

import {
  generatePropertySlug,
  getAllPhotos,
  getMainPhoto,
  getProperties,
  getPropertyById,
  mostrarPrecio,
  operacionPrincipal,
  sanitizeProperty,
  tituloVisible,
  type TokkoOperation,
  type TokkoProperty,
} from './tokko'
import { applyPropertySeoOverride } from './seoOverrides'
import { formatDireccionCompleta } from './ubicacion'
import { geocodeZona } from './geocode'
import { haversineDistance } from './geo'
import { parsePropertyLabel, type SeleccionItem } from './seleccion'
import type { SeleccionProperty } from './redis'
import { getFicha, type Ficha } from './ficha'
import { pedirAHilo, redIdDe } from './seleccion-red'

/** Propiedad tal como está guardada en `seleccion:{token}`. */
export interface SelProp {
  id: string
  url: string
  note?: string
  source?: 'externa'
  origen?: 'sugerida'
  snapshot?: {
    title?: string
    image?: string | null
    location?: string
    price?: string | null
    rooms?: number
    baths?: number
    area?: number
    lat?: number | null
    lng?: number | null
  }
}

const MAX_FOTOS = 15

/**
 * ID de la propiedad propia en el feed. HILO guarda `id` = tokko_id; el panel
 * web guarda la URL de la ficha. Los IDs nativos de HILO tienen 9 dígitos
 * (900000594): el regex viejo (\d{6,8}) los cortaba y traía otra propiedad.
 */
export function idPropio(p: Pick<SelProp, 'id' | 'url' | 'source'>): number | null {
  if (p.source === 'externa') return null
  if (/^\d{5,16}$/.test(p.id)) return Number(p.id)
  const m = /\/propiedad(?:es)?\/(\d{5,16})(?:[-/?#]|$)/.exec(p.url)
  if (m) return Number(m[1])
  try {
    if (new URL(p.url).hostname.toLowerCase().endsWith('siinmobiliaria.com')) {
      const n = /(\d{6,12})/.exec(p.url)
      if (n) return Number(n[1])
    }
  } catch {
    // URL inválida: no es propia
  }
  return null
}

/** Slug de la ficha neutra (verficha.casa/<slug> o /v/<slug>). Los avisos de portales no tienen. */
export function slugVerficha(url: string): string | null {
  try {
    const u = new URL(url, 'https://siinmobiliaria.com')
    const partes = u.pathname.split('/').filter(Boolean)
    if (u.hostname.toLowerCase().includes('verficha.casa')) return partes[0] ?? null
    if (partes[0] === 'v' && partes[1]) return partes[1]
    return null
  } catch {
    return null
  }
}

/** La ficha neutra para abrir ADENTRO de la selección (sin barra ni compartir). */
export const fichaNeutraEmbebida = (slug: string) => `/v/${slug}?embed=1`

const PORTALES = /(^|\.)(zonaprop|argenprop|mercadolibre)\.com/i

/**
 * De otra inmobiliaria: las de la Red de HILO (`red:propia:…` / `red:meli:…`)
 * y los avisos de portales pegados a mano. Van con "En red", nunca como
 * nuestras (David: "es muy chanta", después la visita se coordina con el colega).
 */
function esDeRed(p: Pick<SelProp, 'id' | 'url'>): boolean {
  if (p.id.startsWith('red:')) return true
  try {
    return PORTALES.test(new URL(p.url).hostname)
  } catch {
    return false
  }
}

function itemDePropiedad(d: TokkoProperty, base: SelProp, sugerida: boolean): SeleccionItem {
  const portada = getMainPhoto(d)
  const fotos = getAllPhotos(d)
  const photos = portada ? [portada, ...fotos.filter((f) => f !== portada)] : fotos
  return {
    id: base.id,
    url: base.url,
    note: base.note ?? '',
    externa: false,
    sugerida,
    title: tituloVisible(d) || d.address || parsePropertyLabel(base.url),
    location: formatDireccionCompleta(d, d.fake_address || d.address, ' | '),
    rooms: d.suite_amount || d.room_amount || 0,
    baths: d.bathroom_amount || 0,
    area: parseFloat(d.roofed_surface || d.total_surface || d.surface || '0') || 0,
    price: mostrarPrecio(d) ?? 'Consultar precio',
    photos: photos.slice(0, MAX_FOTOS),
    fichaUrl: `/seleccion/ficha/${generatePropertySlug(d)}`,
    enRed: false,
    masVista: false,
    redId: null,
  }
}

function itemDeSnapshot(p: SelProp): SeleccionItem {
  const s = p.snapshot ?? {}
  return {
    id: p.id,
    url: p.url,
    note: p.note ?? '',
    externa: p.source === 'externa',
    sugerida: p.origen === 'sugerida',
    title: s.title?.trim() || parsePropertyLabel(p.url),
    location: s.location ?? '',
    rooms: s.rooms ?? 0,
    baths: s.baths ?? 0,
    area: s.area ?? 0,
    price: precioVisible(s.price) ?? (p.source === 'externa' ? 'Consultar precio' : null),
    photos: s.image ? [s.image] : [],
    fichaUrl: (() => { const slug = slugVerficha(p.url); return slug ? fichaNeutraEmbebida(slug) : null })(),
    enRed: esDeRed(p),
    masVista: false,
    redId: null,
  }
}

/** "Consultar" (sin precio publicado) se muestra como en la web: "Consultar precio". */
const precioVisible = (p: string | null | undefined) => (p && !/^consultar/i.test(p.trim()) ? p : null)

/**
 * Una de colega con su ficha neutra: TODAS las fotos y los datos de la ficha
 * (antes la selección mostraba solo la portada que guarda HILO).
 */
function itemDeFicha(p: SelProp, ficha: Ficha): SeleccionItem {
  const s = ficha.snapshot
  const base = itemDeSnapshot(p)
  const fotos = (s.fotos ?? []).filter((f) => typeof f === 'string' && f.startsWith('https://'))
  return {
    ...base,
    title: p.snapshot?.title?.trim() || s.tituloGenerico || base.title,
    location: s.zonaCompleta || s.zonaAprox || base.location,
    rooms: s.dormitorios ?? base.rooms,
    baths: s.banos ?? base.baths,
    area: Math.round(s.m2cubiertos ?? s.m2totales ?? s.m2terreno ?? base.area) || 0,
    price: precioVisible(s.precio) ?? precioVisible(base.price) ?? 'Consultar precio',
    photos: fotos.length > 0 ? fotos.slice(0, MAX_FOTOS) : base.photos,
    fichaUrl: fichaNeutraEmbebida(ficha.slug),
  }
}

/** Selecciones viejas con un link sin snapshot: título y foto del og (cacheado 24 h). */
async function previewDeLink(url: string): Promise<{ title: string | null; image: string | null }> {
  try {
    const res = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`, {
      signal: AbortSignal.timeout(2500),
      next: { revalidate: 86400 },
    })
    const data = await res.json()
    if (data.status !== 'success') return { title: null, image: null }
    return { title: data.data?.title ?? null, image: data.data?.image?.url ?? null }
  } catch {
    return { title: null, image: null }
  }
}

/** Todas las propiedades de la selección listas para mostrar, en su orden. */
export async function armarItems(props: SelProp[]): Promise<SeleccionItem[]> {
  const items = await Promise.all(
    props.map(async (p): Promise<SeleccionItem | null> => {
      const id = idPropio(p)
      if (id != null) {
        try {
          const d = applyPropertySeoOverride(sanitizeProperty(await getPropertyById(id)))
          return itemDePropiedad(d, p, p.origen === 'sugerida')
        } catch (e) {
          // Despublicada (el feed responde 404): no se la mostramos al cliente.
          if (e instanceof Error && e.message.includes('not found')) return null
          // El feed falló: lo que haya guardado, mejor que nada.
        }
      }
      const slug = slugVerficha(p.url)
      if (slug) {
        const ficha = await getFicha(slug).catch(() => null)
        // Revocada porque se vendió o el colega la bajó: no se la mostramos.
        if (ficha?.revokedAt) return null
        if (ficha) return itemDeFicha(p, ficha)
      }
      if (!p.snapshot && !p.source) {
        const og = await previewDeLink(p.url)
        return { ...itemDeSnapshot(p), title: og.title || parsePropertyLabel(p.url), photos: og.image ? [og.image] : [] }
      }
      return itemDeSnapshot(p)
    }),
  )
  return items.filter((x): x is SeleccionItem => x != null)
}

/** Ítem de una parecida que el cliente marcó, para guardarla en la selección. */
export async function propiedadSugerida(id: number): Promise<SeleccionProperty | null> {
  try {
    const d = applyPropertySeoOverride(sanitizeProperty(await getPropertyById(id)))
    const item = itemDePropiedad(d, { id: String(d.id), url: `https://siinmobiliaria.com/propiedad/${d.id}` }, true)
    return {
      id: item.id,
      url: item.url,
      note: '',
      origen: 'sugerida',
      // HILO arma el aviso al asesor con snapshot.title: sin esto le llegaría la URL.
      snapshot: {
        title: item.title,
        image: item.photos[0] ?? null,
        location: item.location,
        price: item.price,
        rooms: item.rooms,
        baths: item.baths,
        area: item.area,
      },
    }
  } catch {
    return null
  }
}

/* ── Parecidas ── */

const TIPO_POR_PALABRA: [RegExp, number][] = [
  [/\bcasa quinta\b|\bquinta\b/i, 4],
  [/\bdepartamento\b|\bdepto\b|\bmonoambiente\b/i, 2],
  [/\bph\b/i, 13],
  [/\bterreno\b|\blote\b/i, 1],
  [/\bcasa\b|\bchalet\b|\bd[uú]plex\b/i, 3],
  [/\blocal\b/i, 7],
  [/\boficina\b/i, 5],
  [/\bgalp[oó]n\b/i, 12],
  [/\bcochera\b/i, 10],
]

// Galpón viene con dos ids de Tokko (ver TYPE_FILTER_GROUPS).
const mismoTipo = (a: number, b: number) => a === b || (a === 12 && b === 24) || (a === 24 && b === 12)

function tipoDeTitulo(titulo: string): number | null {
  for (const [re, id] of TIPO_POR_PALABRA) if (re.test(titulo)) return id
  return null
}

function precioDeTexto(texto: string | null | undefined): { monto: number; moneda: string } | null {
  const m = /(USD|U\$S|US\$|ARS|\$)\s*([\d.,]+)/i.exec(texto ?? '')
  if (!m) return null
  const monto = Number(m[2].replace(/[.,](?=\d{3}(\D|$))/g, '').replace(',', '.'))
  if (!Number.isFinite(monto) || monto <= 0) return null
  const moneda = /^(usd|u\$s|us\$)$/i.test(m[1]) ? 'USD' : 'ARS'
  return { monto, moneda }
}

const mediana = (xs: number[]): number | null => {
  if (xs.length === 0) return null
  const s = [...xs].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

type Coord = { lat: number; lng: number }

function coordsDe(d: Pick<TokkoProperty, 'geo_lat' | 'geo_long'>): Coord | null {
  const lat = d.geo_lat ? parseFloat(d.geo_lat) : NaN
  const lng = d.geo_long ? parseFloat(d.geo_long) : NaN
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null
}

/**
 * Parecidas a la selección, para el cliente al que no le cerró ninguna (o que
 * quiere ver más). Perfil: lo que le gustó; si no le gustó nada, toda la
 * selección (describe lo que busca aunque esas puntuales no le cerraran).
 * Filtros duros: operación, tipo y precio dentro de 0,5–1,6 de la mediana.
 * Puntaje: precio, dormitorios y cercanía (igual que /api/propiedades/similar).
 */
export async function similaresDeSeleccion(
  props: SelProp[],
  reacciones: Record<string, { liked?: boolean | null } | undefined>,
  excluir: Set<string>,
  limit: number,
): Promise<SeleccionItem[]> {
  const todas = ((await getProperties()).objects ?? []).map(sanitizeProperty)
  const porId = new Map(todas.map((d) => [d.id, d]))

  const gustaron = props.filter((p) => reacciones[p.id]?.liked === true)
  const base = gustaron.length > 0 ? gustaron : props

  const ops = new Set<TokkoOperation['operation_type']>()
  const tipos = new Set<number>()
  const precios: { monto: number; moneda: string }[] = []
  const dorms: number[] = []
  const coords: Coord[] = []

  for (const p of base) {
    const id = idPropio(p)
    const d = id != null ? porId.get(id) : undefined
    if (d) {
      const op = operacionPrincipal(d)
      if (op) ops.add(op.operation_type)
      if (d.type?.id != null) tipos.add(d.type.id)
      const pr = op?.prices?.find((x) => x.price > 0)
      if (pr) precios.push({ monto: pr.price, moneda: pr.currency })
      const dm = d.suite_amount || d.room_amount || 0
      if (dm > 0) dorms.push(dm)
      const c = coordsDe(d)
      if (c) coords.push(c)
      continue
    }
    const s = p.snapshot
    if (!s) continue
    const tipo = tipoDeTitulo(s.title ?? '')
    if (tipo != null) tipos.add(tipo)
    const pr = precioDeTexto(s.price)
    if (pr) {
      precios.push(pr)
      ops.add(pr.moneda === 'USD' ? 'Sale' : 'Rent')
    }
    if (s.rooms) dorms.push(s.rooms)
    const c = s.lat != null && s.lng != null ? { lat: s.lat, lng: s.lng } : await geocodeZona(s.location)
    if (c) coords.push(c)
  }
  if (ops.size === 0) ops.add('Sale')

  // Precio de referencia en la moneda que más aparece.
  const conteo = new Map<string, number>()
  for (const p of precios) conteo.set(p.moneda, (conteo.get(p.moneda) ?? 0) + 1)
  const moneda = Array.from(conteo.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
  const precioRef = mediana(precios.filter((p) => p.moneda === moneda).map((p) => p.monto))
  const dormRef = mediana(dorms)

  const enSeleccion = new Set(props.map((p) => idPropio(p)).filter((x): x is number => x != null))

  const puntuadas: { d: TokkoProperty; score: number }[] = []
  for (const d of todas) {
    if (enSeleccion.has(d.id) || excluir.has(String(d.id))) continue
    if (!d.photos?.some((f) => !f.is_blueprint)) continue
    const op = (d.operations ?? []).find((o) => ops.has(o.operation_type))
    if (!op) continue
    if (tipos.size > 0 && !(d.type?.id != null && Array.from(tipos).some((t) => mismoTipo(t, d.type.id!)))) continue

    let score = 0
    const pr = op.prices?.find((x) => x.currency === moneda && x.price > 0)
    if (precioRef && pr) {
      const ratio = pr.price / precioRef
      if (ratio < 0.5 || ratio > 1.6) continue
      score += ratio >= 0.75 && ratio <= 1.3 ? 3 : 1
    }

    const dm = d.suite_amount || d.room_amount || 0
    if (dormRef && dm > 0) {
      const dif = Math.abs(dm - dormRef)
      if (dif < 1) score += 2
      else if (dif <= 1) score += 1
    }

    const c = coordsDe(d)
    if (coords.length > 0 && c) {
      const km = Math.min(...coords.map((o) => haversineDistance(o.lat, o.lng, c.lat, c.lng)))
      if (km > 40) continue
      if (km < 2) score += 4
      else if (km < 5) score += 2
      else if (km < 15) score += 1
    }

    if (score >= 2) puntuadas.push({ d, score })
  }

  return puntuadas
    .sort((a, b) => b.score - a.score || b.d.id - a.d.id)
    .slice(0, limit)
    .map(({ d }) =>
      itemDePropiedad(
        applyPropertySeoOverride(d),
        { id: String(d.id), url: `https://siinmobiliaria.com/propiedad/${d.id}` },
        true,
      ),
    )
}

/* ── Parecidas En red (Red Propia + MELI, las elige HILO) ── */

/** Lo que HILO manda de cada una (/api/public/en-red). Sin dirección, inmobiliaria ni descripción. */
type TarjetaEnRed = {
  /** `propia:455077` / `meli:MLA…` */
  id: string
  titulo: string
  precio: string
  precioUsd: number
  tipo: string
  dormitorios: number | null
  banos: number | null
  m2Total: number | null
  m2Cubiertos: number | null
  zona: string | null
  fotos: string[]
  masVista: boolean
}

/**
 * Las de colegas parecidas a UNA nuestra: mismo tipo, precio 0,7–1,35, mismo
 * barrio o a menos de 2,5 km, sin repetidas, las más vistas primero (el mismo
 * motor del feed "En red" de la ficha). Servidor a servidor con el secreto de
 * HILO; 15 min de cache. Si HILO no responde, simplemente no hay En red.
 */
async function enRedDe(idPublico: number): Promise<TarjetaEnRed[]> {
  const secret = process.env.HILO_INGEST_SECRET
  if (!secret) return []
  const base = process.env.HILO_LEADS_URL || 'https://meethilo.com'
  try {
    const res = await fetch(`${base}/api/public/en-red?id=${idPublico}`, {
      headers: { 'x-hilo-ingest-secret': secret },
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return []
    const data = (await res.json()) as { tarjetas?: TarjetaEnRed[] }
    return Array.isArray(data.tarjetas) ? data.tarjetas.filter((t) => t?.id && t.fotos?.length) : []
  } catch {
    return []
  }
}

function itemDeTarjetaRed(t: TarjetaEnRed): SeleccionItem {
  return {
    // Mismo id que usa HILO al sumarla al link de seguimiento: la reacción y la
    // propiedad quedan atadas.
    id: `red:${t.id}`,
    url: '',
    note: '',
    externa: true,
    sugerida: true,
    title: t.titulo,
    location: t.zona ?? '',
    rooms: t.dormitorios ?? 0,
    baths: t.banos ?? 0,
    area: Math.round(t.m2Cubiertos ?? t.m2Total ?? 0),
    price: t.precio || null,
    photos: t.fotos.slice(0, MAX_FOTOS),
    fichaUrl: null,
    enRed: true,
    masVista: !!t.masVista,
    redId: t.id,
  }
}

/** Las En red parecidas a una de la RED que está en la selección (la referencia la arma HILO). */
async function enRedDesdeRed(token: string, redId: string): Promise<TarjetaEnRed[]> {
  const r = await pedirAHilo(token, redId, 'parecidas')
  if (!r.ok || !Array.isArray(r.tarjetas)) return []
  return (r.tarjetas as TarjetaEnRed[]).filter((t) => t?.id && t.fotos?.length)
}

async function parecidasEnRed(
  token: string,
  props: SelProp[],
  reacciones: Record<string, { liked?: boolean | null } | undefined>,
  excluir: Set<string>,
  limit: number,
): Promise<SeleccionItem[]> {
  // Referencias: lo que le gustó; si no le gustó nada, toda la selección.
  // Una nuestra pide por su id; una de la red, por su aviso. Hasta 3.
  const gustaron = props.filter((p) => reacciones[p.id]?.liked === true)
  const pedidos: Promise<TarjetaEnRed[]>[] = []
  const usadas = new Set<string>()
  for (const p of gustaron.length > 0 ? gustaron : props) {
    if (pedidos.length >= 3) break
    const propio = idPropio(p)
    const red = propio == null ? redIdDe(p.id) : null
    const clave = propio != null ? `n:${propio}` : red
    if (!clave || usadas.has(clave)) continue
    usadas.add(clave)
    pedidos.push(propio != null ? enRedDe(propio) : enRedDesdeRed(token, red!))
  }
  if (pedidos.length === 0) return []
  const listas = await Promise.all(pedidos)

  const enSeleccion = new Set(props.map((p) => p.id))
  const vistas = new Set<string>()
  const salida: SeleccionItem[] = []
  // De a una por referencia, así todas aportan.
  for (let i = 0; i < 8; i++) {
    for (const lista of listas) {
      const t = lista[i]
      if (!t) continue
      const id = `red:${t.id}`
      if (vistas.has(id) || enSeleccion.has(id) || excluir.has(id)) continue
      vistas.add(id)
      salida.push(itemDeTarjetaRed(t))
    }
  }
  // David: "que la persona tenga las casas más vistas" → las más vistas adelante.
  return salida.sort((a, b) => Number(b.masVista) - Number(a.masVista)).slice(0, limit)
}

/** Nuestras y En red intercaladas (nuestra, En red, nuestra…). */
export async function parecidasDeSeleccion(
  token: string,
  props: SelProp[],
  reacciones: Record<string, { liked?: boolean | null } | undefined>,
  excluir: Set<string>,
  limit: number,
): Promise<SeleccionItem[]> {
  const [propias, red] = await Promise.all([
    similaresDeSeleccion(props, reacciones, excluir, limit).catch(() => [] as SeleccionItem[]),
    parecidasEnRed(token, props, reacciones, excluir, limit).catch(() => [] as SeleccionItem[]),
  ])
  const salida: SeleccionItem[] = []
  for (let i = 0; i < limit && salida.length < limit; i++) {
    if (propias[i]) salida.push(propias[i])
    if (red[i] && salida.length < limit) salida.push(red[i])
  }
  return salida
}
