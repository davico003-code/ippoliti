import { getPropertyById, type TokkoProperty } from '@/lib/tokko'

type Agente = { name: string; picture: string }

// El listado (feed lean) no trae el agente: lo sacamos del detalle, cacheado
// 1 h igual que la ficha. Si falla o no tiene foto, esa card va sin burbuja.
export async function getAgentesPorPropiedad(properties: TokkoProperty[]): Promise<Map<number, Agente>> {
  const pares = await Promise.all(
    properties.map(async (p) => {
      try {
        const prod = (await getPropertyById(p.id)).producer
        const name = prod?.name?.trim()
        return name && prod?.picture ? ([p.id, { name, picture: prod.picture }] as const) : null
      } catch {
        return null
      }
    }),
  )
  return new Map(pares.filter((x): x is NonNullable<typeof x> => x !== null))
}
