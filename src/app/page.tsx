import { MapPin, Building2, ArrowRight, Maximize2, Home as HomeIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import HeroVideo from '@/components/HeroVideo'
import ShareCardButton from '@/components/ShareCardButton'
import {
  getFeaturedProperties,
  getPropertyById,
  generatePropertySlug,
  getMainPhoto,
  formatPrice,
  getOperationType,
  getRoofedArea,
  getLotSurface,
  isLand,
  translatePropertyType,
  type TokkoProperty,
} from '@/lib/tokko'
import {
  getDevelopments,
  generateDevSlug,
  getDevMainPhoto,
  getConstructionStatus,
  translateDevType,
} from '@/lib/developments'

// ─── Featured Properties Section ─────────────────────────────────────────────

async function FeaturedPropertiesSection() {
  let properties: TokkoProperty[] = []
  try {
    properties = await getFeaturedProperties(6)
  } catch {
    return null
  }

  if (!properties || properties.length === 0) return null

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-brand-600 text-sm font-bold tracking-widest uppercase mb-3">
            PROPIEDADES DESTACADAS
          </p>
          <h2 className="text-3xl font-black text-gray-900">
            Propiedades destacadas
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(property => {
            const slug = generatePropertySlug(property)
            const photo = getMainPhoto(property)
            const price = formatPrice(property)
            const operation = getOperationType(property)
            const roofed = getRoofedArea(property)
            const lot = getLotSurface(property)
            const land = isLand(property)

            return (
              <div
                key={property.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 group relative"
              >
                <Link href={`/propiedades/${slug}`} className="block">
                  {/* Photo */}
                  <div className="relative h-52 overflow-hidden bg-gray-100">
                    {photo ? (
                      <Image
                        src={photo}
                        alt={property.publication_title || property.address}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">Sin foto</span>
                      </div>
                    )}
                    {operation && (
                      <span className={`absolute top-3 left-3 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        operation === 'Venta' ? 'bg-gray-900/80' : 'bg-brand-600/80'
                      }`}>
                        {operation}
                      </span>
                    )}
                    {property.is_starred_on_web && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold rounded bg-amber-400/90 text-gray-900 uppercase tracking-wide">
                        Destacada
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4">
                    {property.type?.name && (
                      <p className="text-brand-600 text-[10px] font-bold uppercase tracking-widest mb-1">
                        {translatePropertyType(property.type.name)}
                      </p>
                    )}
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-2">
                      {property.publication_title || property.address}
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-brand-600 font-black text-lg font-numeric">{price}</p>
                      <ShareCardButton slug={slug} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-1">
                      {land ? (
                        lot != null && lot > 0 && (
                          <span className="flex items-center gap-0.5"><Maximize2 className="w-3 h-3" /><span className="font-numeric">{lot}</span> m² lote</span>
                        )
                      ) : (
                        <>
                          {roofed != null && roofed > 0 && (
                            <span className="flex items-center gap-0.5"><HomeIcon className="w-3 h-3" /><span className="font-numeric">{roofed}</span> m² cub.</span>
                          )}
                          {lot != null && lot > 0 && lot !== roofed && (
                            <span className="flex items-center gap-0.5"><Maximize2 className="w-3 h-3" /><span className="font-numeric">{lot}</span> m² lote</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>

        {/* View all link */}
        <div className="text-center mt-10">
          <Link
            href="/propiedades"
            className="inline-flex items-center gap-2 border-2 border-brand-600 text-brand-600 hover:bg-brand-600 hover:text-white px-6 py-3 rounded-full font-semibold text-sm transition-all"
          >
            Ver todas las propiedades
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── Developments Section ────────────────────────────────────────────────────

async function DevelopmentsSection() {
  const [devsRaw, hausingProp] = await Promise.all([
    getDevelopments().catch(() => []),
    getPropertyById(7875941).catch(() => null),
  ])
  let devs = devsRaw
  if (devs.length === 0) return null
  devs = devs.slice(0, 3)
  const hausingPhoto = hausingProp ? getMainPhoto(hausingProp) : null

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-brand-600 text-sm font-bold tracking-widest uppercase mb-3">
            Inversión y Desarrollo
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900">Emprendimientos</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card Hausing */}
          <Link
            href="/hausing"
            className="group bg-[#0D3320] rounded-xl overflow-hidden shadow-sm hover:shadow-xl border border-green-900 transition-all flex flex-col"
          >
            <div className="relative h-52 bg-gray-900 overflow-hidden">
              {hausingPhoto ? (
                <Image
                  src={hausingPhoto}
                  alt="Hausing - Casas de diseño en Funes"
                  fill
                  className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">HAUSING</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-green-500 text-black uppercase">Casas Premium</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-white/10 text-white uppercase border border-white/20">Funes</span>
              </div>
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
                  <span className="text-black font-black text-[10px]">H</span>
                </div>
                <span className="text-white font-bold text-xs tracking-widest">HAUSING</span>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col bg-[#0D3320]">
              <h3 className="text-lg font-black text-white mb-1 group-hover:text-green-400 transition-colors">Hausing — Casas de Diseño</h3>
              <div className="flex items-center gap-1 text-gray-400 text-xs mb-2">
                <MapPin className="w-3 h-3 text-green-500" />
                Vida, Cadaques, Don Mateo · Funes
              </div>
              <p className="text-green-500 text-xs font-semibold bg-green-500/10 px-2 py-1 rounded inline-block mb-2 border border-green-500/20">
                6 propiedades disponibles · desde USD 380K
              </p>
              <span className="mt-auto inline-flex items-center gap-1 text-green-400 text-sm font-semibold group-hover:gap-2 transition-all pt-2">
                Ver propiedades <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
          {devs.map(dev => {
            const photo = getDevMainPhoto(dev)
            const slug = generateDevSlug(dev)
            const status = getConstructionStatus(dev.construction_status)
            const typeName = translateDevType(dev.type?.name || '')

            return (
              <Link
                key={dev.id}
                href={`/emprendimientos/${slug}`}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition-all flex flex-col"
              >
                <div className="relative h-52 bg-gray-100 overflow-hidden">
                  {photo ? (
                    <Image
                      src={photo}
                      alt={dev.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-brand-600/90 text-white uppercase">{typeName}</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-white/90 text-brand-700 uppercase">{status}</span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-black text-gray-900 mb-1 group-hover:text-brand-600 transition-colors">{dev.name}</h3>
                  <div className="flex items-center gap-1 text-gray-500 text-xs mb-2">
                    <MapPin className="w-3 h-3 text-brand-500" />
                    {dev.location?.name || dev.address}
                  </div>
                  {dev.financing_details && (
                    <p className="text-brand-700 text-xs font-semibold bg-brand-50 px-2 py-1 rounded inline-block mb-2">
                      {dev.financing_details}
                    </p>
                  )}
                  <span className="mt-auto inline-flex items-center gap-1 text-brand-600 text-sm font-semibold group-hover:gap-2 transition-all pt-2">
                    Ver más <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/emprendimientos"
            className="inline-flex items-center gap-2 border-2 border-brand-600 text-brand-600 hover:bg-brand-600 hover:text-white px-6 py-3 rounded-full font-semibold text-sm transition-all"
          >
            Ver todos los emprendimientos
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export const metadata = {
  title: 'SI Inmobiliaria | Venta y Alquiler en Roldán, Funes y Rosario - Desde 1983',
  description: 'Inmobiliaria familiar con más de 40 años en Roldán, Funes y Rosario. Casas, departamentos, terrenos, emprendimientos. Tasaciones profesionales.',
  openGraph: {
    title: 'SI Inmobiliaria | Venta y Alquiler - Desde 1983',
    description: 'Más de 40 años en el mercado inmobiliario de Roldán, Funes y Rosario.',
    url: 'https://siinmobiliaria.com',
  },
}

// ─── Home Page ────────────────────────────────────────────────────────────────

const homeJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: 'SI Inmobiliaria',
  url: 'https://siinmobiliaria.com',
  logo: 'https://siinmobiliaria.com/logo.png',
  foundingDate: '1983',
  telephone: '+54-341-210-1694',
  description: 'Inmobiliaria familiar con más de 40 años de experiencia en Roldán, Funes y Rosario.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '1ro de Mayo 258',
    addressLocality: 'Roldán',
    addressRegion: 'Santa Fe',
    addressCountry: 'AR',
  },
  areaServed: ['Roldán', 'Funes', 'Rosario', 'Fisherton'],
}

export default async function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }} />

      {/* Hero with YouTube background */}
      <HeroVideo />

      {/* Featured properties */}
      <FeaturedPropertiesSection />

      {/* Emprendimientos */}
      <DevelopmentsSection />

      {/* SEO content block */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1A5C38] mb-6" style={{fontFamily: 'Raleway, sans-serif'}}>
            Tu inmobiliaria de confianza desde 1983
          </h2>
          <div className="text-gray-600 space-y-4 text-base leading-relaxed" style={{fontFamily: 'Raleway, sans-serif'}}>
            <p>SI Inmobiliaria es una agencia inmobiliaria familiar con más de 40 años de trayectoria en el mercado de Rosario zona oeste. Fundada en 1983, acompañamos a cientos de familias y empresas en la compra, venta y alquiler de propiedades en Funes, Roldán, Fisherton y toda la región metropolitana de Rosario.</p>
            <p>Nuestras oficinas en Funes (Hipólito Yrigoyen 2643) y Roldán (1ro de Mayo 258 y Catamarca 775) nos permiten estar presentes donde el mercado inmobiliario crece con más fuerza. Funes y Roldán son hoy dos de los municipios con mayor demanda de propiedades en la provincia de Santa Fe, con barrios privados, lotes y casas que ofrecen calidad de vida a minutos de Rosario.</p>
            <p>Trabajamos con propiedades de todo tipo: casas, departamentos, lotes, locales comerciales y emprendimientos. Nuestro equipo de corredores matriculados te asesora en cada etapa del proceso, desde la tasación hasta la escrituración, garantizando transparencia y seguridad en cada operación.</p>
            <p>Si estás buscando propiedades en venta en Funes, casas en Roldán, lotes en barrios privados o inmuebles para inversión en Rosario zona oeste, SI Inmobiliaria es tu aliado de confianza. Consultanos sin compromiso.</p>
          </div>
        </div>
      </section>
    </>
  )
}
