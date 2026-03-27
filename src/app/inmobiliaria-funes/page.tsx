import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Phone, Building2, Users, TreePine } from 'lucide-react'
import { getProperties, type TokkoProperty } from '@/lib/tokko'
import PropertyGrid from '@/components/PropertyGrid'

export const revalidate = 21600

export const metadata: Metadata = {
  title: 'Inmobiliaria en Funes | SI Inmobiliaria',
  description:
    'SI Inmobiliaria en Funes, Santa Fe. Venta y alquiler de casas, departamentos y terrenos en Funes. Tasaciones profesionales. Más de 40 años de experiencia.',
  openGraph: {
    title: 'Inmobiliaria en Funes | SI Inmobiliaria',
    description: 'Venta y alquiler de propiedades en Funes. Más de 40 años de experiencia.',
  },
}

function filterByLocation(properties: TokkoProperty[], city: string): TokkoProperty[] {
  const lower = city.toLowerCase()
  return properties.filter(p => {
    const loc = (p.location?.short_location ?? p.location?.name ?? '').toLowerCase()
    const addr = (p.fake_address ?? p.address ?? '').toLowerCase()
    return `${loc} ${addr}`.includes(lower)
  })
}

export default async function InmobiliariaFunesPage() {
  let properties: TokkoProperty[] = []
  try {
    const data = await getProperties({ limit: 100 })
    properties = filterByLocation(data.objects ?? [], 'funes')
  } catch {}

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-brand-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-brand-200 text-sm font-bold tracking-widest uppercase mb-4">Propiedades en Funes</p>
          <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
            Inmobiliaria en Funes
          </h1>
          <p className="text-brand-100 text-lg max-w-2xl mx-auto leading-relaxed">
            Encontrá tu casa ideal en Funes con SI Inmobiliaria. Más de 40 años de experiencia inmobiliaria en la zona oeste del Gran Rosario.
          </p>
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Vivir en Funes: calidad de vida a minutos de Rosario</h2>
            <p>
              Funes se ha convertido en uno de los destinos residenciales más buscados del Gran Rosario. Ubicada a solo 15 kilómetros del centro de Rosario, esta ciudad combina entorno natural, seguridad, excelente oferta educativa y una comunidad en constante crecimiento. Barrios como Funes Hills, Kentucky, Portal de Funes, María Eugenia Residences y el casco urbano ofrecen opciones para todos los perfiles: desde casas en barrios abiertos hasta residencias en countries con amenities completos.
            </p>
            <p>
              <strong>SI Inmobiliaria</strong> opera en Funes desde nuestra oficina dedicada, con un equipo que conoce en detalle cada barrio, desarrollo y oportunidad de la zona. Nuestra trayectoria desde 1983 y nuestra presencia en Roldán y Funes nos posicionan como la inmobiliaria de referencia para quienes buscan comprar, vender o alquilar en la zona oeste.
            </p>
            <p>
              En Funes trabajamos con una amplia cartera de propiedades: casas familiares en barrios abiertos y cerrados, terrenos en loteos nuevos y consolidados, departamentos en desarrollos modernos y locales comerciales sobre las arterias principales. Cada propiedad cuenta con nuestro asesoramiento integral: desde la primera visita hasta la firma de la escritura, con estudio jurídico propio.
            </p>
            <p>
              El mercado inmobiliario de Funes presenta particularidades que solo un profesional con experiencia local puede interpretar correctamente. La relación entre metros cuadrados cubiertos y lote, la orientación, la distancia a la autopista y la etapa del barrio son factores determinantes del valor. En SI Inmobiliaria evaluamos cada uno de estos aspectos para que tomes la mejor decisión, ya sea como comprador o como vendedor.
            </p>
          </div>

          {/* Why Funes */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {[
              { icon: TreePine, title: 'Entorno Natural', text: 'Calles arboladas, barrios parquizados y contacto directo con la naturaleza a minutos de Rosario.' },
              { icon: Users, title: 'Comunidad Activa', text: 'Colegios, clubes, centros de salud y comercios. Todo lo que una familia necesita.' },
              { icon: Building2, title: 'Valorización', text: 'Funes mantiene una tendencia sostenida de valorización inmobiliaria en los últimos 15 años.' },
            ].map(s => (
              <div key={s.title} className="bg-white border-l-4 border-brand-600 p-6 rounded-r-xl shadow-sm">
                <s.icon className="w-6 h-6 text-brand-600 mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-600 text-sm">{s.text}</p>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="mt-12 bg-brand-50 rounded-xl p-8 border border-brand-100">
            <h3 className="font-black text-gray-900 text-xl mb-4">Oficina Funes</h3>
            <div className="flex flex-wrap gap-6 text-sm text-gray-700">
              <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-brand-600" /> <span className="font-numeric">(341) 210-1694</span></span>
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-brand-600" /> Funes, Santa Fe</span>
            </div>
          </div>
        </div>
      </section>

      {/* Properties */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-brand-600 text-sm font-bold tracking-widest uppercase mb-2">Propiedades en Funes</p>
            <h2 className="text-3xl font-black text-gray-900">
              {properties.length} propiedad{properties.length !== 1 ? 'es' : ''} disponible{properties.length !== 1 ? 's' : ''}
            </h2>
          </div>
          <PropertyGrid properties={properties.slice(0, 12)} />
          {properties.length > 12 && (
            <div className="text-center mt-10">
              <Link href="/propiedades" className="inline-flex items-center gap-2 px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg transition-colors">
                Ver todas las propiedades →
              </Link>
              <Link href="/tasaciones" className="inline-flex items-center gap-2 px-8 py-4 border-2 border-brand-600 text-brand-600 hover:bg-brand-50 font-bold rounded-lg transition-colors ml-3">
                Tasá tu propiedad
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
