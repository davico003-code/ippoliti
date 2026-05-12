import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getProperties, type TokkoProperty, getMainPhoto, formatPrice, generatePropertySlug, getLotSurface } from '@/lib/tokko'

export const revalidate = 21600

export const metadata: Metadata = {
  title: 'Terrenos en Funes | Lotes en venta | SI Inmobiliaria',
  description: 'Terrenos y lotes en venta en Funes, Santa Fe. Funes Hills, Kentucky, Portal de Funes. Desde USD 40.000. Fotos, medidas y financiación. SI Inmobiliaria.',
  keywords: 'terrenos funes, lotes funes, terrenos en venta funes, lotes en venta funes santa fe',
  alternates: { canonical: 'https://siinmobiliaria.com/terrenos-funes' },
  openGraph: { title: 'Terrenos en Funes', description: 'Lotes en venta en los mejores barrios de Funes. Desde USD 40.000.', url: 'https://siinmobiliaria.com/terrenos-funes' },
}

function filter(props: TokkoProperty[]): TokkoProperty[] {
  return props.filter(p => {
    const loc = `${p.location?.short_location ?? ''} ${p.location?.name ?? ''} ${p.fake_address ?? ''} ${p.address ?? ''}`.toLowerCase()
    const isFunes = loc.includes('funes')
    const t = (p.type?.name?.toLowerCase() ?? '')
    const isTerreno = t.includes('terreno') || t.includes('land') || t.includes('countryside')
    const isVenta = p.operations?.[0]?.operation_type === 'Sale'
    return isFunes && isTerreno && isVenta
  })
}

export default async function Page() {
  let properties: TokkoProperty[] = []
  try { const d = await getProperties(); properties = filter(d.objects ?? []) } catch {}

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-[#1A5C38] to-[#0F3A23] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight" style={{ fontFamily: 'var(--font-raleway)' }}>Terrenos en Funes</h1>
          <p className="text-green-100 text-lg" style={{ fontFamily: 'var(--font-poppins)' }}>{properties.length} lotes disponibles. Desde USD 40.000.</p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map(p => { const photo = getMainPhoto(p); const lot = getLotSurface(p); return (
            <Link key={p.id} href={`/propiedades/${generatePropertySlug(p)}`} className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all">
              <div className="relative h-48 bg-gray-100">{photo && <Image src={photo} alt={p.publication_title || p.address} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="25vw" />}</div>
              <div className="p-4">
                <p className="text-xl font-black text-gray-900 font-numeric mb-1">{formatPrice(p)}</p>
                {lot && <p className="text-sm text-gray-600 mb-1 font-numeric">{lot.toLocaleString('es-AR')} m²</p>}
                <p className="text-sm text-gray-500 truncate">{p.fake_address || p.address}</p>
              </div>
            </Link>
          )})}
          {properties.length === 0 && <p className="col-span-full text-center text-gray-500 py-12">No hay terrenos disponibles. Consultanos por WhatsApp.</p>}
        </div>
      </section>

      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: 'var(--font-raleway)' }}>Invertir en terrenos en Funes</h2>
          <p>Los terrenos en Funes son una de las inversiones más seguras de la zona. Desde USD 40.000 en loteos nuevos hasta USD 150.000 en barrios premium, la valorización sostenida hace que comprar hoy sea una decisión inteligente.</p>
          <p>En <strong>SI Inmobiliaria</strong> te asesoramos sobre orientación, servicios disponibles, aptitud constructiva y proyección de cada zona. Más de 40 años vendiendo terrenos en Funes nos respaldan.</p>
        </div>
      </section>

      <section className="py-12 px-4 bg-[#1A5C38] text-center text-white">
        <h2 className="text-2xl font-black mb-4" style={{ fontFamily: 'var(--font-raleway)' }}>¿Buscás terreno en Funes?</h2>
        <a href="https://wa.me/5493412101694?text=Hola!%20Busco%20terreno%20en%20Funes" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-[#25D366] text-white font-bold rounded-xl inline-block">WhatsApp</a>
      </section>

      <section className="py-8 px-4 border-t"><div className="max-w-4xl mx-auto flex flex-wrap gap-3">
        <Link href="/inmobiliaria-funes" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700">Inmobiliaria en Funes</Link>
        <Link href="/casas-en-venta-funes" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700">Casas en Funes</Link>
        <Link href="/terrenos-roldan" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700">Terrenos en Roldán</Link>
      </div></section>
    </div>
  )
}
