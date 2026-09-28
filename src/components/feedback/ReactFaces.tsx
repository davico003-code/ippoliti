'use client'

// B — caritas de la ficha, versión compacta: fila "¿Qué te pareció?" + 4
// pastillas chicas (emoji + texto). Un tap resalta la elegida (cambia).
// Auto-guarda. Vive dentro de la tarjeta de FeedbackDetalle.

import { useState } from 'react'

const FACES = [
  { choice: 'encanta', emoji: '😍', label: 'Me encanta' },
  { choice: 'duda', emoji: '🤔', label: 'Lo dudo' },
  { choice: 'cara', emoji: '💸', label: 'La veo cara' },
  { choice: 'no', emoji: '🙈', label: 'No es para mí' },
] as const

export default function ReactFaces({
  propertyId,
  initialChoice = null,
}: {
  propertyId: number
  initialChoice?: string | null
}) {
  const [selected, setSelected] = useState<string | null>(initialChoice)

  const pick = (choice: string) => {
    setSelected(choice)
    fetch('/api/feedback/react', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId, choice }),
      credentials: 'same-origin',
    }).catch(() => {
      /* fire-and-forget */
    })
  }

  return (
    <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <p className="text-[13px] font-semibold text-[#24292B]">¿Qué te pareció?</p>
      <div className="flex flex-wrap gap-1.5">
        {FACES.map((f) => {
          const active = selected === f.choice
          return (
            <button
              key={f.choice}
              type="button"
              aria-pressed={active}
              onClick={() => pick(f.choice)}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[12px] leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5C38]/40 ${
                active
                  ? 'border-[#1A5C38] bg-[#1A5C38]/[0.06] font-semibold text-[#1A5C38]'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:text-[#24292B]'
              }`}
            >
              <span aria-hidden className="text-[13px]">
                {f.emoji}
              </span>
              {f.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
