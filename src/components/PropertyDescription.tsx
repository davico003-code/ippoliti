'use client'

import { useState } from 'react'
import { formatDescripcion } from '@/lib/format-description'

export default function PropertyDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = text.length > 300
  const html = formatDescripcion(text)

  return (
    <div>
      <div
        className={`prose-description ${!expanded && isLong ? 'line-clamp-6' : ''}`}
        style={{
          fontFamily: "'Poppins', system-ui, sans-serif",
          fontSize: 14,
          fontWeight: 400,
          color: '#374151',
          lineHeight: 1.7,
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-[#1A5C38] font-semibold text-sm hover:underline"
        >
          {expanded ? 'Ver menos' : 'Ver más'}
        </button>
      )}
      <style>{`.prose-description strong { color: #1A5C38; font-weight: 700; }`}</style>
    </div>
  )
}
