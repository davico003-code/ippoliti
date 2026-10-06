// Feed tipo Instagram debajo de la ficha (David, 3-oct-2026): primero las
// nuestras parecidas y después propiedades de otras inmobiliarias de la zona,
// marcadas "En red" (se dice abiertamente que no son nuestras: después hay que
// coordinar la visita con el colega). La persona les da ♥ y, al salir, deja
// nombre y WhatsApp: la consulta entra a Hilo con todo lo que marcó.

export type PosicionLogo = 'abajo-izq' | 'abajo-der'

/**
 * Fotos de colegas con el logo impreso (David, 3-oct: MA y Crestale). Cada
 * una lo pone siempre en el mismo rincón: se muestra un recuadro un poco más
 * chico (×1,3) anclado en la esquina OPUESTA, y el logo queda afuera. La foto
 * no se toca. Va sobre un contenedor con overflow-hidden.
 */
export function estiloSinLogo(logo: PosicionLogo | null | undefined): { transform: string; transformOrigin: string } | undefined {
  if (!logo) return undefined
  return { transform: 'scale(1.3)', transformOrigin: logo === 'abajo-izq' ? '100% 0%' : '0% 0%' }
}

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
  /** Rincón donde la inmobiliaria imprime su logo (MA abajo-izq, Crestale abajo-der). */
  logo?: PosicionLogo | null
  /** La calle como la publica el aviso ("Espora al 3700"), sin ciudad. */
  direccion?: string | null
  /** Ciudad del aviso ("Funes", "Roldán"). */
  ciudad?: string | null
  /** Terreno del aviso, si el portal lo trae (Hilo, 5-oct). */
  m2Lote?: number | null
  /** Solo en "Cerca mío": metros desde donde está la persona. */
  distanciaM?: number | null
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
  logo?: PosicionLogo | null
  /** "Espora al 3700 | Funes" / "Lote 058 | Vida | Funes" (David, 4-oct: "no te marca la dirección"). */
  direccion?: string | null
  /** Para el renglón corto de la tarjeta ("3 dorm · 430 m² · lote 800 m²", David 5-oct). */
  dorm?: number | null
  m2?: number | null
  lote?: number | null
  esLote?: boolean
  /** Solo en "Cerca mío": metros desde donde está la persona ("a 1,2 km" en la tarjeta). */
  distanciaM?: number | null
  /** Precio de venta en dólares (el mazo que aprende compara precios). */
  precioUsd?: number | null
}

const m2Texto = (n: number) => `${Math.round(n).toLocaleString('es-AR')} m²`

/**
 * Qué metros y qué lote muestra la tarjeta. Regla de David (10-sep, superficie
 * protagonista): la TOTAL, salvo que sea igual al lote (dato mal cargado: el
 * terreno puesto como total) → la cubierta. Un depto no tiene lote (si viene,
 * es un error de carga); un lote muestra solo su terreno.
 */
export function superficiesTarjeta(s: {
  tipo: TipoHogar | null
  total: number | null | undefined
  cubierta: number | null | undefined
  lote: number | null | undefined
}): { m2: number | null; lote: number | null } {
  const pos = (n: number | null | undefined) => (n != null && n > 0 ? n : null)
  const total = pos(s.total)
  const cubierta = pos(s.cubierta)
  const lote = pos(s.lote)
  if (s.tipo === 'lot') return { m2: null, lote: lote ?? total }
  if (s.tipo === 'apartment') return { m2: total ?? cubierta, lote: null }
  // Galpón, local, oficina: sus metros; el terreno solo si dice algo más.
  if (s.tipo == null) {
    const m2 = total ?? cubierta
    return { m2, lote: lote != null && (m2 == null || Math.abs(lote - m2) > 5) ? lote : null }
  }
  const totalEsLote = total != null && lote != null && Math.abs(total - lote) <= 5
  return { m2: total == null || totalEsLote ? cubierta : total, lote }
}

