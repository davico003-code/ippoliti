'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Carrusel horizontal de la landing de Galinda! (como el de fundar.com.ar):
// se desliza con el dedo; en la compu, flechas que avanzan de a una pantalla.
export default function Carrusel({ label, children }: { label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const mover = (dir: 1 | -1) => {
    const el = ref.current
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
  }
  return (
    <div className="relative">
      <div
        ref={ref}
        role="region"
        aria-label={label}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 [scrollbar-width:none] md:scroll-px-[max(1rem,calc((100vw-72rem)/2+1rem))] md:px-[max(1rem,calc((100vw-72rem)/2+1rem))] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      <div className="mx-auto mt-4 hidden max-w-6xl justify-end gap-2 px-4 md:flex">
        <button
          type="button"
          onClick={() => mover(-1)}
          aria-label="Anterior"
          className="rounded-full border border-[var(--line)] p-3 text-[var(--foreground)] transition-colors hover:border-[var(--brand)]"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => mover(1)}
          aria-label="Siguiente"
          className="rounded-full border border-[var(--line)] p-3 text-[var(--foreground)] transition-colors hover:border-[var(--brand)]"
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </div>
  )
}
