import 'server-only'
import { redis } from '@/lib/redis'
import {
  destinosPara,
  direccionParaGoogle,
  minutosDe,
  normalizarDireccion,
  proximaHoraPico,
  type IconoDestino,
} from '@/lib/tiempos-viaje-destinos'

// "¿Cuánto tardás desde acá?": minutos en auto un martes a las 8 (hora pico) y
// sin tránsito, con la matriz de rutas de Google (Routes API, clave en
// GOOGLE_ROUTES_API_KEY). Mismo esquema que lib/cercanos.ts: se pide UNA vez
// por coordenada, se guarda en Redis y la ficha lo trae en el HTML;
// scripts/calentar-tiempos.mjs llena todas las publicadas.
//
// Plata: cada destino es un "elemento" de Google ("Compute Route Matrix Pro":
// gratis hasta 5.000 por mes, después USD 10 cada 1.000; visto en la consola el
// 20-oct-2026). El tope mensual (TOPE_ELEMENTOS_MES) queda abajo de lo gratis:
// pasado el tope no se pide más ese mes y la ficha muestra lo que ya está guardado.

export interface TiempoDestino {
  clave: string
  nombre: string
  icono: IconoDestino | 'trabajo'
  /** Un martes a las 8 de la mañana. */
  minutos: number
  /** El mismo viaje sin tránsito. */
  minutosLibre: number | null
  km: number
}

export interface TiemposViaje {
  destinos: TiempoDestino[]
  /** Cuándo se calculó (ISO), para saber de qué semana es el tránsito. */
  calculado: string
}

const URL_MATRIZ = 'https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix'
const CAMPOS = 'originIndex,destinationIndex,duration,staticDuration,distanceMeters,condition,status'
// El tránsito de una zona cambia poco: medio año.
const TTL_S = 180 * 24 * 60 * 60
const TTL_TRABAJO_S = 30 * 24 * 60 * 60
const TOPE_ELEMENTOS_MES = 4500
// "Tu trabajo" más lejos que esto = Google ubicó mal la dirección.
const MAXIMO_TRABAJO_KM = 150

const claveDe = (latIn: number, lngIn: number) => {
  const lat = Number(latIn.toFixed(4))
  const lng = Number(lngIn.toFixed(4))
  return { lat, lng, clave: `tiempos:v1:${lat}:${lng}` }
}

/** Suma `n` elementos al contador del mes (UTC, como factura Google); false si
 *  se pasa del tope. */
async function hayCupo(n: number): Promise<boolean> {
  const clave = `tiempos:google:${new Date().toISOString().slice(0, 7)}`
  try {
    const usados = await redis.incrby(clave, n)
    if (usados === n) await redis.expire(clave, 40 * 24 * 60 * 60)
    if (usados > TOPE_ELEMENTOS_MES) {
      console.error(`[tiempos] tope mensual de Google alcanzado (${usados}/${TOPE_ELEMENTOS_MES})`)
      return false
    }
    return true
  } catch {
    // Sin Redis no hay caché ni contador: mejor no gastar.
    return false
  }
}

interface ElementoMatriz {
  destinationIndex?: number
  duration?: string
  staticDuration?: string
  distanceMeters?: number
  condition?: string
}

/** Una fila de la matriz: desde (lat, lng) hasta cada dirección. */
async function pedirMatriz(lat: number, lng: number, direcciones: string[]): Promise<ElementoMatriz[] | null> {
  const clave = process.env.GOOGLE_ROUTES_API_KEY
  if (!clave || direcciones.length === 0) return null
  if (!(await hayCupo(direcciones.length))) return null
  const r = await fetch(URL_MATRIZ, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'X-Goog-Api-Key': clave, 'X-Goog-FieldMask': CAMPOS },
    body: JSON.stringify({
      origins: [{ waypoint: { location: { latLng: { latitude: lat, longitude: lng } } } }],
      destinations: direcciones.map((address) => ({ waypoint: { address } })),
      travelMode: 'DRIVE',
      routingPreference: 'TRAFFIC_AWARE_OPTIMAL',
      departureTime: proximaHoraPico().toISOString(),
      trafficModel: 'BEST_GUESS',
      languageCode: 'es-419',
      regionCode: 'AR',
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  })
  if (!r.ok) {
    console.error('[tiempos] Google respondió', r.status, (await r.text()).slice(0, 300))
    return null
  }
  return (await r.json()) as ElementoMatriz[]
}

