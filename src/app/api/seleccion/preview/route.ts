import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ title: null, image: null })
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(
      `https://api.microlink.io?url=${encodeURIComponent(url)}`,
      { signal: controller.signal, next: { revalidate: 86400 } }
    )
    clearTimeout(timeout)
    const data = await res.json()
    if (data.status !== 'success') return NextResponse.json({ title: null, image: null })
    return NextResponse.json({
      title: data.data?.title ?? null,
      image: data.data?.image?.url ?? null,
      description: data.data?.description ?? null,
    })
  } catch {
    return NextResponse.json({ title: null, image: null })
  }
}
