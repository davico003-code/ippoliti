import { config } from 'dotenv'
config({ path: '.env.local' })

const API_KEY = process.env.TOKKO_API_KEY || process.env.NEXT_PUBLIC_TOKKO_API_KEY
const BASE = 'https://www.tokkobroker.com/api/v1'

const endpoints = [
  `/agent/?key=${API_KEY}&format=json`,
  `/user/?key=${API_KEY}&format=json`,
  `/branch/?key=${API_KEY}&format=json`,
  `/contact/?key=${API_KEY}&format=json`,
]

for (const ep of endpoints) {
  try {
    const res = await fetch(BASE + ep)
    const data = await res.json()
    console.log(`\n=== ${ep.split('?')[0]} ===`)
    console.log(JSON.stringify(data, null, 2).slice(0, 2000))
  } catch (e) {
    console.log(`ERROR en ${ep.split('?')[0]}:`, e.message)
  }
}
