export const revalidate = 21600

import Link from 'next/link'
import Image from 'next/image'
import HeroVideo from '@/components/HeroVideo'
import EmprendimientosHome from '@/components/EmprendimientosHome'
import HorizontalCarousel from '@/components/HorizontalCarousel'
import HeroMobile from '@/components/home/HeroMobile'
import SeleccionCarousel from '@/components/home/SeleccionCarousel'
import ProyectosCarousel from '@/components/home/ProyectosCarousel'
import GuiaSection from '@/components/home/GuiaSection'
import ConfianzaSection from '@/components/home/ConfianzaSection'
import FooterMobile from '@/components/home/FooterMobile'
import GuiaDesktop from '@/components/home/GuiaDesktop'
import ConfianzaDesktop from '@/components/home/ConfianzaDesktop'
import HomeContentSections from '@/components/home/HomeContentSections'
import {
  getFeaturedProperties,
  generatePropertySlug,
  getMainPhoto,
  formatPrice,
  getOperationType,
  getRoofedArea,
  getLotSurface,
  isLand,
  type TokkoProperty,
} from '@/lib/tokko'

const RALEWAY = "var(--font-raleway), 'Raleway', system-ui, sans-serif"
const POPPINS = "var(--font-poppins), 'Poppins', system-ui, sans-serif"

// ─── Featured Properties Section ─────────────────────────────────────────────

async function FeaturedPropertiesSection() {
  let properties: TokkoProperty[] = []
  try {
    properties = await getFeaturedProperties(6)
  } catch {
    return null
  }
  if (!properties || properties.length === 0) return null

  const renderCard = (property: TokkoProperty) => {
    const slug = generatePropertySlug(property)
    const photo = getMainPhoto(property)
    const price = formatPrice(property)
    const operation = getOperationType(property)
    const roofed = getRoofedArea(property)
    const land = isLand(property)
    const beds = property.suite_amount ?? property.room_amount
    const baths = property.bathroom_amount
    const address = property.fake_address || property.address
    const location = property.location?.short_location || property.location?.name || ''
    const specs: { num: string; unit: string }[] = []
    if (!land && beds != null && beds > 0) specs.push({ num: String(beds), unit: ' dorm' })
    if (!land && baths != null && baths > 0) specs.push({ num: String(baths), unit: ` baño${baths > 1 ? 's' : ''}` })
    if (roofed != null && roofed > 0) specs.push({ num: String(roofed), unit: ' m²' })
    if (land) { const lot = getLotSurface(property); if (lot != null && lot > 0) specs.push({ num: lot.toLocaleString('es-AR'), unit: ' m²' }) }

    return (
      <Link
        key={property.id}
        href={`/propiedades/${slug}`}
        className="prop-card block overflow-hidden flex-shrink-0 snap-start rounded-xl bg-white border-0"
        style={{
          textDecoration: 'none',
          width: 'clamp(300px, 88vw, 380px)',
          minWidth: 300,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06)',
          transition: 'box-shadow 200ms',
        }}
      >
        <div className="relative w-full bg-gray-100 overflow-hidden" style={{ aspectRatio: '16 / 9' }}>
          {photo ? (
            <Image src={photo} alt={property.publication_title || address} fill
              className="object-cover prop-card-img" sizes="340px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">Sin foto</div>
          )}
          {operation && (
            <span style={{
              position: 'absolute', top: 10, left: 10,
              background: operation === 'Venta' ? '#E53E3E' : '#2563eb',
              color: '#fff', fontFamily: POPPINS, fontWeight: 700, fontSize: 11,
              textTransform: 'uppercase', padding: '3px 10px', borderRadius: 6,
            }}>
              {operation}
            </span>
          )}
        </div>
        <div style={{ padding: '10px 14px' }}>
          <p style={{ fontFamily: POPPINS, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: '#1d1d1f', margin: '0 0 4px', lineHeight: 1.2, fontSize: 22 }}>
            {price}
          </p>
          {specs.length > 0 && (
            <p style={{ fontFamily: POPPINS, fontSize: 14, color: '#1d1d1f', margin: '0 0 4px', fontWeight: 400 }}>
              {specs.map((s, i) => (
                <span key={i}>
                  {i > 0 && ' · '}
                  <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{s.num}</span>
                  {s.unit}
                </span>
              ))}
            </p>
          )}
          <p style={{ fontFamily: POPPINS, fontSize: 13, color: '#767676', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
            {address}{location ? `, ${location}` : ''}
          </p>
        </div>
      </Link>
    )
  }

  return (
    <section className="home-section bg-white" style={{ padding: 0 }}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-4 pb-4 md:pt-6 md:pb-6">
        {/* Header row */}
        <div className="flex items-end justify-between">
          <h2 className="text-2xl md:text-3xl tracking-tight" style={{ fontFamily: RALEWAY, fontWeight: 800, color: '#111827', lineHeight: 1.2, margin: 0 }}>
            Nuestra selección
          </h2>
        </div>
        <p className="text-sm text-gray-500 mb-4 mt-1" style={{ fontFamily: RALEWAY }}>
          Elegidas con criterio, no por algoritmo.
        </p>

        {/* Carousel */}
        <HorizontalCarousel>
          {properties.map(p => renderCard(p))}
          <Link
            href="/propiedades"
            className="flex-shrink-0 self-center snap-start flex items-center justify-center rounded-full border-2 border-[#1A5C38] bg-white px-7 py-3.5 font-semibold text-sm text-[#1A5C38] hover:bg-[#1A5C38] hover:text-white transition-colors duration-200"
            style={{
              fontFamily: RALEWAY,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06)',
            }}
          >
            Ver todas →
          </Link>
        </HorizontalCarousel>
      </div>
    </section>
  )
}




