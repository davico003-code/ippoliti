import type { Metadata } from 'next'
import Link from 'next/link'
import TrackPageView from '@/components/recursos/TrackPageView'
import RecursosCTA from '@/components/recursos/RecursosCTA'

export const metadata: Metadata = {
  title: 'Recursos | SI Inmobiliaria',
  description:
    'Calculadoras, guías y herramientas para inquilinos y compradores: costos iniciales para alquilar, verificación de ajuste por ICL/IPC y guía del comprador.',
  alternates: { canonical: 'https://siinmobiliaria.com/recursos' },
  openGraph: {
    title: 'Recursos | SI Inmobiliaria',
    description:
      'Calculadoras, guías y herramientas para inquilinos y compradores. Gratis, al instante, sin registro.',
    url: 'https://siinmobiliaria.com/recursos',
    siteName: 'SI Inmobiliaria',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'SI Inmobiliaria' }],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Recursos | SI Inmobiliaria',
    description: 'Calculadoras, guías y herramientas para inquilinos y compradores.',
    images: ['/og-image.jpg'],
  },
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://siinmobiliaria.com' },
    { '@type': 'ListItem', position: 2, name: 'Recursos', item: 'https://siinmobiliaria.com/recursos' },
  ],
}

const collectionJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Recursos para inquilinos y compradores',
  url: 'https://siinmobiliaria.com/recursos',
  description:
    'Calculadoras, guías y herramientas para inquilinos y compradores en Funes, Roldán y Rosario.',
  hasPart: [
    {
      '@type': 'WebApplication',
      name: 'Calculadora de costos iniciales para alquilar',
      url: 'https://siinmobiliaria.com/recursos/calculadora-alquiler',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'ARS' },
    },
    {
      '@type': 'WebApplication',
      name: 'Verificador de ajuste de alquiler',
      url: 'https://siinmobiliaria.com/recursos/ajuste-alquiler',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'ARS' },
    },
    {
      '@type': 'WebPage',
      name: 'Guía del comprador',
      url: 'https://siinmobiliaria.com/guia',
    },
    {
      '@type': 'WebApplication',
      name: 'Índice de Costos de Construcción',
      url: 'https://siinmobiliaria.com/recursos/costos-de-construccion',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'WebApplication',
      name: 'Mapa de zonificación de Funes',
      url: 'https://siinmobiliaria.com/recursos/mapa-funes',
      applicationCategory: 'ReferenceApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'ARS' },
    },
    {
      '@type': 'WebApplication',
      name: 'Asistente de obras particulares de Funes',
      url: 'https://siinmobiliaria.com/recursos/asistente-obras',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'ARS' },
    },
    {
      '@type': 'WebPage',
      name: 'Índices y mercado en vivo',
      url: 'https://siinmobiliaria.com/informes',
    },
  ],
}


