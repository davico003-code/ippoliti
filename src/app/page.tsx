export const revalidate = 21600

import { MapPin, Building2, BarChart3, GraduationCap, Handshake } from 'lucide-react'
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

  const renderCard = (property: TokkoProperty, variant: 'desktop' | 'mobile') => {
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
    const specs: string[] = []
    if (!land && beds != null && beds > 0) specs.push(`${beds} dorm`)
    if (!land && baths != null && baths > 0) specs.push(`${baths} baño${baths > 1 ? 's' : ''}`)
    if (roofed != null && roofed > 0) specs.push(`${roofed} m²`)
    if (land) { const lot = getLotSurface(property); if (lot != null && lot > 0) specs.push(`${lot.toLocaleString('es-AR')} m²`) }

    const opBg = operation === 'Venta' ? GREEN : operation === 'Alquiler' ? '#2563eb' : '#7c3aed'

    return (
      <Link
        key={property.id}
        href={`/propiedades/${slug}`}
        className={`prop-card block overflow-hidden ${variant === 'mobile' ? 'flex-shrink-0 snap-start' : ''}`}
        style={{
          borderRadius: 12,
          textDecoration: 'none',
          ...(variant === 'mobile' ? { width: '78vw', maxWidth: 320 } : {}),
        }}
      >
        {/* Photo */}
        <div className="relative w-full bg-gray-100 overflow-hidden" style={{ aspectRatio: '4/3' }}>
          {photo ? (
            <Image src={photo} alt={property.publication_title || address} fill
              className="object-cover prop-card-img" sizes={variant === 'mobile' ? '78vw' : '25vw'} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">Sin foto</div>
          )}
          {operation && (
            <span style={{
              position: 'absolute', top: 12, left: 12,
              background: opBg, color: '#fff',
              fontFamily: RALEWAY, fontWeight: 600, fontSize: 10,
              textTransform: 'uppercase', letterSpacing: '0.05em',
              padding: '4px 10px', borderRadius: 6,
            }}>
              {operation}
            </span>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: 12 }}>
          <p style={{
            fontFamily: POPPINS, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
            color: '#0a0a0a', margin: '0 0 2px', lineHeight: 1.2,
            fontSize: variant === 'mobile' ? 20 : 22,
          }}>
            {price}
          </p>
          {specs.length > 0 && (
            <p style={{ fontFamily: RALEWAY, fontSize: variant === 'mobile' ? 12 : 13, color: '#6b7280', margin: '0 0 4px' }}>
              {specs.join(' · ')}
            </p>
          )}
          <p style={{
            fontFamily: RALEWAY, fontSize: variant === 'mobile' ? 12 : 13, color: '#9ca3af', margin: 0,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {address}{location ? `, ${location}` : ''}
          </p>
        </div>
      </Link>
    )
  }

  return (
    <section className="home-section bg-white" style={{ padding: 0 }}>
      <div className="max-w-7xl mx-auto px-5 md:px-6 pt-6 pb-8 md:pt-10 md:pb-10">
        {/* Eyebrow */}
        <p style={{
          fontFamily: RALEWAY, fontWeight: 600, textTransform: 'uppercase',
          color: GREEN, letterSpacing: '0.2em', margin: 0,
          fontSize: 'clamp(11px, 1vw, 12px)', marginBottom: 'clamp(8px, 0.8vw, 12px)',
        }}>
          HOY EN SI INMOBILIARIA
        </p>

        {/* Title */}
        <h2 style={{
          fontFamily: RALEWAY, fontWeight: 700, color: '#0a0a0a',
          lineHeight: 1.1, margin: 0,
          fontSize: 'clamp(28px, 3.5vw, 42px)', marginBottom: 'clamp(8px, 0.5vw, 8px)',
        }}>
          Propiedades destacadas
        </h2>

        {/* Subtitle */}
        <p style={{
          fontFamily: RALEWAY, fontWeight: 400, color: '#6b7280',
          lineHeight: 1.5, margin: 0,
          fontSize: 'clamp(13px, 1.3vw, 16px)', marginBottom: 24,
        }}>
          Casas, departamentos y lotes en Funes, Roldán y Rosario
        </p>

        {/* Desktop grid — 4 cols */}
        <div className="home-featured-grid hidden md:grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {properties.map(p => renderCard(p, 'desktop'))}
        </div>

        {/* Mobile carousel */}
        <div className="md:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 -mx-5 px-5 scrollbar-none">
          {properties.map(p => renderCard(p, 'mobile'))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 'clamp(20px, 2vw, 32px)' }}>
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
    <section className="home-px home-section" style={{ background: '#f9fafb', padding: '80px 48px' }}>
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
          INVERSIÓN Y DESARROLLO
        </p>
        <h2
          style={{
            fontFamily: RALEWAY,
            fontSize: 32,
            fontWeight: 300,
            color: '#0a0a0a',
            letterSpacing: '-0.5px',
            margin: '0 0 40px',
          }}
        >
          Emprendimientos
        </h2>

        <div className="home-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {/* Hausing card */}
          <Link href="/hausing" className="dev-card" style={{ display: 'block', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden', textDecoration: 'none', transition: 'border-color 0.3s ease, box-shadow 0.3s ease' }}>
            <div style={{ position: 'relative', width: '100%', height: 180, background: '#f5f5f5' }}>
              {hausingPhoto && (
                <Image src={hausingPhoto} alt="Hausing" fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 33vw" />
              )}
            </div>
            <div style={{ padding: 20 }}>
              <span style={{ display: 'inline-block', background: 'rgba(26,92,56,0.1)', color: GREEN, fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 20, marginBottom: 12, letterSpacing: '0.5px' }}>
                CASAS PREMIUM
              </span>
              <h3 style={{ fontFamily: POPPINS, fontSize: 16, fontWeight: 600, color: '#0a0a0a', margin: '0 0 6px' }}>Hausing — Casas de Diseño</h3>
              <p style={{ fontFamily: POPPINS, fontSize: 12, color: '#6b7280', margin: '0 0 12px' }}>
                Vida, Cadaques, Don Mateo · Funes
              </p>
              <p style={{ fontFamily: POPPINS, fontSize: 12, color: '#374151', margin: '0 0 16px' }}>
                6 propiedades · desde USD 380K
              </p>
              <span style={{ color: GREEN, fontSize: 12, fontWeight: 600, fontFamily: POPPINS }}>Ver →</span>
            </div>
          </Link>

          {devs.map(dev => {
            const photo = getDevMainPhoto(dev)
            const slug = generateDevSlug(dev)
            const status = getConstructionStatus(dev.construction_status)
            const typeName = translateDevType(dev.type?.name || '')
            return (
              <Link key={dev.id} href={`/emprendimientos/${slug}`} className="dev-card" style={{ display: 'block', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden', textDecoration: 'none', transition: 'border-color 0.3s ease, box-shadow 0.3s ease' }}>
                <div style={{ position: 'relative', width: '100%', height: 180, background: '#f5f5f5' }}>
                  {photo ? (
                    <Image src={photo} alt={dev.name} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 33vw" />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <Building2 size={40} color="#ccc" />
                    </div>
                  )}
                </div>
                <div style={{ padding: 20 }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                    {typeName && (
                      <span style={{ background: 'rgba(26,92,56,0.1)', color: GREEN, fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 20, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{typeName}</span>
                    )}
                    {status && (
                      <span style={{ background: '#f3f4f6', color: '#6b7280', fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 20, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{status}</span>
                    )}
                  </div>
                  <h3 style={{ fontFamily: POPPINS, fontSize: 16, fontWeight: 600, color: '#0a0a0a', margin: '0 0 6px' }}>{dev.name}</h3>
                  <p style={{ fontFamily: POPPINS, fontSize: 12, color: '#6b7280', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={10} /> {dev.location?.name || dev.address}
                  </p>
                  {dev.financing_details && (
                    <p style={{ fontFamily: POPPINS, fontSize: 12, color: '#374151', margin: '0 0 16px' }}>
                      {dev.financing_details}
                    </p>
                  )}
                  <span style={{ color: GREEN, fontSize: 12, fontWeight: 600, fontFamily: POPPINS }}>Ver →</span>
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
              border: `1px solid ${GREEN}`,
              color: GREEN,
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
        background: '#ffffff',
        padding: '80px 48px',
        borderTop: '1px solid #f3f4f6',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="guia-grid" style={{ display: 'flex', gap: 56, alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontFamily: RALEWAY,
                fontSize: 11,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: GREEN,
                fontWeight: 600,
                margin: '0 0 16px',
              }}
            >
              GUÍA GRATUITA · 14 CAPÍTULOS
            </p>
            <h2
              style={{
                fontFamily: RALEWAY,
                fontSize: 'clamp(28px, 3.5vw, 40px)',
                fontWeight: 700,
                color: '#0a0a0a',
                lineHeight: 1.1,
                letterSpacing: '-0.5px',
                margin: '0 0 16px',
              }}
            >
              Comprá con <em style={{ fontStyle: 'italic', color: GREEN }}>inteligencia,</em>
              <br />
              no con suerte.
            </h2>
            <p
              style={{
                fontFamily: RALEWAY,
                fontSize: 14,
                color: '#6b7280',
                lineHeight: 1.7,
                maxWidth: 400,
                margin: '0 0 28px',
              }}
            >
              Todo lo que nadie te cuenta sobre comprar una propiedad en Funes y Roldán. Sin filtros,
              sin letra chica, sin tiempo perdido.
            </p>
            <div
              style={{
                borderTop: '1px solid #f3f4f6',
                borderBottom: '1px solid #f3f4f6',
                margin: '0 0 28px',
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
                    borderTop: i > 0 ? '1px solid #f3f4f6' : 'none',
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
                  <span style={{ fontFamily: RALEWAY, fontSize: 13, color: '#374151' }}>
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
              <span style={{ fontFamily: RALEWAY, fontSize: 11, color: '#9ca3af' }}>
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
              width: 260,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: 220,
                height: 440,
                background: '#f9fafb',
                borderRadius: 32,
                border: '1px solid #e5e7eb',
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
              <div style={{ textAlign: 'center', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 12px' }}>
                <p
                  style={{
                    fontFamily: RALEWAY,
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#0a0a0a',
                    lineHeight: 1.3,
                    margin: 0,
                  }}
                >
                  Guía del<br />Comprador<br />
                  <span style={{ fontSize: 12, fontWeight: 400, color: '#6b7280' }}>14 capítulos</span>
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
                fontFamily: RALEWAY,
                fontSize: 11,
                color: '#9ca3af',
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

// ─── Conocé el mercado ───────────────────────────────────────────────────────

const STATS = [
  { num: '40+', label: 'Años en el mercado' },
  { num: '+1000', label: 'Familias asesoradas' },
  { num: '3', label: 'Ciudades de cobertura' },
  { num: '200+', label: 'Propiedades activas' },
]

const BULLETS = [
  { icon: BarChart3, text: 'Datos reales del mercado actualizados mensualmente' },
  { icon: GraduationCap, text: 'Asesoramiento profesional con 40+ años de experiencia' },
  { icon: Handshake, text: 'Acompañamiento integral de la operación de principio a fin' },
]

function ConoceElMercadoSection() {
  return (
    <section className="home-section" style={{ background: '#f9fafb', padding: 0 }}>
      <div className="max-w-7xl mx-auto px-5 md:px-6 pt-12 pb-12 md:pt-20 md:pb-20">
        <div className="nosotros-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
          {/* Left */}
          <div>
            <h2 style={{ fontFamily: RALEWAY, fontWeight: 700, fontSize: 'clamp(22px, 2.5vw, 30px)', color: '#0a0a0a', lineHeight: 1.2, margin: '0 0 16px' }}>
              Conocé el mercado inmobiliario de Funes, Roldán y Rosario
            </h2>
            <p style={{ fontFamily: RALEWAY, fontSize: 'clamp(14px, 1.3vw, 16px)', color: '#6b7280', lineHeight: 1.7, margin: '0 0 32px' }}>
              Más de 40 años acompañando a familias y empresas en la zona oeste de Rosario.
              Datos actualizados, asesoramiento profesional y la transparencia que tu próxima inversión merece.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {BULLETS.map((b, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 40, height: 40, background: '#e8f5ee', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <b.icon size={20} color={GREEN} />
                  </div>
                  <p style={{ fontFamily: RALEWAY, fontSize: 14, color: '#374151', lineHeight: 1.5, margin: 0 }}>{b.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — stats grid */}
          <div className="nos-stats" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {STATS.map(s => (
              <div key={s.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 24, textAlign: 'center' }}>
                <div style={{ fontFamily: POPPINS, fontSize: 36, fontWeight: 600, color: GREEN, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                  {s.num}
                </div>
                <div style={{ marginTop: 6, fontFamily: RALEWAY, fontSize: 13, fontWeight: 500, color: '#6b7280' }}>
                  {s.label}
                </div>
              </div>
            ))}
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
          .prop-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
          .prop-card:hover .prop-card-img { transform: scale(1.05); }
          .dev-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.08); border-color: #d1d5db !important; }
          .guia-mock:hover .guia-mock-frame { border-color: rgba(255,255,255,0.25); }
        }
        .prop-card-img { transition: transform 400ms ease-out; }
        @media (max-width: 1024px) {
          .home-section { padding: 64px 32px !important; }
          .home-grid-3 { grid-template-columns: repeat(2, 1fr) !important; }
          .home-featured-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .nosotros-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .guia-grid { flex-direction: column !important; }
        }
        @media (max-width: 640px) {
          .home-section { padding: 48px 24px !important; }
          .home-grid-3 { grid-template-columns: 1fr !important; gap: 16px !important; }
        }
      `}</style>

      <HeroVideo />
      <FeaturedPropertiesSection />
      <DevelopmentsSection />
      <GuiaHomeSection />
      <NosotrosHomeSection />
      <ConoceElMercadoSection />
    </>
  )
}
