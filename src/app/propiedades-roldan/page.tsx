import type { Metadata } from 'next'
import Link from 'next/link'
import { getProperties, type TokkoProperty } from '@/lib/tokko'
import PropertyGrid from '@/components/PropertyGrid'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Propiedades en Venta en Roldán | Casas, Terrenos y Departamentos',
  description:
    'Propiedades en venta en Roldán, Santa Fe. Casas, terrenos, departamentos y locales comerciales. SI Inmobiliaria - más de 40 años en el mercado inmobiliario de Roldán.',
  openGraph: {
    title: 'Propiedades en Venta en Roldán | SI Inmobiliaria',
    description: 'Casas, terrenos y departamentos en venta en Roldán.',
  },
}

function filterSaleRoldan(properties: TokkoProperty[]): TokkoProperty[] {
  return properties.filter(p => {
    const loc = (p.location?.short_location ?? p.location?.name ?? '').toLowerCase()
    const addr = (p.fake_address ?? p.address ?? '').toLowerCase()
    const inRoldan = `${loc} ${addr}`.includes('roldan') || `${loc} ${addr}`.includes('roldán')
    const isSale = p.operations?.[0]?.operation_type === 'Sale'
    return inRoldan && isSale
  })
}

export default async function PropiedadesRoldanPage() {
  let properties: TokkoProperty[] = []
  try {
    const data = await getProperties({ limit: 100 })
    properties = filterSaleRoldan(data.objects ?? [])
  } catch {}

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-brand-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-brand-200 text-sm font-bold tracking-widest uppercase mb-4">Venta de propiedades</p>
          <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
            Propiedades en Venta en Roldán
          </h1>
          <p className="text-brand-100 text-lg max-w-2xl mx-auto">
            Explorá nuestra selección de casas, terrenos y departamentos en venta en Roldán, Santa Fe. Asesoramiento personalizado con más de 40 años de experiencia.
          </p>
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto prose prose-lg max-w-none text-gray-700 leading-relaxed">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Comprar tu propiedad en Roldán</h2>
          <p>
            Roldán es hoy una de las ciudades con mayor proyección inmobiliaria de la provincia de Santa Fe. Su ubicación privilegiada sobre la Autopista Rosario-Córdoba, a solo 25 km del centro de Rosario, la convierte en el destino ideal para familias que buscan calidad de vida sin resignar conectividad. El crecimiento sostenido de la ciudad ha traído nuevos barrios residenciales, desarrollos urbanísticos y una infraestructura de servicios cada vez más completa.
          </p>
          <p>
            En <strong>SI Inmobiliaria</strong> contamos con la cartera de propiedades en venta más amplia de Roldán. Ofrecemos casas en barrios como <strong>Tierra de Sueños, Fincas de Roldán, Los Raigales, Barrio Sur</strong> y el casco céntrico, así como terrenos en loteos nuevos con todos los servicios y departamentos en desarrollos modernos. Cada propiedad es verificada por nuestro equipo y cuenta con documentación al día.
          </p>
          <p>
            Nuestro proceso de compra incluye: búsqueda personalizada según tu presupuesto y necesidades, coordinación de visitas, asesoramiento en la negociación, verificación legal con estudio jurídico propio y acompañamiento hasta la firma de la escritura. Comprá con la tranquilidad de tener más de 40 años de experiencia de tu lado.
          </p>
          <p>
            Los precios de propiedades en Roldán son significativamente más accesibles que en Rosario o Funes, con valores que van desde terrenos de 300m² hasta casas premium en countries. Si estás evaluando una inversión inmobiliaria o tu próximo hogar, Roldán es una apuesta segura con una valorización constante año tras año.
          </p>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900">
              {properties.length} propiedad{properties.length !== 1 ? 'es' : ''} en venta en Roldán
            </h2>
          </div>
          <PropertyGrid properties={properties.slice(0, 18)} />
          {properties.length > 18 && (
            <div className="text-center mt-10">
              <Link href="/propiedades" className="inline-flex items-center gap-2 px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg transition-colors">
                Ver todas las propiedades →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-white text-center">
        <h2 className="text-2xl font-black text-gray-900 mb-3">¿Querés vender tu propiedad en Roldán?</h2>
        <p className="text-gray-500 mb-8 max-w-lg mx-auto">Tasamos tu propiedad y la publicamos en los principales portales inmobiliarios.</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/tasaciones" className="px-8 py-4 bg-accent-400 hover:bg-accent-500 text-white font-bold rounded-lg transition-colors">
            Solicitá tu tasación en 24hs
          </Link>
          <Link href="/inmobiliaria-roldan" className="px-8 py-4 border-2 border-brand-600 text-brand-600 hover:bg-brand-600 hover:text-white font-bold rounded-lg transition-colors">
            Conocer nuestras oficinas
          </Link>
        </div>
      </section>
    </div>
  )
}
