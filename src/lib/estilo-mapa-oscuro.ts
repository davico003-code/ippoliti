// Estilo del mapa de calles en modo oscuro, calcado del modo noche de Google
// Maps: fondo azul pizarra (no negro), calles más claras que las manzanas,
// avenidas y rutas en tono cálido, agua azul profundo, parques verde oscuro y
// nombres legibles. Antes era Dark Matter de CARTO aclarado por CSS: casi
// negro, calles finitas y sin agua ni verde distinguibles.
//
// Lo dibuja MapLibre (vectorial) dentro del Leaflet de siempre, con los datos
// de OpenFreeMap (OpenStreetMap, esquema OpenMapTiles): gratis y sin key. La
// atribución OSM es obligatoria y se muestra en el control de Leaflet.

import type { StyleSpecification } from 'maplibre-gl'

const OFM = 'https://tiles.openfreemap.org'

export const ATRIBUCION_OSM =
  '&copy; <a href="https://openfreemap.org">OpenFreeMap</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'

// Paleta del modo noche de Google.
const C = {
  fondo: '#242f3e',
  manzana: '#2a3546',
  edificio: '#2f3b4d',
  parque: '#263c3f',
  parqueTexto: '#6b9a76',
  agua: '#17263c',
  aguaTexto: '#515c6d',
  calle: '#38414e',
  calleBorde: '#212a37',
  calleTexto: '#9ca5b3',
  avenida: '#4a5464',
  ruta: '#746855',
  rutaBorde: '#1f2835',
  rutaTexto: '#f3d19c',
  tren: '#2f3948',
  limite: '#4b5563',
  ciudad: '#d59563',
  barrio: '#a4acb8',
  halo: '#1b2330',
}

const FUENTE = ['Noto Sans Regular']
const FUENTE_BOLD = ['Noto Sans Bold']
const FUENTE_ITALICA = ['Noto Sans Italic']

// Ancho de línea según zoom: [z, ancho] → interpolación exponencial.
function ancho(...pares: [number, number][]) {
  return ['interpolate', ['exponential', 1.5], ['zoom'], ...pares.flat()] as unknown as number
}

const RUTAS = ['motorway', 'trunk']
const AVENIDAS = ['primary', 'secondary']
const CALLES = ['tertiary', 'minor', 'service']

