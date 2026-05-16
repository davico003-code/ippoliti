/**
 * One-off: reconstruye las keys de Redis `audio:resumen:v3:{id}:url` a partir
 * de los blobs MP3 existentes en `audio/v3/` del store siinmobiliaria-audio.
 *
 * Uso: pnpm tsx scripts/audio-rebuild-redis-from-blobs.ts [--apply]
 *   (sin --apply = dry-run, solo reporta)
 */
import { config } from 'dotenv'
import { resolve } from 'node:path'

config({ path: resolve(process.cwd(), '.env.local') })

import { list } from '@vercel/blob'
import { Redis } from '@upstash/redis'

const APPLY = process.argv.includes('--apply')
const URL_TTL_SECONDS = 365 * 24 * 60 * 60
const PIPELINE_VERSION = 'v3'
const PREFIX = `audio/${PIPELINE_VERSION}/`
const URL_KEY = (id: number) => `audio:resumen:${PIPELINE_VERSION}:${id}:url`
// Tolera el sufijo random que mete Vercel Blob: audio/v3/123-abc.mp3 ó audio/v3/123.mp3
const PATHNAME_RE = /^audio\/v3\/(\d+)(?:-[A-Za-z0-9]+)?\.mp3$/

function envOrDie(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Falta ${name} en .env.local`)
  return v
}

async function main() {
  const blobToken = envOrDie('AUDIO_BLOB_READ_WRITE_TOKEN')
  const redis = new Redis({
    url: envOrDie('KV_REST_API_URL'),
    token: envOrDie('KV_REST_API_TOKEN'),
  })

  // Listado paginado del store
  type BlobEntry = { pathname: string; url: string; size: number; uploadedAt: Date | string }
  const found: BlobEntry[] = []
  let cursor: string | undefined
  for (let page = 0; page < 50; page++) {
    const res = await list({ token: blobToken, prefix: PREFIX, cursor, limit: 1000 })
    for (const b of res.blobs) {
      found.push({ pathname: b.pathname, url: b.url, size: b.size, uploadedAt: b.uploadedAt })
    }
    if (!res.hasMore || !res.cursor) break
    cursor = res.cursor
  }

  // Resolver: si hay varios blobs con el mismo propertyId, nos quedamos con
  // el más nuevo (uploadedAt desc) — Vercel puede tener huérfanos viejos.
  const byId = new Map<number, BlobEntry>()
  const skipped: { pathname: string; reason: string }[] = []
  for (const b of found) {
    const m = b.pathname.match(PATHNAME_RE)
    if (!m) { skipped.push({ pathname: b.pathname, reason: 'no matchea v3/{id}.mp3' }); continue }
    const id = Number(m[1])
    if (!Number.isFinite(id)) { skipped.push({ pathname: b.pathname, reason: 'id no numérico' }); continue }
    const prev = byId.get(id)
    if (!prev || new Date(b.uploadedAt) > new Date(prev.uploadedAt)) byId.set(id, b)
  }

  const ids = Array.from(byId.keys()).sort((a, b) => a - b)

  console.log(`\n=== Blobs encontrados en ${PREFIX} ===`)
  console.log(`Total blobs raw: ${found.length}`)
  console.log(`Property IDs únicos: ${ids.length}`)
  if (skipped.length) {
    console.log(`\nSkipped (${skipped.length}):`)
    for (const s of skipped) console.log(`  - ${s.pathname}  // ${s.reason}`)
  }

  console.log(`\nListado por propertyId:`)
  for (const id of ids) {
    const b = byId.get(id)!
    console.log(`  ${id}\t${b.size}B\t${new Date(b.uploadedAt).toISOString()}\t${b.url}`)
  }

  // Reconstrucción de keys
  console.log(`\n=== Redis (audio:resumen:v3:{id}:url) ===`)
  console.log(APPLY ? 'Modo APPLY: voy a escribir.' : 'Modo DRY-RUN: no escribo nada (corré con --apply para escribir).')

  let written = 0
  let alreadyOk = 0
  let updated = 0
  const changes: { id: number; before: string | null; after: string }[] = []

  for (const id of ids) {
    const blob = byId.get(id)!
    const existing = await redis.get<string>(URL_KEY(id))
    const existingStr = typeof existing === 'string' ? existing : null
    if (existingStr === blob.url) {
      alreadyOk++
      continue
    }
    changes.push({ id, before: existingStr, after: blob.url })
    if (existingStr) updated++
    if (APPLY) {
      await redis.set(URL_KEY(id), blob.url, { ex: URL_TTL_SECONDS })
      written++
    }
  }

  console.log(`Keys ya alineadas con el blob: ${alreadyOk}`)
  console.log(`Keys a (re)escribir: ${changes.length}  (de las cuales updates: ${updated}, nuevas: ${changes.length - updated})`)
  if (changes.length) {
    console.log(`\nDetalle de cambios:`)
    for (const c of changes) {
      console.log(`  ${c.id}: ${c.before ?? '(vacío)'} → ${c.after}`)
    }
  }
  if (APPLY) console.log(`\nEscritas en Redis: ${written}`)
  console.log(`\nListo. (modo ${APPLY ? 'APPLY' : 'DRY-RUN'})`)
}

main().catch(e => { console.error(e); process.exit(1) })
