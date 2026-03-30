import { NextResponse } from 'next/server'

export async function GET() {
  const key = process.env.TOKKO_API_KEY || process.env.NEXT_PUBLIC_TOKKO_API_KEY
  if (!key) return NextResponse.json({ error: 'no key' })

  const endpoints = ['user', 'property/?limit=1']
  const results: Record<string, unknown> = {}

  for (const ep of endpoints) {
    try {
      const url = `https://www.tokkobroker.com/api/v1/${ep}${ep.includes('?') ? '&' : '?'}key=${key}&format=json`
      const res = await fetch(url)
      const text = await res.text()
      results[ep] = { status: res.status, body: text.slice(0, 500) }
    } catch (e) {
      results[ep] = { error: String(e) }
    }
  }

  return NextResponse.json(results)
}
