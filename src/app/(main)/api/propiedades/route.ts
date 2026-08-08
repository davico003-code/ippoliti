import { NextRequest, NextResponse } from 'next/server'
import { ocultarPrecioOportunidad } from '@/lib/tokko'

type FeedListResponse = { objects?: Array<{ id: number; web_price: boolean }> }

// Las oportunidades "Consultanos" no publican monto: se fuerza web_price=false
// también en este proxy (mismo criterio que getProperties en lib/tokko).
function ocultarPreciosLista<T extends FeedListResponse>(data: T): T {
  if (Array.isArray(data?.objects)) data.objects = data.objects.map(ocultarPrecioOportunidad)
  return data
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  // Puente Hilo (flag DATA_SOURCE=hilo): proxyeamos el feed de Hilo con la misma forma.
  if ((process.env.DATA_SOURCE || '').toLowerCase() === 'hilo') {
    const base = process.env.HILO_FEED_URL || 'https://meethilo.com'
    const p = new URLSearchParams()
    p.set('limit', searchParams.get('limit') || '20')
    if (searchParams.get('offset')) p.set('offset', searchParams.get('offset')!)
    if (searchParams.get('search')) p.set('search', searchParams.get('search')!)
    const r = await fetch(`${base}/api/public/propiedades?${p.toString()}`, {
      next: { revalidate: 900, tags: ['tokko-properties'] },
    })
    if (!r.ok) return NextResponse.json({ error: `Hilo feed error: ${r.status}` }, { status: r.status })
    const j = ocultarPreciosLista(await r.json())
    return NextResponse.json(j, {
      headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=86400' },
    })
  }

  const apiKey = process.env.TOKKO_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 })

  const params = new URLSearchParams()
  params.set('key', apiKey)
  params.set('format', 'json')
  params.set('lang', 'es')
  params.set('limit', searchParams.get('limit') || '20')
  if (searchParams.get('offset')) params.set('offset', searchParams.get('offset')!)

  const search = searchParams.get('search')
  if (search) params.set('search_address', search)

  const res = await fetch(`https://www.tokkobroker.com/api/v1/property/?${params.toString()}`, {
    next: { revalidate: 3600, tags: ['tokko-properties'] },
  })

  if (!res.ok) {
    return NextResponse.json({ error: `Tokko error: ${res.status}` }, { status: res.status })
  }

  const data = ocultarPreciosLista(await res.json())
  return NextResponse.json(data, {
    headers: {
      // Cacheo en el edge de Vercel, consistente con list-cards/similar/nearby.
      'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=86400',
    },
  })
}
