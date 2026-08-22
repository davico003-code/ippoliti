import { getMainPhoto, getPropertyById } from '@/lib/tokko'

export const runtime = 'nodejs'

const ALLOWED_IMAGE_HOSTS = new Set([
  'static.tokkobroker.com',
  'www.tokkobroker.com',
  'cdn.tokkobroker.com',
])

function isAllowedImageUrl(value: string): boolean {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return false
    return ALLOWED_IMAGE_HOSTS.has(url.hostname)
      || url.hostname.endsWith('.supabase.co')
      || url.hostname.endsWith('.public.blob.vercel-storage.com')
  } catch {
    return false
  }
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const id = Number.parseInt(params.id, 10)
  if (!Number.isSafeInteger(id) || id <= 0 || String(id) !== params.id) {
    return new Response('Identificador inválido', { status: 400 })
  }

  try {
    const property = await getPropertyById(id)
    const cover = getMainPhoto(property)
    if (!cover || !isAllowedImageUrl(cover)) {
      return new Response('Imagen no disponible', { status: 404 })
    }

    // La URL pública permanece estable aunque el feed renueve periódicamente
    // el token firmado de Supabase. El CDN cachea la redirección solo una hora.
    return new Response(null, {
      status: 307,
      headers: {
        Location: cover,
        'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
        'X-Robots-Tag': 'noindex',
      },
    })
  } catch {
    return new Response('Imagen no disponible', { status: 404 })
  }
}
