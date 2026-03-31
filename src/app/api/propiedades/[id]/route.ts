import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const apiKey = process.env.TOKKO_API_KEY || process.env.NEXT_PUBLIC_TOKKO_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 })

  const res = await fetch(
    `https://www.tokkobroker.com/api/v1/property/${params.id}/?key=${apiKey}&format=json&lang=es`,
    { next: { revalidate: 3600 } }
  )

  if (!res.ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data = await res.json()
  return NextResponse.json(data)
}
