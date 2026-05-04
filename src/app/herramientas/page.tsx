import type { Metadata } from 'next'
import HerramientaCard from '@/components/herramientas/HerramientaCard'
import TrackPageView from '@/components/herramientas/TrackPageView'

export const metadata: Metadata = {
  title: 'Herramientas para inquilinos | SI Inmobiliaria',
  description:
    'Calculadoras gratuitas para alquilar: costos iniciales, ajuste de alquiler por ICL, IPC y más. Información clara para inquilinos en Rosario, Funes y Roldán.',
  alternates: { canonical: 'https://siinmobiliaria.com/herramientas' },
  openGraph: {
    title: 'Herramientas para inquilinos | SI Inmobiliaria',
    description:
      'Calculadoras gratuitas para alquilar: costos iniciales, ajuste por índice y más.',
    url: 'https://siinmobiliaria.com/herramientas',
    siteName: 'SI Inmobiliaria',
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'SI Inmobiliaria' }],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Herramientas para inquilinos | SI Inmobiliaria',
    description: 'Calculadoras gratuitas para alquilar.',
    images: ['/logo.png'],
  },
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://siinmobiliaria.com' },
    { '@type': 'ListItem', position: 2, name: 'Herramientas', item: 'https://siinmobiliaria.com/herramientas' },
  ],
}

const collectionJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Herramientas para inquilinos',
  url: 'https://siinmobiliaria.com/herramientas',
  description:
    'Calculadoras gratuitas para alquilar: costos iniciales y verificación de ajuste por índice.',
  hasPart: [
    {
      '@type': 'WebApplication',
      name: 'Calculadora de costos iniciales para alquilar',
      url: 'https://siinmobiliaria.com/herramientas/calculadora-alquiler',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'ARS' },
    },
    {
      '@type': 'WebApplication',
      name: 'Verificador de ajuste de alquiler',
      url: 'https://siinmobiliaria.com/herramientas/ajuste-alquiler',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'ARS' },
    },
  ],
}

const IconCalc = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6"
    aria-hidden
  >
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <rect x="7" y="6" width="10" height="3.5" rx="0.5" />
    <circle cx="8.5" cy="13" r="0.6" fill="currentColor" />
    <circle cx="12" cy="13" r="0.6" fill="currentColor" />
    <circle cx="15.5" cy="13" r="0.6" fill="currentColor" />
    <circle cx="8.5" cy="16.5" r="0.6" fill="currentColor" />
    <circle cx="12" cy="16.5" r="0.6" fill="currentColor" />
    <circle cx="15.5" cy="16.5" r="0.6" fill="currentColor" />
  </svg>
)

const IconChart = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6"
    aria-hidden
  >
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M14 7h7v7" />
  </svg>
)

export default function HerramientasIndexPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, collectionJsonLd]) }}
      />
      <TrackPageView event="herramientas_index_view" />

      <div className="min-h-screen" style={{ background: '#FAFAF7' }}>
        <div className="max-w-[960px] mx-auto px-5 pt-10 pb-20 font-raleway" style={{ color: 'var(--tinta)' }}>
          <header className="mb-8 sm:mb-10">
            <div
              className="text-[12px] font-semibold uppercase tracking-[1.4px] mb-3"
              style={{ color: 'var(--si-green)' }}
            >
              Herramientas
            </div>
            <h1
              className="font-black text-[clamp(30px,6vw,44px)] leading-[1.05] tracking-tight m-0 mb-3"
              style={{ color: 'var(--tinta)' }}
            >
              Calculadoras para inquilinos
            </h1>
            <p
              className="text-[16px] max-w-[600px] m-0 leading-relaxed"
              style={{ color: 'var(--tinta-soft)' }}
            >
              Información clara antes de firmar y durante tu contrato. Gratis, al instante,
              sin registro.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <HerramientaCard
              href="/herramientas/calculadora-alquiler"
              eyebrow="Antes de mudarte"
              title="¿Cuánto necesito para alquilar?"
              description="Calculá los costos iniciales: primer mes, honorarios, sellado, depósito en dólares y administrativo. Vivienda o comercio, en pesos o en dólares."
              cta="Calcular costos iniciales"
              icon={IconCalc}
            />
            <HerramientaCard
              href="/herramientas/ajuste-alquiler"
              eyebrow="Durante tu contrato"
              title="¿Está bien calculado tu ajuste?"
              description="Verificá el ajuste de tu alquiler con la calculadora oficial. ICL, IPC, CasaPropia y todos los índices explicados, para vivienda y comercio."
              cta="Verificar mi ajuste"
              icon={IconChart}
            />
          </div>
        </div>
      </div>
    </>
  )
}
