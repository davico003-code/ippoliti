import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Phone, TreePine, School, Shield, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react'
import { getProperties, type TokkoProperty, getMainPhoto, formatPrice, generatePropertySlug } from '@/lib/tokko'
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd'

export const revalidate = 21600

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://siinmobiliaria.com/inmobiliaria-funes#webpage',
  name: 'Inmobiliaria en Funes | SI INMOBILIARIA',
  url: 'https://siinmobiliaria.com/inmobiliaria-funes',
  about: {
    '@type': 'Service',
    name: 'Servicios inmobiliarios en Funes',
    provider: { '@id': 'https://siinmobiliaria.com/#organization' },
    areaServed: { '@type': 'City', name: 'Funes' },
  },
  dateModified: '2026-08-22',
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta una casa en Funes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El valor cambia según barrio, superficie, estado, antigüedad, servicios y comparables vigentes. Para evitar rangos desactualizados, SI INMOBILIARIA muestra el inventario publicado y analiza cada propiedad con referencias locales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué zonas de Funes se pueden comparar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Funes incluye barrios abiertos, el casco urbano y barrios cerrados como Funes Hills, Kentucky, Portal de Funes, María Eugenia y San Sebastián. La comparación correcta depende del tipo de propiedad y del entorno inmediato.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo evalúo una compra en Funes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Conviene comparar ubicación, servicios, accesos, estado, documentación, gastos y propiedades realmente competidoras. La rentabilidad o valorización futura no está garantizada y debe analizarse caso por caso.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué colegios hay en Funes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La ciudad cuenta con instituciones públicas y privadas. Antes de decidir una mudanza conviene verificar vacantes, nivel, distancia y transporte directamente con cada institución.',
      },
    },
  ],
}

export const metadata: Metadata = {
  title: 'Inmobiliaria en Funes | Casas, Terrenos y Departamentos | SI INMOBILIARIA',
  description:
    'Inmobiliaria en Funes con oficina local. Casas, terrenos y departamentos, inventario vigente, tasaciones profesionales y asesoramiento con más de 40 años de trayectoria.',
  keywords: 'inmobiliaria funes, casas en funes, terrenos en funes, propiedades funes, inmobiliaria funes santa fe, casas en venta funes, alquiler funes',
  openGraph: {
    title: 'Inmobiliaria en Funes | SI INMOBILIARIA',
    description: 'Oficina local, inventario vigente y asesoramiento para comprar, vender o tasar propiedades en Funes.',
    url: 'https://siinmobiliaria.com/inmobiliaria-funes',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://siinmobiliaria.com/inmobiliaria-funes',
  },
}