// ─── Metadata ────────────────────────────────────────────────────────────────

export const metadata = {
  title: 'SI Inmobiliaria · Propiedades en Funes, Roldán y Rosario',
  description:
    'Inmobiliaria familiar fundada en 1983. Casas, departamentos, terrenos y emprendimientos en Funes, Roldán y Rosario. Tasaciones profesionales en 24 horas.',
  alternates: { canonical: 'https://siinmobiliaria.com' },
  openGraph: {
    title: 'SI Inmobiliaria · Propiedades en Funes, Roldán y Rosario',
    description:
      'Inmobiliaria familiar desde 1983. Casas, departamentos y terrenos en Funes, Roldán y Rosario.',
    url: 'https://siinmobiliaria.com',
    images: ['/og-image.jpg'],
  },
}

// El JSON-LD RealEstateAgent/LocalBusiness global vive en app/layout.tsx
// (más completo, con founder, areaServed expandido y sameAs de todas las
// redes). Evitamos duplicarlo acá. El FAQPage JSON-LD lo emite
// HomeContentSections inline junto con las preguntas.

// ─── Home Page ────────────────────────────────────────────────────────────────

export default async function Home() {
  return (
    <>
      {/* ═══ MOBILE (<md) — Nuevo diseño Zillow-style ═══ */}
      <div className="md:hidden">
        <HeroMobile />
        <SeleccionCarousel />
        <ProyectosCarousel />
        <GuiaSection />
        <ConfianzaSection />
      </div>

      {/* ═══ DESKTOP (md+) — Layout existente ═══ */}
      <div className="hidden md:block">
        <style>{`
          @media (hover: hover) {
            .prop-card:hover { box-shadow: 0 2px 6px rgba(0,0,0,0.10), 0 8px 20px rgba(0,0,0,0.08) !important; }
            .prop-card:hover .prop-card-img { transform: scale(1.05); }
          }
          .prop-card-img { transition: transform 400ms ease-out; }
          .prop-card { transition: box-shadow 300ms, transform 300ms; }
          .home-section { padding: 32px 24px; }
          .nosotros-grid { gap: 56px; }
          @media (max-width: 1024px) {
            .home-grid-3 { grid-template-columns: repeat(2, 1fr) !important; }
            .nosotros-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
          }
        `}</style>

        <HeroVideo />
        <FeaturedPropertiesSection />
        <EmprendimientosHome />
        <GuiaDesktop />
        <ConfianzaDesktop />
      </div>

      {/* ═══ SECCIONES COMUNES (mobile + desktop) ═══
       * Copy editorial indexable (zonas, por qué, servicios, FAQ).
       * Responsive — sin duplicarse entre layouts. El FooterMobile
       * del wrapper mobile queda al final porque el FooterWrapper
       * global no se monta sobre el "/" en mobile. */}
      <HomeContentSections />

      <div className="md:hidden">
        <FooterMobile />
      </div>
    </>
  )
}