// Rediseño v2 (dirección Apple / Stripe / Linear). Hero centrado, stats grandes,
// grilla de 2 columnas con tarjetas centradas y temas de color variados (gris,
// verde profundo, blanco, casi-negro). Sin beige/marfil. CSS scoped `rb-`.
const STYLES = `
  .rb-page {
    --rb-font: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', system-ui, 'Segoe UI', sans-serif;
    --rb-accent: #1A8C4D; --rb-green-deep: #0B3F2D; --rb-soft: #DCEBE0;
    --rb-bg: #FBFBFA; --rb-gray: #F1F1EE; --rb-line: rgba(0,0,0,0.06);
    --rb-ink: #111111; --rb-ink-2: #666666; --rb-ink-3: #8A8A8A;
    --rb-on-dark: rgba(255,255,255,0.72); --rb-green-light: #6FC994;
    background: var(--rb-bg); color: var(--rb-ink);
    font-family: var(--rb-font); -webkit-font-smoothing: antialiased;
  }
  .rb-wrap { max-width: 1120px; margin: 0 auto; padding: 0 clamp(22px, 5vw, 48px); }

  .rb-hero { text-align: center; max-width: 780px; margin: 0 auto; padding: clamp(72px, 11vw, 130px) 0 clamp(48px, 7vw, 88px); }
  .rb-eyebrow { font-size: 16px; font-weight: 600; letter-spacing: -0.01em; color: var(--rb-accent); }
  .rb-h1 { font-size: clamp(46px, 7.4vw, 84px); line-height: 1.0; font-weight: 800; letter-spacing: -0.035em; margin: 18px 0 0; }
  .rb-h1 .accent { color: var(--rb-accent); }
  .rb-sub { color: var(--rb-ink-2); font-size: clamp(18px, 1.7vw, 21px); margin: 24px auto 0; font-weight: 400; max-width: 30ch; line-height: 1.5; }
  .rb-stats { display: flex; justify-content: center; margin-top: 46px; }
  .rb-stat { padding: 0 clamp(28px, 4vw, 54px); border-left: 1px solid var(--rb-line); }
  .rb-stat:first-child { border-left: none; }
  .rb-stat .n { font-size: clamp(30px, 3vw, 40px); font-weight: 800; letter-spacing: -0.02em; color: var(--rb-ink); font-variant-numeric: tabular-nums; line-height: 1; }
  .rb-stat .l { font-size: 14px; color: var(--rb-ink-3); margin-top: 8px; }

  .rb-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: clamp(18px, 2vw, 26px); padding-bottom: clamp(64px, 9vw, 112px); }

  .rb-tile {
    display: flex; flex-direction: column; align-items: center; text-align: center;
    border-radius: 32px; padding: clamp(34px, 3vw, 48px) clamp(24px, 2.6vw, 40px);
    min-height: 308px; text-decoration: none; color: inherit;
    transition: transform .25s cubic-bezier(.2,.7,.2,1), box-shadow .25s ease;
  }
  .rb-tile:hover { transform: translateY(-4px) scale(1.012); }

  .rb-icon { width: 64px; height: 64px; border-radius: 19px; background: var(--rb-soft); display: grid; place-items: center; color: var(--rb-accent); flex: none; }
  .rb-icon svg { width: 28px; height: 28px; }
  .rb-tag { font-size: 12.5px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--rb-accent); margin-top: 26px; }
  .rb-tile h3 { font-size: clamp(23px, 2vw, 28px); font-weight: 700; letter-spacing: -0.02em; margin-top: 12px; line-height: 1.15; color: var(--rb-ink); }
  .rb-tile p { font-size: 16px; color: var(--rb-ink-2); margin-top: 12px; line-height: 1.5; max-width: 34ch; }
  .rb-link { margin-top: auto; padding-top: 22px; display: inline-flex; align-items: center; gap: 6px; font-size: 15px; font-weight: 600; color: var(--rb-accent); }
  .rb-link svg { width: 13px; height: 13px; transition: transform .2s cubic-bezier(.2,.7,.2,1); }
  .rb-tile:hover .rb-link svg { transform: translateX(4px); }

  .rb-tile.t-gray { background: var(--rb-gray); }
  .rb-tile.t-white { background: #FFFFFF; border: 1px solid var(--rb-line); }
  .rb-tile.t-green { background: linear-gradient(155deg, #0F4A33, #0A3525); color: #fff; }
  .rb-tile.t-black { background: linear-gradient(155deg, #242424, #151515); color: #fff; }
  .rb-tile.t-gray:hover, .rb-tile.t-white:hover { box-shadow: 0 24px 50px -30px rgba(0,0,0,0.22); }
  .rb-tile.t-green:hover, .rb-tile.t-black:hover { box-shadow: 0 28px 56px -30px rgba(0,0,0,0.5); }
  .rb-tile.t-green .rb-icon, .rb-tile.t-black .rb-icon { background: rgba(255,255,255,0.1); color: #fff; }
  .rb-tile.t-green h3, .rb-tile.t-black h3 { color: #fff; }
  .rb-tile.t-green p, .rb-tile.t-black p { color: var(--rb-on-dark); }
  .rb-tile.t-green .rb-tag, .rb-tile.t-green .rb-link { color: var(--rb-green-light); }
  .rb-tile.t-black .rb-tag, .rb-tile.t-black .rb-link { color: #5FC88A; }

  .rb-tile.feature {
    grid-column: span 2; flex-direction: row; align-items: center; justify-content: space-between; text-align: left;
    gap: clamp(28px, 4vw, 56px); background: linear-gradient(150deg, #0F4A33, #0A3525); color: #fff;
    min-height: 0; padding: clamp(34px, 3.4vw, 52px) clamp(34px, 3.6vw, 56px); border-radius: 32px;
  }
  .rb-tile.feature:hover { transform: translateY(-4px) scale(1.008); box-shadow: 0 30px 60px -32px rgba(11,63,45,0.55); }
  .rb-feat-main { display: flex; flex-direction: column; align-items: flex-start; }
  .rb-tile.feature .rb-icon { background: rgba(255,255,255,0.1); color: #fff; }
  .rb-tile.feature .rb-tag { color: var(--rb-green-light); margin-top: 22px; }
  .rb-tile.feature h3 { color: #fff; font-size: clamp(28px, 3.2vw, 40px); margin-top: 14px; max-width: 16ch; line-height: 1.08; }
  .rb-tile.feature p { color: var(--rb-on-dark); font-size: clamp(16px, 1.4vw, 18px); margin-top: 12px; max-width: 44ch; }
  .rb-feat-cta { flex: none; display: inline-flex; align-items: center; gap: 9px; height: 54px; padding: 0 30px; background: #fff; color: #0B3F2D; font-weight: 600; font-size: 16px; border-radius: 999px; transition: transform .2s cubic-bezier(.2,.7,.2,1); }
  .rb-tile.feature:hover .rb-feat-cta { transform: scale(1.04); }
  .rb-feat-cta svg { width: 14px; height: 14px; transition: transform .2s; }
  .rb-tile.feature:hover .rb-feat-cta svg { transform: translateX(4px); }

  @media (max-width: 860px) {
    .rb-grid { grid-template-columns: 1fr; }
    .rb-tile, .rb-tile.feature { grid-column: auto; min-height: 0; }
    .rb-tile { min-height: 0; }
    .rb-tile.feature { flex-direction: column; align-items: flex-start; }
    .rb-feat-cta { width: 100%; justify-content: center; }
    .rb-stat { padding: 0 clamp(16px, 5vw, 30px); }
  }
  @media (max-width: 420px) {
    .rb-stat { padding: 0 13px; }
    .rb-stat .n { font-size: 25px; }
    .rb-stat .l { font-size: 12.5px; }
  }
`

