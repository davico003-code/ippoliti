'use client'

// Tour 360° de Distrito Roldán (distritoroldan360.com, hecho en 3DVista):
// masterplan con la disponibilidad de lotes sobre la foto aérea, vistas 360°
// con drone y la vista proyectada del barrio terminado.
// En la página se ve un clip corto grabado del tour; el botón abre el tour
// real, navegable, en un visor sobre la presentación (no se va a otro sitio).

import { useCallback, useState } from 'react'
import { Orbit } from 'lucide-react'
import { CapaVisor } from './VisorYoutube'

const URL_TOUR_360 = 'https://distritoroldan360.com/'

export default function BotonTour360({ children }: { children: React.ReactNode }) {
  const [abierto, setAbierto] = useState(false)
  const cerrar = useCallback(() => setAbierto(false), [])
  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="inline-flex min-h-[48px] items-center gap-2.5 rounded-full px-6 text-[15px] font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5"
        style={{ background: '#1A5C38' }}
      >
        <Orbit size={18} aria-hidden />
        {children}
      </button>
      {abierto && (
        <CapaVisor etiqueta="Tour 360° de Distrito Roldán" onCerrar={cerrar}>
          <div
            className="relative overflow-hidden rounded-[18px] bg-black shadow-2xl"
            style={{ width: 'min(1440px, calc(100vw - 32px))', height: 'min(86svh, 900px)' }}
          >
            <iframe
              src={URL_TOUR_360}
              title="Tour 360° de Distrito Roldán"
              allow="fullscreen; accelerometer; gyroscope; xr-spatial-tracking"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
        </CapaVisor>
      )}
    </>
  )
}
