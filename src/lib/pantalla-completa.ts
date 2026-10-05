// Pantalla completa del navegador (oculta la barra de direcciones). La usan el
// botón de "Cómo trabajamos" y el Tinder en el celu (David 5-oct-2026: "¿hay
// forma de que se oculte la barra cuando entramos al Tinder?").
// Android (Chrome, Samsung) la da. El iPhone NO: Safari no deja poner una
// página a pantalla completa (solo los videos), ahí no pasa nada.

import { useEffect } from 'react'

type DocFs = Document & { webkitFullscreenElement?: Element | null; webkitExitFullscreen?: () => Promise<void>; webkitFullscreenEnabled?: boolean }
type ElFs = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> }

export const pantallaCompletaDisponible = (): boolean => {
  const d = document as DocFs
  return Boolean(d.fullscreenEnabled || d.webkitFullscreenEnabled)
}

export const enPantallaCompleta = (): boolean => Boolean(document.fullscreenElement || (document as DocFs).webkitFullscreenElement)

/** true = entró. Necesita un toque reciente; si el navegador la rechaza, la página sigue igual. */
export async function entrarPantallaCompleta(): Promise<boolean> {
  const el = document.documentElement as ElFs
  try {
    await (el.requestFullscreen?.({ navigationUI: 'hide' }) ?? el.webkitRequestFullscreen?.())
    return enPantallaCompleta()
  } catch {
    return false
  }
}

export async function salirPantallaCompleta(): Promise<void> {
  const d = document as DocFs
  try {
    await (d.exitFullscreen?.() ?? d.webkitExitFullscreen?.())
  } catch {
    // Ya había salido (gesto atrás de Android): nada que hacer.
  }
}

/** Pusimos nosotros la pantalla completa (si ya estaba, no la sacamos al cerrar). */
let laPusimos = false
/** El mazo sigue abierto: si cierra antes de que el navegador termine de entrar, se sale al llegar. */
let montado = false
let salidaPendiente: number | null = null

/**
 * Mientras el componente está montado, celu a pantalla completa. Se monta con
 * el toque que lo abre, así el navegador lo permite. Al desmontar sale; la
 * salida se posterga un instante y se cancela si vuelve a montarse (el
 * desmontar/montar de prueba de React en desarrollo, como useAtrasDelMazo).
 */
export function usePantallaCompletaCelu(): void {
  useEffect(() => {
    montado = true
    if (salidaPendiente != null) {
      window.clearTimeout(salidaPendiente)
      salidaPendiente = null
    } else if (window.matchMedia('(pointer: coarse) and (max-width: 767px)').matches && pantallaCompletaDisponible() && !enPantallaCompleta()) {
      laPusimos = true
      void entrarPantallaCompleta().then((entro) => {
        if (!entro) laPusimos = false
        else if (!montado) void salirPantallaCompleta()
      })
    }
    return () => {
      salidaPendiente = window.setTimeout(() => {
        salidaPendiente = null
        montado = false
        if (laPusimos && enPantallaCompleta()) void salirPantallaCompleta()
        laPusimos = false
      }, 0)
    }
  }, [])
}
