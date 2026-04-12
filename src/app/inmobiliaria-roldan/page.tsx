import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Phone, CheckCircle, ArrowRight } from 'lucide-react'
import { getProperties, type TokkoProperty, getMainPhoto, formatPrice, generatePropertySlug } from '@/lib/tokko'

export const revalidate = 21600

const jsonLd = {
  '@context': 'https://schema.org', '@type': 'RealEstateAgent',
  name: 'SI Inmobiliaria Roldán', image: 'https://siinmobiliaria.com/logo.png',
  url: 'https://siinmobiliaria.com/inmobiliaria-roldan', telephone: '+5493412101694',
  address: { '@type': 'PostalAddress', streetAddress: '1ro de Mayo 258', addressLocality: 'Roldán', addressRegion: 'Santa Fe', addressCountry: 'AR' },
  geo: { '@type': 'GeoCoordinates', latitude: -32.8967, longitude: -60.9083 },
  areaServed: ['Roldán', 'Los Aromos', 'El Molino', 'Tierra de Sueños', 'Don Mateo', 'Distrito Roldán'],
  priceRange: 'USD 30.000 - USD 500.000', openingHours: 'Mo-Fr 09:00-18:00, Sa 09:00-13:00',
}

const faqJsonLd = {
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Cuánto cuesta un terreno en Roldán?', acceptedAnswer: { '@type': 'Answer', text: 'Los terrenos en Roldán arrancan desde USD 25.000 en loteos nuevos. En barrios consolidados como Los Aromos o El Molino, desde USD 45.000. Los precios son 30-40% menores que en Funes, con excelente valorización.' } },
    { '@type': 'Question', name: '¿Cuáles son los mejores barrios de Roldán?', acceptedAnswer: { '@type': 'Answer', text: 'Los barrios más buscados son: Los Aromos (premium), El Molino (consolidado), Tierra de Sueños (accesible), Don Mateo (nuevo), Distrito Roldán (moderno) y el Casco Urbano con su vida de pueblo.' } },
    { '@type': 'Question', name: '¿Por qué invertir en Roldán?', acceptedAnswer: { '@type': 'Answer', text: 'Roldán es la ciudad que más crece del Gran Rosario. Con precios 30-40% menores que Funes, valorización del 15-20% anual y dos oficinas de SI Inmobiliaria, es la mejor oportunidad de inversión inmobiliaria de la zona.' } },
    { '@type': 'Question', name: '¿A qué distancia está Roldán de Rosario?', acceptedAnswer: { '@type': 'Answer', text: 'Roldán está a 25 km del centro de Rosario, unos 20 minutos por autopista Rosario-Córdoba. Tiene acceso directo y transporte público frecuente.' } },
  ],
}

export const metadata: Metadata = {
  title: 'Inmobiliaria en Roldán | Casas, Terrenos y Lotes | SI Inmobiliaria',
  description: 'Inmobiliaria en Roldán con 2 oficinas. Casas, terrenos y lotes en Los Aromos, El Molino, Tierra de Sueños, Don Mateo. +40 años. Tasaciones en 24hs.',
  keywords: 'inmobiliaria roldan, casas en roldan, terrenos en roldan, propiedades roldan, lotes roldan',
  openGraph: { title: 'Inmobiliaria en Roldán | SI Inmobiliaria', description: 'Tu inmobiliaria de confianza en Roldán. 2 oficinas, +40 años.', url: 'https://siinmobiliaria.com/inmobiliaria-roldan', images: ['/og-image.jpg'] },
  alternates: { canonical: 'https://siinmobiliaria.com/inmobiliaria-roldan' },
}

