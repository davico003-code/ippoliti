export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { Redis } = await import('@upstash/redis')
    const redis = new Redis({
      url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN!,
    })

    const data = await redis.get('informes:data')
    const lastUpdate = await redis.get('informes:lastUpdate')

    if (!data) {
      return Response.json({ error: 'No data yet' }, { status: 404 })
    }

    return Response.json({ data, lastUpdate })
  } catch {
    return Response.json({ error: 'Redis read failed' }, { status: 500 })
  }
}
