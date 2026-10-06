// Lo que la página de selección muestra de cada propiedad, armado en el server:
// título, ubicación, specs, precio, TODAS las fotos y la ficha para abrir adentro
// de la página. Antes lo pedía el navegador después de cargar (con corte a los
// 5 s) y el cliente veía tarjetas grises hasta que llegaba.
//
// Las de colegas (Red Propia / MELI) llegan desde HILO con su ficha neutra ya
// armada (verficha): de ahí salen TODAS sus fotos y datos, no solo la portada.
//
// Las "parecidas" (cuando no le cierra ninguna) y "Buscá con IA" las elige
// HILO (/api/public/seleccion-parecidas): banda −10/+15 sobre lo que le
// mostraron y nuestras + de colegas en un solo orden. Acá solo se arman.

import {
  generatePropertySlug,
  getAllPhotos,
  getMainPhoto,
  getProperties,
  getPropertyById,
  mostrarPrecio,
  sanitizeProperty,
  tituloVisible,
  type TokkoProperty,
} from './tokko'
import { applyPropertySeoOverride } from './seoOverrides'
import { formatDireccionCompleta } from './ubicacion'
import { parsePropertyLabel, type SeleccionItem } from './seleccion'
import type { SeleccionProperty } from './redis'
import { getFicha, type Ficha } from './ficha'
import { redIdDe } from './seleccion-red'
import type { PosicionLogo } from './feed-en-red'

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
  const slug = slugVerficha(p.url)
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
    fichaUrl: slug ? fichaNeutraEmbebida(slug) : null,
    enRed: esDeRed(p),
    masVista: false,
    // Una En red que quedó guardada sin ficha (HILO no respondió al sumarla):
    // con su id, la ficha neutra se arma al abrirla, igual que una parecida.
    redId: slug ? null : redIdDe(p.id),
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

/* ── Parecidas y "Buscá con IA" (las elige HILO) ── */

/** Lo que HILO manda de cada una de colegas. Sin inmobiliaria, teléfonos ni descripción. */
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
  /** Rincón del logo impreso del colega (MA abajo-izq, Crestale abajo-der). */
  logo?: PosicionLogo | null
}

type ItemHilo = { origen: 'nuestra'; id: number } | { origen: 'red'; tarjeta: TarjetaEnRed }

export type MotivoSinParecidas = 'no_entendi' | 'falta_tipo' | 'falta_precio' | 'falta_zona' | 'sin_referencia'

export interface ParecidasSeleccion {
  /** Con qué se buscó, en una línea ("Departamentos · 2+ dorm. · Pichincha · USD 145–190 mil"). */
  resumen: string | null
  items: SeleccionItem[]
  /** Zonas que escribió y HILO no conoce. */
  noEncontradas: string[]
  /** Por qué no hay nada que mostrar (para decirle qué tocar). */
  motivo: MotivoSinParecidas | null
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
    logo: t.logo ?? null,
  }
}

/**
 * Las parecidas a la selección (sin `texto`) o lo que buscó con IA (con
 * `texto`). HILO decide todo —la banda −10/+15 sobre lo que le mostraron
 * (David, 6-oct), nuestras y de colegas en un solo orden— y acá solo se
 * arman las tarjetas: las nuestras desde el feed (ya en cache), las de colegas
 * tal cual llegan. `excluir` = las que ya vio o descartó.
 */
export async function pedirParecidas(
  token: string,
  { texto = null, excluir = [], soloMirar = false }: { texto?: string | null; excluir?: string[]; soloMirar?: boolean } = {},
): Promise<ParecidasSeleccion> {
  const vacio: ParecidasSeleccion = { resumen: null, items: [], noEncontradas: [], motivo: null }
  const secret = process.env.HILO_INGEST_SECRET
  if (!secret) return vacio
  const base = process.env.HILO_LEADS_URL || 'https://meethilo.com'
  const res = await fetch(`${base}/api/public/seleccion-parecidas`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-hilo-ingest-secret': secret },
    // soloMirar: el asesor probando desde Hilo (?vista=asesor) no queda como búsqueda del cliente.
    body: JSON.stringify({ token, excluir, ...(texto ? { texto } : {}), ...(soloMirar ? { soloMirar: true } : {}) }),
    cache: 'no-store',
    // Con IA: Haiku + la Red Propia en vivo (HILO le pone 3 s de tope).
    signal: AbortSignal.timeout(texto ? 15_000 : 10_000),
  })
  if (res.status === 429) throw new Error('limite')
  if (!res.ok) throw new Error(`HILO respondió ${res.status}`)
  const data = (await res.json()) as {
    resumen?: string | null
    items?: ItemHilo[]
    noEncontradas?: string[]
    motivo?: MotivoSinParecidas | null
  }

  const pedidas = (data.items ?? []).filter((i) => i.origen === 'nuestra').map((i) => (i as { id: number }).id)
  const porId = new Map<number, TokkoProperty>()
  if (pedidas.length) {
    const todas = (await getProperties()).objects ?? []
    const buscadas = new Set(pedidas)
    for (const d of todas) if (buscadas.has(d.id)) porId.set(d.id, sanitizeProperty(d))
  }
  const items = (data.items ?? []).flatMap((i): SeleccionItem[] => {
    if (i.origen === 'red') return i.tarjeta?.id && i.tarjeta.fotos?.length ? [itemDeTarjetaRed(i.tarjeta)] : []
    const d = porId.get(i.id)
    // Sin una foto que no sea plano, no se ofrece (como en la ficha).
    if (!d || !d.photos?.some((f) => !f.is_blueprint)) return []
    return [itemDePropiedad(applyPropertySeoOverride(d), { id: String(d.id), url: `https://siinmobiliaria.com/propiedad/${d.id}` }, true)]
  })
  return {
    resumen: data.resumen ?? null,
    items,
    noEncontradas: Array.isArray(data.noEncontradas) ? data.noEncontradas.slice(0, 4) : [],
    motivo: data.motivo ?? null,
  }
}
