// Lecturas de los clientes/desarrolladoras que publican con nosotros.
//
// Se lee con los helpers de redis-isr y NO con el cliente crudo de Upstash:
// ese hace sus fetch con cache:'no-store', y una sola lectura así dentro de una
// página con `revalidate` la degrada a render dinámico (adiós caché del CDN) o
// directamente la tumba con 500 en el render estático. Estas funciones las usan
// /emprendimientos y /emprendimientos/[slug], las dos con revalidate.
//
// Los índices se leen de a uno y el contenido con un solo MGET, para no hacer
// una ida y vuelta por cada elemento.

import { getCached, mgetCached } from './redis-isr'

/** Los datos de clientes cambian poco: una hora de caché es de sobra. */
const TTL = 3600

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
  const index = parse<string[]>(await getCached('clientes_index', TTL))
  if (!index || index.length === 0) return []
  const crudos = await mgetCached(index.map((slug) => `cliente:${slug}`), TTL)
  return crudos.map((c) => parse<Cliente>(c)).filter((c): c is Cliente => c !== null)
}

export async function getClienteBySlug(slug: string): Promise<Cliente | null> {
  return parse<Cliente>(await getCached(`cliente:${slug}`, TTL))
}

export async function getEdificiosByCliente(clienteSlug: string): Promise<Edificio[]> {
  const index = parse<string[]>(await getCached(`cliente_edificios_index:${clienteSlug}`, TTL))
  if (!index || index.length === 0) return []
  const crudos = await mgetCached(
    index.map((edId) => `cliente_edificio:${clienteSlug}:${edId}`),
    TTL,
  )
  return crudos
    .map((e) => parse<Edificio>(e))
    .filter((e): e is Edificio => e !== null)
    .sort((a, b) => a.orden - b.orden)
}

export async function getPropsByEdificio(edId: string): Promise<string[]> {
  return parse<string[]>(await getCached(`cliente_edificio_props:${edId}`, TTL)) || []
}

export async function getPropsSueltas(clienteSlug: string): Promise<string[]> {
  return parse<string[]>(await getCached(`cliente_props_sueltas:${clienteSlug}`, TTL)) || []
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
