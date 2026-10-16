// WHATSAPP CON DATOS de la ficha (David, 16-oct-2026). En octubre la pauta trajo
// ~14.800 visitas a fichas y 0 consultas en Hilo: el botón verde era un wa.me
// directo y no dejaba rastro. Al que viene de un anuncio, el botón le pide
// nombre + celular, la consulta entra a Hilo y recién ahí se abre el chat con
// el agente que Hilo le asignó. Prueba de una semana: de cada 100 que tocan,
// ≥40 dejan datos → se prende para toda la web; <25 → se apaga.

import { visitante } from '@/lib/tinder-contador'

/** La llave: prendido salvo NEXT_PUBLIC_WHATSAPP_CON_DATOS=off (se apaga sin revertir el merge). */
export const WHATSAPP_CON_DATOS_ACTIVO = process.env.NEXT_PUBLIC_WHATSAPP_CON_DATOS !== 'off'

export const EVENTOS_WCD = ['toque', 'datos'] as const
export type EventoWcd = (typeof EVENTOS_WCD)[number]

export type AgenteFicha = { nombre: string; whatsapp: string }

/**
 * El wa.me final (puro). Va al agente asignado si Hilo lo devolvió; si no, al
 * número de la ficha. El texto de la ficha ("Hola <captador>, te escribo por la
 * propiedad …") pasa a saludar al que atiende y a decir quién escribe.
 */
export function urlWhatsappConDatos(hrefFicha: string, nombre: string, agente: AgenteFicha | null): string {
  let url: URL
  try {
    url = new URL(hrefFicha)
  } catch {
    return hrefFicha
  }
  const numero = agente?.whatsapp ?? url.pathname.replace(/\D/g, '')
  const resto = (url.searchParams.get('text') ?? '').replace(/^Hola[^,\n]*,\s*/, '')
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
 * La consulta ya enviada por esta ficha en esta pestaña (con su agente): volver
 * a tocar el botón abre el mismo chat sin mandar otra consulta ni otro Lead.
 */
const CLAVE_ENVIADA = 'si-wcd-enviada:'
const VIGENCIA_MS = 30 * 60_000

export function consultaYaEnviada(propertyId: number): { agente: AgenteFicha | null; nombre: string } | null {
  try {
    const v = JSON.parse(window.sessionStorage.getItem(CLAVE_ENVIADA + propertyId) ?? 'null')
    if (!v || typeof v.at !== 'number' || Date.now() - v.at > VIGENCIA_MS || typeof v.nombre !== 'string') return null
    return { agente: v.agente ?? null, nombre: v.nombre }
  } catch {
    return null
  }
}

export function guardarConsultaEnviada(propertyId: number, nombre: string, agente: AgenteFicha | null): void {
  try {
    window.sessionStorage.setItem(CLAVE_ENVIADA + propertyId, JSON.stringify({ at: Date.now(), nombre, agente }))
  } catch {
    /* sin almacenamiento: a lo sumo se vuelve a mandar (Hilo deduplica 10 min) */
  }
}
