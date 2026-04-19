'use client'

import { useMemo, useState } from 'react'
import { formatDescription, type FormattedBlock } from '@/lib/formatDescription'

const GREEN = '#1A5C38'
const P = "'Poppins', system-ui, sans-serif"
const R = "'Raleway', system-ui, sans-serif"

function Block({ block }: { block: FormattedBlock }) {
  switch (block.type) {
    case 'heading':
      return (
        <h3
          className="text-gray-900 mt-6 mb-3 first:mt-0"
          style={{ fontFamily: R, fontWeight: 700, fontSize: 17, lineHeight: 1.35 }}
        >
          {block.text}
        </h3>
      )
    case 'paragraph':
      return (
        <p
          className="mb-4"
          style={{ fontFamily: P, fontSize: 15, lineHeight: 1.7, color: '#374151', fontWeight: 400 }}
        >
          {block.text}
        </p>
      )
    case 'list':
      return block.ordered ? (
        <ol
          className="list-decimal ml-5 space-y-1 mb-4 marker:text-[#1A5C38] marker:font-semibold"
          style={{ fontFamily: P, fontSize: 15, lineHeight: 1.7, color: '#374151' }}
        >
          {block.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ol>
      ) : (
        <ul
          className="list-disc ml-5 space-y-1 mb-4 marker:text-[#1A5C38]"
          style={{ fontFamily: P, fontSize: 15, lineHeight: 1.7, color: '#374151' }}
        >
          {block.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      )
    case 'keyvalue':
      return (
        <dl
          className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mb-4"
          style={{ fontFamily: P, fontSize: 15, lineHeight: 1.7, color: '#374151' }}
        >
          {block.items.map((it, i) => (
            <div key={i} className="flex gap-2 border-b border-gray-100 pb-1.5">
              <dt className="text-gray-500" style={{ fontWeight: 600 }}>{it.key}:</dt>
              <dd className="text-gray-800 flex-1" style={{ fontWeight: 400 }}>{it.value}</dd>
            </div>
          ))}
        </dl>
      )
  }
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
