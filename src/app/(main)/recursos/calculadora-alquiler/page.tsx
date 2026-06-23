import type { Metadata } from 'next'
import { Suspense } from 'react'
import CalculadoraCostos from '@/components/recursos/CalculadoraCostos'
import RecursoHero from '@/components/recursos/RecursoHero'
import RecursosCTA from '@/components/recursos/RecursosCTA'

export const metadata: Metadata = {
  title: 'Calculadora de alquiler — costos iniciales | SI Inmobiliaria',
  description:
    'Calculá cuánto necesitás para alquilar: primer mes, honorarios, sellado, depósito en dólares, costos administrativos. Gratis y al instante.',
  alternates: {
    canonical: 'https://siinmobiliaria.com/recursos/calculadora-alquiler',
  },
  keywords: [
    'calculadora alquiler',
    'cuánto cuesta alquilar',
    'costos iniciales alquiler',
    'alquilar Rosario',
    'alquilar Funes',
    'alquilar Roldán',
  ],
  openGraph: {
    title: 'Calculadora de costos iniciales para alquilar',
    description:
      'Calculá cuánto necesitás para alquilar: primer mes, honorarios, sellado, depósito en dólares, costos administrativos.',
    url: 'https://siinmobiliaria.com/recursos/calculadora-alquiler',
    siteName: 'SI Inmobiliaria',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'SI Inmobiliaria' }],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de alquiler — costos iniciales',
    description: 'Calculá cuánto necesitás para alquilar. Gratis y al instante.',
    images: ['/og-image.jpg'],
  },
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://siinmobiliaria.com' },
    { '@type': 'ListItem', position: 2, name: 'Recursos', item: 'https://siinmobiliaria.com/recursos' },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Calculadora de costos para alquilar',
      item: 'https://siinmobiliaria.com/recursos/calculadora-alquiler',
    },
  ],
}

const appJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Calculadora de costos iniciales para alquilar',
  url: 'https://siinmobiliaria.com/recursos/calculadora-alquiler',
  description:
    'Calculá cuánto necesitás para alquilar: primer mes, honorarios, sellado, depósito en dólares, costos administrativos.',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  inLanguage: 'es-AR',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'ARS' },
  provider: { '@type': 'RealEstateAgent', '@id': 'https://siinmobiliaria.com/#organization' },
}

export default function CalculadoraAlquilerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, appJsonLd]) }}
      />

      <RecursoHero
        theme="green"
        eyebrow="Costos para alquilar"
        title="¿Cuánto necesito para alquilar?"
        subtitle="Primer mes, honorarios, sellado y depósito en dólares. Calculá los costos iniciales al instante."
        breadcrumbLabel="Calculadora de costos para alquilar"
      />

      {/* Suspense necesario porque CalculadoraCostos usa useSearchParams() para
          prefill desde la card de la ficha de propiedad. */}
      <Suspense fallback={null}>
        <CalculadoraCostos />
      </Suspense>

      <RecursosCTA
        title="¿Encontraste la propiedad?"
        text="Un agente te acompaña con la reserva, los costos iniciales y el contrato."
      />
    </>
  )
}
