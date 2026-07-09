import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import TrackPageView from '@/components/recursos/TrackPageView'
import RecursosCTA from '@/components/recursos/RecursosCTA'

export const metadata: Metadata = {
  title: 'Recursos | SI INMOBILIARIA',
  description:
    'Calculadoras, guías y herramientas para inquilinos y compradores: costos iniciales para alquilar, verificación de ajuste por ICL/IPC y guía del comprador.',
  alternates: { canonical: 'https://siinmobiliaria.com/recursos' },
  openGraph: {
    title: 'Recursos | SI INMOBILIARIA',
    description:
      'Calculadoras, guías y herramientas para inquilinos y compradores. Gratis, al instante, sin registro.',
    url: 'https://siinmobiliaria.com/recursos',
    siteName: 'SI INMOBILIARIA',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'SI INMOBILIARIA' }],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Recursos | SI INMOBILIARIA',
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

const STYLES = `
  .rr-page {
    background: #ffffff;
    font-family: var(--font-raleway), Raleway, system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  .rr-wrap {
    width: min(100% - 40px, 1282px);
    margin: 0 auto;
    padding: clamp(18px, 2.2vw, 26px) 0 28px;
  }
  .rr-content {
    display: grid;
    grid-template-columns: minmax(300px, 380px) minmax(0, 1fr);
    gap: clamp(32px, 4vw, 56px);
    align-items: start;
  }
  .rr-intro {
    color: #111111;
    padding-top: clamp(4px, 1vw, 8px);
  }
  .rr-eyebrow {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.17em;
    text-transform: uppercase;
    color: #5b5b5b;
    margin: 0 0 14px;
  }
  .rr-title {
    margin: 0;
    font-size: clamp(34px, 4vw, 56px);
    line-height: 0.98;
    letter-spacing: -0.03em;
    font-weight: 800;
  }
  .rr-title b {
    color: #1a5c38;
    font-weight: 800;
  }
  .rr-sub {
    margin: 18px 0 0;
    font-size: clamp(16px, 1.45vw, 19px);
    line-height: 1.55;
    color: #4f4f4f;
    max-width: 34ch;
  }
  .rr-stats {
    margin-top: 28px;
    padding-top: 28px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    border-top: 1px solid rgba(0, 0, 0, 0.08);
  }
  .rr-stat-label {
    margin-top: 6px;
    font-size: 13px;
    line-height: 1.2;
    color: #787878;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .rr-stat-value {
    font-size: clamp(24px, 2.2vw, 32px);
    line-height: 1;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #1a5c38;
  }

  .rr-bento {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }
  .rr-card {
    position: relative;
    display: block;
    overflow: hidden;
    aspect-ratio: 634 / 246;
    border-radius: 8px;
    text-decoration: none;
    box-shadow: 0 18px 34px -28px rgba(8, 22, 16, 0.34);
    transition: transform 220ms cubic-bezier(.2,.7,.2,1), box-shadow 220ms ease;
  }
  .rr-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 24px 48px -30px rgba(8, 22, 16, 0.44);
  }
  .rr-card--feature {
    grid-column: 1 / -1;
    aspect-ratio: 1282 / 358;
  }
  .rr-media {
    position: absolute;
    inset: 0;
  }
  .rr-media img {
    object-fit: cover;
    image-rendering: auto;
  }
  @media (max-width: 760px) {
    .rr-wrap {
      width: min(100% - 28px, 1280px);
    }
    .rr-content {
      grid-template-columns: 1fr;
      gap: 16px;
    }
    .rr-stats {
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .rr-bento {
      grid-template-columns: 1fr;
      gap: 14px;
    }
    .rr-title {
      font-size: clamp(34px, 11vw, 42px);
    }
    .rr-sub {
      max-width: 46ch;
    }
  }
`

interface CardData {
  href: string
  title: string
  image: {
    src: string
    alt: string
    sizes: string
  }
}

