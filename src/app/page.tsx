export const revalidate = 21600

import { MapPin, Building2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import HeroVideo from '@/components/HeroVideo'
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

  return (
    <section className="home-section bg-white" style={{ padding: 0 }}>
      <div className="max-w-7xl mx-auto px-5 md:px-6 pt-12 pb-12 md:pt-20 md:pb-20">
        {/* Eyebrow */}
        <p style={{
          fontFamily: RALEWAY, fontWeight: 600, textTransform: 'uppercase',
          color: GREEN, letterSpacing: '0.2em', margin: 0,
          fontSize: 'clamp(11px, 1.2vw, 12px)', marginBottom: 'clamp(8px, 1vw, 12px)',
        }}>
          PROPIEDADES DESTACADAS
        </p>

        {/* Title */}
        <h2 style={{
          fontFamily: RALEWAY, fontWeight: 700, color: '#0a0a0a',
          lineHeight: 1.15, margin: 0,
          fontSize: 'clamp(26px, 3.5vw, 40px)', marginBottom: 'clamp(8px, 1vw, 12px)',
        }}>
          Propiedades destacadas en Funes, Roldán y Rosario
        </h2>

        {/* Subtitle */}
        <p style={{
          fontFamily: RALEWAY, fontWeight: 400, color: '#6b7280',
          lineHeight: 1.5, margin: 0,
          fontSize: 'clamp(14px, 1.5vw, 17px)', marginBottom: 'clamp(32px, 3vw, 48px)',
        }}>
          Una selección curada de las mejores oportunidades del momento
        </p>

        {/* Cards grid */}
        <div className="home-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {properties.map(property => {
            const slug = generatePropertySlug(property)
            const photo = getMainPhoto(property)
            const price = formatPrice(property)
            const operation = getOperationType(property)
            const roofed = getRoofedArea(property)
            const lot = getLotSurface(property)
            const land = isLand(property)
            const beds = property.suite_amount ?? property.room_amount
            const baths = property.bathroom_amount
            const typeName = translatePropertyType(property.type?.name)
            const address = property.fake_address || property.address
            const location = property.location?.short_location || property.location?.name || ''

            const specs: string[] = []
            if (!land && beds != null && beds > 0) specs.push(`${beds} dorm`)
            if (!land && baths != null && baths > 0) specs.push(`${baths} baño${baths > 1 ? 's' : ''}`)
            if (roofed != null && roofed > 0) specs.push(`${roofed} m²`)
            if (lot != null && lot > 0 && lot !== roofed) specs.push(`${lot.toLocaleString('es-AR')} m² lote`)
            if (land && lot != null && lot > 0 && specs.length === 0) specs.push(`${lot.toLocaleString('es-AR')} m²`)

            return (
              <Link
                key={property.id}
                href={`/propiedades/${slug}`}
                className="prop-card"
                style={{
                  display: 'block',
                  borderRadius: 'clamp(14px, 1.5vw, 16px)',
                  border: '1px solid #e5e7eb',
                  overflow: 'hidden',
                  background: '#fff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  transition: 'box-shadow 200ms, border-color 200ms',
                  textDecoration: 'none',
                }}
              >
                {/* Photo */}
                <div className="relative w-full bg-gray-100" style={{ aspectRatio: 'var(--card-ratio, 4/3)' }}>
                  {photo ? (
                    <Image
                      src={photo}
                      alt={property.publication_title || address}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', fontSize: 12 }}>
                      Sin foto
                    </div>
                  )}
                  {operation && (
                    <span style={{
                      position: 'absolute', top: 10, left: 10,
                      background: GREEN, color: '#fff',
                      fontFamily: RALEWAY, fontWeight: 600, fontSize: 11,
                      textTransform: 'uppercase', padding: '5px 10px', borderRadius: 6,
                    }}>
                      {operation}
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="featured-card-body" style={{ padding: 'clamp(12px, 1.2vw, 16px)' }}>
                  <p style={{
                    fontFamily: POPPINS, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                    color: '#0a0a0a', margin: '0 0 4px',
                    fontSize: 'clamp(19px, 1.8vw, 22px)', lineHeight: 1.2,
                  }}>
                    {price}
                  </p>
                  {specs.length > 0 && (
                    <p style={{ fontFamily: RALEWAY, color: '#6b7280', margin: '0 0 6px', fontSize: 'clamp(12px, 1vw, 13px)' }}>
                      {specs.join(' · ')}
                    </p>
                  )}
                  <p style={{
                    fontFamily: RALEWAY, fontWeight: 500, color: '#0a0a0a', margin: '0 0 2px',
                    fontSize: 'clamp(13px, 1vw, 14px)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {typeName}{typeName && address ? ' · ' : ''}{address}
                  </p>
                  <p style={{
                    fontFamily: RALEWAY, color: '#6b7280', margin: 0,
                    fontSize: 'clamp(11px, 1vw, 12px)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {location}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: 'clamp(32px, 3vw, 48px)' }}>
          <Link
            href="/propiedades"
            style={{
              display: 'inline-block',
              border: `1px solid ${GREEN}`,
              color: GREEN,
              padding: '12px 32px',
              borderRadius: 999,
              fontFamily: RALEWAY,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'background 0.2s ease, color 0.2s ease',
            }}
          >
            Ver todas las propiedades →
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
  devs = devs.slice(0, 2)
  const hausingPhoto = hausingProp ? getMainPhoto(hausingProp) : null

  return (
    <section className="home-px home-section" style={{ background: '#0d1a12', padding: '80px 48px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <p
          style={{
            fontFamily: POPPINS,
            fontSize: 10,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#4caf7d',
            fontWeight: 600,
            margin: '0 0 12px',
          }}
        >
          INVERSIÓN Y DESARROLLO
        </p>
        <h2
          style={{
            fontFamily: RALEWAY,
            fontSize: 32,
            fontWeight: 300,
            color: '#fff',
            letterSpacing: '-0.5px',
            margin: '0 0 40px',
          }}
        >
          Emprendimientos
        </h2>

        <div className="home-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {/* Hausing card */}
          <Link href="/hausing" className="dev-card" style={{ display: 'block', background: '#111', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden', textDecoration: 'none', transition: 'border-color 0.3s ease' }}>
            <div style={{ position: 'relative', width: '100%', height: 180, background: '#0a0a0a' }}>
              {hausingPhoto && (
                <Image src={hausingPhoto} alt="Hausing" fill style={{ objectFit: 'cover', opacity: 0.85 }} sizes="(max-width: 768px) 100vw, 33vw" />
              )}
            </div>
            <div style={{ padding: 20 }}>
              <span style={{ display: 'inline-block', background: 'rgba(26,92,56,0.3)', color: '#4caf7d', fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 20, marginBottom: 12, letterSpacing: '0.5px' }}>
                CASAS PREMIUM
              </span>
              <h3 style={{ fontFamily: POPPINS, fontSize: 16, fontWeight: 600, color: '#fff', margin: '0 0 6px' }}>Hausing — Casas de Diseño</h3>
              <p style={{ fontFamily: POPPINS, fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 12px' }}>
                Vida, Cadaques, Don Mateo · Funes
              </p>
              <p style={{ fontFamily: POPPINS, fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: '0 0 16px' }}>
                6 propiedades · desde USD 380K
              </p>
              <span style={{ color: '#4caf7d', fontSize: 12, fontWeight: 600, fontFamily: POPPINS }}>Ver →</span>
            </div>
          </Link>

          {devs.map(dev => {
            const photo = getDevMainPhoto(dev)
            const slug = generateDevSlug(dev)
            const status = getConstructionStatus(dev.construction_status)
            const typeName = translateDevType(dev.type?.name || '')
            return (
              <Link key={dev.id} href={`/emprendimientos/${slug}`} className="dev-card" style={{ display: 'block', background: '#111', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden', textDecoration: 'none', transition: 'border-color 0.3s ease' }}>
                <div style={{ position: 'relative', width: '100%', height: 180, background: '#0a0a0a' }}>
                  {photo ? (
                    <Image src={photo} alt={dev.name} fill style={{ objectFit: 'cover', opacity: 0.9 }} sizes="(max-width: 768px) 100vw, 33vw" />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <Building2 size={40} color="#333" />
                    </div>
                  )}
                </div>
                <div style={{ padding: 20 }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                    {typeName && (
                      <span style={{ background: 'rgba(26,92,56,0.3)', color: '#4caf7d', fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 20, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{typeName}</span>
                    )}
                    {status && (
                      <span style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 20, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{status}</span>
                    )}
                  </div>
                  <h3 style={{ fontFamily: POPPINS, fontSize: 16, fontWeight: 600, color: '#fff', margin: '0 0 6px' }}>{dev.name}</h3>
                  <p style={{ fontFamily: POPPINS, fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={10} /> {dev.location?.name || dev.address}
                  </p>
                  {dev.financing_details && (
                    <p style={{ fontFamily: POPPINS, fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: '0 0 16px' }}>
                      {dev.financing_details}
                    </p>
                  )}
                  <span style={{ color: '#4caf7d', fontSize: 12, fontWeight: 600, fontFamily: POPPINS }}>Ver →</span>
                </div>
              </Link>
            )
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Link
            href="/emprendimientos"
            style={{
              display: 'inline-block',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              padding: '12px 32px',
              borderRadius: 999,
              fontFamily: POPPINS,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'background 0.2s ease',
            }}
          >
            Ver todos los emprendimientos →
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── Guía Section ────────────────────────────────────────────────────────────

function GuiaHomeSection() {
  return (
    <section
      className="home-px home-section"
      style={{
        background: '#0a0f0a',
        padding: '80px 48px',
        borderTop: '0.5px solid rgba(255,255,255,0.06)',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="guia-grid" style={{ display: 'flex', gap: 56, alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontFamily: POPPINS,
                fontSize: 10,
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                color: '#4caf7d',
                fontWeight: 600,
                margin: '0 0 20px',
              }}
            >
              GUÍA GRATUITA · 14 CAPÍTULOS
            </p>
            <h2
              style={{
                fontFamily: RALEWAY,
                fontSize: 44,
                fontWeight: 300,
                color: '#fff',
                lineHeight: 1.1,
                letterSpacing: '-1px',
                margin: '0 0 20px',
              }}
            >
              Comprá con <em style={{ fontStyle: 'italic', color: '#4caf7d' }}>inteligencia,</em>
              <br />
              no con suerte.
            </h2>
            <p
              style={{
                fontFamily: POPPINS,
                fontSize: 14,
                color: 'rgba(255,255,255,0.5)',
                lineHeight: 1.7,
                maxWidth: 400,
                margin: '0 0 32px',
              }}
            >
              Todo lo que nadie te cuenta sobre comprar una propiedad en Funes y Roldán. Sin filtros,
              sin letra chica, sin tiempo perdido.
            </p>
            <div
              style={{
                borderTop: '0.5px solid rgba(255,255,255,0.08)',
                borderBottom: '0.5px solid rgba(255,255,255,0.08)',
                margin: '0 0 32px',
              }}
            >
              {[
                { n: '01', t: 'Documentación, gastos ocultos y casos reales' },
                { n: '02', t: 'Todo lo que nadie te cuenta del mercado local' },
                { n: '03', t: 'Cómo negociar con criterio y sin ansiedad' },
              ].map((item, i) => (
                <div
                  key={item.n}
                  style={{
                    display: 'flex',
                    gap: 16,
                    padding: '14px 0',
                    borderTop: i > 0 ? '0.5px solid rgba(255,255,255,0.08)' : 'none',
                  }}
                >
                  <span
                    style={{
                      fontFamily: POPPINS,
                      fontSize: 11,
                      fontWeight: 600,
                      color: GREEN,
                      minWidth: 24,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {item.n}
                  </span>
                  <span style={{ fontFamily: POPPINS, fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
                    {item.t}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <Link
                href="/guia-comprador"
                style={{
                  display: 'inline-block',
                  background: GREEN,
                  color: '#fff',
                  padding: '13px 28px',
                  borderRadius: 999,
                  fontFamily: POPPINS,
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Leer la guía →
              </Link>
              <span style={{ fontFamily: POPPINS, fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
                Acceso permanente · Sin registro
              </span>
            </div>
          </div>

          {/* Mock celular */}
          <Link
            href="/guia-comprador"
            className="guia-mock"
            style={{
              flexShrink: 0,
              width: 220,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: 160,
                height: 290,
                background: '#111',
                borderRadius: 24,
                border: '0.5px solid rgba(255,255,255,0.1)',
                padding: 18,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  background: GREEN,
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontFamily: POPPINS,
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                SI
              </div>
              <div style={{ textAlign: 'center', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px' }}>
                <p
                  style={{
                    fontFamily: RALEWAY,
                    fontSize: 12,
                    fontWeight: 300,
                    color: '#fff',
                    lineHeight: 1.3,
                    margin: 0,
                  }}
                >
                  Guía del<br />Comprador
                </p>
              </div>
              <div
                style={{
                  background: GREEN,
                  color: '#fff',
                  fontFamily: POPPINS,
                  fontSize: 9,
                  fontWeight: 600,
                  padding: '6px 14px',
                  borderRadius: 999,
                }}
              >
                Leer →
              </div>
            </div>
            <p
              style={{
                marginTop: 14,
                fontFamily: POPPINS,
                fontSize: 11,
                color: 'rgba(255,255,255,0.4)',
                textAlign: 'center',
              }}
            >
              Clic para acceder →
            </p>
          </Link>
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
              src="/nosotros/LAURASUSANADAVID.jpeg"
              alt="Susana, Laura y David Ippoliti Flores"
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
              Tres generaciones acompañando familias en Funes, Roldán y Rosario. Una empresa
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

// ─── Por qué elegirnos ───────────────────────────────────────────────────────

const PORQUE_CARDS = [
  {
    title: 'Fotografía aérea con drone',
    desc: 'DJI Mavic 4 Pro para fotos y video profesional en cada propiedad.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" /></svg>
    ),
  },
  {
    title: 'Meta Ads',
    desc: 'Campañas publicitarias en Facebook e Instagram para maximizar la exposición.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l18-8-8 18-2-8z" /></svg>
    ),
  },
  {
    title: '+20K seguidores',
    desc: 'Instagram @inmobiliaria.si y TikTok @si.inmobiliaria',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    ),
  },
  {
    title: 'Portales inmobiliarios',
    desc: 'Zonaprop, Argenprop y MercadoLibre — los tres principales portales.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>
    ),
  },
  {
    title: 'Informe en 24 horas',
    desc: 'Tasación profesional con análisis de operaciones reales de la zona.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
    ),
  },
  {
    title: '43 años de experiencia',
    desc: 'Fundada en 1983 por Susana Ippoliti. Tres generaciones, un mismo oficio.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" /></svg>
    ),
  },
]

function PorQueElegirnosSection() {
  return (
    <section className="home-px home-section" style={{ background: '#fff', padding: '80px 48px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
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
          POR QUÉ ELEGIRNOS
        </p>
        <h2
          style={{
            fontFamily: RALEWAY,
            fontSize: 32,
            fontWeight: 300,
            color: '#111',
            letterSpacing: '-0.5px',
            margin: '0 0 40px',
          }}
        >
          Datos reales, no estimaciones.
        </h2>
        <div className="home-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {PORQUE_CARDS.map(card => (
            <div
              key={card.title}
              className="porque-card"
              style={{
                background: '#fff',
                border: '0.5px solid #e5e5e5',
                borderRadius: 16,
                padding: 24,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  background: '#f0f7f4',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: GREEN,
                  marginBottom: 16,
                }}
              >
                {card.icon}
              </div>
              <h3
                style={{
                  fontFamily: POPPINS,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#111',
                  margin: '0 0 6px',
                }}
              >
                {card.title}
              </h3>
              <p
                style={{
                  fontFamily: POPPINS,
                  fontSize: 11,
                  color: '#888',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {card.desc}
              </p>
            </div>
          ))}
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
          .prop-card:hover { box-shadow: 0 10px 25px rgba(0,0,0,0.1); border-color: #1A5C38 !important; }
          .dev-card:hover { border-color: rgba(255,255,255,0.2) !important; }
          .porque-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
          .guia-mock:hover .guia-mock-frame { border-color: rgba(255,255,255,0.25); }
        }
        @media (max-width: 1024px) {
          .home-section { padding: 64px 32px !important; }
          .home-grid-3 { grid-template-columns: repeat(2, 1fr) !important; }
          .nosotros-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .guia-grid { flex-direction: column !important; }
        }
        @media (max-width: 640px) {
          .home-section { padding: 48px 24px !important; }
          .home-grid-3 { grid-template-columns: 1fr !important; gap: 16px !important; }
          .prop-card { --card-ratio: 16/10; }
        }
      `}</style>

      <HeroVideo />
      <FeaturedPropertiesSection />
      <DevelopmentsSection />
      <GuiaHomeSection />
      <NosotrosHomeSection />
      <PorQueElegirnosSection />
    </>
  )
}
