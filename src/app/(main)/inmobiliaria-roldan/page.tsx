import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Phone, CheckCircle, ArrowRight } from 'lucide-react'
import { getProperties, type TokkoProperty, getMainPhoto, formatPrice, generatePropertySlug } from '@/lib/tokko'
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd'

export const revalidate = 21600

const jsonLd = {
  '@context': 'https://schema.org', '@type': 'WebPage',
  '@id': 'https://siinmobiliaria.com/inmobiliaria-roldan#webpage',
  name: 'Inmobiliaria en Roldán | SI INMOBILIARIA',
  url: 'https://siinmobiliaria.com/inmobiliaria-roldan',
  about: {
    '@type': 'Service',
    name: 'Servicios inmobiliarios en Roldán',
    provider: { '@id': 'https://siinmobiliaria.com/#organization' },
    areaServed: { '@type': 'City', name: 'Roldán' },
  },
  dateModified: '2026-08-22',
}

const faqJsonLd = {
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Cuánto cuesta un terreno en Roldán?', acceptedAnswer: { '@type': 'Answer', text: 'El valor depende del barrio, los servicios, el estado dominial, la superficie y los comparables vigentes. El inventario publicado permite ver precios pedidos; una tasación profesional analiza además evidencia y condiciones de cada inmueble.' } },
    { '@type': 'Question', name: '¿Qué zonas de Roldán se pueden comparar?', acceptedAnswer: { '@type': 'Answer', text: 'Roldán incluye el casco urbano y desarrollos como Los Aromos, El Molino, Tierra de Sueños, Don Mateo y Distrito Roldán. No son equivalentes: deben compararse propiedades de tipología, servicios y entorno similares.' } },
    { '@type': 'Question', name: '¿Cómo evalúo una inversión en Roldán?', acceptedAnswer: { '@type': 'Answer', text: 'Hay que revisar ubicación, servicios existentes y proyectados, documentación, gastos, liquidez y propiedades competidoras. La valorización futura no está garantizada y debe analizarse para cada caso.' } },
    { '@type': 'Question', name: '¿Dónde están las oficinas de SI INMOBILIARIA en Roldán?', acceptedAnswer: { '@type': 'Answer', text: 'La oficina histórica está en Primero de Mayo 258 y la oficina comercial en Catamarca 775. Los teléfonos y horarios vigentes se muestran en los perfiles públicos de cada sucursal.' } },
  ],
}

export const metadata: Metadata = {
  title: 'Inmobiliaria en Roldán | Casas, Terrenos y Lotes | SI INMOBILIARIA',
  description: 'Inmobiliaria en Roldán con dos oficinas. Casas, terrenos y lotes, inventario vigente, tasaciones profesionales y más de 40 años de trayectoria local.',
  keywords: 'inmobiliaria roldan, casas en roldan, terrenos en roldan, propiedades roldan, lotes roldan',
  openGraph: { title: 'Inmobiliaria en Roldán | SI INMOBILIARIA', description: 'Tu inmobiliaria de confianza en Roldán. 2 oficinas, +40 años.', url: 'https://siinmobiliaria.com/inmobiliaria-roldan', images: ['/og-image.jpg'] },
  alternates: { canonical: 'https://siinmobiliaria.com/inmobiliaria-roldan' },
}

