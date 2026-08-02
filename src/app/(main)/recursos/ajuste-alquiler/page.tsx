import type { Metadata } from 'next'
import CalculadoraAjuste from '@/components/recursos/CalculadoraAjuste'
import RecursoHero from '@/components/recursos/RecursoHero'

export const metadata: Metadata = {
  title: '¿Está bien calculado tu aumento de alquiler? | SI INMOBILIARIA',
  description:
    'Verificá el ajuste de tu alquiler con la calculadora oficial. ICL, IPC, CasaPropia y todos los índices explicados. Para vivienda y comercio.',
  alternates: {
    canonical: 'https://siinmobiliaria.com/recursos/ajuste-alquiler',
  },
  keywords: [
    'calcular ajuste alquiler',
    'aumento alquiler ICL',
    'índice contratos locación',
    'CasaPropia',
    'IPC alquiler',
    'ajuste alquiler Rosario',
  ],
  openGraph: {
    title: '¿Está bien calculado tu aumento de alquiler?',
    description:
      'Verificá el ajuste con la calculadora oficial. ICL, IPC, CasaPropia y todos los índices explicados.',
    url: 'https://siinmobiliaria.com/recursos/ajuste-alquiler',
    siteName: 'SI INMOBILIARIA',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'SI INMOBILIARIA' }],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Está bien calculado tu aumento de alquiler?',
    description: 'Verificá el ajuste con la calculadora oficial.',
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
      name: 'Verificar ajuste de alquiler',
      item: 'https://siinmobiliaria.com/recursos/ajuste-alquiler',
    },
  ],
}

const appJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Verificador de ajuste de alquiler',
  url: 'https://siinmobiliaria.com/recursos/ajuste-alquiler',
  description:
    'Verificá si el ajuste de tu alquiler está bien calculado. ICL, IPC, CasaPropia y otros índices explicados.',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  inLanguage: 'es-AR',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'ARS' },
  provider: { '@type': 'RealEstateAgent', '@id': 'https://siinmobiliaria.com/#organization' },
}

export default function AjusteAlquilerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, appJsonLd]) }}
      />

      <RecursoHero
        theme="green"
        eyebrow="Ajuste de alquiler"
        title="¿Está bien calculado tu ajuste?"
        subtitle="Verificá el ajuste de tu alquiler con la calculadora oficial. ICL, IPC, CasaPropia y todos los índices, siempre actualizados."
        breadcrumbLabel="Verificar ajuste de alquiler"
      />

      <CalculadoraAjuste />
    </>
  )
}
