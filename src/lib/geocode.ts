// Geocoding de zonas/direcciones → lat/lng, para ubicar propiedades EXTERNAS
// (Zonaprop/Argenprop) en el mapa de la selección. Las propias de Tokko ya traen
// geo_lat/geo_long; las externas no, así que resolvemos acá.
//
// Motor: Nominatim (OpenStreetMap), gratis. Su política pide User-Agent
// identificable y ~1 req/seg — por eso cacheamos cada zona en Redis (las zonas
// se repiten muchísimo: "Funes", "Roldán", "Fisherton"…), así una zona se
// geocodifica UNA vez y después sale de cache.
//
// Best-effort: si Nominatim falla o no encuentra, devolvemos null y la ficha
// queda sin pin (el mapa simplemente no la muestra, no rompe nada).

import { redis } from './redis'

const NOMINATIM = 'https://nominatim.openstreetmap.org/search'
const CACHE_TTL = 180 * 24 * 60 * 60 // 180d: las coords de una zona no cambian
const cacheKey = (q: string) => `geocode:${q.toLowerCase().replace(/\s+/g, ' ').trim()}`

export interface Coords {
  lat: number
  lng: number
}

// Sentinela para cachear los "no encontrados" y no reintentar cada vez.
const MISS = '__miss__'

function esCoordValida(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180
}

/**
 * Geocodifica una zona/dirección de texto libre a lat/lng (sesgado a Argentina).
 * Cacheado en Redis por zona. Devuelve null si no se pudo resolver.
 */
export async function geocodeZona(zona: string | null | undefined): Promise<Coords | null> {
  const q = (zona || '').replace(/\s+/g, ' ').trim()
  if (q.length < 3) return null

  // Cache (incluye los "miss" para no re-pegarle a Nominatim por zonas que no resuelven).
  try {
    const cached = await redis.get<string>(cacheKey(q))
    if (cached === MISS) return null
    if (cached) {
      const c = typeof cached === 'string' ? (JSON.parse(cached) as Coords) : (cached as Coords)
      if (esCoordValida(c.lat, c.lng)) return c
    }
  } catch {
    /* cache best-effort */
  }

  const query = /argentina/i.test(q) ? q : `${q}, Argentina`
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '1',
    countrycodes: 'ar',
    addressdetails: '0',
  })

  let coords: Coords | null = null
  try {
    const res = await fetch(`${NOMINATIM}?${params.toString()}`, {
      headers: {
        // Nominatim exige identificarse (política de uso).
        'User-Agent': 'SI-INMOBILIARIA/1.0 (https://siinmobiliaria.com; contacto@siinmobiliaria.com)',
        'Accept-Language': 'es',
      },
      signal: AbortSignal.timeout(6000),
    })
    if (res.ok) {
      const arr = (await res.json()) as Array<{ lat?: string; lon?: string }>
      const hit = arr?.[0]
      if (hit?.lat && hit?.lon) {
        const lat = parseFloat(hit.lat)
        const lng = parseFloat(hit.lon)
        if (esCoordValida(lat, lng)) coords = { lat, lng }
      }
    }
  } catch {
    /* red/timeout: best-effort, cae a null */
  }

  try {
    await redis.set(cacheKey(q), coords ? JSON.stringify(coords) : MISS, { ex: CACHE_TTL })
  } catch {
    /* cache best-effort */
  }
  return coords
}
