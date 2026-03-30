import { NextResponse } from 'next/server'

export async function GET() {
  const key = process.env.TOKKO_API_KEY || process.env.NEXT_PUBLIC_TOKKO_API_KEY
  if (!key) return NextResponse.json({ error: 'no key' })

  try {
    const res = await fetch(`https://www.tokkobroker.com/api/v1/user/?key=${key}&format=json&limit=50`)
    const text = await res.text()
    return new Response(text, {
      status: res.status,
      headers: { 'content-type': 'application/json' },
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) })
  }
}
