import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Phone, TreePine, School, Shield, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react'
import { getProperties, type TokkoProperty, getMainPhoto, formatPrice, generatePropertySlug } from '@/lib/tokko'

export const revalidate = 21600

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: 'SI Inmobiliaria Funes',
  image: 'https://siinmobiliaria.com/logo.png',
  url: 'https://siinmobiliaria.com/inmobiliaria-funes',
  telephone: '+5493412101694',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Hipólito Yrigoyen 2643',
    addressLocality: 'Funes',
    addressRegion: 'Santa Fe',
    postalCode: '2132',
    addressCountry: 'AR',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: -32.9147,
    longitude: -60.8107,
  },
  areaServed: ['Funes', 'Funes Hills', 'Kentucky', 'Portal de Funes', 'María Eugenia', 'San Sebastián'],
  priceRange: 'USD 50.000 - USD 1.000.000',
  openingHours: 'Mo-Fr 09:00-18:00, Sa 09:00-13:00',
  sameAs: ['https://www.instagram.com/inmobiliaria.si'],
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
        text: 'Los precios de casas en Funes varían según el barrio y características. En barrios abiertos desde USD 150.000, en countries desde USD 200.000, y en Funes Hills o Kentucky desde USD 350.000. Los terrenos arrancan en USD 40.000 en loteos nuevos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los mejores barrios de Funes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los barrios más buscados de Funes son: Funes Hills (premium), Kentucky (familias), Portal de Funes (accesible), María Eugenia Residences (nuevo), San Sebastián (consolidado), y el casco urbano para quienes prefieren vida de pueblo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es buena inversión comprar en Funes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Funes ha mostrado valorización sostenida en los últimos 15 años. La demanda constante de familias que buscan calidad de vida, sumada a la cercanía con Rosario (15 min), la convierten en una de las mejores zonas para invertir en el Gran Rosario.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué colegios hay en Funes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Funes cuenta con excelente oferta educativa: Colegio San Bartolomé, Tierra del Sur, Del Sol, Los Arrayanes, entre otros colegios privados. También escuelas públicas de nivel inicial, primario y secundario.',
      },
    },
  ],
}

export const metadata: Metadata = {
  title: 'Inmobiliaria en Funes | Casas, Terrenos y Departamentos | SI Inmobiliaria',
  description:
    'Inmobiliaria en Funes, Santa Fe. Venta y alquiler de casas, terrenos y departamentos en los mejores barrios: Funes Hills, Kentucky, Portal de Funes. +40 años de experiencia. Tasaciones en 24hs.',
  keywords: 'inmobiliaria funes, casas en funes, terrenos en funes, propiedades funes, inmobiliaria funes santa fe, casas en venta funes, alquiler funes',
  openGraph: {
    title: 'Inmobiliaria en Funes | SI Inmobiliaria',
    description: 'Tu inmobiliaria de confianza en Funes. Casas, terrenos y departamentos en los mejores barrios. Más de 40 años de experiencia.',
    url: 'https://siinmobiliaria.com/inmobiliaria-funes',
    images: ['/og-funes.jpg'],
  },
  alternates: {
    canonical: 'https://siinmobiliaria.com/inmobiliaria-funes',
  },
}

