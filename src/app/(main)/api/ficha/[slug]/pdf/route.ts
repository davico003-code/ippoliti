// PDF neutro de la ficha, servible también desde verficha.casa (whitelisteado en
// el middleware). Runtime Node porque @react-pdf usa APIs de Node.

import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { getFicha } from '@/lib/ficha'
import { renderFichaPdf } from '@/components/v/FichaPDF'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const ficha = await getFicha(params.slug)
  if (!ficha || ficha.revokedAt) {
    return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
  }

  const domain = process.env.NEXT_PUBLIC_NEUTRAL_DOMAIN || 'verficha.casa'
  const url = `https://${domain}/${params.slug}`
  const qrDataUrl = await QRCode.toDataURL(url, { margin: 1, width: 240 }).catch(() => null)

  try {
    const pdf = await renderFichaPdf({ snapshot: ficha.snapshot, url, qrDataUrl })
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="ficha-${params.slug}.pdf"`,
        'Cache-Control': 'private, max-age=300',
      },
    })
  } catch {
    return NextResponse.json({ error: 'No se pudo generar el PDF' }, { status: 500 })
  }
}