function IconCalc() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="8" y1="10" x2="10" y2="10" />
      <line x1="12" y1="10" x2="14" y2="10" />
      <line x1="8" y1="14" x2="10" y2="14" />
      <line x1="12" y1="14" x2="14" y2="14" />
      <line x1="8" y1="18" x2="14" y2="18" />
    </svg>
  )
}

function IconChart() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  )
}

function IconPulse() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 12h4l3-9 4 18 3-9h4" />
    </svg>
  )
}

function IconObra() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="6" width="20" height="8" rx="1" />
      <path d="M17 14v7" />
      <path d="M7 14v7" />
      <path d="M17 3v3" />
      <path d="M7 3v3" />
      <path d="m6 6 12 8" />
      <path d="m6 14 12-8" />
    </svg>
  )
}

function IconBook() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="15" y2="17" />
    </svg>
  )
}

function IconMap() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  )
}

interface CardData {
  href: string
  eyebrow: string
  title: string
  description: string
  cta: string
  icon: React.ReactNode
}

const CARDS: CardData[] = [
  {
    href: '/recursos/calculadora-alquiler',
    eyebrow: 'Costos para alquilar',
    title: '¿Cuánto necesito para alquilar?',
    description:
      'Primer mes, honorarios, sellado y depósito, todo sumado.',
    cta: 'Calcular costos',
    icon: <IconCalc />,
  },
  {
    href: '/recursos/ajuste-alquiler',
    eyebrow: 'Ajuste de alquiler',
    title: '¿Está bien calculado tu ajuste?',
    description:
      'Verificalo con la calculadora oficial: ICL, IPC y CasaPropia.',
    cta: 'Verificar ajuste',
    icon: <IconChart />,
  },
  {
    href: '/guia',
    eyebrow: 'Guía de compra',
    title: 'Guía del comprador',
    description:
      'Pasos, documentación, escritura y gastos, explicados simple.',
    cta: 'Leer la guía',
    icon: <IconBook />,
  },
  {
    href: '/recursos/costos-de-construccion',
    eyebrow: 'Costos de construcción',
    title: '¿Cuánto cuesta construir?',
    description:
      'Costo por m² llave en mano o por cuenta propia, con casos reales.',
    cta: 'Ver el índice',
    icon: <IconObra />,
  },
  {
    href: '/recursos/mapa-funes',
    eyebrow: 'Zonificación de Funes',
    title: '¿Qué podés construir en tu lote?',
    description:
      'FOS, FOT, altura y metros, zona por zona en el mapa.',
    cta: 'Abrir el mapa',
    icon: <IconMap />,
  },
  {
    href: '/recursos/asistente-obras',
    eyebrow: 'Trámites de obra',
    title: '¿Cuánto vas a pagar por tu obra?',
    description:
      'Plusvalía, tasa de edificación y los papeles de cada trámite.',
    cta: 'Abrir el asistente',
    icon: <IconObra />,
  },
  {
    href: '/informes',
    eyebrow: 'Índices del mercado',
    title: 'Índices y mercado en vivo',
    description:
      'Dólar, IPC e ICL oficiales, actualizados cada semana.',
    cta: 'Ver los índices',
    icon: <IconPulse />,
  },
]

