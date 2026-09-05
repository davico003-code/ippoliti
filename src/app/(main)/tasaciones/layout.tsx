import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tasaciones profesionales en Funes, Roldán y Rosario | SI INMOBILIARIA',
  description: 'Mirá qué se pide por casas parecidas a la tuya en tu barrio de Funes, Roldán o Rosario y pedí tu tasación. Te escribimos por WhatsApp en menos de 24 h. Sin compromiso.',
  alternates: { canonical: 'https://siinmobiliaria.com/tasaciones' },
  openGraph: {
    title: 'Tasaciones profesionales | SI INMOBILIARIA',
    description: 'Tasación de propiedades con comparables locales y revisión de un corredor inmobiliario matriculado.',
    url: 'https://siinmobiliaria.com/tasaciones',
    // og-image.jpg regenerado como asset real 1200×630.
    images: ['/og-image.jpg'],
  },
}

const faq = [
  {
    q: '¿Qué diferencia hay entre el rango que muestra la página y una tasación profesional?',
    a: 'El rango es lo que se pide hoy por propiedades parecidas a la tuya, en tu barrio. La tasación profesional considera el estado, la orientación, la documentación y lo que se vendió de verdad, revisado por un corredor inmobiliario matriculado.',
  },
  {
    q: '¿En qué zonas realiza tasaciones SI INMOBILIARIA?',
    a: 'Principalmente en Funes y Roldán, y también en Fisherton, Rosario y el corredor oeste, según el tipo de propiedad.',
  },
  {
    q: '¿Qué información necesitan para comenzar?',
    a: 'El barrio, el tipo de propiedad y los metros aproximados. Para pedir la tasación alcanza con tu nombre y tu WhatsApp: te escribimos en menos de 24 h, sin compromiso.',
  },
]

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
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  },
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
