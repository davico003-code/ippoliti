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
    // renderToStream retorna un Node Readable en el runtime nodejs. Para evitar
    // bugs de streaming en algunos runtimes, lo colectamos en un Buffer antes
    // de retornar — el PDF de una página A4 son ~80-200KB, no es problema de
    // memoria.
    const nodeStream = (await renderToStream(<AutorizacionPDF data={auth} />)) as unknown as Readable
    const chunks: Buffer[] = []
    for await (const chunk of nodeStream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }
    const pdfBuffer = Buffer.concat(chunks)
    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="acuerdo-comercializacion-${slug}.pdf"`,
        'Content-Length': String(pdfBuffer.length),
        'Cache-Control': 'private, max-age=0, must-revalidate',
      },
    })
  } catch (e) {
    const msg = e instanceof Error ? `${e.message}\n${e.stack}` : String(e)
    console.error('PDF render error for slug', slug, ':\n', msg)
    return new Response(`Error generando PDF: ${e instanceof Error ? e.message : 'unknown'}`, {
      status: 500,
    })
  }
}
