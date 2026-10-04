// Feed tipo Instagram debajo de la ficha (David, 3-oct-2026): primero las
// nuestras parecidas y después propiedades de otras inmobiliarias de la zona,
// marcadas "En red" (se dice abiertamente que no son nuestras: después hay que
// coordinar la visita con el colega). La persona les da ♥ y, al salir, deja
// nombre y WhatsApp: la consulta entra a Hilo con todo lo que marcó.

/** Lo que manda Hilo de cada "En red" (sin dirección ni inmobiliaria). */
export type TarjetaEnRed = {
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

export type FeedEnRed = { barrio: string | null; tarjetas: TarjetaEnRed[] }

/** Una publicación del feed, nuestra o En red, con la forma que dibuja la UI. */
export type ItemFeed = {
  /** Id que viaja a Hilo: `n:<id público>` (nuestra) o el de la tarjeta En red. */
  key: string
  esNuestra: boolean
  fotos: string[]
  precio: string
  datos: string
  titulo: string
  zona: string | null
  /** Ficha de la web (solo las nuestras). */
  href: string | null
  masVista: boolean
}

/** "Casa · 3 dorm · 2 baños · 226 m²" */
export function datosEnRed(t: TarjetaEnRed): string {
  const m2 = t.m2Total ?? t.m2Cubiertos
  return [
    t.tipo,
    t.dormitorios ? `${t.dormitorios} dorm` : null,
    t.banos ? `${t.banos} baño${t.banos > 1 ? 's' : ''}` : null,
    m2 ? `${Math.round(m2).toLocaleString('es-AR')} m²` : null,
  ]
    .filter(Boolean)
    .join(' · ')
}

export function itemDeEnRed(t: TarjetaEnRed): ItemFeed {
  return {
    key: t.id,
    esNuestra: false,
    fotos: t.fotos,
    precio: t.precio,
    datos: datosEnRed(t),
    titulo: t.titulo,
    zona: t.zona,
    href: null,
    masVista: t.masVista,
  }
}

/** "Casa" → "casas", "Terreno" → "lotes"… para el título "Más casas en Vida". */
export function pluralTipo(tipo: string | null | undefined): string {
  const t = (tipo ?? '').toLowerCase()
  if (t.includes('casa')) return 'casas'
  if (t.includes('depart')) return 'departamentos'
  if (t.includes('terreno') || t.includes('lote')) return 'lotes'
  if (t.includes('galp')) return 'galpones'
  if (t.includes('local')) return 'locales'
  if (t.includes('oficina')) return 'oficinas'
  return 'propiedades'
}

/** ♥ guardadas en este navegador (sobreviven al pasar de una ficha a otra). */
export type GuardadaLocal = { key: string; foto: string | null; precio: string; esNuestra: boolean }

const CLAVE_GUARDADAS = 'si-feed-guardadas'
const CLAVE_CONTACTO = 'si-feed-contacto'

export function leerGuardadas(): GuardadaLocal[] {
  try {
    const raw = window.localStorage.getItem(CLAVE_GUARDADAS)
    const v = raw ? JSON.parse(raw) : []
    return Array.isArray(v) ? v.filter((g) => g && typeof g.key === 'string').slice(0, 12) : []
  } catch {
    return []
  }
}

export function escribirGuardadas(g: GuardadaLocal[]): void {
  try {
    window.localStorage.setItem(CLAVE_GUARDADAS, JSON.stringify(g.slice(0, 12)))
  } catch {
    /* modo privado: queda en memoria */
  }
}

export function leerContacto(): { nombre: string; whatsapp: string } {
  try {
    const v = JSON.parse(window.localStorage.getItem(CLAVE_CONTACTO) ?? '{}')
    return { nombre: typeof v.nombre === 'string' ? v.nombre : '', whatsapp: typeof v.whatsapp === 'string' ? v.whatsapp : '' }
  } catch {
    return { nombre: '', whatsapp: '' }
  }
}

export function escribirContacto(c: { nombre: string; whatsapp: string }): void {
  try {
    window.localStorage.setItem(CLAVE_CONTACTO, JSON.stringify(c))
  } catch {
    /* sin almacenamiento: se vuelve a pedir */
  }
}

// ── Misma ZONA (David, 3-oct: "estoy mirando Funes Lakes y me mostró cualquier
// otra; la regla es que sea del barrio o de la zona, si no pierde el sentido").
// Es la MISMA regla que usa Hilo para las En red (lib/feed-en-red/candidatos.ts):
//  - ficha en un BARRIO con nombre (Funes Lakes, Kentucky, Vida…) → solo ese
//    barrio. Por distancia no: en Funes los barrios cerrados están pegados y
//    con 2,5 km entraban Aguadas o San Sebastián mirando Funes Lakes.
//  - ficha en zona abierta ("Funes", "Roldán", "Zona 7") → a menos de 1,5 km.
// Y siempre precio parecido (0,7–1,35).

const PALABRAS_VACIAS = new Set([
  'de', 'del', 'la', 'las', 'el', 'los', 'y', 'barrio', 'privado', 'cerrado',
  'funes', 'roldan', 'rosario', 'zona', 'centro', 'santa', 'fe',
])
/** "Tierra de Sueños II" = "Tierra de Sueños 2": el número distingue barrios vecinos. */
const ROMANOS: Record<string, string> = { i: '1', ii: '2', iii: '3', iv: '4' }

function palabrasBarrio(s: string | null | undefined): string[] {
  if (!s) return []
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((w) => ROMANOS[w] ?? w)
    .filter((w) => (w.length > 1 || /^\d$/.test(w)) && !PALABRAS_VACIAS.has(w))
}

/** "Vida Crystal Lagoon" ~ "Vida Lagoon"; "Funes" o "Zona 7" solos no son un barrio. */
export function mismoBarrio(a: string | null | undefined, b: string | null | undefined): boolean {
  const pa = palabrasBarrio(a)
  const pb = palabrasBarrio(b)
  const conNombre = (ws: string[]) => ws.some((w) => /[a-z]/.test(w))
  if (!conNombre(pa) || !conNombre(pb)) return false
  const [corto, largo] = pa.length <= pb.length ? [pa, new Set(pb)] : [pb, new Set(pa)]
  return corto.every((w) => largo.has(w))
}

export const RADIO_ZONA_M = 1500

/** ¿El barrio tiene nombre propio? ("Funes Lakes" sí; "Funes", "Centro", "Zona 7" no). */
export function esBarrioConNombre(barrio: string | null | undefined): boolean {
  return palabrasBarrio(barrio).some((w) => /[a-z]/.test(w))
}
export const BANDA_PRECIO = { min: 0.7, max: 1.35 } as const

export type PuntoZona = { barrio: string | null; lat: number | null; lng: number | null; precioUsd: number | null }

function metrosEntre(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const rad = Math.PI / 180
  const x = (lng2 - lng1) * rad * Math.cos(((lat1 + lat2) / 2) * rad)
  const y = (lat2 - lat1) * rad
  return Math.sqrt(x * x + y * y) * 6_371_000
}

/** ¿Va en el mazo de esta ficha? Su barrio (o, en zona abierta, ≤1,5 km) y precio parecido. */
export function enLaZona(ref: PuntoZona, otra: PuntoZona): boolean {
  if (ref.precioUsd && otra.precioUsd) {
    if (otra.precioUsd < ref.precioUsd * BANDA_PRECIO.min || otra.precioUsd > ref.precioUsd * BANDA_PRECIO.max) return false
  }
  if (esBarrioConNombre(ref.barrio)) return mismoBarrio(ref.barrio, otra.barrio)
  if (ref.lat == null || ref.lng == null || otra.lat == null || otra.lng == null) return false
  return metrosEntre(ref.lat, ref.lng, otra.lat, otra.lng) <= RADIO_ZONA_M
}
