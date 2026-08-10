'use client'

// Multiple choice de cierre de cápsula. El agente responde cada pregunta y
// recibe corrección inmediata: si razona bien se le valida el porqué; si
// falla, se le muestra el recordatorio (lo que le tiene que quedar de la
// cápsula) junto con la opción correcta. Completar el quiz habilita el
// "Marcar como leída" en CapsulaCard.

import { useMemo, useState } from 'react'

import type { QuizPregunta } from '@/lib/si-school/types'

interface Props {
  preguntas: QuizPregunta[]
  /** Se llama una única vez cuando todas las preguntas quedaron respondidas. */
  onComplete?: (correctas: number, total: number) => void
}

const VERDE = '#1A5C38'
const VERDE_OSCURO = '#123F26'
const VERDE_CLARO = '#E8F0EA'
const ROJO = '#B32230'
const ROJO_CLARO = '#FBEBE6'
const GOLD = '#C7902F'
const GOLD_CLARO = '#FDF3D7'
const BORDE = '#E4E4E7'

export default function QuizCapsula({ preguntas, onComplete }: Props) {
  // answers[i] = índice elegido, o null si aún no respondió.
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    preguntas.map(() => null),
  )

  const respondidas = useMemo(() => answers.filter((a) => a !== null).length, [answers])
  const correctas = useMemo(
    () => answers.filter((a, i) => a === preguntas[i].correcta).length,
    [answers, preguntas],
  )
  const terminado = respondidas === preguntas.length

  const responder = (qi: number, oi: number) => {
    if (answers[qi] !== null) return
    setAnswers((prev) => {
      const next = [...prev]
      next[qi] = oi
      const done = next.every((a) => a !== null)
      if (done && onComplete) {
        const oks = next.filter((a, i) => a === preguntas[i].correcta).length
        onComplete(oks, preguntas.length)
      }
      return next
    })
  }

  return (
    <div style={{ marginTop: 22 }}>
      <p
        style={{
          fontFamily: "'Raleway', system-ui, sans-serif",
          fontWeight: 800,
          fontSize: 11,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: GOLD,
          margin: '0 0 4px',
        }}
      >
        Antes de marcarla como leída
      </p>
      <p style={{ fontSize: 14, color: '#5A5A55', margin: '0 0 16px' }}>
        {preguntas.length === 1
          ? 'Una pregunta para chequear que te llevás lo importante.'
          : `${preguntas.length} preguntas para chequear que te llevás lo importante.`}
      </p>

      {preguntas.map((p, qi) => {
        const elegido = answers[qi]
        const contestada = elegido !== null
        const acerto = elegido === p.correcta
        return (
          <div
            key={qi}
            style={{
              background: '#FAFAF8',
              border: `1px solid ${BORDE}`,
              borderRadius: 10,
              padding: '16px 18px',
              marginBottom: 12,
            }}
          >
            <p style={{ fontWeight: 600, fontSize: 14.5, margin: '0 0 12px', lineHeight: 1.5 }}>
              {p.pregunta}
            </p>
            {p.opciones.map((op, oi) => {
              const esCorrecta = oi === p.correcta
              const esElegida = oi === elegido
              let borde = BORDE
              let fondo = '#fff'
              let peso: number | undefined
              if (contestada && esCorrecta) {
                borde = VERDE
                fondo = VERDE_CLARO
                peso = 500
              } else if (contestada && esElegida && !esCorrecta) {
                borde = ROJO
                fondo = ROJO_CLARO
              }
              return (
                <button
                  key={oi}
                  type="button"
                  onClick={() => responder(qi, oi)}
                  disabled={contestada}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    background: fondo,
                    border: `1.5px solid ${borde}`,
                    borderRadius: 8,
                    padding: '10px 13px',
                    marginBottom: 7,
                    fontFamily: 'inherit',
                    fontSize: 13.5,
                    fontWeight: peso,
                    lineHeight: 1.5,
                    color: '#1C1C1C',
                    cursor: contestada ? 'default' : 'pointer',
                    opacity: contestada && !esCorrecta && !esElegida ? 0.55 : 1,
                    transition: 'border-color .15s, background .15s',
                  }}
                >
                  {contestada && esCorrecta && (
                    <span style={{ color: VERDE, fontWeight: 600, marginRight: 6 }}>✓</span>
                  )}
                  {contestada && esElegida && !esCorrecta && (
                    <span style={{ color: ROJO, fontWeight: 600, marginRight: 6 }}>✗</span>
                  )}
                  {op}
                </button>
              )
            })}

            {contestada && acerto && (
              <div
                style={{
                  background: VERDE_CLARO,
                  borderLeft: `4px solid ${VERDE}`,
                  borderRadius: '0 6px 6px 0',
                  padding: '10px 14px',
                  fontSize: 13.5,
                  color: '#274D38',
                  lineHeight: 1.55,
                  marginTop: 4,
                }}
              >
                <strong style={{ fontWeight: 600 }}>Bien razonado.</strong> {p.porQue}
              </div>
            )}
            {contestada && !acerto && (
              <div
                style={{
                  background: GOLD_CLARO,
                  borderLeft: `4px solid ${GOLD}`,
                  borderRadius: '0 6px 6px 0',
                  padding: '10px 14px',
                  fontSize: 13.5,
                  color: '#5C4409',
                  lineHeight: 1.55,
                  marginTop: 4,
                }}
              >
                <strong
                  style={{
                    display: 'block',
                    fontFamily: "'Raleway', system-ui, sans-serif",
                    fontWeight: 800,
                    fontSize: 10.5,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    marginBottom: 4,
                  }}
                >
                  Lo que te tiene que quedar
                </strong>
                {p.recordatorio}
              </div>
            )}
          </div>
        )
      })}

      {terminado && (
        <div
          style={{
            background: correctas === preguntas.length ? VERDE_OSCURO : GOLD_CLARO,
            color: correctas === preguntas.length ? '#fff' : '#5C4409',
            borderRadius: 10,
            padding: '14px 18px',
            fontSize: 13.5,
            lineHeight: 1.55,
          }}
        >
          <strong style={{ fontWeight: 600 }}>
            {correctas} de {preguntas.length} bien.
          </strong>{' '}
          {correctas === preguntas.length
            ? 'Cápsula dominada — marcala como leída y seguí.'
            : 'Releé los recordatorios de arriba antes de seguir: eso es lo que se aplica en la calle.'}
        </div>
      )}
    </div>
  )
}
