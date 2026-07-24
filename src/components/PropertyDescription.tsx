'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { formatDescription, type FormattedBlock } from '@/lib/formatDescription'

const GREEN = '#1A5C38'
const R = "'Raleway', system-ui, sans-serif"

function Block({ block }: { block: FormattedBlock }) {
  if (block.type === 'title') {
    return (
      <span
        className="section-title block text-[15.5px] md:text-[16.5px]"
        style={{
          fontFamily: R,
          fontWeight: 700,
          color: '#111827',
          marginTop: 28,
          marginBottom: 10,
          lineHeight: 1.35,
        }}
      >
        {block.content}
      </span>
    )
  }

  if (block.type === 'list') {
    return (
      <ul style={{ listStyle: 'none', margin: '0 0 16px', padding: 0 }}>
        {block.items.map((item, i) => (
          <li
            key={i}
            className="text-[15px] md:text-[15.5px]"
            style={{
              position: 'relative',
              paddingLeft: 20,
              color: '#374151',
              lineHeight: 1.65,
              marginBottom: i === block.items.length - 1 ? 0 : 7,
              fontWeight: 400,
            }}
          >
            <span
              aria-hidden
              style={{ position: 'absolute', left: 2, top: 1, color: GREEN, fontWeight: 700 }}
            >
              ✓
            </span>
            {item}
          </li>
        ))}
      </ul>
    )
  }

  if (block.type === 'dataGroup') {
    return (
      <div className="data-group" style={{ marginBottom: 16 }}>
        {block.content.map((dl, i) => (
          <span
            key={i}
            className="data-line block text-[15px] md:text-[15.5px]"
            style={{
              color: '#374151',
              lineHeight: 1.6,
              marginBottom: i === block.content.length - 1 ? 0 : 4,
            }}
          >
            <strong style={{ fontWeight: 600, color: '#111827' }}>{dl.key}:</strong>{' '}
            {dl.value}
          </span>
        ))}
      </div>
    )
  }

  // paragraph
  return (
    <p
      className="text-[15px] md:text-[15.5px]"
      style={{
        color: '#374151',
        lineHeight: 1.75,
        marginBottom: 16,
        fontWeight: 400,
      }}
    >
      {block.subtitle && (
        <>
          <strong style={{ fontWeight: 700, color: '#111827' }}>{block.subtitle}.</strong>{' '}
        </>
      )}
      {block.content}
    </p>
  )
}

export default function PropertyDescription({ text }: { text: string | null | undefined }) {
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
    <div className="prose-description">
      <div className="relative">
        <div
          className={isLong && !expanded ? 'overflow-hidden' : ''}
          style={isLong && !expanded ? { maxHeight: 220 } : undefined}
        >
          {/* Primer bloque sin margin-top extra (reset del section-title inicial) */}
          {blocks.map((b, i) => (
            <div key={i} style={i === 0 && b.type === 'title' ? { marginTop: 0 } : undefined}>
              <Block block={b} />
            </div>
          ))}
        </div>
        {isLong && !expanded && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
            style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, #ffffff 85%)' }}
          />
        )}
      </div>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          aria-expanded={expanded}
          className="mt-1 min-h-11 font-semibold text-sm hover:underline inline-flex items-center gap-1.5"
          style={{ color: GREEN, fontFamily: R, fontWeight: 600 }}
        >
          {expanded ? (
            <>Ver menos <ChevronUp className="h-4 w-4" aria-hidden /></>
          ) : (
            <>Ver más <ChevronDown className="h-4 w-4" aria-hidden /></>
          )}
        </button>
      )}
    </div>
  )
}
