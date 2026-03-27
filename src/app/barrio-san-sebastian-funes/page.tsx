import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Propiedades en San Sebastián, Funes — SI Inmobiliaria',
  description: 'Casas, lotes y terrenos en barrio San Sebastián, Funes. Barrio cerrado premium a minutos de Rosario. SI Inmobiliaria — más de 40 años en la zona.',
  openGraph: {
    title: 'Propiedades en San Sebastián, Funes — SI Inmobiliaria',
    description: 'Barrio cerrado premium en Funes con seguridad 24hs, pileta, club house y canchas.',
  },
}

export default function BarrioSanSebastianPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-[#1A5C38] py-20 px-4 text-center">
        <p className="text-white/60 text-xs uppercase tracking-widest font-semibold mb-3">BARRIO CERRADO · FUNES</p>
        <h1 className="text-4xl md:text-5xl font-black text-white max-w-3xl mx-auto leading-tight">
          Propiedades en San Sebastián, Funes
        </h1>
        <p className="text-white/70 text-lg mt-4 max-w-xl mx-auto">
          Uno de los barrios cerrados más consolidados de Funes, con seguridad 24hs y amenities completos
        </p>
      </section>

      {/* Stats pills */}
      <section className="py-10 px-4">
        <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-3">
          {['Barrio cerrado', 'A 20 min de Rosario', 'Desde USD 120.000'].map(s => (
            <span key={s} className="px-5 py-2.5 bg-white rounded-full text-sm font-semibold text-gray-700 shadow-sm border border-gray-100">{s}</span>
          ))}
        </div>
      </section>

      {/* CTAs */}
      <section className="pb-10 px-4">
        <div className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/propiedades?location=funes" className="px-8 py-4 bg-[#1A5C38] hover:bg-[#15472c] text-white font-bold rounded-xl text-center transition-colors">
            Ver propiedades en San Sebastián
          </Link>
          <Link href="/tasaciones" className="px-8 py-4 border-2 border-[#1A5C38] text-[#1A5C38] hover:bg-[#1A5C38] hover:text-white font-bold rounded-xl text-center transition-colors">
            Tasá tu propiedad
          </Link>
        </div>
      </section>

      {/* SEO content */}
      <section className="bg-[#f8f7f4] border-t-4 border-[#1A5C38] py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <p className="text-[#1A5C38] text-xs font-bold tracking-widest mb-3">SAN SEBASTIÁN · FUNES</p>
              <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Raleway, sans-serif' }}>
                Vivir en San Sebastián
              </h2>
              <p className="text-gray-600 text-base leading-relaxed mb-6" style={{ fontFamily: 'Raleway, sans-serif' }}>
                San Sebastián es uno de los barrios cerrados más buscados de Funes. Ubicado sobre la Autopista Rosario-Córdoba, combina la tranquilidad del campo con la cercanía a Rosario centro en solo 20 minutos. Si estás pensando en invertir o mudarte, es una de las mejores opciones de la zona oeste.
              </p>
              <p className="text-gray-600 text-base leading-relaxed" style={{ fontFamily: 'Raleway, sans-serif' }}>
                El barrio cuenta con seguridad las 24 horas, control de acceso vehicular, pileta climatizada, club house, canchas de tenis y paddle, salón de usos múltiples y amplios espacios verdes. Las calles internas son asfaltadas y arboladas, con iluminación completa y una atmósfera residencial de primer nivel.
              </p>
            </div>
            <div className="text-gray-600 text-sm leading-relaxed space-y-3" style={{ fontFamily: 'Raleway, sans-serif' }}>
              <p>
                Las tipologías van desde lotes de 600 a 1200 m² hasta casas terminadas de 3, 4 y 5 dormitorios. Muchas propiedades tienen pileta propia, quincho y garage doble. Es un barrio ideal para familias que buscan espacio, seguridad y calidad de vida sin resignar conectividad con Rosario.
              </p>
              <p>
                En los últimos años, San Sebastián consolidó su posición como uno de los barrios con mayor demanda de Funes. Los valores de reventa crecieron sostenidamente, lo que lo convierte también en una excelente opción de inversión. Los lotes disponibles son cada vez más escasos, lo que impulsa el valor del m².
              </p>
              <p>
                Funes en general viene creciendo a un ritmo muy fuerte. Con la mejora de la Autopista, la expansión de servicios y la apertura de colegios privados en la zona, cada vez más familias eligen mudarse desde Rosario. San Sebastián es, dentro de ese crecimiento, una de las opciones premium con mejor relación entre precio, ubicación y amenities.
              </p>
              <p>
                Si tenés una propiedad en San Sebastián y querés vender o alquilar, en SI Inmobiliaria conocemos el barrio como nadie. Con más de 40 años de trayectoria en la zona y oficinas en Funes y Roldán, te acompañamos en todo el proceso — desde la tasación hasta la escritura.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
