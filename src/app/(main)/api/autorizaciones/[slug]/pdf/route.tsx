// GET /api/autorizaciones/[slug]/pdf
// Pública (slug es el secreto). 403 si no firmada. Streamea el PDF generado
// por @react-pdf/renderer.

import { renderToStream } from '@react-pdf/renderer'
import { Readable } from 'node:stream'
import { AutorizacionPDF } from '@/components/autorizaciones/AutorizacionPDF'
import { getAutorizacion } from '@/lib/autorizaciones'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const slug = params.slug
  if (!slug || !/^[a-z0-9]{10}$/.test(slug)) {
    return new Response('Slug inválido', { status: 400 })
  }

  const auth = await getAutorizacion(slug)
  if (!auth) return new Response('No encontrada', { status: 404 })
  if (auth.status !== 'firmada' || !auth.signer || !auth.signed_at) {
    return new Response('Forbidden', { status: 403 })
  }

  try {
    // renderToStream retorna un Node Readable en el runtime nodejs (a pesar
    // del tipo declarado como ReadableStream). Cast + toWeb para Response.
    const nodeStream = (await renderToStream(<AutorizacionPDF data={auth} />)) as unknown as Readable
    const webStream = Readable.toWeb(nodeStream) as unknown as ReadableStream<Uint8Array>
    return new Response(webStream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="autorizacion-venta-${slug}.pdf"`,
        'Cache-Control': 'private, max-age=0, must-revalidate',
      },
    })
  } catch (e) {
    console.error('PDF render error:', e)
    return new Response('Error generando PDF', { status: 500 })
  }
}
