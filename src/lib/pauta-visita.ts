// ¿ESTA VISITA VINO DE UN ANUNCIO? UNA sola regla para toda la web (el mazo de
// "Conocé tu hogar" y el WhatsApp con datos de la ficha).
//
// Los anuncios de Meta llevan utm_medium=pauta (también se aceptan los medios
// pagos de siempre) o ?origen=pauta. La URL pierde los utm al navegar, así que
// la primera página los guarda en sessionStorage: dura lo que la pestaña.

const MEDIOS_PAGOS = ['pauta', 'paid', 'cpc', 'paid_social']
const CLAVE = 'si-pauta-utm'
const CAMPOS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const

/** Pura (sirve en el servidor): ¿estos parámetros son de un anuncio? */
export function esVisitaDePauta(p: { origen?: string | null; utmMedium?: string | null }): boolean {
  return p.origen === 'pauta' || MEDIOS_PAGOS.includes((p.utmMedium ?? '').toLowerCase())
}

/**
 * Navegador: si la URL viene de un anuncio guarda sus utm para el resto de la
 * visita. Devuelve si la visita (esta página o una anterior de la pestaña) vino
 * de la pauta.
 */
export function marcarVisitaDePauta(): boolean {
  try {
    const q = new URLSearchParams(window.location.search)
    if (esVisitaDePauta({ origen: q.get('origen'), utmMedium: q.get('utm_medium') })) {
      const utm = new URLSearchParams()
      for (const c of CAMPOS) {
        const v = q.get(c)
        if (v) utm.set(c, v.slice(0, 200))
      }
      if (!utm.has('utm_medium')) utm.set('utm_medium', 'pauta')
      window.sessionStorage.setItem(CLAVE, utm.toString())
      return true
    }
    return window.sessionStorage.getItem(CLAVE) !== null
  } catch {
    return false
  }
}

/**
 * La URL de esta página con los utm del anuncio, aunque ya no estén en la barra
 * (/api/leads los saca del pageUrl y Hilo ata la consulta al anuncio por utm_content).
 */
export function urlConUtmDePauta(): string {
  try {
    const url = new URL(window.location.href)
    if (url.searchParams.has('utm_medium')) return url.toString()
    const guardados = window.sessionStorage.getItem(CLAVE)
    if (!guardados) return url.toString()
    new URLSearchParams(guardados).forEach((v, k) => url.searchParams.set(k, v))
    return url.toString()
  } catch {
    return typeof window === 'undefined' ? '' : window.location.href
  }
}
