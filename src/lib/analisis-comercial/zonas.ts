// Zonas, rubros e íconos del Análisis comercial de Funes.
// Módulo puro: NO importa leaflet (lo usan tanto el informe como el mapa).

export type ZonaKey = 'R' | 'F' | 'G' | 'Y' | 'P' | 'C' | 'V' | 'X'

export const ZONAS: Record<ZonaKey, { nombre: string; corto: string; color: string }> = {
  R: { nombre: 'Ruta 9 · Av. Córdoba', corto: 'Ruta 9', color: '#E7A93B' },
  F: { nombre: 'Fuerza Aérea / Illia', corto: 'F. Aérea', color: '#3C72D4' },
  G: { nombre: 'Av. Galindo', corto: 'Galindo', color: '#BC5A90' },
  Y: { nombre: 'Av. Hipólito Yrigoyen', corto: 'Yrigoyen', color: '#DD7349' },
  P: { nombre: 'Centro · Plaza San José', corto: 'Centro', color: '#7460D4' },
  C: { nombre: 'Polo Calmo', corto: 'Calmo', color: '#1FA5A0' },
  V: { nombre: 'Vida Multiespacio', corto: 'Vida M.', color: '#3C9C64' },
  X: { nombre: 'Resto de Funes', corto: 'Otros', color: '#8A9597' },
}

/** Trazas simplificadas de cada avenida, [lat, lng]. */
export const AVENIDAS: Record<'R' | 'F' | 'G' | 'Y', [number, number][][]> = {"R":[[[-32.91309,-60.86789],[-32.91396,-60.86211]],[[-32.91399,-60.86138],[-32.91499,-60.85552]],[[-32.91501,-60.85285],[-32.91511,-60.8512]],[[-32.91542,-60.85143],[-32.9153,-60.8525]],[[-32.91624,-60.84347],[-32.91646,-60.84184]],[[-32.91649,-60.84163],[-32.91672,-60.84009]],[[-32.924,-60.78268],[-32.92263,-60.80483],[-32.91908,-60.82494],[-32.91285,-60.86784]],[[-32.92529,-60.76325],[-32.92469,-60.7714]]],"F":[[[-32.93028,-60.84656],[-32.931,-60.86693]],[[-32.9302,-60.84298],[-32.92941,-60.8202]],[[-32.92942,-60.81999],[-32.92948,-60.82772],[-32.93044,-60.84629]],[[-32.92904,-60.81232],[-32.92943,-60.81955]],[[-32.92905,-60.812],[-32.92841,-60.79351]],[[-32.92857,-60.79322],[-32.92824,-60.78716],[-32.92847,-60.78642]],[[-32.92821,-60.78633],[-32.92824,-60.78716]],[[-32.92843,-60.78598],[-32.92809,-60.78244]],[[-32.92834,-60.78309],[-32.92831,-60.78235]],[[-32.9278,-60.77492],[-32.92758,-60.76984]]],"G":[[[-32.91554,-60.82016],[-32.9191,-60.81999]],[[-32.9296,-60.82003],[-32.93282,-60.82001]],[[-32.92941,-60.82],[-32.91912,-60.82037]],[[-32.93434,-60.81996],[-32.93741,-60.81973]],[[-32.91513,-60.81975],[-32.91102,-60.81874]],[[-32.95283,-60.81941],[-32.9432,-60.8197]]],"Y":[[[-32.92929,-60.81202],[-32.9408,-60.81161]],[[-32.92152,-60.811],[-32.92902,-60.8123]],[[-32.91836,-60.81021],[-32.92152,-60.811]],[[-32.89467,-60.80945],[-32.90048,-60.80922]],[[-32.89467,-60.80936],[-32.90718,-60.80849]],[[-32.90719,-60.8089],[-32.91073,-60.80874]],[[-32.91071,-60.80832],[-32.91589,-60.80955]]]}

export type Polo =
  | { k: 'P' | 'C'; lat: number; lng: number; r: number }
  | { k: 'V'; box: [number, number, number, number] }

export const POLOS: Polo[] = [
  { k: 'P', lat: -32.9205, lng: -60.8108, r: 350 },
  { k: 'C', lat: -32.93837, lng: -60.81507, r: 300 },
  { k: 'V', box: [-32.9299, -60.7988, -32.9283, -60.7933] },
]

export type RubroKey = 'g' | 'a' | 'i' | 's' | 'b' | 'h' | 'v' | 'd' | 'm' | 'e' | 'o' | 'r' | 'f' | 'x'

