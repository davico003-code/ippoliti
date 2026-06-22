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


// Rediseño premium (dirección Apple / Stripe / Linear). CSS scoped con prefijo
// `rb-`. Tipografía SF Pro / system stack solo en esta sección. Paleta del brief.
const STYLES = `
  .rb-page {
    --rb-font: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', system-ui, 'Segoe UI', sans-serif;
    --rb-green: #0F5A3D; --rb-green-deep: #0B3F2D; --rb-green-soft: #DDE7E1;
    --rb-ivory: #F6F4EE; --rb-card: #FCFBF7; --rb-line: rgba(0,0,0,0.06);
    --rb-ink: #111111; --rb-ink-2: #666666; --rb-ink-3: #8A8A8A;
    background: var(--rb-ivory); color: var(--rb-ink);
    font-family: var(--rb-font); -webkit-font-smoothing: antialiased;
  }
  .rb-wrap { max-width: 1120px; margin: 0 auto; padding: 0 clamp(22px, 5vw, 48px); }

  .rb-hero { padding: clamp(72px, 11vw, 132px) 0 clamp(40px, 6vw, 72px); max-width: 18ch; }
  .rb-eyebrow { font-size: 13px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: var(--rb-green); }
  .rb-h1 { font-size: clamp(44px, 7vw, 80px); line-height: 1.02; font-weight: 600; letter-spacing: -0.03em; margin: 20px 0 0; }
  .rb-h1 .accent { color: var(--rb-green); }
  .rb-sub { color: var(--rb-ink-2); font-size: clamp(18px, 1.6vw, 20px); margin: 26px 0 0; font-weight: 400; max-width: 30ch; line-height: 1.55; }
  .rb-trust { margin-top: 28px; font-size: 14px; color: var(--rb-ink-3); display: flex; flex-wrap: wrap; gap: 8px 14px; align-items: center; }
  .rb-trust .dot { width: 3px; height: 3px; border-radius: 50%; background: var(--rb-ink-3); opacity: .55; }

  .rb-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(16px, 1.6vw, 22px); padding-bottom: clamp(56px, 8vw, 96px); }

  .rb-tile {
    position: relative; display: flex; flex-direction: column;
    background: var(--rb-card); border: 1px solid var(--rb-line); border-radius: 26px;
    padding: clamp(24px, 2.2vw, 32px); min-height: 232px; text-decoration: none; color: inherit;
    box-shadow: 0 1px 2px rgba(17,17,17,0.03);
    transition: transform .22s cubic-bezier(.2,.7,.2,1), box-shadow .22s ease, border-color .22s ease;
  }
  .rb-tile:hover { transform: translateY(-3px) scale(1.01); box-shadow: 0 24px 48px -28px rgba(15,90,61,0.28); border-color: rgba(0,0,0,0.09); }

  .rb-icon { width: 46px; height: 46px; border-radius: 14px; background: var(--rb-green-soft); display: grid; place-items: center; color: var(--rb-green); flex: none; }
  .rb-icon svg { width: 22px; height: 22px; }
  .rb-tag { font-size: 12px; font-weight: 500; letter-spacing: 0.04em; color: var(--rb-ink-3); margin-top: 20px; }
  .rb-tile h3 { font-size: clamp(20px, 1.7vw, 23px); font-weight: 600; letter-spacing: -0.02em; margin-top: 8px; line-height: 1.2; color: var(--rb-ink); }
  .rb-tile p { font-size: 15px; color: var(--rb-ink-2); margin-top: 9px; line-height: 1.5; }
  .rb-link { margin-top: auto; padding-top: 18px; display: inline-flex; align-items: center; gap: 7px; font-size: 14px; font-weight: 500; color: var(--rb-green); }
  .rb-link svg { width: 16px; height: 16px; transition: transform .2s cubic-bezier(.2,.7,.2,1); }
  .rb-tile:hover .rb-link svg { transform: translateX(5px); }

  .rb-tile.feature {
    grid-column: span 3; flex-direction: row; align-items: center; justify-content: space-between;
    gap: clamp(28px, 4vw, 56px); background: var(--rb-green-deep); border-color: transparent; color: var(--rb-ivory);
    min-height: 0; padding: clamp(32px, 3.4vw, 52px) clamp(32px, 3.6vw, 56px);
  }
  .rb-tile.feature:hover { box-shadow: 0 30px 60px -32px rgba(11,63,45,0.55); }
  .rb-feat-main { display: flex; flex-direction: column; }
  .rb-tile.feature .rb-icon { background: rgba(246,244,238,0.12); color: var(--rb-ivory); }
  .rb-tile.feature .rb-tag { color: rgba(246,244,238,0.62); }
  .rb-tile.feature h3 { color: var(--rb-ivory); font-size: clamp(28px, 3.2vw, 40px); margin-top: 18px; max-width: 16ch; line-height: 1.08; }
  .rb-tile.feature p { color: rgba(246,244,238,0.72); font-size: clamp(16px, 1.4vw, 18px); margin-top: 12px; max-width: 42ch; }
  .rb-feat-cta { flex: none; display: inline-flex; align-items: center; gap: 9px; height: 52px; padding: 0 28px; background: var(--rb-ivory); color: var(--rb-green-deep); font-weight: 500; font-size: 16px; border-radius: 999px; transition: transform .2s cubic-bezier(.2,.7,.2,1); }
  .rb-tile.feature:hover .rb-feat-cta { transform: scale(1.03); }
  .rb-feat-cta svg { width: 17px; height: 17px; transition: transform .2s; }
  .rb-tile.feature:hover .rb-feat-cta svg { transform: translateX(4px); }

  @media (max-width: 920px) {
    .rb-grid { grid-template-columns: repeat(2, 1fr); }
    .rb-tile.feature { grid-column: span 2; }
  }
  @media (max-width: 620px) {
    .rb-grid { grid-template-columns: 1fr; }
    .rb-tile, .rb-tile.feature { grid-column: auto; min-height: 0; }
    .rb-tile.feature { flex-direction: column; align-items: flex-start; }
    .rb-feat-cta { width: 100%; justify-content: center; }
    .rb-hero { max-width: none; }
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

const ARROW = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

// La guía del comprador es la tarjeta protagonista (destacada, full-width).
const FEATURE_HREF = '/guia'

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
            <div className="rb-trust">
              <span>{CARDS.length} herramientas</span>
              <span className="dot" aria-hidden />
              <span>Gratis, sin registro</span>
              <span className="dot" aria-hidden />
              <span>Índices oficiales al día</span>
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
                <span className="rb-feat-cta">{feature.cta} {ARROW}</span>
              </Link>
            )}

            {rest.map((card) => (
              <Link key={card.href} href={card.href} className="rb-tile">
                <span className="rb-icon">{card.icon}</span>
                <span className="rb-tag">{card.eyebrow}</span>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <span className="rb-link">{card.cta} {ARROW}</span>
              </Link>
            ))}
          </section>
        </div>

        <RecursosCTA />
      </div>
    </>
  )
}
