import Image from '@/components/Imagen'
import { PanelFichaPrevia } from '@/components/property-detail/PropertyDetailZillowDesktopPanel'

// Mientras llega la ficha, la MISMA forma que la ficha: antes era un bloque
// gris de 60vh a sangre y una grilla de 3 columnas que no se parecía a nada, y
// al llegar la página el contenido saltaba (en un iPhone, ~226 px hacia arriba,
// y el header aparecía de golpe).
//
// Celu: header de 56 (+ área segura) con el logo real, foto de 280 con 16 px a
// los costados, la tira de secciones de 52 y las tarjetas del resumen y del
// contacto. Compu: el esqueleto del panel de la ficha (el mismo que muestra la
// página antes de hidratar). El pulso solo con movimiento permitido.

const TARJETA = 'bg-white rounded-2xl p-6 shadow-sm border border-gray-100'

export default function Loading() {
  return (
    <>
      <div className="md:hidden min-h-screen bg-[#fafafa]" aria-busy="true" aria-label="Cargando la propiedad">
        <div
          className="sticky top-0 z-40 bg-white border-b border-gray-200 grid items-center px-4"
          style={{
            height: 'calc(56px + env(safe-area-inset-top, 0px))',
            paddingTop: 'env(safe-area-inset-top, 0px)',
            gridTemplateColumns: 'minmax(76px,1fr) auto minmax(76px,1fr)',
          }}
        >
          <div className="h-4 w-16 rounded bg-gray-200" />
          <Image
            src="/LOGO_HORIZONTAL.png"
            alt="SI INMOBILIARIA"
            width={120}
            height={24}
            className="h-6 w-[120px] object-contain si-theme-logo"
            priority
          />
          <div className="flex justify-end">
            <div className="h-9 w-9 rounded-full bg-gray-100" />
          </div>
        </div>

        <div className="motion-safe:animate-pulse">
          <div className="px-4 pt-3 pb-2">
            <div className="h-[280px] rounded-xl bg-gray-200" />
          </div>

          <div className="bg-white flex items-center gap-1 px-4 overflow-hidden" style={{ height: 52 }}>
            {[88, 128, 112, 100].map((w, i) => (
              <div key={i} className="h-9 shrink-0 rounded-full bg-gray-100" style={{ width: w }} />
            ))}
          </div>

          <div className="px-4 py-4 space-y-4">
            <div className={`${TARJETA} space-y-3`}>
              <div className="h-7 w-11/12 rounded bg-gray-200" />
              <div className="h-5 w-2/3 rounded bg-gray-100" />
              <div className="h-8 w-1/2 rounded bg-gray-200" />
            </div>
            <div className={`${TARJETA} space-y-4`}>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/2 rounded bg-gray-200" />
                  <div className="h-3 w-1/3 rounded bg-gray-100" />
                </div>
              </div>
              <div className="h-12 rounded-full bg-gray-200" />
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        <PanelFichaPrevia />
      </div>
    </>
  )
}
