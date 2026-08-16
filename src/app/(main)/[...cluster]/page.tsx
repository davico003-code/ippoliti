import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProperties, type TokkoProperty } from '@/lib/tokko'
import {
  CLUSTERS,
  clusterPath,
  clusterUrl,
  clustersRelacionados,
  filterForCluster,
  findCluster,
} from '@/lib/clusters'
import PropertyGrid from '@/components/PropertyGrid'
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd'
import LandingLeadForm from '@/components/landing/LandingLeadForm'

/**
 * LANDING ENGINE por clusters (Growth OS §23): /funes/casas,
 * /funes/casas/180000-250000, /roldan/alquileres, etc. — los destinos de las
 * campañas de Google Search, con inventario VIVO del feed.
 *
 * dynamicParams=false + generateStaticParams desde el catálogo CERRADO de
 * clusters.ts: solo existen las URLs listadas ahí; cualquier otra ruta da el
 * 404 normal de Next sin pasar por acá (cero riesgo de pisar rutas reales).
 *
 * Si un cluster se queda sin inventario, la landing NO se rompe (§23): muestra
 * alternativas cercanas y el formulario sigue captando — la demanda sin oferta
 * es justamente la señal que Hilo usa para salir a captar.
 */

export const revalidate = 3600
export const dynamicParams = false

export function generateStaticParams(): { cluster: string[] }[] {
  return CLUSTERS.map((c) => ({ cluster: c.segments }))
}

export function generateMetadata({ params }: { params: { cluster: string[] } }): Metadata {
  const cluster = findCluster(params.cluster)
  if (!cluster) return {}
  return {
    title: cluster.metaTitle,
    description: cluster.metaDescription,
    keywords: cluster.keywords,
    alternates: { canonical: clusterUrl(cluster) },
    openGraph: {
      title: cluster.h1,
      description: cluster.metaDescription,
      url: clusterUrl(cluster),
      images: ['/og-image.jpg'],
    },
  }
}

const CIUDAD_LABEL: Record<string, string> = { funes: 'Funes', roldan: 'Roldán', rosario: 'Rosario' }

export default async function ClusterLandingPage({ params }: { params: { cluster: string[] } }) {
  const cluster = findCluster(params.cluster)
  if (!cluster) notFound()

  let propiedades: TokkoProperty[] = []
  try {
    const d = await getProperties({ fetchAll: true })
    propiedades = filterForCluster(d.objects ?? [], cluster)
  } catch {
    // Sin feed no se rompe: la landing sigue captando con el form y WhatsApp.
  }

  const relacionados = clustersRelacionados(cluster)
  const rangosHermanos = CLUSTERS.filter(
    (c) => c !== cluster && c.ciudad === cluster.ciudad && c.tipo === cluster.tipo && c.operacion === cluster.operacion,
  )

  return (
    <div className="min-h-screen bg-white">
      <BreadcrumbJsonLd
        items={[
          { name: 'Inicio', url: 'https://siinmobiliaria.com' },
          { name: CIUDAD_LABEL[cluster.ciudad] ?? cluster.ciudad, url: `https://siinmobiliaria.com/inmobiliaria-${cluster.ciudad}` },
          { name: cluster.h1, url: clusterUrl(cluster) },
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1A5C38] to-[#0F3A23] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight" style={{ fontFamily: 'var(--font-raleway)' }}>
            {cluster.h1}
          </h1>
          <p className="text-green-100 text-lg max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-poppins)' }}>
            {propiedades.length > 0
              ? `${propiedades.length} ${propiedades.length === 1 ? 'propiedad disponible' : 'propiedades disponibles'} hoy. ${cluster.intro}`
              : cluster.intro}
          </p>
        </div>
      </section>

      {/* Chips de rangos hermanos (si el cluster tiene variantes por precio) */}
      {rangosHermanos.length > 0 && (
        <section className="py-4 px-4 border-b border-gray-100">
          <div className="max-w-7xl mx-auto flex flex-wrap gap-2 justify-center">
            {rangosHermanos.map((c) => (
              <Link
                key={clusterPath(c)}
                href={clusterPath(c)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 font-semibold"
              >
                {c.rango
                  ? `USD ${((c.rango.min ?? 0) / 1000).toFixed(0)}k – ${((c.rango.max ?? 0) / 1000).toFixed(0)}k`
                  : 'Ver todas'}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Inventario vivo o alternativas (§23: la landing nunca se rompe) */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {propiedades.length > 0 ? (
            <PropertyGrid properties={propiedades} />
          ) : (
            <div className="text-center py-8">
              <p className="text-lg font-bold text-gray-900 mb-2">
                Justo ahora no tenemos publicaciones en este segmento.
              </p>
              <p className="text-gray-600 mb-6">
                El inventario rota todas las semanas: dejanos tu contacto y te avisamos ANTES de publicar. Mientras, mirá estas alternativas:
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {relacionados.map((c) => (
                  <Link
                    key={clusterPath(c)}
                    href={clusterPath(c)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 font-semibold"
                  >
                    {c.h1}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Texto SEO */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: 'var(--font-raleway)' }}>
            {cluster.h1}: lo que tenés que saber
          </h2>
          <p>{cluster.seoTexto[0]}</p>
          <p>{cluster.seoTexto[1]}</p>
        </div>
      </section>

      {/* Captación: form corto + WhatsApp */}
      <section className="py-14 px-4 bg-[#1A5C38]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-black text-white mb-2" style={{ fontFamily: 'var(--font-raleway)' }}>
            Contanos qué buscás y te contactamos hoy
          </h2>
          <p className="text-green-100 mb-6">Sin vueltas: un asesor de la zona, con opciones reales.</p>
          <LandingLeadForm
            origen={`landing:${cluster.segments.join('/')}`}
            operation={cluster.operacion}
            propertyType={cluster.tipo}
            ciudad={CIUDAD_LABEL[cluster.ciudad] ?? cluster.ciudad}
            budgetMin={cluster.rango?.min ?? null}
            budgetMax={cluster.rango?.max ?? null}
          />
          <div className="mt-5">
            <a
              href={`https://wa.me/5493412101694?text=${encodeURIComponent(cluster.waTexto)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-[#25D366] text-white font-bold rounded-xl"
            >
              O escribinos directo por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Internal linking */}
      <section className="py-8 px-4 border-t">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-3">
          {relacionados.map((c) => (
            <Link
              key={clusterPath(c)}
              href={clusterPath(c)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700"
            >
              {c.h1}
            </Link>
          ))}
          <Link href="/tasaciones" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700">
            ¿Vendés? Tasá tu propiedad
          </Link>
        </div>
      </section>
    </div>
  )
}
