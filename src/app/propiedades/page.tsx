import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getProperties, type TokkoProperty } from '@/lib/tokko'
import PropiedadesView from '@/components/PropiedadesView'

// Force dynamic render to avoid build-time Tokko rate-limit (403) that empties the HTML.
// Runtime fetches are fine; build-time mass prerender was the problem.
export const dynamic = 'force-dynamic'

type SearchParams = { [key: string]: string | string[] | undefined }

function firstValue(sp: SearchParams, key: string): string | undefined {
  const v = sp[key]
  return Array.isArray(v) ? v[0] : v
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams
}): Promise<Metadata> {
  // Enriquece title/description según filtros en URL. Mejora targeting de
  // búsquedas "propiedades Funes", "alquiler Roldán", "casas en venta Rosario".
  const op = firstValue(searchParams, 'op') // venta | alquiler
  const type = firstValue(searchParams, 'type') // casa | departamento | terreno | local
  const q = firstValue(searchParams, 'q') // barrio/zona libre

  const opLabel =
    op === 'venta' ? 'en venta' : op === 'alquiler' ? 'en alquiler' : 'en venta y alquiler'
  const typeLabel =
    type === 'casa'
      ? 'Casas'
      : type === 'departamento'
        ? 'Departamentos'
        : type === 'terreno'
          ? 'Terrenos'
          : type === 'local'
            ? 'Locales'
            : 'Propiedades'
  const zoneLabel = q ? ` en ${q}` : ' en Funes, Roldán y Rosario'

  const title = `${typeLabel} ${opLabel}${zoneLabel} | SI INMOBILIARIA`.slice(0, 70)
  const description =
    `${typeLabel} ${opLabel}${zoneLabel}. Casas en venta Funes, departamentos Rosario, terrenos Roldán y emprendimientos del corredor oeste. Inmobiliaria familiar desde 1983, Mat. N° 0621.`.slice(
      0,
      180,
    )

  const url = new URL('https://siinmobiliaria.com/propiedades')
  if (op) url.searchParams.set('op', op)
  if (type) url.searchParams.set('type', type)
  if (q) url.searchParams.set('q', q)

  return {
    title,
    description,
    keywords: [
      'inmobiliaria Funes',
      'inmobiliaria Roldán',
      'inmobiliaria Rosario',
      'propiedades Santa Fe',
      'casas en venta Funes',
      'departamentos Rosario',
      'terrenos Roldán',
      'alquileres corredor oeste',
    ],
    alternates: { canonical: url.toString() },
    openGraph: {
      title,
      description,
      url: url.toString(),
      siteName: 'SI INMOBILIARIA',
      images: ['/og-image.jpg'],
      type: 'website',
    },
  }
}

export default async function PropiedadesPage() {
  let properties: TokkoProperty[] = []
  try {
    const data = await getProperties()
    properties = data.objects ?? []
  } catch (err) {
    console.error('[propiedades] Error fetching properties:', err instanceof Error ? err.message : err)
  }

  return (
    <Suspense fallback={<PropiedadesSkeleton />}>
      <PropiedadesView properties={properties} />
    </Suspense>
  )
}

function PropiedadesSkeleton() {
  return (
    <div className="h-[100dvh] lg:h-[calc(100dvh-var(--header-height))] flex flex-col bg-white">
      <div className="h-[52px] border-b border-gray-200 bg-white" />
      <div className="flex flex-1 min-h-0">
        <div className="hidden md:flex flex-col w-[40%] border-r border-gray-200 overflow-hidden p-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-[152px] h-[112px] rounded-lg bg-gray-200 flex-shrink-0" />
              <div className="flex-1 flex flex-col gap-2 py-1">
                <div className="h-3 w-1/3 bg-gray-200 rounded" />
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
                <div className="h-3 w-1/2 bg-gray-200 rounded" />
                <div className="mt-auto h-4 w-1/3 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1 bg-gray-100 animate-pulse" />
      </div>
    </div>
  )
}
