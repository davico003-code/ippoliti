import { config } from 'dotenv'
config({ path: '.env.local' })

const KEY = process.env.TOKKO_API_KEY || process.env.NEXT_PUBLIC_TOKKO_API_KEY
if (!KEY) { console.log('No TOKKO key in .env.local'); process.exit(0) }

const BASE = 'https://www.tokkobroker.com/api/v1'

const endpoints = [
  `/user/?key=${KEY}&format=json`,
  `/user/?key=${KEY}&format=json&limit=50`,
]

for (const ep of endpoints) {
  try {
    const res = await fetch(BASE + ep)
    console.log(`\n=== ${ep.split('key=')[0]} === HTTP ${res.status}`)
    const txt = await res.text()
    console.log(txt.slice(0, 3000))
  } catch (e) {
    console.log(`ERROR: ${e.message}`)
  }
}
