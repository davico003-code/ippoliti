'use client'

// Sticky Zillow-style tab nav. Desktop only (`hidden md:flex`). Works for both
// window scrolling (full page) and container scrolling (modal). In modal, pass
// `scrollRoot` = the modal's overflow-y-auto element so the nav sticks to its
// top and the scroll-spy observes intersections inside it.
import { useEffect, useRef, useState } from 'react'

type Section = { id: string; label: string }

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
      const el = document.getElementById(s.id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [sections, scrollRoot])

  const jumpTo = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    // scrollIntoView scrollea el ancestro scrolleable correcto (window O el div
    // del overlay) y RESPETA el scroll-margin-top de la sección (scroll-mt-*),
    // así queda justo debajo del header + esta barra. Antes el offset manual
    // fallaba en el overlay (Ubicación/Similares saltaban al tope).
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActive(id)
  }

  return (
    <nav
      ref={navRef}
      className="sticky z-30 bg-white border-b border-gray-200"
      style={{ top: stickyTop }}
      aria-label="Secciones de la propiedad"
    >
      <div className="max-w-7xl mx-auto w-full px-4 md:px-6 lg:px-8">
        <ul className="flex gap-1 md:gap-2 overflow-x-auto scrollbar-none">
          {sections.map(s => {
            const isActive = active === s.id
            return (
              <li key={s.id}>
                <button
                  onClick={() => jumpTo(s.id)}
                  className={`relative px-4 py-4 text-[13px] font-semibold whitespace-nowrap transition-colors ${
                    isActive ? 'text-[#1A5C38]' : 'text-gray-500 hover:text-gray-800'
                  }`}
                  style={{ fontFamily: "'Raleway', system-ui, sans-serif" }}
                >
                  {s.label}
                  {isActive && (
                    <span className="absolute left-3 right-3 bottom-0 h-[3px] rounded-t-sm" style={{ background: '#1A5C38' }} />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
