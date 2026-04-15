export const revalidate = 21600

import Link from 'next/link'
import Image from 'next/image'
import HeroVideo from '@/components/HeroVideo'
import EmprendimientosHome from '@/components/EmprendimientosHome'
import HorizontalCarousel from '@/components/HorizontalCarousel'
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
const GREEN = '#1A5C38'

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
        <div className="relative w-full bg-gray-100 overflow-hidden" style={{ height: 'clamp(220px, 30vw, 260px)' }}>
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
        <div style={{ padding: 14 }}>
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


// ─── Guía Section ────────────────────────────────────────────────────────────

function GuiaHomeSection() {
  return (
    <section style={{ background: '#f9fafb', borderTop: '1px solid #f0f0f0' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16">
        <div className="max-w-2xl">
          <p style={{ fontFamily: POPPINS, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: GREEN, fontWeight: 600, margin: '0 0 12px' }}>
            GUÍA GRATUITA · 14 CAPÍTULOS
          </p>
          <h2 style={{ fontFamily: RALEWAY, fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 700, color: '#1d1d1f', lineHeight: 1.15, margin: '0 0 12px' }}>
            Comprá con <em style={{ fontStyle: 'italic', color: GREEN }}>inteligencia,</em> no con suerte.
          </h2>
          <p style={{ fontFamily: POPPINS, fontSize: 15, color: '#6b7280', lineHeight: 1.7, margin: '0 0 24px' }}>
            Todo lo que necesitás saber antes de comprar en Funes y Roldán. Sin letra chica, sin tiempo perdido.
          </p>
        </div>

        {/* Chapters grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { n: '01', t: 'Documentación y gastos ocultos', d: 'Escritura, impuestos, comisiones y todo lo que nadie te avisa.' },
            { n: '02', t: 'El mercado local al detalle', d: 'Precios reales, tendencias y zonas con mejor proyección.' },
            { n: '03', t: 'Negociar sin perder dinero', d: 'Estrategias probadas para cerrar al mejor precio.' },
          ].map(item => (
            <div key={item.n} style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e8e8e8' }}>
              <span style={{ fontFamily: POPPINS, fontSize: 28, fontWeight: 800, color: GREEN, lineHeight: 1, display: 'block', marginBottom: 8, fontVariantNumeric: 'tabular-nums' }}>{item.n}</span>
              <h3 style={{ fontFamily: RALEWAY, fontSize: 16, fontWeight: 700, color: '#1d1d1f', margin: '0 0 6px' }}>{item.t}</h3>
              <p style={{ fontFamily: POPPINS, fontSize: 13, color: '#6b7280', lineHeight: 1.5, margin: 0 }}>{item.d}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Link href="/guia-comprador" style={{
            display: 'inline-block', background: GREEN, color: '#fff',
            padding: '14px 32px', borderRadius: 12, fontFamily: POPPINS,
            fontSize: 15, fontWeight: 700, textDecoration: 'none',
          }}>
            Leer la guía — Es gratis →
          </Link>
          <span style={{ fontFamily: POPPINS, fontSize: 12, color: '#9ca3af' }}>
            Sin registro · Acceso inmediato · 14 capítulos
          </span>
        </div>
      </div>
    </section>
  )
}

// ─── Nosotros Section ────────────────────────────────────────────────────────

function NosotrosHomeSection() {
  return (
    <section className="home-px home-section" style={{ background: '#f5f5f7', padding: '80px 48px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="nosotros-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '100%', height: 380, borderRadius: 16, overflow: 'hidden' }}>
            <Image
              src="/LDS.jpg"
              alt="Susana Ippoliti, David Flores y Laura Flores — Equipo SI Inmobiliaria"
              fill
              style={{ objectFit: 'cover', objectPosition: 'top' }}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div>
            <p
              style={{
                fontFamily: POPPINS,
                fontSize: 10,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: GREEN,
                fontWeight: 600,
                margin: '0 0 12px',
              }}
            >
              DESDE 1983
            </p>
            <h2
              style={{
                fontFamily: RALEWAY,
                fontSize: 34,
                fontWeight: 300,
                color: '#1d1d1f',
                letterSpacing: '-0.5px',
                margin: '0 0 18px',
              }}
            >
              Tu inmobiliaria de confianza.
            </h2>
            <p
              style={{
                fontFamily: POPPINS,
                fontSize: 14,
                color: '#6e6e73',
                lineHeight: 1.7,
                margin: '0 0 32px',
              }}
            >
              Dos generaciones acompañando familias en Funes, Roldán y Rosario. Una empresa
              familiar fundada en 1983 que se piensa como un estudio.
            </p>
            <div className="nos-stats" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
              {[
                { num: '43', label: 'Años' },
                { num: '3', label: 'Oficinas' },
                { num: '20K+', label: 'Instagram' },
                { num: '14', label: 'Personas' },
              ].map(s => (
                <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                  <div
                    style={{
                      fontFamily: POPPINS,
                      fontSize: 26,
                      fontWeight: 700,
                      color: GREEN,
                      lineHeight: 1,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {s.num}
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontFamily: POPPINS,
                      fontSize: 10,
                      color: '#999',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/nosotros"
              style={{
                color: GREEN,
                fontFamily: POPPINS,
                fontSize: 13,
                fontWeight: 600,
                borderBottom: `1px solid ${GREEN}`,
                paddingBottom: 2,
                textDecoration: 'none',
              }}
            >
              Conocé nuestra historia →
            </Link>
          </div>
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
  alternates: { canonical: 'https://siinmobiliaria.com' },
  openGraph: {
    title: 'SI Inmobiliaria · Propiedades en Funes, Roldán y Rosario',
    description:
      'Inmobiliaria familiar desde 1983. Casas, departamentos y terrenos en Funes, Roldán y Rosario.',
    url: 'https://siinmobiliaria.com',
    images: ['/og-image.jpg'],
  },
}

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
    { '@type': 'PostalAddress', streetAddress: 'Hipólito Yrigoyen 2643', addressLocality: 'Funes', addressRegion: 'Santa Fe', addressCountry: 'AR' },
    { '@type': 'PostalAddress', streetAddress: '1ro de Mayo 258', addressLocality: 'Roldán', addressRegion: 'Santa Fe', addressCountry: 'AR' },
    { '@type': 'PostalAddress', streetAddress: 'Catamarca 775', addressLocality: 'Roldán', addressRegion: 'Santa Fe', addressCountry: 'AR' },
  ],
  sameAs: ['https://www.instagram.com/inmobiliaria.si'],
  areaServed: ['Roldán', 'Funes', 'Rosario', 'Fisherton'],
}

// ─── Home Page ────────────────────────────────────────────────────────────────

export default async function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }} />

      <style>{`
        @media (hover: hover) {
          .prop-card:hover { box-shadow: 0 2px 6px rgba(0,0,0,0.10), 0 8px 20px rgba(0,0,0,0.08) !important; }
          .prop-card:hover .prop-card-img { transform: scale(1.05); }
        }
        .prop-card-img { transition: transform 400ms ease-out; }
        .prop-card { transition: box-shadow 300ms, transform 300ms; }
        @media (max-width: 1024px) {
          .home-section { padding: 32px 24px !important; }
          .home-grid-3 { grid-template-columns: repeat(2, 1fr) !important; }
          .nosotros-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
          .guia-grid { flex-direction: column !important; }
        }
        @media (max-width: 640px) {
          .home-section { padding: 24px 16px !important; }
          .home-grid-3 { grid-template-columns: 1fr !important; gap: 12px !important; }
        }
      `}</style>

      <HeroVideo />
      <FeaturedPropertiesSection />
      <EmprendimientosHome />
      <GuiaHomeSection />
      <NosotrosHomeSection />
    </>
  )
}
