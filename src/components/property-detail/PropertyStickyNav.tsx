'use client'

// Sticky Zillow-style tab nav, en la compu y en el celu (en el celu la tira se
// desliza de costado). Works for both window scrolling (full page) and
// container scrolling (modal). In modal, pass `scrollRoot` = the modal's
// overflow-y-auto element so the nav sticks to its top and the scroll-spy
// observes intersections inside it.
//
// 25-oct-2026: pestañas de 44 px (mínimo táctil de Apple), la activa se centra
// sola en la tira (antes, al bajar a "Ubicación" quedaba escondida a la
// derecha) y al tocar una pestaña la pastilla va directo a ella: antes recorría
// Resumen, Características, Descripción… mientras la página bajaba.
import { useEffect, useRef, useState } from 'react'
import { findPropertySection } from './propertySectionTarget'

/** 'smooth' salvo para quien pidió menos movimiento (el behavior de JS ignora el reset de CSS). */
function scrollSuave(): ScrollBehavior {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
}

type Section = { id: string; label: string }

/**
 * Alto FIJO de la barra (px). Lo que se pega debajo (la columna de contacto de
 * la compu) se calcula con esto: antes la barra medía lo que daba el texto y la
 * columna se metía por debajo (4-oct-2026: le cortaba la cabeza al agente).
 */
export const ALTURA_NAV_FICHA = 52

