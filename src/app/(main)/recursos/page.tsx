import type { Metadata } from 'next'
import Link from 'next/link'
import TrackPageView from '@/components/recursos/TrackPageView'

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
  ],
}

const WHATSAPP_AGENTE = `https://wa.me/5493412101694?text=${encodeURIComponent(
  'Hola, vengo desde /recursos y quiero hablar con un agente.',
)}`

// CSS scoped con prefijo `recursos-` para no contaminar el resto del sitio.
// Verde local #0F4128 — más oscuro que el global #1A5C38. Override solo acá.
const STYLES = `
  .recursos-page {
    --r-verde: #0F4128;
    --r-verde-deep: #0A2E1C;
    --r-gold: #B8935A;
    --r-gold-deep: #9A7A48;
    --r-paper-tenue: #F7F4EE;
    --r-paper-icon: #EFEBE2;
    --r-text-strong: #1A1A1A;
    --r-text-readable: #3A3A3A;
    --r-border: rgba(0, 0, 0, 0.08);
    --r-border-strong: rgba(0, 0, 0, 0.14);
    background: #fff;
    color: var(--r-text-strong);
    font-family: 'Poppins', system-ui, sans-serif;
  }

  /* HERO */
  .recursos-hero { background: #fff; padding: 72px 0 56px; }
  .recursos-hero-inner { max-width: 1280px; margin: 0 auto; padding: 0 40px; }
  .recursos-hero-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    font-family: 'Raleway', system-ui, sans-serif;
    font-size: 12px;
    font-weight: 800;
    color: var(--r-verde);
    letter-spacing: 3px;
    text-transform: uppercase;
  }
  .recursos-hero-eyebrow::before {
    content: '';
    width: 36px;
    height: 2px;
    background: var(--r-gold);
  }
  .recursos-hero-title {
    font-family: 'Raleway', system-ui, sans-serif;
    font-size: clamp(40px, 5.2vw, 64px);
    font-weight: 800;
    line-height: 1.08;
    letter-spacing: -0.025em;
    color: var(--r-text-strong);
    max-width: 920px;
    margin: 0 0 22px;
  }
  .recursos-hero-title-accent { color: var(--r-verde); }
  .recursos-hero-subtitle {
    font-family: 'Poppins', system-ui, sans-serif;
    font-size: 17px;
    font-weight: 400;
    color: var(--r-text-readable);
    max-width: 600px;
    line-height: 1.6;
    margin: 0;
  }

  /* CARDS */
  .recursos-cards-section { background: #fff; padding: 0 0 88px; }
  .recursos-cards-grid {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 40px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  .recursos-card {
    background: var(--r-paper-tenue);
    border: 1px solid var(--r-border);
    border-radius: 16px;
    padding: 36px 32px;
    cursor: pointer;
    transition: background 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                border-color 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    display: flex;
    flex-direction: column;
    min-height: 320px;
    position: relative;
    text-decoration: none;
    color: inherit;
    overflow: hidden;
  }
  .recursos-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: var(--r-verde);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .recursos-card:hover {
    background: #fff;
    border-color: var(--r-border-strong);
    transform: translateY(-4px);
    box-shadow: 0 20px 50px -15px rgba(15, 65, 40, 0.18);
  }
  .recursos-card:hover::before { transform: scaleX(1); }
  .recursos-card:focus-visible {
    outline: 2px solid var(--r-verde);
    outline-offset: 3px;
  }
  .recursos-card-icon {
    width: 52px;
    height: 52px;
    background: var(--r-paper-icon);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
    transition: background 0.3s, color 0.3s;
    color: var(--r-verde);
  }
  .recursos-card:hover .recursos-card-icon {
    background: var(--r-verde);
    color: #fff;
  }
  .recursos-card-icon svg { width: 24px; height: 24px; }
  .recursos-card-eyebrow {
    font-family: 'Raleway', system-ui, sans-serif;
    font-size: 11px;
    font-weight: 800;
    color: var(--r-gold);
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 12px;
  }
  .recursos-card-title {
    font-family: 'Raleway', system-ui, sans-serif;
    font-size: 25px;
    font-weight: 800;
    line-height: 1.18;
    letter-spacing: -0.015em;
    color: var(--r-text-strong);
    margin: 0 0 14px;
  }
  .recursos-card-desc {
    font-family: 'Poppins', system-ui, sans-serif;
    font-size: 15px;
    font-weight: 400;
    color: var(--r-text-readable);
    line-height: 1.6;
    margin: 0 0 24px;
    flex-grow: 1;
  }
  .recursos-card-cta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--r-verde);
    font-weight: 700;
    font-size: 14px;
    font-family: 'Poppins', system-ui, sans-serif;
    transition: gap 0.25s ease, color 0.25s ease;
  }
  .recursos-card:hover .recursos-card-cta {
    gap: 14px;
    color: var(--r-verde-deep);
  }
  .recursos-card-cta svg { transition: transform 0.25s ease; }
  .recursos-card:hover .recursos-card-cta svg { transform: translateX(2px); }

  /* INVITATION */
  .recursos-invitation {
    background: var(--r-verde);
    color: #fff;
    padding: 72px 0;
    position: relative;
    overflow: hidden;
  }
  .recursos-invitation::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 50%;
    height: 100%;
    background: radial-gradient(ellipse at top right, rgba(184, 147, 90, 0.18) 0%, transparent 60%);
    pointer-events: none;
  }
  .recursos-invitation-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 56px;
    flex-wrap: wrap;
    position: relative;
    z-index: 1;
  }
  .recursos-invitation-left { max-width: 620px; }
  .recursos-invitation-eyebrow {
    font-family: 'Raleway', system-ui, sans-serif;
    font-size: 12px;
    font-weight: 800;
    color: var(--r-gold);
    letter-spacing: 2.5px;
    text-transform: uppercase;
    margin-bottom: 16px;
  }
  .recursos-invitation-title {
    font-family: 'Raleway', system-ui, sans-serif;
    font-size: 34px;
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -0.02em;
    margin: 0 0 16px;
    color: #fff;
  }
  .recursos-invitation-text {
    font-family: 'Poppins', system-ui, sans-serif;
    font-size: 16px;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.82);
    line-height: 1.6;
    margin: 0;
  }
  .recursos-invitation-actions {
    display: flex;
    gap: 12px;
    flex-shrink: 0;
    flex-wrap: wrap;
  }
  .recursos-btn-primary {
    background: var(--r-gold);
    color: #fff;
    padding: 14px 28px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 700;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    transition: background 0.2s ease;
    font-family: 'Poppins', system-ui, sans-serif;
  }
  .recursos-btn-primary:hover { background: var(--r-gold-deep); }
  .recursos-btn-secondary {
    background: transparent;
    color: #fff;
    padding: 14px 28px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    transition: background 0.2s ease, border-color 0.2s ease;
    font-family: 'Poppins', system-ui, sans-serif;
  }
  .recursos-btn-secondary:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.5);
  }

  /* RESPONSIVE */
  @media (max-width: 968px) {
    .recursos-cards-grid { grid-template-columns: 1fr; }
    .recursos-invitation-inner { flex-direction: column; align-items: flex-start; gap: 28px; }
    .recursos-hero { padding: 52px 0 36px; }
    .recursos-hero-title { font-weight: 900; }
    .recursos-cards-section { padding: 0 0 56px; }
    .recursos-invitation { padding: 56px 0; }
    .recursos-invitation-title { font-size: 28px; }
    .recursos-card-title { font-size: 23px; }
    .recursos-hero-inner,
    .recursos-cards-grid,
    .recursos-invitation-inner {
      padding-left: 24px;
      padding-right: 24px;
    }
  }
`

