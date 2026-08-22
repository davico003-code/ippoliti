import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Phone, CheckCircle, ArrowRight } from 'lucide-react'
import { getProperties, type TokkoProperty, getMainPhoto, formatPrice, generatePropertySlug } from '@/lib/tokko'
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd'

export const revalidate = 21600

const jsonLd = {
  '@context': 'https://schema.org', '@type': 'WebPage',
  '@id': 'https://siinmobiliaria.com/inmobiliaria-fisherton#webpage',
  name: 'Inmobiliaria en Fisherton | SI INMOBILIARIA',
  url: 'https://siinmobiliaria.com/inmobiliaria-fisherton',
  about: {
    '@type': 'Service',
    name: 'Servicios inmobiliarios en Fisherton',
    provider: { '@id': 'https://siinmobiliaria.com/#organization' },
    areaServed: { '@type': 'Place', name: 'Fisherton, Rosario' },
  },
  dateModified: '2026-08-22',
}

const faqJsonLd = {
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Cuánto cuesta una casa en Fisherton?', acceptedAnswer: { '@type': 'Answer', text: 'El valor depende del sector, superficie, estado, antigüedad, terreno y comparables vigentes. El inventario publicado muestra precios pedidos; una tasación profesional verifica además documentación y microubicación.' } },
    { '@type': 'Question', name: '¿Qué conviene revisar antes de comprar en Fisherton?', acceptedAnswer: { '@type': 'Answer', text: 'Conviene revisar accesos, servicios, estado, entorno inmediato, documentación, gastos y propiedades realmente comparables. La conveniencia depende del uso y presupuesto de cada comprador.' } },
    { '@type': 'Question', name: '¿Qué sectores abarca la búsqueda en Fisherton?', acceptedAnswer: { '@type': 'Answer', text: 'Incluye sectores abiertos de Fisherton y desarrollos cercanos como Green Village, Palos Verdes, Aldea Fisherton y Fisherton R. Cada uno requiere comparables específicos.' } },
    { '@type': 'Question', name: '¿SI INMOBILIARIA tiene una oficina en Fisherton?', acceptedAnswer: { '@type': 'Answer', text: 'No. SI INMOBILIARIA atiende Fisherton desde sus oficinas de Funes y Roldán y coordina visitas en la zona.' } },
  ],
}

export const metadata: Metadata = {
  title: 'Inmobiliaria en Fisherton | Casas y Propiedades | SI INMOBILIARIA',
  description: 'Casas, departamentos y terrenos en Fisherton, Rosario. Inventario vigente, tasaciones profesionales y atención desde las oficinas de SI INMOBILIARIA en Funes y Roldán.',
  keywords: 'inmobiliaria fisherton, casas en fisherton, propiedades fisherton, fisherton rosario',
  alternates: { canonical: 'https://siinmobiliaria.com/inmobiliaria-fisherton' },
  openGraph: { title: 'Inmobiliaria en Fisherton | SI INMOBILIARIA', description: 'Propiedades en la zona residencial premium de Rosario.', url: 'https://siinmobiliaria.com/inmobiliaria-fisherton', images: ['/og-image.jpg'] },
}

