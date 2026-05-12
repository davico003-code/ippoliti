import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Phone, CheckCircle, ArrowRight } from 'lucide-react'
import { getProperties, type TokkoProperty, getMainPhoto, formatPrice, generatePropertySlug } from '@/lib/tokko'

export const revalidate = 21600

const jsonLd = {
  '@context': 'https://schema.org', '@type': 'RealEstateAgent',
  name: 'SI Inmobiliaria Fisherton', image: 'https://siinmobiliaria.com/logo.png',
  url: 'https://siinmobiliaria.com/inmobiliaria-fisherton', telephone: '+5493412101694',
  address: { '@type': 'PostalAddress', addressLocality: 'Fisherton, Rosario', addressRegion: 'Santa Fe', addressCountry: 'AR' },
  geo: { '@type': 'GeoCoordinates', latitude: -32.9320, longitude: -60.7080 },
  areaServed: ['Fisherton', 'Fisherton R', 'Aldea', 'Green Village', 'Palos Verdes', 'Rosario'],
  priceRange: 'USD 80.000 - USD 800.000',
}

const faqJsonLd = {
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Cuánto cuesta una casa en Fisherton?', acceptedAnswer: { '@type': 'Answer', text: 'Las casas en Fisherton arrancan desde USD 150.000 en zonas residenciales abiertas. En barrios cerrados como Green Village o Palos Verdes, desde USD 300.000. Las casas premium cerca del Jockey Club superan los USD 500.000.' } },
    { '@type': 'Question', name: '¿Por qué vivir en Fisherton?', acceptedAnswer: { '@type': 'Answer', text: 'Fisherton es el barrio residencial premium de Rosario. Combina calles arboladas, casas con jardín, cercanía al Jockey Club y Rosario Golf Club, excelentes colegios y acceso rápido a Funes por Av. Eva Perón. Es la zona preferida por familias que buscan calidad de vida sin salir de Rosario.' } },
    { '@type': 'Question', name: '¿Qué barrios cerrados hay cerca de Fisherton?', acceptedAnswer: { '@type': 'Answer', text: 'Los principales barrios cerrados de la zona son Green Village, Palos Verdes, Aldea Fisherton y Country Fisherton. Todos ofrecen seguridad 24hs, amenities y entorno parquizado.' } },
    { '@type': 'Question', name: '¿Fisherton está cerca de Funes?', acceptedAnswer: { '@type': 'Answer', text: 'Sí, Fisherton conecta directamente con Funes por Av. Eva Perón. En auto son 10-15 minutos. Muchas familias consideran ambas zonas al buscar propiedad.' } },
  ],
}

export const metadata: Metadata = {
  title: 'Inmobiliaria en Fisherton | Casas y Propiedades | SI Inmobiliaria',
  description: 'Inmobiliaria en Fisherton, Rosario. Casas, departamentos y terrenos en la zona residencial premium de Rosario. Green Village, Palos Verdes, Aldea. +40 años.',
  keywords: 'inmobiliaria fisherton, casas en fisherton, propiedades fisherton, fisherton rosario',
  alternates: { canonical: 'https://siinmobiliaria.com/inmobiliaria-fisherton' },
  openGraph: { title: 'Inmobiliaria en Fisherton | SI Inmobiliaria', description: 'Propiedades en la zona residencial premium de Rosario.', url: 'https://siinmobiliaria.com/inmobiliaria-fisherton', images: ['/og-image.jpg'] },
}

const BARRIOS = [
  { name: 'Fisherton Centro', desc: 'Calles arboladas, casas con jardín, vida de barrio residencial premium.', price: 'Desde USD 150K' },
  { name: 'Green Village', desc: 'Country con seguridad 24hs, pileta, club house y lotes amplios.', price: 'Desde USD 300K' },
  { name: 'Palos Verdes', desc: 'Barrio cerrado premium con entorno verde y excelente infraestructura.', price: 'Desde USD 280K' },
  { name: 'Aldea Fisherton', desc: 'Desarrollo residencial con acceso rápido a autopista y a Funes.', price: 'Desde USD 200K' },
  { name: 'Zona Jockey Club', desc: 'El sector más exclusivo de Fisherton. Cercanía al golf y al club.', price: 'Desde USD 400K' },
  { name: 'Fisherton R', desc: 'Extensión residencial con lotes nuevos y emprendimientos modernos.', price: 'Desde USD 120K' },
]

function filter(props: TokkoProperty[]): TokkoProperty[] {
  return props.filter(p => {
    const t = `${p.location?.short_location ?? ''} ${p.location?.name ?? ''} ${p.fake_address ?? ''} ${p.address ?? ''}`.toLowerCase()
    return t.includes('fisherton') || t.includes('aldea')
  })
}

