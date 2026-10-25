'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

// Fondo con token del tema: el bg-white/85 no se remapeaba en oscuro y el verde
// del texto sí (pasa a menta), así que quedaba menta sobre blanco, casi invisible.
// En claro queda igual (blanco al 85 %); en oscuro, la pastilla oscura del tema.
// Sin Poppins (es texto) y con 44 px de toque. Arriba respeta el notch: la web
// usa viewport-fit=cover y a 20 px fijos quedaba debajo de la barra de estado.
export default function BotonVolver() {
  return (
    <Link
      href="/emprendimientos"
      aria-label="Volver a emprendimientos"
      className="fixed z-50 inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full bg-[var(--theme-overlay,rgba(255,255,255,.85))] px-4 py-2.5 text-sm font-medium text-[#1A5C38] shadow-md backdrop-blur-md transition-all hover:-translate-x-0.5 hover:bg-[var(--card-surface,#fff)]"
      style={{ top: 'calc(env(safe-area-inset-top, 0px) + 20px)', left: 'calc(env(safe-area-inset-left, 0px) + 20px)' }}
    >
      <ChevronLeft size={18} strokeWidth={2.5} />
      <span className="hidden sm:inline">Volver</span>
    </Link>
  )
}
