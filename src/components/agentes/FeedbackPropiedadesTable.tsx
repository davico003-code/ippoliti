'use client'

// Feedback por propiedad para el panel de /agentes (solo admin).
// Responsive: en desktop (md+) una tabla; en móvil (<md) cards apiladas que
// ajustan al ancho de la pantalla (sin scroll horizontal). Una "ficha" por
// propiedad: miniatura · dirección · likes · caritas · valuación · objeciones ·
// leads. Tap → desglose + lista de leads (PII). Botón "Archivar a Neon".

import { useState } from 'react'
import Image from 'next/image'
import { ChevronDown } from 'lucide-react'
import type { PanelRow } from '@/lib/feedback-admin'

const POPPINS = "'Poppins', system-ui, sans-serif"
const RALEWAY = "'Raleway', system-ui, sans-serif"
const VERDE = '#1A5C38'
const VERDE_OSCURO = '#0F3F26'
const GRIS = '#7C8488'
const LINEA = '#E9E3DA'
const CARBON = '#24292B'

const REACT_META: { key: 'encanta' | 'duda' | 'cara' | 'no'; emoji: string }[] = [
  { key: 'encanta', emoji: '😍' },
  { key: 'duda', emoji: '🤔' },
  { key: 'cara', emoji: '💸' },
  { key: 'no', emoji: '🙈' },
]

const OBJ_LABEL: Record<string, string> = {
  estado: 'Estado',
  ubicacion: 'Ubicación',
  tamano: 'Tamaño',
  metro: 'Metro caro',
  expensas: 'Expensas',
}

const num = (n: number) => n.toLocaleString('es-AR')

function pctColor(pct: number | null): string {
  if (pct == null || pct === 0) return GRIS
  return pct < 0 ? '#C0563E' : VERDE
}

function pctLabel(pct: number | null): string {
  if (pct == null) return '—'
  return `${pct > 0 ? '+' : ''}${pct}%`
}

function topObjeciones(obj: Record<string, number>): string {
  const items = Object.entries(obj)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([k]) => OBJ_LABEL[k] ?? k)
  return items.length ? items.join(' · ') : '—'
}

function reactInline(r: PanelRow): string {
  return REACT_META.map((m) => `${m.emoji} ${num(r.react[m.key])}`).join('  ')
}

