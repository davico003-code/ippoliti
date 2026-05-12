// ZIP download del carrusel aprobado: descarga los PNGs desde Vercel Blob
// y los empaqueta en un .zip para subir al storyplanner o enviarlos por
// drive/whatsapp.
//
// Auth: ?token=siadmin2024 (links de descarga no pueden setear headers).
// Alternativamente acepta x-admin-password (para curl).

import { NextResponse } from 'next/server'
import JSZip from 'jszip'
import { leerRegistro } from '@/agents/placas/lib/orquestador'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

const ADMIN_PASSWORD = 'siadmin2024'

export async function GET(
  req: Request,
  { params }: { params: { slug: string } },
) {
  const url = new URL(req.url)
  const token =
    url.searchParams.get('token') ?? req.headers.get('x-admin-password')
  if (token !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const slug = params.slug
  const registro = await leerRegistro(slug)
  if (!registro) {
    return NextResponse.json(
      { error: `no hay placas registradas para slug "${slug}"` },
      { status: 404 },
    )
  }

  const zip = new JSZip()

  // Descarga los PNGs en paralelo y los agrega al zip
  await Promise.all(
    registro.placas.map(async p => {
      const res = await fetch(p.url_png, { cache: 'no-store' })
      if (!res.ok) {
        throw new Error(
          `fallo descargando placa ${p.numero}: HTTP ${res.status}`,
        )
      }
      const buffer = await res.arrayBuffer()
      const fileName = `${String(p.numero).padStart(2, '0')}-${p.placa.nombre ?? 'placa'}.png`
      zip.file(fileName, buffer)
    }),
  )

  const content = await zip.generateAsync({ type: 'arraybuffer' })
  const filename = `${slug}-placas.zip`

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Length': String((content as ArrayBuffer).byteLength),
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
