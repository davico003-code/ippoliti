'use client'

import { useEffect, useRef, useState } from 'react'

const SECTIONS = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'caracteristicas', label: 'Características' },
  { id: 'galeria', label: 'Galería' },
  { id: 'descripcion', label: 'Descripción' },
  { id: 'ubicacion', label: 'Ubicación' },
  { id: 'contacto', label: 'Contacto' },
] as const

const HEADER_HEIGHT = 64 // px — altura del header sticky del modal
const NAV_HEIGHT = 44    // px — altura de esta barra de tabs

export default function PropertyModalNav() {
  const [active, setActive] = useState('resumen')
  const navRef = useRef<HTMLDivElement>(null)

  // IntersectionObserver para marcar la tab activa según la sección visible
  useEffect(() => {
    // El scroll container es el panel del modal (el ancestro scrolleable más cercano)
    const scrollContainer = navRef.current?.closest('[data-modal-scroll]') as HTMLElement | null
    if (!scrollContainer) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Tomar la primera sección que esté intersectando
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
            break
          }
        }
      },
      {
        root: scrollContainer,
        rootMargin: `-${HEADER_HEIGHT + NAV_HEIGHT + 20}px 0px -60% 0px`,
        threshold: 0,
      },
    )

    // Observar todas las secciones que existan en el DOM
    for (const { id } of SECTIONS) {
      const el = scrollContainer.querySelector(`#${id}`)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [])

  const handleClick = (id: string) => {
    const scrollContainer = navRef.current?.closest('[data-modal-scroll]') as HTMLElement | null
    const el = scrollContainer?.querySelector(`#${id}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div
      ref={navRef}
      className="sticky z-40 bg-white border-b border-gray-200"
      style={{ top: HEADER_HEIGHT }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex gap-0 overflow-x-auto scrollbar-none">
        {SECTIONS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => handleClick(id)}
            className="relative whitespace-nowrap py-3 px-4 text-sm font-medium transition-colors"
            style={{
              fontFamily: "'Raleway', system-ui, sans-serif",
              color: active === id ? '#1A5C38' : '#6b7280',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {label}
            {/* Underline activo */}
            {active === id && (
              <span
                className="absolute bottom-0 left-4 right-4 h-[2.5px] rounded-full"
                style={{ background: '#1A5C38' }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export { HEADER_HEIGHT, NAV_HEIGHT }
