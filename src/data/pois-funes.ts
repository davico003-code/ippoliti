// Puntos de interés de Funes para la sección "Mapa y cercanías" de la ficha
// de barrio. Coordenadas exactas verificadas con Google Places (jun 2026) —
// NO modificarlas a mano.

export type PoiCategoria =
  | 'educacion'
  | 'salud'
  | 'supermercados'
  | 'farmacias'
  | 'combustible'
  | 'gastronomia'

export interface Poi {
  nombre: string
  categoria: PoiCategoria
  lat: number
  lng: number
}

export const POI_CATEGORIA_META: Record<
  PoiCategoria,
  { label: string; color: string }
> = {
  // Colores ya presentes en la paleta del sitio (hub barrios / amenities)
  educacion: { label: 'Educación', color: '#2d5a8a' },
  salud: { label: 'Salud', color: '#1A5C38' },
  supermercados: { label: 'Supermercados', color: '#2d8a4f' },
  farmacias: { label: 'Farmacias', color: '#5b9bd5' },
  combustible: { label: 'Combustible', color: '#6e5a3a' },
  gastronomia: { label: 'Gastronomía y paseos', color: '#B8935A' },
}

export const POIS_FUNES: Poi[] = [
  // ── Educación ──
  { nombre: 'Colegio Sol de Funes', categoria: 'educacion', lat: -32.9197576, lng: -60.8222077 },
  { nombre: 'Colegio Joan Miró', categoria: 'educacion', lat: -32.9056196, lng: -60.7969898 },
  { nombre: 'Colegio Montessori Funes', categoria: 'educacion', lat: -32.9296083, lng: -60.8642576 },
  { nombre: 'Colegio María Auxiliadora', categoria: 'educacion', lat: -32.9134293, lng: -60.8042921 },
  { nombre: 'Escuela José Ingenieros 1061', categoria: 'educacion', lat: -32.9211258, lng: -60.8409629 },
  { nombre: 'Jardín Bosque Encantado', categoria: 'educacion', lat: -32.8990592, lng: -60.7968586 },

  // ── Salud ──
  { nombre: 'GO Sanatorio Funes', categoria: 'salud', lat: -32.9200381, lng: -60.8205803 },
  { nombre: 'Centro Médico Funes', categoria: 'salud', lat: -32.9001117, lng: -60.8044911 },
  { nombre: 'CEM Centro de Especialidades Médicas', categoria: 'salud', lat: -32.9154855, lng: -60.8052003 },
  { nombre: 'Dispensario Eva Perón (24hs)', categoria: 'salud', lat: -32.9060586, lng: -60.8091864 },

  // ── Supermercados ──
  { nombre: 'La Reina Supermercados', categoria: 'supermercados', lat: -32.9289278, lng: -60.7979080 },
  { nombre: 'Supermercados Arcoiris (San José)', categoria: 'supermercados', lat: -32.9201927, lng: -60.8138275 },
  { nombre: 'Supermercados Arcoiris (Houssay)', categoria: 'supermercados', lat: -32.9242093, lng: -60.8426112 },
  { nombre: 'Supermercado La Esperanza', categoria: 'supermercados', lat: -32.9290524, lng: -60.8044714 },

  // ── Farmacias ──
  { nombre: 'Farmacia Pérez Herrera', categoria: 'farmacias', lat: -32.9196619, lng: -60.8207687 },
  { nombre: 'Farmacia Lascurain', categoria: 'farmacias', lat: -32.9206795, lng: -60.8098787 },

  // ── Combustible ──
  { nombre: 'Shell Av. Fuerza Aérea (24hs)', categoria: 'combustible', lat: -32.9338464, lng: -60.8203787 },
  { nombre: 'YPF Av. Arturo Illia (24hs)', categoria: 'combustible', lat: -32.9292301, lng: -60.8050005 },

  // ── Gastronomía y paseos ──
  { nombre: 'Punto Funes', categoria: 'gastronomia', lat: -32.9287482, lng: -60.8129327 },
  { nombre: 'Estación Funes', categoria: 'gastronomia', lat: -32.9204837, lng: -60.8193407 },
  { nombre: 'Paseo Victoria', categoria: 'gastronomia', lat: -32.9201729, lng: -60.8116640 },
  { nombre: 'Las Vegas Country', categoria: 'gastronomia', lat: -32.9290317, lng: -60.8146779 },
]

// Distancia en km entre dos puntos (haversine)
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

// "2,3" — coma decimal, formato argentino, 1 decimal
export function formatKm(km: number): string {
  return km.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

export interface PoiConDistancia extends Poi {
  km: number
}

// Los `top` POIs más cercanos de cada categoría desde un punto dado,
// ordenados por distancia. Devuelve un mapa categoría → POIs.
export function cercaniasPorCategoria(
  lat: number,
  lng: number,
  top = 2,
): Record<PoiCategoria, PoiConDistancia[]> {
  const out = {} as Record<PoiCategoria, PoiConDistancia[]>
  for (const cat of Object.keys(POI_CATEGORIA_META) as PoiCategoria[]) {
    out[cat] = POIS_FUNES.filter(p => p.categoria === cat)
      .map(p => ({ ...p, km: haversineKm(lat, lng, p.lat, p.lng) }))
      .sort((a, b) => a.km - b.km)
      .slice(0, top)
  }
  return out
}
