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

  // Scroll-spy: la pestaña activa es la sección más alta que cruza una línea de
  // activación cerca del tope. Banda finita para que no queden dos activas.
  useEffect(() => {
    const opts: IntersectionObserverInit = {
      root: scrollRoot ?? null,
      rootMargin: '-15% 0px -75% 0px',
      threshold: 0,
    }
    const io = new IntersectionObserver((entries) => {
      const visibles = entries.filter(e => e.isIntersecting)
      if (visibles.length === 0) return
      // La que estás mirando = la más cercana al tope entre las que cruzan.
      const top = visibles.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
      if (top?.target?.id) setActive(top.target.id)
    }, opts)

    sections.forEach(s => {
      const el = findPropertySection(s.id, scrollRoot)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [sections, scrollRoot])

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
