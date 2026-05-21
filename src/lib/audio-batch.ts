// Cron diario que auto-genera audio narrado (ElevenLabs) para propiedades de
// venta nuevas. Ortogonal al opt-in manual de /admin/audio: lo que ya tiene
// audio se saltea, lo nuevo se procesa.
//
// Disparado por:
//   - Vercel cron 0 8 * * * → POST /api/audio/cron-batch (Bearer CRON_SECRET)
//   - Manual desde /admin/audio → POST /api/audio/cron-batch?manual=true (x-team-code)
//
// Circuit breakers:
//   - AUDIO_CRON_MAX_PER_DAY (default 20): tope de audios por corrida.
//   - AUDIO_CRON_ENABLED ('false' = dry-run): kill switch sin redeploy.
//
// Estado persistido en Redis:
//   - audio:cron:lastrun        → JSON LastRunSummary (TTL 365d).
//   - audio:chars:YYYY-MM       → contador (INCRBY) de chars consumidos (TTL ~13m).

import { getProperties, type TokkoProperty } from './tokko'
import { redis } from './redis'
import { generateAudio, getCachedAudioUrl } from './audio'

const DEFAULT_MAX_PER_DAY = 20
const DELAY_BETWEEN_MS = 1500

const LASTRUN_KEY = 'audio:cron:lastrun'
const LASTRUN_TTL_SECONDS = 365 * 24 * 60 * 60
const CHARS_TTL_SECONDS = 400 * 24 * 60 * 60 // ~13 meses
const CHARS_MONTH_KEY = (yyyyMm: string) => `audio:chars:${yyyyMm}`

export type BatchTrigger = 'cron' | 'manual'

export interface BatchResultItem {
  propertyId: number
  status: 'generated' | 'failed' | 'over-limit' | 'dry-run'
  charsUsed?: number
  error?: string
}

export interface BatchResult {
  startedAt: string
  finishedAt: string
  trigger: BatchTrigger
  dryRun: boolean
  maxPerDay: number
  totalSale: number
  alreadyHasAudio: number
  generated: number
  failed: number
  overLimit: number
  charsUsedRun: number
  charsUsedMonth: number
  items: BatchResultItem[]
}

export interface LastRunSummary {
  startedAt: string
  finishedAt: string
  trigger: BatchTrigger
  dryRun: boolean
  totalSale: number
  alreadyHasAudio: number
  generated: number
  failed: number
  overLimit: number
  charsUsedRun: number
  generatedIds: number[]
}

export interface CronStatus {
  enabled: boolean
  maxPerDay: number
  lastRun: LastRunSummary | null
  charsUsedMonth: number
  monthKey: string
}

function yyyyMm(d = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}

// La API pública de Tokko ignora el filtro operation_types=[N] (devuelve todo),
// así que filtramos en cliente. Ref: memoria project_tokko_api_filtering.
function isSale(p: TokkoProperty): boolean {
  return Array.isArray(p.operations)
    && p.operations.some(op => op.operation_type === 'Sale')
}

function readEnabled(): boolean {
  return (process.env.AUDIO_CRON_ENABLED ?? 'true').toLowerCase() !== 'false'
}

function readMaxPerDay(): number {
  const n = Number(process.env.AUDIO_CRON_MAX_PER_DAY)
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_MAX_PER_DAY
}

async function persistLastRun(summary: LastRunSummary): Promise<void> {
  try {
    await redis.set(LASTRUN_KEY, JSON.stringify(summary), { ex: LASTRUN_TTL_SECONDS })
  } catch (e) {
    console.error('[audio-batch] no se pudo persistir lastrun:', e)
  }
}

async function incrCharsMonth(delta: number): Promise<number> {
  if (delta <= 0) {
    try {
      const v = await redis.get(CHARS_MONTH_KEY(yyyyMm()))
      return Number(v) || 0
    } catch { return 0 }
  }
  const key = CHARS_MONTH_KEY(yyyyMm())
  try {
    const total = await redis.incrby(key, delta)
    // INCRBY no setea TTL; lo refrescamos cada vez. EXPIRE sobre key existente
    // resetea el TTL — eso está bien para audio:chars:YYYY-MM (queremos ~13m).
    await redis.expire(key, CHARS_TTL_SECONDS)
    return Number(total) || 0
  } catch (e) {
    console.error('[audio-batch] no se pudo incrementar charsMonth:', e)
    return 0
  }
}