export const ESTILO_MAPA_OSCURO: StyleSpecification = {
  version: 8,
  glyphs: `${OFM}/fonts/{fontstack}/{range}.pbf`,
  sources: {
    osm: { type: 'vector', url: `${OFM}/planet` },
  },
  layers: [
    { id: 'fondo', type: 'background', paint: { 'background-color': C.fondo } },

    // Suelo: zonas urbanas apenas más claras; verdes en parques, bosques y canchas.
    {
      id: 'urbano', type: 'fill', source: 'osm', 'source-layer': 'landuse',
      filter: ['in', ['get', 'class'], ['literal', ['residential', 'suburb', 'neighbourhood', 'commercial', 'retail', 'industrial']]],
      paint: { 'fill-color': C.manzana, 'fill-opacity': 0.6 },
    },
    {
      id: 'verde', type: 'fill', source: 'osm', 'source-layer': 'landcover',
      filter: ['in', ['get', 'class'], ['literal', ['grass', 'wood', 'farmland', 'wetland']]],
      paint: { 'fill-color': C.parque, 'fill-opacity': 0.55 },
    },
    {
      id: 'parques', type: 'fill', source: 'osm', 'source-layer': 'park',
      paint: { 'fill-color': C.parque },
    },
    {
      id: 'verde-urbano', type: 'fill', source: 'osm', 'source-layer': 'landuse',
      filter: ['in', ['get', 'class'], ['literal', ['park', 'pitch', 'cemetery', 'stadium', 'playground']]],
      paint: { 'fill-color': C.parque },
    },

    // Agua.
    { id: 'agua', type: 'fill', source: 'osm', 'source-layer': 'water', paint: { 'fill-color': C.agua } },
    {
      id: 'arroyos', type: 'line', source: 'osm', 'source-layer': 'waterway',
      paint: { 'line-color': C.agua, 'line-width': ancho([8, 0.5], [14, 2], [18, 6]) },
    },

    // Edificios, solo de cerca.
    {
      id: 'edificios', type: 'fill', source: 'osm', 'source-layer': 'building', minzoom: 14,
      paint: { 'fill-color': C.edificio, 'fill-opacity': ['interpolate', ['linear'], ['zoom'], 14, 0, 16, 0.8] },
    },

    // Límites de provincia / partido.
    {
      id: 'limites', type: 'line', source: 'osm', 'source-layer': 'boundary',
      filter: ['all', ['<=', ['get', 'admin_level'], 6], ['!=', ['get', 'maritime'], 1]],
      paint: { 'line-color': C.limite, 'line-dasharray': [3, 2], 'line-width': 1 },
    },

    // Calles: primero el borde (casing), después el relleno.
    {
      id: 'calles-borde', type: 'line', source: 'osm', 'source-layer': 'transportation', minzoom: 12,
      filter: ['in', ['get', 'class'], ['literal', CALLES]],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': C.calleBorde, 'line-width': ancho([12, 1], [14, 3], [18, 18]) },
    },
    {
      id: 'calles', type: 'line', source: 'osm', 'source-layer': 'transportation', minzoom: 11,
      filter: ['in', ['get', 'class'], ['literal', CALLES]],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': C.calle, 'line-width': ancho([11, 0.5], [14, 2], [18, 15]) },
    },
    {
      id: 'tren', type: 'line', source: 'osm', 'source-layer': 'transportation', minzoom: 10,
      filter: ['==', ['get', 'class'], 'rail'],
      paint: { 'line-color': C.tren, 'line-width': ancho([10, 1], [16, 3]) },
    },
    {
      id: 'avenidas-borde', type: 'line', source: 'osm', 'source-layer': 'transportation', minzoom: 9,
      filter: ['in', ['get', 'class'], ['literal', AVENIDAS]],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': C.calleBorde, 'line-width': ancho([9, 1], [14, 5], [18, 24]) },
    },
    {
      id: 'avenidas', type: 'line', source: 'osm', 'source-layer': 'transportation', minzoom: 8,
      filter: ['in', ['get', 'class'], ['literal', AVENIDAS]],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': C.avenida, 'line-width': ancho([8, 0.6], [14, 3.5], [18, 20]) },
    },
    {
      id: 'rutas-borde', type: 'line', source: 'osm', 'source-layer': 'transportation', minzoom: 6,
      filter: ['in', ['get', 'class'], ['literal', RUTAS]],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': C.rutaBorde, 'line-width': ancho([6, 1], [14, 6], [18, 28]) },
    },
    {
      id: 'rutas', type: 'line', source: 'osm', 'source-layer': 'transportation', minzoom: 5,
      filter: ['in', ['get', 'class'], ['literal', RUTAS]],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': C.ruta, 'line-width': ancho([5, 0.6], [14, 4.5], [18, 24]) },
    },

    // Nombres.
    {
      id: 'agua-nombres', type: 'symbol', source: 'osm', 'source-layer': 'water_name',
      layout: { 'text-field': ['get', 'name'], 'text-font': FUENTE_ITALICA, 'text-size': 12 },
      paint: { 'text-color': C.aguaTexto, 'text-halo-color': C.halo, 'text-halo-width': 1 },
    },
    {
      id: 'parques-nombres', type: 'symbol', source: 'osm', 'source-layer': 'poi', minzoom: 14,
      filter: ['in', ['get', 'class'], ['literal', ['park', 'garden', 'golf']]],
      layout: { 'text-field': ['get', 'name'], 'text-font': FUENTE, 'text-size': 11, 'text-max-width': 8 },
      paint: { 'text-color': C.parqueTexto, 'text-halo-color': C.halo, 'text-halo-width': 1 },
    },
    {
      id: 'calles-nombres', type: 'symbol', source: 'osm', 'source-layer': 'transportation_name', minzoom: 13,
      filter: ['in', ['get', 'class'], ['literal', [...CALLES, ...AVENIDAS]]],
      layout: {
        'symbol-placement': 'line', 'text-field': ['get', 'name'], 'text-font': FUENTE,
        'text-size': ['interpolate', ['linear'], ['zoom'], 13, 10, 18, 14],
      },
      paint: { 'text-color': C.calleTexto, 'text-halo-color': C.halo, 'text-halo-width': 1.2 },
    },
    {
      id: 'rutas-nombres', type: 'symbol', source: 'osm', 'source-layer': 'transportation_name', minzoom: 10,
      filter: ['in', ['get', 'class'], ['literal', RUTAS]],
      layout: {
        'symbol-placement': 'line', 'text-field': ['coalesce', ['get', 'ref'], ['get', 'name']], 'text-font': FUENTE,
        'text-size': 11,
      },
      paint: { 'text-color': C.rutaTexto, 'text-halo-color': C.halo, 'text-halo-width': 1.2 },
    },
    {
      id: 'barrios', type: 'symbol', source: 'osm', 'source-layer': 'place', minzoom: 12,
      filter: ['in', ['get', 'class'], ['literal', ['suburb', 'neighbourhood', 'quarter', 'hamlet']]],
      layout: {
        'text-field': ['get', 'name'], 'text-font': FUENTE, 'text-transform': 'uppercase',
        'text-letter-spacing': 0.08, 'text-size': 11, 'text-max-width': 8,
      },
      paint: { 'text-color': C.barrio, 'text-halo-color': C.halo, 'text-halo-width': 1.2 },
    },
    {
      id: 'ciudades', type: 'symbol', source: 'osm', 'source-layer': 'place',
      filter: ['in', ['get', 'class'], ['literal', ['city', 'town', 'village']]],
      layout: {
        'text-field': ['get', 'name'], 'text-font': FUENTE_BOLD,
        'text-size': ['interpolate', ['linear'], ['zoom'], 8, 11, 14, 16],
      },
      paint: { 'text-color': C.ciudad, 'text-halo-color': C.halo, 'text-halo-width': 1.5 },
    },
  ],
}
