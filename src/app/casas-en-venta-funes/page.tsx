import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getProperties, type TokkoProperty, getMainPhoto, formatPrice, generatePropertySlug, getRoofedArea } from '@/lib/tokko'

export const revalidate = 21600

export const metadata: Metadata = {
  title: 'Casas en venta en Funes | Precios y fotos | SI Inmobiliaria',
  description: 'Casas en venta en Funes, Santa Fe. Funes Hills, Kentucky, Portal de Funes y más. Precios desde USD 150.000. Fotos, m², dormitorios. SI Inmobiliaria desde 1983.',
  keywords: 'casas en venta funes, casas funes, venta casas funes santa fe, casas en funes precios',
  alternates: { canonical: 'https://siinmobiliaria.com/casas-en-venta-funes' },
  openGraph: { title: 'Casas en venta en Funes', description: 'Encontrá tu casa en Funes. Precios, fotos y asesoramiento profesional.', url: 'https://siinmobiliaria.com/casas-en-venta-funes' },
}

function filter(props: TokkoProperty[]): TokkoProperty[] {
  return props.filter(p => {
    const loc = `${p.location?.short_location ?? ''} ${p.location?.name ?? ''} ${p.fake_address ?? ''} ${p.address ?? ''}`.toLowerCase()
    const isFunes = loc.includes('funes')
    const isCasa = (p.type?.name?.toLowerCase() ?? '').includes('casa') || (p.type?.name?.toLowerCase() ?? '').includes('house')
    const isVenta = p.operations?.[0]?.operation_type === 'Sale'
    return isFunes && isCasa && isVenta
  })
}

export default async function Page() {
  let properties: TokkoProperty[] = []
  try { const d = await getProperties(); properties = filter(d.objects ?? []) } catch {}

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-[#1A5C38] to-[#0F3A23] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight" style={{ fontFamily: 'var(--font-raleway)' }}>Casas en venta en Funes</h1>
          <p className="text-green-100 text-lg max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-poppins)' }}>{properties.length} casas disponibles en los mejores barrios de Funes. Desde USD 150.000.</p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          </div>
          {properties.length === 0 && <p className="text-center text-gray-500 py-12">No hay casas disponibles en este momento. Consultanos por WhatsApp.</p>}
        </div>
      </section>

      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: 'var(--font-raleway)' }}>Comprar una casa en Funes</h2>
          <p>Funes ofrece opciones para todos los perfiles: desde casas compactas en barrios abiertos (USD 150.000) hasta residencias premium en countries como Funes Hills o Kentucky (USD 400.000+). La mayoría de las casas cuentan con jardín, parrilla y cochera.</p>
          <p>En <strong>SI Inmobiliaria</strong> te asesoramos sobre la mejor relación precio-ubicación según tu presupuesto y estilo de vida. Nuestro equipo vive en Funes y conoce cada barrio en detalle.</p>
        </div>
      </section>

      <section className="py-12 px-4 bg-[#1A5C38] text-center text-white">
        <h2 className="text-2xl font-black mb-4" style={{ fontFamily: 'var(--font-raleway)' }}>¿Buscás casa en Funes?</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="https://wa.me/5493412101694?text=Hola!%20Busco%20casa%20en%20venta%20en%20Funes" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-[#25D366] text-white font-bold rounded-xl">WhatsApp</a>
          <Link href="/propiedades?location=funes" className="px-6 py-3 border-2 border-white text-white font-bold rounded-xl">Ver todas las propiedades</Link>
        </div>
      </section>

      <section className="py-8 px-4 border-t">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-3">
          <Link href="/inmobiliaria-funes" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700">Inmobiliaria en Funes</Link>
          <Link href="/terrenos-funes" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700">Terrenos en Funes</Link>
          <Link href="/casas-en-venta-roldan" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700">Casas en Roldán</Link>
        </div>
      </section>
    </div>
  )
}
