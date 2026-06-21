import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  // Puente Hilo (flag DATA_SOURCE=hilo): una propiedad desde el feed de Hilo.
  if ((process.env.DATA_SOURCE || '').toLowerCase() === 'hilo') {
    const base = process.env.HILO_FEED_URL || 'https://meethilo.com'
    const r = await fetch(`${base}/api/public/propiedades/${params.id}`, {
      next: { revalidate: 21600, tags: ['tokko-properties', `tokko-property-${params.id}`] },
    })
    if (!r.ok) return NextResponse.json({ error: 'Not found' }, { status: r.status === 404 ? 404 : 500 })
    return NextResponse.json(await r.json())
  }

  const apiKey = process.env.TOKKO_API_KEY || process.env.NEXT_PUBLIC_TOKKO_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 })

  const res = await fetch(
    `https://www.tokkobroker.com/api/v1/property/${params.id}/?key=${apiKey}&format=json&lang=es`,
    { next: { revalidate: 3600, tags: ['tokko-properties', `tokko-property-${params.id}`] } }
  )

  if (!res.ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data = await res.json()
  return NextResponse.json(data)
}
