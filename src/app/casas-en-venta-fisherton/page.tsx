import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getProperties, type TokkoProperty, getMainPhoto, formatPrice, generatePropertySlug, getRoofedArea } from '@/lib/tokko'

export const revalidate = 21600

export const metadata: Metadata = {
  title: 'Casas en venta en Fisherton | Precios y fotos | SI Inmobiliaria',
  description: 'Casas en venta en Fisherton, Rosario. Green Village, Palos Verdes, Aldea. Zona residencial premium. Precios, fotos, m² y dormitorios. SI Inmobiliaria.',
  keywords: 'casas en venta fisherton, casas fisherton, fisherton rosario casas, propiedades fisherton',
  alternates: { canonical: 'https://siinmobiliaria.com/casas-en-venta-fisherton' },
  openGraph: { title: 'Casas en venta en Fisherton', description: 'Casas en la zona premium de Rosario.', url: 'https://siinmobiliaria.com/casas-en-venta-fisherton' },
}

function filter(props: TokkoProperty[]): TokkoProperty[] {
  return props.filter(p => {
    const loc = `${p.location?.short_location ?? ''} ${p.location?.name ?? ''} ${p.fake_address ?? ''} ${p.address ?? ''}`.toLowerCase()
    const match = loc.includes('fisherton') || loc.includes('aldea')
    const isCasa = (p.type?.name?.toLowerCase() ?? '').includes('casa') || (p.type?.name?.toLowerCase() ?? '').includes('house')
    const isVenta = p.operations?.[0]?.operation_type === 'Sale'
    return match && isCasa && isVenta
  })
}

export default async function Page() {
  let properties: TokkoProperty[] = []
  try { const d = await getProperties(); properties = filter(d.objects ?? []) } catch {}

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-[#1A5C38] to-[#0F3A23] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight" style={{ fontFamily: 'var(--font-raleway)' }}>Casas en venta en Fisherton</h1>
          <p className="text-green-100 text-lg" style={{ fontFamily: 'var(--font-poppins)' }}>{properties.length} casas en la zona residencial premium de Rosario.</p>
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
          {properties.length === 0 && <p className="col-span-full text-center text-gray-500 py-12">No hay casas disponibles en Fisherton. Consultanos por WhatsApp.</p>}
        </div>
      </section>

      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: 'var(--font-raleway)' }}>Vivir en Fisherton</h2>
          <p>Fisherton es el barrio residencial más buscado de Rosario. Calles arboladas, casas amplias con jardín, cercanía al Jockey Club y al Golf Club, y acceso directo a Funes en 10 minutos. Las casas van desde USD 150.000 en zona abierta hasta más de USD 500.000 en countries como Green Village o Palos Verdes.</p>
          <p>En <strong>SI Inmobiliaria</strong> trabajamos la zona de Fisherton con el mismo conocimiento profundo que nos distingue en Funes y Roldán. Te asesoramos sobre cada cuadra y cada barrio.</p>
        </div>
      </section>

      <section className="py-12 px-4 bg-[#1A5C38] text-center text-white">
        <h2 className="text-2xl font-black mb-4" style={{ fontFamily: 'var(--font-raleway)' }}>¿Buscás casa en Fisherton?</h2>
        <a href="https://wa.me/5493412101694?text=Hola!%20Busco%20casa%20en%20Fisherton" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-[#25D366] text-white font-bold rounded-xl inline-block">WhatsApp</a>
      </section>

      <section className="py-8 px-4 border-t"><div className="max-w-4xl mx-auto flex flex-wrap gap-3">
        <Link href="/inmobiliaria-fisherton" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700">Inmobiliaria en Fisherton</Link>
        <Link href="/casas-en-venta-funes" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700">Casas en Funes</Link>
        <Link href="/casas-en-venta-roldan" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700">Casas en Roldán</Link>
      </div></section>
    </div>
  )
}