function IconArrowRight() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

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
    eyebrow: 'Antes de mudarte',
    title: '¿Cuánto necesito para alquilar?',
    description:
      'Calculá los costos iniciales: primer mes, honorarios, sellado, depósito en dólares y administrativo.',
    cta: 'Calcular costos',
    icon: <IconCalc />,
  },
  {
    href: '/recursos/ajuste-alquiler',
    eyebrow: 'Durante tu contrato',
    title: '¿Está bien calculado tu ajuste?',
    description:
      'Verificá el ajuste de tu alquiler con la calculadora oficial. ICL, IPC, CasaPropia y todos los índices.',
    cta: 'Verificar ajuste',
    icon: <IconChart />,
  },
  {
    href: '/guia',
    eyebrow: 'Para comprar',
    title: 'Guía del comprador',
    description:
      'Todo lo que tenés que saber antes de comprar tu propiedad: pasos, documentación, escritura, gastos.',
    cta: 'Leer la guía',
    icon: <IconBook />,
  },
]

export default function RecursosIndexPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, collectionJsonLd]) }}
      />
      <TrackPageView event="recursos_index_view" />
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div className="recursos-page">
        <section className="recursos-hero">
          <div className="recursos-hero-inner">
            <div className="recursos-hero-eyebrow">Recursos</div>
            <h1 className="recursos-hero-title">
              Información clara<br />
              <span className="recursos-hero-title-accent">para decidir mejor.</span>
            </h1>
            <p className="recursos-hero-subtitle">
              Calculadoras precisas, guías honestas y la información que necesitás antes de firmar.
              Hechas por agentes que conocen el mercado.
            </p>
          </div>
        </section>

        <section className="recursos-cards-section">
          <div className="recursos-cards-grid">
            {CARDS.map((card) => (
              <Link key={card.href} href={card.href} className="recursos-card">
                <div className="recursos-card-icon">{card.icon}</div>
                <div className="recursos-card-eyebrow">{card.eyebrow}</div>
                <h3 className="recursos-card-title">{card.title}</h3>
                <p className="recursos-card-desc">{card.description}</p>
                <span className="recursos-card-cta">
                  {card.cta}
                  <IconArrowRight />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="recursos-invitation">
          <div className="recursos-invitation-inner">
            <div className="recursos-invitation-left">
              <div className="recursos-invitation-eyebrow">¿Necesitás más?</div>
              <h2 className="recursos-invitation-title">
                Algunas decisiones se toman mejor con alguien al lado.
              </h2>
              <p className="recursos-invitation-text">
                Las herramientas resuelven lo que se puede resolver con números. Para lo demás,
                estamos nosotros.
              </p>
            </div>
            <div className="recursos-invitation-actions">
              <a
                href={WHATSAPP_AGENTE}
                target="_blank"
                rel="noopener noreferrer"
                className="recursos-btn-primary"
              >
                Hablar con un agente
                <IconArrowRight />
              </a>
              <Link href="/propiedades" className="recursos-btn-secondary">
                Ver propiedades
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
