import type { Metadata } from 'next'
import AsistenteObrasFunes from '@/components/recursos/AsistenteObrasFunes'
import RecursoHero from '@/components/recursos/RecursoHero'
import RecursosCTA from '@/components/recursos/RecursosCTA'

export const metadata: Metadata = {
  title: 'Asistente de obras particulares de Funes | SI Inmobiliaria',
  description:
    'Calculá cuánto podés construir en tu lote de Funes (FOS, FOT, altura), la plusvalía por mayor aprovechamiento, la tasa de edificación y qué papeles necesitás para tu trámite. Gratis y al instante.',
  alternates: {
    canonical: 'https://siinmobiliaria.com/recursos/asistente-obras',
  },
  keywords: [
    'obras particulares Funes',
    'FOT FOS Funes',
    'cuánto puedo construir Funes',
    'plusvalía Funes',
    'tasa de edificación Funes',
    'permiso de obra Funes',
    'zonificación Funes',
  ],
  openGraph: {
    title: 'Asistente de obras particulares de Funes',
    description:
      'Cuánto podés construir, plusvalía, tasa de edificación y papeles para tu obra en Funes. Estimación orientativa, gratis.',
    url: 'https://siinmobiliaria.com/recursos/asistente-obras',
    siteName: 'SI Inmobiliaria',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'SI Inmobiliaria' }],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Asistente de obras particulares de Funes',
    description: 'Cuánto podés construir, plusvalía y tasas de tu obra en Funes. Gratis y al instante.',
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
      name: 'Asistente de obras particulares de Funes',
      item: 'https://siinmobiliaria.com/recursos/asistente-obras',
    },
  ],
}

const appJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Asistente de obras particulares de Funes',
  url: 'https://siinmobiliaria.com/recursos/asistente-obras',
  description:
    'Calculá cuánto podés construir en tu lote de Funes (FOS, FOT, altura), la plusvalía por mayor aprovechamiento, la tasa de edificación y qué papeles necesitás para tu trámite.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  inLanguage: 'es-AR',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'ARS' },
  provider: { '@type': 'RealEstateAgent', '@id': 'https://siinmobiliaria.com/#organization' },
}

export default function AsistenteObrasPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, appJsonLd]) }}
      />

      <RecursoHero
        theme="sand"
        eyebrow="Para construir"
        title="Asistente de obras particulares de Funes"
        subtitle="Cuánto podés construir (FOS, FOT, altura), plusvalía por mayor aprovechamiento, tasa de edificación y qué papeles necesitás para tu trámite."
        breadcrumbLabel="Asistente de obras particulares de Funes"
      />

      <AsistenteObrasFunes />

      <RecursosCTA />
    </>
  )
}
