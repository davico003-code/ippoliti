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
