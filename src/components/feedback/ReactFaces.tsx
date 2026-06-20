'use client'

// 4 caritas en la ficha de detalle: 😍 Me encanta · 🤔 Lo dudo · 💸 La veo
// cara · 🙈 No es para mí. Un tap resalta la elegida (y se puede cambiar).
// Sin textos explicativos extra. Auto-guarda en el backend.

import { useState } from 'react'

const POPPINS = "'Poppins', system-ui, sans-serif"
const RALEWAY = "'Raleway', system-ui, sans-serif"
const GREEN = '#1A5C38'

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
    <div>
      <p
        style={{ fontFamily: RALEWAY, fontWeight: 700, fontSize: 15, color: '#24292B', margin: '0 0 10px' }}
      >
        ¿Qué te pareció?
      </p>
      <div className="grid grid-cols-4 gap-2">
        {FACES.map((f) => {
          const active = selected === f.choice
          return (
            <button
              key={f.choice}
              type="button"
              aria-pressed={active}
              onClick={() => pick(f.choice)}
              className="flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl border transition-all"
              style={{
                borderColor: active ? GREEN : '#e5e7eb',
                background: active ? '#e8f5ee' : '#FAF7F2',
                transform: active ? 'translateY(-1px)' : 'none',
              }}
            >
              <span style={{ fontSize: 26, lineHeight: 1 }}>{f.emoji}</span>
              <span
                style={{
                  fontFamily: POPPINS,
                  fontSize: 11,
                  fontWeight: active ? 600 : 500,
                  color: active ? GREEN : '#6b7280',
                  textAlign: 'center',
                  lineHeight: 1.2,
                }}
              >
                {f.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
