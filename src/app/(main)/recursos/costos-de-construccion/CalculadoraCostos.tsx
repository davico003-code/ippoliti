'use client'

import { useRef, useState } from 'react'
import { trackEvent } from '@/lib/analytics'

// Calculadora "Calculá el costo real de tu propiedad" — réplica exacta de la
// lógica del HTML de referencia aprobado:
//   costoConstruccion = cub * costoM2 + (semi + piscina) * (costoM2 / 2)
//   inversionTotal    = lote + costoConstruccion
//   valorMercado      = inversionTotal * 1.05165
// Inputs con formato es-AR mientras se tipea (solo dígitos).

const fmtUSD = (n: number) =>
  'USD ' + new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(n)

interface Resultados {
  construccion: number
  total: number
  mercado: number
}

export interface CalidadOption {
  value: number
  label: string
}

function CampoNumerico({
  id,
  label,
  placeholder,
  help,
  prefix,
  value,
  onChange,
}: {
  id: string
  label: string
  placeholder: string
  help?: string
  prefix?: string
  value: string
  onChange: (raw: number, display: string) => void
}) {
  return (
    <div className="costos-input-group">
      <label htmlFor={id}>{label}</label>
      <div className="costos-input-wrapper">
        {prefix && <span className="costos-input-prefix">{prefix}</span>}
        <input
          id={id}
          type="text"
          inputMode="numeric"
          placeholder={placeholder}
          className={prefix ? 'costos-has-prefix' : undefined}
          value={value}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, '')
            if (digits === '') {
              onChange(0, '')
            } else {
              onChange(Number(digits), new Intl.NumberFormat('es-AR').format(Number(digits)))
            }
          }}
        />
      </div>
      {help && <div className="costos-help-text">{help}</div>}
    </div>
  )
}

// `calidades`: valores Llave en Mano VIGENTES (base junio 2026 ajustada por
// IPC), calculados server-side en page.tsx desde lib/costos-construccion.
// El default es la tercera opción (Línea Alta), como el HTML de referencia.
export default function CalculadoraCostos({ calidades }: { calidades: CalidadOption[] }) {
  const [lote, setLote] = useState({ raw: 0, display: '' })
  const [cub, setCub] = useState({ raw: 0, display: '' })
  const [semi, setSemi] = useState({ raw: 0, display: '' })
  const [piscina, setPiscina] = useState({ raw: 0, display: '' })
  const [calidad, setCalidad] = useState(calidades[2]?.value ?? calidades[0]?.value ?? 0)
  const [resultados, setResultados] = useState<Resultados | null>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const calcular = () => {
    const construccion = cub.raw * calidad + (semi.raw + piscina.raw) * (calidad / 2)
    const total = lote.raw + construccion
    const mercado = total * 1.05165
    setResultados({ construccion, total, mercado })
    trackEvent('recursos_costos_calculo', { calidad, total: Math.round(total) })
    // Scroll suave al resultado una vez renderizado
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }

  return (
    <div className="costos-estimator">
      <h2 className="costos-block-title costos-block-title-light">
        Calculá el costo real de tu propiedad
      </h2>
      <p className="costos-estimator-sub">
        Completá tus números reales y obtené una proyección financiera al instante.
      </p>

      <div className="costos-form-grid">
        <CampoNumerico
          id="costos-lote"
          label="Valor del Lote (USD)"
          placeholder="0"
          prefix="USD"
          help="Dejar en 0 si no tenés terreno."
          value={lote.display}
          onChange={(raw, display) => setLote({ raw, display })}
        />
        <CampoNumerico
          id="costos-cub"
          label="Sup. Cubierta (m²)"
          placeholder="Ej: 150"
          value={cub.display}
          onChange={(raw, display) => setCub({ raw, display })}
        />
        <CampoNumerico
          id="costos-semi"
          label="Sup. Semicubierta (m²)"
          placeholder="0"
          help="Galerías y cocheras (pérgolas no computan)."
          value={semi.display}
          onChange={(raw, display) => setSemi({ raw, display })}
        />
        <CampoNumerico
          id="costos-piscina"
          label="Tamaño Piscina (m²)"
          placeholder="0"
          help="Se calcula como semicubierta."
          value={piscina.display}
          onChange={(raw, display) => setPiscina({ raw, display })}
        />

        <div className="costos-input-group costos-input-full">
          <label htmlFor="costos-calidad">Calidad Constructiva a cotizar</label>
          <div className="costos-select-wrapper">
            <select
              id="costos-calidad"
              value={calidad}
              onChange={(e) => setCalidad(Number(e.target.value))}
            >
              {calidades.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <button type="button" className="costos-btn-calc" onClick={calcular}>
        Generar Proyección
      </button>

      {resultados && (
        <div ref={resultsRef} className="costos-results">
          <div className="costos-res-line">
            <span>Costo de Construcción (Llave en Mano)</span>
            <strong>{fmtUSD(resultados.construccion)}</strong>
          </div>
          <div className="costos-res-line">
            <span>Inversión Total (Lote + Obra)</span>
            <strong>{fmtUSD(resultados.total)}</strong>
          </div>
          <div className="costos-res-total">
            <span>Valor de Mercado (Prop. Terminada)</span>
            <strong>{fmtUSD(resultados.mercado)}</strong>
          </div>
          <div className="costos-res-disclaimer">
            <strong>Nota de mercado:</strong> Para entender la valuación real de una casa
            terminada, a la inversión total de obra se le suma la ganancia actual del
            constructor (que va de un 15% a un 25%) y los honorarios profesionales por
            intermediación (3%). El cálculo final de la casa en el mercado se estima
            considerando estos valores.
          </div>
        </div>
      )}
    </div>
  )
}
