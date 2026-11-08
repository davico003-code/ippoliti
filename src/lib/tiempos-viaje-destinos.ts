// "¿Cuánto tardás desde acá?" (David, 20-oct-2026): minutos en auto, en hora
// pico, desde cada propiedad a los lugares a los que la gente va todos los días.
// Acá va la parte pura (a dónde se mide y a qué hora), testeada en
// tiempos-viaje-destinos.test.mjs; el pedido a Google está en tiempos-viaje.ts.

export type IconoDestino = 'ciudad' | 'barrio' | 'pueblo' | 'avion'

export interface Destino {
  clave: string
  nombre: string
  /** Lo que se le pasa a Google: él ubica la puerta (la terminal, la plaza). */
  direccion: string
  /** Para decidir si el destino tiene sentido (distancia en línea recta) y
   *  para el cálculo sin tránsito de OpenStreetMap, que va por coordenadas. */
  lat: number
  lng: number
  icono: IconoDestino
  /** Centro de una localidad chica: se muestra solo el más cercano a la propiedad. */
  local?: boolean
}

// Coordenadas de OpenStreetMap (Nominatim, 20-oct-2026); la del aeropuerto es
// la de la terminal (el centro del predio caía del lado de las pistas).
export const DESTINOS: Destino[] = [
  { clave: 'rosario', nombre: 'Centro de Rosario', direccion: 'Plaza 25 de Mayo, Rosario, Santa Fe, Argentina', lat: -32.947, lng: -60.6332, icono: 'ciudad' },
  { clave: 'fisherton', nombre: 'Fisherton', direccion: 'Av. Eva Perón 8100, Rosario, Santa Fe, Argentina', lat: -32.9286, lng: -60.737, icono: 'barrio' },
  { clave: 'funes', nombre: 'Centro de Funes', direccion: 'Plaza San José, Funes, Santa Fe, Argentina', lat: -32.9209, lng: -60.8115, icono: 'pueblo', local: true },
  { clave: 'roldan', nombre: 'Centro de Roldán', direccion: 'Plaza San Martín, Roldán, Santa Fe, Argentina', lat: -32.9002, lng: -60.9102, icono: 'pueblo', local: true },
  { clave: 'aeropuerto', nombre: 'Aeropuerto de Rosario', direccion: 'Aeropuerto Internacional Rosario Islas Malvinas, Santa Fe, Argentina', lat: -32.9036, lng: -60.7844, icono: 'avion' },
]

/** Más lejos que esto del centro de Rosario (Bariloche, Córdoba, Uruguay) no se muestra. */
const RADIO_ZONA_KM = 60
/** Un destino a menos de esto está "acá nomás": no aporta. */
const MINIMO_KM = 2
const MINIMO_LOCAL_KM = 1.5
/** El centro de Funes o de Roldán, solo si la propiedad es de esa zona. */
const MAXIMO_LOCAL_KM = 10

export function kmEnLinea(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/** A dónde se mide desde (lat, lng), en el orden en que se muestra. Vacío si la
 *  propiedad está fuera de la zona de Rosario. */
export function destinosPara(lat: number, lng: number): Destino[] {
  const rosario = DESTINOS[0]
  if (kmEnLinea(lat, lng, rosario.lat, rosario.lng) > RADIO_ZONA_KM) return []
  const km = (d: Destino) => kmEnLinea(lat, lng, d.lat, d.lng)
  const local = DESTINOS
    .filter((d) => d.local && km(d) > MINIMO_LOCAL_KM && km(d) <= MAXIMO_LOCAL_KM)
    .sort((a, b) => km(a) - km(b))[0]
  return DESTINOS.filter((d) => (d.local ? d === local : km(d) > MINIMO_KM))
}

/** La próxima hora pico de referencia: un martes a las 8 de la mañana de
 *  Argentina (UTC-3, sin horario de verano), al menos un día adelante. Google
 *  solo calcula el tránsito de salidas futuras. */
export function proximaHoraPico(ahora: Date = new Date()): Date {
  const MARTES = 2
  const d = new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), ahora.getUTCDate(), 11, 0, 0))
  d.setUTCDate(d.getUTCDate() + 1)
  while (d.getUTCDay() !== MARTES) d.setUTCDate(d.getUTCDate() + 1)
  return d
}

/** "1234s" (formato de Google) → minutos redondeados. */
export function minutosDe(duracion: string | undefined): number | null {
  const s = Number(duracion?.replace(/s$/, ''))
  return Number.isFinite(s) && s > 0 ? Math.max(1, Math.round(s / 60)) : null
}

/** Dirección que escribió el visitante, para la clave del caché: sin acentos,
 *  minúsculas, espacios simples. Null si es muy corta o muy larga. */
export function normalizarDireccion(texto: string): string | null {
  const t = texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()
  return t.length >= 4 && t.length <= 120 ? t : null
}

/** Si no dice provincia ni país, se acota a Santa Fe: "Oroño 1200" a secas
 *  podría caer en cualquier lado. */
export function direccionParaGoogle(texto: string): string {
  const t = texto.trim()
  return /santa fe|argentina/i.test(t) ? t : `${t}, Santa Fe, Argentina`
}
