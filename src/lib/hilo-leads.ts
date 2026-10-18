/**
 * Puente de ESCRITURA web → Hilo. Empuja los leads del sitio (siinmobiliaria.com)
 * al inbox de Hilo (meethilo.com /api/public/leads), reemplazando el "contacto a
 * Tokko". Server-to-server con secreto compartido (HILO_INGEST_SECRET).
 *
 * Es best-effort: si falla o no está configurado, NO lanza — la web ya guardó el
 * lead en Redis (y, durante la transición, en Tokko), así que nunca se pierde un
 * lead por un problema de este push.
 */

import type { TasacionLead } from '@/lib/tasacion/types'
import type { LoteLead } from '@/lib/distrito-roldan/consulta'
import type { MetaConsulta } from '@/lib/meta-capi'

export type HiloLeadPayload = {
  name?: string | null
  email?: string | null
  phone?: string | null
  message?: string | null
  origen?: string | null
  /** tokko_id de la propiedad consultada (si el lead viene de una ficha). */
  tokkoPropertyId?: string | number | null
  /** Contexto del pedido de tasación (origen 'tasacion'): barrio, tipo, m²,
   *  rango que vio la persona, nivel de comparables, utm. */
  tasacion?: TasacionLead | null
  /** Contexto del pedido por un lote del plano de Distrito Roldán (origen
   *  'lote_web', 06-sep-2026): número, medidas, precio, cuota, utm, página. */
  lote?: LoteLead | null
  /** uuid de la propiedad en Hilo (feed: hilo_id). Resuelve la ficha aunque no
   *  tenga tokko_id — las cargadas directo en Hilo. */
  hiloPropertyId?: string | null
  /** URL de la página donde se hizo el pedido, con sus utm. */
  sourceUrl?: string | null
  /** utm_* del clic (Hilo los ata al anuncio de Meta por utm_content = ref). */
  attribution?: Record<string, unknown> | null
  /** Identidad de Meta de la consulta (eventId del píxel, _fbp/_fbc, IP, UA): Hilo la manda por CAPI. */
  meta?: MetaConsulta | null
  /** Feed de la ficha (origen 'feed_web', 03-oct-2026): lo que marcó con ♥.
   *  `n:<id público>` = nuestra, `propia:<aviso>` / `meli:<MLA…>` = En red. */
  guardadas?: string[] | null
  /** Tocó ★ "Quiero conocerla" en la PRIMERA de `guardadas`: en su link de seguimiento queda "Visita pedida". */
  visita?: boolean
  /** Barrio de la ficha donde estaba mirando (para el texto del chat). */
  barrio?: string | null
  /** Dejó además el mail para recibir las nuevas de su búsqueda (4-oct-2026). */
  suscripcion?: SuscripcionHilo | null
}

/** La búsqueda que viaja con el mail (Hilo la escribe en el contacto). */
export type SuscripcionHilo = {
  zona: string | null
  tipo: 'house' | 'lot' | 'apartment' | null
  topeUsd: number | null
  origen: 'conoce_tu_hogar' | 'ficha'
  busqueda: string | null
  pagina: string | null
}

/** WhatsApp del agente que Hilo le asignó a la consulta (wa.me: 549 + 10 dígitos). */
export type AgenteHilo = { nombre: string; whatsapp: string }

/**
 * Días y franjas que la hoja ofrece después de abrir WhatsApp (17-oct-2026):
 * los define Hilo (lib/visitas/turno-web, una sola tabla), la web solo los dibuja.
 */
export type TurnosHilo = { dias: { fecha: string; etiqueta: string }[]; franjas: { id: string; etiqueta: string }[] }

const RE_FECHA = /^\d{4}-\d{2}-\d{2}$/
const RE_FRANJA = /^[a-z]{1,20}$/
const RE_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function leerTurnos(data: unknown): TurnosHilo | null {
  const raw = (data as { turnos?: { dias?: unknown; franjas?: unknown } | null } | null)?.turnos
  if (!raw || !Array.isArray(raw.dias) || !Array.isArray(raw.franjas)) return null
  const dias: TurnosHilo['dias'] = []
  for (const d of raw.dias as Array<{ fecha?: unknown; etiqueta?: unknown } | null>) {
    if (typeof d?.fecha === 'string' && RE_FECHA.test(d.fecha) && typeof d.etiqueta === 'string') dias.push({ fecha: d.fecha, etiqueta: d.etiqueta.slice(0, 20) })
  }
  const franjas: TurnosHilo['franjas'] = []
  for (const f of raw.franjas as Array<{ id?: unknown; etiqueta?: unknown } | null>) {
    if (typeof f?.id === 'string' && RE_FRANJA.test(f.id) && typeof f.etiqueta === 'string') franjas.push({ id: f.id, etiqueta: f.etiqueta.slice(0, 40) })
  }
  return dias.length && franjas.length ? { dias: dias.slice(0, 14), franjas: franjas.slice(0, 6) } : null
}

function leerConversacion(data: unknown): string | null {
  const id = (data as { conversationId?: unknown } | null)?.conversationId
  return typeof id === 'string' && RE_UUID.test(id) ? id : null
}

function leerAgente(data: unknown): AgenteHilo | null {
  const a = (data as { agente?: unknown } | null)?.agente as Partial<AgenteHilo> | null | undefined
  if (!a || typeof a.whatsapp !== 'string' || !/^549\d{10}$/.test(a.whatsapp)) return null
  return { nombre: typeof a.nombre === 'string' ? a.nombre.slice(0, 40) : '', whatsapp: a.whatsapp }
}

/**
 * Empuja el lead a Hilo y devuelve, si vino, el WhatsApp del agente que lo
 * tiene asignado ("WhatsApp con datos" de la ficha, 16-oct-2026). best-effort:
 * nunca lanza.
 */