export default function FeedbackPropiedadesTable({ rows }: { rows: PanelRow[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [archStatus, setArchStatus] = useState<'idle' | 'archivando' | 'ok' | 'error'>('idle')
  const [archMsg, setArchMsg] = useState('')

  const toggle = (id: string) => setExpanded((cur) => (cur === id ? null : id))

  const archivarTodo = () => {
    if (archStatus === 'archivando') return
    setArchStatus('archivando')
    fetch('/api/feedback/archivar', { method: 'POST', credentials: 'same-origin' })
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (ok) {
          setArchStatus('ok')
          setArchMsg(`✓ ${d.archived} propiedad${d.archived === 1 ? '' : 'es'} archivada${d.archived === 1 ? '' : 's'} en Neon`)
        } else {
          setArchStatus('error')
          setArchMsg(d?.error === 'no_autorizado' ? 'Solo admin' : 'Error al archivar')
        }
      })
      .catch(() => {
        setArchStatus('error')
        setArchMsg('Error de red')
      })
  }

  return (
    <section aria-label="Feedback por propiedad" style={{ marginTop: 40 }}>
      <div className="flex items-center justify-between flex-wrap gap-3" style={{ marginBottom: 14 }}>
        <h2 style={{ fontFamily: RALEWAY, fontWeight: 800, fontSize: 20, color: VERDE_OSCURO, margin: 0 }}>
          Feedback por propiedad
        </h2>
        <div className="flex items-center gap-3 flex-wrap">
          {archMsg && (
            <span style={{ fontFamily: POPPINS, fontSize: 12, color: archStatus === 'error' ? '#C0563E' : VERDE }}>
              {archMsg}
            </span>
          )}
          <button
            type="button"
            onClick={archivarTodo}
            disabled={archStatus === 'archivando' || rows.length === 0}
            className="cursor-pointer disabled:opacity-60"
            style={{
              fontFamily: RALEWAY,
              fontWeight: 700,
              fontSize: 13,
              color: '#fff',
              background: VERDE,
              border: 'none',
              borderRadius: 10,
              padding: '9px 16px',
            }}
          >
            {archStatus === 'archivando' ? 'Archivando…' : 'Archivar a Neon'}
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <p style={{ fontFamily: POPPINS, fontSize: 13, color: GRIS }}>
          Todavía no hay feedback registrado en ninguna propiedad.
        </p>
      ) : (
        <>
          {/* ── Móvil: cards apiladas ── */}
          <div className="md:hidden flex flex-col gap-3">
            {rows.map((r) => (
              <MobileCard key={r.propertyId} r={r} isOpen={expanded === r.propertyId} onToggle={() => toggle(r.propertyId)} />
            ))}
          </div>

          {/* ── Desktop: tabla ── */}
          <div className="hidden md:block" style={{ overflowX: 'auto', border: `1px solid ${LINEA}`, borderRadius: 14, background: '#fff' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
              <thead>
                <tr style={{ background: '#FAF7F2' }}>
                  <th style={TH}>Propiedad</th>
                  <th style={{ ...TH, textAlign: 'center' }}>❤️</th>
                  <th style={{ ...TH, textAlign: 'center' }}>Caritas</th>
                  <th style={TH}>Valuación</th>
                  <th style={TH}>Objeciones</th>
                  <th style={{ ...TH, textAlign: 'center' }}>🔔</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <DesktopRow key={r.propertyId} r={r} isOpen={expanded === r.propertyId} onToggle={() => toggle(r.propertyId)} />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <p style={{ fontFamily: POPPINS, fontSize: 11, color: GRIS, marginTop: 8, fontStyle: 'italic' }}>
        Data privada · los leads de “avisame” son PII. “Archivar a Neon” guarda un snapshot por propiedad.
      </p>
    </section>
  )
}

// ── Card móvil ──────────────────────────────────────────────────────────────
function MobileCard({ r, isOpen, onToggle }: { r: PanelRow; isOpen: boolean; onToggle: () => void }) {
  return (
    <div style={{ border: `1px solid ${LINEA}`, borderRadius: 14, background: '#fff', overflow: 'hidden' }}>
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onToggle()
          }
        }}
        className="cursor-pointer"
        style={{ padding: 14, background: isOpen ? '#FAF7F2' : '#fff' }}
      >
        {/* Cabecera: miniatura + dirección + precio */}
        <div className="flex items-center gap-3">
          <div style={{ position: 'relative', width: 56, height: 42, borderRadius: 8, overflow: 'hidden', background: '#eee', flex: 'none' }}>
            {r.photo ? <Image src={r.photo} alt="" fill className="object-cover" sizes="56px" /> : null}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontFamily: RALEWAY, fontWeight: 600, color: CARBON, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {r.address}
            </div>
            <div style={{ fontSize: 12, color: GRIS, fontVariantNumeric: 'tabular-nums' }}>{r.priceLabel}</div>
          </div>
          <ChevronDown
            className="flex-none"
            style={{ width: 18, height: 18, color: GRIS, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}
          />
        </div>

        {/* Métricas: flex-wrap, ajusta al ancho */}
        <div className="flex flex-wrap items-center" style={{ gap: '8px 16px', marginTop: 12, fontFamily: POPPINS, fontSize: 13, color: CARBON, fontVariantNumeric: 'tabular-nums' }}>
          <span><b>❤️ {num(r.likes)}</b></span>
          <span style={{ whiteSpace: 'nowrap' }}>{reactInline(r)}</span>
          <span style={{ whiteSpace: 'nowrap' }}>🔔 <b>{num(r.alerts.length)}</b></span>
        </div>
        <div className="flex flex-wrap" style={{ gap: '4px 16px', marginTop: 8, fontFamily: POPPINS, fontSize: 12, color: GRIS }}>
          <span>
            Valuación:{' '}
            {r.valuation.count > 0 ? (
              <>
                {num(r.valuation.count)} resp · <b style={{ color: pctColor(r.avgPct) }}>{pctLabel(r.avgPct)}</b>
              </>
            ) : (
              '—'
            )}
          </span>
          <span>Objeciones: {topObjeciones(r.objection)}</span>
        </div>
      </div>

      {isOpen && (
        <div style={{ padding: '0 14px 12px' }}>
          <FeedbackDetalleExpand r={r} />
        </div>
      )}
    </div>
  )
}

// ── Fila desktop ─────────────────────────────────────────────────────────────
const TH: React.CSSProperties = {
  fontFamily: RALEWAY,
  fontWeight: 700,
  fontSize: 11,
  color: GRIS,
  textTransform: 'uppercase',
  letterSpacing: '.4px',
  textAlign: 'left',
  padding: '10px 12px',
  whiteSpace: 'nowrap',
}
const TD: React.CSSProperties = {
  fontFamily: POPPINS,
  fontSize: 13,
  color: CARBON,
  padding: '10px 12px',
  borderTop: `1px solid ${LINEA}`,
  verticalAlign: 'middle',
}
const TNUM: React.CSSProperties = { ...TD, fontVariantNumeric: 'tabular-nums' }

