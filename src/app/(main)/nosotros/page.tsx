import type { Metadata } from 'next'
import NosotrosClient from './NosotrosClient'

export const metadata: Metadata = {
  title: 'Sobre nosotros — 40 años en Funes, Roldán y Rosario | SI INMOBILIARIA',
  description: 'Conocé la historia de SI INMOBILIARIA. Más de 40 años acompañando familias en Roldán, Funes y Rosario. Susana Ippoliti, Laura y David.',
  alternates: { canonical: 'https://siinmobiliaria.com/nosotros' },
  openGraph: {
    title: 'Sobre nosotros | SI INMOBILIARIA',
    description: 'Dos generaciones acompañando familias en Funes, Roldán y Rosario desde 1983.',
    url: 'https://siinmobiliaria.com/nosotros',
    images: ['/og-image.jpg'],
  },
}

const FAQ = [
  {
    q: '¿Quiénes dirigen SI INMOBILIARIA?',
    a: 'Susana Ippoliti fundó la inmobiliaria en 1983 y es corredora matriculada COCIR N.° 0559. La segunda generación está integrada por David Flores, corredor inmobiliario COCIR N.° 0621 y responsable de Funes, y Laura Flores, corredora inmobiliaria, administradora de empresas y responsable de Roldán.',
  },
  {
    q: '¿Hace cuánto tiempo trabaja SI INMOBILIARIA?',
    a: 'Trabaja desde 1983 en el mercado inmobiliario de la región. Hoy reúne dos generaciones y tres oficinas entre Roldán y Funes.',
  },
  {
    q: '¿En qué zonas opera SI INMOBILIARIA?',
    a: 'Su trabajo se concentra en Funes y Roldán, y también abarca Fisherton, Rosario y los barrios cerrados del corredor oeste, según el tipo de propiedad y operación.',
  },
  {
    q: '¿Qué servicios ofrece SI INMOBILIARIA?',
    a: 'Acompaña compraventas, alquileres, tasaciones y emprendimientos. Además publica herramientas de consulta y datos locales, con metodología, fuentes y fechas de actualización visibles.',
  },
  {
    q: '¿Cómo contacto a SI INMOBILIARIA?',
    a: 'Por WhatsApp al +54 9 341 210-1694, por email a contacto@siinmobiliaria.com o en las oficinas de Hipólito Yrigoyen 2643, Funes; Primero de Mayo 258 y Catamarca 775, Roldán.',
  },
]

const people = [
  {
    '@type': 'Person',
    '@id': 'https://siinmobiliaria.com/nosotros#susana-ippoliti',
    name: 'Susana Ippoliti',
    jobTitle: 'Fundadora y corredora inmobiliaria',
    image: 'https://siinmobiliaria.com/team/susana-ippoliti.jpg',
    url: 'https://siinmobiliaria.com/nosotros#susana-ippoliti',
    worksFor: { '@id': 'https://siinmobiliaria.com/#organization' },
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'Matrícula COCIR N.° 0559',
    },
    knowsAbout: ['mercado inmobiliario de Roldán', 'tasaciones', 'compraventa inmobiliaria'],
  },
  {
    '@type': 'Person',
    '@id': 'https://siinmobiliaria.com/nosotros#david-flores',
    name: 'David Flores',
    jobTitle: 'Corredor inmobiliario y responsable de la oficina Funes',
    image: 'https://siinmobiliaria.com/team/david-flores.jpg',
    url: 'https://siinmobiliaria.com/nosotros#david-flores',
    worksFor: { '@id': 'https://siinmobiliaria.com/#organization' },
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'Matrícula COCIR N.° 0621',
    },
    knowsAbout: ['mercado inmobiliario de Funes', 'tasaciones', 'barrios cerrados'],
  },
  {
    '@type': 'Person',
    '@id': 'https://siinmobiliaria.com/nosotros#laura-flores',
    name: 'Laura Flores',
    jobTitle: 'Corredora inmobiliaria, administradora de empresas y responsable de Roldán',
    image: 'https://siinmobiliaria.com/team/laura-flores.jpg',
    url: 'https://siinmobiliaria.com/nosotros#laura-flores',
    worksFor: { '@id': 'https://siinmobiliaria.com/#organization' },
    knowsAbout: ['mercado inmobiliario de Roldán', 'administración inmobiliaria', 'gestión de equipos'],
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    ...people,
    {
      '@type': 'FAQPage',
      '@id': 'https://siinmobiliaria.com/nosotros#preguntas',
      mainEntity: FAQ.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    },
  ],
}

export default function NosotrosPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NosotrosClient faq={FAQ} />
    </>
  )
}
