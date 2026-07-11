import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import RecursoHero from '@/components/recursos/RecursoHero'
import RecursosCTA from '@/components/recursos/RecursosCTA'

const MapaFunesInteractivo = dynamic(
  () => import('@/components/recursos/MapaFunesInteractivo'),
  {
    ssr: false,
    loading: () => <MapaFunesSkeleton />,
  },
)

export const metadata: Metadata = {
  title: 'Mapa de zonificación de Funes | SI INMOBILIARIA',
  description:
    'Mapa interactivo de zonificación de Funes: pasá por tu zona y mirá FOS, FOT, altura y cuánto podés construir, con calculadora según las medidas del lote. Gratis y al instante.',
  alternates: {
    canonical: 'https://siinmobiliaria.com/recursos/mapa-funes',
  },
  keywords: [
    'zonificación Funes',
    'mapa de zonas Funes',
    'FOS FOT Funes',
    'cuánto puedo construir Funes',
    'indicadores urbanísticos Funes',
  ],
  openGraph: {
    title: 'Mapa de zonificación de Funes',
    description:
      'Pasá por tu zona y mirá FOS, FOT, altura y cuánto podés construir, con calculadora según las medidas del lote.',
    url: 'https://siinmobiliaria.com/recursos/mapa-funes',
    siteName: 'SI INMOBILIARIA',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'SI INMOBILIARIA' }],
    locale: 'es_AR',
    type: 'website',
  },
}

function MapaFunesSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="h-9 w-28 animate-pulse rounded-lg bg-gray-100" />
        <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-100" />
        <div className="h-9 w-32 animate-pulse rounded-lg bg-gray-100" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_392px]">
        <div className="aspect-[1044/566] min-h-[360px] animate-pulse rounded-2xl bg-gray-100" />
        <div className="min-h-[360px] animate-pulse rounded-2xl bg-gray-100" />
      </div>
    </div>
  )
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
      name: 'Mapa de zonificación de Funes',
      item: 'https://siinmobiliaria.com/recursos/mapa-funes',
    },
  ],
}

export default function MapaFunesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <RecursoHero
        theme="green"
        eyebrow="Zonificación de Funes"
        title="¿Qué podés construir en tu lote?"
        subtitle="Mapa interactivo de Funes: pasá por tu zona y mirá FOS, FOT, altura y cuánto podés construir, con calculadora según las medidas del lote."
        breadcrumbLabel="Mapa de zonificación de Funes"
      />

      <div style={{ maxWidth: 1640, margin: '0 auto', padding: '20px clamp(10px, 2.2vw, 26px) 0' }}>
        <MapaFunesInteractivo />
      </div>

      <RecursosCTA
        title="¿Buscás un lote en Funes?"
        text="Un agente te asesora sobre zonificación, factibilidad y oportunidades de compra."
      />
    </>
  )
}
