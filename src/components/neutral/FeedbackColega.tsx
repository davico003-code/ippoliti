'use client'

// Card de feedback anónimo para la ficha white-label (verficha.casa).
// 3 botones (me gusta / podría ser / no es lo que busca). No pide ni envía
// ningún dato del colega. Un voto por sesión (localStorage por slug) + el
// backend tiene anti-spam por IP y fingerprint.
//
// Tipografía: usa la fuente del contexto neutral (Inter vía inherit), NO
// Poppins, para no introducir un tell de branding SI en la ficha neutra.

import { useEffect, useState } from 'react'

type Choice = 'gusta' | 'podria' | 'no_gusta'

interface Props {
  slug: string
}

const OPTIONS: {
  key: Choice
  emoji: string
  label: string
  bg: string
  color: string
  border: string
  solid: string
}[] = [
  { key: 'gusta', emoji: '👍', label: 'Me gusta', bg: '#ECFDF5', color: '#047857', border: '#A7F3D0', solid: '#047857' },
  { key: 'podria', emoji: '🤔', label: 'Podría ser', bg: '#FFFBEB', color: '#92400E', border: '#FDE68A', solid: '#92400E' },
  { key: 'no_gusta', emoji: '👎', label: 'No es lo que busca', bg: '#FEF2F2', color: '#991B1B', border: '#FECACA', solid: '#991B1B' },
]

// Hash simple (djb2) de userAgent + screen + timezone. Sin librerías.
function makeFingerprint(): string {
  try {
    const raw = [
      navigator.userAgent,
      `${window.screen.width}x${window.screen.height}`,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
    ].join('|')
    let h = 5381
    for (let i = 0; i < raw.length; i++) h = ((h << 5) + h + raw.charCodeAt(i)) >>> 0
    return h.toString(36)
  } catch {
    return ''
  }
}

export default function FeedbackColega({ slug }: Props) {
  const [choice, setChoice] = useState<Choice | null>(null)
  const [sending, setSending] = useState(false)

  // Al mount: si ya votó en esta sesión para este slug, mostrar estado votado.
  useEffect(() => {
    try {
      const prev = localStorage.getItem(`feedback_${slug}`)
      if (prev === 'gusta' || prev === 'podria' || prev === 'no_gusta') {
        setChoice(prev)
      }
    } catch {
      /* localStorage no disponible: queda en estado normal */
    }
  }, [slug])

  const voted = choice !== null

  const handleVote = (c: Choice) => {
    if (voted || sending) return
    setSending(true)
    setChoice(c) // optimista: el feedback se considera registrado al click
    try {
      localStorage.setItem(`feedback_${slug}`, c)
    } catch {
      /* ignore */
    }
    fetch('/api/colega/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-fingerprint': makeFingerprint(),
      },
      body: JSON.stringify({ slug, choice: c }),
    })
      .catch(() => {
        /* anti-spam o red: el UX ya marcó el voto, no lo revertimos */
      })
      .finally(() => setSending(false))
  }

  return (
    <section
      style={{
        marginTop: 36,
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: 12,
        padding: 20,
        transition: 'all .2s ease',
      }}
    >
      <p
        style={{
          margin: '0 0 14px',
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: '#6B7280',
        }}
      >
        ¿Qué te parece esta propiedad?
      </p>

      <div className="fbcol-row">
        {OPTIONS.map(opt => {
          const isSel = choice === opt.key
          const style: React.CSSProperties = {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '12px 16px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            fontFamily: 'inherit',
            border: '1px solid',
            cursor: voted ? 'default' : 'pointer',
            transition: 'all .2s ease',
            background: opt.bg,
            color: opt.color,
            borderColor: opt.border,
          }
          if (voted && isSel) {
            style.background = opt.solid
            style.color = '#FFFFFF'
            style.borderColor = opt.solid
            style.transform = 'scale(1.02)'
          } else if (voted && !isSel) {
            style.opacity = 0.4
          }
          return (
            <button
              key={opt.key}
              type="button"
              className="fbcol-btn"
              style={style}
              disabled={voted}
              onClick={() => handleVote(opt.key)}
            >
              <span aria-hidden style={{ fontSize: 16, lineHeight: 1 }}>{opt.emoji}</span>
              {opt.label}
            </button>
          )
        })}
      </div>

      {voted && (
        <p style={{ margin: '12px 0 0', fontSize: 13, color: '#6B7280' }}>
          ¡Gracias por tu feedback!
        </p>
      )}

      <style>{`
        .fbcol-row { display: flex; flex-direction: column; gap: 8px; }
        .fbcol-btn { width: 100%; }
        .fbcol-btn:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        @media (min-width: 768px) {
          .fbcol-row { flex-direction: row; gap: 12px; }
          .fbcol-btn { flex: 1; width: auto; }
        }
      `}</style>
    </section>
  )
}
