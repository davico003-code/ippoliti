import { getProperties, getPropiedadesVendidas, sanitizeProperty, type TokkoProperty } from '@/lib/tokko'
import { BARRIOS, getBarrioBySlug } from '@/lib/barrios'
import { propertyMatchesBarrio } from './barrio-matcher'

// Sin cache propio (antes: Redis 1 h que nadie limpiaba → una vendida seguía
// "disponible" hasta 2 h). El listado y las vendidas salen del Data Cache con
// el tag que HILO invalida en cada cambio de estado, así que esto ya llega
// fresco y filtrar ~250 en memoria no cuesta nada.

/** Placas "Vendida" por sección: las más nuevas; no tapan al stock disponible. */
const MAX_VENDIDAS = 6

type TipoPropiedad = 'Terreno' | 'Casa' | 'Departamento' | 'Todos'

function matchesType(p: TokkoProperty, tipo: TipoPropiedad): boolean {
  if (tipo === 'Todos') return true
  const name = (p.type?.name ?? '').toLowerCase()
  if (tipo === 'Terreno') return name === 'land' || name === 'terreno'
  if (tipo === 'Casa') return name === 'house' || name === 'casa'
  if (tipo === 'Departamento') return name === 'apartment' || name === 'departamento'
  return true
}

function operationTimestamp(p: TokkoProperty): number {
  // Tokko no expone created_at en TokkoProperty tipado; usamos id como proxy
  // (los IDs son monótonos crecientes en Tokko).
  return p.id ?? 0
}

export interface BarrioPropertiesResult {
  properties: TokkoProperty[]
  /** Vendidas por nosotros: van como placa "Vendida", sin precio ni link. */
  vendidas: TokkoProperty[]
  total: number
  lastUpdate: string
  cached: boolean
}

export async function getPropiedadesByBarrio(
  slug: string,
  tipo: TipoPropiedad = 'Todos',
): Promise<BarrioPropertiesResult> {
  const barrio = getBarrioBySlug(slug)
  if (!barrio) {
    return { properties: [], vendidas: [], total: 0, lastUpdate: new Date().toISOString(), cached: false }
  }

  const delBarrio = (p: TokkoProperty) => propertyMatchesBarrio(p, barrio) && matchesType(p, tipo)

  // Traemos TODO el inventario (el feed ronda las ~250) para que el match por
  // barrio no se corte: con limit:100 se perdían las propiedades del resto.
  const [all, todasVendidas] = await Promise.all([getProperties({ limit: 1000 }), getPropiedadesVendidas()])
  // El orden de HILO manda (última venta primero).
  const vendidas = todasVendidas.filter(delBarrio).slice(0, MAX_VENDIDAS).map(sanitizeProperty)
  // Una propiedad es UNA placa: si ya figura vendida, no puede seguir como
  // disponible aunque el listado venga de unos segundos antes de la venta.
  const idsVendidas = new Set(todasVendidas.map((p) => p.id))
  const filtered = (all.objects ?? [])
    .filter((p) => delBarrio(p) && !idsVendidas.has(p.id))
    .map(sanitizeProperty)
    .sort((a, b) => operationTimestamp(b) - operationTimestamp(a))

  return {
    properties: filtered,
    vendidas,
    total: filtered.length,
    lastUpdate: new Date().toISOString(),
    cached: false,
  }
}

export async function getCountsByBarrio(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {}
  try {
    // Traemos TODO el inventario (el feed ronda las ~250) para que el match por
  // barrio no se corte: con limit:100 se perdían las propiedades del resto.
  const all = await getProperties({ limit: 1000 })
    for (const barrio of BARRIOS) {
      counts[barrio.slug] = (all.objects ?? []).filter((p) =>
        propertyMatchesBarrio(p, barrio),
      ).length
    }
  } catch (err) {
    console.warn('[barrios] getCountsByBarrio error:', err)
    for (const b of BARRIOS) counts[b.slug] = 0
  }
  return counts
}
