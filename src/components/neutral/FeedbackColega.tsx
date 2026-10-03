'use client'

// Feedback anónimo para la ficha white-label (verficha.casa).
// 3 opciones (me gusta / podría ser / no es lo que busca). No pide ni envía
// ningún dato del colega. Un voto por sesión (localStorage por slug) + el
// backend tiene anti-spam por IP y fingerprint.
//   • useVotoColega: estado + envío (lo comparten la tarjeta de la compu y la
//     barra del celu).
//   • VotoColega: los 3 botones. En fila (tarjeta) o apilados (hoja del celu).
//
// Tipografía: usa la fuente del contexto neutral (Inter vía inherit), NO
// Poppins, para no introducir un tell de branding SI en la ficha neutra.

import { useEffect, useState } from 'react'

export type Voto = 'gusta' | 'podria' | 'no_gusta'

export const OPCIONES_VOTO: {
  key: Voto
  emoji: string
  label: string
  corto: string
  solid: string
}[] = [
  { key: 'gusta', emoji: '👍', label: 'Me gusta', corto: 'Me gusta', solid: '#047857' },
  { key: 'podria', emoji: '🤔', label: 'Podría ser', corto: 'Podría ser', solid: '#92400E' },
  { key: 'no_gusta', emoji: '👎', label: 'No es lo que busca', corto: 'No es', solid: '#991B1B' },
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

export function useVotoColega(slug: string) {
  const [choice, setChoice] = useState<Voto | null>(null)
  const [sending, setSending] = useState(false)

  // Al mount: si ya votó en esta sesión para este slug, mostrar estado votado.
  // El evento sincroniza la tarjeta y la barra si conviven en la página.
  useEffect(() => {
    const leer = () => {
      try {
        const prev = localStorage.getItem(`feedback_${slug}`)
        if (prev === 'gusta' || prev === 'podria' || prev === 'no_gusta') setChoice(prev)
      } catch {
        /* localStorage no disponible: queda en estado normal */
      }
    }
    leer()
    window.addEventListener('vf-voto', leer)
    return () => window.removeEventListener('vf-voto', leer)
  }, [slug])

  const votar = (c: Voto) => {
    if (choice !== null || sending) return
    setSending(true)
    setChoice(c) // optimista: el feedback se considera registrado al click
    try {
      localStorage.setItem(`feedback_${slug}`, c)
      window.dispatchEvent(new Event('vf-voto'))
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

  return { choice, votar }
}

export function VotoColega({
  slug,
  apilado = false,
  onVoto,
}: {
  slug: string
  apilado?: boolean
  onVoto?: () => void
}) {
  const { choice, votar } = useVotoColega(slug)
  const voted = choice !== null

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: apilado ? 'column' : 'row', gap: 8 }}>
        {OPCIONES_VOTO.map(opt => {
          const isSel = choice === opt.key
          return (
            <button
              key={opt.key}
              type="button"
              disabled={voted}
              aria-pressed={isSel}
              onClick={() => {
                votar(opt.key)
                onVoto?.()
              }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                height: apilado ? 48 : 44,
                padding: '0 8px',
                borderRadius: 12,
                border: `1px solid ${isSel ? opt.solid : '#ECECEC'}`,
                background: isSel ? opt.solid : '#fff',
                color: isSel ? '#fff' : '#3A3A3A',
                opacity: voted && !isSel ? 0.4 : 1,
                fontSize: apilado ? 15 : 13,
                fontWeight: 500,
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
                cursor: voted ? 'default' : 'pointer',
                transition: 'background .15s ease, opacity .15s ease',
              }}
            >
              <span aria-hidden style={{ fontSize: apilado ? 17 : 14, lineHeight: 1 }}>{opt.emoji}</span>
              {apilado ? opt.label : opt.corto}
            </button>
          )
        })}
      </div>
      {voted && <p style={{ margin: '10px 0 0', fontSize: 13, color: '#6B6B6B' }}>¡Gracias por tu opinión!</p>}
    </div>
  )
}
