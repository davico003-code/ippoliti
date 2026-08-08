'use client'

// Panel /admin/audio.
//
// Gate: pide código del equipo (SI_TEAM_CODE) en un input. Si el código
// guardado en localStorage 'si_team_access' no funciona (401 del backend),
// volvemos a mostrar el gate.
//
// Sección 1 — Generar nuevo audio (consume créditos de ElevenLabs).
// Sección 2 — Listado de audios ya generados (cache pipeline v3).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Loader2, Play, RefreshCw, Sparkles } from 'lucide-react'
import AudioPlayer from '@/components/audio/AudioPlayer'
import type { AudioListItem } from '../../api/admin/audio/list/route'
import type { CronStatus, LastRunSummary } from '@/lib/audio-batch'

const R = "'Raleway', system-ui, sans-serif"
const GREEN = '#1A5C38'

const STORAGE_KEY = 'si_team_access'

// "6909398" o URL con /propiedades/{id}-{slug} → extrae el id numérico inicial.
function parsePropertyInput(raw: string): number | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  if (/^\d+$/.test(trimmed)) {
    const n = Number(trimmed)
    return Number.isFinite(n) && n > 0 ? n : null
  }

  const m = trimmed.match(/\/propiedades\/(\d+)/)
  if (m) {
    const n = Number(m[1])
    return Number.isFinite(n) && n > 0 ? n : null
  }
  return null
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface GenerationResult {
  url: string
  text: string
  meta: { createdAt: string; charsUsed?: number; textLength: number }
  propertyId: number
}

export default function AdminAudioClient() {
  const [teamCode, setTeamCode] = useState<string | null>(null)
  const [checkingCode, setCheckingCode] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem(STORAGE_KEY)
    setTeamCode(stored)
    setCheckingCode(false)
  }, [])

  const onAuth = (code: string) => {
    window.localStorage.setItem(STORAGE_KEY, code)
    setTeamCode(code)
  }

  const onLogout = () => {
    window.localStorage.removeItem(STORAGE_KEY)
    setTeamCode(null)
  }

  if (checkingCode) return null
  if (!teamCode) return <AccessGate onAuth={onAuth} />
  return <AdminPanel teamCode={teamCode} onLogout={onLogout} onUnauth={onLogout} />
}

// ── Gate ───────────────────────────────────────────────────────────────────

function AccessGate({ onAuth }: { onAuth: (code: string) => void }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)

  const submit = async () => {
    if (!code.trim()) return
    setChecking(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/audio/list', {
        headers: { 'x-team-code': code.trim() },
      })
      if (res.status === 401) {
        setError('Código incorrecto')
        return
      }
      if (!res.ok) {
        setError(`Error ${res.status}`)
        return
      }
      onAuth(code.trim())
    } catch {
      setError('Error de red')
    } finally {
      setChecking(false)
    }
  }

  return (
    <div
      style={{
        maxWidth: 380,
        margin: '60px auto 0',
        background: '#fff',
        border: '1px solid #E5E7EB',
        borderRadius: 14,
        padding: 28,
        fontFamily: R,
      }}
    >
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', margin: '0 0 6px' }}>
        Panel restringido
      </h2>
      <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5, margin: '0 0 18px' }}>
        Ingresá el código del equipo SI INMOBILIARIA para acceder.
      </p>
      <input
        type="password"
        value={code}
        onChange={e => setCode(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') void submit() }}
        placeholder="Código"
        autoFocus
        style={{
          width: '100%',
          padding: '11px 14px',
          background: '#FAFAFA',
          border: '1px solid #D1D5DB',
          borderRadius: 10,
          fontSize: 14,
          fontFamily: R,
          color: '#111',
          outline: 'none',
        }}
      />
      {error && (
        <div style={{ fontSize: 12, color: '#B91C1C', marginTop: 10 }}>{error}</div>
      )}
      <button
        type="button"
        onClick={submit}
        disabled={checking || !code.trim()}
        style={{
          marginTop: 16,
          width: '100%',
          padding: '11px 14px',
          background: GREEN,
          color: '#fff',
          border: 'none',
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 600,
          fontFamily: R,
          cursor: checking ? 'wait' : 'pointer',
          opacity: !code.trim() ? 0.5 : 1,
        }}
      >
        {checking ? 'Verificando…' : 'Entrar'}
      </button>
    </div>
  )
}

