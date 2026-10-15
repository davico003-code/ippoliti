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

// Mismos valores que el cuadro embebido en MapaFunesInteractivo (FAM): si cambian allá, cambian acá.
// Versión en texto para buscadores y asistentes de IA, que no ejecutan el mapa.
const ZONAS = [
  { zona: 'AR3 / ALR3 · Residencial', fos: '0,30', fot: '0,60', altura: 'PB+1', frente: '15 m', lote: '500 m²', retiro: '4 m' },
  { zona: 'AR4 / ALR4 · Residencial', fos: '0,25', fot: '0,50', altura: 'PB+1', frente: '25 m', lote: '1.000 m²', retiro: '5 m' },
  { zona: 'AC 1-1 / 1-2 · Área Central', fos: '0,50', fot: '1,00', altura: 'PB+2', frente: '12,50 m', lote: '250 m²', retiro: '—' },
  { zona: 'AN 1-1', fos: '0,40', fot: '0,80', altura: 'PB+2', frente: '12,50 m', lote: '250 m²', retiro: '—' },
  { zona: 'AN 2-1', fos: '0,40', fot: '0,80', altura: 'PB+1', frente: '12,50 m', lote: '250 m²', retiro: '—' },
  { zona: 'AN 2-3', fos: '0,25', fot: '0,50', altura: 'PB+1', frente: '15 m', lote: '500 m²', retiro: '3 m' },
  { zona: 'AE · Área Especial', fos: '0,50', fot: '1,00', altura: '—', frente: '25 m', lote: '2.500 m²', retiro: '—' },
  { zona: 'Ejes comerciales (EJES AC)', fos: '0,67', fot: '1,50', altura: '—', frente: '—', lote: '—', retiro: '—' },
]

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto puedo construir en un lote en Funes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende de la zona. En AR3, la residencial más común, el FOS máximo es 0,30 y el FOT 0,60: en un lote de 500 m² podés ocupar hasta 150 m² en planta baja y construir hasta 300 m² en total, en PB+1. En AR4 (lotes desde 1.000 m²) rigen FOS 0,25 y FOT 0,50: 250 m² en planta y 500 m² en total.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el FOS y el FOT?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El FOS (factor de ocupación del suelo) es la proporción máxima del terreno que podés cubrir en planta baja. El FOT (factor de ocupación total) es la superficie total construible, sumando todas las plantas, respecto de la superficie del lote. Con FOS 0,30 y FOT 0,60, un lote de 1.000 m² admite 300 m² en planta y 600 m² en total.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo sé en qué zona está mi lote en Funes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En el mapa de zonificación de SI INMOBILIARIA elegís la manzana y ves la zona con sus indicadores. Las secciones numeradas del 1 al 17 son una división administrativa: el FOS, el FOT y la altura los define la zona de la manzana.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué zona de Funes permite construir más?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los ejes comerciales (EJES AC) tienen los índices más altos: FOS 0,67 y FOT 1,50. Le sigue el Área Central (AC 1-1 / 1-2), con FOS 0,50, FOT 1,00 y hasta PB+2. Las zonas residenciales AR3 y AR4 son las más restrictivas.',
      },
    },
  ],
}

export default function MapaFunesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, faqJsonLd]) }}
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

      <section className="px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-3 text-2xl font-black text-gray-900" style={{ fontFamily: 'var(--font-raleway)' }}>
            FOS, FOT y altura por zona en Funes
          </h2>
          <p className="mb-6 text-gray-600">
            El cuadro de indicadores que usa el mapa de zonificación de SI INMOBILIARIA. Para saber cuánto podés
            construir, multiplicá la superficie del lote por el FOS (planta baja) y por el FOT (total).
          </p>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-900">
                <tr>
                  <th className="px-3 py-2">Zona</th>
                  <th className="px-3 py-2">FOS máx.</th>
                  <th className="px-3 py-2">FOT máx.</th>
                  <th className="px-3 py-2">Altura máx.</th>
                  <th className="px-3 py-2">Frente mín.</th>
                  <th className="px-3 py-2">Lote mín.</th>
                  <th className="px-3 py-2">Retiro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-600">
                {ZONAS.map((z) => (
                  <tr key={z.zona}>
                    <td className="px-3 py-2 font-semibold text-gray-900">{z.zona}</td>
                    <td className="px-3 py-2">{z.fos}</td>
                    <td className="px-3 py-2">{z.fot}</td>
                    <td className="px-3 py-2">{z.altura}</td>
                    <td className="px-3 py-2">{z.frente}</td>
                    <td className="px-3 py-2">{z.lote}</td>
                    <td className="px-3 py-2">{z.retiro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-gray-500">
            Valores orientativos. Antes de proyectar, confirmalos con Obras Particulares de la Municipalidad de Funes.
          </p>

          <h2 className="mb-6 mt-12 text-2xl font-black text-gray-900" style={{ fontFamily: 'var(--font-raleway)' }}>
            Preguntas frecuentes
          </h2>
          <div className="space-y-4">
            {faqJsonLd.mainEntity.map((f) => (
              <details key={f.name} className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between font-bold text-gray-900">
                  {f.name}
                  <span className="text-[#1A5C38] transition-transform group-open:rotate-180">&#9660;</span>
                </summary>
                <p className="mt-4 text-gray-600">{f.acceptedAnswer.text}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <RecursosCTA
        title="¿Buscás un lote en Funes?"
        text="Un agente te asesora sobre zonificación, factibilidad y oportunidades de compra."
      />
    </>
  )
}
