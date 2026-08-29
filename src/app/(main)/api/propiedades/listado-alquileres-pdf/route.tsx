// GET /api/propiedades/listado-alquileres-pdf
//
// Descarga el listado de alquileres disponibles como PDF A4 (botón verde en
// /propiedades con el filtro Alquiler activo). Pública: muestra exactamente
// la misma información que ya publica /propiedades.
//
// Las fotos se descargan acá achicadas vía el optimizador de imágenes del
// propio deployment (/_next/image, w=256) y se pasan al Document como Buffer:
// el PDF queda en ~1MB en vez de 15MB de originales. Si una foto falla o
// tarda >6s, la fila sale con placeholder gris — nunca rompe la descarga.

import { renderToStream } from '@react-pdf/renderer'
import { Readable } from 'node:stream'
import { getProperties, sanitizeProperty } from '@/lib/tokko'
import {
  fechaListadoAR,
  mesAnioAR,
  proyectarAlquiler,
  type AlquilerItem,
} from '@/lib/listado-alquileres'
import {
  ListadoAlquileresPDF,
  type AlquilerItemPDF,
} from '@/components/pdf/ListadoAlquileresPDF'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 120

async function bajarFoto(
  origin: string,
  url: string,
): Promise<{ data: Buffer; format: 'jpg' | 'png' } | null> {
  try {
    const optimizada = `${origin}/_next/image?url=${encodeURIComponent(url)}&w=256&q=60`
    const res = await fetch(optimizada, {
      // Sin webp/avif en Accept: el optimizador re-encodea al formato fuente
      // (jpeg/png), que es lo único que @react-pdf sabe dibujar.
      headers: { Accept: 'image/jpeg,image/png,*/*;q=0.8' },
      signal: AbortSignal.timeout(6000),
      cache: 'no-store',
    })
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length < 100) return null
    // Magic bytes: PNG arranca con 0x89 0x50; todo lo demás lo tratamos jpg.
    const format = buf[0] === 0x89 && buf[1] === 0x50 ? 'png' : 'jpg'
    return { data: buf, format }
  } catch {
    return null
  }
}

export async function GET(req: Request) {
  let items: AlquilerItem[] = []
  try {
    const data = await getProperties()
    items = (data.objects ?? [])
      .map(sanitizeProperty)
      .map(proyectarAlquiler)
      .filter((i): i is AlquilerItem => i !== null)
  } catch (err) {
    console.error(
      '[listado-alquileres-pdf] Error fetching properties:',
      err instanceof Error ? err.message : err,
    )
    return new Response('No se pudo obtener el listado', { status: 502 })
  }

  const origin = new URL(req.url).origin
  const conFotos: AlquilerItemPDF[] = await Promise.all(
    items.map(async (item) => ({
      ...item,
      fotoData: item.foto ? await bajarFoto(origin, item.foto) : null,
    })),
  )

  try {
    const fecha = fechaListadoAR()
    const nodeStream = (await renderToStream(
      <ListadoAlquileresPDF items={conFotos} fecha={fecha} />,
    )) as unknown as Readable
    const chunks: Buffer[] = []
    for await (const chunk of nodeStream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }
    const pdfBuffer = Buffer.concat(chunks)
    const slugMes = mesAnioAR().toLowerCase().replace(/\s+/g, '-')
    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="alquileres-si-inmobiliaria-${slugMes}.pdf"`,
        'Content-Length': String(pdfBuffer.length),
        // El listado cambia con el feed: cache corto compartido, nada persistente.
        'Cache-Control': 'public, max-age=0, s-maxage=600',
      },
    })
  } catch (e) {
    const msg = e instanceof Error ? `${e.message}\n${e.stack}` : String(e)
    console.error('[listado-alquileres-pdf] PDF render error:\n', msg)
    return new Response('Error generando PDF', { status: 500 })
  }
}
