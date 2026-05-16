/**
 * One-off: para cada id en audio/v3/, reporta si existe texto Haiku cacheado
 * en Redis (audio:resumen:v3:{id}:text). Solo lectura.
 */
import { config } from 'dotenv'
import { resolve } from 'node:path'

config({ path: resolve(process.cwd(), '.env.local') })

import { Redis } from '@upstash/redis'

const IDS = [
  6654023, 7174284, 7208329, 7212703, 7220442, 7220721, 7245443, 7268088,
  7271766, 7272337, 7286685, 7296792, 7373581, 7374821, 7407995, 7594177,
  7648337, 7683486, 7729619, 7763055,
]

async function main() {
  const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  })

  const withText: number[] = []
  const withoutText: number[] = []
  for (const id of IDS) {
    const t = await redis.get<string>(`audio:resumen:v3:${id}:text`)
    if (t && typeof t === 'string' && t.length > 0) withText.push(id)
    else withoutText.push(id)
  }
  console.log(`Con texto cacheado: ${withText.length}/${IDS.length}`)
  if (withText.length) console.log(`  ${withText.join(', ')}`)
  console.log(`Sin texto cacheado: ${withoutText.length}/${IDS.length}`)
  if (withoutText.length) console.log(`  ${withoutText.join(', ')}`)
}

main().catch(e => { console.error(e); process.exit(1) })
