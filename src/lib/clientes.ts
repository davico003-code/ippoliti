import { redis } from './redis'

export interface Cliente {
  name: string
  slug: string
  description: string
  coverImage: string
  createdAt: string
}

export interface Edificio {
  id: string
  nombre: string
  descripcion: string
  orden: number
}

export interface ClienteFormatted extends Cliente {
  edificios: (Edificio & { tokkoIds: string[] })[]
  sueltasIds: string[]
}

function parse<T>(raw: unknown): T | null {
  if (raw === null || raw === undefined) return null
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw as T
  } catch {
    return null
  }
}

export async function getAllClientes(): Promise<Cliente[]> {
  const index = parse<string[]>(await redis.get('clientes_index'))
  if (!index || index.length === 0) return []
  const results: Cliente[] = []
  for (const slug of index) {
    const c = parse<Cliente>(await redis.get(`cliente:${slug}`))
    if (c) results.push(c)
  }
  return results
}

export async function getClienteBySlug(slug: string): Promise<Cliente | null> {
  return parse<Cliente>(await redis.get(`cliente:${slug}`))
}

export async function getEdificiosByCliente(clienteSlug: string): Promise<Edificio[]> {
  const index = parse<string[]>(await redis.get(`cliente_edificios_index:${clienteSlug}`))
  if (!index || index.length === 0) return []
  const results: Edificio[] = []
  for (const edId of index) {
    const e = parse<Edificio>(await redis.get(`cliente_edificio:${clienteSlug}:${edId}`))
    if (e) results.push(e)
  }
  return results.sort((a, b) => a.orden - b.orden)
}

export async function getPropsByEdificio(edId: string): Promise<string[]> {
  return parse<string[]>(await redis.get(`cliente_edificio_props:${edId}`)) || []
}

export async function getPropsSueltas(clienteSlug: string): Promise<string[]> {
  return parse<string[]>(await redis.get(`cliente_props_sueltas:${clienteSlug}`)) || []
}

export async function getClienteFormatted(slug: string): Promise<ClienteFormatted | null> {
  try {
    const cliente = await getClienteBySlug(slug)
    if (!cliente) return null

    const edificios = await getEdificiosByCliente(slug).catch(() => [] as Edificio[])
    const edificiosWithProps = await Promise.all(
      edificios.map(async ed => ({
        ...ed,
        tokkoIds: await getPropsByEdificio(ed.id).catch(() => [] as string[]),
      }))
    )

    const sueltasIds = await getPropsSueltas(slug).catch(() => [] as string[])

    return { ...cliente, edificios: edificiosWithProps, sueltasIds }
  } catch {
    return null
  }
}
