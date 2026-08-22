import type { BarrioTasador } from '@/lib/tasador/barrios'

export type TipoTasador = 'casa' | 'lote' | 'departamento'

const CIUDADES_CON_REFERENCIA = new Set(['funes', 'roldan', 'rosario'])

/**
 * Una landing del tasador solo debe competir en buscadores cuando tiene una
 * referencia local defendible. Las demás siguen funcionando para usuarios que
 * llegan por enlace directo, pero se excluyen del sitemap y llevan noindex.
 */
export function esLandingTasadorIndexable(
  barrio: BarrioTasador,
  tipo: TipoTasador,
): boolean {
  if (CIUDADES_CON_REFERENCIA.has(barrio.slug)) return true

  if (tipo === 'departamento') return barrio.muestrasDepto >= 3

  return barrio.ppm2Curado != null || barrio.muestras >= 3
}

export function tiposTasadorIndexables(barrio: BarrioTasador): TipoTasador[] {
  return (['casa', 'lote', 'departamento'] as const).filter((tipo) =>
    esLandingTasadorIndexable(barrio, tipo),
  )
}
