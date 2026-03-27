import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Phone, Clock, Building2, Users, Scale } from 'lucide-react'
import { getProperties, type TokkoProperty } from '@/lib/tokko'
import PropertyGrid from '@/components/PropertyGrid'

export const revalidate = 21600

export const metadata: Metadata = {
  title: 'Inmobiliaria en Roldán | SI Inmobiliaria desde 1983',
  description:
    'SI Inmobiliaria es la inmobiliaria de referencia en Roldán, Santa Fe. Más de 40 años de trayectoria en venta, alquiler y tasación de casas, departamentos y terrenos en Roldán y alrededores.',
  openGraph: {
    title: 'Inmobiliaria en Roldán | SI Inmobiliaria desde 1983',
    description:
      'Más de 40 años de trayectoria en venta, alquiler y tasación de propiedades en Roldán.',
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

export default async function InmobiliariaRoldanPage() {
  let properties: TokkoProperty[] = []
  try {
    const data = await getProperties({ limit: 100 })
    properties = filterByLocation(data.objects ?? [], 'roldan')
  } catch {}

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-brand-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-brand-200 text-sm font-bold tracking-widest uppercase mb-4">Desde 1983 en Roldán</p>
          <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
            Inmobiliaria en Roldán
          </h1>
          <p className="text-brand-100 text-lg max-w-2xl mx-auto leading-relaxed">
            SI Inmobiliaria es la inmobiliaria líder en Roldán, Santa Fe. Con más de 40 años de experiencia acompañamos a familias y empresas en cada operación inmobiliaria.
          </p>
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Tu inmobiliaria de confianza en Roldán</h2>
            <p>
              Roldán es una de las ciudades con mayor crecimiento del Gran Rosario. Ubicada estratégicamente sobre la Autopista Rosario-Córdoba, a solo 25 kilómetros de Rosario, la ciudad ofrece una calidad de vida excepcional combinando la tranquilidad de una ciudad pequeña con acceso rápido a todos los servicios de una gran urbe. En los últimos años, Roldán se ha consolidado como el destino preferido para familias jóvenes que buscan casas con espacios verdes, barrios cerrados y una comunidad activa.
            </p>
            <p>
              <strong>SI Inmobiliaria</strong>, fundada por Susana Ippoliti en 1983, es la inmobiliaria con mayor trayectoria en Roldán. Desde nuestras dos oficinas en la ciudad — en <strong>1ro de Mayo 258</strong> (administración) y <strong>Catamarca 775</strong> (ventas) — brindamos un servicio integral que incluye venta de casas y terrenos, alquiler de propiedades residenciales y comerciales, tasaciones profesionales y asesoramiento jurídico inmobiliario con estudio propio.
            </p>
            <p>
              Conocemos cada barrio de Roldán en profundidad: Tierra de Sueños, Fincas de Roldán, Los Raigales, Barrio Sur, el casco céntrico y los nuevos desarrollos urbanísticos. Esta experiencia nos permite asesorar a cada cliente de manera personalizada, ya sea que busque su primera vivienda, una inversión o vender su propiedad al mejor precio del mercado.
            </p>
            <p>
              Nuestro equipo — conformado por Susana, Laura y David — trabaja con un compromiso real: honestidad, cercanía y profesionalismo en cada operación. No somos una franquicia; somos una familia que lleva más de cuatro décadas construyendo confianza en Roldán.
            </p>
          </div>

          {/* Office cards */}
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-5 h-5 text-brand-600" />
                <h3 className="font-bold text-gray-900">Oficina Administración</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-brand-500" /> 1ro de Mayo 258, Roldán</p>
                <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-brand-500" /> <span className="font-numeric">(341) 210-1694</span></p>
                <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-brand-500" /> Lunes a Viernes 8 a 17hs</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-5 h-5 text-brand-600" />
                <h3 className="font-bold text-gray-900">Oficina Ventas</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-brand-500" /> Catamarca 775, Roldán</p>
                <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-brand-500" /> <span className="font-numeric">(341) 210-1694</span></p>
                <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-brand-500" /> Lunes a Viernes 9 a 17hs</p>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {[
              { icon: Building2, title: 'Venta y Alquiler', text: 'Casas, departamentos, terrenos y locales comerciales en Roldán y alrededores.' },
              { icon: Scale, title: 'Tasaciones', text: 'Valuaciones profesionales con análisis del mercado actual en 24hs.' },
              { icon: Users, title: 'Asesoramiento', text: 'Estudio jurídico propio para escrituras, contratos y documentación.' },
            ].map(s => (
              <div key={s.title} className="bg-white border-l-4 border-brand-600 p-6 rounded-r-xl shadow-sm">
                <s.icon className="w-6 h-6 text-brand-600 mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-600 text-sm">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Properties */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-brand-600 text-sm font-bold tracking-widest uppercase mb-2">Propiedades en Roldán</p>
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