/** El tipo de un aviso En red por su texto ("Casa", "Departamento", "Terreno"). */
export function tipoHogarDeTexto(tipo: string | null | undefined): TipoHogar {
  if (/terreno|lote/i.test(tipo ?? '')) return 'lot'
  if (/depart|dpto|depto/i.test(tipo ?? '')) return 'apartment'
  return 'house'
}

/**
 * El renglón de la tarjeta del Tinder (David 5-oct: "molesta tanto texto sobre
 * la foto… en las casas agregá tamaño de lote si lo tenemos"): dormitorios,
 * metros y lote. Sin el tipo (el mazo ya es de casas) ni los baños (en ⓘ).
 * Un lote: "Lote · 930 m²". Sin datos sueltos, el renglón de siempre.
 */
export function lineaTarjeta(i: Pick<ItemFeed, 'datos' | 'dorm' | 'm2' | 'lote' | 'esLote'>): string {
  if (i.esLote) return i.m2 || i.lote ? `Lote · ${m2Texto((i.lote || i.m2)!)}` : i.datos
  if (i.dorm == null && i.m2 == null && i.lote == null) return i.datos
  // Metros iguales al lote = no se sabe la superficie de la casa (el feed y Hilo
  // caen al terreno cuando falta la total): se dice "lote", no "800 m²" de casa.
  const m2EsElLote = !!(i.lote && i.m2 && Math.abs(i.lote - i.m2) <= 5)
  const partes = [i.dorm ? `${i.dorm} dorm` : null, i.m2 && !m2EsElLote ? m2Texto(i.m2) : null]
  if (i.lote) partes.push(`lote ${m2Texto(i.lote)}`)
  return partes.filter(Boolean).join(' · ') || i.datos
}

/** Dónde está, en una línea corta: "Lote 058 · Vida · Funes". */
export function lugarTarjeta(i: Pick<ItemFeed, 'direccion' | 'zona'>): string | null {
  const d = i.direccion || i.zona
  return d ? d.split('|').map((p) => p.trim()).filter(Boolean).join(' · ') : null
}

