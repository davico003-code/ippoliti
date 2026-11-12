// El "atrás" del navegador con el Tinder abierto (MazoCasas, 4-oct-2026): lo
// maneja el mazo (pregunta antes de salir). Mientras esta marca está puesta,
// los demás que escuchan popstate —la ficha de la compu, PropertyPanel— lo
// ignoran: en la ventana se ejecutan en el orden en que se registraron y no hay
// forma de que el mazo se adelante.

import { useEffect, useRef } from 'react'

const ATRIBUTO = 'data-mazo-abierto'

export function marcarMazoAbierto(abierto: boolean): void {
  if (abierto) document.documentElement.setAttribute(ATRIBUTO, '')
  else document.documentElement.removeAttribute(ATRIBUTO)
}

/** ¿El atrás de este momento es del mazo? */
export function atrasEsDelMazo(): boolean {
  return typeof document !== 'undefined' && document.documentElement.hasAttribute(ATRIBUTO)
}

/**
 * Mientras el mazo está abierto hay una entrada propia en el historial (misma
 * URL): el gesto o el botón Atrás solo la sacan a ella y se llama a `porAtras`
 * (lo mismo que la X). true = se queda (se vuelve a poner la entrada).
 * La entrada sobrevive al desmontar/montar de prueba de React (StrictMode en
 * desarrollo): el back() de limpieza se posterga un instante y se cancela si
 * el mazo vuelve a montarse (mismo truco que PropertyPanel).
 */
export function useAtrasDelMazo(porAtras: { readonly current: () => boolean }): void {
  const entrada = useRef<{ marca: string; propia: boolean; backTimer: number | null } | null>(null)
  useEffect(() => {
    const empujar = (marca: string) => window.history.pushState({ ...(window.history.state ?? {}), siMazo: marca }, '')
    let e = entrada.current
    if (e && e.backTimer != null) {
      window.clearTimeout(e.backTimer)
      e.backTimer = null
    } else {
      e = entrada.current = { marca: `mazo-${Date.now()}`, propia: true, backTimer: null }
      empujar(e.marca)
    }
    const actual = e
    marcarMazoAbierto(true)
    // Ojo: en la ventana, el popstate lo atienden los listeners EN EL ORDEN EN
    // QUE SE REGISTRARON (la captura no adelanta a nadie). Los de antes —la
    // ficha de la compu (PropertyPanel se cierra con cualquier popstate)— miran
    // esta marca (atrasEsDelMazo) y lo dejan pasar; a los de después se los corta.
    const onPop = (ev: PopStateEvent) => {
      ev.stopImmediatePropagation()
      actual.propia = false
      if (porAtras.current()) {
        empujar(actual.marca)
        actual.propia = true
      }
    }
    window.addEventListener('popstate', onPop, true)
    return () => {
      window.removeEventListener('popstate', onPop, true)
      actual.backTimer = window.setTimeout(() => {
        actual.backTimer = null
        entrada.current = null
        if (!actual.propia || window.history.state?.siMazo !== actual.marca) return marcarMazoAbierto(false)
        // Se cerró con la X: se saca la entrada propia sin que nadie más se entere
        // (la marca sigue puesta hasta que pase ese popstate).
        const listo = () => {
          window.removeEventListener('popstate', tragar, true)
          marcarMazoAbierto(false)
        }
        const tragar = (ev: PopStateEvent) => {
          ev.stopImmediatePropagation()
          listo()
        }
        window.addEventListener('popstate', tragar, true)
        window.setTimeout(listo, 1500)
        window.history.back()
      }, 0)
    }
  }, [porAtras])
}