// ── Admin panel ────────────────────────────────────────────────────────────

function AdminPanel({
  teamCode,
  onLogout,
  onUnauth,
}: {
  teamCode: string
  onLogout: () => void
  onUnauth: () => void
}) {
  const [input, setInput] = useState('')
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)
  const [result, setResult] = useState<GenerationResult | null>(null)

  const [items, setItems] = useState<AudioListItem[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)

  const authHeaders = useMemo(
    () => ({ 'Content-Type': 'application/json', 'x-team-code': teamCode }),
    [teamCode],
  )

  const loadList = useCallback(async () => {
    setListLoading(true)
    setListError(null)
    try {
      const res = await fetch('/api/admin/audio/list', {
        headers: { 'x-team-code': teamCode },
      })
      if (res.status === 401) { onUnauth(); return }
      if (!res.ok) {
        setListError(`Error ${res.status}`)
        return
      }
      const data = await res.json()
      setItems(Array.isArray(data.items) ? data.items : [])
    } catch {
      setListError('Error de red')
    } finally {
      setListLoading(false)
    }
  }, [teamCode, onUnauth])

  useEffect(() => { void loadList() }, [loadList])

  const generate = async (propertyId: number, regenerate: boolean) => {
    setGenError(null)
    setGenerating(true)
    if (!regenerate) setResult(null)
    try {
      const res = await fetch('/api/audio/generar-audio', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ propertyId, regenerate }),
      })
      if (res.status === 401) { onUnauth(); return }
      const data = await res.json()
      if (!res.ok) {
        setGenError(typeof data?.error === 'string' ? data.error : `Error ${res.status}`)
        return
      }
      setResult({
        url: data.url,
        text: data.text || '',
        meta: data.meta || { createdAt: new Date().toISOString(), textLength: 0 },
        propertyId,
      })
      void loadList()
    } catch (e) {
      setGenError(e instanceof Error ? e.message : 'Error de red')
    } finally {
      setGenerating(false)
    }
  }

  const submitGenerate = () => {
    const id = parsePropertyInput(input)
    if (!id) {
      setGenError('Ingresá un ID numérico o una URL siinmobiliaria.com/propiedades/...')
      return
    }
    void generate(id, false)
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
          Sesión activa con código del equipo.
        </p>
        <button
          type="button"
          onClick={onLogout}
          style={{
            fontSize: 12,
            color: '#6B7280',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontFamily: R,
            textDecoration: 'underline',
          }}
        >
          Cerrar sesión
        </button>
      </div>

      <CronSection teamCode={teamCode} onUnauth={onUnauth} onBatchDone={loadList} />

      <GenerateSection
        input={input}
        setInput={setInput}
        onSubmit={submitGenerate}
        onRegenerate={() => result && void generate(result.propertyId, true)}
        generating={generating}
        genError={genError}
        result={result}
      />

      <ListSection
        items={items}
        loading={listLoading}
        error={listError}
        onRefresh={loadList}
        onRegenerate={(id) => void generate(id, true)}
        regeneratingId={generating && result ? result.propertyId : null}
      />
    </div>
  )
}

// ── Sección 0 — Generación automática (cron diario) ───────────────────────

