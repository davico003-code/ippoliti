'use client'

// Slider de valuación: "¿Está bien valuada?". Rango simétrico ±30% alrededor
// del precio publicado, con el thumb centrado en "Justa". El número grande va
// en Poppins tabular. Al bajar del publicado se despliegan chips de objeción.
// AUTO-GUARDA en onChange (debounce) — si la mueve y se va, ya quedó guardado.

import { useEffect, useRef, useState } from 'react'

const POPPINS = "'Poppins', system-ui, sans-serif"
const RALEWAY = "'Raleway', system-ui, sans-serif"
const GREEN = '#1A5C38'
const GOLD = '#B8935A'

const RANGE_PCT = 30 // ±30% alrededor del publicado

const OBJECTIONS = [
  { choice: 'estado', label: 'Estado' },
  { choice: 'ubicacion', label: 'Ubicación' },
  { choice: 'tamano', label: 'Tamaño' },
  { choice: 'metro', label: 'Metro caro' },
  { choice: 'expensas', label: 'Expensas' },
] as const

function roundNice(n: number): number {
  // Redondeo "lindo" para no mostrar números sucios al mover el slider.
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
  /** Notifica el valor actual al padre (para pasarlo al lead de "avisame"). */
  onValuationChange?: (valor: number) => void
}) {
  // pct inicial derivado del valor guardado (si hay), si no 0 ("justa").
  const initialPct =
    initialValor != null && publishedPrice > 0
      ? Math.max(-RANGE_PCT, Math.min(RANGE_PCT, Math.round(((initialValor - publishedPrice) / publishedPrice) * 100)))
      : 0
  const [pct, setPct] = useState(initialPct)
  const [objeciones, setObjeciones] = useState<string[]>(initialObjeciones)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const valor = roundNice(publishedPrice * (1 + pct / 100))

  useEffect(() => {
    onValuationChange?.(valor)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor])

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
    // Si vuelve a "justa" o sube, las objeciones (que son del caso "cara") se limpian.
    const nextObj = next < 0 ? objeciones : []
    if (next >= 0 && objeciones.length > 0) setObjeciones([])
    save(next, nextObj)
  }

  const toggleObjecion = (choice: string) => {
    const next = objeciones.includes(choice)
      ? objeciones.filter((o) => o !== choice)
      : [...objeciones, choice]
    setObjeciones(next)
    save(pct, next)
  }

  const veredicto = pct < 0 ? 'La veo cara' : pct > 0 ? 'Vale más' : 'Me parece justa'
  const veredictoColor = pct < 0 ? '#E2574C' : pct > 0 ? GREEN : GOLD

  return (
    <div>
      <p style={{ fontFamily: RALEWAY, fontWeight: 700, fontSize: 15, color: '#24292B', margin: '0 0 12px' }}>
        ¿Está bien valuada?
      </p>

      <div className="text-center mb-2">
        <span
          style={{
            fontFamily: POPPINS,
            fontWeight: 800,
            fontSize: 30,
            fontVariantNumeric: 'tabular-nums',
            color: '#24292B',
            lineHeight: 1,
          }}
        >
          {currency} {valor.toLocaleString('es-AR')}
        </span>
        <div
          style={{ fontFamily: RALEWAY, fontWeight: 700, fontSize: 13, color: veredictoColor, marginTop: 4 }}
        >
          {veredicto}
        </div>
      </div>

      <input
        type="range"
        min={-RANGE_PCT}
        max={RANGE_PCT}
        step={1}
        value={pct}
        onChange={onSlide}
        aria-label="Ajustar valuación percibida"
        className="w-full"
        style={{ accentColor: GREEN }}
      />
      <div className="flex justify-between" style={{ fontFamily: RALEWAY, fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
        <span>Cara</span>
        <span>Justa</span>
        <span>Vale más</span>
      </div>

      {pct < 0 && (
        <div className="mt-4">
          <p style={{ fontFamily: RALEWAY, fontWeight: 600, fontSize: 13, color: '#6b7280', margin: '0 0 8px' }}>
            ¿Por qué la ves cara?
          </p>
          <div className="flex flex-wrap gap-2">
            {OBJECTIONS.map((o) => {
              const active = objeciones.includes(o.choice)
              return (
                <button
                  key={o.choice}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleObjecion(o.choice)}
                  className="px-3 py-1.5 rounded-full border text-[12px] font-semibold transition-colors"
                  style={{
                    fontFamily: POPPINS,
                    borderColor: active ? GREEN : '#e5e7eb',
                    background: active ? '#e8f5ee' : '#fff',
                    color: active ? GREEN : '#6b7280',
                  }}
                >
                  {o.label}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
