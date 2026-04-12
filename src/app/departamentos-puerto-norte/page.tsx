import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getProperties, type TokkoProperty, getMainPhoto, formatPrice, generatePropertySlug, getRoofedArea } from '@/lib/tokko'

export const revalidate = 21600

const ZONE = 'Puerto Norte'
const ZONE_LOWER = 'puerto norte'
const ZONE_SLUG = 'puerto-norte'

const jsonLd = {
  '@context': 'https://schema.org', '@type': 'RealEstateAgent',
  name: 'SI Inmobiliaria — Departamentos en Puerto Norte', url: `https://siinmobiliaria.com/departamentos-${ZONE_SLUG}`,
  telephone: '+5493412101694', areaServed: [ZONE, 'Rosario'],
  address: { '@type': 'PostalAddress', addressLocality: 'Rosario', addressRegion: 'Santa Fe', addressCountry: 'AR' },
}

const faqJsonLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [
  { '@type': 'Question', name: '¿Cuánto cuesta un departamento en Puerto Norte?', acceptedAnswer: { '@type': 'Answer', text: 'Los departamentos en Puerto Norte arrancan desde USD 120.000 para 1 dormitorio. Un 2 dormitorios premium con vista al río ronda los USD 200.000-350.000. El precio promedio por m² es de USD 2.300.' } },
  { '@type': 'Question', name: '¿Cuáles son los mejores edificios de Puerto Norte?', acceptedAnswer: { '@type': 'Answer', text: 'Los edificios más reconocidos son Ciudad Ribera, Forum, Dolfines Guaraní, Condominios del Alto y Maui. Todos cuentan con amenities premium: pileta, gym, seguridad 24hs y vista al río Paraná.' } },
  { '@type': 'Question', name: '¿Puerto Norte es buena inversión?', acceptedAnswer: { '@type': 'Answer', text: 'Sí. Puerto Norte es la zona de mayor valorización de Rosario. La renta por alquiler temporario (Airbnb) es muy alta por la demanda turística y corporativa. Los departamentos con vista al río mantienen su valor en dólares.' } },
]}

export const metadata: Metadata = {
  title: `Departamentos en ${ZONE} | Venta y alquiler | SI Inmobiliaria`,
  description: `Departamentos en ${ZONE}, Rosario. Torres premium con vista al río Paraná, pileta, gym, seguridad 24hs. Ciudad Ribera, Forum, Dolfines. Desde USD 120.000.`,
  keywords: `departamentos ${ZONE_LOWER}, departamentos venta ${ZONE_LOWER}, ${ZONE_LOWER} rosario`,
  alternates: { canonical: `https://siinmobiliaria.com/departamentos-${ZONE_SLUG}` },
  openGraph: { title: `Departamentos en ${ZONE}`, description: `Torres premium con vista al Paraná.`, url: `https://siinmobiliaria.com/departamentos-${ZONE_SLUG}` },
}

function filter(props: TokkoProperty[]): TokkoProperty[] {
  return props.filter(p => {
    const loc = `${p.location?.short_location ?? ''} ${p.location?.name ?? ''} ${p.fake_address ?? ''} ${p.address ?? ''}`.toLowerCase()
    const match = loc.includes('puerto norte') || loc.includes('puerto')
    const isDpto = (p.type?.name?.toLowerCase() ?? '').match(/departamento|apartment|condo/)
    const isVenta = p.operations?.[0]?.operation_type === 'Sale'
    return match && isDpto && isVenta
  })
}

