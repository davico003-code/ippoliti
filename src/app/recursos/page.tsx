import type { Metadata } from 'next'
import RecursoCard from '@/components/recursos/RecursoCard'
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
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'SI Inmobiliaria' }],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Recursos | SI Inmobiliaria',
    description: 'Calculadoras, guías y herramientas para inquilinos y compradores.',
    images: ['/logo.png'],
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

const IconBook = (
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
    <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H6.5a1.5 1.5 0 0 0 0 3H19" />
    <path d="M9 7h7M9 11h7M9 15h5" />
  </svg>
)

export default function RecursosIndexPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, collectionJsonLd]) }}
      />
      <TrackPageView event="recursos_index_view" />

      <div className="min-h-screen" style={{ background: '#FAFAF7' }}>
        <div className="max-w-[1100px] mx-auto px-5 pt-10 pb-20 font-raleway" style={{ color: 'var(--tinta)' }}>
          <header className="mb-8 sm:mb-10">
            <div
              className="text-[12px] font-semibold uppercase tracking-[1.4px] mb-3"
              style={{ color: 'var(--si-green)' }}
            >
              Recursos · Información útil
            </div>
            <h1
              className="font-black text-[clamp(30px,6vw,44px)] leading-[1.05] tracking-tight m-0 mb-3"
              style={{ color: 'var(--tinta)' }}
            >
              Información útil para vos
            </h1>
            <p
              className="text-[16px] max-w-[620px] m-0 leading-relaxed"
              style={{ color: 'var(--tinta-soft)' }}
            >
              Calculadoras, guías y herramientas para inquilinos y compradores. Gratis,
              al instante, sin registro.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            <RecursoCard
              href="/recursos/calculadora-alquiler"
              eyebrow="Antes de mudarte"
              title="¿Cuánto necesito para alquilar?"
              description="Calculá los costos iniciales: primer mes, honorarios, sellado, depósito en dólares y administrativo. Vivienda o comercio, en pesos o en dólares."
              cta="Calcular costos iniciales"
              icon={IconCalc}
            />
            <RecursoCard
              href="/recursos/ajuste-alquiler"
              eyebrow="Durante tu contrato"
              title="¿Está bien calculado tu ajuste?"
              description="Verificá el ajuste de tu alquiler con la calculadora oficial. ICL, IPC, CasaPropia y todos los índices explicados, para vivienda y comercio."
              cta="Verificar mi ajuste"
              icon={IconChart}
            />
            <RecursoCard
              href="/guia"
              eyebrow="Para comprar"
              title="Guía del comprador"
              description="Todo lo que tenés que saber antes de comprar tu propiedad: pasos, documentación, escritura, gastos. Te acompañamos en cada etapa."
              cta="Leer la guía"
              icon={IconBook}
            />
          </div>
        </div>
      </div>
    </>
  )
}