const BARRIOS_FUNES = [
  { name: 'Funes Hills', desc: 'El country más exclusivo de la zona. Golf, seguridad 24hs, máxima categoría.', price: 'Desde USD 400K' },
  { name: 'Kentucky', desc: 'Barrio cerrado familiar consolidado. Excelente comunidad y amenities.', price: 'Desde USD 250K' },
  { name: 'Portal de Funes', desc: 'Opción accesible con seguridad. Ideal para familias jóvenes.', price: 'Desde USD 180K' },
  { name: 'María Eugenia', desc: 'Desarrollo nuevo con diseño moderno y lotes amplios.', price: 'Desde USD 200K' },
  { name: 'San Sebastián', desc: 'Barrio consolidado con servicios completos y buena conectividad.', price: 'Desde USD 150K' },
  { name: 'Casco Urbano', desc: 'Vida de pueblo, comercios a pie, sin expensas.', price: 'Desde USD 120K' },
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
            Casas, terrenos y departamentos en los mejores barrios de Funes.
            Más de 40 años ayudando a familias a encontrar su hogar ideal.
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
              { num: properties.length + '+', label: 'Propiedades en Funes' },
              { num: '40+', label: 'Años de experiencia' },
              { num: '1.500+', label: 'Familias asesoradas' },
              { num: '24hs', label: 'Tasación express' },
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
              <strong>Funes</strong> se ha consolidado como el destino residencial preferido del Gran Rosario. Ubicada a solo 15 kilómetros del centro de Rosario por autopista, esta ciudad de 30.000 habitantes combina lo mejor de dos mundos: la tranquilidad del interior con todos los servicios de una urbe moderna.
            </p>

            <p className="text-gray-700 leading-relaxed">
              Como <strong>inmobiliaria en Funes</strong> con más de cuatro décadas de trayectoria, en <strong>SI Inmobiliaria</strong> conocemos cada calle, cada barrio y cada oportunidad que ofrece esta ciudad. Nuestra oficina en Funes cuenta con un equipo especializado que vive y trabaja en la zona, lo que nos permite ofrecer un asesoramiento genuino basado en experiencia real.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mt-10 mb-4" style={{ fontFamily: 'var(--font-raleway)' }}>Ventajas de vivir en Funes</h3>

            <div className="grid md:grid-cols-2 gap-6 my-8 not-prose">
              {[
                { icon: Shield, title: 'Seguridad', text: 'Barrios cerrados con vigilancia 24hs y bajo índice de inseguridad en zonas abiertas.' },
                { icon: School, title: 'Educación de calidad', text: 'Más de 15 instituciones educativas privadas y públicas de excelente nivel.' },
                { icon: TreePine, title: 'Naturaleza', text: 'Calles arboladas, espacios verdes y aire puro a minutos de Rosario.' },
                { icon: TrendingUp, title: 'Valorización', text: 'Inversión segura con crecimiento sostenido del valor inmobiliario.' },
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
              Actualmente, los <strong>terrenos en Funes</strong> arrancan desde USD 40.000 en loteos nuevos hasta USD 150.000 en barrios premium como Funes Hills. Las <strong>casas en Funes</strong> oscilan entre USD 150.000 (barrios abiertos) y más de USD 500.000 (countries de alta gama). La demanda se mantiene constante, especialmente de familias jóvenes provenientes de Rosario.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mt-10 mb-4" style={{ fontFamily: 'var(--font-raleway)' }}>Nuestros servicios inmobiliarios en Funes</h3>

            <ul className="space-y-3 my-6 not-prose">
              {[
                'Venta de casas, departamentos y terrenos',
                'Alquiler tradicional y temporario',
                'Tasaciones profesionales en 24 horas',
                'Asesoramiento legal con estudio jurídico propio',
                'Gestión de créditos hipotecarios',
                'Administración de propiedades y alquileres',
              ].map(item => (
                <li key={item} className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-[#1A5C38] flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      {/* Barrios Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#1A5C38] text-sm font-bold tracking-widest uppercase mb-2">Conocé la zona</p>
            <h2 className="text-3xl font-black text-gray-900" style={{ fontFamily: 'var(--font-raleway)' }}>Barrios de Funes</h2>
            <p className="text-gray-600 mt-2">Los mejores lugares para vivir en Funes</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BARRIOS_FUNES.map(barrio => (
              <div key={barrio.name} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="font-bold text-xl text-gray-900 mb-2" style={{ fontFamily: 'var(--font-raleway)' }}>{barrio.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{barrio.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[#1A5C38] font-bold font-numeric">{barrio.price}</span>
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
            <Link href="/guia-comprador" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors">Guía del comprador</Link>
            <Link href="/tasaciones" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors">Tasaciones profesionales</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