export default async function Page() {
  let properties: TokkoProperty[] = []
  try { const d = await getProperties(); properties = filter(d.objects ?? []) } catch (e) { console.error('[inmobiliaria-fisherton]', e instanceof Error ? e.message : e) }

  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <section className="relative bg-gradient-to-br from-[#1A5C38] to-[#0F3A23] text-white py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-green-200 text-sm font-semibold tracking-widest uppercase mb-4" style={{ fontFamily: 'var(--font-poppins)' }}>Zona residencial premium de Rosario</p>
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight" style={{ fontFamily: 'var(--font-raleway)' }}>Inmobiliaria en Fisherton</h1>
          <p className="text-green-100 text-xl max-w-3xl mx-auto leading-relaxed mb-8" style={{ fontFamily: 'var(--font-poppins)' }}>
            Casas con jardín, barrios cerrados y la mejor calidad de vida de Rosario. A 10 minutos de Funes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/propiedades?search=fisherton" className="px-8 py-4 bg-white text-[#1A5C38] font-bold rounded-xl hover:bg-green-50 transition-colors">Ver propiedades en Fisherton</Link>
            <Link href="/tasaciones" className="px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-colors">Solicitar tasación</Link>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-8 border-b">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[{ num: properties.length + '+', label: 'Propiedades' }, { num: '40+', label: 'Años' }, { num: '10 min', label: 'A Funes' }, { num: '24hs', label: 'Tasación express' }].map(s => (
            <div key={s.label}><div className="text-3xl font-black text-[#1A5C38] font-numeric">{s.num}</div><div className="text-sm text-gray-600">{s.label}</div></div>
          ))}
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto prose prose-lg max-w-none">
          <h2 className="text-3xl font-black text-gray-900 mb-6" style={{ fontFamily: 'var(--font-raleway)' }}>¿Por qué elegir Fisherton?</h2>
          <p className="text-gray-700"><strong>Fisherton</strong> es el barrio residencial más tradicional y codiciado de Rosario. Ubicado en la zona noroeste de la ciudad, se caracteriza por sus calles arboladas, casas amplias con jardín y una atmósfera tranquila que contrasta con el ritmo urbano del centro.</p>
          <p className="text-gray-700">La cercanía al <strong>Jockey Club Rosario</strong> y al <strong>Rosario Golf Club</strong>, sumada a la presencia de colegios de primer nivel, hacen de Fisherton la elección natural para familias que buscan calidad de vida sin alejarse de la ciudad.</p>
          <p className="text-gray-700">Desde Fisherton se accede a <strong>Funes en solo 10-15 minutos</strong> por Av. Eva Perón, lo que convierte a esta zona en un puente natural entre lo urbano y lo suburbano. Muchas familias evalúan ambas opciones al momento de comprar.</p>
          <p className="text-gray-700">En <strong>SI Inmobiliaria</strong> trabajamos Fisherton con el mismo conocimiento de terreno que nos distingue en Funes y Roldán. Nuestros más de 40 años de trayectoria incluyen operaciones en todas las zonas premium del Gran Rosario.</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-10 mb-4" style={{ fontFamily: 'var(--font-raleway)' }}>Servicios en Fisherton</h3>
          <ul className="space-y-3 not-prose">
            {['Venta de casas, departamentos y terrenos', 'Alquiler tradicional y temporario', 'Tasaciones profesionales en 24 horas', 'Asesoramiento legal integral', 'Conexión directa con mercado de Funes y Roldán'].map(s => (
              <li key={s} className="flex items-center gap-3 text-gray-700"><CheckCircle className="w-5 h-5 text-[#1A5C38] flex-shrink-0" />{s}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-black text-gray-900 text-center mb-12" style={{ fontFamily: 'var(--font-raleway)' }}>Barrios de Fisherton</h2>
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
          <h2 className="text-3xl font-black text-gray-900 text-center mb-12" style={{ fontFamily: 'var(--font-raleway)' }}>{properties.length} propiedades en Fisherton</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.slice(0, 8).map(p => { const photo = getMainPhoto(p); return (
              <Link key={p.id} href={`/propiedades/${generatePropertySlug(p)}`} className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all">
                <div className="relative h-48 bg-gray-100">{photo && <Image src={photo} alt={p.publication_title || p.address} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="25vw" />}</div>
                <div className="p-4"><p className="text-xl font-black text-gray-900 font-numeric mb-1">{formatPrice(p)}</p><p className="text-gray-600 text-sm truncate">{p.fake_address || p.address}</p></div>
              </Link>
            )})}
          </div>
          {properties.length > 0 && <div className="text-center mt-10"><Link href="/propiedades?search=fisherton" className="inline-flex items-center gap-2 px-8 py-4 bg-[#1A5C38] hover:bg-[#0F3A23] text-white font-bold rounded-xl transition-colors">Ver todas en Fisherton <ArrowRight className="w-5 h-5" /></Link></div>}
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
          <h2 className="text-3xl font-black mb-4" style={{ fontFamily: 'var(--font-raleway)' }}>¿Buscás propiedad en Fisherton?</h2>
          <p className="text-green-100 text-lg mb-8">Contanos qué estás buscando y te enviamos opciones.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="https://wa.me/5493412101694?text=Hola!%20Estoy%20buscando%20propiedad%20en%20Fisherton" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-[#25D366] hover:bg-[#1ebe57] text-white font-bold rounded-xl transition-colors">WhatsApp</a>
            <a href="tel:+5493412101694" className="px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2"><Phone className="w-5 h-5" />(341) 210-1694</a>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-white border-t">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-3">
          <Link href="/casas-en-venta-fisherton" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors">Casas en Fisherton</Link>
          <Link href="/inmobiliaria-funes" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors">Inmobiliaria en Funes</Link>
          <Link href="/inmobiliaria-roldan" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors">Inmobiliaria en Roldán</Link>
          <Link href="/tasaciones" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors">Tasaciones profesionales</Link>
        </div>
      </section>
    </div>
  )
}
