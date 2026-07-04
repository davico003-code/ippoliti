'use client'

// C — Slider de valuación "la joya" (diseño v4 FINAL). "¿Está bien valuada?".
// Rango simétrico ±15% alrededor del precio publicado, thumb en "Justa". Número
// grande verde en Poppins tabular. Al bajar del publicado se despliega (animado)
// el bloque de objeciones. AUTO-GUARDA en onChange (debounce). Data PRIVADA.
//
// Specs (_referencias/feedback/feedback-SI-v4-final.html, sección C):
//   barra dorada · h3 centrado · sub · readout verde 30px + label dinámico con %
//   track gradiente salmón→verde · thumb 30px blanco borde verde · pub-mark
//   objeción dashed con chips (relleno verde activo) + "✓ ¡Gracias!…"

import { useEffect, useRef, useState } from 'react'

const POPPINS = "'Poppins', system-ui, sans-serif"
const RALEWAY = "'Raleway', system-ui, sans-serif"
const VERDE = '#1A5C38'
const VERDE_OSCURO = '#0F3F26'
const DORADO = '#B8935A'
const LINEA = '#E9E3DA'
const GRIS = '#7C8488'
const CARBON = '#24292B'
const ROJO = '#C0563E'

const RANGE_PCT = 15 // ±15% alrededor del publicado

const OBJECTIONS = [
  { choice: 'estado', label: 'Estado / refacción' },
  { choice: 'ubicacion', label: 'Ubicación' },
  { choice: 'tamano', label: 'Tamaño' },
  { choice: 'metro', label: 'El metro está caro' },
  { choice: 'expensas', label: 'Expensas' },
] as const

function roundNice(n: number): number {
  if (n >= 100000) return Math.round(n / 1000) * 1000
  if (n >= 10000) return Math.round(n / 100) * 100
  return Math.round(n / 10) * 10
}

