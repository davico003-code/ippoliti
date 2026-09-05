// Contrato de la API pública de tasación de Hilo (meethilo.com/api/public/tasacion/*)
// tal como la consume la web. Si Hilo cambia el shape, se ajusta acá y en
// hilo.ts (normalización), no en los componentes.

export type TipoTasacion = 'casa' | 'lote' | 'depto'

export type Ciudad = 'Funes' | 'Roldán' | 'Rosario' | string

export interface BarrioTasacion {
  id: string
  nombre: string
  slug: string
  ciudad: Ciudad
  esCerrado: boolean | null
  centroide: { lat: number; lng: number } | null
  m2Tipico: { lote: number | null; cubiertos: number | null }
  /** Cantidad de comparables por tipo. Hilo puede mandar boolean (tiene/no
   *  tiene) o número; la web trata boolean como 1/0. */
  tiene: { casas: number | boolean; lotes: number | boolean; deptos: number | boolean }
}

export interface MuestraComparable {
  precio: number
  m2Cubiertos: number | null
  m2Lote: number | null
  dormitorios: number | null
  fuente: string
}

export type NivelComparables = 1 | 2 | 3 | 4
export type AmbitoComparables = 'barrio' | 'zona' | 'ciudad' | null
export type UnidadRango = 'total' | 'usd_m2' | null

export interface ComparablesResponse {
  nivel: NivelComparables
  ambito: AmbitoComparables
  n: number
  rango: { min: number; max: number } | null
  unidad: UnidadRango
  /** Ej. "según 6 casas de 180 a 260 m² publicadas en Miraflores" */
  descripcion: string
  /** Ej. "agosto 2026" */
  periodo: string
  /** Máximo 3, tal como están publicadas, sin direcciones. */
  muestras: MuestraComparable[]
  /** Opcional: los n valores (precio total o USD/m² según `unidad`) para el
   *  dot plot. Si Hilo no lo manda, la web dibuja solo min, max y muestras. */
  precios?: number[]
  barrio: { id: string; nombre: string; ciudad: Ciudad; esCerrado: boolean | null } | null
}

export interface ComparablesQuery {
  barrioId: string
  tipo: TipoTasacion
  m2Cubiertos?: number | null
  m2Lote?: number | null
  lat?: number | null
  lng?: number | null
}

export interface UtmTasacion {
  source: string | null
  medium: string | null
  campaign: string | null
  content: string | null
}

/** Lo que viaja dentro del lead a Hilo (HiloLeadPayload.tasacion). */
export interface TasacionLead {
  barrioId: string
  barrioNombre: string
  ciudad: string
  esCerrado: boolean | null
  tipo: TipoTasacion
  m2Cubiertos: number | null
  m2Lote: number | null
  rangoVisto: { min: number; max: number } | null
  nivel: NivelComparables
  n: number
  lat: number | null
  lng: number | null
  utm: UtmTasacion | null
  paginaUrl: string
}
