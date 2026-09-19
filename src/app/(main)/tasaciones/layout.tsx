import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tasaciones profesionales en Funes, Roldán, Fisherton y Rosario | SI INMOBILIARIA',
  description: 'Mirá qué se pide por casas parecidas a la tuya en tu barrio de Funes, Roldán, Fisherton o la zona oeste de Rosario, y pedí tu tasación. Te escribimos por WhatsApp en menos de 24 h. Sin compromiso.',
  alternates: { canonical: 'https://siinmobiliaria.com/tasaciones' },
  openGraph: {
    title: 'Tasaciones en Funes, Roldán, Fisherton y Rosario | SI INMOBILIARIA',
    description: 'Tasación de propiedades en Funes, Roldán, Fisherton y la zona oeste de Rosario, con comparables locales y revisión de un corredor inmobiliario matriculado.',
    url: 'https://siinmobiliaria.com/tasaciones',
    // og-image.jpg regenerado como asset real 1200×630.
    images: ['/og-image.jpg'],
  },
}

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': 'https://siinmobiliaria.com/tasaciones#service',
    name: 'Tasaciones inmobiliarias profesionales',
    serviceType: 'Tasación inmobiliaria',
    url: 'https://siinmobiliaria.com/tasaciones',
    provider: { '@id': 'https://siinmobiliaria.com/#organization' },
    areaServed: ['Funes', 'Roldán', 'Fisherton', 'Rosario'].map((name) => ({
      '@type': 'City',
      name,
    })),
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: 'https://siinmobiliaria.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tasaciones',
        item: 'https://siinmobiliaria.com/tasaciones',
      },
    ],
  },
  // Sin FAQPage: las preguntas no se mostraban en la página y Google pide que
  // el FAQ marcado sea visible (el texto quedó en el historial de git).
]

export default function TasacionesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}
