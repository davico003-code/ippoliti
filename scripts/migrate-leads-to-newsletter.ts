/**
 * Migra leads `origen: 'web'` que provienen del popup ExitPopup hacia
 * `origen: 'newsletter'`, sin perder posición histórica en `leads:all`.
 *
 * Defaults a --dry-run. Hace backup antes de escribir.
 *
 * Uso:
 *   npx tsx scripts/migrate-leads-to-newsletter.ts                          # dry run
 *   npx tsx scripts/migrate-leads-to-newsletter.ts --no-dry-run             # ejecuta
 *   npx tsx scripts/migrate-leads-to-newsletter.ts --restore <bkKey>        # restaura
 *
 * Reglas de selección:
 *   - origen === 'guia-comprador' → SKIP
 *   - nombre o email faltantes    → SKIP (incompleto)
 *   - origen === 'web' + nombre + email → CANDIDATO
 *   - Cualquier otro              → SKIP
 */

import { config } from 'dotenv'
import { resolve } from 'node:path'

config({ path: resolve(process.cwd(), '.env.local') })

import { Redis } from '@upstash/redis'

const dryRun = !process.argv.includes('--no-dry-run')
const restoreIdx = process.argv.indexOf('--restore')
const restoreFrom = restoreIdx >= 0 ? process.argv[restoreIdx + 1] : null

const KEY = 'leads:all'

// Guard: el script solo debe correr contra el Redis de PRODUCCIÓN confirmado
// por David el 21-may-2026 al aprobar la migración (host vía Upstash REST).
// Si .env.local apunta a otro host, abortar antes de cualquier escritura.
const EXPECTED_HOST = 'cunning-stork-86667.upstash.io'

// Fix puntual de email mal escrito detectado durante el dry run del 21-may-2026.
// El lead se preserva intacto excepto por email → corregido y dos flags de
// trazabilidad. Si en futuras corridas se necesita corregir más emails,
// extender este mapa (clave = email malo, valor = email corregido).
const EMAIL_FIXES: Record<string, string> = {
  'Nahuel_pracht315@outlook.c9m': 'Nahuel_pracht315@outlook.com',
}

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

interface LeadEntry {
  nombre?: string
  email?: string
  whatsapp?: string
  phone?: string
  origen?: string
  source?: string
  fecha?: string
  date?: string
  operation?: string
  propertyType?: string
  budget?: string
  migrated_at?: string
  [key: string]: unknown
}

type Decision =
  | { action: 'migrate'; lead: LeadEntry }
  | { action: 'skip-guia' }
  | { action: 'skip-incomplete'; lead: LeadEntry }
  | { action: 'skip-other'; lead: LeadEntry; origen: string }
  | { action: 'skip-already-newsletter' }
  | { action: 'unparseable'; raw: unknown }

function parseEntry(raw: unknown): LeadEntry | null {
  if (raw == null) return null
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) as LeadEntry } catch { return null }
  }
  if (typeof raw === 'object') return raw as LeadEntry
  return null
}

function classify(raw: unknown): Decision {
  const lead = parseEntry(raw)
  if (!lead) return { action: 'unparseable', raw }

  const origen = (lead.origen ?? lead.source ?? '') as string

  if (origen === 'guia-comprador') return { action: 'skip-guia' }
  if (origen === 'newsletter') return { action: 'skip-already-newsletter' }

  const nombre = (lead.nombre ?? '').toString().trim()
  const email = (lead.email ?? '').toString().trim()
  if (!nombre || !email) return { action: 'skip-incomplete', lead }

  if (origen === 'web') return { action: 'migrate', lead }
  return { action: 'skip-other', lead, origen: origen || '(vacío)' }
}

function maskRedisUrl(url: string | undefined): string {
  if (!url) return '(no configurada)'
  try {
    const u = new URL(url)
    return `${u.protocol}//${u.host}`
  } catch {
    return '(URL inválida)'
  }
}

function getRedisHost(): string | null {
  const url = process.env.KV_REST_API_URL
  if (!url) return null
  try { return new URL(url).host } catch { return null }
}

function assertExpectedHost() {
  const host = getRedisHost()
  if (host !== EXPECTED_HOST) {
    console.error(`✗ ABORTADO: Redis host = "${host ?? 'null'}" != esperado "${EXPECTED_HOST}"`)
    console.error('  El script solo escribe contra producción confirmada por David.')
    console.error('  Si querés correr contra otro Redis, edita EXPECTED_HOST a conciencia.')
    process.exit(1)
  }
}

