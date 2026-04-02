import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q')?.trim() || ''
    if (q.length < 2) return NextResponse.json([])

    const apiKey = process.env.TOKKO_API_KEY || process.env.NEXT_PUBLIC_TOKKO_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 })

    const allResults: Record<string, unknown>[] = []
    const pageSize = 100
    const maxPages = 5

    for (let page = 0; page < maxPages; page++) {
      const params = new URLSearchParams({
        key: apiKey,
        format: 'json',
        lang: 'es',
        limit: String(pageSize),
        offset: String(page * pageSize),
        search_address: q,
      })

      const res = await fetch(
        `https://www.tokkobroker.com/api/v1/property/?${params.toString()}`,
        { next: { revalidate: 300 } }
      )

      if (!res.ok) break

      const data = await res.json()
      const objects = data.objects || []
      allResults.push(...objects)

      // Stop if we got fewer results than page size (no more pages)
      if (objects.length < pageSize) break
    }

    // Return simplified results
    const simplified = allResults.map((p: Record<string, unknown>) => {
      const photos = (p.photos as { image?: string; is_front_cover?: boolean; is_blueprint?: boolean }[] || [])
        .filter(ph => !ph.is_blueprint)
      const cover = photos.find(ph => ph.is_front_cover) || photos[0]
      const ops = p.operations as { prices?: { price: number; currency: string }[] }[] | undefined
      const price = ops?.[0]?.prices?.[0]
      const type = p.type as { name?: string } | undefined

      return {
        id: p.id,
        publication_title: p.publication_title || p.address || '',
        address: p.address || '',
        photo: cover?.image || null,
        price: price?.price || null,
        currency: price?.currency || 'USD',
        type: type?.name || '',
      }
    })

    return NextResponse.json(simplified)
  } catch {
    return NextResponse.json({ error: 'Algo salió mal' }, { status: 500 })
  }
}
