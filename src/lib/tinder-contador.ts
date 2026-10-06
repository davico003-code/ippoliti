// CONTADOR DEL TINDER (David, 4-oct-2026: "cuánta gente lo abre, cuántos ♥ da
// y cuántos dejan sus datos"). Cada paso se manda con sendBeacon (no frena
// nada, sale aunque cierre la pestaña) a /api/propiedades/tinder-evento, que lo
// suma en el Redis compartido; Hilo lo muestra en Resultados → Tinder web.
// Claves y eventos: mismo contrato que si-crm src/lib/tinder/metricas-logic.ts.

// 'quiero_verla' = tocó ★ (o deslizó hacia arriba). 'match' = le pedimos el WhatsApp en el medio del
// mazo: del 4 al 5-oct era el "¡Es un match!" del 1er/3er ♥ + la ★; desde el 5-oct (sin match) es SOLO
// la hoja de la ★ de alguien que todavía no nos dejó el WhatsApp (el número baja por eso, no es caída).
// 'pantalla' = entró a "Conocé tu próximo hogar" (para saber cuántos de los que entran abren el mazo).
export const EVENTOS_TINDER = ['abrir', 'like', 'detalles', 'foto', 'parecidos_si', 'final', 'consulta', 'busca', 'match', 'quiero_verla', 'pantalla'] as const
export type EventoTinder = (typeof EVENTOS_TINDER)[number]
export type OrigenTinder = 'ficha' | 'home'

/**
 * De dónde vino esta visita a "Conocé tu próximo hogar" (David, 5-oct-2026):
 * un anuncio ('pauta') o el link que le mandó su asesor ('cliente') se cuentan
 * aparte de la home; la vista previa del asesor ('asesor') no se cuenta. Dura
 * lo que la pestaña (sessionStorage): la URL pierde los utm al elegir filtros.
 */
export type CanalTinder = 'pauta' | 'cliente' | 'asesor'
const CLAVE_CANAL = 'si-tinder-canal'

export function fijarCanalTinder(canal: CanalTinder): void {
  try {
    window.sessionStorage.setItem(CLAVE_CANAL, canal)
  } catch {
    /* sin almacenamiento: cuenta como la home */
  }
}

export function canalTinder(): CanalTinder | null {
  try {
    const c = window.sessionStorage.getItem(CLAVE_CANAL)
    return c === 'pauta' || c === 'cliente' || c === 'asesor' ? c : null
  } catch {
    return null
  }
}

const CLAVE_VISITANTE = 'si-visitante'

/** Un id al azar por navegador (para contar PERSONAS, no clics). Sin datos personales. */
function visitante(): string {
  try {
    let v = window.localStorage.getItem(CLAVE_VISITANTE)
    if (!v) {
      v = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`
      window.localStorage.setItem(CLAVE_VISITANTE, v)
    }
    return v
  } catch {
    return 'sin-almacenamiento'
  }
}

export function contarTinder(evento: EventoTinder, origen: OrigenTinder): void {
  try {
    const canal = canalTinder()
    if (canal === 'asesor') return
    // Lo de la home que llegó por un anuncio o por el link del asesor cuenta aparte.
    const body = JSON.stringify({ evento, origen: origen === 'home' && canal ? canal : origen, v: visitante() })
    const url = '/api/propiedades/tinder-evento'
    if (navigator.sendBeacon?.(url, new Blob([body], { type: 'application/json' }))) return
    void fetch(url, { method: 'POST', body, keepalive: true, headers: { 'content-type': 'application/json' } }).catch(() => {})
  } catch {
    /* el contador nunca rompe el Tinder */
  }
}