function armar(e: ElementoMatriz | undefined) {
  if (!e || e.condition !== 'ROUTE_EXISTS') return null
  const minutos = minutosDe(e.duration)
  if (minutos == null || !e.distanceMeters) return null
  return { minutos, minutosLibre: minutosDe(e.staticDuration), km: Math.round(e.distanceMeters / 100) / 10 }
}

/** Solo lo ya guardado (nunca le pide a Google): lo usa la ficha en el servidor.
 *  Por el REST de Upstash con `next.revalidate`, igual que cercanosGuardados: el
 *  cliente `redis` pide con 'no-store' y volvería dinámica la ficha (ISR). */
export async function tiemposGuardados(lat: number, lng: number): Promise<TiemposViaje | null> {
  const { clave } = claveDe(lat, lng)
  const url = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  try {
    const r = await fetch(`${url}/get/${encodeURIComponent(clave)}`, {
      headers: { authorization: `Bearer ${token}` },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(800),
    })
    if (!r.ok) return null
    const { result } = (await r.json()) as { result: string | null }
    return result ? (JSON.parse(result) as TiemposViaje) : null
  } catch {
    return null
  }
}

const enCurso = new Map<string, Promise<TiemposViaje | null>>()

/** Tiempos desde (lat, lng) a sus destinos fijos. null si la propiedad está
 *  fuera de zona, no hay clave, se pasó el tope o Google falló (no se guarda:
 *  el próximo pedido vuelve a probar). */
export function tiemposDeViaje(latIn: number, lngIn: number): Promise<TiemposViaje | null> {
  const { lat, lng, clave } = claveDe(latIn, lngIn)
  const ya = enCurso.get(clave)
  if (ya) return ya
  const p = (async () => {
    const guardado = await redis.get<TiemposViaje>(clave).catch(() => null)
    if (guardado) return guardado
    const destinos = destinosPara(lat, lng)
    if (destinos.length === 0) return null
    try {
      const matriz = await pedirMatriz(lat, lng, destinos.map((d) => d.direccion))
      if (!matriz) return null
      const res: TiemposViaje = {
        destinos: destinos.flatMap((d, i) => {
          const t = armar(matriz.find((e) => (e.destinationIndex ?? 0) === i))
          return t ? [{ clave: d.clave, nombre: d.nombre, icono: d.icono, ...t }] : []
        }),
        calculado: new Date().toISOString(),
      }
      if (res.destinos.length === 0) return null
      await redis.set(clave, res, { ex: TTL_S }).catch(() => {})
      return res
    } catch (e) {
      console.error('[tiempos] no se pudo calcular', clave, String(e))
      return null
    }
  })().finally(() => enCurso.delete(clave))
  enCurso.set(clave, p)
  return p
}

export type TiempoATrabajo = TiempoDestino | { error: 'no_encontrada' | 'sin_servicio' }

/** "¿Trabajás en otro lado?": desde la propiedad hasta la dirección que escribió
 *  el visitante. Cacheado por dirección normalizada. */
export async function tiempoATrabajo(latIn: number, lngIn: number, texto: string): Promise<TiempoATrabajo> {
  const direccion = normalizarDireccion(texto)
  if (!direccion) return { error: 'no_encontrada' }
  const { lat, lng } = claveDe(latIn, lngIn)
  const clave = `tiempos:trabajo:v1:${lat}:${lng}:${direccion}`
  const guardado = await redis.get<TiempoDestino>(clave).catch(() => null)
  if (guardado) return guardado
  try {
    const matriz = await pedirMatriz(lat, lng, [direccionParaGoogle(texto)])
    if (!matriz) return { error: 'sin_servicio' }
    const t = armar(matriz[0])
    if (!t || t.km > MAXIMO_TRABAJO_KM) return { error: 'no_encontrada' }
    const res: TiempoDestino = { clave: 'trabajo', nombre: texto.trim(), icono: 'trabajo', ...t }
    await redis.set(clave, res, { ex: TTL_TRABAJO_S }).catch(() => {})
    return res
  } catch (e) {
    console.error('[tiempos] trabajo', String(e))
    return { error: 'sin_servicio' }
  }
}
