// Capa base compartida de todos los mapas Leaflet del sitio.
//
// Carto exige API key para sus basemaps desde ago-2026: sin key los tiles
// llegan con un watermark "API KEY REQUIRED" atravesado. La key es pública
// (viaja en la URL de cada tile) y se configura como NEXT_PUBLIC_CARTO_KEY
// en Vercel. Si falta o se vacía, caemos a OpenStreetMap estándar — menos
// lindo, pero jamás un watermark en producción.
//
// La atribución CARTO + OSM debe permanecer visible: es la condición del
// tier gratuito de la key (5M tiles/mes).

const CARTO_KEY = process.env.NEXT_PUBLIC_CARTO_KEY

export interface BaseTiles {
  url: string
  attribution: string
  /** Zoom máximo con tiles reales; por encima Leaflet escala la imagen. */
  maxNativeZoom: number
}

const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'

const OSM_FALLBACK: BaseTiles = {
  url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  maxNativeZoom: 19,
}

function cartoTiles(style: string): BaseTiles {
  return {
    url: `https://{s}.basemaps.cartocdn.com/${style}/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`,
    attribution: CARTO_ATTRIBUTION,
    maxNativeZoom: 20,
  }
}

/** Estilo Voyager (calles con color) — /propiedades, cercanas, tasaciones. */
export const VOYAGER_TILES: BaseTiles = CARTO_KEY ? cartoTiles('rastertiles/voyager') : OSM_FALLBACK

/** Estilo Positron light (gris neutro) — /nosotros, barrios privados, plano Distrito Roldán. */
export const LIGHT_TILES: BaseTiles = CARTO_KEY ? cartoTiles('light_all') : OSM_FALLBACK
