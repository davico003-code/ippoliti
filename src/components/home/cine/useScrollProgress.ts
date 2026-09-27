'use client'

import { useEffect, type RefObject } from 'react'

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

/** Tramo [a, b] de un progreso 0→1 re-mapeado a 0→1. */
export const tramo = (p: number, a: number, b: number) => clamp01((p - a) / (b - a))

/** Curva suave (easeInOutCubic) para que nada arranque ni frene en seco. */
export const suave = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/**
 * Progreso de scroll 0→1 de un contenedor alto con un hijo sticky: 0 cuando su
 * borde superior toca el tope del viewport, 1 cuando el inferior toca el fondo.
 * Llama a `onFrame` en rAF sin re-renderizar React (los componentes escriben
 * estilos directo en refs), así el scroll queda a 60 fps también en celulares.
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  onFrame: (p: number) => void,
) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    let last = -1
    const medir = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const recorrido = r.height - window.innerHeight
      const p = recorrido > 0 ? clamp01(-r.top / recorrido) : r.top < 0 ? 1 : 0
      if (Math.abs(p - last) < 0.0005) return
      last = p
      onFrame(p)
    }
    const pedir = () => { if (!raf) raf = requestAnimationFrame(medir) }
    medir()
    window.addEventListener('scroll', pedir, { passive: true })
    window.addEventListener('resize', pedir)
    return () => {
      window.removeEventListener('scroll', pedir)
      window.removeEventListener('resize', pedir)
      if (raf) cancelAnimationFrame(raf)
    }
    // onFrame se define en cada render pero solo escribe en refs: no hace
    // falta re-suscribir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref])
}

/** true si el usuario pidió menos movimiento en el sistema. */
export function prefiereQuieto() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
