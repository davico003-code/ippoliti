// "VER LA FICHA COMPLETA" EN NEGRO (David 5-oct: "sí sí, todo a negro"). Adentro
// del Tinder la ficha de la web se abre en un iframe (misma web, /seleccion/ficha).
// No se reescribe esa página: al cargar se le pone una capa oscura —se invierte
// la página y se vuelven a invertir las fotos, el mapa y los verdes de marca y de
// WhatsApp, que quedan con su color de siempre— y se esconde su barra de arriba
// ("← Mapa" + logo): adentro del Tinder ya está "Volver a los detalles".
// Solo pasa en el iframe del Tinder; la ficha en la web sigue blanca.

const MARCA = 'si-color-original'

const CSS = `
html { filter: invert(0.93) hue-rotate(180deg); background: #fff !important; }
img, video, picture, canvas, iframe, [style*="background-image"], .leaflet-tile-pane, .${MARCA} { filter: invert(1) hue-rotate(180deg); }
.${MARCA} img, .${MARCA} video, .${MARCA} picture, .${MARCA} canvas, .${MARCA} [style*="background-image"] { filter: none; }
.sticky.top-0:has(a[aria-label="Volver al mapa"]) { display: none !important; }
`

/** ¿Un fondo verde que tiene que quedar con su color (marca #1A5C38, WhatsApp #25D366)? */
export function esVerdeDeMarca(fondo: string): boolean {
  const m = fondo.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/)
  if (!m) return false
  const [r, g, b] = [m[1], m[2], m[3]].map(Number)
  const alfa = m[4] === undefined ? 1 : Number(m[4])
  return alfa > 0.5 && g > r + 30 && g > b + 10
}

export function oscurecerFicha(iframe: HTMLIFrameElement): void {
  try {
    const doc = iframe.contentDocument
    const win = iframe.contentWindow
    if (!doc || !win || doc.getElementById('si-ficha-oscura')) return
    const estilo = doc.createElement('style')
    estilo.id = 'si-ficha-oscura'
    estilo.textContent = CSS
    doc.head.appendChild(estilo)
    const marcar = () => {
      // En orden de documento: si el padre ya quedó con su color, el hijo no se vuelve a invertir.
      doc.querySelectorAll<HTMLElement>('a, button, span, div').forEach((el) => {
        if (el.classList.contains(MARCA) || el.parentElement?.closest(`.${MARCA}`)) return
        if (esVerdeDeMarca(win.getComputedStyle(el).backgroundColor)) el.classList.add(MARCA)
      })
    }
    marcar()
    // La ficha arma secciones al bajar (mapa, barrio, planos): se vuelven a mirar.
    let espera: number | null = null
    new MutationObserver(() => {
      if (espera != null) return
      espera = win.setTimeout(() => {
        espera = null
        marcar()
      }, 250)
    }).observe(doc.body, { childList: true, subtree: true })
  } catch {
    /* sin acceso al iframe: queda como siempre (blanca) */
  }
}
