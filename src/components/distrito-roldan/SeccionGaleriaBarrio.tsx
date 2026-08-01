// El barrio hoy: las fotos reales que están cargadas en el CRM.
//
// Vienen del emprendimiento, no de archivos del repo: cuando se suben fotos
// nuevas al CRM aparecen acá solas, sin tocar código. Si alguna no debería
// mostrarse, se saca desde el CRM.
//
// Va justo después de los renders a propósito: primero cómo va a quedar,
// después cómo está hoy. Es lo que sostiene la credibilidad del proyecto antes
// de que el visitante elija un lote.

import GaleriaBarrio from './GaleriaBarrio'
import { soloFotosDelBarrio } from './fotosBarrio'

interface Props {
  /** Galería completa del CRM: acá se filtran los renders. */
  fotos: string[]
  proyecto: string
}

export default function SeccionGaleriaBarrio({ fotos: todas, proyecto }: Props) {
  const fotos = soloFotosDelBarrio(todas)
  if (!fotos.length) return null

  return (
    <section id="barrio" className="bg-white px-6 py-20 md:py-28">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold text-[#B35E21]">Fotos del barrio</p>
            <h2 className="mt-4 text-balance text-[clamp(36px,4.8vw,60px)] font-bold leading-[1.04] tracking-[-0.03em] text-[#345544]">
              El barrio hoy.
            </h2>
          </div>
          <p className="max-w-[62ch] text-pretty text-[15px] leading-7 text-[#345544] lg:justify-self-end">
            Imágenes reales del predio y su entorno: el trazado de las calles, los lotes ya
            demarcados y la relación del barrio con Roldán. Tocá cualquiera para verla en grande.
          </p>
        </div>

        <div className="mt-12">
          <GaleriaBarrio fotos={fotos} proyecto={proyecto} />
        </div>
      </div>
    </section>
  )
}
