'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Carrusel horizontal con botones de navegación tipo Zillow.
 *
 * - Children se renderizan dentro de un div con overflow-x-auto + snap-x
 * - Botones < > aparecen solo en desktop (md+)
 * - Botones ocultos en los extremos (primera/última posición)
 * - Scroll suave de ~1 tarjeta por click (usa width del primer hijo)
 */
export default function HorizontalCarousel({
  children,
  className,
  style,
}: {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const updateState = () => {
    const el = scrollRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanLeft(scrollLeft > 8)
    setCanRight(scrollLeft + clientWidth < scrollWidth - 8)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateState()
    el.addEventListener('scroll', updateState, { passive: true })
    window.addEventListener('resize', updateState)
    return () => {
      el.removeEventListener('scroll', updateState)
      window.removeEventListener('resize', updateState)
    }
  }, [])

  const scrollByCard = (dir: 1 | -1) => {
    const el = scrollRef.current
    if (!el) return
    // Ancho de la primera card hija como referencia (+ gap aproximado)
    const firstChild = el.firstElementChild as HTMLElement | null
    const step = firstChild ? firstChild.getBoundingClientRect().width + 12 : el.clientWidth * 0.8
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className={className ?? 'flex gap-3 overflow-x-auto snap-x snap-mandatory px-1 py-2 pb-3 scrollbar-none'}
        style={{ overflowY: 'visible', ...style }}
      >
        {children}
      </div>

      {/* Botones solo desktop (md+) */}
      <button
        type="button"
        aria-label="Anterior"
        onClick={() => scrollByCard(-1)}
        className="hidden md:flex items-center justify-center absolute top-1/2 -translate-y-1/2 left-2 z-10 transition-opacity"
        style={{
          width: 40, height: 40, borderRadius: '50%',
          background: '#fff', border: '1px solid #e5e7eb',
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          cursor: canLeft ? 'pointer' : 'default',
          opacity: canLeft ? 1 : 0,
          pointerEvents: canLeft ? 'auto' : 'none',
        }}
      >
        <ChevronLeft className="w-5 h-5 text-gray-700" />
      </button>
      <button
        type="button"
        aria-label="Siguiente"
        onClick={() => scrollByCard(1)}
        className="hidden md:flex items-center justify-center absolute top-1/2 -translate-y-1/2 right-2 z-10 transition-opacity"
        style={{
          width: 40, height: 40, borderRadius: '50%',
          background: '#fff', border: '1px solid #e5e7eb',
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          cursor: canRight ? 'pointer' : 'default',
          opacity: canRight ? 1 : 0,
          pointerEvents: canRight ? 'auto' : 'none',
        }}
      >
        <ChevronRight className="w-5 h-5 text-gray-700" />
      </button>
    </div>
  )
}