const BARRIOS = [
  { name: 'Los Aromos', desc: 'Barrio con lotes y casas de distintas superficies y niveles de consolidación.' },
  { name: 'El Molino', desc: 'Sector consolidado; verificar servicios, expensas y características de cada propiedad.' },
  { name: 'Tierra de Sueños', desc: 'Desarrollo de gran escala con etapas y ubicaciones internas diferentes.' },
  { name: 'Don Mateo', desc: 'Desarrollo residencial con oferta de lotes y viviendas.' },
  { name: 'Distrito Roldán', desc: 'Desarrollo urbano cuya comparación depende de etapa, lote y servicios.' },
  { name: 'Casco Urbano', desc: 'Sectores abiertos próximos a comercios y servicios, con oferta heterogénea.' },
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
      <BreadcrumbJsonLd items={[
        { name: 'Inicio', url: 'https://siinmobiliaria.com' },
        { name: 'Inmobiliaria en Roldán', url: 'https://siinmobiliaria.com/inmobiliaria-roldan' },
      ]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <section className="relative bg-gradient-to-br from-[#1A5C38] to-[#0F3A23] text-white py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-green-200 text-sm font-semibold tracking-widest uppercase mb-4" style={{ fontFamily: 'var(--font-poppins)' }}>2 oficinas en Roldán · Desde 1983</p>
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight" style={{ fontFamily: 'var(--font-raleway)' }}>Inmobiliaria en Roldán</h1>
          <p className="text-green-100 text-xl max-w-3xl mx-auto leading-relaxed mb-8" style={{ fontFamily: 'var(--font-poppins)' }}>
            Casas, terrenos y lotes con inventario vigente y el acompañamiento de un equipo que
            trabaja en la ciudad desde 1983.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/propiedades?location=roldan" className="px-8 py-4 bg-white text-[#1A5C38] font-bold rounded-xl hover:bg-green-50 transition-colors">Ver propiedades en Roldán</Link>
            <Link href="/tasaciones" className="px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-colors">Solicitar tasación</Link>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-8 border-b">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[{ num: properties.length.toString(), label: 'Propiedades publicadas' }, { num: '2', label: 'Oficinas en Roldán' }, { num: '40+', label: 'Años de experiencia' }, { num: '2', label: 'Generaciones' }].map(s => (
            <div key={s.label}><div className="text-3xl font-black text-[#1A5C38] font-numeric">{s.num}</div><div className="text-sm text-gray-600">{s.label}</div></div>
          ))}
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto prose prose-lg max-w-none">
          <h2 className="text-3xl font-black text-gray-900 mb-6" style={{ fontFamily: 'var(--font-raleway)' }}>¿Por qué elegir Roldán?</h2>
          <p className="text-gray-700">Roldán combina casco urbano, barrios abiertos y desarrollos de distintas etapas. Los valores cambian según servicios, accesos, superficie, documentación y consolidación del entorno; por eso una comparación responsable debe separar propiedades realmente equivalentes.</p>
          <p className="text-gray-700">Con <strong>dos oficinas en Roldán</strong> —Primero de Mayo 258 y Catamarca 775—, <strong>SI INMOBILIARIA</strong> trabaja en la ciudad desde 1983. Ese conocimiento se aplica a visitas, selección de comparables y acompañamiento de cada operación.</p>
          <p className="text-gray-700">Los precios publicados cambian con el inventario y no garantizan el valor de cierre ni una valorización futura. Esta página muestra las propiedades activas; para un inmueble concreto revisamos documentación, estado, microubicación y evidencia reciente.</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-10 mb-4" style={{ fontFamily: 'var(--font-raleway)' }}>Nuestros servicios en Roldán</h3>
          <ul className="space-y-3 not-prose">
            {['Venta de casas, departamentos, terrenos y lotes', 'Alquiler tradicional y temporario', 'Tasaciones profesionales con comparables locales', 'Revisión de documentación y acompañamiento de la operación', 'Negociación y coordinación hasta la escritura o entrega', 'Administración de propiedades'].map(s => (
              <li key={s} className="flex items-center gap-3 text-gray-700"><CheckCircle className="w-5 h-5 text-[#1A5C38] flex-shrink-0" />{s}</li>
            ))}
          </ul>
          <p className="text-sm text-gray-500">Contenido y datos institucionales revisados el 22 de agosto de 2026. El inventario se actualiza desde el sistema de publicaciones.</p>
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
                <div className="flex items-center justify-end">
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
                <div className="relative h-48 bg-gray-100">{photo && <Image src={photo} alt={p.publication_title || p.address} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw" />}</div>
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
