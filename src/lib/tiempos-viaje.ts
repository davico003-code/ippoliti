import 'server-only'
import { redis } from '@/lib/redis'
import {
  destinosPara,
  direccionParaGoogle,
  minutosDe,
  normalizarDireccion,
  proximaHoraPico,
  type Destino,
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
//
// Sin Google (sin clave, cuenta sin activar o caída): los minutos SIN tránsito de
// OpenStreetMap (OSRM, gratis), con `fuente: 'osm'`. David, 22-oct-2026: "que
// pase a hora pico cuando Google active la cuenta" → lo guardado de OSM se
// vuelve a pedir a Google cuando alguien mira la ficha (como mucho una vez por
// hora mientras Google falla, ver PAUSA_GOOGLE_S) y se reemplaza solo.

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
  /** 'google' = hora pico (y sin tránsito al lado); 'osm' = solo sin tránsito.
   *  Lo guardado antes de que existiera el campo es de Google. */
  fuente?: 'google' | 'osm'
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
// Google respondió mal (cuenta sin activar, caído): no se le vuelve a pedir por un rato.
const PAUSA_GOOGLE_S = 60 * 60
const CLAVE_PAUSA = 'tiempos:google-pausa'
// Servidor público de OSRM: uso liviano, con nombre propio (como Overpass en lib/cercanos).
const URL_OSRM = 'https://router.project-osrm.org/table/v1/driving'
const UA = 'SI-INMOBILIARIA/1.0 (+https://siinmobiliaria.com; contacto@siinmobiliaria.com)'

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

/** Lo que Google no cobró (respondió con error) vuelve al contador. */
async function devolverCupo(n: number) {
  await redis.decrby(`tiempos:google:${new Date().toISOString().slice(0, 7)}`, n).catch(() => {})
}

/** Hay clave y Google no falló en la última hora. */
async function googleDisponible(): Promise<boolean> {
  if (!process.env.GOOGLE_ROUTES_API_KEY) return false
  return !(await redis.get(CLAVE_PAUSA).catch(() => null))
}

async function pausarGoogle() {
  await redis.set(CLAVE_PAUSA, 1, { ex: PAUSA_GOOGLE_S }).catch(() => {})
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
  if (!clave || direcciones.length === 0 || !(await googleDisponible())) return null
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
  }).catch(() => null)
  if (!r?.ok) {
    console.error('[tiempos] Google respondió', r?.status ?? 'sin respuesta', r ? (await r.text()).slice(0, 300) : '')
    await Promise.all([devolverCupo(direcciones.length), pausarGoogle()])
    return null
  }
  return (await r.json()) as ElementoMatriz[]
}

/** Minutos SIN tránsito de OpenStreetMap, por coordenadas. null si OSRM no responde. */
async function pedirOsm(lat: number, lng: number, destinos: Destino[]): Promise<TiempoDestino[] | null> {
  const puntos = [[lng, lat], ...destinos.map((d) => [d.lng, d.lat])].map((p) => p.join(',')).join(';')
  const r = await fetch(`${URL_OSRM}/${puntos}?sources=0&annotations=duration,distance`, {
    headers: { 'user-agent': UA },
    cache: 'no-store',
    signal: AbortSignal.timeout(10_000),
  }).catch(() => null)
  if (!r?.ok) return null
  const j = (await r.json().catch(() => null)) as { code?: string; durations?: number[][]; distances?: number[][] } | null
  if (j?.code !== 'Ok' || !j.durations?.[0] || !j.distances?.[0]) return null
  const [dur, dist] = [j.durations[0], j.distances[0]]
  return destinos.flatMap((d, i) => {
    const s = dur[i + 1]
    const m = dist[i + 1]
    if (!s || !m) return []
    return [{ clave: d.clave, nombre: d.nombre, icono: d.icono, minutos: Math.max(1, Math.round(s / 60)), minutosLibre: null, km: Math.round(m / 100) / 10 }]
  })
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

async function calcularGoogle(lat: number, lng: number, destinos: Destino[]): Promise<TiemposViaje | null> {
  const matriz = await pedirMatriz(lat, lng, destinos.map((d) => d.direccion))
  if (!matriz) return null
  const res: TiemposViaje = {
    fuente: 'google',
    destinos: destinos.flatMap((d, i) => {
      const t = armar(matriz.find((e) => (e.destinationIndex ?? 0) === i))
      return t ? [{ clave: d.clave, nombre: d.nombre, icono: d.icono, ...t }] : []
    }),
    calculado: new Date().toISOString(),
  }
  return res.destinos.length > 0 ? res : null
}

/** Tiempos desde (lat, lng) a sus destinos fijos: de Google (hora pico) si se
 *  puede, si no de OpenStreetMap (sin tránsito). Lo de OSM guardado se vuelve a
 *  intentar con Google y se reemplaza. null si la propiedad está fuera de zona o
 *  no respondió ninguno (no se guarda nada: el próximo pedido vuelve a probar). */
export function tiemposDeViaje(latIn: number, lngIn: number): Promise<TiemposViaje | null> {
  const { lat, lng, clave } = claveDe(latIn, lngIn)
  const ya = enCurso.get(clave)
  if (ya) return ya
  const p = (async () => {
    const guardado = await redis.get<TiemposViaje>(clave).catch(() => null)
    if (guardado && guardado.fuente !== 'osm') return guardado
    const destinos = destinosPara(lat, lng)
    if (destinos.length === 0) return null
    try {
      const deGoogle = await calcularGoogle(lat, lng, destinos)
      if (deGoogle) {
        await redis.set(clave, deGoogle, { ex: TTL_S }).catch(() => {})
        return deGoogle
      }
      if (guardado) return guardado
      const osm = await pedirOsm(lat, lng, destinos)
      if (!osm?.length) return null
      const res: TiemposViaje = { fuente: 'osm', destinos: osm, calculado: new Date().toISOString() }
      await redis.set(clave, res, { ex: TTL_S }).catch(() => {})
      return res
    } catch (e) {
      console.error('[tiempos] no se pudo calcular', clave, String(e))
      return guardado ?? null
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
