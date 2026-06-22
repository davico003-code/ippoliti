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


// CSS scoped con prefijo `recursos-` para no contaminar el resto del sitio.
// Verde local #0F4128 — más oscuro que el global #1A5C38. Override solo acá.
const STYLES = `
  .rb-page { background: #fff; color: #15201b; }
  .rb-wrap { max-width: 1240px; margin: 0 auto; padding: 0 40px; }
  .rb-split { display: grid; grid-template-columns: 380px 1fr; gap: 64px; padding: 80px 0 40px; align-items: start; }
  .rb-intro { position: sticky; top: 110px; }
  .rb-eyebrow { display: inline-flex; align-items: center; gap: 12px; font-size: 13px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #9a7b3c; }
  .rb-eyebrow::before { content: ""; width: 32px; height: 2px; background: #9a7b3c; }
  .rb-h1 { font-size: clamp(38px, 4vw, 54px); line-height: 1.05; font-weight: 800; letter-spacing: -0.025em; margin: 22px 0 0; }
  .rb-h1 .accent { color: #15543a; }
  .rb-sub { color: #5e6a63; font-size: 17px; margin-top: 22px; font-weight: 500; max-width: 38ch; line-height: 1.5; }
  .rb-stats { display: flex; gap: 30px; margin-top: 34px; padding-top: 30px; border-top: 1px solid #e6eae7; }
  .rb-stat .n { font-size: 28px; font-weight: 800; color: #15543a; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
  .rb-stat .l { font-size: 13px; color: #5e6a63; font-weight: 600; margin-top: 2px; }

  .rb-bento { display: grid; grid-template-columns: repeat(2, 1fr); gap: 13px; }
  .rb-tile { position: relative; display: flex; flex-direction: column; border-radius: 18px; padding: 22px; background: #f3f5f3; border: 1px solid transparent; transition: transform .22s ease, box-shadow .22s ease; overflow: hidden; min-height: 180px; text-decoration: none; color: inherit; }
  .rb-tile:hover { transform: translateY(-4px); box-shadow: 0 26px 50px -30px rgba(20,60,40,0.5); }
  .rb-tile.green { background: #eef4ef; }
  .rb-tile.sand { background: #f6f2e9; }
  .rb-tile.feature { grid-column: span 2; background: #15543a; color: #fff; min-height: 0; }
  .rb-top { display: flex; align-items: center; justify-content: space-between; }
  .rb-icon { width: 42px; height: 42px; border-radius: 11px; background: #fff; display: grid; place-items: center; color: #15543a; flex: none; }
  .rb-icon svg { width: 22px; height: 22px; }
  .rb-tile.feature .rb-icon { background: rgba(255,255,255,0.14); color: #fff; }
  .rb-tag { font-size: 11px; font-weight: 700; letter-spacing: 1.8px; text-transform: uppercase; color: #9a7b3c; }
  .rb-tile.feature .rb-tag { color: #cfe6d8; }
  .rb-tile h3 { font-size: 19px; font-weight: 700; letter-spacing: -0.01em; margin-top: 15px; line-height: 1.18; }
  .rb-tile.feature h3 { font-size: clamp(22px, 2.2vw, 28px); max-width: 18ch; }
  .rb-tile p { font-size: 14px; color: #5e6a63; margin-top: 7px; line-height: 1.45; }
  .rb-tile.feature p { color: rgba(255,255,255,0.8); font-size: 15px; max-width: 46ch; margin-top: 10px; }
  .rb-link { margin-top: auto; padding-top: 16px; display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: #15543a; }
  .rb-tile.feature .rb-link { color: #fff; }
  .rb-link svg { width: 16px; height: 16px; transition: transform .2s; }
  .rb-tile:hover .rb-link svg { transform: translateX(5px); }
  .rb-feat-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-top: 16px; }
  .rb-feat-cta { flex-shrink: 0; display: inline-flex; align-items: center; gap: 9px; background: #fff; color: #15543a; font-weight: 700; font-size: 14px; padding: 12px 22px; border-radius: 100px; }

  @media (max-width: 980px) {
    .rb-split { grid-template-columns: 1fr; gap: 40px; padding: 56px 0 30px; }
    .rb-intro { position: static; }
    .rb-sub { max-width: none; }
  }
  @media (max-width: 860px) {
    .rb-wrap { padding: 0 22px; }
    .rb-bento { grid-template-columns: 1fr; gap: 14px; }
    .rb-tile, .rb-tile.feature { grid-column: auto; min-height: 0; }
    .rb-tile { padding: 26px; }
    .rb-feat-row { flex-direction: column; align-items: flex-start; }
    .rb-feat-cta { width: 100%; justify-content: center; }
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

// Tematización por tile en el bento. La guía del comprador es el destacado.
const FEATURE_HREF = '/guia'
const TILE_THEME: Record<string, string> = {
  '/recursos/calculadora-alquiler': 'green',
  '/recursos/ajuste-alquiler': 'sand',
  '/informes': 'green',
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
                <div className="rb-stat"><div className="n">{CARDS.length}</div><div className="l">herramientas</div></div>
                <div className="rb-stat"><div className="n">100%</div><div className="l">gratis</div></div>
                <div className="rb-stat"><div className="n">Oficial</div><div className="l">índices al día</div></div>
              </div>
            </div>

            <div className="rb-bento">
              {feature && (
                <Link href={feature.href} className="rb-tile feature">
                  <div className="rb-top">
                    <span className="rb-icon">{feature.icon}</span>
                    <span className="rb-tag">{feature.eyebrow}</span>
                  </div>
                  <div className="rb-feat-row">
                    <div>
                      <h3>{feature.title}</h3>
                      <p>{feature.description}</p>
                    </div>
                    <span className="rb-feat-cta">{feature.cta} {ARROW}</span>
                  </div>
                </Link>
              )}

              {rest.map((card) => (
                <Link key={card.href} href={card.href} className={`rb-tile ${TILE_THEME[card.href] ?? ''}`}>
                  <div className="rb-top">
                    <span className="rb-icon">{card.icon}</span>
                    <span className="rb-tag">{card.eyebrow}</span>
                  </div>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                  <span className="rb-link">{card.cta} {ARROW}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <RecursosCTA />
      </div>
    </>
  )
}
