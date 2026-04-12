import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getProperties, type TokkoProperty, getMainPhoto, formatPrice, generatePropertySlug, getRoofedArea } from '@/lib/tokko'

export const revalidate = 21600

const faqJsonLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [
  { '@type': 'Question', name: '¿Cuánto cuesta un departamento en Abasto?', acceptedAnswer: { '@type': 'Answer', text: 'Los departamentos en Abasto van desde USD 55.000 (1 dormitorio) hasta USD 140.000 (3 ambientes). Es una zona en pleno crecimiento con mucha construcción nueva y precios accesibles.' } },
  { '@type': 'Question', name: '¿Abasto es buen barrio para invertir?', acceptedAnswer: { '@type': 'Answer', text: 'Abasto está en pleno auge gastronómico y cultural. La construcción de edificios nuevos y la llegada de comercios premium lo posicionan como una zona con fuerte valorización. Ideal para inversión a mediano plazo.' } },
  { '@type': 'Question', name: '¿Dónde queda Abasto en Rosario?', acceptedAnswer: { '@type': 'Answer', text: 'Abasto se ubica en torno a la Plaza Libertad y Bv. 27 de Febrero. Limita con Centro y Echesortu. Excelente conectividad por las principales avenidas de la ciudad.' } },
]}

export const metadata: Metadata = {
  title: 'Departamentos en Abasto | Venta Rosario | SI Inmobiliaria',
  description: 'Departamentos en venta en Abasto, Rosario. Zona en crecimiento, gastronomía, construcción nueva. Desde USD 55.000. SI Inmobiliaria.',
  keywords: 'departamentos abasto, abasto rosario, departamentos venta abasto rosario',
  alternates: { canonical: 'https://siinmobiliaria.com/departamentos-abasto' },
  openGraph: { title: 'Departamentos en Abasto', url: 'https://siinmobiliaria.com/departamentos-abasto' },
}

function filter(props: TokkoProperty[]): TokkoProperty[] {
  return props.filter(p => {
    const loc = `${p.location?.short_location ?? ''} ${p.location?.name ?? ''} ${p.fake_address ?? ''} ${p.address ?? ''}`.toLowerCase()
    const isDpto = (p.type?.name?.toLowerCase() ?? '').match(/departamento|apartment|condo/)
    const isVenta = p.operations?.[0]?.operation_type === 'Sale'
    return loc.includes('abasto') && isDpto && isVenta
  })
}

export default async function Page() {
  let properties: TokkoProperty[] = []
  try { const d = await getProperties(); properties = filter(d.objects ?? []) } catch {}

  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <section className="bg-gradient-to-br from-[#1A5C38] to-[#0F3A23] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-green-200 text-sm font-semibold tracking-widest uppercase mb-4" style={{ fontFamily: 'var(--font-poppins)' }}>Zona en crecimiento · Gastronomía</p>
          <h1 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: 'var(--font-raleway)' }}>Departamentos en Abasto</h1>
          <p className="text-green-100 text-lg" style={{ fontFamily: 'var(--font-poppins)' }}>{properties.length} departamentos. Construcción nueva, precios accesibles. Desde USD 55.000.</p>
        </div>
      </section>

      <section className="py-12 px-4"><div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {properties.map(p => { const photo = getMainPhoto(p); const r = getRoofedArea(p); const beds = p.suite_amount || p.room_amount; return (
          <Link key={p.id} href={`/propiedades/${generatePropertySlug(p)}`} className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all">
            <div className="relative h-48 bg-gray-100">{photo && <Image src={photo} alt={p.publication_title || p.address} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="25vw" />}</div>
            <div className="p-4"><p className="text-xl font-black text-gray-900 font-numeric mb-1">{formatPrice(p)}</p><p className="text-sm text-gray-600 mb-1">{[beds && `${beds} amb`, r && `${r} m²`].filter(Boolean).join(' · ')}</p><p className="text-sm text-gray-500 truncate">{p.fake_address || p.address}</p></div>
          </Link>
        )})}
        {properties.length === 0 && <p className="col-span-full text-center text-gray-500 py-12">No hay departamentos disponibles. Consultanos por WhatsApp.</p>}
      </div></section>

      <section className="py-12 px-4 bg-gray-50"><div className="max-w-4xl mx-auto prose prose-lg">
        <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: 'var(--font-raleway)' }}>Vivir en Abasto</h2>
        <p>Abasto es una de las zonas con mayor crecimiento de Rosario. La <strong>Plaza Libertad</strong> y el <strong>Bv. 27 de Febrero</strong> son sus ejes, con una escena gastronómica emergente y mucha construcción nueva.</p>
        <p>Los departamentos en Abasto ofrecen excelente relación precio-calidad. Jóvenes profesionales y familias jóvenes eligen esta zona por su accesibilidad y proyección. En <strong>SI Inmobiliaria</strong> te ayudamos a encontrar la mejor oportunidad.</p>
      </div></section>

      <section className="py-12 px-4 bg-gray-50"><div className="max-w-3xl mx-auto"><h2 className="text-2xl font-black text-gray-900 text-center mb-8" style={{ fontFamily: 'var(--font-raleway)' }}>Preguntas frecuentes</h2><div className="space-y-4">{faqJsonLd.mainEntity.map((f, i) => (<details key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 group"><summary className="font-bold text-gray-900 cursor-pointer list-none flex items-center justify-between">{f.name}<span className="text-[#1A5C38] group-open:rotate-180 transition-transform">&#9660;</span></summary><p className="mt-4 text-gray-600">{f.acceptedAnswer.text}</p></details>))}</div></div></section>

      <section className="py-12 px-4 bg-[#1A5C38] text-center text-white">
        <h2 className="text-2xl font-black mb-4">¿Buscás depto en Abasto?</h2>
        <a href="https://wa.me/5493412101694?text=Hola!%20Busco%20departamento%20en%20Abasto%20Rosario" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-[#25D366] text-white font-bold rounded-xl inline-block">WhatsApp</a>
      </section>

      <section className="py-8 px-4 border-t"><div className="max-w-4xl mx-auto flex flex-wrap gap-3">
        <Link href="/departamentos-echesortu" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700">Echesortu</Link>
        <Link href="/departamentos-centro-rosario" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700">Centro</Link>
        <Link href="/departamentos-pichincha" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700">Pichincha</Link>
      </div></section>
    </div>
  )
}
