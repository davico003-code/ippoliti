import { NextRequest, NextResponse } from 'next/server'
import { contarEscaneo, resolverQr } from '@/lib/qr-links'

export const dynamic = 'force-dynamic'

// siinmobiliaria.com/qr/<slug> → redirige al destino configurado en /admin/qr.
// 302 (no 301): si fuera permanente el celular se guarda el destino viejo y
// el QR deja de ser dinámico. Slug desconocido → home.
export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const slug = (params.slug || '').toLowerCase()
  const link = await resolverQr(slug)
  if (!link) {
    return NextResponse.redirect(new URL('/', _req.url), 302)
  }
  await contarEscaneo(slug)
  const res = NextResponse.redirect(link.destino, 302)
  res.headers.set('Cache-Control', 'no-store')
  return res
}
