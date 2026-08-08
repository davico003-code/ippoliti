// Avances de obra de Distrito Roldán: fotos reales de drone del predio en
// ejecución. Galería clickeable (reusa el visor con lightbox/zoom) sobre el
// estilo de marca del emprendimiento.

import GaleriaAvancesObraLazy from './GaleriaAvancesObraLazy'

export default function SeccionAvancesObra() {
  return (
    <section id="avances" className="bg-[#F8F1E6] px-6 py-20 md:py-28">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold text-[#B35E21]">Avances de obra</p>
            <h2 className="mt-4 text-balance text-[clamp(36px,4.8vw,60px)] font-bold leading-[1.04] tracking-[-0.03em] text-[#345544]">
              La obra, mes a mes.
            </h2>
          </div>
          <p className="max-w-[62ch] text-pretty text-[15px] leading-7 text-[#345544]/75 lg:justify-self-end">
            Seguimos el desarrollo con fotografías reales del predio. Deslizá para recorrer las últimas imágenes de la obra y ver cómo avanza el proyecto.
          </p>
        </div>

        <div className="mt-12">
          <GaleriaAvancesObraLazy />
        </div>
      </div>
    </section>
  )
}
