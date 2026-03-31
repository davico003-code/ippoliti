'use client'

import { useState } from 'react'

export default function PropertyDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = text.length > 300

  return (
    <div>
      <p
        className={`text-gray-700 leading-relaxed whitespace-pre-line text-[15px] ${
          !expanded && isLong ? 'line-clamp-4' : ''
        }`}
      >
        {text}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-[#1A5C38] font-semibold text-sm hover:underline"
        >
          {expanded ? 'Ver menos' : 'Ver más'}
        </button>
      )}
    </div>
  )
}