const BARRIOS = [
  { name: 'Los Aromos', desc: 'Barrio premium con lotes amplios y excelente infraestructura.', price: 'Desde USD 180K' },
  { name: 'El Molino', desc: 'Consolidado, con servicios completos y ubicación estratégica.', price: 'Desde USD 150K' },
  { name: 'Tierra de Sueños', desc: 'Desarrollo accesible con financiación. Ideal para primera vivienda.', price: 'Desde USD 80K' },
  { name: 'Don Mateo', desc: 'Emprendimiento nuevo con diseño moderno y espacios verdes.', price: 'Desde USD 120K' },
  { name: 'Distrito Roldán', desc: 'Desarrollo urbano moderno con amenities y seguridad.', price: 'Desde USD 100K' },
  { name: 'Casco Urbano', desc: 'Vida de pueblo auténtica, comercios a pie, sin expensas.', price: 'Desde USD 90K' },
]

function filter(properties: TokkoProperty[]): TokkoProperty[] {
  return properties.filter(p => {
    const t = `${p.location?.short_location ?? ''} ${p.location?.name ?? ''} ${p.fake_address ?? ''} ${p.address ?? ''}`.toLowerCase()
    return t.includes('roldan') || t.includes('roldán')
  })
}

export default async function Page() {
  let properties: TokkoProperty[] = []
  try { const d = await getProperties(); properties = filter(d.objects ?? []) } catch (e) { console.error('[inmobiliaria-roldan]', e instanceof Error ? e.message : e) }

  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <section className="relative bg-gradient-to-br from-[#1A5C38] to-[#0F3A23] text-white py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-green-200 text-sm font-semibold tracking-widest uppercase mb-4" style={{ fontFamily: 'var(--font-poppins)' }}>2 oficinas en Roldán · Desde 1983</p>
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight" style={{ fontFamily: 'var(--font-raleway)' }}>Inmobiliaria en Roldán</h1>
          <p className="text-green-100 text-xl max-w-3xl mx-auto leading-relaxed mb-8" style={{ fontFamily: 'var(--font-poppins)' }}>
            La ciudad que más crece del Gran Rosario. Casas, terrenos y lotes con precios 30-40% menores que Funes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/propiedades?location=roldan" className="px-8 py-4 bg-white text-[#1A5C38] font-bold rounded-xl hover:bg-green-50 transition-colors">Ver propiedades en Roldán</Link>
            <Link href="/tasaciones" className="px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-colors">Solicitar tasación</Link>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-8 border-b">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[{ num: properties.length + '+', label: 'Propiedades en Roldán' }, { num: '2', label: 'Oficinas en Roldán' }, { num: '40+', label: 'Años de experiencia' }, { num: '24hs', label: 'Tasación express' }].map(s => (
            <div key={s.label}><div className="text-3xl font-black text-[#1A5C38] font-numeric">{s.num}</div><div className="text-sm text-gray-600">{s.label}</div></div>
          ))}
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto prose prose-lg max-w-none">
          <h2 className="text-3xl font-black text-gray-900 mb-6" style={{ fontFamily: 'var(--font-raleway)' }}>¿Por qué elegir Roldán?</h2>
          <p className="text-gray-700">Roldán es la ciudad con mayor crecimiento demográfico del Gran Rosario. Ubicada a 25 km del centro de Rosario por autopista, ofrece terrenos amplios, barrios planificados y una calidad de vida excepcional a precios significativamente menores que Funes.</p>
          <p className="text-gray-700">Con <strong>2 oficinas en Roldán</strong> (1ro de Mayo 258 y Catamarca 775), <strong>SI Inmobiliaria</strong> es la referencia del mercado local. Nuestro equipo conoce cada desarrollo, cada oportunidad y cada barrio porque vivimos y trabajamos aquí desde 1983.</p>
          <p className="text-gray-700">Los <strong>terrenos en Roldán</strong> arrancan desde USD 25.000, las casas desde USD 80.000 en barrios abiertos y desde USD 150.000 en countries. La valorización promedio es del 15-20% anual, convirtiéndola en una de las mejores plazas para invertir.</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-10 mb-4" style={{ fontFamily: 'var(--font-raleway)' }}>Nuestros servicios en Roldán</h3>
          <ul className="space-y-3 not-prose">
            {['Venta de casas, departamentos, terrenos y lotes', 'Alquiler tradicional y temporario', 'Tasaciones profesionales en 24 horas', 'Asesoramiento legal con estudio jurídico propio', 'Gestión de créditos hipotecarios', 'Administración de propiedades'].map(s => (
              <li key={s} className="flex items-center gap-3 text-gray-700"><CheckCircle className="w-5 h-5 text-[#1A5C38] flex-shrink-0" />{s}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900" style={{ fontFamily: 'var(--font-raleway)' }}>Barrios de Roldán</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BARRIOS.map(b => (
              <div key={b.name} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="font-bold text-xl text-gray-900 mb-2" style={{ fontFamily: 'var(--font-raleway)' }}>{b.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{b.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[#1A5C38] font-bold font-numeric">{b.price}</span>
                  <Link href={`/propiedades?search=${encodeURIComponent(b.name)}`} className="text-[#1A5C38] text-sm font-semibold hover:underline">Ver propiedades →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-black text-gray-900 text-center mb-12" style={{ fontFamily: 'var(--font-raleway)' }}>{properties.length} propiedades en Roldán</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.slice(0, 8).map(p => { const photo = getMainPhoto(p); return (
              <Link key={p.id} href={`/propiedades/${generatePropertySlug(p)}`} className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all">
                <div className="relative h-48 bg-gray-100">{photo && <Image src={photo} alt={p.publication_title || p.address} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="25vw" />}</div>
                <div className="p-4"><p className="text-xl font-black text-gray-900 font-numeric mb-1">{formatPrice(p)}</p><p className="text-gray-600 text-sm truncate">{p.fake_address || p.address}</p></div>
              </Link>
            )})}
          </div>
          <div className="text-center mt-10"><Link href="/propiedades?location=roldan" className="inline-flex items-center gap-2 px-8 py-4 bg-[#1A5C38] hover:bg-[#0F3A23] text-white font-bold rounded-xl transition-colors">Ver todas en Roldán <ArrowRight className="w-5 h-5" /></Link></div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-gray-900 text-center mb-12" style={{ fontFamily: 'var(--font-raleway)' }}>Preguntas frecuentes</h2>
          <div className="space-y-4">
            {faqJsonLd.mainEntity.map((faq, i) => (
              <details key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 group">
                <summary className="font-bold text-gray-900 cursor-pointer list-none flex items-center justify-between">{faq.name}<span className="text-[#1A5C38] group-open:rotate-180 transition-transform">&#9660;</span></summary>
                <p className="mt-4 text-gray-600">{faq.acceptedAnswer.text}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-[#1A5C38]">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-black mb-4" style={{ fontFamily: 'var(--font-raleway)' }}>¿Buscás propiedad en Roldán?</h2>
          <p className="text-green-100 text-lg mb-8">Contanos qué estás buscando y te enviamos opciones personalizadas.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="https://wa.me/5493412101694?text=Hola!%20Estoy%20buscando%20propiedad%20en%20Roldán" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-[#25D366] hover:bg-[#1ebe57] text-white font-bold rounded-xl transition-colors">Escribinos por WhatsApp</a>
            <a href="tel:+5493412101694" className="px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2"><Phone className="w-5 h-5" />(341) 210-1694</a>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-white border-t">
        <div className="max-w-4xl mx-auto">
          <h3 className="font-bold text-gray-900 mb-4">También te puede interesar</h3>
          <div className="flex flex-wrap gap-3">
            <Link href="/casas-en-venta-roldan" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors">Casas en venta en Roldán</Link>
            <Link href="/terrenos-roldan" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors">Terrenos en Roldán</Link>
            <Link href="/inmobiliaria-funes" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors">Inmobiliaria en Funes</Link>
            <Link href="/tasaciones" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors">Tasaciones profesionales</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