function CronSection({
  teamCode,
  onUnauth,
  onBatchDone,
}: {
  teamCode: string
  onUnauth: () => void
  onBatchDone: () => void
}) {
  const [status, setStatus] = useState<CronStatus | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [runError, setRunError] = useState<string | null>(null)

  const loadStatus = useCallback(async () => {
    setStatusError(null)
    try {
      const res = await fetch('/api/admin/audio/cron-status', {
        headers: { 'x-team-code': teamCode },
        cache: 'no-store',
      })
      if (res.status === 401) { onUnauth(); return }
      if (!res.ok) { setStatusError(`Error ${res.status}`); return }
      const data = (await res.json()) as CronStatus & { ok: true }
      setStatus(data)
    } catch {
      setStatusError('Error de red')
    }
  }, [teamCode, onUnauth])

  useEffect(() => { void loadStatus() }, [loadStatus])

  const runNow = async () => {
    setRunError(null)
    setRunning(true)
    try {
      const res = await fetch('/api/audio/cron-batch?manual=true', {
        method: 'POST',
        headers: { 'x-team-code': teamCode },
      })
      if (res.status === 401) { onUnauth(); return }
      const data = await res.json()
      if (!res.ok) {
        setRunError(typeof data?.error === 'string' ? data.error : `Error ${res.status}`)
        return
      }
      await loadStatus()
      onBatchDone()
    } catch (e) {
      setRunError(e instanceof Error ? e.message : 'Error de red')
    } finally {
      setRunning(false)
    }
  }

  return (
    <section
      style={{
        background: '#fff',
        border: '1px solid #E5E7EB',
        borderRadius: 14,
        padding: 22,
        marginBottom: 28,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: 0 }}>
            Generación automática
          </h2>
          <CronStatusBadge enabled={status?.enabled ?? null} />
        </div>
        <button
          type="button"
          onClick={runNow}
          disabled={running}
          title="Dispara el batch a mano sin esperar al cron diario"
          style={{
            padding: '9px 16px',
            background: GREEN,
            color: '#fff',
            border: 'none',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
            fontFamily: R,
            cursor: running ? 'wait' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            opacity: running ? 0.7 : 1,
          }}
        >
          {running
            ? <><Loader2 size={13} className="ap-spin" /> Corriendo… (puede tardar varios minutos)</>
            : <><Play size={13} /> Forzar corrida ahora</>}
        </button>
      </div>

      <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 14px', lineHeight: 1.5 }}>
        Cron diario 5 AM Argentina · genera audio para propiedades de venta nuevas (saltea las que ya tienen).
        Tope diario controlado por <code style={{ background: '#F3F4F6', padding: '1px 4px', borderRadius: 4 }}>AUDIO_CRON_MAX_PER_DAY</code>,
        kill switch en <code style={{ background: '#F3F4F6', padding: '1px 4px', borderRadius: 4 }}>AUDIO_CRON_ENABLED</code>.
      </p>

      {statusError && (
        <div style={{ fontSize: 12, color: '#B91C1C', marginBottom: 10 }}>
          No se pudo cargar el estado: {statusError}
        </div>
      )}

      {runError && (
        <div
          style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#B91C1C',
            padding: 12,
            borderRadius: 10,
            fontSize: 13,
            marginBottom: 12,
          }}
        >
          {runError}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 10,
        }}
      >
        <Metric
          label="Tope diario"
          value={status ? `${status.maxPerDay} audios` : '—'}
        />
        <Metric
          label={`Chars mes ${status?.monthKey ?? ''}`.trim()}
          value={status ? status.charsUsedMonth.toLocaleString('es-AR') : '—'}
        />
        <Metric
          label="Última corrida"
          value={status?.lastRun?.finishedAt ? fmtDate(status.lastRun.finishedAt) : 'Nunca'}
        />
        <Metric
          label="Audios generados (última)"
          value={status?.lastRun ? String(status.lastRun.generated) : '—'}
          sub={lastRunSubLine(status?.lastRun)}
        />
      </div>

      {status?.lastRun?.generatedIds && status.lastRun.generatedIds.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#6B7280',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 4,
            }}
          >
            IDs generados (última corrida)
          </div>
          <div
            style={{
              fontSize: 12,
              color: '#4B5563',
              fontVariantNumeric: 'tabular-nums',
              background: '#FAFAFA',
              border: '1px solid #E5E7EB',
              borderRadius: 8,
              padding: '8px 10px',
              lineHeight: 1.5,
              wordBreak: 'break-word',
            }}
          >
            {status.lastRun.generatedIds.join(', ')}
          </div>
        </div>
      )}
    </section>
  )
}

function CronStatusBadge({ enabled }: { enabled: boolean | null }) {
  if (enabled === null) {
    return (
      <span style={{ fontSize: 11, color: '#9CA3AF' }}>cargando…</span>
    )
  }
  const bg = enabled ? '#DCFCE7' : '#FEE2E2'
  const fg = enabled ? '#166534' : '#991B1B'
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        background: bg,
        color: fg,
        padding: '3px 9px',
        borderRadius: 999,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}
    >
      {enabled ? 'Activo' : 'Pausado'}
    </span>
  )
}

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div
      style={{
        background: '#FAFAFA',
        border: '1px solid #E5E7EB',
        borderRadius: 10,
        padding: '10px 12px',
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: '#6B7280',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: '#111',
          fontVariantNumeric: 'tabular-nums',
          marginTop: 3,
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{sub}</div>
      )}
    </div>
  )
}

