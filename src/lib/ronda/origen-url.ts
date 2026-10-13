/**
 * ¿De dónde es un link de aviso externo? Sin red ni dependencias, para usarlo
 * también en el navegador ("Cargar para compartir" avisa al pegar si es de
 * Zonaprop o de Tokko). El lector del servidor (aviso-externo) usa lo mismo.
 */

export type OrigenAviso = 'tokko' | 'zonaprop'

/** Ficha pública de Tokko: ficha.info/p/… */
export function esFichaTokko(url: string): boolean {
  try {
    const u = new URL(url)
    return /(^|\.)ficha\.info$/i.test(u.hostname) && u.pathname.startsWith('/p/')
  } catch {
    return false
  }
}

/** Aviso de Zonaprop (cualquier subdominio de zonaprop.com.ar). */
export function esAvisoZonaprop(url: string): boolean {
  try {
    return /(^|\.)zonaprop\.com\.ar$/i.test(new URL(url).hostname)
  } catch {
    return false
  }
}

export function origenDeUrl(url: string): OrigenAviso | null {
  if (esFichaTokko(url)) return 'tokko'
  if (esAvisoZonaprop(url)) return 'zonaprop'
  return null
}