const BARRIOS = [
  { name: 'Fisherton Centro', desc: 'Sectores residenciales abiertos con casas y terrenos de distintas tipologías.' },
  { name: 'Green Village', desc: 'Desarrollo cerrado; verificar servicios, expensas y características de cada unidad.' },
  { name: 'Palos Verdes', desc: 'Barrio cerrado con oferta que varía por lote, estado y ubicación interna.' },
  { name: 'Aldea Fisherton', desc: 'Desarrollo residencial con distintos sectores y niveles de consolidación.' },
  { name: 'Zona Jockey Club', desc: 'Sector residencial cuya comparación depende del terreno, antigüedad y estado.' },
  { name: 'Fisherton R', desc: 'Área residencial con lotes, viviendas y emprendimientos de distintas etapas.' },
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
      <BreadcrumbJsonLd items={[
        { name: 'Inicio', url: 'https://siinmobiliaria.com' },
        { name: 'Inmobiliaria en Fisherton', url: 'https://siinmobiliaria.com/inmobiliaria-fisherton' },
      ]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <section className="relative bg-gradient-to-br from-[#1A5C38] to-[#0F3A23] text-white py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-green-200 text-sm font-semibold tracking-widest uppercase mb-4" style={{ fontFamily: 'var(--font-poppins)' }}>Zona residencial premium de Rosario</p>
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight" style={{ fontFamily: 'var(--font-raleway)' }}>Inmobiliaria en Fisherton</h1>
          <p className="text-green-100 text-xl max-w-3xl mx-auto leading-relaxed mb-8" style={{ fontFamily: 'var(--font-poppins)' }}>
            Casas, departamentos y terrenos con inventario vigente y atención coordinada desde
            nuestras oficinas de Funes y Roldán.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/propiedades?search=fisherton" className="px-8 py-4 bg-white text-[#1A5C38] font-bold rounded-xl hover:bg-green-50 transition-colors">Ver propiedades en Fisherton</Link>
            <Link href="/tasaciones" className="px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-colors">Solicitar tasación</Link>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-8 border-b">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[{ num: properties.length.toString(), label: 'Propiedades publicadas' }, { num: '40+', label: 'Años de trayectoria' }, { num: '3', label: 'Oficinas en la región' }, { num: '2', label: 'Generaciones' }].map(s => (
            <div key={s.label}><div className="text-3xl font-black text-[#1A5C38] font-numeric">{s.num}</div><div className="text-sm text-gray-600">{s.label}</div></div>
          ))}
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto prose prose-lg max-w-none">
          <h2 className="text-3xl font-black text-gray-900 mb-6" style={{ fontFamily: 'var(--font-raleway)' }}>¿Por qué elegir Fisherton?</h2>
          <p className="text-gray-700"><strong>Fisherton</strong> reúne sectores residenciales abiertos y desarrollos cercanos con tipologías muy distintas. El terreno, la antigüedad, el estado y el entorno inmediato influyen tanto como la superficie cubierta.</p>
          <p className="text-gray-700">La zona se conecta con Funes y otros puntos del corredor oeste por distintos accesos. Los tiempos de viaje dependen del recorrido y del tránsito, por lo que conviene verificarlos para cada propiedad.</p>
          <p className="text-gray-700"><strong>SI INMOBILIARIA</strong> no presenta una sucursal inexistente en Fisherton: coordinamos visitas y atención desde nuestras oficinas de Funes y Roldán, con inventario filtrado para la zona.</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-10 mb-4" style={{ fontFamily: 'var(--font-raleway)' }}>Servicios en Fisherton</h3>
          <ul className="space-y-3 not-prose">
            {['Venta de casas, departamentos y terrenos', 'Alquiler tradicional y temporario', 'Tasaciones profesionales con comparables locales', 'Revisión de documentación y acompañamiento de la operación', 'Coordinación de visitas desde Funes y Roldán'].map(s => (
              <li key={s} className="flex items-center gap-3 text-gray-700"><CheckCircle className="w-5 h-5 text-[#1A5C38] flex-shrink-0" />{s}</li>
            ))}
          </ul>
          <p className="text-sm text-gray-500">Contenido revisado el 22 de agosto de 2026. El inventario se actualiza desde el sistema de publicaciones.</p>
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
          <h2 className="text-3xl font-black text-gray-900 text-center mb-12" style={{ fontFamily: 'var(--font-raleway)' }}>{properties.length} propiedades en Fisherton</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.slice(0, 8).map(p => { const photo = getMainPhoto(p); return (
              <Link key={p.id} href={`/propiedades/${generatePropertySlug(p)}`} className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all">
                <div className="relative h-48 bg-gray-100">{photo && <Image src={photo} alt={p.publication_title || p.address} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw" />}</div>
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