function DesktopRow({ r, isOpen, onToggle }: { r: PanelRow; isOpen: boolean; onToggle: () => void }) {
  return (
    <>
      <tr onClick={onToggle} style={{ cursor: 'pointer', background: isOpen ? '#FAF7F2' : '#fff' }}>
        <td style={TD}>
          <div className="flex items-center gap-3">
            <div style={{ position: 'relative', width: 56, height: 40, borderRadius: 8, overflow: 'hidden', background: '#eee', flex: 'none' }}>
              {r.photo ? <Image src={r.photo} alt="" fill className="object-cover" sizes="56px" /> : null}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: RALEWAY, fontWeight: 600, color: CARBON, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
                {r.address}
              </div>
              <div style={{ fontSize: 12, color: GRIS, fontVariantNumeric: 'tabular-nums' }}>{r.priceLabel}</div>
            </div>
          </div>
        </td>
        <td style={{ ...TNUM, textAlign: 'center', fontWeight: 700 }}>{num(r.likes)}</td>
        <td style={{ ...TNUM, textAlign: 'center', whiteSpace: 'nowrap' }}>
          {REACT_META.map((m, i) => (
            <span key={m.key} style={{ marginLeft: i ? 8 : 0 }}>
              {m.emoji} {num(r.react[m.key])}
            </span>
          ))}
        </td>
        <td style={TNUM}>
          {r.valuation.count > 0 ? (
            <span>
              {num(r.valuation.count)} resp ·{' '}
              <b style={{ color: pctColor(r.avgPct) }}>{pctLabel(r.avgPct)}</b>
            </span>
          ) : (
            '—'
          )}
        </td>
        <td style={{ ...TD, fontSize: 12, color: GRIS }}>{topObjeciones(r.objection)}</td>
        <td style={{ ...TNUM, textAlign: 'center', fontWeight: 700 }}>{num(r.alerts.length)}</td>
      </tr>
      {isOpen && (
        <tr>
          <td colSpan={6} style={{ ...TD, background: '#FAF7F2', paddingTop: 4 }}>
            <FeedbackDetalleExpand r={r} />
          </td>
        </tr>
      )}
    </>
  )
}

// ── Desglose (compartido móvil/desktop) ──────────────────────────────────────
function FeedbackDetalleExpand({ r }: { r: PanelRow }) {
  const { valuation } = r
  return (
    <div className="flex flex-col md:flex-row gap-6" style={{ padding: '6px 0 10px' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Label>Valuación percibida</Label>
        {valuation.count > 0 ? (
          <div style={{ fontFamily: POPPINS, fontSize: 13, color: CARBON, fontVariantNumeric: 'tabular-nums' }}>
            {valuation.count} respuestas<br />
            prom {num(valuation.avg ?? 0)} · min {num(valuation.min ?? 0)} · max {num(valuation.max ?? 0)}<br />
            publicado {num(r.publishedPrice)}
          </div>
        ) : (
          <Empty />
        )}
        <Label>Objeciones</Label>
        <div className="flex flex-wrap" style={{ gap: '4px 10px', fontFamily: POPPINS, fontSize: 13, color: CARBON }}>
          {Object.entries(r.objection).filter(([, v]) => v > 0).length === 0 ? (
            <Empty />
          ) : (
            Object.entries(r.objection)
              .filter(([, v]) => v > 0)
              .sort((a, b) => b[1] - a[1])
              .map(([k, v]) => (
                <span key={k}>
                  {OBJ_LABEL[k] ?? k} <b style={{ fontVariantNumeric: 'tabular-nums' }}>{v}</b>
                </span>
              ))
          )}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <Label>Leads “avisame si baja” ({r.alerts.length})</Label>
        {r.alerts.length === 0 ? (
          <Empty />
        ) : (
          <div className="flex flex-col gap-1.5">
            {r.alerts.map((a, i) => (
              <div
                key={i}
                className="flex items-center gap-2 flex-wrap"
                style={{ fontFamily: POPPINS, fontSize: 13, color: CARBON, fontVariantNumeric: 'tabular-nums' }}
              >
                <span style={{ fontWeight: 600, wordBreak: 'break-all' }}>{a.contacto}</span>
                <span style={{ fontSize: 11, color: '#fff', background: VERDE, borderRadius: 6, padding: '1px 7px' }}>{a.canal}</span>
                {a.valuacion != null && <span style={{ color: GRIS }}>valuó {num(a.valuacion)}</span>}
                <span style={{ color: GRIS, fontSize: 11 }}>{new Date(a.ts).toLocaleDateString('es-AR')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: RALEWAY, fontWeight: 700, fontSize: 11, color: GRIS, textTransform: 'uppercase', letterSpacing: '.4px', margin: '12px 0 5px' }}>
      {children}
    </div>
  )
}
function Empty() {
  return <span style={{ fontFamily: POPPINS, fontSize: 13, color: GRIS }}>—</span>
}
