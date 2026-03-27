import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Propiedades en Los Aromos, Roldán — SI Inmobiliaria',
  description: 'Casas, lotes y terrenos en barrio Los Aromos, Roldán. Barrio abierto residencial con excelente conectividad a Rosario. SI Inmobiliaria — desde 1983.',
  openGraph: {
    title: 'Propiedades en Los Aromos, Roldán — SI Inmobiliaria',
    description: 'Barrio residencial en Roldán con lotes amplios y calles arboladas.',
  },
}

export default function BarrioLosAromosPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-[#1A5C38] py-20 px-4 text-center">
        <p className="text-white/60 text-xs uppercase tracking-widest font-semibold mb-3">BARRIO ABIERTO · ROLDÁN</p>
        <h1 className="text-4xl md:text-5xl font-black text-white max-w-3xl mx-auto leading-tight">
          Propiedades en Los Aromos, Roldán
        </h1>
        <p className="text-white/70 text-lg mt-4 max-w-xl mx-auto">
          Barrio residencial con excelente relación precio-calidad a minutos de Rosario
        </p>
      </section>

      <section className="py-10 px-4">
        <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-3">
          {['Barrio abierto', 'A 25 min de Rosario', 'Desde USD 45.000'].map(s => (
            <span key={s} className="px-5 py-2.5 bg-white rounded-full text-sm font-semibold text-gray-700 shadow-sm border border-gray-100">{s}</span>
          ))}
        </div>
      </section>

      <section className="pb-10 px-4">
        <div className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/propiedades?location=roldan" className="px-8 py-4 bg-[#1A5C38] hover:bg-[#15472c] text-white font-bold rounded-xl text-center transition-colors">
            Ver propiedades en Los Aromos
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
              <p className="text-[#1A5C38] text-xs font-bold tracking-widest mb-3">LOS AROMOS · ROLDÁN</p>
              <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Raleway, sans-serif' }}>
                Vivir en Los Aromos
              </h2>
              <p className="text-gray-600 text-base leading-relaxed mb-6" style={{ fontFamily: 'Raleway, sans-serif' }}>
                Los Aromos es uno de los barrios residenciales más elegidos de Roldán. Es barrio abierto, lo que significa que no tiene expensas fijas de seguridad, pero mantiene una atmósfera tranquila y familiar que lo hace ideal para quienes buscan espacio a buen precio. Está ubicado a solo 25 minutos de Rosario por autopista.
              </p>
              <p className="text-gray-600 text-base leading-relaxed" style={{ fontFamily: 'Raleway, sans-serif' }}>
                El barrio se caracteriza por lotes amplios de 400 a 800 m², calles arboladas y un entorno muy verde. Muchas familias que se mudan desde Rosario eligen Los Aromos por la posibilidad de construir una casa grande con jardín y pileta a un valor significativamente menor que en Funes o Fisherton.
              </p>
            </div>
            <div className="text-gray-600 text-sm leading-relaxed space-y-3" style={{ fontFamily: 'Raleway, sans-serif' }}>
              <p>
                Roldán creció enormemente en la última década. Nuevos supermercados, colegios, centros médicos y comercios se fueron sumando, y Los Aromos se benefició directamente de esa expansión. Hoy es un barrio consolidado con todos los servicios: agua corriente, gas natural, cloacas, electricidad, internet por fibra óptica y alumbrado público.
              </p>
              <p>
                En materia de inversión, Los Aromos es una de las zonas con mayor potencial de revalorización de Roldán. Los valores del m² todavía están por debajo de barrios cerrados equivalentes en Funes, lo que genera una ventana interesante para comprar ahora y capitalizar la plusvalía en los próximos años.
              </p>
              <p>
                Las propiedades disponibles van desde terrenos sin construir hasta casas de 2, 3 y 4 dormitorios. También hay algunas opciones de casas a estrenar de desarrolladores locales con financiación en pesos. Es un barrio flexible que se adapta a distintos presupuestos y necesidades.
              </p>
              <p>
                Desde SI Inmobiliaria operamos en Roldán desde 1983. Nuestra oficina histórica en 1ro de Mayo 258 está a pocas cuadras de Los Aromos. Si querés comprar, vender o tasar en este barrio, hablá con nosotros — conocemos cada calle, cada lote y cada vecino.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
