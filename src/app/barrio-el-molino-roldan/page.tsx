import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Propiedades en El Molino, Roldán — SI Inmobiliaria',
  description: 'Casas y lotes en barrio El Molino, Roldán. Barrio cerrado con seguridad, amenities y financiación. Venta de propiedades. SI Inmobiliaria — desde 1983.',
  openGraph: {
    title: 'Propiedades en El Molino, Roldán — SI Inmobiliaria',
    description: 'Barrio cerrado en Roldán con lotes amplios, pileta y seguridad 24hs.',
  },
}

export default function BarrioElMolinoPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-[#1A5C38] py-20 px-4 text-center">
        <p className="text-white/60 text-xs uppercase tracking-widest font-semibold mb-3">BARRIO CERRADO · ROLDÁN</p>
        <h1 className="text-4xl md:text-5xl font-black text-white max-w-3xl mx-auto leading-tight">
          Propiedades en El Molino, Roldán
        </h1>
        <p className="text-white/70 text-lg mt-4 max-w-xl mx-auto">
          Barrio cerrado con lotes amplios, amenities de primer nivel y valores accesibles
        </p>
      </section>

      <section className="py-10 px-4">
        <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-3">
          {['Barrio cerrado', 'A 25 min de Rosario', 'Desde USD 65.000'].map(s => (
            <span key={s} className="px-5 py-2.5 bg-white rounded-full text-sm font-semibold text-gray-700 shadow-sm border border-gray-100">{s}</span>
          ))}
        </div>
      </section>

      <section className="pb-10 px-4">
        <div className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/propiedades?location=roldan" className="px-8 py-4 bg-[#1A5C38] hover:bg-[#15472c] text-white font-bold rounded-xl text-center transition-colors">
            Ver propiedades en El Molino
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
              <p className="text-[#1A5C38] text-xs font-bold tracking-widest mb-3">EL MOLINO · ROLDÁN</p>
              <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Raleway, sans-serif' }}>
                Vivir en El Molino
              </h2>
              <p className="text-gray-600 text-base leading-relaxed mb-6" style={{ fontFamily: 'Raleway, sans-serif' }}>
                El Molino es uno de los barrios cerrados que puso a Roldán en el mapa de las familias que buscan calidad de vida cerca de Rosario. Con lotes desde 600 m², seguridad permanente y amenities de primer nivel, ofrece una propuesta muy completa a valores sensiblemente menores que los barrios equivalentes de Funes.
              </p>
              <p className="text-gray-600 text-base leading-relaxed" style={{ fontFamily: 'Raleway, sans-serif' }}>
                El barrio tiene pileta climatizada, club house, canchas de paddle y tenis, quincho comunitario, área de juegos para chicos y amplias plazas internas. La seguridad es 24 horas con cámaras y control de acceso vehicular. Las calles son asfaltadas, con iluminación LED y forestación abundante que le da una identidad muy verde.
              </p>
            </div>
            <div className="text-gray-600 text-sm leading-relaxed space-y-3" style={{ fontFamily: 'Raleway, sans-serif' }}>
              <p>
                Lo que más atrae de El Molino es la combinación entre precio y calidad. Un lote de 700 m² en este barrio puede costar la mitad que uno similar en Funes Hills, con amenities comparables. Para quien viene de Rosario y quiere una casa grande con jardín, pileta y seguridad, es difícil encontrar algo mejor por ese presupuesto.
              </p>
              <p>
                Roldán está a 25 minutos de Rosario por la Autopista Rosario-Córdoba, y El Molino tiene acceso directo a la ruta. Los colegios de la zona crecieron mucho en calidad y opciones — hay jardines, primarias y secundarias tanto públicas como privadas. También hay supermercados, centros médicos, farmacias y todo lo necesario para la vida cotidiana sin depender de Rosario.
              </p>
              <p>
                En los últimos 5 años, El Molino se consolidó como uno de los barrios con mayor desarrollo de Roldán. Las etapas nuevas se vendieron rápidamente y la ocupación es alta, lo que habla de un barrio vivo y en crecimiento. Las casas terminadas tienen muy buena reventa, y los lotes disponibles son cada vez menos — el que entra ahora, entra bien.
              </p>
              <p>
                En SI Inmobiliaria somos de Roldán. Nuestra primera oficina la abrimos acá en 1983. Conocemos El Molino desde sus inicios y tenemos relación directa con el desarrollador. Si querés comprar un lote, una casa, o si querés vender tu propiedad en El Molino, hablá con nosotros. Te damos una tasación sin cargo y te asesoramos con la experiencia de quien conoce cada rincón de la ciudad.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
