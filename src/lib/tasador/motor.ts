// Motor del tasador online (método del costo).
//
//   Valor = Tierra + Construcción depreciada + Extras
//     Tierra       = m² de lote × USD/m² de tierra del barrio (feed HILO)
//     Construcción = (cubiertos × costoM2) + (semicubiertos × costoM2/2)   ← misma
//                    fórmula que la Calculadora de Costos de /recursos, para que
//                    los dos números del sitio sean coherentes.
//                  × depreciación (antigüedad) × estado
//
// El costo/m² NO se hardcodea acá: entra por parámetro desde
// lib/costos-construccion (matriz Llave en Mano con ajuste mensual 2%), así el
// tasador se actualiza solo cuando se actualizan los costos.

export type AntiguedadId = 'estrenar' | 'hasta10' | 'de10a25' | 'mas25'
export type EstadoId = 'impecable' | 'muybueno' | 'bueno' | 'refaccionar'

// Depreciación por antigüedad. Criterio Ross-Heidecke simplificado: la
// construcción pierde valor rápido los primeros años y después se amesetá.
export const ANTIGUEDAD: { id: AntiguedadId; label: string; factor: number }[] = [
  { id: 'estrenar', label: 'A estrenar', factor: 1 },
  { id: 'hasta10', label: 'Hasta 10 años', factor: 0.93 },
  { id: 'de10a25', label: '10 a 25 años', factor: 0.82 },
  { id: 'mas25', label: 'Más de 25 años', factor: 0.68 },
]

// Estado de conservación: ajusta sobre la depreciación por edad.
export const ESTADO: { id: EstadoId; label: string; factor: number }[] = [
  { id: 'impecable', label: 'Impecable', factor: 1.05 },
  { id: 'muybueno', label: 'Muy bueno', factor: 1 },
  { id: 'bueno', label: 'Bueno', factor: 0.88 },
  { id: 'refaccionar', label: 'A refaccionar', factor: 0.72 },
]

// Extras que suman valor por fuera del m² construido.
export const EXTRAS: { id: string; label: string; usd: number }[] = [
  { id: 'pileta', label: 'Pileta', usd: 12000 },
  { id: 'quincho', label: 'Quincho / parrillero', usd: 8000 },
  { id: 'cochera', label: 'Cochera cubierta', usd: 6000 },
]

// Amplitud del rango que se muestra. Una estimación online honesta no da un
// número exacto: da una banda. Se ensancha si el precio de tierra viene del
// promedio de la ciudad en vez de muestras del propio barrio.
const MARGEN_BASE = 0.1
const MARGEN_SIN_DATO_BARRIO = 0.15

export interface EntradaTasacion {
  loteM2: number
  cubiertosM2: number
  semicubiertosM2?: number
  ppm2Tierra: number
  costoM2Construccion: number
  antiguedad: AntiguedadId
  estado: EstadoId
  extras?: string[]
  fuenteTierra?: 'manual' | 'curado' | 'barrio' | 'ciudad'
}

export interface ResultadoTasacion {
  tierra: number
  construccion: number
  extras: number
  total: number
  min: number
  max: number
  factorDepreciacion: number
}

const factorDe = <T extends { id: string; factor: number }>(arr: T[], id: string) =>
  arr.find((x) => x.id === id)?.factor ?? 1

export function tasar(e: EntradaTasacion): ResultadoTasacion {
  const lote = Math.max(0, e.loteM2 || 0)
  const cub = Math.max(0, e.cubiertosM2 || 0)
  const semi = Math.max(0, e.semicubiertosM2 || 0)

  const tierra = lote * (e.ppm2Tierra || 0)

  // Misma fórmula que la Calculadora de Costos: el semicubierto vale la mitad.
  const construccionNueva = cub * e.costoM2Construccion + semi * (e.costoM2Construccion / 2)
  const factorDepreciacion = factorDe(ANTIGUEDAD, e.antiguedad) * factorDe(ESTADO, e.estado)
  const construccion = construccionNueva * factorDepreciacion

  const extras = (e.extras ?? []).reduce(
    (sum, id) => sum + (EXTRAS.find((x) => x.id === id)?.usd ?? 0),
    0,
  )

  const total = tierra + construccion + extras
  const margen = e.fuenteTierra === 'ciudad' ? MARGEN_SIN_DATO_BARRIO : MARGEN_BASE

  return {
    tierra,
    construccion,
    extras,
    total,
    min: total * (1 - margen),
    max: total * (1 + margen),
    factorDepreciacion,
  }
}

export const fmtUSD = (n: number) =>
  'USD ' + new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(Math.round(n))


// ── Departamentos ──────────────────────────────────────────────────────────
// Un departamento no se valúa por el método del costo (no tiene lote propio ni
// se "reconstruye" solo): se compara contra unidades similares de la zona.
//
//   Valor = m² cubiertos × USD/m² de la zona × antigüedad × estado
//           + cochera + ajuste por amenities
//
// El USD/m² sale de los departamentos en venta del feed HILO en ese barrio
// (o el promedio de la ciudad si el barrio no tiene muestra propia).

export const AMENITIES_DEPTO: { id: string; label: string; factor: number }[] = [
  { id: 'sinamenities', label: 'Sin amenities', factor: 1 },
  { id: 'basicos', label: 'Básicos (SUM, laundry)', factor: 1.04 },
  { id: 'completos', label: 'Completos (pileta, gym)', factor: 1.09 },
]

export const COCHERA_USD = 15000

export interface EntradaDepto {
  cubiertosM2: number
  ppm2Zona: number
  antiguedad: AntiguedadId
  estado: EstadoId
  amenities?: string
  cochera?: boolean
  fuenteZona?: 'manual' | 'curado' | 'barrio' | 'ciudad'
}

export function tasarDepartamento(e: EntradaDepto): ResultadoTasacion {
  const cub = Math.max(0, e.cubiertosM2 || 0)
  const factorAmen = AMENITIES_DEPTO.find((a) => a.id === e.amenities)?.factor ?? 1
  const factorDepreciacion = factorDe(ANTIGUEDAD, e.antiguedad) * factorDe(ESTADO, e.estado)

  // El m² de la zona ya refleja el mercado (incluye la parte proporcional del
  // terreno), así que la depreciación acá es un ajuste fino, no el grueso.
  const construccion = cub * e.ppm2Zona * factorDepreciacion * factorAmen
  const extras = e.cochera ? COCHERA_USD : 0
  const total = construccion + extras
  const margen = e.fuenteZona === 'ciudad' ? MARGEN_SIN_DATO_BARRIO : MARGEN_BASE

  return {
    tierra: 0,
    construccion,
    extras,
    total,
    min: total * (1 - margen),
    max: total * (1 + margen),
    factorDepreciacion,
  }
}
