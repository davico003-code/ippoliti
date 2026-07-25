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
// lib/costos-construccion (matriz Llave en Mano ajustada por IPC), así el
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
  fuenteTierra?: 'barrio' | 'ciudad'
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

// Ajuste IPC ISR-safe. getAjusteIPC() de lib/costos-construccion usa el cliente
// @upstash/redis (fetch no-store): dentro del render on-demand de una página ISR
// eso dispara DYNAMIC_SERVER_USAGE y devuelve 500 (mismo bug que tenía el blog).
// Acá leemos la serie por REST con fetch cacheable.
export async function getFactorIPCSafe(mesBase: string): Promise<number> {
  const { getCached } = await import('@/lib/redis-isr')
  try {
    const raw = await getCached('indices:IPC', 21600)
    if (!raw) return 1
    const serie = JSON.parse(raw) as { date: string; value: number }[]
    if (!Array.isArray(serie) || serie.length === 0) return 1
    const base = serie.find((p) => p.date.slice(0, 7) === mesBase)
    const ultimo = serie[serie.length - 1]
    if (!base?.value || !ultimo?.value) return 1
    if (ultimo.date.slice(0, 7) <= mesBase) return 1
    return ultimo.value / base.value
  } catch {
    return 1
  }
}
