// Volver de una ficha al listado sin perder nada (25-oct-2026).
//
// Antes el "← Mapa" del header de la ficha era un <Link href="/propiedades">:
// volvía al listado SIN filtros, arriba de todo y con la primera tanda, aunque
// la persona hubiera filtrado y scrolleado. Y a quien llegaba por WhatsApp le
// decía "Mapa" sin que hubiera visto ningún mapa.
//
// Contrato con el listado (PropiedadesView):
//  - guardarUltimoListado(url): cada vez que el listado sincroniza su URL.
//  - marcarSalidaDelListado(rutaFicha): al tocar una tarjeta que abre la ficha.
// La ficha (VolverAlListado) mira esa marca: si la ficha actual es la que se
// abrió desde el listado, router.back() (el navegador restaura scroll y
// filtros); si no, push a la última búsqueda guardada o a /propiedades.

const CLAVE_LISTADO = 'si_ultimo_listado'
const CLAVE_SALIDA = 'si_salida_listado'

function ss(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.sessionStorage : null
  } catch {
    return null
  }
}

/** Ruta + query del listado (ej. "/propiedades?operacion=venta&q=funes"). */
export function guardarUltimoListado(url: string): void {
  if (!url.startsWith('/propiedades')) return
  try {
    ss()?.setItem(CLAVE_LISTADO, url)
  } catch {
    /* modo privado */
  }
}

export function leerUltimoListado(): string | null {
  try {
    const v = ss()?.getItem(CLAVE_LISTADO) ?? null
    return v && v.startsWith('/propiedades') ? v : null
  } catch {
    return null
  }
}

/** Llamar al tocar una tarjeta del listado que navega a la ficha. */
export function marcarSalidaDelListado(rutaFicha: string): void {
  try {
    ss()?.setItem(CLAVE_SALIDA, rutaFicha.split('?')[0])
  } catch {
    /* modo privado */
  }
}

/** ¿Esta ficha se abrió desde el listado (y entonces "atrás" es el listado)? */
export function vinoDelListado(rutaFichaActual: string): boolean {
  try {
    return ss()?.getItem(CLAVE_SALIDA) === rutaFichaActual.split('?')[0]
  } catch {
    return false
  }
}
