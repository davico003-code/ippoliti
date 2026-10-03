import { getPropertyById, type TokkoProperty } from '@/lib/tokko'

export type AgentePropiedad = { name: string; picture: string }

// El listado (feed lean) no trae el agente: lo sacamos del detalle, cacheado
// 1 h igual que la ficha. Si falla o no tiene foto, esa card va sin burbuja.
export async function getAgentesPorIds(ids: number[]): Promise<Map<number, AgentePropiedad>> {
  const pares = await Promise.all(
    ids.map(async (id) => {
      try {
        const prod = (await getPropertyById(id)).producer
        const name = prod?.name?.trim()
        return name && prod?.picture ? ([id, { name, picture: prod.picture }] as const) : null
      } catch {
        return null
      }
    }),
  )
  return new Map(pares.filter((x): x is NonNullable<typeof x> => x !== null))
}

export function getAgentesPorPropiedad(properties: TokkoProperty[]): Promise<Map<number, AgentePropiedad>> {
  return getAgentesPorIds(properties.map((p) => p.id))
}
