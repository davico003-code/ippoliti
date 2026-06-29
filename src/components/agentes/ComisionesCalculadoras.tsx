'use client'

// Placa "Calculadora de comisiones" del panel de agentes. Tres solapas:
//   · Ventas      → VENTAS_HTML
//   · Alquileres  → ALQUILERES_HTML
//   · Objetivos   → en preparación (pendiente el HTML de David)
//
// Cada calculadora es HTML autocontenido (CSS global + <script>) y se monta en
// un <iframe srcDoc> para aislarla del panel. El alto del iframe se ajusta solo
// al contenido (onLoad + ResizeObserver; el srcdoc es same-origin).

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Home, Building2, Target } from 'lucide-react'
import { VENTAS_HTML, ALQUILERES_HTML } from './comisionesCalcs'

const GREEN = '#1A5C38'
const LINE = '#E4E4E7'
const TEXT = '#09090B'
const TEXT_MUTED = '#52525B'
const TEXT_SOFT = '#71717A'

const RALEWAY = 'var(--font-raleway), Raleway, system-ui, sans-serif'
const POPPINS = 'var(--font-poppins), Poppins, system-ui, sans-serif'

type Tab = 'ventas' | 'alquileres' | 'objetivos'

const TABS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: 'ventas', label: 'Ventas', icon: Home },
  { id: 'alquileres', label: 'Alquileres', icon: Building2 },
  { id: 'objetivos', label: 'Objetivos propios', icon: Target },
]

function CalcFrame({ html }: { html: string }) {
  const ref = useRef<HTMLIFrameElement>(null)
  const roRef = useRef<ResizeObserver | null>(null)
  const [height, setHeight] = useState(640)

  const measure = () => {
    const doc = ref.current?.contentDocument
    if (!doc) return
    const h = Math.max(
      doc.documentElement?.scrollHeight || 0,
      doc.body?.scrollHeight || 0,
    )
    if (h) setHeight(h)
  }

  const handleLoad = () => {
    measure()
    const doc = ref.current?.contentDocument
    if (doc && typeof ResizeObserver !== 'undefined') {
      roRef.current?.disconnect()
      roRef.current = new ResizeObserver(() => measure())
      if (doc.documentElement) roRef.current.observe(doc.documentElement)
      if (doc.body) roRef.current.observe(doc.body)
    }
    // Re-medir tras cargar fuentes y correr las animaciones de las barras.
    window.setTimeout(measure, 300)
    window.setTimeout(measure, 900)
  }

  useEffect(() => () => roRef.current?.disconnect(), [])

  return (
    <iframe
      ref={ref}
      srcDoc={html}
      onLoad={handleLoad}
      title="Calculadora"
      scrolling="no"
      style={{
        width: '100%',
        height,
        border: 'none',
        display: 'block',
        background: '#fff',
        borderRadius: 16,
      }}
    />
  )
}

export default function ComisionesCalculadoras() {
  const [tab, setTab] = useState<Tab>('ventas')

  return (
    <div style={{ background: '#FAFAFA', minHeight: '100vh', fontFamily: RALEWAY, color: TEXT }}>
      <main style={{ maxWidth: 880, margin: '0 auto', padding: 'clamp(24px, 4vw, 48px) clamp(18px, 4vw, 32px) 80px' }}>
        <Link
          href="/agentes"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: POPPINS,
            fontSize: 12.5,
            color: TEXT_SOFT,
            textDecoration: 'none',
            marginBottom: 18,
          }}
        >
          <ArrowLeft size={14} /> Volver al panel
        </Link>

        <header style={{ marginBottom: 22 }}>
          <h1
            style={{
              fontFamily: RALEWAY,
              fontWeight: 700,
              fontSize: 'clamp(24px, 3.5vw, 32px)',
              letterSpacing: '-0.02em',
              margin: '0 0 6px',
            }}
          >
            Calculadora de comisiones
          </h1>
          <p style={{ fontFamily: POPPINS, fontWeight: 300, fontSize: 14, color: TEXT_MUTED, margin: 0 }}>
            Simulá cuánto cobrás en cada operación y seguí tus objetivos.
          </p>
        </header>

        {/* Solapas */}
        <div
          role="tablist"
          aria-label="Calculadoras"
          style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}
        >
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id
            return (
              <button
                key={id}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  fontFamily: POPPINS,
                  fontWeight: 600,
                  fontSize: 13.5,
                  padding: '10px 18px',
                  borderRadius: 9999,
                  cursor: 'pointer',
                  border: `1.5px solid ${active ? GREEN : LINE}`,
                  background: active ? GREEN : '#fff',
                  color: active ? '#fff' : TEXT_MUTED,
                  transition: 'background .15s, color .15s, border-color .15s',
                }}
              >
                <Icon size={15} strokeWidth={2} /> {label}
              </button>
            )
          })}
        </div>

        {/* Contenido de la solapa activa */}
        {tab === 'ventas' && <CalcFrame key="ventas" html={VENTAS_HTML} />}
        {tab === 'alquileres' && <CalcFrame key="alquileres" html={ALQUILERES_HTML} />}
        {tab === 'objetivos' && (
          <div
            style={{
              background: '#fff',
              border: `1px solid ${LINE}`,
              borderRadius: 16,
              padding: '48px 28px',
              textAlign: 'center',
            }}
          >
            <Target size={32} strokeWidth={1.6} color={GREEN} />
            <h2 style={{ fontFamily: POPPINS, fontWeight: 700, fontSize: 18, margin: '14px 0 6px' }}>
              Objetivos propios
            </h2>
            <p style={{ fontFamily: POPPINS, fontWeight: 300, fontSize: 13.5, color: TEXT_MUTED, maxWidth: 380, margin: '0 auto' }}>
              Próximamente.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
