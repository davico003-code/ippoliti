'use client'

// Tabla de feedback por propiedad para el panel de /agentes (solo admin).
// Una fila por propiedad: miniatura · dirección · resultados del feedback en
// columnas (likes, caritas, valuación, objeciones, leads). Clic en la fila →
// desglose + lista de leads (PII). Botón "Archivar a Neon" (snapshot).

import { useState } from 'react'
import Image from 'next/image'
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

function topObjeciones(obj: Record<string, number>): string {
  const items = Object.entries(obj)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([k]) => OBJ_LABEL[k] ?? k)
  return items.length ? items.join(' · ') : '—'
}

export default function FeedbackPropiedadesTable({ rows }: { rows: PanelRow[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [archStatus, setArchStatus] = useState<'idle' | 'archivando' | 'ok' | 'error'>('idle')
  const [archMsg, setArchMsg] = useState('')

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

  const th: React.CSSProperties = {
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
  const td: React.CSSProperties = {
    fontFamily: POPPINS,
    fontSize: 13,
    color: CARBON,
    padding: '10px 12px',
    borderTop: `1px solid ${LINEA}`,
    verticalAlign: 'middle',
  }
  const tnum: React.CSSProperties = { ...td, fontVariantNumeric: 'tabular-nums' }

  return (
    <section aria-label="Feedback por propiedad" style={{ marginTop: 40 }}>
      <div className="flex items-center justify-between flex-wrap gap-3" style={{ marginBottom: 14 }}>
        <h2 style={{ fontFamily: RALEWAY, fontWeight: 800, fontSize: 20, color: VERDE_OSCURO, margin: 0 }}>
          Feedback por propiedad
        </h2>
        <div className="flex items-center gap-3">
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
        <div style={{ overflowX: 'auto', border: `1px solid ${LINEA}`, borderRadius: 14, background: '#fff' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
            <thead>
              <tr style={{ background: '#FAF7F2' }}>
                <th style={th}>Propiedad</th>
                <th style={{ ...th, textAlign: 'center' }}>❤️</th>
                <th style={{ ...th, textAlign: 'center' }}>Caritas</th>
                <th style={th}>Valuación</th>
                <th style={th}>Objeciones</th>
                <th style={{ ...th, textAlign: 'center' }}>🔔</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const isOpen = expanded === r.propertyId
                return (
                  <FragmentRow
                    key={r.propertyId}
                    r={r}
                    isOpen={isOpen}
                    onToggle={() => setExpanded(isOpen ? null : r.propertyId)}
                    td={td}
                    tnum={tnum}
                  />
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      <p style={{ fontFamily: POPPINS, fontSize: 11, color: GRIS, marginTop: 8, fontStyle: 'italic' }}>
        Data privada · los leads de “avisame” son PII. “Archivar a Neon” guarda un snapshot por propiedad.
      </p>
    </section>
  )
}

function FragmentRow({
  r,
  isOpen,
  onToggle,
  td,
  tnum,
}: {
  r: PanelRow
  isOpen: boolean
  onToggle: () => void
  td: React.CSSProperties
  tnum: React.CSSProperties
}) {
  return (
    <>
      <tr onClick={onToggle} style={{ cursor: 'pointer', background: isOpen ? '#FAF7F2' : '#fff' }}>
        <td style={td}>
          <div className="flex items-center gap-3">
            <div style={{ position: 'relative', width: 56, height: 40, borderRadius: 8, overflow: 'hidden', background: '#eee', flex: 'none' }}>
              {r.photo ? (
                <Image src={r.photo} alt="" fill className="object-cover" sizes="56px" />
              ) : null}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: RALEWAY, fontWeight: 600, color: CARBON, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
                {r.address}
              </div>
              <div style={{ fontSize: 12, color: GRIS, fontVariantNumeric: 'tabular-nums' }}>{r.priceLabel}</div>
            </div>
          </div>
        </td>
        <td style={{ ...tnum, textAlign: 'center', fontWeight: 700 }}>{num(r.likes)}</td>
        <td style={{ ...tnum, textAlign: 'center', whiteSpace: 'nowrap' }}>
          {REACT_META.map((m, i) => (
            <span key={m.key} style={{ marginLeft: i ? 8 : 0 }}>
              {m.emoji} {num(r.react[m.key])}
            </span>
          ))}
        </td>
        <td style={tnum}>
          {r.valuation.count > 0 ? (
            <span>
              {num(r.valuation.count)} resp ·{' '}
              <b style={{ color: pctColor(r.avgPct) }}>
                {r.avgPct == null ? '—' : `${r.avgPct > 0 ? '+' : ''}${r.avgPct}%`}
              </b>
            </span>
          ) : (
            '—'
          )}
        </td>
        <td style={{ ...td, fontSize: 12, color: GRIS }}>{topObjeciones(r.objection)}</td>
        <td style={{ ...tnum, textAlign: 'center', fontWeight: 700 }}>{num(r.alerts.length)}</td>
      </tr>

      {isOpen && (
        <tr>
          <td colSpan={6} style={{ ...td, background: '#FAF7F2', paddingTop: 4 }}>
            <FeedbackDetalleExpand r={r} />
          </td>
        </tr>
      )}
    </>
  )
}

function FeedbackDetalleExpand({ r }: { r: PanelRow }) {
  const { valuation } = r
  return (
    <div className="flex flex-col md:flex-row gap-6" style={{ padding: '6px 4px 10px' }}>
      <div style={{ minWidth: 200 }}>
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
        <div style={{ fontFamily: POPPINS, fontSize: 13, color: CARBON }}>
          {Object.entries(r.objection).filter(([, v]) => v > 0).length === 0 ? (
            <Empty />
          ) : (
            Object.entries(r.objection)
              .filter(([, v]) => v > 0)
              .sort((a, b) => b[1] - a[1])
              .map(([k, v]) => (
                <span key={k} style={{ marginRight: 10 }}>
                  {OBJ_LABEL[k] ?? k} <b style={{ fontVariantNumeric: 'tabular-nums' }}>{v}</b>
                </span>
              ))
          )}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 240 }}>
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
                <span style={{ fontWeight: 600 }}>{a.contacto}</span>
                <span style={{ fontSize: 11, color: '#fff', background: VERDE, borderRadius: 6, padding: '1px 7px' }}>
                  {a.canal}
                </span>
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
