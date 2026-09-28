'use client'

// C — Slider de valuación, versión compacta. "¿Está bien valuada?" con el
// valor a la derecha y un slider fino debajo. Rango simétrico ±15% alrededor
// del precio publicado, arranca en "Justa". Al bajar del publicado se
// despliegan (animado) las objeciones. AUTO-GUARDA en onChange (debounce).
// Data PRIVADA.

import { useEffect, useRef, useState } from 'react'

const VERDE = '#1A5C38'
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

  let lblText = 'Justo el publicado'
  let lblColor = 'text-gray-400'
  if (pct < 0) {
    lblText = `${Math.abs(pct)}% menos · la ves cara`
    lblColor = 'text-[#C0563E]'
  } else if (pct > 0) {
    lblText = `+${pct}% · la ves barata`
    lblColor = 'text-[#1A5C38]'
  }

  // Relleno del track desde el centro ("Justa") hasta el thumb.
  const thumbPos = ((pct + RANGE_PCT) / (RANGE_PCT * 2)) * 100
  const fillColor = pct < 0 ? ROJO : VERDE
  const lo = Math.min(50, thumbPos)
  const hi = Math.max(50, thumbPos)
  const track = `linear-gradient(90deg, #E5E7EB ${lo}%, ${fillColor} ${lo}%, ${fillColor} ${hi}%, #E5E7EB ${hi}%)`

  return (
    <div className="py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-[#24292B]">¿Está bien valuada?</p>
          <p className="mt-0.5 text-[11.5px] text-gray-400">Movela hasta lo que pagarías</p>
        </div>
        <div className="text-right">
          <p className="font-numeric text-[14px] font-semibold tabular-nums text-[#24292B]">
            {currency} {valor.toLocaleString('es-AR')}
          </p>
          <p className={`mt-0.5 text-[11px] ${lblColor}`}>{lblText}</p>
        </div>
      </div>

      <div className="mt-3">
        <input
          type="range"
          className="si-valuation-slider"
          min={-RANGE_PCT}
          max={RANGE_PCT}
          step={1}
          value={pct}
          onChange={onSlide}
          aria-label="Ajustar valuación percibida"
          aria-valuetext={`${currency} ${valor.toLocaleString('es-AR')}`}
          style={{ background: track }}
        />
        <div className="mt-1 flex justify-between text-[10px] text-gray-400">
          <span>La veo cara</span>
          <span>Justa</span>
          <span>Vale más</span>
        </div>
      </div>

      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: showObjection ? 160 : 0, opacity: showObjection ? 1 : 0 }}
      >
        <p className="mt-3 text-[12px] text-gray-500">¿Qué te frena del precio?</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {OBJECTIONS.map((o) => {
            const active = objeciones.includes(o.choice)
            return (
              <button
                key={o.choice}
                type="button"
                aria-pressed={active}
                tabIndex={showObjection ? 0 : -1}
                onClick={() => toggleObjecion(o.choice)}
                className={`rounded-full border px-2.5 py-1 text-[11.5px] leading-none transition-colors ${
                  active
                    ? 'border-[#1A5C38] bg-[#1A5C38] font-medium text-white'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {o.label}
              </button>
            )
          })}
        </div>
        {objeciones.length > 0 && (
          <p className="mt-2 text-[11.5px] text-[#1A5C38]">✓ Gracias, nos ayuda a ajustar con el dueño.</p>
        )}
      </div>

      <style jsx>{`
        .si-valuation-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 3px;
          border-radius: 3px;
          outline: none;
          cursor: pointer;
        }
        .si-valuation-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid ${fillColor};
          cursor: grab;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
          transition: transform 0.15s;
        }
        .si-valuation-slider::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.12);
        }
        .si-valuation-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid ${fillColor};
          cursor: grab;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
        }
        .si-valuation-slider:focus-visible::-webkit-slider-thumb {
          box-shadow: 0 0 0 4px rgba(26, 92, 56, 0.2);
        }
      `}</style>
    </div>
  )
}
