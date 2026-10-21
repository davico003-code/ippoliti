'use client'

// Sticky Zillow-style tab nav. Desktop only (`hidden md:flex`). Works for both
// window scrolling (full page) and container scrolling (modal). In modal, pass
// `scrollRoot` = the modal's overflow-y-auto element so the nav sticks to its
// top and the scroll-spy observes intersections inside it.
import { useEffect, useRef, useState } from 'react'
import { findPropertySection } from './propertySectionTarget'

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
    const alScrollear = () => { if (!raf) raf = requestAnimationFrame(calcular) }
    const objetivo: HTMLElement | Window = scrollRoot ?? window
    calcular()
    objetivo.addEventListener('scroll', alScrollear, { passive: true })
    window.addEventListener('resize', alScrollear)
    return () => {
      objetivo.removeEventListener('scroll', alScrollear)
      window.removeEventListener('resize', alScrollear)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [clave, scrollRoot, stickyTop])

  const jumpTo = (id: string) => {
    const el = findPropertySection(id, scrollRoot)
    if (!el) return
    // Scroll manual del contenedor correcto (el div del overlay O window). Más
    // confiable que scrollIntoView smooth en Safari con contenedores anidados.
    const navH = navRef.current?.offsetHeight ?? 0
    const offset = stickyTop + navH + 12
    if (scrollRoot) {
      const y = el.getBoundingClientRect().top - scrollRoot.getBoundingClientRect().top + scrollRoot.scrollTop - offset
      scrollRoot.scrollTo({ top: Math.max(0, y), behavior: 'smooth' })
    } else {
      const y = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' })
    }
    setActive(id)
  }

  return (
    <nav
      ref={navRef}
      className="sticky z-30 flex items-center bg-white shadow-[0_1px_0_rgba(17,17,17,0.06),0_8px_16px_-12px_rgba(17,17,17,0.18)]"
      style={{ top: stickyTop, height: ALTURA_NAV_FICHA }}
      aria-label="Secciones de la propiedad"
    >
      <div className="max-w-7xl mx-auto w-full px-4 md:px-6 lg:px-8">
        <ul className="flex items-center gap-1 overflow-x-auto scrollbar-none md:justify-center">
          {sections.map(s => {
            const isActive = active === s.id
            return (
              <li key={s.id} className="shrink-0">
                <button
                  onClick={() => jumpTo(s.id)}
                  aria-current={isActive ? 'true' : undefined}
                  className={`h-9 rounded-full px-4 text-[14px] whitespace-nowrap transition-colors ${
                    isActive ? 'bg-[#e7f2eb] text-[#1A5C38] font-bold' : 'text-gray-500 font-semibold hover:bg-gray-100 hover:text-gray-800'
                  }`}
                  style={{ fontFamily: "'Raleway', system-ui, sans-serif" }}
                >
                  {s.label}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
