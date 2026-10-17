// WHATSAPP CON DATOS de la ficha (David, 16-oct-2026). En octubre la pauta trajo
// ~14.800 visitas a fichas y 0 consultas en Hilo: el botón verde era un wa.me
// directo y no dejaba rastro. Al que viene de un anuncio, el botón le pide
// nombre + celular, la consulta entra a Hilo y recién ahí se abre el chat con
// el agente que Hilo le asignó. Prueba de una semana: de cada 100 que tocan,
// ≥40 dejan datos → se prende para toda la web; <25 → se apaga.

import { visitante } from '@/lib/tinder-contador'

/** La llave: prendido salvo NEXT_PUBLIC_WHATSAPP_CON_DATOS=off (se apaga sin revertir el merge). */
export const WHATSAPP_CON_DATOS_ACTIVO = process.env.NEXT_PUBLIC_WHATSAPP_CON_DATOS !== 'off'

// 'turno' (17-oct-2026): eligió día + franja después de abrir WhatsApp (el "segundo filtro").
export const EVENTOS_WCD = ['toque', 'datos', 'turno'] as const
export type EventoWcd = (typeof EVENTOS_WCD)[number]

export type AgenteFicha = { nombre: string; whatsapp: string }

/** Días y franjas que ofrece Hilo (lib/visitas/turno-web de Hilo): la hoja solo los dibuja. */
export type TurnosFicha = { dias: { fecha: string; etiqueta: string }[]; franjas: { id: string; etiqueta: string }[] }

/** La consulta que ya salió desde esta ficha (sessionStorage): con qué agente, su conversación en Hilo y los turnos que ofrece. */
export type ConsultaEnviada = {
  nombre: string
  whatsapp: string
  agente: AgenteFicha | null
  conversationId: string | null
  turnos: TurnosFicha | null
  /** "sáb 17 oct, Tarde (15 a 19)" si ya pidió turno: no se le vuelve a ofrecer. */
  turnoPedido: string | null
}

/**
 * El wa.me final (puro). Va al agente asignado si Hilo lo devolvió; si no, al
 * número de la ficha. El texto de la ficha pasa a saludar al que atiende y a
 * decir quién escribe. Los dos textos de lib/tokko.ts saludan distinto —
 * "Hola <captador>, te escribo por…" y "Hola <captador>! Quiero consultar el
 * precio…" — y la dirección puede tener comas: se corta SOLO el saludo, hasta la
 * primera coma o el primer "!".
 */
export function urlWhatsappConDatos(hrefFicha: string, nombre: string, agente: AgenteFicha | null): string {
  let url: URL
  try {
    url = new URL(hrefFicha)
  } catch {
    return hrefFicha
  }
  const numero = agente?.whatsapp ?? url.pathname.replace(/\D/g, '')
  const resto = (url.searchParams.get('text') ?? '').replace(/^Hola\b[^,!\n]*[,!]\s*/, '')
  const saludo = `Hola${agente?.nombre ? ` ${agente.nombre}` : ''}, soy ${nombre.trim()}.`
  const texto = resto ? `${saludo} ${resto.charAt(0).toUpperCase()}${resto.slice(1)}` : saludo
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`
}

/** Suma un paso de la prueba (sendBeacon: no frena nada). Nunca rompe el botón. */
export function contarWcd(evento: EventoWcd): void {
  try {
    const body = JSON.stringify({ contador: 'wcd', evento, origen: 'ficha', v: visitante() })
    const url = '/api/propiedades/tinder-evento'
    if (navigator.sendBeacon?.(url, new Blob([body], { type: 'application/json' }))) return
    void fetch(url, { method: 'POST', body, keepalive: true, headers: { 'content-type': 'application/json' } }).catch(() => {})
  } catch {
    /* el contador nunca rompe el botón */
  }
}

/**
 * La consulta ya enviada por esta ficha en esta pestaña (con su agente, su
 * conversación y los turnos): volver a tocar el botón abre el mismo chat sin
 * mandar otra consulta ni otro Lead, y la hoja sigue ofreciendo el turno.
 */
const CLAVE_ENVIADA = 'si-wcd-enviada:'
const VIGENCIA_MS = 30 * 60_000

export function consultaYaEnviada(propertyId: number): ConsultaEnviada | null {
  try {
    const v = JSON.parse(window.sessionStorage.getItem(CLAVE_ENVIADA + propertyId) ?? 'null')
    if (!v || typeof v.at !== 'number' || Date.now() - v.at > VIGENCIA_MS || typeof v.nombre !== 'string') return null
    const str = (x: unknown) => (typeof x === 'string' ? x : null)
    return {
      nombre: v.nombre,
      whatsapp: str(v.whatsapp) ?? '',
      agente: v.agente ?? null,
      conversationId: str(v.conversationId),
      turnos: v.turnos && Array.isArray(v.turnos.dias) && Array.isArray(v.turnos.franjas) ? (v.turnos as TurnosFicha) : null,
      turnoPedido: str(v.turnoPedido),
    }
  } catch {
    return null
  }
}

export function guardarConsultaEnviada(propertyId: number, c: Omit<ConsultaEnviada, 'turnoPedido'>): void {
  try {
    window.sessionStorage.setItem(CLAVE_ENVIADA + propertyId, JSON.stringify({ at: Date.now(), ...c, turnoPedido: null }))
  } catch {
    /* sin almacenamiento: a lo sumo se vuelve a mandar (Hilo deduplica 10 min) */
  }
}

/** El turno que pidió (para no ofrecerlo de nuevo si vuelve a abrir la hoja). */
export function guardarTurnoPedido(propertyId: number, etiqueta: string): void {
  try {
    const k = CLAVE_ENVIADA + propertyId
    const v = JSON.parse(window.sessionStorage.getItem(k) ?? 'null')
    if (v) window.sessionStorage.setItem(k, JSON.stringify({ ...v, turnoPedido: etiqueta }))
  } catch {
    /* sin almacenamiento: Hilo igual no duplica el mismo turno */
  }
}

/**
 * Pide el turno (día + franja) a Hilo vía /api/turno-visita. El error que vuelve
 * ya está escrito para la persona.
 */
export async function pedirTurno(input: { conversationId: string; whatsapp: string; fecha: string; franja: string }): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const r = await fetch('/api/turno-visita', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (r.ok) return { ok: true }
    const data = (await r.json().catch(() => null)) as { error?: unknown } | null
    return { ok: false, error: typeof data?.error === 'string' && data.error ? data.error : 'No pudimos pedir el turno. Coordinalo por WhatsApp.' }
  } catch {
    return { ok: false, error: 'No pudimos pedir el turno. Coordinalo por WhatsApp.' }
  }
}
