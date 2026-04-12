import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getProperties, type TokkoProperty, getMainPhoto, formatPrice, generatePropertySlug, getLotSurface } from '@/lib/tokko'

export const revalidate = 21600

export const metadata: Metadata = {
  title: 'Terrenos en Roldán | Lotes desde USD 25.000 | SI Inmobiliaria',
  description: 'Terrenos y lotes en venta en Roldán. Desde USD 25.000 con financiación. Valorización 15-20% anual. Los Aromos, El Molino, Tierra de Sueños. SI Inmobiliaria.',
  keywords: 'terrenos roldan, lotes roldan, terrenos en venta roldan, lotes en venta roldan santa fe',
  alternates: { canonical: 'https://siinmobiliaria.com/terrenos-roldan' },
  openGraph: { title: 'Terrenos en Roldán', description: 'Lotes desde USD 25.000 con valorización 15-20% anual.', url: 'https://siinmobiliaria.com/terrenos-roldan' },
}

function filter(props: TokkoProperty[]): TokkoProperty[] {
  return props.filter(p => {
    const loc = `${p.location?.short_location ?? ''} ${p.location?.name ?? ''} ${p.fake_address ?? ''} ${p.address ?? ''}`.toLowerCase()
    const isRoldan = loc.includes('roldan') || loc.includes('roldán')
    const t = (p.type?.name?.toLowerCase() ?? '')
    const isTerreno = t.includes('terreno') || t.includes('land') || t.includes('countryside')
    const isVenta = p.operations?.[0]?.operation_type === 'Sale'
    return isRoldan && isTerreno && isVenta
  })
}

export default async function Page() {
  let properties: TokkoProperty[] = []
  try { const d = await getProperties(); properties = filter(d.objects ?? []) } catch {}

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-[#1A5C38] to-[#0F3A23] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight" style={{ fontFamily: 'var(--font-raleway)' }}>Terrenos en Roldán</h1>
          <p className="text-green-100 text-lg" style={{ fontFamily: 'var(--font-poppins)' }}>{properties.length} lotes disponibles. Desde USD 25.000 con financiación.</p>
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
          <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: 'var(--font-raleway)' }}>¿Por qué comprar un terreno en Roldán?</h2>
          <p>Roldán es la mejor oportunidad de inversión en terrenos del Gran Rosario. Con precios desde USD 25.000 y una valorización del 15-20% anual sostenido, comprar hoy es asegurar tu patrimonio.</p>
          <p>Muchos desarrollos ofrecen <strong>financiación directa</strong> en pesos o dólares, lo que facilita el acceso. Los barrios más buscados son Los Aromos, El Molino, Tierra de Sueños y Don Mateo.</p>
          <p>En <strong>SI Inmobiliaria</strong> evaluamos cada lote: orientación, servicios, aptitud constructiva y proyección del barrio. Con 2 oficinas en Roldán, somos la inmobiliaria que mejor conoce el mercado local.</p>
        </div>
      </section>

      <section className="py-12 px-4 bg-[#1A5C38] text-center text-white">
        <h2 className="text-2xl font-black mb-4" style={{ fontFamily: 'var(--font-raleway)' }}>¿Buscás terreno en Roldán?</h2>
        <a href="https://wa.me/5493412101694?text=Hola!%20Busco%20terreno%20en%20Roldán" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-[#25D366] text-white font-bold rounded-xl inline-block">WhatsApp</a>
      </section>

      <section className="py-8 px-4 border-t"><div className="max-w-4xl mx-auto flex flex-wrap gap-3">
        <Link href="/inmobiliaria-roldan" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700">Inmobiliaria en Roldán</Link>
        <Link href="/casas-en-venta-roldan" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700">Casas en Roldán</Link>
        <Link href="/terrenos-funes" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700">Terrenos en Funes</Link>
      </div></section>
    </div>
  )
}
