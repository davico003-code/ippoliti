import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getProperties, type TokkoProperty, getMainPhoto, formatPrice, generatePropertySlug, getRoofedArea } from '@/lib/tokko'

export const revalidate = 21600

const faqJsonLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [
  { '@type': 'Question', name: '¿Cuánto cuesta un departamento en Echesortu?', acceptedAnswer: { '@type': 'Answer', text: 'Los departamentos en Echesortu van desde USD 50.000 (1 dormitorio) hasta USD 130.000 (3 ambientes con cochera). Es una zona con excelente relación precio-calidad y vida barrial.' } },
  { '@type': 'Question', name: '¿Echesortu es buen barrio para familias?', acceptedAnswer: { '@type': 'Answer', text: 'Sí. Echesortu es el centro geográfico de Rosario con vida barrial tranquila, buena conectividad por Av. Pellegrini, plazas, comercios y escuelas. Ideal para familias y estudiantes.' } },
]}

export const metadata: Metadata = {
  title: 'Departamentos en Echesortu | Venta Rosario | SI Inmobiliaria',
  description: 'Departamentos en venta en Echesortu, Rosario. Vida barrial, Av. Pellegrini, buena conectividad. Desde USD 50.000. SI Inmobiliaria.',
  keywords: 'departamentos echesortu, echesortu rosario, departamentos venta echesortu',
  alternates: { canonical: 'https://siinmobiliaria.com/departamentos-echesortu' },
  openGraph: { title: 'Departamentos en Echesortu', url: 'https://siinmobiliaria.com/departamentos-echesortu' },
}

function filter(props: TokkoProperty[]): TokkoProperty[] {
  return props.filter(p => {
    const loc = `${p.location?.short_location ?? ''} ${p.location?.name ?? ''} ${p.fake_address ?? ''} ${p.address ?? ''}`.toLowerCase()
    const isDpto = (p.type?.name?.toLowerCase() ?? '').match(/departamento|apartment|condo/)
    const isVenta = p.operations?.[0]?.operation_type === 'Sale'
    return loc.includes('echesortu') && isDpto && isVenta
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
          <p className="text-green-200 text-sm font-semibold tracking-widest uppercase mb-4" style={{ fontFamily: 'var(--font-poppins)' }}>Vida barrial · Centro geográfico</p>
          <h1 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: 'var(--font-raleway)' }}>Departamentos en Echesortu</h1>
          <p className="text-green-100 text-lg" style={{ fontFamily: 'var(--font-poppins)' }}>{properties.length} departamentos. Av. Pellegrini, plazas, conectividad. Desde USD 50.000.</p>
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
        <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: 'var(--font-raleway)' }}>Vivir en Echesortu</h2>
        <p>Echesortu es el centro geográfico de Rosario. Con la <strong>Av. Pellegrini</strong> como eje principal, ofrece excelente conectividad, vida comercial activa y un ambiente barrial que combina tradición con desarrollo.</p>
        <p>Es la opción preferida por familias y estudiantes que buscan departamentos accesibles con buena calidad de vida. En <strong>SI Inmobiliaria</strong> conocemos cada cuadra y te asesoramos para encontrar la mejor opción.</p>
      </div></section>

      <section className="py-12 px-4 bg-gray-50"><div className="max-w-3xl mx-auto"><h2 className="text-2xl font-black text-gray-900 text-center mb-8" style={{ fontFamily: 'var(--font-raleway)' }}>Preguntas frecuentes</h2><div className="space-y-4">{faqJsonLd.mainEntity.map((f, i) => (<details key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 group"><summary className="font-bold text-gray-900 cursor-pointer list-none flex items-center justify-between">{f.name}<span className="text-[#1A5C38] group-open:rotate-180 transition-transform">&#9660;</span></summary><p className="mt-4 text-gray-600">{f.acceptedAnswer.text}</p></details>))}</div></div></section>

      <section className="py-12 px-4 bg-[#1A5C38] text-center text-white">
        <h2 className="text-2xl font-black mb-4">¿Buscás depto en Echesortu?</h2>
        <a href="https://wa.me/5493412101694?text=Hola!%20Busco%20departamento%20en%20Echesortu" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-[#25D366] text-white font-bold rounded-xl inline-block">WhatsApp</a>
      </section>

      <section className="py-8 px-4 border-t"><div className="max-w-4xl mx-auto flex flex-wrap gap-3">
        <Link href="/departamentos-centro-rosario" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700">Centro</Link>
        <Link href="/departamentos-abasto" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700">Abasto</Link>
        <Link href="/departamentos-pichincha" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700">Pichincha</Link>
      </div></section>
    </div>
  )
}
