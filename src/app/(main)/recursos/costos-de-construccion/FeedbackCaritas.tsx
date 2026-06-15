'use client'

import { useEffect, useState } from 'react'

// Widget de feedback con tres caritas al pie del resultado de la calculadora.
// Un voto por visitante (localStorage); tocar otra carita CAMBIA el voto
// (el POST manda votoAnterior para que el backend haga DECR/INCR). El POST
// es fire-and-forget: si falla, el usuario igual ve su carita marcada.

type Voto = 'up' | 'mid' | 'down'

const LS_KEY = 'feedback-costos-voto'
const VOTOS: Voto[] = ['up', 'mid', 'down']

const CARITAS: { voto: Voto; emoji: string; label: string }[] = [
  { voto: 'up', emoji: '😄', label: 'Me sirvió' },
  { voto: 'mid', emoji: '😐', label: 'Más o menos' },
  { voto: 'down', emoji: '😞', label: 'No me sirvió' },
]

export default function FeedbackCaritas() {
  const [voto, setVoto] = useState<Voto | null>(null)

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(LS_KEY)
      if (guardado && VOTOS.includes(guardado as Voto)) setVoto(guardado as Voto)
    } catch {
      /* localStorage bloqueado: el widget funciona igual, sin persistencia */
    }
  }, [])

  const votar = (nuevo: Voto) => {
    if (nuevo === voto) return
    const anterior = voto
    setVoto(nuevo)
    try {
      localStorage.setItem(LS_KEY, nuevo)
    } catch {
      /* sin persistencia */
    }
    fetch('/api/feedback/costos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voto: nuevo, ...(anterior ? { votoAnterior: anterior } : {}) }),
    }).catch(() => {
      /* fire-and-forget */
    })
  }

  return (
    <div className="costos-feedback">
      <p className="costos-feedback-q">¿Qué te pareció esta proyección?</p>
      <div className="costos-feedback-botones">
        {CARITAS.map((c) => (
          <button
            key={c.voto}
            type="button"
            aria-label={c.label}
            aria-pressed={voto === c.voto}
            className={`costos-feedback-btn${
              voto === c.voto ? ' costos-feedback-votado' : voto ? ' costos-feedback-atenuada' : ''
            }`}
            onClick={() => votar(c.voto)}
          >
            {c.emoji}
          </button>
        ))}
      </div>
      {voto && <p className="costos-feedback-gracias">¡Gracias por tu opinión!</p>}
    </div>
  )
}
