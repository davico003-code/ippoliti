import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getProperties, type TokkoProperty, getMainPhoto, formatPrice, generatePropertySlug, getRoofedArea } from '@/lib/tokko'

export const revalidate = 21600

const faqJsonLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [
  { '@type': 'Question', name: '¿Cuánto cuesta un departamento en el centro de Rosario?', acceptedAnswer: { '@type': 'Answer', text: 'Un monoambiente en el centro de Rosario arranca desde USD 45.000. Un 2 ambientes desde USD 65.000. Los departamentos a estrenar con amenities rondan USD 90.000-150.000 según ubicación y calidad.' } },
  { '@type': 'Question', name: '¿Conviene comprar para alquilar en el centro?', acceptedAnswer: { '@type': 'Answer', text: 'El centro de Rosario tiene la demanda de alquiler más estable de la ciudad. Profesionales, estudiantes y ejecutivos buscan departamentos 1-2 dormitorios con buena conectividad. La renta es consistente todo el año.' } },
  { '@type': 'Question', name: '¿Qué zonas del centro son mejores?', acceptedAnswer: { '@type': 'Answer', text: 'Las zonas premium son: cerca de Peatonal Córdoba, entorno de Plaza Pringles, y el corredor de Bv. Oroño. Cada cuadra tiene su particularidad en precio y demanda.' } },
]}

export const metadata: Metadata = {
  title: 'Departamentos en Centro Rosario | Venta | SI Inmobiliaria',
  description: 'Departamentos en venta en el centro de Rosario. Peatonal Córdoba, Plaza Pringles. Desde USD 45.000. Ideal inversores. SI Inmobiliaria.',
  keywords: 'departamentos centro rosario, departamentos venta centro rosario, departamentos rosario centro',
  alternates: { canonical: 'https://siinmobiliaria.com/departamentos-centro-rosario' },
  openGraph: { title: 'Departamentos en Centro Rosario', url: 'https://siinmobiliaria.com/departamentos-centro-rosario' },
}

function filter(props: TokkoProperty[]): TokkoProperty[] {
  return props.filter(p => {
    const loc = `${p.location?.short_location ?? ''} ${p.location?.name ?? ''} ${p.fake_address ?? ''} ${p.address ?? ''}`.toLowerCase()
    const match = loc.includes('centro') || loc.includes('rosario centro') || loc.includes('microcentro')
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <section className="bg-gradient-to-br from-[#1A5C38] to-[#0F3A23] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-green-200 text-sm font-semibold tracking-widest uppercase mb-4" style={{ fontFamily: 'var(--font-poppins)' }}>Máxima conectividad · Alta demanda</p>
          <h1 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: 'var(--font-raleway)' }}>Departamentos en Centro Rosario</h1>
          <p className="text-green-100 text-lg" style={{ fontFamily: 'var(--font-poppins)' }}>{properties.length} departamentos. Peatonal, servicios, transporte. Desde USD 45.000.</p>
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
        <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: 'var(--font-raleway)' }}>El centro de Rosario</h2>
        <p>El centro de Rosario concentra la mayor actividad comercial, gastronómica y cultural de la ciudad. La <strong>Peatonal Córdoba</strong>, <strong>Plaza Pringles</strong> y el corredor de <strong>Bv. Oroño</strong> definen una zona con máxima conectividad y servicios.</p>
        <p>Los departamentos de 1-2 dormitorios son los más demandados, tanto por profesionales como por inversores que buscan renta estable. En <strong>SI Inmobiliaria</strong> te asesoramos sobre la mejor ubicación y proyección de valor.</p>
      </div></section>

      <section className="py-12 px-4 bg-gray-50"><div className="max-w-3xl mx-auto"><h2 className="text-2xl font-black text-gray-900 text-center mb-8" style={{ fontFamily: 'var(--font-raleway)' }}>Preguntas frecuentes</h2><div className="space-y-4">{faqJsonLd.mainEntity.map((f, i) => (<details key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 group"><summary className="font-bold text-gray-900 cursor-pointer list-none flex items-center justify-between">{f.name}<span className="text-[#1A5C38] group-open:rotate-180 transition-transform">&#9660;</span></summary><p className="mt-4 text-gray-600">{f.acceptedAnswer.text}</p></details>))}</div></div></section>

      <section className="py-12 px-4 bg-[#1A5C38] text-center text-white">
        <h2 className="text-2xl font-black mb-4">¿Buscás depto en el centro?</h2>
        <a href="https://wa.me/5493412101694?text=Hola!%20Busco%20departamento%20en%20Centro%20Rosario" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-[#25D366] text-white font-bold rounded-xl inline-block">WhatsApp</a>
      </section>

      <section className="py-8 px-4 border-t"><div className="max-w-4xl mx-auto flex flex-wrap gap-3">
        <Link href="/departamentos-pichincha" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700">Pichincha</Link>
        <Link href="/departamentos-puerto-norte" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700">Puerto Norte</Link>
        <Link href="/departamentos-echesortu" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700">Echesortu</Link>
      </div></section>
    </div>
  )
}
