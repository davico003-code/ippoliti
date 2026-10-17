import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import RecursoHero from '@/components/recursos/RecursoHero'
import RecursosCTA from '@/components/recursos/RecursosCTA'
import { ZONAS_FUNES } from '@/lib/funes-zonas'

// Search Console 17-oct: "mapa de funes", "mapa funes", "mapa de funes con
// calles", "zonas de funes", "funes mapa"… ~300 apariciones al mes en posición
// 8-10 con 1 clic; el título decía "zonificación" y el H1 no nombraba el mapa.
const TITULO = 'Mapa de Funes: zonas, calles y qué se puede construir'
const DESCRIPCION =
  'Mapa de Funes por zonas sobre el plano de calles: pasá por cada zona y mirá FOS, FOT, altura y lote mínimo, y calculá cuánto podés construir. Gratis.'

const MapaFunesInteractivo = dynamic(
  () => import('@/components/recursos/MapaFunesInteractivo'),
  {
    ssr: false,
    loading: () => <MapaFunesSkeleton />,
  },
)

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRIPCION,
  alternates: {
    canonical: 'https://siinmobiliaria.com/recursos/mapa-funes',
  },
  keywords: [
    'mapa de Funes',
    'mapa de Funes con calles',
    'zonas de Funes',
    'zonificación Funes',
    'mapa de zonas Funes',
    'FOS FOT Funes',
    'cuánto puedo construir Funes',
    'indicadores urbanísticos Funes',
  ],
  openGraph: {
    title: TITULO,
    description: DESCRIPCION,
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
      name: 'Mapa de Funes',
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
        title="Mapa de Funes por zonas: ¿qué podés construir en tu lote?"
        subtitle="Las zonas de Funes sobre el plano de calles: pasá por tu zona y mirá FOS, FOT, altura y cuánto podés construir, con calculadora según las medidas del lote."
        breadcrumbLabel="Mapa de Funes"
      />

      <div style={{ maxWidth: 1640, margin: '0 auto', padding: '20px clamp(10px, 2.2vw, 26px) 0' }}>
        <MapaFunesInteractivo />
      </div>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '40px clamp(16px, 3vw, 26px) 8px' }}>
        <h2 style={{ fontFamily: 'var(--font-raleway), Raleway, system-ui, sans-serif', fontWeight: 700, fontSize: 26, color: 'var(--foreground)', marginBottom: 8 }}>
          Las zonas de Funes y qué se puede construir en cada una
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.55, color: 'var(--tinta-soft)', marginBottom: 16, maxWidth: 760 }}>
          El FOS es la parte del lote que puede ocupar la planta baja (0,3 = 30 %) y el FOT, cuántos metros cubiertos
          en total se pueden construir por cada m² de terreno (0,6 en un lote de 500 m² = 300 m²). Indicadores según el
          cuadro oficial de zonificación de la Ciudad de Funes; la aprobación final corresponde al municipio.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, minWidth: 560 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--tinta-mute)', borderBottom: '1px solid var(--line)' }}>
                <th scope="col" style={{ padding: '10px 8px' }}>Zona</th>
                <th scope="col" style={{ padding: '10px 8px' }}>FOS máx.</th>
                <th scope="col" style={{ padding: '10px 8px' }}>FOT máx.</th>
                <th scope="col" style={{ padding: '10px 8px' }}>Frente mín.</th>
                <th scope="col" style={{ padding: '10px 8px' }}>Lote mín.</th>
                <th scope="col" style={{ padding: '10px 8px' }}>Altura máx.</th>
                <th scope="col" style={{ padding: '10px 8px' }}>Retiro</th>
              </tr>
            </thead>
            <tbody>
              {ZONAS_FUNES.map((z) => (
                <tr key={z.codigo} style={{ borderBottom: '1px solid var(--line)', color: 'var(--foreground)' }}>
                  <th scope="row" style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 600 }}>
                    {z.codigo}
                    <div style={{ fontWeight: 400, fontSize: 13, color: 'var(--tinta-mute)' }}>{z.nombre}</div>
                    {z.nota && <div style={{ fontWeight: 400, fontSize: 13, color: 'var(--tinta-mute)' }}>{z.nota}</div>}
                  </th>
                  <td style={{ padding: '10px 8px', fontVariantNumeric: 'tabular-nums' }}>{z.fos}</td>
                  <td style={{ padding: '10px 8px', fontVariantNumeric: 'tabular-nums' }}>{z.fot}</td>
                  <td style={{ padding: '10px 8px' }}>{z.frente}</td>
                  <td style={{ padding: '10px 8px' }}>{z.superficie}</td>
                  <td style={{ padding: '10px 8px' }}>{z.altura}</td>
                  <td style={{ padding: '10px 8px' }}>{z.retiro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <RecursosCTA
        title="¿Buscás un lote en Funes?"
        text="Un agente te asesora sobre zonificación, factibilidad y oportunidades de compra."
      />
    </>
  )
}