export default async function Page() {
  let properties: TokkoProperty[] = []
  try { const d = await getProperties(); properties = filter(d.objects ?? []) } catch {}

  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <section className="bg-gradient-to-br from-[#1A5C38] to-[#0F3A23] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-green-200 text-sm font-semibold tracking-widest uppercase mb-4" style={{ fontFamily: 'var(--font-poppins)' }}>Torres premium · Vista al Paraná</p>
          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight" style={{ fontFamily: 'var(--font-raleway)' }}>Departamentos en {ZONE}</h1>
          <p className="text-green-100 text-lg max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-poppins)' }}>{properties.length} departamentos disponibles. Pileta, gym, seguridad 24hs. Desde USD 120.000.</p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map(p => { const photo = getMainPhoto(p); const roofed = getRoofedArea(p); const beds = p.suite_amount || p.room_amount; return (
            <Link key={p.id} href={`/propiedades/${generatePropertySlug(p)}`} className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all">
              <div className="relative h-48 bg-gray-100">{photo && <Image src={photo} alt={p.publication_title || p.address} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="25vw" />}</div>
              <div className="p-4">
                <p className="text-xl font-black text-gray-900 font-numeric mb-1">{formatPrice(p)}</p>
                <p className="text-sm text-gray-600 mb-1">{[beds && `${beds} dorm`, roofed && `${roofed} m²`].filter(Boolean).join(' · ')}</p>
                <p className="text-sm text-gray-500 truncate">{p.fake_address || p.address}</p>
              </div>
            </Link>
          )})}
          {properties.length === 0 && <p className="col-span-full text-center text-gray-500 py-12">No hay departamentos disponibles. Consultanos por WhatsApp.</p>}
        </div>
      </section>

      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: 'var(--font-raleway)' }}>Vivir en Puerto Norte</h2>
          <p>Puerto Norte es el desarrollo urbanístico más ambicioso de Rosario. Ubicado sobre la costa del río Paraná, ofrece torres de categoría con amenities de nivel internacional: piletas climatizadas, gimnasios equipados, rooftop gardens y seguridad 24 horas.</p>
          <p>Edificios como <strong>Ciudad Ribera</strong>, <strong>Forum</strong>, <strong>Dolfines Guaraní</strong> y <strong>Condominios del Alto</strong> definen el skyline de la ciudad. El precio promedio por m² es de USD 2.300, con departamentos desde USD 120.000 (1 dorm) hasta más de USD 500.000 (penthouse).</p>
          <p>La renta por alquiler temporario es la más alta de Rosario, convirtiéndola en una excelente opción para inversores. En <strong>SI Inmobiliaria</strong> te asesoramos sobre rentabilidad, expensas y proyección de valor.</p>
        </div>
      </section>

      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-black text-gray-900 text-center mb-8" style={{ fontFamily: 'var(--font-raleway)' }}>Preguntas frecuentes</h2>
          <div className="space-y-4">{faqJsonLd.mainEntity.map((faq, i) => (
            <details key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 group">
              <summary className="font-bold text-gray-900 cursor-pointer list-none flex items-center justify-between">{faq.name}<span className="text-[#1A5C38] group-open:rotate-180 transition-transform">&#9660;</span></summary>
              <p className="mt-4 text-gray-600">{faq.acceptedAnswer.text}</p>
            </details>
          ))}</div>
        </div>
      </section>

      <section className="py-12 px-4 bg-[#1A5C38] text-center text-white">
        <h2 className="text-2xl font-black mb-4" style={{ fontFamily: 'var(--font-raleway)' }}>¿Buscás departamento en {ZONE}?</h2>
        <a href={`https://wa.me/5493412101694?text=Hola!%20Busco%20departamento%20en%20${encodeURIComponent(ZONE)}`} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-[#25D366] text-white font-bold rounded-xl inline-block">WhatsApp</a>
      </section>

      <section className="py-8 px-4 border-t"><div className="max-w-4xl mx-auto flex flex-wrap gap-3">
        <Link href="/departamentos-pichincha" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700">Deptos Pichincha</Link>
        <Link href="/departamentos-centro-rosario" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700">Deptos Centro</Link>
        <Link href="/inmobiliaria-fisherton" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700">Fisherton</Link>
      </div></section>
    </div>
  )
}
