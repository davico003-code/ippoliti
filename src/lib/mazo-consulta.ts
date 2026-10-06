// LA CONSULTA DEL TINDER a Hilo (web → /api/feed-en-red/consulta) y el mail de
// "Recibí las nuevas" (→ /api/feed-en-red/suscripcion). Solo en el navegador.
// Lo comparten el mazo, el match, la hoja de contacto, el rescate y la
// suscripción. Ojo: `leadContado` y las enviadas ('si-feed-enviadas') son UNA
// sola instancia por visita: no duplicar este estado en otro archivo.

import { type CriteriosBusqueda, type ItemFeed, escribirContacto, idEnSeleccion, leerContacto, textoBusqueda } from '@/lib/feed-en-red'
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
/**
 * UN solo Lead de Meta por visita: la consulta (match, ★, hoja), el mail de
 * "Recibí las nuevas" y el WhatsApp del rescate son la misma persona; no
 * inflar lo que mide la pauta. Cuenta el primero que ocurra, con su content_name.
 */
let leadContado = false
export function contarLeadUnaVez(params: Record<string, string | number | string[]>): void {
  if (leadContado) return
  leadContado = true
  trackFbEvent('Lead', params)
}
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

/**
 * TINDER DEL CLIENTE (David, 5-oct-2026): con su link de seguimiento
 * (?s=<token>) cada ♥ y ★ va a SU selección —la ruta de reacciones la suma si
 * no estaba— y el asesor se entera por el circuito de siempre (cron de
 * reacciones de Hilo: chat, línea de tiempo y, si pide visita, tarea). Se
 * marcan como "ya las tiene un asesor": el mazo no le pide datos. De a una (la
 * ruta lee → cambia → escribe). `soloMirar` = vista previa del asesor: no se
 * manda nada.
 */
export type ClienteMazo = { token: string; soloMirar: boolean }
let colaCliente: Promise<unknown> = Promise.resolve()

export function reaccionarEnSeleccion(
  cliente: ClienteMazo,
  item: Pick<ItemFeed, 'key'> & Partial<Pick<ItemFeed, 'titulo' | 'fotos' | 'zona' | 'precio' | 'dorm' | 'm2'>>,
  accion: 'like' | 'super' | 'deshacer',
): Promise<boolean> {
  const propertyId = idEnSeleccion(item.key)
  if (!propertyId) return Promise.resolve(false)
  const anotar = (ok: boolean) => {
    if (ok) (accion === 'deshacer' ? desmarcarEnviadas : marcarEnviadas)([item.key])
    return ok
  }
  if (cliente.soloMirar) return Promise.resolve(anotar(true))
  const cuerpo =
    accion === 'deshacer'
      ? { propertyId, liked: null, reaction: null }
      : {
          propertyId,
          liked: true,
          reaction: 'encanta',
          ...(accion === 'super' ? { wantVisit: true } : {}),
          // Si no estaba en su selección, se suma (la de colegas, con lo que vio por si Hilo no responde).
          sugerida: true,
          tarjeta: { title: item.titulo ?? '', image: item.fotos?.[0] ?? null, location: item.zona ?? '', price: item.precio ?? null, rooms: item.dorm ?? 0, baths: 0, area: item.m2 ?? 0 },
        }
  const resultado = colaCliente.then(() =>
    fetch(`/api/seleccion/${encodeURIComponent(cliente.token)}/reaccion`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpo),
      keepalive: true,
    })
      .then((r) => r.ok)
      .catch(() => false),
  )
  // Si una tarda (sumar una de colegas le pide a Hilo), la siguiente no espera más de 8 s.
  colaCliente = Promise.race([resultado, new Promise((r) => window.setTimeout(r, 8000))])
  return resultado.then(anotar)
}

/** Su nombre y WhatsApp, si ya los dejó en este navegador (si no, null). */
export function contactoListo(): { nombre: string; whatsapp: string } | null {
  const c = leerContacto()
  return c.nombre.trim().length >= 2 && c.whatsapp.replace(/\D/g, '').length >= 10 ? { nombre: c.nombre.trim(), whatsapp: c.whatsapp } : null
}

/**
 * La consulta a Hilo (la usan el match, ★ "Quiero conocerla", ♥ N y el final). Las
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
  /** Tocó ★ "Quiero conocerla": el asesor sabe que quiere coordinar la visita. */
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
    contarLeadUnaVez({ content_name: 'feed_en_red', content_ids: p.keys.filter((k) => k.startsWith('n:')).map((k) => k.slice(2)) })
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
    contarLeadUnaVez({ content_name: 'mazo_suscripcion_mail' })
    return true
  } catch {
    return false
  }
}
