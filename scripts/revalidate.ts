/**
 * CLI para revalidar el cache de páginas y data en siinmobiliaria.com.
 *
 * Uso:
 *   npx tsx scripts/revalidate.ts                    # default: prod, paths/tags estándar
 *   npx tsx scripts/revalidate.ts --property-id 123  # también revalida /propiedades/123
 *   npx tsx scripts/revalidate.ts --paths /,/blog    # paths custom (CSV)
 *   npx tsx scripts/revalidate.ts --tags tokko-properties  # tags custom (CSV)
 *   npx tsx scripts/revalidate.ts --base http://localhost:3000  # apuntar a otro origen
 */
import { config } from 'dotenv'
import { resolve } from 'node:path'

config({ path: resolve(process.cwd(), '.env.local') })

function parseArgs(argv: string[]) {
  const out: Record<string, string> = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) continue
    const key = a.slice(2)
    const val = argv[i + 1]?.startsWith('--') ? '' : (argv[i + 1] ?? '')
    out[key] = val
    if (val) i++
  }
  return out
}

async function main() {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret) {
    console.error('Falta REVALIDATE_SECRET en .env.local')
    process.exit(1)
  }

  const args = parseArgs(process.argv.slice(2))
  const base = args.base || 'https://siinmobiliaria.com'
  const url = `${base.replace(/\/$/, '')}/api/revalidate`

  const body: Record<string, unknown> = {}
  if (args.paths) body.paths = args.paths.split(',').map((s) => s.trim()).filter(Boolean)
  if (args.tags) body.tags = args.tags.split(',').map((s) => s.trim()).filter(Boolean)
  if (args['property-id']) body.propertyId = args['property-id']
  if (args.slug) body.slug = args.slug

  console.log(`▸ POST ${url}`)
  console.log(`  body:`, body)

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify(body),
  })

  const text = await res.text()
  console.log(`▸ ${res.status} ${res.statusText}`)
  console.log(text)

  if (!res.ok) process.exit(1)
}

main().catch((e) => {
  console.error('FATAL:', e)
  process.exit(1)
})
