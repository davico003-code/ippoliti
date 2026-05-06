/**
 * Utilidades de geolocalización para búsqueda por radio de cercanía.
 *
 * El tipo genérico de filterPropertiesByRadius está adaptado al shape real
 * de TokkoProperty (geo_lat/geo_long como strings nullables que vienen
 * directo del backend de Tokko). El parseo y la validación NaN viven dentro
 * de la utilidad para que los consumers no tengan que hacer adapters.
 */

export const GEO_NEARBY_RADIUS_KM = 5

const EARTH_RADIUS_KM = 6371

const toRad = (deg: number): number => (deg * Math.PI) / 180

/**
 * Distancia en km entre dos coordenadas (Haversine).
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return EARTH_RADIUS_KM * c
}

/**
 * Filtra una lista de propiedades dejando solo las que están dentro del
 * radio especificado (km) respecto a un punto de origen.
 *
 * - Descarta propiedades con `geo_lat`/`geo_long` nulos o ausentes.
 * - Descarta propiedades cuyas coords no parsean a número (NaN tras parseFloat),
 *   defensivo contra strings mal cargados en Tokko.
 */
export function filterPropertiesByRadius<
  T extends { geo_lat?: string | null; geo_long?: string | null },
>(
  properties: T[],
  originLat: number,
  originLng: number,
  radiusKm: number = GEO_NEARBY_RADIUS_KM,
): T[] {
  return properties.filter(p => {
    if (p.geo_lat == null || p.geo_long == null) return false
    const lat = parseFloat(p.geo_lat)
    const lng = parseFloat(p.geo_long)
    if (Number.isNaN(lat) || Number.isNaN(lng)) return false
    return haversineDistance(originLat, originLng, lat, lng) <= radiusKm
  })
}
