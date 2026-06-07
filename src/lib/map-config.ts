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
// Centroide entre Funes, Roldán y Fisherton para que arranquen los 3 polos
// del corredor oeste visibles. NO depende de los resultados del listado —
// la posición es estable a través de recargas y filtros que no aplican zona.

export const DEFAULT_CENTER: [number, number] = [-32.9145, -60.8200]
export const DEFAULT_ZOOM = 12

// El tercer slot del tuple es el zoom destino. Sin él, asume 16 (zoom in a
// una propiedad seleccionada). Pasarlo explícito sirve para reset al
// encuadre inicial: [DEFAULT_LAT, DEFAULT_LNG, DEFAULT_ZOOM].
export type FlyToTarget = [number, number] | [number, number, number]
