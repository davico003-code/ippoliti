'use client'

// Replica del PropertyDescription del sitio SI con paleta neutra.
// Reusa el parser lib/formatDescription (3 tipos de bloques: title /
// dataGroup / paragraph con subtitle inline opcional).
//
// Fade + "Ver más" cuando la descripción es larga (>420 chars o >5 bloques).

import { useMemo, useState } from 'react'
import { formatDescription, type FormattedBlock } from '@/lib/formatDescription'

const ACCENT = '#2563EB'

function Block({ block }: { block: FormattedBlock }) {
  if (block.type === 'title') {
    return (
      <h3
        style={{
          fontSize: 17,
          fontWeight: 600,
          color: '#1A1A1A',
          marginTop: 28,
          marginBottom: 10,
          lineHeight: 1.35,
          letterSpacing: '-0.005em',
        }}
      >
        {block.content}
      </h3>
    )
  }

  if (block.type === 'dataGroup') {
    return (
      <div className="desc-data" style={{ marginBottom: 16 }}>
        {block.content.map((dl, i) => (
          <div
            key={i}
            style={{
              color: '#4A4A4A',
              fontSize: 16,
              lineHeight: 1.6,
              marginBottom: i === block.content.length - 1 ? 0 : 4,
            }}
          >
            <strong style={{ fontWeight: 600, color: '#1A1A1A' }}>{dl.key}:</strong>{' '}
            {dl.value}
          </div>
        ))}
      </div>
    )
  }

  return (
    <p
      className="desc-para"
      style={{
        color: '#4A4A4A',
        fontSize: 17,
        lineHeight: 1.75,
        marginBottom: 16,
      }}
    >
      {block.subtitle && (
        <>
          <strong style={{ fontWeight: 700, color: '#1A1A1A' }}>{block.subtitle}.</strong>{' '}
        </>
      )}
      {block.content}
    </p>
  )
}

export default function StructuredDescription({ text }: { text: string | null | undefined }) {
  const blocks = useMemo(() => {
    const parsed = formatDescription(text)
    if (parsed.length > 0) return parsed
    const fallback = (text ?? '').trim()
    if (!fallback) return []
    return [{ type: 'paragraph', content: fallback }] as FormattedBlock[]
  }, [text])
  const [expanded, setExpanded] = useState(false)

  if (blocks.length === 0) return null

  const rawLength = (text ?? '').length
  const isLong = rawLength > 420 || blocks.length > 5

  return (
    <section style={{ marginTop: 36 }}>
      <h2
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: '#1A1A1A',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 16,
        }}
      >
        Descripción
      </h2>

      <div style={{ position: 'relative' }}>
        <div
          style={
            isLong && !expanded
              ? { maxHeight: 240, overflow: 'hidden' }
              : undefined
          }
        >
          {blocks.map((b, i) => (
            <div
              key={i}
              style={
                i === 0 && b.type === 'title' ? { marginTop: 0 } : undefined
              }
            >
              <Block block={b} />
            </div>
          ))}
        </div>
        {isLong && !expanded && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 80,
              pointerEvents: 'none',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, #ffffff 85%)',
            }}
          />
        )}
      </div>

      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          style={{
            marginTop: 8,
            background: 'transparent',
            border: 'none',
            padding: 0,
            color: ACCENT,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'inherit',
          }}
        >
          {expanded ? <>Ver menos <span aria-hidden>↑</span></> : <>Ver más <span aria-hidden>↓</span></>}
        </button>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desc-para { font-size: 18px !important; }
          .desc-data > div { font-size: 17px !important; }
        }
      `}</style>
    </section>
  )
}
