import { NextResponse } from 'next/server'
import { applyPropertySeoOverride } from '@/lib/seoOverrides'
import { ocultarPrecioOportunidad, sanitizeProperty, CACHE_TAG_DETALLE, cacheTagPropiedad } from '@/lib/tokko'
import { sinVideosCaidos } from '@/lib/videos-vivos'
import { conFotosFijas } from '@/lib/fotos-fijas'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  // Solo ids numéricos: cualquier otro texto armaba una entrada nueva en el
  // Data Cache (y un pedido a Hilo) por cada variante.
  if (!/^\d{1,12}$/.test(params.id)) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Puente Hilo (flag DATA_SOURCE=hilo): una propiedad desde el feed de Hilo.
  if ((process.env.DATA_SOURCE || '').toLowerCase() === 'hilo') {
    const base = process.env.HILO_FEED_URL || 'https://meethilo.com'
    // Mismos tags que getPropertyById (misma URL = misma entrada del Data
    // Cache): cae con la edición de ESTA propiedad, no con la de cualquiera.
    const r = await fetch(`${base}/api/public/propiedades/${params.id}`, {
      next: { revalidate: 3600, tags: [CACHE_TAG_DETALLE, cacheTagPropiedad(params.id)] },
    })
    if (!r.ok) return NextResponse.json({ error: 'Not found' }, { status: r.status === 404 ? 404 : 500 })
    // Override de SEO por ID (unidades de emprendimientos): el panel desktop de
    // la ficha consume esta API — sin esto mostraría el título/typos del CRM.
    // Fotos con URL fija: es la galería de la ficha en la compu (lib/fotos-fijas.ts).
    // sanitizeProperty, como la ficha del celu (page.tsx): normaliza los
    // títulos cargados EN MAYÚSCULAS y corrige el tipo (lib/correcciones). Sin
    // esto el panel de la compu mostraba "CASA DE PASILLO RECICLADA…" (H1 y
    // texto para compartir) y además devolvía campos internos del feed
    // (hilo_id, tokko_id). Va ANTES del override de SEO para no pisar los
    // títulos escritos a mano.
    return NextResponse.json(conFotosFijas(await sinVideosCaidos(applyPropertySeoOverride(sanitizeProperty(ocultarPrecioOportunidad(await r.json()))))))
  }

  const apiKey = process.env.TOKKO_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 })

  const res = await fetch(
    `https://www.tokkobroker.com/api/v1/property/${params.id}/?key=${apiKey}&format=json&lang=es`,
    { next: { revalidate: 3600, tags: [CACHE_TAG_DETALLE, cacheTagPropiedad(params.id)] } }
  )

  if (!res.ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data = await res.json()
  return NextResponse.json(applyPropertySeoOverride(sanitizeProperty(ocultarPrecioOportunidad(data))))
}
