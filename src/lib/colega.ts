// Colegas externos a los que el equipo SI les genera fichas white-label.
// Namespace global (sin agrupación por agente): el equipo es chico y comparte
// el dashboard, así cualquiera con el código de equipo ve y reusa los colegas
// guardados por los demás.
//
// Keys en Redis:
//   colega:{colegaId}        → JSON con datos del colega (sin TTL)
//   colegas:all              → SET con todos los colegaIds vivos

import { customAlphabet } from 'nanoid'
import { redis } from './redis'

export interface Colega {
  id: string
  nombre: string
  whatsapp: string          // dígitos puros, formato wa.me (ej "5493412101694")
  email: string | null
  createdAt: string         // ISO
}

const SET_KEY = 'colegas:all'
const KEY = (id: string) => `colega:${id}`

const colegaIdGen = customAlphabet('abcdefghijkmnpqrstuvwxyz23456789', 6)

// Normaliza WhatsApp argentino al formato que espera wa.me (sin +, sin
// espacios, con código de país). Conservador: si ya empieza con "54" lo deja,
// si arranca con "0" lo descarta, sino antepone "549" (móvil AR).
export function normalizeWhatsapp(raw: string): string {
  const digits = (raw || '').replace(/\D+/g, '')
  if (!digits) return ''
  if (digits.startsWith('00')) return digits.slice(2)
  if (digits.startsWith('54')) return digits
  if (digits.startsWith('0')) {
    const noLead = digits.replace(/^0+/, '')
    return `549${noLead}`
  }
  return `549${digits}`
}

export async function crearColega(input: {
  nombre: string
  whatsapp: string
  email?: string | null
}): Promise<Colega> {
  const nombre = (input.nombre || '').trim()
  const whatsapp = normalizeWhatsapp(input.whatsapp || '')
  const email = (input.email || '').trim() || null

  if (!nombre) throw new Error('nombre requerido')
  if (whatsapp.length < 10) throw new Error('whatsapp inválido')

  const id = colegaIdGen()
  const colega: Colega = {
    id,
    nombre,
    whatsapp,
    email,
    createdAt: new Date().toISOString(),
  }

  await redis.set(KEY(id), JSON.stringify(colega))
  await redis.sadd(SET_KEY, id)
  return colega
}

export async function getColega(id: string): Promise<Colega | null> {
  const raw = await redis.get<string>(KEY(id))
  if (!raw) return null
  return typeof raw === 'string' ? JSON.parse(raw) : (raw as Colega)
}

export async function listColegas(): Promise<Colega[]> {
  const ids = (await redis.smembers(SET_KEY)) as string[]
  if (!ids.length) return []

  const results: Colega[] = []
  const stale: string[] = []

  for (const id of ids) {
    const c = await getColega(id)
    if (c) results.push(c)
    else stale.push(id)
  }

  // Lazy cleanup de IDs huérfanos (caso raro: borrado manual en consola Redis)
  if (stale.length) await redis.srem(SET_KEY, ...stale)

  results.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
  return results
}

export async function deleteColega(id: string): Promise<boolean> {
  const existed = await redis.del(KEY(id))
  await redis.srem(SET_KEY, id)
  return existed > 0
}

export async function updateColega(
  id: string,
  patch: Partial<Pick<Colega, 'nombre' | 'whatsapp' | 'email'>>
): Promise<Colega | null> {
  const current = await getColega(id)
  if (!current) return null

  const updated: Colega = {
    ...current,
    ...(patch.nombre !== undefined ? { nombre: patch.nombre.trim() } : {}),
    ...(patch.whatsapp !== undefined ? { whatsapp: normalizeWhatsapp(patch.whatsapp) } : {}),
    ...(patch.email !== undefined ? { email: (patch.email || '').trim() || null } : {}),
  }

  if (!updated.nombre) throw new Error('nombre requerido')
  if (updated.whatsapp.length < 10) throw new Error('whatsapp inválido')

  await redis.set(KEY(id), JSON.stringify(updated))
  return updated
}
