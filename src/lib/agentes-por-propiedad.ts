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

// Si el listado ya trae el agente (feed de HILO), se usa directo; solo las que
// no lo traen van al detalle.
export async function getAgentesPorPropiedad(properties: TokkoProperty[]): Promise<Map<number, AgentePropiedad>> {
  const out = new Map<number, AgentePropiedad>()
  for (const p of properties) if (p.agente) out.set(p.id, p.agente)
  const faltan = properties.filter((p) => p.agente === undefined).map((p) => p.id)
  if (faltan.length) (await getAgentesPorIds(faltan)).forEach((a, id) => out.set(id, a))
  return out
}