const BARRIOS_FUNES = [
  { name: 'Funes Hills', desc: 'Sectores residenciales con distintas etapas, tipologías y niveles de consolidación.' },
  { name: 'Kentucky', desc: 'Barrio cerrado consolidado; cada propiedad debe compararse por sector, lote y estado.' },
  { name: 'Portal de Funes', desc: 'Barrio cerrado con oferta de lotes y casas; verificar servicios, expensas y ubicación.' },
  { name: 'María Eugenia', desc: 'Desarrollo residencial con lotes y viviendas de distintas características.' },
  { name: 'San Sebastián', desc: 'Zona consolidada con propiedades que varían por antigüedad, estado y entorno.' },
  { name: 'Casco Urbano', desc: 'Sectores abiertos cercanos a comercios y servicios, con oferta heterogénea.' },
]

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
    const data = await getProperties()
    properties = filterByLocation(data.objects ?? [], 'funes')
  } catch (err) {
    console.error('[inmobiliaria-funes] Error:', err instanceof Error ? err.message : err)
  }

  return (
    <div className="min-h-screen bg-white">
      <BreadcrumbJsonLd items={[
        { name: 'Inicio', url: 'https://siinmobiliaria.com' },
        { name: 'Inmobiliaria en Funes', url: 'https://siinmobiliaria.com/inmobiliaria-funes' },
      ]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#1A5C38] to-[#0F3A23] text-white py-24 px-4 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <p className="text-green-200 text-sm font-semibold tracking-widest uppercase mb-4" style={{ fontFamily: 'var(--font-poppins)' }}>Tu inmobiliaria en Funes desde 1983</p>
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight" style={{ fontFamily: 'var(--font-raleway)' }}>
            Inmobiliaria en Funes
          </h1>
          <p className="text-green-100 text-xl max-w-3xl mx-auto leading-relaxed mb-8" style={{ fontFamily: 'var(--font-poppins)' }}>
            Casas, terrenos y departamentos con inventario vigente y asesoramiento de un equipo
            que trabaja en la zona.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/propiedades?location=funes" className="px-8 py-4 bg-white text-[#1A5C38] font-bold rounded-xl hover:bg-green-50 transition-colors">
              Ver propiedades en Funes
            </Link>
            <Link href="/tasaciones" className="px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-colors">
              Solicitar tasación
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-gray-50 py-8 border-b">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { num: properties.length.toString(), label: 'Propiedades publicadas' },
              { num: '40+', label: 'Años de experiencia' },
              { num: '1', label: 'Oficina en Funes' },
              { num: '3', label: 'Oficinas en la región' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-3xl font-black text-[#1A5C38] font-numeric">{s.num}</div>
                <div className="text-sm text-gray-600">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main SEO Content */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <article className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-black text-gray-900 mb-6" style={{ fontFamily: 'var(--font-raleway)' }}>¿Por qué elegir Funes para vivir?</h2>

            <p className="text-gray-700 leading-relaxed">
              <strong>Funes</strong> reúne barrios abiertos, desarrollos y barrios cerrados dentro del corredor oeste del Gran Rosario. Las diferencias entre sectores hacen que una comparación útil deba considerar servicios, accesos, entorno y tipología, además de los metros cuadrados.
            </p>

            <p className="text-gray-700 leading-relaxed">
              <strong>SI INMOBILIARIA</strong> tiene una oficina en Hipólito Yrigoyen 2643 y un equipo dedicado a la zona. Combinamos visitas, inventario publicado y comparables locales para explicar por qué dos propiedades aparentemente similares pueden tener valores distintos.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mt-10 mb-4" style={{ fontFamily: 'var(--font-raleway)' }}>Ventajas de vivir en Funes</h3>

            <div className="grid md:grid-cols-2 gap-6 my-8 not-prose">
              {[
                { icon: Shield, title: 'Acompañamiento local', text: 'Una oficina y un equipo que recorren Funes y verifican cada propiedad.' },
                { icon: School, title: 'Servicios', text: 'La oferta educativa, comercial y de movilidad cambia según el sector y debe verificarse.' },
                { icon: TreePine, title: 'Entornos diversos', text: 'Barrios abiertos, zonas arboladas y urbanizaciones con perfiles distintos.' },
                { icon: TrendingUp, title: 'Decisiones con datos', text: 'Inventario y comparables locales, sin prometer rentabilidad futura.' },
              ].map(item => (
                <div key={item.title} className="flex gap-4 p-4 bg-green-50 rounded-xl">
                  <item.icon className="w-8 h-8 text-[#1A5C38] flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-900">{item.title}</h4>
                    <p className="text-gray-600 text-sm">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mt-10 mb-4" style={{ fontFamily: 'var(--font-raleway)' }}>Mercado inmobiliario en Funes: qué esperar</h3>

            <p className="text-gray-700 leading-relaxed">
              El mercado de <strong>propiedades en Funes</strong> presenta características únicas que solo un profesional con experiencia local puede interpretar correctamente. Los valores varían significativamente según el barrio, la orientación del lote, la distancia a la autopista Rosario-Córdoba y el nivel de consolidación del entorno.
            </p>

            <p className="text-gray-700 leading-relaxed">
              Los precios publicados cambian con el inventario y no equivalen al valor de cierre. Por eso evitamos fijar rangos estáticos: podés consultar las propiedades activas de esta página y nuestro <Link href="/mercado-inmobiliario-funes" className="font-semibold text-[#1A5C38] underline">informe de mercado de Funes</Link>, que muestra fecha, fuentes y metodología.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mt-10 mb-4" style={{ fontFamily: 'var(--font-raleway)' }}>Nuestros servicios inmobiliarios en Funes</h3>

            <ul className="space-y-3 my-6 not-prose">
              {[
                'Venta de casas, departamentos y terrenos',
                'Alquiler tradicional y temporario',
                'Tasaciones profesionales con comparables locales',
                'Revisión de documentación y acompañamiento de la operación',
                'Negociación y coordinación hasta la escritura o entrega',
                'Administración de propiedades y alquileres',
              ].map(item => (
                <li key={item} className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-[#1A5C38] flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-sm text-gray-500">Contenido y datos institucionales revisados el 22 de agosto de 2026. El inventario se actualiza desde el sistema de publicaciones.</p>
          </article>
        </div>
      </section>

      {/* Barrios Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#1A5C38] text-sm font-bold tracking-widest uppercase mb-2">Conocé la zona</p>
            <h2 className="text-3xl font-black text-gray-900" style={{ fontFamily: 'var(--font-raleway)' }}>Barrios de Funes</h2>
            <p className="text-gray-600 mt-2">Sectores con características y comparables diferentes</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BARRIOS_FUNES.map(barrio => (
              <div key={barrio.name} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="font-bold text-xl text-gray-900 mb-2" style={{ fontFamily: 'var(--font-raleway)' }}>{barrio.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{barrio.desc}</p>
                <div className="flex items-center justify-end">
                  <Link href={`/propiedades?search=${encodeURIComponent(barrio.name)}`} className="text-[#1A5C38] text-sm font-semibold hover:underline">
                    Ver propiedades →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#1A5C38] text-sm font-bold tracking-widest uppercase mb-2">Propiedades disponibles</p>
            <h2 className="text-3xl font-black text-gray-900" style={{ fontFamily: 'var(--font-raleway)' }}>
              {properties.length} propiedades en Funes
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.slice(0, 8).map(property => {
              const photo = getMainPhoto(property)
              const price = formatPrice(property)
              const slug = generatePropertySlug(property)
              return (
                <Link key={property.id} href={`/propiedades/${slug}`} className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all">
                  <div className="relative h-48 bg-gray-100">
                    {photo && (
                      <Image src={photo} alt={property.publication_title || property.address} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 25vw" />
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xl font-black text-gray-900 font-numeric mb-1">{price}</p>
                    <p className="text-gray-600 text-sm truncate">{property.fake_address || property.address}</p>
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="text-center mt-10">
            <Link href="/propiedades?location=funes" className="inline-flex items-center gap-2 px-8 py-4 bg-[#1A5C38] hover:bg-[#0F3A23] text-white font-bold rounded-xl transition-colors">
              Ver todas las propiedades en Funes <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900" style={{ fontFamily: 'var(--font-raleway)' }}>Preguntas frecuentes</h2>
            <p className="text-gray-600 mt-2">Sobre comprar propiedades en Funes</p>
          </div>

          <div className="space-y-4">
            {faqJsonLd.mainEntity.map((faq, i) => (
              <details key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 group">
                <summary className="font-bold text-gray-900 cursor-pointer list-none flex items-center justify-between" style={{ fontFamily: 'var(--font-raleway)' }}>
                  {faq.name}
                  <span className="text-[#1A5C38] group-open:rotate-180 transition-transform">&#9660;</span>
                </summary>
                <p className="mt-4 text-gray-600">{faq.acceptedAnswer.text}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 px-4 bg-[#1A5C38]">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-black mb-4" style={{ fontFamily: 'var(--font-raleway)' }}>¿Buscás propiedad en Funes?</h2>
          <p className="text-green-100 text-lg mb-8">
            Contanos qué estás buscando y te enviamos opciones personalizadas.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="https://wa.me/5493412101694?text=Hola!%20Estoy%20buscando%20propiedad%20en%20Funes" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-[#25D366] hover:bg-[#1ebe57] text-white font-bold rounded-xl transition-colors flex items-center gap-2">
              Escribinos por WhatsApp
            </a>
            <a href="tel:+5493412101694" className="px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2">
              <Phone className="w-5 h-5" />
              (341) 210-1694
            </a>
          </div>
        </div>
      </section>

      {/* Related Links */}
      <section className="py-12 px-4 bg-white border-t">
        <div className="max-w-4xl mx-auto">
          <h3 className="font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-raleway)' }}>También te puede interesar</h3>
          <div className="flex flex-wrap gap-3">
            <Link href="/propiedades?operation=venta&location=funes" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors">Casas en venta en Funes</Link>
            <Link href="/propiedades?type=terreno&location=funes" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors">Terrenos en Funes</Link>
            <Link href="/propiedades?operation=alquiler&location=funes" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors">Alquiler en Funes</Link>
            <Link href="/inmobiliaria-roldan" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors">Inmobiliaria en Roldán</Link>
            <Link href="/guia" prefetch={false} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors">Guía del comprador</Link>
            <Link href="/tasaciones" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors">Tasaciones profesionales</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