const CARDS: CardData[] = [
  {
    href: '/guia',
    title: 'Todo lo que necesitás saber antes de comprar.',
    image: {
      src: '/recursos/placa-guia.webp',
      alt: 'Guía del comprador: todo lo que necesitás saber antes de comprar',
      sizes: 'min(100vw - 40px, 1282px)',
    },
  },
  {
    href: '/recursos/calculadora-alquiler',
    title: '¿Cuánto necesito para alquilar?',
    image: {
      src: '/recursos/placa-alquiler.webp',
      alt: 'Calculá cuánto necesitás para alquilar',
      sizes: '(max-width: 760px) calc(100vw - 28px), calc((min(100vw - 40px, 1282px) - 20px) / 2)',
    },
  },
  {
    href: '/recursos/ajuste-alquiler',
    title: '¿Está bien calculado tu ajuste?',
    image: {
      src: '/recursos/placa-ajuste.webp',
      alt: 'Verificá si está bien calculado tu ajuste',
      sizes: '(max-width: 760px) calc(100vw - 28px), calc((min(100vw - 40px, 1282px) - 20px) / 2)',
    },
  },
  {
    href: '/recursos/costos-de-construccion',
    title: '¿Cuánto cuesta construir?',
    image: {
      src: '/recursos/placa-construccion.webp',
      alt: 'Estimá cuánto cuesta construir',
      sizes: '(max-width: 760px) calc(100vw - 28px), calc((min(100vw - 40px, 1282px) - 20px) / 2)',
    },
  },
  {
    href: '/recursos/mapa-funes',
    title: '¿Qué podés construir en tu lote?',
    image: {
      src: '/recursos/placa-mapa.webp',
      alt: 'Explorá qué podés construir en tu lote',
      sizes: '(max-width: 760px) calc(100vw - 28px), calc((min(100vw - 40px, 1282px) - 20px) / 2)',
    },
  },
]

export default function RecursosIndexPage() {
  const [feature, ...rest] = CARDS

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, collectionJsonLd]) }}
      />
      <TrackPageView event="recursos_index_view" />
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

    <div className="rr-page">
        <main className="rr-wrap">
          <section className="rr-content" aria-label="Recursos">
            <div className="rr-intro">
              <p className="rr-eyebrow">Recursos</p>
              <h1 className="rr-title">
                Información clara <b>para decidir mejor.</b>
              </h1>
              <p className="rr-sub">
                Calculadoras precisas y guías honestas, hechas por agentes que conocen el
                mercado.
              </p>
              <div className="rr-stats">
                <div>
                  <div className="rr-stat-value">5</div>
                  <div className="rr-stat-label">herramientas</div>
                </div>
                <div>
                  <div className="rr-stat-value">100%</div>
                  <div className="rr-stat-label">gratis</div>
                </div>
                <div>
                  <div className="rr-stat-value">Oficial</div>
                  <div className="rr-stat-label">índices al día</div>
                </div>
              </div>
            </div>

            <div className="rr-bento" aria-label="Herramientas y guías">
              <ResourceCard card={feature} featured priority />
              {rest.map((card) => (
                <ResourceCard key={card.href} card={card} />
              ))}
            </div>
          </section>
        </main>

        <RecursosCTA />
      </div>
    </>
  )
}

function ResourceCard({
  card,
  featured = false,
  priority = false,
}: {
  card: CardData
  featured?: boolean
  priority?: boolean
}) {
  return (
    <Link
      href={card.href}
      prefetch={false}
      className={`rr-card ${featured ? 'rr-card--feature' : ''}`}
      aria-label={card.title}
    >
      <span className="rr-media" aria-hidden>
        <Image
          src={card.image.src}
          alt={card.image.alt}
          fill
          quality={100}
          priority={priority}
          sizes={card.image.sizes}
        />
      </span>
    </Link>
  )
}
