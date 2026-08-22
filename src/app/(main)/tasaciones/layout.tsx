import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tasaciones profesionales en Funes, Roldán y Rosario | SI INMOBILIARIA',
  description: 'Tasaciones profesionales de propiedades en Roldán, Funes y Rosario. Completá el formulario y te contactamos.',
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
    q: '¿Qué diferencia hay entre una estimación online y una tasación profesional?',
    a: 'La estimación online ofrece una referencia inicial. La tasación profesional incorpora visita, estado, ubicación exacta, documentación y comparables seleccionados por un corredor inmobiliario matriculado.',
  },
  {
    q: '¿En qué zonas realiza tasaciones SI INMOBILIARIA?',
    a: 'Principalmente en Funes y Roldán, y también en Fisherton, Rosario y el corredor oeste, según el tipo de propiedad.',
  },
  {
    q: '¿Qué información necesitan para comenzar?',
    a: 'La dirección, el tipo de inmueble, el objetivo de la tasación y un medio de contacto. Luego confirmamos qué documentación y visita requiere el caso.',
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
