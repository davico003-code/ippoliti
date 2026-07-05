// Avances de obra de Distrito Roldán: fotos reales de drone del predio en
// ejecución. Galería clickeable (reusa el visor con lightbox/zoom) sobre el
// estilo de marca del emprendimiento.

import FincazulGaleriaLazy from '@/components/fincazul/FincazulGaleriaLazy'

const RALEWAY = 'var(--font-raleway-distrito), Raleway, sans-serif'
const POPPINS = 'var(--font-poppins), Poppins, sans-serif'

const FOTOS = ['obra-1.webp', 'obra-2.webp', 'obra-3.webp', 'obra-4.webp']

export default function SeccionAvancesObra() {
  return (
    <section className="bg-white px-6 py-24 md:py-[120px]">
      <div className="mx-auto max-w-[1180px]">
        <div className="max-w-2xl">
          <p className="mb-4 uppercase text-[#1A5C38]" style={{ fontWeight: 600, letterSpacing: '0.18em', fontSize: 13 }}>
            Avances de obra
          </p>
          <h2 style={{ fontFamily: RALEWAY, fontWeight: 300, fontSize: 'clamp(30px, 4vw, 46px)', lineHeight: 1.15, color: '#0F3F26' }}>
            El proyecto ya está en marcha.
          </h2>
          <p className="mt-5 text-[14px] leading-[1.7] text-[#6b6b6b]" style={{ fontFamily: POPPINS }}>
            Apertura de calles, movimiento de suelos y obras de infraestructura en pleno desarrollo.
            Estas son fotos reales del predio — tocá cualquiera para verla en grande.
          </p>
        </div>

        <div className="mt-10">
          <FincazulGaleriaLazy
            base="/images/distrito-roldan"
            items={FOTOS}
            alt="Avance de obra de Distrito Roldán"
            layout="fotos"
          />
        </div>
      </div>
    </section>
  )
}