function lastRunSubLine(lastRun: LastRunSummary | null | undefined): string | undefined {
  if (!lastRun) return undefined
  const parts: string[] = []
  if (lastRun.dryRun) parts.push('dry-run')
  if (lastRun.charsUsedRun > 0) parts.push(`${lastRun.charsUsedRun.toLocaleString('es-AR')} chars`)
  if (lastRun.failed > 0) parts.push(`${lastRun.failed} fallaron`)
  if (lastRun.overLimit > 0) parts.push(`${lastRun.overLimit} pendientes`)
  parts.push(`trigger: ${lastRun.trigger}`)
  return parts.join(' · ')
}

// ── Sección 1 — Generar nuevo ──────────────────────────────────────────────

function GenerateSection({
  input,
  setInput,
  onSubmit,
  onRegenerate,
  generating,
  genError,
  result,
}: {
  input: string
  setInput: (s: string) => void
  onSubmit: () => void
  onRegenerate: () => void
  generating: boolean
  genError: string | null
  result: GenerationResult | null
}) {
  return (
    <section
      style={{
        background: '#fff',
        border: '1px solid #E5E7EB',
        borderRadius: 14,
        padding: 22,
        marginBottom: 28,
      }}
    >
      <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: '0 0 14px' }}>
        Generar audio nuevo
      </h2>

      <label
        htmlFor="audio-input"
        style={{ fontSize: 12, color: '#6B7280', display: 'block', marginBottom: 6 }}
      >
        ID de propiedad o URL de SI
      </label>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input
          id="audio-input"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !generating) onSubmit() }}
          placeholder="6909398 o https://siinmobiliaria.com/propiedades/6909398-slug"
          disabled={generating}
          style={{
            flex: 1,
            minWidth: 280,
            padding: '12px 14px',
            background: '#FAFAFA',
            border: '1px solid #D1D5DB',
            borderRadius: 10,
            fontSize: 14,
            fontFamily: R,
            color: '#111',
            outline: 'none',
          }}
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={generating || !input.trim()}
          style={{
            padding: '12px 22px',
            background: GREEN,
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            fontFamily: R,
            cursor: generating ? 'wait' : 'pointer',
            opacity: !input.trim() ? 0.5 : 1,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {generating
            ? <><Loader2 size={16} className="ap-spin" /> Generando…</>
            : <><Sparkles size={16} /> Generar audio</>}
        </button>
      </div>

      {generating && (
        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 10 }}>
          Generando con ElevenLabs… esto puede tardar 20-40 segundos.
        </div>
      )}

      {genError && !generating && (
        <div
          style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#B91C1C',
            padding: 12,
            borderRadius: 10,
            fontSize: 13,
            marginTop: 14,
          }}
        >
          {genError}
        </div>
      )}

      {result && !generating && (
        <div style={{ marginTop: 20 }}>
          <AudioPlayer
            audioUrl={result.url}
            propertyId={result.propertyId}
            variant="main"
          />

          <div style={{ marginTop: 16 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#6B7280',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 6,
              }}
            >
              Texto Haiku
            </div>
            <p
              style={{
                fontSize: 14,
                color: '#1F2937',
                lineHeight: 1.6,
                background: '#FAFAFA',
                border: '1px solid #E5E7EB',
                borderRadius: 10,
                padding: 14,
                margin: 0,
                whiteSpace: 'pre-wrap',
              }}
            >
              {result.text || '(no disponible)'}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              flexWrap: 'wrap',
              marginTop: 14,
              fontSize: 12,
              color: '#6B7280',
            }}
          >
            <span>
              <strong style={{ color: '#111' }}>{result.meta.textLength}</strong> chars del texto
            </span>
            {typeof result.meta.charsUsed === 'number' && (
              <span>
                <strong style={{ color: '#111' }}>{result.meta.charsUsed}</strong> chars de ElevenLabs
              </span>
            )}
            <span>Propiedad ID {result.propertyId}</span>
            <button
              type="button"
              onClick={onRegenerate}
              disabled={generating}
              style={{
                marginLeft: 'auto',
                padding: '7px 14px',
                background: '#fff',
                color: GREEN,
                border: `1px solid ${GREEN}`,
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: R,
                cursor: generating ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <RefreshCw size={13} /> Regenerar
            </button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ap-spin { to { transform: rotate(360deg); } }
        .ap-spin { animation: ap-spin 1s linear infinite; }
      ` }} />
    </section>
  )
}

// ── Sección 2 — Audios existentes ──────────────────────────────────────────

function ListSection({
  items,
  loading,
  error,
  onRefresh,
  onRegenerate,
  regeneratingId,
}: {
  items: AudioListItem[]
  loading: boolean
  error: string | null
  onRefresh: () => void
  onRegenerate: (id: number) => void
  regeneratingId: number | null
}) {
  return (
    <section>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: 0 }}>
          Audios existentes ({items.length})
        </h2>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          style={{
            fontSize: 12,
            color: GREEN,
            background: 'transparent',
            border: 'none',
            cursor: loading ? 'wait' : 'pointer',
            fontFamily: R,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <RefreshCw size={13} /> Refrescar
        </button>
      </div>

      {loading && (
        <div style={{ padding: '40px 0', textAlign: 'center', color: '#6B7280', fontSize: 14 }}>
          Cargando…
        </div>
      )}

      {error && !loading && (
        <div
          style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#B91C1C',
            padding: 12,
            borderRadius: 10,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div
          style={{
            padding: '40px 24px',
            textAlign: 'center',
            background: '#fff',
            border: '1px dashed #D1D5DB',
            borderRadius: 14,
            color: '#6B7280',
            fontSize: 14,
          }}
        >
          Todavía no hay audios generados.
        </div>
      )}

      {!loading && items.length > 0 && (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 12 }}>
          {items.map(item => (
            <ItemRow
              key={item.propertyId}
              item={item}
              onRegenerate={() => onRegenerate(item.propertyId)}
              regenerating={regeneratingId === item.propertyId}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

function ItemRow({
  item,
  onRegenerate,
  regenerating,
}: {
  item: AudioListItem
  onRegenerate: () => void
  regenerating: boolean
}) {
  const playerRef = useRef<HTMLAudioElement | null>(null)
  const propertyHref = item.slug ? `/propiedades/${item.slug}` : null

  return (
    <li
      style={{
        background: '#fff',
        border: '1px solid #E5E7EB',
        borderRadius: 12,
        padding: 14,
        display: 'grid',
        gridTemplateColumns: '64px 1fr',
        gap: 14,
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: 64,
          height: 48,
          borderRadius: 8,
          overflow: 'hidden',
          background: '#F3F4F6',
        }}
      >
        {item.thumb && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumb}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            loading="lazy"
          />
        )}
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#111',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.titulo}
          </div>
          <div
            style={{
              fontSize: 11,
              color: '#9CA3AF',
              fontVariantNumeric: 'tabular-nums',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {fmtDate(item.createdAt)}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
            marginTop: 8,
          }}
        >
          <audio
            ref={playerRef}
            controls
            preload="none"
            src={item.url}
            style={{ height: 32, flex: 1, minWidth: 220 }}
          />
          {propertyHref && (
            <Link
              href={propertyHref}
              target="_blank"
              style={{
                fontSize: 12,
                color: GREEN,
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Abrir en SI ↗
            </Link>
          )}
          <button
            type="button"
            onClick={onRegenerate}
            disabled={regenerating}
            style={{
              padding: '6px 10px',
              background: '#fff',
              color: GREEN,
              border: `1px solid ${GREEN}`,
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 600,
              fontFamily: R,
              cursor: regenerating ? 'wait' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <RefreshCw size={11} /> {regenerating ? 'Regenerando…' : 'Regenerar'}
          </button>
        </div>

        <div
          style={{
            fontSize: 11,
            color: '#9CA3AF',
            marginTop: 6,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          ID {item.propertyId}
          {item.charsUsed != null && <> · {item.charsUsed} chars ElevenLabs</>}
        </div>
      </div>
    </li>
  )
}