export default function ValuationSlider({
  propertyId,
  publishedPrice,
  currency,
  initialValor = null,
  initialObjeciones = [],
  onValuationChange,
}: {
  propertyId: number
  publishedPrice: number
  currency: string
  initialValor?: number | null
  initialObjeciones?: string[]
  onValuationChange?: (valor: number) => void
}) {
  const initialPct =
    initialValor != null && publishedPrice > 0
      ? Math.max(-RANGE_PCT, Math.min(RANGE_PCT, Math.round(((initialValor - publishedPrice) / publishedPrice) * 100)))
      : 0
  const [pct, setPct] = useState(initialPct)
  const [objeciones, setObjeciones] = useState<string[]>(initialObjeciones)
  const [showThanks, setShowThanks] = useState(initialObjeciones.length > 0)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const valor = roundNice(publishedPrice * (1 + pct / 100))
  const showObjection = pct < 0

  useEffect(() => {
    onValuationChange?.(valor)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor])

  // Cleanup del debounce: si se desmonta dentro de los 450 ms, no dejar un
  // setTimeout pendiente disparando fetch sobre un componente ya ido.
  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current) }, [])

  const save = (nextPct: number, nextObj: string[]) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      fetch('/api/feedback/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          valor: roundNice(publishedPrice * (1 + nextPct / 100)),
          objeciones: nextObj,
        }),
        credentials: 'same-origin',
      }).catch(() => {
        /* fire-and-forget */
      })
    }, 450)
  }

  const onSlide = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number(e.target.value)
    setPct(next)
    const nextObj = next < 0 ? objeciones : []
    if (next >= 0 && objeciones.length > 0) {
      setObjeciones([])
      setShowThanks(false)
    }
    save(next, nextObj)
  }

  const toggleObjecion = (choice: string) => {
    const next = objeciones.includes(choice)
      ? objeciones.filter((o) => o !== choice)
      : [...objeciones, choice]
    setObjeciones(next)
    if (next.length > 0) setShowThanks(true)
    save(pct, next)
  }

  // Label dinámico del readout
  let lblText = 'Justo el precio publicado'
  let lblColor: string = VERDE
  if (pct < 0) {
    lblText = `${Math.abs(pct)}% por debajo · la ves cara`
    lblColor = ROJO
  } else if (pct > 0) {
    lblText = `+${pct}% · la ves barata`
    lblColor = DORADO
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
      <div style={{ height: 3, width: 46, background: DORADO, borderRadius: 2, margin: '0 auto 16px' }} />
      <h3 style={{ fontFamily: RALEWAY, textAlign: 'center', fontSize: 16, fontWeight: 700, color: VERDE_OSCURO }}>
        ¿Está bien valuada?
      </h3>
      <p style={{ textAlign: 'center', fontSize: 12, color: GRIS, marginTop: 4, marginBottom: 22 }}>
        Movela hasta lo que vos pagarías
      </p>

      <div style={{ textAlign: 'center', marginBottom: 6 }}>
        <div
          style={{
            fontFamily: POPPINS,
            fontWeight: 700,
            fontSize: 30,
            fontVariantNumeric: 'tabular-nums',
            color: VERDE,
          }}
        >
          {currency} {valor.toLocaleString('es-AR')}
        </div>
        <div style={{ fontSize: 12, fontWeight: 500, marginTop: 2, minHeight: 18, color: lblColor }}>
          {lblText}
        </div>
      </div>

      <div style={{ padding: '10px 6px 0' }}>
        <input
          type="range"
          className="si-valuation-slider"
          min={-RANGE_PCT}
          max={RANGE_PCT}
          step={1}
          value={pct}
          onChange={onSlide}
          aria-label="Ajustar valuación percibida"
        />
        <div className="flex justify-between" style={{ fontSize: 10.5, color: GRIS, marginTop: 10 }}>
          <span>− La veo cara</span>
          <span>Justa</span>
          <span>Vale más +</span>
        </div>
        <div style={{ textAlign: 'center', fontSize: 11, color: GRIS, marginTop: 14 }}>
          Precio publicado:{' '}
          <b style={{ color: CARBON, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            {currency} {publishedPrice.toLocaleString('es-AR')}
          </b>
        </div>
      </div>

      <div
        style={{
          marginTop: showObjection ? 22 : 0,
          paddingTop: showObjection ? 18 : 0,
          borderTop: showObjection ? `1px dashed ${LINEA}` : 'none',
          opacity: showObjection ? 1 : 0,
          maxHeight: showObjection ? 260 : 0,
          overflow: 'hidden',
          transition: 'opacity 0.4s, max-height 0.4s',
        }}
      >
        <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 500, marginBottom: 13 }}>
          ¿Qué te frena del precio?
        </p>
        <div className="flex flex-wrap justify-center" style={{ gap: 9 }}>
          {OBJECTIONS.map((o) => {
            const active = objeciones.includes(o.choice)
            return (
              <button
                key={o.choice}
                type="button"
                aria-pressed={active}
                onClick={() => toggleObjecion(o.choice)}
                className="cursor-pointer"
                style={{
                  border: `1.5px solid ${active ? VERDE : LINEA}`,
                  background: active ? VERDE : '#fff',
                  color: active ? '#fff' : CARBON,
                  fontWeight: active ? 500 : 400,
                  borderRadius: 22,
                  padding: '8px 16px',
                  fontSize: 12.5,
                  transition: '0.15s',
                }}
              >
                {o.label}
              </button>
            )
          })}
        </div>
        <div
          style={{
            textAlign: 'center',
            fontSize: 12.5,
            color: VERDE,
            marginTop: 16,
            opacity: showThanks ? 1 : 0,
            height: showThanks ? 'auto' : 0,
            transition: 'opacity 0.3s',
          }}
        >
          ✓ ¡Gracias! Nos ayuda a ajustar con el dueño.
        </div>
      </div>

      <style jsx>{`
        .si-valuation-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 6px;
          background: linear-gradient(90deg, #e8c7b8, #cfe3d6, #bfe0cc);
          outline: none;
        }
        .si-valuation-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #fff;
          border: 4px solid ${VERDE};
          cursor: grab;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
        }
        .si-valuation-slider::-webkit-slider-thumb:active {
          cursor: grabbing;
        }
        .si-valuation-slider::-moz-range-thumb {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #fff;
          border: 4px solid ${VERDE};
          cursor: grab;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  )
}
