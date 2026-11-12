/**
 * Config compartida del mapa de /propiedades (encuadre inicial y fly-to).
 *
 * Vive separada de PropiedadesMap.tsx a propósito: PropiedadesView necesita
 * estas constantes pero carga el mapa con dynamic() — un import estático de
 * PropiedadesMap (aunque sea solo para constantes) arrastraría leaflet,
 * react-leaflet y markercluster al First Load JS de /propiedades.
 * Este módulo NO debe importar leaflet ni react-leaflet.
 */

// ─── Encuadre inicial fijo ───────────────────────────────────────────────────
//
// Centrado en Funes y Roldán (pedido de David, 15-oct: abrir con Roldán a Fisherton
// dejaba el celular demasiado lejos, con San Lorenzo y Pérez a la vista). NO
// depende de los resultados del listado — la posición es estable a través de
// recargas y filtros que no aplican zona.

export const DEFAULT_CENTER: [number, number] = [-32.915, -60.8515]
export const DEFAULT_ZOOM = 12

// Lo que tiene que entrar en el encuadre inicial: Roldán y Funes. El mapa elige
// el zoom según el tamaño, hasta 12: en el celular entran los dos justos; en la
// compu, con más ancho, se ve también alrededor. [sur-oeste, nor-este].
export const DEFAULT_BOUNDS: [[number, number], [number, number]] = [[-32.94, -60.906], [-32.89, -60.797]]
export const DEFAULT_BOUNDS_OPCIONES = { padding: [16, 16] as [number, number], maxZoom: DEFAULT_ZOOM }

// El tercer slot del tuple es el zoom destino. Sin él, asume 16 (zoom in a
// una propiedad seleccionada). Pasarlo explícito sirve para reset al
// encuadre inicial: [DEFAULT_LAT, DEFAULT_LNG, DEFAULT_ZOOM].
export type FlyToTarget = [number, number] | [number, number, number]

/** El destino es volver al encuadre inicial (el mapa lo resuelve con DEFAULT_BOUNDS). */
export function esEncuadreInicial(t: FlyToTarget): boolean {
  return t[0] === DEFAULT_CENTER[0] && t[1] === DEFAULT_CENTER[1] && t[2] === DEFAULT_ZOOM
}

// Lo que la persona dejó a la vista moviendo el mapa: el listado muestra lo que
// cae adentro de los bordes, y el centro/zoom sirven para volver a abrir el
// mapa en el mismo lugar (celular: lista → mapa lo vuelve a montar).
export interface ZonaMapa {
  south: number
  north: number
  west: number
  east: number
  lat: number
  lng: number
  zoom: number
}
