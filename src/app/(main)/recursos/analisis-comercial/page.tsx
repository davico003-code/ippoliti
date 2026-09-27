import type { Metadata } from 'next'
import RecursoHero from '@/components/recursos/RecursoHero'
import RecursosCTA from '@/components/recursos/RecursosCTA'
import AnalisisComercial from '@/components/recursos/analisis-comercial/AnalisisComercial'
import type { Informe } from '@/lib/analisis-comercial/informe'
import informeData from '@/data/analisis-comercial/informe.json'

const informe = informeData as unknown as Informe

const URL = 'https://siinmobiliaria.com/recursos/analisis-comercial'
const DESCRIPTION =
  'Qué comercios le van a faltar a Funes y dónde conviene abrir: informe mensual con la proyección de población, los rubros que faltan, los que sobran y un mapa con los comercios de cada avenida.'

export const metadata: Metadata = {
  title: 'Análisis comercial de Funes · qué negocios faltan | SI INMOBILIARIA',
  description: DESCRIPTION,
  alternates: { canonical: URL },
  keywords: [
    'análisis comercial Funes',
    'qué negocio poner en Funes',
    'comercios Funes',
    'locales comerciales Funes',
    'oportunidades comerciales Funes',
    'Ruta 9 Funes comercios',
  ],
  openGraph: {
    title: 'Análisis comercial de Funes · qué negocios faltan',
    description: DESCRIPTION,
    url: URL,
    siteName: 'SI INMOBILIARIA',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'SI INMOBILIARIA' }],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Análisis comercial de Funes · qué negocios faltan',
    description: DESCRIPTION,
    images: ['/og-image.jpg'],
  },
}

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://siinmobiliaria.com' },
      { '@type': 'ListItem', position: 2, name: 'Recursos', item: 'https://siinmobiliaria.com/recursos' },
      { '@type': 'ListItem', position: 3, name: 'Análisis comercial de Funes', item: URL },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Report',
    name: `Análisis comercial de Funes · ${informe.periodo}`,
    headline: informe.titular,
    description: DESCRIPTION,
    url: URL,
    dateModified: informe.generado,
    inLanguage: 'es-AR',
    publisher: { '@type': 'Organization', name: 'SI INMOBILIARIA', url: 'https://siinmobiliaria.com' },
    spatialCoverage: { '@type': 'Place', name: 'Funes, Santa Fe, Argentina' },
  },
]

export default function AnalisisComercialPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <RecursoHero
        theme="green"
        eyebrow="Análisis comercial de Funes"
        title="¿Qué negocio le falta a Funes?"
        subtitle="Cruzamos los comercios de cada avenida con el crecimiento de la ciudad para ver qué rubros van a faltar y dónde conviene abrir. Se actualiza todos los meses."
        breadcrumbLabel="Análisis comercial de Funes"
      />

      <AnalisisComercial informe={informe} />

      <RecursosCTA
        title="¿Buscás local para tu negocio en Funes?"
        text="Te ayudamos a encontrar el lugar indicado según tu rubro, la zona y lo que viene en la ciudad."
      />
    </>
  )
}
