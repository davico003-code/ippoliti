// LA CONSULTA DEL TINDER a Hilo (web → /api/feed-en-red/consulta) y el mail de
// "Recibí las nuevas" (→ /api/feed-en-red/suscripcion). Solo en el navegador.
// Lo comparten el mazo, el match, la hoja de contacto, el rescate y la
// suscripción. Ojo: `leadContado` y las enviadas ('si-feed-enviadas') son UNA
// sola instancia por visita: no duplicar este estado en otro archivo.

import { type CriteriosBusqueda, escribirContacto, leerContacto, textoBusqueda } from '@/lib/feed-en-red'
import { trackEvent, trackFbEvent } from '@/lib/analytics'
import { contarTinder, type OrigenTinder } from '@/lib/tinder-contador'

/** Las ♥ que ya le mandamos a un asesor (localStorage: no se mandan dos veces). */
const CLAVE_ENVIADAS = 'si-feed-enviadas'
export function leerEnviadas(): string[] {
  try {
    const v = JSON.parse(window.localStorage.getItem(CLAVE_ENVIADAS) ?? '[]')
    return Array.isArray(v) ? v.filter((k): k is string => typeof k === 'string') : []
  } catch {
    return []
  }
}
/** Un solo Lead de Meta por visita (ver mandarConsulta). */
let leadContado = false
function desmarcarEnviadas(keys: string[]): void {
  try {
    const fuera = new Set(keys)
    window.localStorage.setItem(CLAVE_ENVIADAS, JSON.stringify(leerEnviadas().filter((k) => !fuera.has(k))))
  } catch {
    /* sin almacenamiento */
  }
}
function marcarEnviadas(keys: string[]): void {
  try {
    const todas = Array.from(new Set([...leerEnviadas(), ...keys])).slice(-40)
    window.localStorage.setItem(CLAVE_ENVIADAS, JSON.stringify(todas))
  } catch {
    /* sin almacenamiento */
  }
}

/** Su nombre y WhatsApp, si ya los dejó en este navegador (si no, null). */
export function contactoListo(): { nombre: string; whatsapp: string } | null {
  const c = leerContacto()
  return c.nombre.trim().length >= 2 && c.whatsapp.replace(/\D/g, '').length >= 10 ? { nombre: c.nombre.trim(), whatsapp: c.whatsapp } : null
}

/**
 * La consulta a Hilo (la usan el match, ★ "Quiero verla", ♥ N y el final). Las
 * que se mandan quedan marcadas: nunca se le vuelven a mandar al asesor.
 */
export async function mandarConsulta(p: {
  nombre: string
  whatsapp: string
  email?: string
  criterios?: CriteriosBusqueda | null
  keys: string[]
  barrio: string | null
  busqueda: string | null
  origen: OrigenTinder
  /** Tocó ★ "Quiero verla": el asesor sabe que quiere coordinar la visita. */
  visita?: boolean
}): Promise<{ ok: true } | { ok: false; error: string }> {
  // Se marcan ANTES de salir (si toca ★ y ♥ N seguidos no viajan dos veces); si
  // falla, se desmarcan SOLO las que marcó este envío (las de antes ya las tiene un asesor).
  const yaEstaban = new Set(leerEnviadas())
  const marcadasAhora = p.keys.filter((k) => !yaEstaban.has(k))
  marcarEnviadas(p.keys)
  try {
    const res = await fetch('/api/feed-en-red/consulta', {
      method: 'POST',
      // Sale aunque cierre la pestaña en ese segundo (ya figura como enviada).
      keepalive: true,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        nombre: p.nombre,
        whatsapp: p.whatsapp,
        email: p.email || undefined,
        suscripcion: p.email && p.criterios ? p.criterios : undefined,
        guardadas: p.keys,
        barrio: p.barrio,
        busqueda: p.busqueda,
        visita: p.visita === true,
        pageUrl: window.location.href,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      desmarcarEnviadas(marcadasAhora)
      return { ok: false, error: typeof data.error === 'string' ? data.error : 'No pudimos enviarlo. Probá de nuevo.' }
    }
    escribirContacto({ nombre: p.nombre, whatsapp: p.whatsapp, email: p.email })
    trackEvent('feed_en_red_consulta', { cantidad: p.keys.length, en_red: p.keys.filter((k) => !k.startsWith('n:')).length, visita: p.visita === true })
    // UN Lead de Meta por visita (match + ★ + hoja son la misma persona: no inflar lo que mide la pauta).
    if (!leadContado) {
      leadContado = true
      trackFbEvent('Lead', { content_name: 'feed_en_red', content_ids: p.keys.filter((k) => k.startsWith('n:')).map((k) => k.slice(2)) })
    }
    contarTinder('consulta', p.origen)
    return { ok: true }
  } catch {
    desmarcarEnviadas(marcadasAhora)
    return { ok: false, error: 'No pudimos enviarlo. Probá de nuevo.' }
  }
}

/** Anota el mail con su búsqueda (web → Hilo). true si quedó registrado. */
export async function suscribirMail(email: string, criterios: CriteriosBusqueda, motivos: string[] = []): Promise<boolean> {
  try {
    const res = await fetch('/api/feed-en-red/suscripcion', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, nombre: leerContacto().nombre, criterios, busqueda: textoBusqueda(criterios), motivos, pageUrl: window.location.href }),
    })
    if (!res.ok) return false
    escribirContacto({ email })
    trackFbEvent('Lead', { content_name: 'mazo_suscripcion_mail' })
    return true
  } catch {
    return false
  }
}