function backupKey(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const stamp = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}`
  return `leads:all:backup:${stamp}`
}

async function restoreFromBackup(bkKey: string) {
  console.log('═══════════════════════════════════════════════')
  console.log(`RESTORE leads:all desde ${bkKey}`)
  console.log('═══════════════════════════════════════════════')
  console.log(`Redis target: ${maskRedisUrl(process.env.KV_REST_API_URL)}`)
  console.log('')

  assertExpectedHost()

  const raw = await redis.get<string | unknown[]>(bkKey)
  const arr = typeof raw === 'string' ? (JSON.parse(raw) as unknown[]) : (raw as unknown[] | null)
  if (!Array.isArray(arr)) {
    console.error(`✗ ${bkKey} no es un backup válido (esperado: JSON array)`)
    process.exit(1)
  }
  console.log(`Backup contiene ${arr.length} entradas`)

  // Salvavidas: guardar el estado actual antes de pisar (por si esto también
  // resulta ser un error y querés re-revertir).
  const safetyKey = `${KEY}:pre-restore:${Date.now()}`
  const current = await redis.lrange(KEY, 0, -1)
  await redis.set(safetyKey, JSON.stringify(current))
  console.log(`Estado actual guardado en ${safetyKey} (${current.length} entradas)`)

  await redis.del(KEY)
  // RPUSH preserva el orden: el primer elemento del array queda en índice 0.
  // LRANGE leads:all 0 -1 devuelve en orden [head ... tail], que es lo
  // mismo que necesitamos restaurar.
  if (arr.length > 0) {
    const payload = arr.map(x => typeof x === 'string' ? x : JSON.stringify(x))
    await redis.rpush(KEY, ...payload)
  }
  const after = await redis.lrange(KEY, 0, -1)
  console.log(`✓ restaurado. leads:all ahora tiene ${after.length} entradas`)
}

async function main() {
  if (restoreFrom) {
    await restoreFromBackup(restoreFrom)
    return
  }

  console.log('═══════════════════════════════════════════════')
  console.log(`Migración leads web → newsletter (${dryRun ? 'DRY RUN' : 'EJECUCIÓN REAL'})`)
  console.log('═══════════════════════════════════════════════')
  console.log(`Redis target: ${maskRedisUrl(process.env.KV_REST_API_URL)}`)
  console.log(`Key fuente:   ${KEY}`)
  console.log('')

  const raw = await redis.lrange(KEY, 0, -1)
  console.log(`Total entradas en ${KEY}: ${raw.length}`)
  console.log('')

  const decisions = raw.map(classify)

  const candidates: { idx: number; lead: LeadEntry }[] = []
  const counts = {
    guia: 0,
    alreadyNewsletter: 0,
    incomplete: 0,
    other: 0,
    unparseable: 0,
  }

  decisions.forEach((d, idx) => {
    switch (d.action) {
      case 'migrate':
        candidates.push({ idx, lead: d.lead })
        break
      case 'skip-guia':
        counts.guia++
        break
      case 'skip-already-newsletter':
        counts.alreadyNewsletter++
        break
      case 'skip-incomplete':
        counts.incomplete++
        console.log(`  [idx ${idx}] skip: incompleto → ${JSON.stringify(d.lead)}`)
        break
      case 'skip-other':
        counts.other++
        console.log(`  [idx ${idx}] skip: otro (origen="${d.origen}") → ${d.lead.email ?? '?'}`)
        break
      case 'unparseable':
        counts.unparseable++
        console.log(`  [idx ${idx}] skip: unparseable`)
        break
    }
  })

  console.log('')
  console.log('— Resumen —')
  console.log(`  A migrar (web + completo):    ${candidates.length}`)
  console.log(`  Skip guia-comprador:           ${counts.guia}`)
  console.log(`  Skip ya newsletter:            ${counts.alreadyNewsletter}`)
  console.log(`  Skip incompleto:               ${counts.incomplete}`)
  console.log(`  Skip otro origen:              ${counts.other}`)
  console.log(`  Skip unparseable:              ${counts.unparseable}`)
  console.log(`  Suma:                          ${candidates.length + counts.guia + counts.alreadyNewsletter + counts.incomplete + counts.other + counts.unparseable}`)
  console.log('')

  console.log('— Candidatos a migrar —')
  for (const { idx, lead } of candidates) {
    console.log(`  [idx ${idx}] ${lead.nombre} <${lead.email}> · fecha=${lead.fecha ?? lead.date ?? '?'}`)
  }
  console.log('')

  // Preview de fixes que se aplicarán además del cambio de origen.
  console.log('— Fixes adicionales —')
  let fixesApplied = 0
  for (const { idx, lead } of candidates) {
    const fix = EMAIL_FIXES[(lead.email ?? '').trim()]
    if (fix) {
      console.log(`  [idx ${idx}] email "${lead.email}" → "${fix}" (+ email_fixed, email_original)`)
      fixesApplied++
    }
  }
  if (fixesApplied === 0) console.log('  (ninguno)')
  console.log('')

  if (dryRun) {
    console.log('DRY RUN — no se escribió nada. Para ejecutar de verdad:')
    console.log('  npx tsx scripts/migrate-leads-to-newsletter.ts --no-dry-run')
    return
  }

  assertExpectedHost()

  // ── Migración real ──────────────────────────────────────────────────────
  if (candidates.length === 0) {
    console.log('No hay candidatos a migrar. Nada que hacer.')
    return
  }

  // 1. Backup completo de leads:all como JSON string (atómico, fácil restore).
  const bkKey = backupKey()
  console.log(`Backup → SET ${bkKey} = JSON array de ${raw.length} entradas`)
  await redis.set(bkKey, JSON.stringify(raw))
  console.log(`✓ backup creado`)
  console.log('')

  // 2. LSET por cada candidato — mantiene orden y posición original.
  const migrated: number[] = []
  const failed: { idx: number; error: string }[] = []
  const now = new Date().toISOString()

  for (const { idx, lead } of candidates) {
    const originalEmail = (lead.email ?? '').trim()
    const fixedEmail = EMAIL_FIXES[originalEmail]

    const updated: LeadEntry = {
      ...lead,
      origen: 'newsletter',
      migrated_at: now,
      ...(fixedEmail
        ? { email: fixedEmail, email_fixed: true, email_original: originalEmail }
        : {}),
    }
    try {
      await redis.lset(KEY, idx, JSON.stringify(updated))
      migrated.push(idx)
      const tail = fixedEmail ? ` (email "${originalEmail}" → "${fixedEmail}")` : ''
      console.log(`  ✓ [idx ${idx}] ${updated.email} → newsletter${tail}`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      failed.push({ idx, error: msg })
      console.error(`  ✗ [idx ${idx}] ${lead.email}: ${msg}`)
    }
  }

  console.log('')
  console.log('— Resultado migración —')
  console.log(`  Migrados OK:   ${migrated.length}`)
  console.log(`  Fallaron:      ${failed.length}`)
  console.log(`  Backup key:    ${bkKey}`)
  console.log('')

  if (failed.length > 0) {
    console.error('⚠️  Hubo fallos. Migración parcial. Para restaurar el backup:')
    console.error(`     ver bloque "RESTORE" abajo`)
    console.error('')
  }

  // 3. Verificación post-migración.
  console.log('— Verificación post-migración —')
  const post = await redis.lrange(KEY, 0, -1)
  console.log(`  Total entradas post: ${post.length} (esperado: ${raw.length})`)

  const breakdown = new Map<string, number>()
  let migratedTagged = 0
  for (const item of post) {
    const lead = parseEntry(item)
    if (!lead) {
      breakdown.set('(unparseable)', (breakdown.get('(unparseable)') ?? 0) + 1)
      continue
    }
    const origen = (lead.origen ?? lead.source ?? '(sin origen)') as string
    breakdown.set(origen, (breakdown.get(origen) ?? 0) + 1)
    if (lead.migrated_at) migratedTagged++
  }
  console.log('  Breakdown por origen:')
  for (const [k, v] of Array.from(breakdown.entries()).sort((a, b) => b[1] - a[1])) {
    console.log(`    • ${k}: ${v}`)
  }
  console.log(`  Entradas con migrated_at: ${migratedTagged}`)

  // Spot-check: comparar 2 guia-comprador random contra backup
  const backupRaw = JSON.parse(JSON.stringify(raw)) as unknown[]
  const guiaPositions: number[] = []
  decisions.forEach((d, i) => { if (d.action === 'skip-guia') guiaPositions.push(i) })
  const samplePositions = guiaPositions.slice(0, 2)
  let guiaIntact = true
  for (const i of samplePositions) {
    const before = backupRaw[i]
    const after = post[i]
    if (JSON.stringify(before) !== JSON.stringify(after)) {
      guiaIntact = false
      console.error(`  ✗ guia idx ${i} cambió!`)
      console.error(`     before: ${JSON.stringify(before)}`)
      console.error(`     after:  ${JSON.stringify(after)}`)
    }
  }
  if (guiaIntact) console.log(`  ✓ ${samplePositions.length} leads guia-comprador (spot-check) sin cambios`)

  console.log('')
  console.log('— RESTORE (si algo salió mal) —')
  console.log(`  npx tsx scripts/migrate-leads-to-newsletter.ts --restore ${bkKey}`)
  console.log('')
  console.log('Listo.')
}

main().catch(e => {
  console.error('\n❌ ERROR FATAL:', e)
  process.exit(1)
})
