// Acceso privado a /como-trabajamos: links personales y de un solo dispositivo.
//
// - Un agente logueado genera un link para un cliente (vence a los 3 días si
//   no se abre).
// - La primera vez que se abre y se toca "Ver presentación" el link se canjea
//   (atómico, SET NX) y ese dispositivo recibe una cookie firmada. El mismo
//   link ya no abre en ningún otro dispositivo: no se puede compartir.
// - Cada cliente tiene 2 visitas, dentro de 48 horas. Recargar o navegar en
//   la misma media hora cuenta como la misma visita.
// - El canje es por POST desde un botón: las vistas previas de WhatsApp y los
//   bots hacen GET y no queman el link.
// - Los agentes logueados (y la TV de la oficina con sesión de agente) ven la
//   página directo, sin link.

import { SignJWT, jwtVerify } from 'jose'
import { nanoid } from 'nanoid'
import { redis } from '@/lib/redis'

const SECRET = new TextEncoder().encode(process.env.AGENT_JWT_SECRET || '')

export const COOKIE_ACCESO = 'si_ct_acceso'
export const DURACION_LINK_S = 60 * 60 * 24 * 3 // el link sin abrir vence a los 3 días
export const DURACION_SESION_S = 60 * 60 * 48 // una vez abierto, 48 horas en ese dispositivo
export const MAX_VISITAS = 2
const VENTANA_VISITA_MS = 30 * 60 * 1000 // recargas dentro de 30 min = la misma visita
const RETENCION_S = 60 * 60 * 24 * 7 // cuánto guardamos el registro para el panel del agente

export interface LinkPresentacion {
  token: string
  cliente: string
  agenteId: string
  agenteNombre: string
  creadoEn: string
  usadoEn?: string
  visitas?: number
}

const kLink = (t: string) => `ct:link:${t}`
const kUso = (t: string) => `ct:uso:${t}`
const kAgente = (id: string) => `ct:links:${id}`
const kVisitas = (t: string) => `ct:visitas:${t}`

interface RegistroVisitas {
  n: number
  ultima: number
}

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
  const primero = await redis.set(kUso(token), new Date().toISOString(), { nx: true, ex: RETENCION_S })
  if (primero !== 'OK') return { ok: false, motivo: 'usado' }
  await redis.set(kLink(token), { ...link, usadoEn: new Date().toISOString() }, { ex: RETENCION_S })
  await redis.set(kVisitas(token), { n: 1, ultima: Date.now() } satisfies RegistroVisitas, { ex: RETENCION_S })
  const jwt = await new SignJWT({ t: token, cliente: link.cliente, agente: link.agenteNombre })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${DURACION_SESION_S}s`)
    .sign(SECRET)
  return { ok: true, jwt }
}

export type EstadoSesion =
  | { ok: true; cliente: string; agente: string; visita: number }
  | { ok: false; motivo: 'sin-sesion' }
  | { ok: false; motivo: 'agotado'; agente: string }

/**
 * Valida la cookie y registra la visita. Las cargas dentro de 30 minutos de la
 * última cuentan como la misma visita; pasado eso se abre una nueva, hasta 2.
 */
export async function verificarSesion(jwt: string | undefined): Promise<EstadoSesion> {
  if (!jwt) return { ok: false, motivo: 'sin-sesion' }
  let payload
  try {
    payload = (await jwtVerify(jwt, SECRET)).payload
  } catch {
    return { ok: false, motivo: 'sin-sesion' }
  }
  const token = String(payload.t ?? '')
  const cliente = String(payload.cliente ?? '')
  const agente = String(payload.agente ?? '')
  try {
    const reg = (await redis.get<RegistroVisitas>(kVisitas(token))) ?? { n: 1, ultima: 0 }
    const ahora = Date.now()
    if (ahora - reg.ultima <= VENTANA_VISITA_MS) {
      await redis.set(kVisitas(token), { ...reg, ultima: ahora }, { ex: RETENCION_S })
      return { ok: true, cliente, agente, visita: reg.n }
    }
    if (reg.n >= MAX_VISITAS) return { ok: false, motivo: 'agotado', agente }
    const nuevo = { n: reg.n + 1, ultima: ahora }
    await redis.set(kVisitas(token), nuevo, { ex: RETENCION_S })
    return { ok: true, cliente, agente, visita: nuevo.n }
  } catch {
    // Si Redis no responde, una cookie firmada y vigente alcanza: el cliente
    // no tiene por qué pagar una caída nuestra.
    return { ok: true, cliente, agente, visita: 1 }
  }
}

/** Token del link al que corresponde una cookie de acceso (sin contar visita). */
export async function tokenDeSesion(jwt: string | undefined): Promise<string | null> {
  if (!jwt) return null
  try {
    return String((await jwtVerify(jwt, SECRET)).payload.t ?? '') || null
  } catch {
    return null
  }
}

/** URL pública del link, siempre en el dominio canónico (sin www ni previews raros). */
export function urlDelLink(origen: string, token: string): string {
  const base = origen.replace('://www.', '://')
  return `${base}/como-trabajamos?k=${token}`
}

export async function linksDelAgente(agenteId: string): Promise<LinkPresentacion[]> {
  const tokens = await redis.lrange<string>(kAgente(agenteId), 0, 29)
  if (!tokens.length) return []
  const res = await Promise.all(
    tokens.map(async (t) => {
      const [{ link }, v] = await Promise.all([leerLink(t), redis.get<RegistroVisitas>(kVisitas(t))])
      return link ? ({ ...link, visitas: v?.n ?? 0 } as LinkPresentacion) : null
    }),
  )
  return res.filter((l): l is LinkPresentacion => Boolean(l))
}

/** Visitas usadas de un link (0 si nunca se abrió). */
export async function visitasDe(token: string): Promise<number> {
  const v = await redis.get<RegistroVisitas>(kVisitas(token))
  return v?.n ?? 0
}
