export const revalidate = 21600

import { MapPin, Building2, ArrowRight, Maximize2, Home as HomeIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import HeroVideo from '@/components/HeroVideo'
import GuiaSection from '@/components/GuiaSection'
import TrayectoriaSection from '@/components/TrayectoriaSection'
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
                      <ShareCardButton slug={slug} title={property.publication_title || property.address} price={price} />
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
  title: 'SI Inmobiliaria · Propiedades en Funes, Roldán y Rosario',
  description:
    'Inmobiliaria familiar fundada en 1983. Casas, departamentos, terrenos y emprendimientos en Funes, Roldán y Rosario. Tasaciones profesionales en 24 horas.',
  openGraph: {
    title: 'SI Inmobiliaria · Propiedades en Funes, Roldán y Rosario',
    description:
      'Inmobiliaria familiar desde 1983. Casas, departamentos y terrenos en Funes, Roldán y Rosario.',
    url: 'https://siinmobiliaria.com',
    images: ['/og-image.jpg'],
  },
}

// ─── Home Page ────────────────────────────────────────────────────────────────

const homeJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: 'SI Inmobiliaria',
  image: 'https://siinmobiliaria.com/logo.png',
  url: 'https://siinmobiliaria.com',
  logo: 'https://siinmobiliaria.com/logo.png',
  telephone: '+5493412101694',
  foundingDate: '1983',
  founder: 'Susana Ippoliti',
  description: 'Inmobiliaria familiar con más de 40 años de experiencia en Roldán, Funes y Rosario.',
  address: [
    {
      '@type': 'PostalAddress',
      streetAddress: 'Hipólito Yrigoyen 2643',
      addressLocality: 'Funes',
      addressRegion: 'Santa Fe',
      addressCountry: 'AR',
    },
    {
      '@type': 'PostalAddress',
      streetAddress: '1ro de Mayo 258',
      addressLocality: 'Roldán',
      addressRegion: 'Santa Fe',
      addressCountry: 'AR',
    },
    {
      '@type': 'PostalAddress',
      streetAddress: 'Catamarca 775',
      addressLocality: 'Roldán',
      addressRegion: 'Santa Fe',
      addressCountry: 'AR',
    },
  ],
  sameAs: ['https://www.instagram.com/inmobiliaria.si'],
  areaServed: ['Roldán', 'Funes', 'Rosario', 'Fisherton'],
}

const PORQUE_ITEMS = [
  { num: '43', desc: 'Años en el mercado inmobiliario de Funes, Roldán y Rosario.' },
  { num: '14', desc: 'Personas en el equipo entre asesores, administración y dirección.' },
  { num: '3', desc: 'Sedes físicas en Funes, Roldán centro y Roldán este.' },
  { num: '20K+', desc: 'Seguidores en Instagram @inmobiliaria.si construyendo comunidad local.' },
  { num: '4K', desc: 'Fotografía aérea profesional con drone DJI Mavic 4 Pro en cada propiedad.' },
  { num: 'AI', desc: 'Campañas Meta Ads e inteligencia artificial para encontrar al comprador indicado.' },
]

function PorQueElegirnosSection() {
  return (
    <section
      style={{
        background: '#fafaf8',
        padding: '120px 64px',
      }}
      className="porque-section"
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div
          style={{
            fontFamily: "'Poppins', system-ui, sans-serif",
            fontWeight: 500,
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.22em',
            color: '#1A5C38',
            marginBottom: 18,
          }}
        >
          Por qué elegirnos
        </div>
        <h2
          className="porque-title"
          style={{
            fontFamily: "'Raleway', system-ui, sans-serif",
            fontWeight: 300,
            fontSize: 44,
            letterSpacing: '-0.035em',
            lineHeight: 1.08,
            color: '#1d1d1f',
            maxWidth: 620,
            margin: '0 0 72px',
          }}
        >
          Datos reales, no estimaciones.
        </h2>
        <div
          className="porque-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 40,
          }}
        >
          {PORQUE_ITEMS.map(item => (
            <div
              key={item.num + item.desc}
              style={{
                paddingTop: 18,
                borderTop: '1px solid #e0e0dc',
              }}
            >
              <div
                style={{
                  fontFamily: "'Poppins', system-ui, sans-serif",
                  fontWeight: 500,
                  fontSize: 36,
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '-0.02em',
                  color: '#1d1d1f',
                  lineHeight: 1,
                  marginBottom: 10,
                }}
              >
                {item.num}
              </div>
              <p
                style={{
                  fontFamily: "'Poppins', system-ui, sans-serif",
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: '#4a4a48',
                  margin: 0,
                }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 1024px) {
          .porque-section { padding: 96px 32px !important; }
          .porque-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .porque-title { font-size: 36px !important; }
        }
        @media (max-width: 640px) {
          .porque-section { padding: 80px 24px !important; }
          .porque-grid { grid-template-columns: 1fr !important; }
          .porque-title { font-size: 30px !important; }
        }
      `}</style>
    </section>
  )
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

      {/* Guía del comprador */}
      <GuiaSection />

      {/* Trayectoria */}
      <TrayectoriaSection />

      {/* Por qué elegirnos */}
      <PorQueElegirnosSection />
    </>
  )
}