export const RUBROS: { k: RubroKey; nombre: string; corto: string; color: string }[] = [
  { k: 'g', nombre: 'Gastronomía', corto: 'Gastronomía', color: '#E4572E' },
  { k: 'a', nombre: 'Almacén y alimentos', corto: 'Almacén', color: '#F29E4C' },
  { k: 'i', nombre: 'Indumentaria', corto: 'Indumentaria', color: '#C0399B' },
  { k: 's', nombre: 'Salud', corto: 'Salud', color: '#2E86DE' },
  { k: 'b', nombre: 'Belleza y estética', corto: 'Belleza', color: '#EF6FA8' },
  { k: 'h', nombre: 'Hogar, deco y construcción', corto: 'Hogar y obra', color: '#8C6D46' },
  { k: 'v', nombre: 'Automotor', corto: 'Autos', color: '#56606B' },
  { k: 'd', nombre: 'Deporte y bienestar', corto: 'Deporte', color: '#26A96C' },
  { k: 'm', nombre: 'Mascotas', corto: 'Mascotas', color: '#9B6BD6' },
  { k: 'e', nombre: 'Educación, librería y juguetes', corto: 'Librería', color: '#B8A21A' },
  { k: 'o', nombre: 'Hotelería', corto: 'Hoteles', color: '#5DADE2' },
  { k: 'r', nombre: 'Inmobiliarias', corto: 'Inmobiliarias', color: '#1B998B' },
  { k: 'f', nombre: 'Servicios y oficinas', corto: 'Servicios', color: '#8A9597' },
  { k: 'x', nombre: 'Sin rubro definido', corto: 'Sin rubro', color: '#A7B0AE' },
]

export const RUBRO_COLOR = Object.fromEntries(RUBROS.map((r) => [r.k, r.color])) as Record<string, string>
export const RUBRO_NOMBRE = Object.fromEntries(RUBROS.map((r) => [r.k, r.nombre])) as Record<string, string>

/** Paths SVG (viewBox 24, stroke) por rubro. */
export const ICONOS: Record<string, string> = {
  "all": "<path d=\"M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z\"/>",
  "g": "<path d=\"M7 3v8M5 3v5a2 2 0 004 0V3M7 11v10M16 3c-2 1-3 3-3 6v3h3v9M16 3v18\"/>",
  "a": "<path d=\"M3 9h18l-2 11H5zM8 9l3-5M16 9l-3-5M9 13v4M15 13v4\"/>",
  "i": "<path d=\"M9 3l3 3 3-3 5 3-2 5-3-1v11H9V10l-3 1-2-5z\"/>",
  "s": "<path d=\"M9 3h6v6h6v6h-6v6H9v-6H3V9h6z\"/>",
  "b": "<circle cx=\"6\" cy=\"18\" r=\"3\"/><circle cx=\"18\" cy=\"18\" r=\"3\"/><path d=\"M8 16L19 4M16 16L5 4\"/>",
  "h": "<path d=\"M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6\"/>",
  "v": "<path d=\"M3 16v-4l2-5h14l2 5v4H3zM3 12h18\"/><circle cx=\"7\" cy=\"17\" r=\"2\"/><circle cx=\"17\" cy=\"17\" r=\"2\"/>",
  "d": "<path d=\"M6 8v8M3 10v4M18 8v8M21 10v4M6 12h12\"/>",
  "m": "<circle cx=\"7\" cy=\"10\" r=\"2\"/><circle cx=\"12\" cy=\"6\" r=\"2\"/><circle cx=\"17\" cy=\"10\" r=\"2\"/><path d=\"M8 18c0-3 2-5 4-5s4 2 4 5c0 2-2 2-4 1-2 1-4 1-4-1z\"/>",
  "e": "<path d=\"M4 5c3-1 6-1 8 1 2-2 5-2 8-1v14c-3-1-6-1-8 1-2-2-5-2-8-1zM12 6v14\"/>",
  "o": "<path d=\"M3 18V7M3 13h18v5M21 13v-2a3 3 0 00-3-3h-7v5\"/><circle cx=\"7\" cy=\"11\" r=\"2\"/>",
  "r": "<circle cx=\"8\" cy=\"15\" r=\"4\"/><path d=\"M11 12l9-9M17 6l3 3M15 8l2 2\"/>",
  "f": "<path d=\"M4 8h16v11H4zM9 8V5h6v3M4 13h16\"/>",
  "x": "<path d=\"M4 10l1-5h14l1 5M5 10v10h14V10M4 10h16M10 20v-5h4v5\"/>"
}

export const ESTADOS: Record<string, string> = {
  abierto: 'Abierto',
  libre: 'Local libre',
  proximo: 'Próxima apertura',
  obra: 'En obra',
  cerrado: 'Cerrado',
}

export type Comercio = [lat: number, lng: number, rubro: string, zona: string, detalle: string, nombre: string, estado: string]
