'use client'

// B — 4 caritas en la ficha (diseño v4 FINAL): tira segmentada unida bajo el
// título "¿Qué te pareció?". 😍 Me encanta · 🤔 Lo dudo · 💸 La veo cara ·
// 🙈 No es para mí. Un tap resalta la elegida (cambia). Auto-guarda.
//
// Specs (_referencias/feedback/…, .panel + .react-strip):
//   panel blanco r16 borde #E9E3DA · h3 centrado Raleway 16/700 #0F3F26
//   strip: flex, 1 borde, divididos por línea, emoji 21px, label 9.5px #7C8488
//   activa: fondo #F2EFE9

import { useState } from 'react'

const POPPINS = "'Poppins', system-ui, sans-serif"
const RALEWAY = "'Raleway', system-ui, sans-serif"
const LINEA = '#E9E3DA'
const GRIS = '#7C8488'
const VERDE_OSCURO = '#0F3F26'

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
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        border: `1px solid ${LINEA}`,
        boxShadow: '0 2px 14px rgba(36,41,43,.07)',
        padding: '20px 18px',
      }}
    >
      <h3
        style={{
          fontFamily: RALEWAY,
          textAlign: 'center',
          fontSize: 16,
          fontWeight: 700,
          color: VERDE_OSCURO,
        }}
      >
        ¿Qué te pareció?
      </h3>

      <div
        className="flex"
        style={{ marginTop: 14, border: `1px solid ${LINEA}`, borderRadius: 12, overflow: 'hidden' }}
      >
        {FACES.map((f, i) => {
          const active = selected === f.choice
          return (
            <button
              key={f.choice}
              type="button"
              aria-pressed={active}
              aria-label={f.label}
              onClick={() => pick(f.choice)}
              className="flex-1 cursor-pointer border-0"
              style={{
                background: active ? '#F2EFE9' : '#fff',
                padding: '13px 4px',
                fontSize: 21,
                borderRight: i < FACES.length - 1 ? `1px solid ${LINEA}` : 'none',
                transition: '0.15s',
              }}
            >
              {f.emoji}
              <span
                style={{
                  display: 'block',
                  fontFamily: POPPINS,
                  fontSize: 9.5,
                  color: GRIS,
                  marginTop: 5,
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
