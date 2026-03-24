import { MapPin, Building2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import HeroVideo from '@/components/HeroVideo'
import {
  getFeaturedProperties,
  generatePropertySlug,
  getMainPhoto,
  formatPrice,
  getOperationType,
  getTotalSurface,
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
            Encontrá tu próximo hogar
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(property => {
            const slug = generatePropertySlug(property)
            const photo = getMainPhoto(property)
            const price = formatPrice(property)
            const operation = getOperationType(property)
            const area = getTotalSurface(property)

            return (
              <Link
                key={property.id}
                href={`/propiedades/${slug}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 group cursor-pointer block"
              >
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
                  <p className="text-brand-600 font-black text-lg font-numeric">{price}</p>
                  {area != null && area > 0 && (
                    <p className="text-gray-500 text-xs mt-1 font-numeric">{area} m²</p>
                  )}
                </div>
              </Link>
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
  let devs = await getDevelopments().catch(() => [])
  if (devs.length === 0) return null
  devs = devs.slice(0, 3)

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

// ─── Home Page ────────────────────────────────────────────────────────────────

export default async function Home() {
  return (
    <>
      {/* Hero with YouTube background */}
      <HeroVideo />

      {/* Featured properties */}
      <FeaturedPropertiesSection />

      {/* Emprendimientos */}
      <DevelopmentsSection />

      {/* Stats bar removed — now in /nosotros */}
    </>
  )
}
