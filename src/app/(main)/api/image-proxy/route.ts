import { NextRequest, NextResponse } from 'next/server'
import { shouldProxyExternalImage } from '@/lib/external-images'

export const dynamic = 'force-dynamic'
export const maxDuration = 20

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('url') || ''
  if (!raw || !shouldProxyExternalImage(raw)) {
    return NextResponse.json({ error: 'Imagen no permitida' }, { status: 400 })
  }

  try {
    const res = await fetch(raw, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'es-AR,es;q=0.9',
        Referer: 'https://www.argenprop.com/',
      },
      signal: AbortSignal.timeout(15000),
    })

    const contentType = res.headers.get('content-type') || ''
    if (!res.ok || !contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'No se pudo leer la imagen' }, { status: 502 })
    }

    return new NextResponse(res.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000',
      },
    })
  } catch {
    return NextResponse.json({ error: 'No se pudo leer la imagen' }, { status: 502 })
  }
}
