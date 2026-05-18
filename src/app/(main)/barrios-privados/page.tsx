import fs from 'fs'
import path from 'path'
import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { BARRIOS } from '@/lib/barrios'
import { HUB_FAQS } from '@/lib/barrios/faq'

import BarrioHubCardImage, { type HubTier } from '@/components/barrios/BarrioHubCardImage'
import BarrioFAQ from '@/components/barrios/BarrioFAQ'
import HubTracker from './HubTracker'
import type { MapaBarrio } from '@/components/barrios/BarrioMapa'

// Auto-discovery de la foto principal de cada barrio.
// Heurística: si existe un archivo `hero*` lo prioriza; sino, el primero alfabético.
// Se ejecuta en server (build/SSR), nunca llega al cliente.
function getBarrioHero(slug: string): string | null {
  try {
    const dir = path.join(process.cwd(), 'public', 'barrios', slug)
    if (!fs.existsSync(dir)) return null
    const files = fs
      .readdirSync(dir)
      .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
      .sort((a, b) => a.localeCompare(b, 'es'))
    if (files.length === 0) return null
    const hero = files.find((f) => /^hero(\.|[-_ ])/i.test(f))
    const pick = hero ?? files[0]!
    return `/barrios/${slug}/${encodeURIComponent(pick)}`
  } catch {
    return null
  }
}

const BarrioMapaWrapper = dynamic(() => import('@/components/barrios/BarrioMapa'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: '100%',
        width: '100%',
        background: '#F3EFE7',
        borderRadius: 12,
      }}
    />
  ),
})

const CANONICAL = 'https://siinmobiliaria.com/barrios-privados'

export const metadata: Metadata = {
  title: 'Barrios privados de Funes | SI Inmobiliaria',
  description:
    'Los 11 barrios cerrados de Funes analizados sin filtro. Premium, consolidados y en desarrollo. Conocelos con la mirada de un broker de dos generaciones.',
  keywords: [
    'barrios privados funes',
    'barrios cerrados funes',
    'club de campo funes santa fe',
    'lotes en venta funes',
    'country messi rosario',
  ].join(', '),
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: 'Barrios privados de Funes | SI Inmobiliaria',
    description:
      'Una guía completa, escrita por brokers que viven y trabajan en la zona. Los 11 barrios cerrados de Funes analizados sin filtro.',
    url: CANONICAL,
    type: 'website',
    siteName: 'SI INMOBILIARIA',
    images: ['/og-default.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Barrios privados de Funes',
    description: '11 barrios analizados por SI Inmobiliaria — Mat. 0621',
    images: ['/og-default.jpg'],
  },
}

interface HubBarrio {
  slug: string
  nombre: string
  descripcion: string
  meta1: string
  meta2: string
  lat: number
  lng: number
}

interface TierGroup {
  tier: HubTier
  badge: { label: string; bg: string; color: string }
  h2: string
  sub: string
  barrios: HubBarrio[]
}