/** "Calle | Barrio | Ciudad" sin repetir ("Funes | Funes" → "Funes"; "Kentucky" ≈ "Kentucky Club de Campo"). */
export function lineaDireccion(partes: (string | null | undefined)[]): string | null {
  const out: string[] = []
  for (const p of partes) {
    const t = p?.replace(/\s+/g, ' ').trim()
    if (!t) continue
    const n = t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    const repetida = out.some((o) => {
      const m = o.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      return m === n || mismoBarrio(o, t)
    })
    if (!repetida) out.push(t)
  }
  return out.length ? out.join(' | ') : null
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
    logo: t.logo ?? null,
    direccion: lineaDireccion([t.direccion, t.zona, t.ciudad]),
    dorm: t.dormitorios,
    ...superficiesTarjeta({ tipo: tipoHogarDeTexto(t.tipo), total: t.m2Total, cubierta: t.m2Cubiertos, lote: t.m2Lote }),
    esLote: tipoHogarDeTexto(t.tipo) === 'lot',
    distanciaM: t.distanciaM ?? null,
    precioUsd: t.precioUsd,
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
export type GuardadaLocal = { key: string; foto: string | null; precio: string; esNuestra: boolean; logo?: PosicionLogo | null }

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

export type ContactoLocal = { nombre: string; whatsapp: string; email: string }

export function leerContacto(): ContactoLocal {
  try {
    const v = JSON.parse(window.localStorage.getItem(CLAVE_CONTACTO) ?? '{}')
    const s = (x: unknown) => (typeof x === 'string' ? x : '')
    return { nombre: s(v.nombre), whatsapp: s(v.whatsapp), email: s(v.email) }
  } catch {
    return { nombre: '', whatsapp: '', email: '' }
  }
}

/** Guarda lo que vino, sin borrar lo que ya estaba (dejar el mail no borra el WhatsApp). */
export function escribirContacto(c: Partial<ContactoLocal>): void {
  try {
    const previo = leerContacto()
    const limpio = Object.fromEntries(Object.entries(c).filter(([, v]) => typeof v === 'string' && v.trim()))
    window.localStorage.setItem(CLAVE_CONTACTO, JSON.stringify({ ...previo, ...limpio }))
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

// ── "Conocé tu próximo hogar" (home, David 3-oct-2026): la persona elige dónde
// busca, qué y hasta cuánto, y se arma el mismo mazo sin ficha de referencia.
// Misma regla de zona que Hilo (lib/feed-en-red/candidatos.ts → enZonaBuscada):
// barrio con nombre → solo ese barrio; ciudad ("Funes", "Roldán") → toda.

export type TipoHogar = 'house' | 'lot' | 'apartment'

export const TIPOS_HOGAR: { id: TipoHogar; label: string; plural: string; tokkoIds: number[] }[] = [
  { id: 'house', label: 'Casa', plural: 'casas', tokkoIds: [3, 4] },
  { id: 'lot', label: 'Lote', plural: 'lotes', tokkoIds: [1] },
  { id: 'apartment', label: 'Depto', plural: 'departamentos', tokkoIds: [2, 13] },
]

/** Atajos de presupuesto por tipo, con la casilla vacía (un lote de 150 mil es caro; una casa, no). */
export const TOPES_HOGAR: Record<TipoHogar, number[]> = {
  house: [150_000, 250_000, 350_000, 500_000],
  lot: [50_000, 80_000, 120_000, 200_000],
  apartment: [80_000, 120_000, 180_000, 250_000],
}

/** Dormitorios que se pueden pedir ("N o más"). Los lotes no tienen. Igual que Hilo (dormMinValido). */
export const DORMS_HOGAR = [1, 2, 3, 4, 5] as const

export function dormMinValido(v: unknown): number | null {
  const n = Number(v)
  return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null
}

/** "3 dormitorios o más" / "1 dormitorio o más". */
export function textoDorm(n: number): string {
  return `${n} dormitorio${n === 1 ? '' : 's'} o más`
}

/** ¿Tiene los dormitorios que pide? Sin pedido entra todo; si no se sabe cuántos tiene, no entra. */
export function entraEnDorm(dormitorios: number | null | undefined, dormMin: number | null): boolean {
  if (dormMin == null) return true
  return dormitorios != null && dormitorios >= dormMin
}

/**
 * SU PRESUPUESTO (David, 6-oct-2026: "preguntarle cuál es su presupuesto y de
 * su presupuesto mostrarle un 15 % por encima y un 15 % por debajo"): 250 mil →
 * de 212 a 288 mil. Es el número que escribió, no un botón fijo: no quedan
 * huecos. Igual que Hilo (candidatos.ts → BANDA_TOPE).
 */
export const BANDA_TOPE = { min: 0.85, max: 1.15 } as const

export function esTipoHogar(v: unknown): v is TipoHogar {
  return v === 'house' || v === 'lot' || v === 'apartment'
}

/** USD 200.000 → "USD 200 mil"; 1.500.000 → "USD 1,5 M". */
export function textoTope(usd: number): string {
  if (usd >= 1_000_000) return `USD ${(usd / 1_000_000).toLocaleString('es-AR', { maximumFractionDigits: 1 })} M`
  return `USD ${Math.round(usd / 1000)} mil`
}

/** Su presupuesto en el texto que ve y que lee el asesor: "de alrededor de USD 250 mil". */
export function textoPrecio(tope: number): string {
  return `de alrededor de ${textoTope(tope)}`
}

/** Presupuesto típico por tipo (para entender qué quiso decir con "25") y lo que tiene sentido. */
const PRESUPUESTO_TIPICO: Record<TipoHogar, { tipico: number; min: number; max: number }> = {
  // Pisos bajos (David 6-oct: "puede que busque un lote de 35.000"): el número
  // completo de algo barato se toma tal cual; el típico decide lo abreviado ("25").
  house: { tipico: 250_000, min: 20_000, max: 5_000_000 },
  lot: { tipico: 80_000, min: 10_000, max: 3_000_000 },
  apartment: { tipico: 120_000, min: 15_000, max: 3_000_000 },
}

/** "250000" → "250.000" (lo que escribe, con puntos). */
export function formatearPresupuesto(texto: string): string {
  const d = texto.replace(/\D/g, '').replace(/^0+/, '').slice(0, 9)
  return d ? Number(d).toLocaleString('es-AR') : ''
}

/**
 * Lo que quiso decir mientras escribe (David, 6-oct: "autocompletar fácilmente
 * cuando está escribiendo"): "25" en casas → 250.000 o 2.500.000; "8" en lotes
 * → 80.000 u 800.000. La primera es la más probable y es la que se aplica.
 * Si lo que escribió ya es un precio lógico ("70.000" en casas), va primero tal
 * cual (si no, se buscaba 10 veces más). Vacío → los atajos del tipo.
 */
export function sugerirPresupuestos(texto: string, tipo: TipoHogar): number[] {
  const d = texto.replace(/\D/g, '').replace(/^0+/, '')
  if (!d) return TOPES_HOGAR[tipo]
  const { tipico, min, max } = PRESUPUESTO_TIPICO[tipo]
  const n = Number(d.slice(0, 9))
  const cerca = (v: number) => (v === n ? -1 : Math.abs(Math.log(v / tipico)))
  return [1, 10, 100, 1_000, 10_000, 100_000, 1_000_000]
    .map((f) => n * f)
    .filter((v) => v >= min && v <= max)
    .sort((a, b) => cerca(a) - cerca(b))
    .slice(0, 2)
}

const sinAcentos = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

/**
 * ¿Una nuestra está donde busca? `completa` = "Argentina | Santa Fe | Funes |
 * Funes Lakes"; `nombre` = el último tramo (el barrio, o la ciudad sola).
 */
export function enZonaBuscada(zona: string, ubicacion: { nombre: string | null | undefined; completa: string | null | undefined }): boolean {
  const tramos = (ubicacion.completa ?? '').split('|').map((t) => t.trim()).filter(Boolean).slice(2)
  if (esBarrioConNombre(zona)) {
    return mismoBarrio(zona, ubicacion.nombre) || tramos.some((t) => mismoBarrio(zona, t))
  }
  const z = sinAcentos(zona)
  if (!z) return false
  return [...tramos, ubicacion.nombre ?? ''].some((t) => sinAcentos(t) === z)
}

/** ¿El precio entra con el que eligió (±20 %)? Sin precio elegido entra todo lo que tenga precio. */
export function entraEnTope(precioUsd: number | null, tope: number | null): boolean {
  if (!(precioUsd && precioUsd > 0)) return false
  if (tope == null) return true
  return precioUsd >= tope * BANDA_TOPE.min && precioUsd <= tope * BANDA_TOPE.max
}

/**
 * Dónde se puede buscar (Hilo /api/public/en-red/zonas): barrios y ciudades
 * con algo en venta, nuestras o de la red. David (4-oct) escribió "Los tronco"
 * y la lista fija de zonas no lo tenía: este catálogo sale de lo que hay.
 */
export type ZonaHogar = {
  nombre: string
  ciudad: string | null
  esCiudad: boolean
  casas: number
  lotes: number
  deptos: number
  /** Barrio cerrado (lo marca Hilo; las ciudades no llevan). */
  cerrado?: boolean
}

/** Barrio cerrado o abierto; null = me da igual (David, 4-oct: "hay gente que es indiferente"). */
export type BarrioHogar = 'cerrado' | 'abierto'

export function barrioHogarValido(v: unknown): BarrioHogar | null {
  return v === 'cerrado' || v === 'abierto' ? v : null
}

/** ¿La nuestra es del tipo de barrio pedido? Lo que no se sabe cuenta como abierto (igual que Hilo). */
export function entraEnBarrio(cerrado: boolean | null | undefined, barrio: BarrioHogar | null): boolean {
  if (!barrio) return true
  return (cerrado === true) === (barrio === 'cerrado')
}

export function cantidadZona(z: ZonaHogar, tipo: TipoHogar): number {
  return tipo === 'house' ? z.casas : tipo === 'lot' ? z.lotes : z.deptos
}

// ── "Cerca mío" (David, 5-oct-2026: "buscar casas cerca tuyo"): desde la
// ubicación del celular, las 40 más cercanas hasta 15 km — nuestras y de
// colegas mezcladas, porque "cerca" es la promesa. Igual que Hilo (masCercanas).

export type PuntoCerca = { lat: number; lng: number }

export const RADIO_CERCA_M = 15_000
export const MAX_CERCA = 40

/** 3 decimales (~100 m): alcanza para "a 1,2 km" y no viaja dónde está la persona exacto. */
export function redondearPunto(lat: number, lng: number): PuntoCerca {
  const r = (n: number) => Math.round(n * 1000) / 1000
  return { lat: r(lat), lng: r(lng) }
}

/** "lat,lng" (query de la ruta) → el punto redondeado; null si no es un punto. */
export function puntoCercaValido(v: unknown): PuntoCerca | null {
  if (typeof v !== 'string') return null
  const [lat, lng] = v.split(',').map((x) => Number(x.trim()))
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null
  if (lat === 0 && lng === 0) return null
  return redondearPunto(lat, lng)
}

/** Lo que se muestra: de a 100 m (el punto viaja redondeado a ~100 m; "a 37 m" sería una precisión que no hay). */
export const metrosVisibles = (m: number) => Math.max(100, Math.round(m / 100) * 100)

/**
 * Las 40 más cercanas hasta 15 km, de la más cercana a la más lejana; sin pin
 * no entra. Si dos se ven a la misma distancia, primero la nuestra.
 */
export function masCercanas<T extends { distanciaM?: number | null; esNuestra: boolean }>(items: T[]): T[] {
  return items
    .filter((i) => i.distanciaM != null && i.distanciaM <= RADIO_CERCA_M)
    .sort((a, b) => metrosVisibles(a.distanciaM!) - metrosVisibles(b.distanciaM!) || Number(b.esNuestra) - Number(a.esNuestra))
    .slice(0, MAX_CERCA)
}

const palabrasBusqueda = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((w, i) => (i > 0 && ROMANOS[w] ? ROMANOS[w] : w))

/**
 * Sugerencias mientras escribe: cada palabra tipeada tiene que ser el comienzo
 * de alguna palabra del barrio ("los tronco" → Los Troncos; "tds 3" no, pero
 * "tierra 3" sí). Primero las ciudades y los que más tienen del tipo elegido.
 */
export function sugerirZonas(catalogo: ZonaHogar[], query: string, tipo: TipoHogar, max = 8): ZonaHogar[] {
  const q = palabrasBusqueda(query)
  if (q.length === 0 || q.join('').length < 2) return []
  return catalogo
    .filter((z) => {
      const ws = palabrasBusqueda(z.nombre)
      return q.every((p) => ws.some((w) => w.startsWith(p)))
    })
    .sort((a, b) => {
      const empiezaA = palabrasBusqueda(a.nombre)[0]?.startsWith(q[0]) ? 1 : 0
      const empiezaB = palabrasBusqueda(b.nombre)[0]?.startsWith(q[0]) ? 1 : 0
      return Number(b.esCiudad) - Number(a.esCiudad) || empiezaB - empiezaA || cantidadZona(b, tipo) - cantidadZona(a, tipo)
    })
    .slice(0, max)
}

// ── "Recibí las nuevas por mail" (David, 4-oct: "que puedan dejar su mail y ya
// prefiltramos su búsqueda para campañas de mailing"). La búsqueda viaja con el
// mail y Hilo la escribe en el contacto (zona, tipo, tope → tramos de mailing).

export type CriteriosBusqueda = {
  zona: string | null
  tipo: TipoHogar | null
  topeUsd: number | null
  /** Dormitorios mínimos (solo "Conocé tu próximo hogar"; viaja en el texto de la búsqueda). */
  dormMin?: number | null
  /** Barrio cerrado/abierto (solo "Conocé tu próximo hogar", al buscar una ciudad). */
  barrio?: BarrioHogar | null
  origen: 'conoce_tu_hogar' | 'ficha'
}

export function esEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
}

/** "casas de 3 dormitorios o más en Funes Lakes entre USD 160 y 240 mil" (lo que ve la persona y lo que lee el asesor). */
export function textoBusqueda(c: CriteriosBusqueda | null | undefined): string {
  if (!c) return 'propiedades'
  const plural = TIPOS_HOGAR.find((t) => t.id === c.tipo)?.plural ?? 'propiedades'
  const dorm = c.tipo !== 'lot' && c.dormMin ? ` de ${textoDorm(c.dormMin)}` : ''
  const zona = c.zona ? (c.barrio ? ` en barrio ${c.barrio} de ${c.zona}` : ` en ${c.zona}`) : ''
  return `${plural}${dorm}${zona}${c.topeUsd ? ` ${textoPrecio(c.topeUsd)}` : ''}`
}

/** Tipo de la ficha (id de tipo del feed) → el de la búsqueda. */
export function tipoHogarDeTokko(typeId: number | null | undefined): TipoHogar | null {
  if (typeId == null) return null
  return TIPOS_HOGAR.find((t) => t.tokkoIds.includes(typeId))?.id ?? null
}

/** Valida la búsqueda que manda el navegador (rutas de la web). null si no hay ni zona ni tipo. */
export function parsearCriteriosWeb(raw: unknown): CriteriosBusqueda | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const r = raw as Record<string, unknown>
  const zona = typeof r.zona === 'string' ? r.zona.replace(/\s+/g, ' ').trim().slice(0, 80) || null : null
  const tipo = esTipoHogar(r.tipo) ? r.tipo : null
  const tope = Number(r.topeUsd)
  if (!zona && !tipo) return null
  return {
    zona,
    tipo,
    topeUsd: Number.isFinite(tope) && tope >= 10_000 && tope <= 20_000_000 ? Math.round(tope) : null,
    dormMin: tipo === 'lot' ? null : dormMinValido(r.dormMin),
    barrio: barrioHogarValido(r.barrio),
    origen: r.origen === 'ficha' ? 'ficha' : 'conoce_tu_hogar',
  }
}

// ── EL MAZO QUE APRENDE (David, 5-oct-2026: "que el mazo aprenda mientras
// desliza"). Con lo que ya decidió se reordenan las que FALTAN: primero las
// que se parecen a las que le gustaron (barrio, precio, dormitorios, metros).
// Manda el ♥ (la ★ pesa más); el ✕ resta poco, solo para desempatar: un ✕ es
// "esta no", no "nada así" (con tres ✕ a casas caras y un ♥ a una de 455 mil,
// pesando igual, subían las de 150 mil que no se parecen a nada). Sin
// preguntar nada. Con poca señal no toca el orden.

export type DecisionMazo = 'like' | 'pass' | 'super'
type Rasgos = Pick<ItemFeed, 'zona' | 'precioUsd' | 'dorm' | 'm2' | 'esNuestra'>

const PESO_GUSTO: Record<Exclude<DecisionMazo, 'pass'>, number> = { like: 1, super: 1.5 }
/** Cuánto resta, como mucho, parecerse a las que pasó. */
const PESO_PASES = 0.25
/** Recién con 3 decisiones y al menos un ♥ o ★ hay algo que aprender. */
export const MIN_DECISIONES_APRENDER = 3

/** 1 = muy parecida, 0 = nada que ver; un dato que falta cuenta a medias. */
export function parecidoCasas(a: Rasgos, b: Rasgos): number {
  const cerca = (x: number | null | undefined, y: number | null | undefined, tol: number) =>
    x && y && x > 0 && y > 0 ? Math.max(0, 1 - Math.abs(Math.log(x / y)) / tol) : 0.5
  const zona =
    a.zona && b.zona ? (sinAcentos(a.zona) === sinAcentos(b.zona) || mismoBarrio(a.zona, b.zona) ? 1 : 0) : 0.5
  const dorm = a.dorm && b.dorm ? (a.dorm === b.dorm ? 1 : Math.abs(a.dorm - b.dorm) === 1 ? 0.5 : 0) : 0.5
  return 0.35 * zona + 0.35 * cerca(a.precioUsd, b.precioUsd, 0.4) + 0.2 * dorm + 0.1 * cerca(a.m2, b.m2, 0.5)
}

/**
 * Las que faltan, de la que más se parece a lo que le gustó a la que menos (a
 * igual parecido, el orden de antes; las nuestras con un empujoncito). Sin
 * señal suficiente, igual que antes.
 */
export function ordenarPorGusto<T extends Rasgos>(resto: T[], decididas: { item: Rasgos; accion: DecisionMazo }[]): T[] {
  const gustos = decididas.filter((d) => d.accion !== 'pass')
  const pases = decididas.filter((d) => d.accion === 'pass')
  if (decididas.length < MIN_DECISIONES_APRENDER || gustos.length === 0 || resto.length < 2) return resto
  const peso = (d: { accion: DecisionMazo }) => PESO_GUSTO[d.accion as Exclude<DecisionMazo, 'pass'>]
  const pesoGustos = gustos.reduce((s, d) => s + peso(d), 0)
  const puntaje = (c: T) => {
    const gusto = gustos.reduce((s, d) => s + peso(d) * parecidoCasas(c, d.item), 0) / pesoGustos
    const pase = pases.length ? pases.reduce((s, d) => s + parecidoCasas(c, d.item), 0) / pases.length : 0
    return gusto - PESO_PASES * pase + (c.esNuestra ? 0.05 : 0)
  }
  return resto
    .map((c, i) => ({ c, i, p: puntaje(c) }))
    .sort((a, b) => b.p - a.p || a.i - b.i)
    .map((x) => x.c)
}

/**
 * Aplica un orden guardado (keys) a las casas actuales. Las que llegaron
 * después (barrios parecidos) van en `en`: el lugar FIJO donde se sumaron (no
 * donde está parado ahora, que se mueve: se repetía una y se perdía otra).
 */
export function aplicarOrden<T extends { key: string }>(todos: T[], orden: readonly string[] | null, en: number): T[] {
  if (!orden) return todos
  const porKey = new Map(todos.map((t) => [t.key, t]))
  const conocidas = orden.map((k) => porKey.get(k)).filter((t): t is T => !!t)
  const enOrden = new Set(orden)
  const nuevas = todos.filter((t) => !enOrden.has(t.key))
  return [...conocidas.slice(0, en), ...nuevas, ...conocidas.slice(en)]
}

// ── TINDER DEL CLIENTE (David, 5-oct-2026): el asesor le manda el link con
// `s=<token de su link de seguimiento>`; cada ♥ y ★ se guarda como reacción de
// SU selección (la ruta /api/seleccion/<token>/reaccion la suma si no estaba).

/** La key del mazo → el id de la selección: `n:123` → `123`, `propia:9` → `red:propia:9`, `meli:MLA1` → `red:meli:MLA1`. */
export function idEnSeleccion(key: string): string | null {
  if (/^n:\d{1,16}$/.test(key)) return key.slice(2)
  if (/^(propia|meli):[A-Za-z0-9_-]{1,40}$/.test(key)) return `red:${key}`
  return null
}

