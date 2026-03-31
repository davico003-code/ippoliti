import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const apiKey = process.env.TOKKO_API_KEY || process.env.NEXT_PUBLIC_TOKKO_API_KEY
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
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
    return NextResponse.json({ error: `Tokko error: ${res.status}` }, { status: res.status })
  }

  const data = await res.json()
  return NextResponse.json(data)
}