export async function processBatch(
  options: { trigger: BatchTrigger } = { trigger: 'cron' },
): Promise<BatchResult> {
  const startedAt = new Date()
  const enabled = readEnabled()
  const maxPerDay = readMaxPerDay()

  console.log(
    `[audio-batch] start trigger=${options.trigger} enabled=${enabled} maxPerDay=${maxPerDay}`,
  )

  // 1. Traer todas las propiedades activas y filtrar ventas en JS.
  const data = await getProperties({ limit: 100 })
  const total = data.objects?.length ?? 0
  const ventas = (data.objects ?? []).filter(isSale)
  console.log(`[audio-batch] tokko total=${total} ventas=${ventas.length}`)

  // 2. Detectar cuáles ya tienen audio cacheado.
  let alreadyHas = 0
  const sinAudio: TokkoProperty[] = []
  for (const p of ventas) {
    const url = await getCachedAudioUrl(p.id)
    if (url) alreadyHas++
    else sinAudio.push(p)
  }
  console.log(
    `[audio-batch] sinAudio=${sinAudio.length} yaTenian=${alreadyHas}`,
  )

  // 3. Aplicar circuit breaker (limite diario).
  const elegibles = sinAudio.slice(0, maxPerDay)
  const sobrantes = sinAudio.slice(maxPerDay)
  if (sobrantes.length > 0) {
    console.log(
      `[audio-batch] Límite diario alcanzado (${maxPerDay}): ${sobrantes.length} propiedades pendientes para mañana`,
    )
  }

  const items: BatchResultItem[] = sobrantes.map(p => ({
    propertyId: p.id,
    status: 'over-limit' as const,
  }))

  // 4. Procesar secuencialmente con delay para no saturar ElevenLabs.
  let generated = 0
  let failed = 0
  let charsRun = 0
  const generatedIds: number[] = []

  for (let i = 0; i < elegibles.length; i++) {
    const p = elegibles[i]

    if (!enabled) {
      items.push({ propertyId: p.id, status: 'dry-run' })
      console.log(
        `[audio-batch] [${i + 1}/${elegibles.length}] DRY-RUN id=${p.id} (kill switch activo)`,
      )
      continue
    }

    try {
      const result = await generateAudio(p.id)
      // Si ElevenLabs no expone character-cost, usamos textLength como proxy
      // razonable del costo de la request.
      const charged = result.meta.charsUsed ?? result.meta.textLength ?? 0
      charsRun += charged
      generated++
      generatedIds.push(p.id)
      items.push({
        propertyId: p.id,
        status: 'generated',
        charsUsed: result.meta.charsUsed,
      })
      console.log(
        `[audio-batch] [${i + 1}/${elegibles.length}] OK id=${p.id} chars=${charged} url=${result.url}`,
      )
    } catch (e) {
      failed++
      const msg = e instanceof Error ? e.message : 'error desconocido'
      items.push({ propertyId: p.id, status: 'failed', error: msg })
      console.error(
        `[audio-batch] [${i + 1}/${elegibles.length}] FAIL id=${p.id}: ${msg}`,
      )
    }

    // Persistencia parcial: si el timeout serverless corta el batch, al menos
    // el panel /admin/audio muestra cuántas se procesaron antes del corte.
    await persistLastRun({
      startedAt: startedAt.toISOString(),
      finishedAt: new Date().toISOString(),
      trigger: options.trigger,
      dryRun: !enabled,
      totalSale: ventas.length,
      alreadyHasAudio: alreadyHas,
      generated,
      failed,
      overLimit: sobrantes.length,
      charsUsedRun: charsRun,
      generatedIds,
    })

    if (i < elegibles.length - 1) await sleep(DELAY_BETWEEN_MS)
  }

  // 5. Acumular chars del mes y persistir resumen final.
  const charsUsedMonth = await incrCharsMonth(charsRun)
  const finishedAt = new Date()

  const summary: LastRunSummary = {
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    trigger: options.trigger,
    dryRun: !enabled,
    totalSale: ventas.length,
    alreadyHasAudio: alreadyHas,
    generated,
    failed,
    overLimit: sobrantes.length,
    charsUsedRun: charsRun,
    generatedIds,
  }
  await persistLastRun(summary)

  console.log(
    `[audio-batch] done totalSale=${ventas.length} generated=${generated} failed=${failed} overLimit=${sobrantes.length} charsRun=${charsRun} charsMonth=${charsUsedMonth}`,
  )

  return {
    startedAt: summary.startedAt,
    finishedAt: summary.finishedAt,
    trigger: summary.trigger,
    dryRun: summary.dryRun,
    maxPerDay,
    totalSale: summary.totalSale,
    alreadyHasAudio: summary.alreadyHasAudio,
    generated: summary.generated,
    failed: summary.failed,
    overLimit: summary.overLimit,
    charsUsedRun: summary.charsUsedRun,
    charsUsedMonth,
    items,
  }
}

export async function getCronStatus(): Promise<CronStatus> {
  const enabled = readEnabled()
  const maxPerDay = readMaxPerDay()
  const monthKey = yyyyMm()

  let lastRun: LastRunSummary | null = null
  try {
    const raw = await redis.get<string | LastRunSummary>(LASTRUN_KEY)
    if (raw) {
      lastRun = typeof raw === 'string' ? (JSON.parse(raw) as LastRunSummary) : raw
    }
  } catch (e) {
    console.error('[audio-batch] no se pudo leer lastrun:', e)
  }

  let charsUsedMonth = 0
  try {
    const v = await redis.get(CHARS_MONTH_KEY(monthKey))
    charsUsedMonth = Number(v) || 0
  } catch (e) {
    console.error('[audio-batch] no se pudo leer charsMonth:', e)
  }

  return { enabled, maxPerDay, lastRun, charsUsedMonth, monthKey }
}