const TIERS: TierGroup[] = [
  {
    tier: 'premium',
    badge: { label: 'PREMIUM', bg: '#1A5C38', color: '#FFFFFF' },
    h2: 'El country tradicional',
    sub: 'Marca histórica, vecindario discreto, ticket más alto.',
    barrios: [
      {
        slug: 'kentucky',
        nombre: 'Kentucky',
        descripcion: 'El country tradicional de Funes con golf 18 hoyos.',
        meta1: '676 lotes',
        meta2: '242 ha',
        lat: -32.9447,
        lng: -60.8283,
      },
    ],
  },
  {
    tier: 'consolidado',
    badge: { label: 'CONSOLIDADO', bg: '#DCE9E1', color: '#1A5C38' },
    h2: 'Los tres Funes Hills',
    sub: 'Comunidad establecida, vecindario probado.',
    barrios: [
      {
        slug: 'funes-hills-san-marino',
        nombre: 'Funes Hills San Marino',
        descripcion: 'Comunidad chica con grupo electrógeno integrado.',
        meta1: '100% electrógeno',
        meta2: 'Chica escala',
        lat: -32.9142,
        lng: -60.8131,
      },
      {
        slug: 'funes-hills-cadaques',
        nombre: 'Funes Hills Cadaqués',
        descripcion: 'Lotes de 800 m² en las tierras altas de Funes.',
        meta1: '800 m² típico',
        meta2: 'Tierras altas',
        lat: -32.9161,
        lng: -60.8188,
      },
      {
        slug: 'funes-hills-miraflores',
        nombre: 'Funes Hills Miraflores',
        descripcion: 'Polo tenístico del cluster Funes Hills.',
        meta1: '308 lotes',
        meta2: '800–1.215 m²',
        lat: -32.9192,
        lng: -60.8211,
      },
    ],
  },
  {
    tier: 'joven',
    badge: { label: 'VIDA JOVEN', bg: '#F4E9D5', color: '#7A5A1E' },
    h2: 'Consolidado con dinámica joven',
    sub: 'Vecindario más joven y dinámico.',
    barrios: [
      {
        slug: 'san-sebastian',
        nombre: 'San Sebastián',
        descripcion: 'Consolidado con generador eléctrico para todo el barrio.',
        meta1: '587 lotes',
        meta2: '68 ha',
        lat: -32.9106,
        lng: -60.8350,
      },
      {
        slug: 'vida-barrio-cerrado',
        nombre: 'Vida Barrio Cerrado',
        descripcion: 'Centro comercial propio integrado al ingreso.',
        meta1: '294 lotes',
        meta2: '35 ha',
        lat: -32.9220,
        lng: -60.8381,
      },
    ],
  },
  {
    tier: 'desarrollo',
    badge: { label: 'EN DESARROLLO', bg: '#FDF1E4', color: '#8B5A2B' },
    h2: 'Proyectos en obra activa',
    sub: 'Oportunidad de entrar antes de la entrega final.',
    barrios: [
      {
        slug: 'vida-lagoon',
        nombre: 'Vida Lagoon',
        descripcion: 'Laguna cristalina de 23.300 m² en Funes.',
        meta1: '1.042 lotes',
        meta2: '100 ha',
        lat: -32.9412,
        lng: -60.8335,
      },
      {
        slug: 'vida-club-de-campo',
        nombre: 'Vida Club de Campo',
        descripcion: 'Practice de golf y Club House de autor.',
        meta1: '659 lotes',
        meta2: '135 ha',
        lat: -32.9265,
        lng: -60.8240,
      },
      {
        slug: 'vida-jardin',
        nombre: 'Vida Jardín',
        descripcion: 'Acceso directo a la autopista.',
        meta1: '242 lotes',
        meta2: '800–1.100 m²',
        lat: -32.9315,
        lng: -60.8201,
      },
      {
        slug: 'vida-green',
        nombre: 'Vida Green',
        descripcion: 'Entrada al cluster Vida desde valor.',
        meta1: '419 lotes',
        meta2: '500–700 m²',
        lat: -32.9330,
        lng: -60.8185,
      },
      {
        slug: 'funes-lakes',
        nombre: 'Funes Lakes',
        descripcion: 'Barrio náutico de 8 islas conectadas.',
        meta1: '485 lotes',
        meta2: '50 ha',
        lat: -32.9068,
        lng: -60.8482,
      },
    ],
  },
]

const MAPA_LEYENDA: { tier: HubTier; label: string; color: string }[] = [
  { tier: 'premium', label: 'Premium', color: '#1A5C38' },
  { tier: 'consolidado', label: 'Consolidado', color: '#4A7C5C' },
  { tier: 'joven', label: 'Vida joven', color: '#B8935A' },
  { tier: 'desarrollo', label: 'En desarrollo', color: '#8B5A2B' },
]