const CHEV = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="9 6 15 12 9 18" />
  </svg>
)

// La guía del comprador es la tarjeta protagonista (destacada, full-width).
const FEATURE_HREF = '/guia'

// Tema de color por tarjeta — patrón en damero (gris / verde / blanco / negro),
// como en la referencia de diseño.
const TILE_THEME: Record<string, string> = {
  '/recursos/calculadora-alquiler': 't-gray',
  '/recursos/ajuste-alquiler': 't-green',
  '/recursos/costos-de-construccion': 't-white',
  '/recursos/mapa-funes': 't-black',
  '/recursos/asistente-obras': 't-gray',
  '/informes': 't-green',
}

export default function RecursosIndexPage() {
  const feature = CARDS.find((c) => c.href === FEATURE_HREF)
  const rest = CARDS.filter((c) => c.href !== FEATURE_HREF)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, collectionJsonLd]) }}
      />
      <TrackPageView event="recursos_index_view" />
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div className="rb-page">
        <div className="rb-wrap">
          <header className="rb-hero">
            <span className="rb-eyebrow">Recursos</span>
            <h1 className="rb-h1">
              Información clara <span className="accent">para decidir mejor.</span>
            </h1>
            <p className="rb-sub">
              Calculadoras precisas y guías honestas, hechas por agentes que conocen el mercado.
            </p>
            <div className="rb-stats">
              <div className="rb-stat"><div className="n">{CARDS.length}</div><div className="l">herramientas</div></div>
              <div className="rb-stat"><div className="n">100%</div><div className="l">gratis</div></div>
              <div className="rb-stat"><div className="n">Oficial</div><div className="l">índices al día</div></div>
            </div>
          </header>

          <section className="rb-grid" aria-label="Herramientas y guías">
            {feature && (
              <Link href={feature.href} className="rb-tile feature">
                <div className="rb-feat-main">
                  <span className="rb-icon">{feature.icon}</span>
                  <span className="rb-tag">{feature.eyebrow}</span>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
                <span className="rb-feat-cta">{feature.cta} {CHEV}</span>
              </Link>
            )}

            {rest.map((card) => (
              <Link key={card.href} href={card.href} className={`rb-tile ${TILE_THEME[card.href] ?? 't-gray'}`}>
                <span className="rb-icon">{card.icon}</span>
                <span className="rb-tag">{card.eyebrow}</span>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <span className="rb-link">{card.cta} {CHEV}</span>
              </Link>
            ))}
          </section>
        </div>

        <RecursosCTA />
      </div>
    </>
  )
}