export type RespuestaHilo = {
  ok: boolean
  agente: AgenteHilo | null
  metaEventId: string | null
  /** La consulta en Hilo (solo whatsapp_ficha): con ella + el celular se pide el turno de visita después. */
  conversationId: string | null
  turnos: TurnosHilo | null
}

const SIN_HILO: RespuestaHilo = { ok: false, agente: null, metaEventId: null, conversationId: null, turnos: null }

export async function enviarLeadAHilo(payload: HiloLeadPayload): Promise<RespuestaHilo> {
  const secret = process.env.HILO_INGEST_SECRET
  if (!secret) return SIN_HILO // sin secreto no intentamos; la web ya capturó el lead

  const base = process.env.HILO_LEADS_URL || 'https://meethilo.com'
  try {
    const res = await fetch(`${base}/api/public/leads`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-hilo-ingest-secret': secret,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
      // Con tope: si Hilo se cuelga, la persona no puede quedar en "Enviando…"
      // para siempre (el lead ya quedó guardado en Redis).
      signal: AbortSignal.timeout(15_000),
    })
    // No logueamos el body de la respuesta: puede reflejar PII del lead a los
    // logs de Vercel. Solo el status.
    if (!res.ok) console.warn('[hilo-leads] push no-ok:', res.status)
    const data = res.ok ? await res.json().catch(() => null) : null
    // El eventId con el que Hilo manda el Lead por CAPI: si la consulta ya
    // existía (reenvío), es el PRIMERO, y el píxel tiene que disparar con ese.
    const id = (data as { metaEventId?: unknown } | null)?.metaEventId
    const metaEventId = typeof id === 'string' && /^[A-Za-z0-9_-]{8,64}$/.test(id) ? id : null
    return { ok: res.ok, agente: leerAgente(data), metaEventId, conversationId: leerConversacion(data), turnos: leerTurnos(data) }
  } catch (err) {
    console.warn('[hilo-leads] push error:', err)
    return SIN_HILO
  }
}

/**
 * Turno de visita elegido después del WhatsApp con datos (17-oct-2026): Hilo
 * agenda la visita al agente de esa conversación (POST /api/public/visita-turno,
 * mismo secreto). Devuelve el status de Hilo para que la hoja distinga "ese
 * turno ya no está" (400) de "no encontramos tu consulta" (404). Nunca lanza.
 */
export async function pedirTurnoAHilo(payload: { conversationId: string; phone: string; fecha: string; franja: string }): Promise<{ ok: boolean; status: number; error: string | null }> {
  const secret = process.env.HILO_INGEST_SECRET
  if (!secret) return { ok: false, status: 503, error: null }
  const base = process.env.HILO_LEADS_URL || 'https://meethilo.com'
  try {
    const res = await fetch(`${base}/api/public/visita-turno`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-hilo-ingest-secret': secret },
      body: JSON.stringify(payload),
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    })
    const data = (await res.json().catch(() => null)) as { error?: unknown } | null
    if (!res.ok) console.warn('[hilo-leads] visita-turno no-ok:', res.status)
    return { ok: res.ok, status: res.status, error: typeof data?.error === 'string' ? data.error.slice(0, 200) : null }
  } catch (err) {
    console.warn('[hilo-leads] visita-turno error:', err)
    return { ok: false, status: 502, error: null }
  }
}

/** Devuelve true si el lead quedó registrado en el inbox de Hilo. best-effort:
 *  nunca lanza (el caller ya lo guardó en Redis), pero ahora el caller puede
 *  saber si el push funcionó para no reportar éxito falso. */
export async function pushLeadToHilo(payload: HiloLeadPayload): Promise<boolean> {
  return (await enviarLeadAHilo(payload)).ok
}

/**
 * "Recibí las nuevas por mail" del Tinder: deja el mail con su búsqueda en Hilo
 * (contacto + consentimiento de email + lista "Web: búsquedas por mail"), sin
 * abrir una consulta. Best-effort como pushLeadToHilo: nunca lanza.
 */
export async function pushSuscripcionToHilo(payload: { email: string; nombre: string | null; criterios: SuscripcionHilo }): Promise<boolean> {
  const secret = process.env.HILO_INGEST_SECRET
  if (!secret) return false
  const base = process.env.HILO_LEADS_URL || 'https://meethilo.com'
  try {
    const res = await fetch(`${base}/api/public/suscripcion-busqueda`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-hilo-ingest-secret': secret },
      body: JSON.stringify(payload),
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    })
    if (!res.ok) console.warn('[hilo-leads] suscripción no-ok:', res.status)
    return res.ok
  } catch (err) {
    console.warn('[hilo-leads] suscripción error:', err)
    return false
  }
}

/**
 * "Avisame si baja" de la ficha: el pedido de ESA propiedad (Hilo lo suma al
 * aviso automático de bajas por emBlue) + el contacto con permiso de email.
 * Best-effort: nunca lanza.
 */
export async function pushAvisameSiBajaToHilo(payload: { email: string; nombre: string | null; propiedadId: number; pagina: string | null }): Promise<boolean> {
  const secret = process.env.HILO_INGEST_SECRET
  if (!secret) return false
  const base = process.env.HILO_LEADS_URL || 'https://meethilo.com'
  try {
    const res = await fetch(`${base}/api/public/avisame-si-baja`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-hilo-ingest-secret': secret },
      body: JSON.stringify(payload),
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    })
    if (!res.ok) console.warn('[hilo-leads] avisame-si-baja no-ok:', res.status)
    return res.ok
  } catch (err) {
    console.warn('[hilo-leads] avisame-si-baja error:', err)
    return false
  }
}
