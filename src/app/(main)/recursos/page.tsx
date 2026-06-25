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


// Rediseño v3 — layout 2 columnas (izquierda: intro + stats; derecha: bento con
// "Guía" destacada arriba + grilla 2 col). Estilo v2 (damero verde/negro/gris/
// blanco, tipografía SF Pro). Botones circulares de flecha. Sin beige. Scoped `rb-`.
const STYLES = `
  .rb-page {
    --rb-font: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', system-ui, 'Segoe UI', sans-serif;
    --rb-accent: #00754A; --rb-green-deep: #1A5C38; --rb-soft: #DDEDE4;
    --rb-bg: #FFFFFF; --rb-gray: #F6F6F4; --rb-line: rgba(0,0,0,0.08);
    --rb-ink: #111111; --rb-ink-2: #5A5A5A; --rb-ink-3: #8A8A8A;
    --rb-on-dark: rgba(255,255,255,0.74); --rb-green-light: #7CCBA1;
    --rb-red: #F40009; --rb-yellow: #fbce07;
    background: var(--rb-bg); color: var(--rb-ink);
    font-family: var(--rb-font); -webkit-font-smoothing: antialiased;
  }
  .rb-wrap { max-width: 1240px; margin: 0 auto; padding: 0 clamp(22px, 5vw, 48px); }

  .rb-split { display: grid; grid-template-columns: minmax(300px, 380px) 1fr; gap: clamp(36px, 5vw, 72px); padding: clamp(56px, 8vw, 104px) 0; align-items: start; }
  .rb-intro { position: sticky; top: 104px; }
  .rb-eyebrow { font-size: 13px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: var(--rb-ink-3); }
  .rb-h1 { font-size: clamp(40px, 4.4vw, 60px); line-height: 1.02; font-weight: 800; letter-spacing: -0.035em; margin: 22px 0 0; }
  .rb-h1 .accent { color: var(--rb-accent); }
  .rb-sub { color: var(--rb-ink-2); font-size: clamp(17px, 1.3vw, 19px); margin: 22px 0 0; font-weight: 400; max-width: 30ch; line-height: 1.55; }
  .rb-stats { display: flex; gap: clamp(20px, 2.4vw, 36px); margin-top: 34px; padding-top: 30px; border-top: 1px solid var(--rb-line); }
  .rb-stat .si { color: var(--rb-ink-3); }
  .rb-stat .si svg { width: 24px; height: 24px; }
  .rb-stat .n { font-size: clamp(24px, 2vw, 28px); font-weight: 800; letter-spacing: -0.02em; color: var(--rb-accent); margin-top: 12px; font-variant-numeric: tabular-nums; line-height: 1; }
  .rb-stat .l { font-size: 13px; color: var(--rb-ink-3); margin-top: 4px; }

  .rb-bento { display: flex; flex-direction: column; gap: clamp(16px, 1.5vw, 22px); }
  .rb-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: clamp(16px, 1.5vw, 22px); }

  .rb-tile {
    position: relative; display: flex; flex-direction: column; align-items: flex-start; text-align: left;
    border-radius: 28px; padding: clamp(26px, 2.4vw, 34px); min-height: 232px;
    text-decoration: none; color: inherit;
    transition: transform .25s cubic-bezier(.2,.7,.2,1), box-shadow .25s ease;
  }
  .rb-tile:hover { transform: translateY(-4px); }

  .rb-icon { width: 50px; height: 50px; border-radius: 15px; background: var(--rb-soft); display: grid; place-items: center; color: var(--rb-accent); flex: none; }
  .rb-icon svg { width: 24px; height: 24px; }
  .rb-tag { font-size: 12px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--rb-accent); margin-top: 20px; }
  .rb-tile h3 { font-size: clamp(20px, 1.5vw, 23px); font-weight: 700; letter-spacing: -0.02em; margin-top: 8px; line-height: 1.18; color: var(--rb-ink); }
  .rb-tile p { font-size: 14.5px; color: var(--rb-ink-2); margin-top: 9px; line-height: 1.5; max-width: 34ch; }
  .rb-arrow { margin-top: auto; padding-top: 20px; }
  .rb-arrow span { width: 44px; height: 44px; border-radius: 999px; background: #fff; border: 1px solid var(--rb-line); display: inline-grid; place-items: center; color: var(--rb-green-deep); transition: background .2s ease, color .2s ease, transform .2s cubic-bezier(.2,.7,.2,1); }
  .rb-arrow svg { width: 17px; height: 17px; }
  .rb-tile:hover .rb-arrow span { background: var(--rb-accent); color: #fff; border-color: var(--rb-accent); transform: translateX(3px); }

  .rb-tile.t-gray { background: var(--rb-gray); }
  .rb-tile.t-white { background: #FFFFFF; border: 1px solid var(--rb-line); }
  .rb-tile.t-green { background: linear-gradient(155deg, #1A5C38, #123F27); color: #fff; }
  .rb-tile.t-gray:hover, .rb-tile.t-white:hover { box-shadow: 0 24px 50px -30px rgba(0,0,0,0.20); }
  .rb-tile.t-green:hover { box-shadow: 0 28px 56px -30px rgba(0,0,0,0.45); }
  .rb-tile.t-green .rb-icon { background: rgba(255,255,255,0.12); color: #fff; }
  .rb-tile.t-green h3 { color: #fff; }
  .rb-tile.t-green p { color: var(--rb-on-dark); }
  .rb-tile.t-green .rb-tag { color: var(--rb-green-light); }

  .rb-dot { width: 7px; height: 7px; border-radius: 999px; display: inline-block; flex: none; }
  .rb-dot.y { background: var(--rb-yellow); margin-right: 6px; vertical-align: middle; }
  .rb-dot.r { background: var(--rb-red); animation: rbpulse 1.6s ease-in-out infinite; }
  .rb-tag.live { display: inline-flex; align-items: center; gap: 8px; }
  @keyframes rbpulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .4; transform: scale(.8); } }

  .rb-tile.feature {
    flex-direction: row; align-items: center; justify-content: space-between; gap: clamp(28px, 4vw, 56px);
    background: linear-gradient(150deg, #1A5C38, #123F27); color: #fff;
    min-height: 0; padding: clamp(32px, 3vw, 48px); border-radius: 28px;
  }
  .rb-tile.feature:hover { transform: translateY(-4px); box-shadow: 0 30px 60px -32px rgba(11,63,45,0.55); }
  .rb-feat-main { display: flex; flex-direction: column; align-items: flex-start; }
  .rb-tile.feature .rb-icon { background: rgba(255,255,255,0.1); color: #fff; }
  .rb-tile.feature .rb-tag { color: var(--rb-green-light); }
  .rb-tile.feature h3 { color: #fff; font-size: clamp(26px, 2.6vw, 34px); margin-top: 14px; max-width: 18ch; line-height: 1.1; }
  .rb-tile.feature p { color: var(--rb-on-dark); font-size: clamp(15px, 1.3vw, 17px); margin-top: 10px; max-width: 42ch; }
  .rb-tile.feature .rb-arrow { margin: 0; padding: 0; flex: none; }
  .rb-tile.feature .rb-arrow span { width: 56px; height: 56px; background: #fff; border-color: transparent; color: var(--rb-green-deep); }
  .rb-tile.feature .rb-arrow svg { width: 20px; height: 20px; }
  .rb-tile.feature:hover .rb-arrow span { background: #fff; color: var(--rb-green-deep); transform: translateX(3px); }

  @media (max-width: 980px) {
    .rb-split { grid-template-columns: 1fr; gap: clamp(32px, 6vw, 48px); padding: clamp(48px, 8vw, 72px) 0; }
    .rb-intro { position: static; }
    .rb-sub { max-width: 46ch; }
  }
  @media (max-width: 620px) {
    .rb-grid { grid-template-columns: 1fr; }
    .rb-tile { min-height: 0; }
    .rb-tile.feature { flex-direction: column; align-items: flex-start; gap: 24px; }
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

// Íconos chicos para las 3 stats de la columna izquierda.
const STAT_ICONS = [
  (
    <svg key="tools" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  ),
  (
    <svg key="free" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="9" r="6" />
      <polyline points="8.5 13.5 7 22 12 19 17 22 15.5 13.5" />
    </svg>
  ),
  (
    <svg key="official" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3 4 6v6c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V6l-8-3Z" />
      <polyline points="9 12 11.5 14.5 16 9.5" />
    </svg>
  ),
]

// La guía del comprador es la tarjeta protagonista (destacada, full-width).
const FEATURE_HREF = '/guia'

// Tema de color por tarjeta — patrón en damero (gris / verde / blanco / negro),
// como en la referencia de diseño.
const TILE_THEME: Record<string, string> = {
  '/recursos/calculadora-alquiler': 't-gray',
  '/recursos/ajuste-alquiler': 't-green',
  '/recursos/costos-de-construccion': 't-white',
  '/recursos/mapa-funes': 't-green',
  '/recursos/asistente-obras': 't-gray',
  '/informes': 't-white',
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
          <section className="rb-split">
            <div className="rb-intro">
              <span className="rb-eyebrow">Recursos</span>
              <h1 className="rb-h1">
                Información clara <span className="accent">para decidir mejor.</span>
              </h1>
              <p className="rb-sub">
                Calculadoras precisas y guías honestas, hechas por agentes que conocen el mercado.
              </p>
              <div className="rb-stats">
                <div className="rb-stat"><span className="si">{STAT_ICONS[0]}</span><div className="n">{CARDS.length}</div><div className="l">herramientas</div></div>
                <div className="rb-stat"><span className="si">{STAT_ICONS[1]}</span><div className="n">100%</div><div className="l"><span className="rb-dot y" aria-hidden />gratis</div></div>
                <div className="rb-stat"><span className="si">{STAT_ICONS[2]}</span><div className="n">Oficial</div><div className="l">índices al día</div></div>
              </div>
            </div>

            <div className="rb-bento" aria-label="Herramientas y guías">
              {feature && (
                <Link href={feature.href} prefetch={false} className="rb-tile feature">
                  <div className="rb-feat-main">
                    <span className="rb-icon">{feature.icon}</span>
                    <span className="rb-tag">{feature.eyebrow}</span>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                  <div className="rb-arrow" aria-hidden><span>{ARROW}</span></div>
                </Link>
              )}

              <div className="rb-grid">
                {rest.map((card) => (
                  <Link key={card.href} href={card.href} className={`rb-tile ${TILE_THEME[card.href] ?? 't-gray'}`}>
                    <span className="rb-icon">{card.icon}</span>
                    <span className={`rb-tag${card.href === '/informes' ? ' live' : ''}`}>
                      {card.href === '/informes' && <span className="rb-dot r" aria-hidden />}
                      {card.eyebrow}
                    </span>
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                    <div className="rb-arrow" aria-hidden><span>{ARROW}</span></div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </div>

        <RecursosCTA />
      </div>
    </>
  )
}
