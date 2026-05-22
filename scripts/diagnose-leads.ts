/**
 * One-off (READ-ONLY): inventario completo de leads en Upstash Redis.
 * No modifica nada. Reporta por prefijo: total + ejemplos + breakdown
 * por campo origen/source/type. Adicionalmente inspecciona 'leads:all'.
 */
import { config } from 'dotenv'
import { resolve } from 'node:path'

config({ path: resolve(process.cwd(), '.env.local') })

import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const PATTERNS = [
  'lead:*',
  'leads:*',
  'guia:lead:*',
  'guia:*',
  'tasacion:lead:*',
  'tasacion:*',
  'newsletter:*',
  'lead-*',
  'contacto:*',
]

async function scanAll(pattern: string): Promise<string[]> {
  const keys: string[] = []
  let cursor = '0'
  for (let i = 0; i < 200; i++) {
    const [next, batch] = (await redis.scan(cursor, {
      match: pattern,
      count: 500,
    })) as [string, string[]]
    if (Array.isArray(batch)) keys.push(...batch)
    cursor = next
    if (cursor === '0') break
  }
  return keys
}

function parseMaybe<T = unknown>(raw: unknown): T | null {
  if (raw == null) return null
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) as T } catch { return raw as unknown as T }
  }
  return raw as T
}

function pickOrigen(obj: Record<string, unknown> | null): string {
  if (!obj || typeof obj !== 'object') return '(no-data)'
  const v = obj.origen ?? obj.source ?? obj.type ?? obj.tipo
  return typeof v === 'string' && v.length > 0 ? v : '(sin campo)'
}

async function reportPattern(pattern: string) {
  const keys = await scanAll(pattern)
  if (keys.length === 0) {
    console.log(`\n[${pattern}] 0 keys`)
    return
  }

  console.log(`\n[${pattern}] ${keys.length} keys`)

  const examples = keys.slice(0, 3)
  console.log('  Ejemplos:')
  for (const k of examples) console.log(`    • ${k}`)

  // GET un sample (primera key del set)
  const sampleKey = keys[0]
  try {
    const type = await redis.type(sampleKey)
    if (type === 'string') {
      const sampleRaw = await redis.get<string>(sampleKey)
      const parsed = parseMaybe<Record<string, unknown>>(sampleRaw)
      console.log(`  Sample (${sampleKey}):`)
      console.log('    ', JSON.stringify(parsed, null, 2).split('\n').join('\n     '))
    } else {
      console.log(`  Sample (${sampleKey}): tipo Redis = ${type} (no es string, no parseo)`)
    }
  } catch (e) {
    console.log(`  Sample falló: ${e instanceof Error ? e.message : e}`)
  }

  // Breakdown por origen — solo para keys de tipo string (no LIST ni HASH)
  const counts = new Map<string, number>()
  let inspected = 0
  let errors = 0
  for (const k of keys) {
    try {
      const type = await redis.type(k)
      if (type !== 'string') {
        const tag = `(no-string:${type})`
        counts.set(tag, (counts.get(tag) ?? 0) + 1)
        continue
      }
      const raw = await redis.get<string>(k)
      const obj = parseMaybe<Record<string, unknown>>(raw)
      const origen = pickOrigen(obj)
      counts.set(origen, (counts.get(origen) ?? 0) + 1)
      inspected++
    } catch {
      errors++
    }
  }
  console.log(`  Inspeccionados: ${inspected} (errores ${errors})`)
  console.log('  Breakdown por origen/source/type:')
  const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
  for (const [k, v] of sorted) console.log(`    • ${k}: ${v}`)
}

async function reportLeadsAll() {
  console.log('\n[leads:all] (lista LPUSH)')
  try {
    const type = await redis.type('leads:all')
    console.log(`  Tipo: ${type}`)
    if (type !== 'list') {
      console.log('  No es una lista — abortando inspección')
      return
    }
    const len = await redis.llen('leads:all')
    console.log(`  Longitud: ${len}`)
    if (len === 0) return
    const first5 = await redis.lrange('leads:all', 0, 4)
    console.log('  Primeros 5 entries (parseados):')
    for (const item of first5) {
      const parsed = parseMaybe<Record<string, unknown>>(item)
      const compact = {
        nombre: parsed?.nombre,
        email: parsed?.email,
        origen: parsed?.origen ?? parsed?.source ?? parsed?.type,
        fecha: parsed?.fecha ?? parsed?.date,
      }
      console.log('    •', JSON.stringify(compact))
    }
    // Breakdown completo de leads:all por origen
    const all = await redis.lrange('leads:all', 0, len - 1)
    const counts = new Map<string, number>()
    for (const item of all) {
      const parsed = parseMaybe<Record<string, unknown>>(item)
      const origen = pickOrigen(parsed)
      counts.set(origen, (counts.get(origen) ?? 0) + 1)
    }
    console.log('  Breakdown de TODA la lista por origen:')
    const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
    for (const [k, v] of sorted) console.log(`    • ${k}: ${v}`)
  } catch (e) {
    console.log(`  Falló: ${e instanceof Error ? e.message : e}`)
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════')
  console.log('Inventario de leads en Redis (read-only)')
  console.log('═══════════════════════════════════════════════')
  for (const p of PATTERNS) await reportPattern(p)
  await reportLeadsAll()
  console.log('\n=== fin ===')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
