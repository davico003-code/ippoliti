import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getProperties, getPropertiesEstable, sanitizeProperty, type TokkoProperty } from '@/lib/tokko'
import { conSoloPortada, enrichCardsWithAudio, projectToCard, type PropertyCardProjection } from '@/lib/projections'
import PropiedadesView from '@/components/PropiedadesView'
import { FotosExtraProvider } from '@/components/FotosExtraCards'
import { busquedaDesdeParams, resumenBusqueda } from '@/lib/resumen-busqueda'
import ListadoSkeleton from './loading'

// Render dinámico a propósito. Se probó pasarlo a ISR (revalidate) para bajar
// el TTFB de ~400 ms a ~5 ms y evitar los picos de revalidación bloqueante,
// PERO PropiedadesView usa useSearchParams(): en un prerender estático eso
// fuerza el fallback del Suspense, así que el HTML sale con el skeleton y las
// cards recién se pintan al hidratar (peor LCP y sin contenido para el
// crawler). Mientras los filtros se lean del querystring en el cliente, este
// listado tiene que renderizarse por request.
export const dynamic = 'force-dynamic'

const CANONICAL = 'https://siinmobiliaria.com/propiedades'

const METADATA_BASE: Metadata = {
  title: 'Propiedades en venta y alquiler en Funes, Roldán y Rosario',
  description: 'Explorá todas nuestras propiedades en venta y alquiler en Roldán, Rosario y Funes. Casas, departamentos, terrenos y emprendimientos.',
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: 'Propiedades en venta y alquiler | SI INMOBILIARIA',
    description: 'Casas, departamentos, terrenos y emprendimientos en Funes, Roldán y Rosario.',
    url: CANONICAL,
    images: ['/og-image.jpg'],
  },
}

// Parámetros de la búsqueda que viajan al og:url (los utm y demás quedan afuera).
const PARAMS_BUSQUEDA = ['q', 'operacion', 'tipo', 'dormitorios', 'ubicacion', 'precio_min', 'precio_max', 'moneda']

type SearchParams = Record<string, string | string[] | undefined>

// Un link de búsqueda pegado en WhatsApp mostraba siempre "Propiedades en
// venta y alquiler", aunque fuera de casas en Funes: la vista previa no decía
// qué se mandaba. La página ya es dinámica, así que armar el título con los
// filtros no cuesta caché. Solo texto (sin consultar propiedades ni contar).
// El canonical sigue siendo /propiedades: a Google le damos una sola página.
export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const uno = (k: string) => {
    const v = searchParams?.[k]
    return Array.isArray(v) ? v[0] : v
  }
  const resumen = resumenBusqueda(busquedaDesdeParams(uno))
  if (!resumen) return METADATA_BASE

  const title = `${resumen} · SI INMOBILIARIA`
  const description = `${resumen}. Fotos, precio y ubicación en el mapa de cada propiedad en Funes, Roldán y Rosario.`
  const qs = new URLSearchParams()
  for (const k of PARAMS_BUSQUEDA) {
    const v = uno(k)
    if (v) qs.set(k, v)
  }
  const url = qs.toString() ? `${CANONICAL}?${qs}` : CANONICAL
  return {
    title,
    description,
    alternates: { canonical: CANONICAL },
    openGraph: {
      title,
      description,
      url,
      siteName: 'SI INMOBILIARIA',
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'SI INMOBILIARIA' }],
      locale: 'es_AR',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description, images: ['/og-image.jpg'] },
  }
}

export default async function PropiedadesPage() {
  // Proyectamos las propiedades a card-shape antes de pasar al client.
  // Esto baja el RSC payload de la página de ~6.5 MB a ~2-3 MB porque
  // descarta description (texto largo), tags, videos, files, producer y
  // 29 de las 30 fotos por propiedad. PropiedadesView solo lee los campos
  // de card/mapa/filtros, así que la projection es estructuralmente
  // compatible — el cast es seguro.
  let projected: PropertyCardProjection[] = []
  // Si el feed se cae, el listado no puede decir "Sin resultados · Probá con
  // otros filtros": la persona creía que no había nada y probaba filtros que
  // nunca iban a andar. Primero se prueba la copia estable (otra entrada del
  // Data Cache, se renueva sola cada hora y casi siempre tiene datos); si
  // tampoco hay, la vista muestra el error con "Reintentar".
  let feedCaido = false
  try {
    const data = await getProperties()
    projected = (data.objects ?? []).map(sanitizeProperty).map(projectToCard).map(conSoloPortada)
  } catch (err) {
    console.error('[propiedades] Error fetching properties:', err instanceof Error ? err.message : err)
    try {
      const estable = await getPropertiesEstable()
      projected = (estable.objects ?? []).map(sanitizeProperty).map(projectToCard).map(conSoloPortada)
    } catch (err2) {
      console.error('[propiedades] Tampoco hay copia estable:', err2 instanceof Error ? err2.message : err2)
      feedCaido = true
    }
  }
  // Enriquecimiento bulk de audioUrl (un solo MGET a Redis). Soft-fail si
  // Redis cae: las cards quedan con audioUrl=null y no se muestra el play.
  if (projected.length > 0) {
    try {
      await enrichCardsWithAudio(projected)
    } catch (err) {
      console.error('[propiedades] Sin audios:', err instanceof Error ? err.message : err)
    }
  }

  return (
    // Mismo esqueleto que loading.tsx: una sola geometría mientras carga.
    <Suspense fallback={<ListadoSkeleton />}>
      {/* Las cards llegan con la portada sola (conSoloPortada); las fotos 2-5
          las suma el provider después del load. */}
      <FotosExtraProvider>
        <PropiedadesView properties={projected as unknown as TokkoProperty[]} feedCaido={feedCaido} />
      </FotosExtraProvider>
    </Suspense>
  )
}