export default function PropertyStickyNav({
  sections,
  scrollRoot,
  stickyTop = 0,
}: {
  sections: Section[]
  /** Element to observe scroll on. Omit for window scroll. */
  scrollRoot?: HTMLElement | null
  /** Top offset for sticky positioning (px). */
  stickyTop?: number
}) {
  const [active, setActive] = useState<string>(sections[0]?.id ?? '')
  const navRef = useRef<HTMLElement>(null)
  const ulRef = useRef<HTMLUListElement>(null)
  // Mientras corre el scroll programático de jumpTo, el scroll-spy no toca la
  // pastilla. Se suelta cuando el scroll se queda quieto (Safari no tiene
  // `scrollend` confiable), si la persona agarra la página, o a los 1,5 s.
  const bloqueo = useRef<{ quieto: number; tope: number } | null>(null)
  const soltarRef = useRef<() => void>(() => {})

  // Scroll-spy (21-oct-2026): la pestaña activa es la ÚLTIMA sección cuyo
  // comienzo ya pasó una línea fija debajo de la barra. Antes un
  // IntersectionObserver elegía entre las que acababan de cruzar una franja y,
  // con secciones largas, quedaba marcada la anterior (David leía la
  // Descripción con "Video" marcado). Al llegar al final de la página va la
  // última pestaña: la sección de abajo nunca llega a la línea.
  const clave = sections.map(s => s.id).join('|')
  useEffect(() => {
    const ids = clave.split('|').filter(Boolean)
    let raf = 0
    const calcular = () => {
      raf = 0
      if (bloqueo.current) return
      const tope = scrollRoot ? scrollRoot.getBoundingClientRect().top : 0
      const alto = scrollRoot ? scrollRoot.clientHeight : window.innerHeight
      const linea = tope + stickyTop + ALTURA_NAV_FICHA + alto * 0.2
      const alFinal = scrollRoot
        ? scrollRoot.scrollTop + scrollRoot.clientHeight >= scrollRoot.scrollHeight - 4
        : window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4
      let actual = ids[0] ?? ''
      let mejor = -Infinity
      for (const id of ids) {
        const el = findPropertySection(id, scrollRoot)
        if (!el) continue
        const arriba = el.getBoundingClientRect().top
        if (alFinal) actual = id
        else if (arriba <= linea && arriba > mejor) {
          mejor = arriba
          actual = id
        }
      }
      setActive(actual)
    }
    // Fin del scroll programático: la pastilla queda en la pestaña tocada (no se
    // recalcula acá; el próximo scroll de la persona vuelve a mandar).
    const soltar = () => {
      const b = bloqueo.current
      if (!b) return
      window.clearTimeout(b.quieto)
      window.clearTimeout(b.tope)
      bloqueo.current = null
    }
    soltarRef.current = soltar
    const alScrollear = () => {
      const b = bloqueo.current
      if (b) {
        // Sigue moviéndose: se espera a que pasen 150 ms sin scroll.
        window.clearTimeout(b.quieto)
        b.quieto = window.setTimeout(soltar, 150)
        return
      }
      if (!raf) raf = requestAnimationFrame(calcular)
    }
    const objetivo: HTMLElement | Window = scrollRoot ?? window
    calcular()
    objetivo.addEventListener('scroll', alScrollear, { passive: true })
    objetivo.addEventListener('scrollend', soltar)
    window.addEventListener('resize', alScrollear)
    // Si la persona toca, rueda o usa el teclado durante el viaje, manda ella.
    const tomaElControl = ['wheel', 'touchstart', 'keydown'] as const
    tomaElControl.forEach(t => window.addEventListener(t, soltar, { passive: true }))
    return () => {
      objetivo.removeEventListener('scroll', alScrollear)
      objetivo.removeEventListener('scrollend', soltar)
      window.removeEventListener('resize', alScrollear)
      tomaElControl.forEach(t => window.removeEventListener(t, soltar))
      soltar()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [clave, scrollRoot, stickyTop])

  // La pestaña activa se centra sola en la tira (en el celu entran ~4 de 7).
  // Se mueve SOLO la tira (scrollTo del <ul>), nunca scrollIntoView: ese
  // también mueve la página y cortaba el scroll suave de jumpTo o la inercia
  // del iPhone. En la compu, donde entran todas, no hay nada que mover.
  useEffect(() => {
    const ul = ulRef.current
    if (!ul || ul.scrollWidth <= ul.clientWidth) return
    const b = ul.querySelector<HTMLElement>('[aria-current="true"]')
    if (!b) return
    const u = ul.getBoundingClientRect()
    const r = b.getBoundingClientRect()
    const delta = r.left + r.width / 2 - (u.left + u.width / 2)
    if (Math.abs(delta) < 2) return
    ul.scrollTo({ left: ul.scrollLeft + delta, behavior: scrollSuave() })
  }, [active])

  const jumpTo = (id: string) => {
    const el = findPropertySection(id, scrollRoot)
    if (!el) return
    // Scroll manual del contenedor correcto (el div del overlay O window). Más
    // confiable que scrollIntoView smooth en Safari con contenedores anidados.
    const navH = navRef.current?.offsetHeight ?? 0
    const offset = stickyTop + navH + 12
    // La pastilla va directo a la tocada y el scroll-spy se calla hasta que la
    // página llegue (si no, marcaba cada sección intermedia). Si el scroll ni
    // arranca (ya estaba ahí), se suelta solo a los 300 ms.
    soltarRef.current()
    bloqueo.current = { quieto: window.setTimeout(() => soltarRef.current(), 300), tope: window.setTimeout(() => soltarRef.current(), 1500) }
    setActive(id)
    if (scrollRoot) {
      const y = el.getBoundingClientRect().top - scrollRoot.getBoundingClientRect().top + scrollRoot.scrollTop - offset
      scrollRoot.scrollTo({ top: Math.max(0, y), behavior: scrollSuave() })
    } else {
      const y = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top: Math.max(0, y), behavior: scrollSuave() })
    }
  }

  return (
    <nav
      ref={navRef}
      className="sticky z-30 flex items-center bg-white shadow-[0_1px_0_rgba(17,17,17,0.06),0_8px_16px_-12px_rgba(17,17,17,0.18)]"
      style={{ top: stickyTop, height: ALTURA_NAV_FICHA }}
      aria-label="Secciones de la propiedad"
    >
      <div className="max-w-7xl mx-auto w-full px-4 md:px-6 lg:px-8">
        <ul ref={ulRef} className="flex items-center gap-1 overflow-x-auto overscroll-x-contain scrollbar-none md:justify-center">
          {sections.map(s => {
            const isActive = active === s.id
            return (
              <li key={s.id} className="shrink-0">
                {/* 44 px de toque (h-11, entra en la barra de 52) con la pastilla
                    de siempre (36 px) adentro: más fácil de embocar sin que la
                    barra se vea más pesada. Mismo peso en todas: con la activa en
                    bold el texto cambiaba de ancho y la fila se corría 1-3 px en
                    cada cambio; la marca es fondo + color. El hover va en la
                    pastilla con las mismas clases de antes (las que el modo
                    oscuro de globals.css ya traduce). */}
                <button
                  type="button"
                  onClick={() => jumpTo(s.id)}
                  aria-current={isActive ? 'true' : undefined}
                  className="flex h-11 items-center"
                  style={{ fontFamily: "var(--font-raleway, 'Raleway'), system-ui, sans-serif" }}
                >
                  <span
                    className={`flex h-9 items-center rounded-full px-4 text-[14px] font-semibold whitespace-nowrap transition-colors duration-150 ${
                      isActive ? 'bg-[#e7f2eb] text-[#1A5C38]' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800 active:opacity-70'
                    }`}
                  >
                    {s.label}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
