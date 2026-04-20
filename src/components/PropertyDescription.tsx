'use client'

import { useMemo, useState } from 'react'
import { formatDescription, type FormattedBlock } from '@/lib/formatDescription'

const GREEN = '#1A5C38'
const R = "'Raleway', system-ui, sans-serif"

function Block({ block }: { block: FormattedBlock }) {
  if (block.type === 'heading') {
    return (
      <p
        className="mb-2 text-[15px] md:text-[16px] first:mt-0"
        style={{
          fontFamily: R,
          fontWeight: 700,
          color: '#111',
          marginTop: 22,
          lineHeight: 1.4,
        }}
      >
        {block.text}
      </p>
    )
  }
  return (
    <p
      className="mb-4 text-[14px] md:text-[15px]"
      style={{
        color: '#374151',
        lineHeight: 1.7,
        fontWeight: 400,
      }}
    >
      {block.text}
    </p>
  )
}

export default function PropertyDescription({ text }: { text: string | null | undefined }) {
  const blocks = useMemo(() => formatDescription(text), [text])
  const [expanded, setExpanded] = useState(false)

  if (blocks.length === 0) return null

  const rawLength = (text ?? '').length
  const isLong = rawLength > 420 || blocks.length > 5

  return (
    <div>
      <div className="relative">
        <div
          className={isLong && !expanded ? 'overflow-hidden' : ''}
          style={isLong && !expanded ? { maxHeight: 220 } : undefined}
        >
          {blocks.map((b, i) => <Block key={i} block={b} />)}
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
          onClick={() => setExpanded(v => !v)}
          className="mt-1 font-semibold text-sm hover:underline"
          style={{ color: GREEN, fontFamily: R }}
        >
          {expanded ? 'Ver menos' : 'Ver más'}
        </button>
      )}
    </div>
  )
}