export default function BarriosPrivadosHub() {
  const mapaBarrios: MapaBarrio[] = TIERS.flatMap((t) =>
    t.barrios.map((b) => ({
      slug: b.slug,
      nombre: b.nombre,
      tier: t.tier,
      descripcion: b.descripcion,
      lat: b.lat,
      lng: b.lng,
    })),
  )

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Barrios privados del corredor de Funes',
    description:
      '11 barrios privados analizados por SI INMOBILIARIA — Mat. N° 0621. Funes, Santa Fe, Argentina.',
    itemListElement: BARRIOS.map((b, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${CANONICAL}/${b.slug}`,
      name: b.nombre,
    })),
  }

  const hubFaqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: HUB_FAQS.map((f) => ({
      '@type': 'Question',
      name: f.pregunta,
      acceptedAnswer: { '@type': 'Answer', text: f.respuesta },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hubFaqJsonLd) }}
      />
      <HubTracker />

      {/* 1 · HERO COMPACTO */}
      <section
        style={{
          background: '#FAF7F2',
          borderBottom: '1px solid rgba(15,15,15,0.08)',
        }}
        className="bp-hero"
      >
        <div className="bp-container">
          <p
            style={{
              fontFamily: 'Raleway, sans-serif',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#B8935A',
              margin: '0 0 20px',
            }}
          >
            Funes · Santa Fe
          </p>
          <h1
            style={{
              fontFamily: 'Raleway, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(36px, 5vw, 56px)',
              lineHeight: 1.05,
              color: '#0F0F0F',
              margin: '0 0 20px',
              letterSpacing: '-0.01em',
            }}
          >
            Los 11 barrios privados de Funes.
          </h1>
          <p
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: 17,
              fontWeight: 400,
              color: '#6B7280',
              lineHeight: 1.55,
              maxWidth: 720,
              margin: 0,
            }}
          >
            Información útil sobre los 11 barrios cerrados de Funes: amenities, escala y para qué
            tipo de comprador funciona cada uno.
          </p>
        </div>
      </section>

      {/* 2-5 · TIERS */}
      <section style={{ background: '#fff' }} className="bp-tiers">
        <div className="bp-container">
          {TIERS.map((group) => (
            <div key={group.tier} className="bp-tier-block">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  flexWrap: 'wrap',
                  borderBottom: '1px solid rgba(15,15,15,0.1)',
                  paddingBottom: 16,
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    fontFamily: 'Raleway, sans-serif',
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    padding: '4px 10px',
                    borderRadius: 4,
                    background: group.badge.bg,
                    color: group.badge.color,
                  }}
                >
                  {group.badge.label}
                </span>
                <h2
                  style={{
                    fontFamily: 'Raleway, sans-serif',
                    fontWeight: 600,
                    fontSize: 22,
                    color: '#0F0F0F',
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  {group.h2}
                </h2>
                <span
                  style={{
                    marginLeft: 'auto',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 13,
                    color: '#9CA3AF',
                  }}
                >
                  {group.barrios.length} {group.barrios.length === 1 ? 'barrio' : 'barrios'}
                </span>
              </div>
              <p
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 14,
                  color: '#6B7280',
                  margin: '0 0 24px',
                  lineHeight: 1.5,
                }}
              >
                {group.sub}
              </p>
              <div className="bp-card-grid">
                {group.barrios.map((b) => (
                  <Link
                    key={b.slug}
                    href={`/barrios-privados/${b.slug}`}
                    className="bp-card"
                    aria-label={`Conocer ${b.nombre} — ${b.descripcion}`}
                  >
                    <div className="bp-card-img">
                      <BarrioHubCardImage
                        src={getBarrioHero(b.slug)}
                        nombre={b.nombre}
                        tier={group.tier}
                      />
                    </div>
                    <div className="bp-card-body">
                      <span
                        style={{
                          fontFamily: 'Raleway, sans-serif',
                          fontSize: 12,
                          fontWeight: 600,
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          color: '#B8935A',
                          display: 'block',
                          marginBottom: 8,
                        }}
                      >
                        {group.badge.label}
                      </span>
                      <h3
                        style={{
                          fontFamily: 'Raleway, sans-serif',
                          fontWeight: 600,
                          fontSize: 19,
                          color: '#0F0F0F',
                          margin: '0 0 8px',
                          lineHeight: 1.2,
                        }}
                      >
                        {b.nombre}
                      </h3>
                      <p
                        style={{
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: 14,
                          color: '#6B7280',
                          lineHeight: 1.5,
                          margin: 0,
                          minHeight: 42,
                        }}
                      >
                        {b.descripcion}
                      </p>
                      <div
                        style={{
                          marginTop: 14,
                          paddingTop: 12,
                          borderTop: '1px solid rgba(15,15,15,0.08)',
                          display: 'flex',
                          gap: 14,
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: 12,
                          color: '#6B7280',
                        }}
                      >
                        <span>{b.meta1}</span>
                        <span>{b.meta2}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6 · MAPA */}
      <section
        style={{
          background: '#FAF7F2',
          borderTop: '1px solid rgba(15,15,15,0.08)',
          borderBottom: '1px solid rgba(15,15,15,0.08)',
        }}
        className="bp-mapa"
      >
        <div className="bp-container">
          <div className="bp-mapa-header">
            <div>
              <h2
                style={{
                  fontFamily: 'Raleway, sans-serif',
                  fontWeight: 600,
                  fontSize: 'clamp(24px, 3vw, 32px)',
                  color: '#0F0F0F',
                  margin: '0 0 10px',
                  lineHeight: 1.2,
                }}
              >
                Dónde está cada barrio
              </h2>
              <p
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 15,
                  color: '#6B7280',
                  lineHeight: 1.5,
                  margin: 0,
                  maxWidth: 540,
                }}
              >
                Tocá un marcador para ver el detalle del barrio. El color indica el tier.
              </p>
            </div>
            <ul className="bp-mapa-leyenda">
              {MAPA_LEYENDA.map((item) => (
                <li key={item.tier}>
                  <span
                    aria-hidden
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: item.color,
                      display: 'inline-block',
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: 12,
                      color: '#4B5563',
                    }}
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bp-mapa-box">
            <BarrioMapaWrapper barrios={mapaBarrios} />
          </div>
        </div>
      </section>

      {/* 7 · FAQ */}
      <section style={{ background: '#fff' }} className="bp-faq">
        <div className="bp-container" style={{ maxWidth: 820 }}>
          <div style={{ marginBottom: 32 }}>
            <h2
              style={{
                fontFamily: 'Raleway, sans-serif',
                fontWeight: 600,
                fontSize: 'clamp(24px, 3vw, 32px)',
                color: '#0F0F0F',
                margin: '0 0 10px',
                lineHeight: 1.2,
              }}
            >
              Preguntas frecuentes
            </h2>
            <p
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: 15,
                color: '#6B7280',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Lo que más nos consultan sobre el corredor.
            </p>
          </div>
          <BarrioFAQ faqs={HUB_FAQS} />
        </div>
      </section>

      {/* 8 · CTA FINAL */}
      <section
        style={{
          background: '#0F3F26',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="bp-cta"
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 25% 35%, rgba(184,147,90,0.08) 0%, transparent 55%), radial-gradient(circle at 75% 70%, rgba(184,147,90,0.06) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />
        <div
          className="bp-container"
          style={{ textAlign: 'center', position: 'relative', maxWidth: 720 }}
        >
          <h2
            style={{
              fontFamily: 'Raleway, sans-serif',
              fontWeight: 600,
              fontSize: 'clamp(28px, 4vw, 40px)',
              color: '#FFFFFF',
              margin: '0 0 16px',
              lineHeight: 1.2,
            }}
          >
            ¿Querés que un broker local te ayude a elegir?
          </h2>
          <p
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: 16,
              color: 'rgba(255,255,255,0.75)',
              lineHeight: 1.55,
              margin: '0 0 32px',
            }}
          >
            Ahorrate semanas de búsqueda. Te organizamos visitas a los barrios que te interesan en
            una sola tarde.
          </p>
          <a
            href="https://wa.me/5493412101694"
            target="_blank"
            rel="noopener noreferrer"
            className="bp-cta-button"
            style={{
              display: 'inline-block',
              fontFamily: 'Raleway, sans-serif',
              fontWeight: 600,
              fontSize: 16,
              color: '#0F3F26',
              background: '#B8935A',
              padding: '16px 32px',
              borderRadius: 8,
              textDecoration: 'none',
              transition: 'background 200ms ease, transform 200ms ease',
            }}
          >
            Hablar con David por WhatsApp →
          </a>
          <p
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: 13,
              color: 'rgba(255,255,255,0.5)',
              margin: '28px 0 0',
            }}
          >
            David Flores · Mat. N° 0621 · SI INMOBILIARIA
          </p>
        </div>
      </section>

      <style>{`
        .bp-container {
          max-width: 1180px;
          margin: 0 auto;
          padding-left: 24px;
          padding-right: 24px;
        }
        .bp-hero { padding: 56px 0 40px; }
        .bp-tiers { padding: 56px 0 24px; }
        .bp-tier-block { margin-bottom: 56px; }
        .bp-tier-block:last-child { margin-bottom: 0; }
        .bp-card-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        .bp-card {
          display: flex;
          flex-direction: column;
          background: #fff;
          border: 1px solid rgba(15,15,15,0.08);
          border-radius: 12px;
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          transition: transform 220ms ease, border-color 220ms ease, box-shadow 220ms ease;
        }
        .bp-card:hover {
          border-color: #1A5C38;
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(15,15,15,0.08);
        }
        .bp-card-img {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 4;
          background: #F3EFE7;
          overflow: hidden;
        }
        .bp-card-body { padding: 18px 20px 20px; }
        .bp-mapa { padding: 56px 0; }
        .bp-mapa-header {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 28px;
        }
        .bp-mapa-leyenda {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }
        .bp-mapa-leyenda li {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .bp-mapa-box {
          height: 420px;
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgba(15,15,15,0.08);
          overflow: hidden;
          background: #fff;
        }
        .bp-faq { padding: 48px 0; }
        .bp-cta { padding: 64px 0; }
        .bp-cta-button:hover {
          background: #FFFFFF !important;
          transform: translateY(-2px);
        }

        @media (min-width: 768px) {
          .bp-hero { padding: 80px 0 64px; }
          .bp-tiers { padding: 80px 0 32px; }
          .bp-tier-block { margin-bottom: 72px; }
          .bp-card-grid { grid-template-columns: repeat(2, 1fr); }
          .bp-mapa { padding: 72px 0; }
          .bp-mapa-header { flex-direction: row; justify-content: space-between; align-items: flex-end; gap: 32px; }
          .bp-mapa-box { height: 540px; }
          .bp-faq { padding: 64px 0; }
          .bp-cta { padding: 80px 0; }
        }
        @media (min-width: 1024px) {
          .bp-card-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>
    </>
  )
}
