import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Propiedades en Don Mateo, Funes — SI Inmobiliaria',
  description: 'Casas y lotes en barrio Don Mateo, Funes. Barrio cerrado con pileta, club house y seguridad 24hs. Propiedades en venta y alquiler. SI Inmobiliaria.',
  openGraph: {
    title: 'Propiedades en Don Mateo, Funes — SI Inmobiliaria',
    description: 'Barrio cerrado en Funes con amenities premium y excelente ubicación.',
  },
}

export default function BarrioDonMateoPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-[#1A5C38] py-20 px-4 text-center">
        <p className="text-white/60 text-xs uppercase tracking-widest font-semibold mb-3">BARRIO CERRADO · FUNES</p>
        <h1 className="text-4xl md:text-5xl font-black text-white max-w-3xl mx-auto leading-tight">
          Propiedades en Don Mateo, Funes
        </h1>
        <p className="text-white/70 text-lg mt-4 max-w-xl mx-auto">
          Barrio cerrado familiar con amenities completos y una de las mejores ubicaciones de Funes
        </p>
      </section>

      <section className="py-10 px-4">
        <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-3">
          {['Barrio cerrado', 'A 18 min de Rosario', 'Desde USD 95.000'].map(s => (
            <span key={s} className="px-5 py-2.5 bg-white rounded-full text-sm font-semibold text-gray-700 shadow-sm border border-gray-100">{s}</span>
          ))}
        </div>
      </section>

      <section className="pb-10 px-4">
        <div className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/propiedades?location=funes" className="px-8 py-4 bg-[#1A5C38] hover:bg-[#15472c] text-white font-bold rounded-xl text-center transition-colors">
            Ver propiedades en Don Mateo
          </Link>
          <Link href="/tasaciones" className="px-8 py-4 border-2 border-[#1A5C38] text-[#1A5C38] hover:bg-[#1A5C38] hover:text-white font-bold rounded-xl text-center transition-colors">
            Tasá tu propiedad
          </Link>
        </div>
      </section>

      <section className="bg-[#f8f7f4] border-t-4 border-[#1A5C38] py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <p className="text-[#1A5C38] text-xs font-bold tracking-widest mb-3">DON MATEO · FUNES</p>
              <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Raleway, sans-serif' }}>
                Vivir en Don Mateo
              </h2>
              <p className="text-gray-600 text-base leading-relaxed mb-6" style={{ fontFamily: 'Raleway, sans-serif' }}>
                Don Mateo es un barrio cerrado de Funes que se destacó rápidamente por su excelente relación precio-ubicación. Está sobre uno de los accesos principales a la ciudad, lo que te permite llegar a Rosario centro en menos de 20 minutos. Para familias con chicos que van al colegio en Rosario o Fisherton, la ubicación es inmejorable.
              </p>
              <p className="text-gray-600 text-base leading-relaxed" style={{ fontFamily: 'Raleway, sans-serif' }}>
                El barrio ofrece seguridad 24 horas con control de acceso, pileta para adultos y niños, club house con salón de eventos, cancha de fútbol, paddle y amplios espacios verdes. Las calles internas están asfaltadas y el mantenimiento de las áreas comunes es impecable. Las expensas son razonables comparadas con barrios de categoría similar.
              </p>
            </div>
            <div className="text-gray-600 text-sm leading-relaxed space-y-3" style={{ fontFamily: 'Raleway, sans-serif' }}>
              <p>
                Los lotes en Don Mateo van desde los 500 hasta los 1000 m², con normativas de construcción que aseguran una estética uniforme y cuidada. Hay casas a estrenar y también lotes disponibles para construir a medida. Es un barrio que todavía tiene oferta de terrenos, algo cada vez más raro en Funes.
              </p>
              <p>
                La comunidad de Don Mateo es joven y activa. Muchas familias con hijos eligieron este barrio en los últimos 3 años, lo que generó una dinámica social muy buena — asados entre vecinos, grupos de running, actividades para chicos los fines de semana. Es un barrio que se vive, no solo un lugar para dormir.
              </p>
              <p>
                En cuanto a inversión, Don Mateo tiene un potencial interesante. Al ser un barrio relativamente nuevo, los valores todavía están por debajo de los barrios más establecidos como Funes Hills o Kentucky. Pero el nivel de construcción y los amenities son equivalentes, lo que sugiere un recorrido alcista importante para los próximos años.
              </p>
              <p>
                En SI Inmobiliaria tenemos propiedades en Don Mateo permanentemente. Si te interesa comprar o si ya vivís ahí y querés vender, nuestro equipo conoce el barrio en detalle. Hacemos tasaciones profesionales y te acompañamos en todo el proceso de compraventa con la seriedad de más de 40 años en el mercado.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
