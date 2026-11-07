// Color de la barra del navegador (<meta name="theme-color">) acompañando el
// tema de la web. Antes quedaba fijo en blanco: con el celu en oscuro, Chrome
// Android pintaba una franja blanca encandilante arriba de una página negra.
//
// Cómo funciona:
// 1. El layout declara dos theme-color, uno por media query del sistema
//    (claro/oscuro): es lo que queda si no corre JavaScript.
// 2. El tema lo decide la HORA ARGENTINA (oscuro de 22 a 7, David 2-nov-2026)
//    o lo que el visitante eligió en esta visita (sessionStorage). El script
//    del <head> (antes de pintar) y ThemeToggle (al tocar) prenden el meta del
//    tema vigente y apagan el otro cambiando su `media` ('all' / 'not all').
//    NUNCA el `content`: React reconoce estos meta por su content al hidratar;
//    si se lo cambiáramos, agregaría un meta duplicado al final del <head>.

/** Mismo blanco que --background en :root. */
export const COLOR_BARRA_CLARO = '#ffffff'
/** Mismo gris que --background de html[data-theme='dark'] (globals.css). */
export const COLOR_BARRA_OSCURO = '#18191b'

export function aplicarColorBarra(oscuro: boolean): void {
  if (typeof document === 'undefined') return
  try {
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
      const esDelOscuro = meta.getAttribute('content') === COLOR_BARRA_OSCURO
      meta.setAttribute('media', esDelOscuro === oscuro ? 'all' : 'not all')
    })
  } catch {
    /* sin color de barra: queda el del sistema */
  }
}

/** Script del <head>: fija data-theme (lo elegido en esta visita o, si no,
 *  la hora argentina: oscuro de 22 a 7) y el color de la barra antes del
 *  primer pintado, sin flash.
 *  Queda mirando el <head> (solo sus hijos directos, no atributos: no se
 *  dispara a sí mismo): en dev, con Fast Refresh, o si React vuelve a armar el
 *  head, los theme-color nuevos llegan con el `media` original y se pierde la
 *  elección manual (visto en /nosotros el 25-oct). Cada vez que entra un meta,
 *  se vuelve a aplicar según el data-theme vigente. */
export const SCRIPT_TEMA_INICIAL = `(function(){var h=document.documentElement,t=null,d=false;try{t=sessionStorage.getItem('si-color-theme')}catch(e){}try{var hs=(new Date().getUTCHours()+21)%24;d=t?t==='dark':(hs>=22||hs<7)}catch(e){}h.dataset.theme=d?'dark':'light';h.style.colorScheme=d?'dark':'light';function b(){try{var o=h.dataset.theme==='dark',m=document.querySelectorAll('meta[name="theme-color"]');for(var i=0;i<m.length;i++){var v=(m[i].getAttribute('content')==='${COLOR_BARRA_OSCURO}')===o?'all':'not all';if(m[i].getAttribute('media')!==v)m[i].setAttribute('media',v)}}catch(e){}}b();try{new MutationObserver(b).observe(document.head,{childList:true})}catch(e){}})()`
