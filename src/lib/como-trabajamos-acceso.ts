// Acceso privado a /como-trabajamos: links de un solo uso.
//
// - Un agente logueado genera un link para un cliente (queda en Redis 14 días).
// - La primera vez que se abre y se toca "Ver presentación" el link se canjea
//   (atómico, SET NX) y el dispositivo recibe una cookie firmada por 7 días.
//   Después el mismo link ya no abre en ningún otro dispositivo.
// - El canje es por POST desde un botón: las vistas previas de WhatsApp y los
//   bots hacen GET y no queman el link.
// - Los agentes logueados (y la TV de la oficina con sesión de agente) ven la
//   página directo, sin link.

import { SignJWT, jwtVerify } from 'jose'
import { nanoid } from 'nanoid'
import { redis } from '@/lib/redis'

const SECRET = new TextEncoder().encode(process.env.AGENT_JWT_SECRET || '')

export const COOKIE_ACCESO = 'si_ct_acceso'
export const DURACION_LINK_S = 60 * 60 * 24 * 14 // el link sin usar vence a los 14 días
export const DURACION_SESION_S = 60 * 60 * 24 * 7 // una vez abierto, 7 días en ese dispositivo

export interface LinkPresentacion {
  token: string
  cliente: string
  agenteId: string
  agenteNombre: string
  creadoEn: string
  usadoEn?: string
}

const kLink = (t: string) => `ct:link:${t}`
const kUso = (t: string) => `ct:uso:${t}`
const kAgente = (id: string) => `ct:links:${id}`

export async function crearLink(cliente: string, agente: { id: string; name: string }): Promise<LinkPresentacion> {
  const link: LinkPresentacion = {
    token: nanoid(18),
    cliente: cliente.trim().slice(0, 80),
    agenteId: agente.id,
    agenteNombre: agente.name,
    creadoEn: new Date().toISOString(),
  }
  await redis.set(kLink(link.token), link, { ex: DURACION_LINK_S })
  await redis.lpush(kAgente(agente.id), link.token)
  await redis.ltrim(kAgente(agente.id), 0, 29)
  return link
}

export async function leerLink(token: string): Promise<{ link: LinkPresentacion | null; usado: boolean }> {
  if (!/^[\w-]{10,40}$/.test(token)) return { link: null, usado: false }
  const [link, uso] = await Promise.all([redis.get<LinkPresentacion>(kLink(token)), redis.get(kUso(token))])
  return { link: link ?? null, usado: Boolean(uso) }
}

/** Canjea el link una sola vez. Devuelve la cookie firmada o el motivo del rechazo. */
export async function canjearLink(token: string): Promise<{ ok: true; jwt: string } | { ok: false; motivo: 'invalido' | 'usado' }> {
  const { link } = await leerLink(token)
  if (!link) return { ok: false, motivo: 'invalido' }
  const primero = await redis.set(kUso(token), new Date().toISOString(), { nx: true, ex: DURACION_LINK_S })
  if (primero !== 'OK') return { ok: false, motivo: 'usado' }
  await redis.set(kLink(token), { ...link, usadoEn: new Date().toISOString() }, { ex: DURACION_LINK_S })
  const jwt = await new SignJWT({ t: token, cliente: link.cliente, agente: link.agenteNombre })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${DURACION_SESION_S}s`)
    .sign(SECRET)
  return { ok: true, jwt }
}

export async function verificarSesion(jwt: string | undefined): Promise<{ cliente: string; agente: string } | null> {
  if (!jwt) return null
  try {
    const { payload } = await jwtVerify(jwt, SECRET)
    return { cliente: String(payload.cliente ?? ''), agente: String(payload.agente ?? '') }
  } catch {
    return null
  }
}

export async function linksDelAgente(agenteId: string): Promise<LinkPresentacion[]> {
  const tokens = await redis.lrange<string>(kAgente(agenteId), 0, 29)
  if (!tokens.length) return []
  const res = await Promise.all(tokens.map((t) => leerLink(t)))
  return res
    .map((r) => r.link)
    .filter((l): l is LinkPresentacion => Boolean(l))
}
