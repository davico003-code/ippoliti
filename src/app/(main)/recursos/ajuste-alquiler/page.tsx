import type { Metadata } from 'next'
import CalculadoraAjuste from '@/components/recursos/CalculadoraAjuste'
import Breadcrumbs from '@/components/recursos/Breadcrumbs'

export const metadata: Metadata = {
  title: '¿Está bien calculado tu aumento de alquiler? | SI Inmobiliaria',
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
    siteName: 'SI Inmobiliaria',
    images: [{ url: '/logo-si-horizontal.png', width: 1281, height: 212, alt: 'SI Inmobiliaria' }],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Está bien calculado tu aumento de alquiler?',
    description: 'Verificá el ajuste con la calculadora oficial.',
    images: ['/logo-si-horizontal.png'],
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

      <div style={{ background: 'var(--cream)' }}>
        <div className="max-w-[880px] mx-auto px-5 pt-6">
          <Breadcrumbs
            items={[
              { label: 'Inicio', href: '/' },
              { label: 'Recursos', href: '/recursos' },
              { label: 'Verificar ajuste de alquiler' },
            ]}
          />
        </div>
      </div>

      <CalculadoraAjuste />
    </>
  )
}
