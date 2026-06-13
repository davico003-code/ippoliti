'use client'

import { useEffect, useRef, useState } from 'react'
import { trackEvent } from '@/lib/analytics'

// Calculadora "Calculá el costo real de tu propiedad" — lógica exacta del
// HTML de referencia aprobado:
//   costoConstruccion = cub * costoM2 + (semi + piscina) * (costoM2 / 2)
//   inversionTotal    = lote + costoConstruccion
//   valorMercado      = inversionTotal * 1.05165
// Inputs con formato es-AR mientras se tipea (solo dígitos).
//
// Compartir: el botón genera un link a la página de resultado
// /recursos/costos-de-construccion/calculo?lote=&cub=&semi=&pileta=&calidad=
// y lo comparte con navigator.share (mobile) o lo copia al portapapeles con
// el patrón ClipboardItem+Promise dentro del tap (mismo fix de Safari iOS
// que share-ficha). La página principal sigue aceptando los params viejos
// (?cub=...) por compatibilidad con links ya enviados.

const CANONICAL = 'https://siinmobiliaria.com/recursos/costos-de-construccion'

const fmtUSD = (n: number) =>
  'USD ' + new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(n)

const fmtInput = (n: number) => new Intl.NumberFormat('es-AR').format(n)

interface Resultados {
  construccion: number
  total: number
  mercado: number
}

export interface CalidadOption {
  value: number
  label: string
  slug: string
}

interface Campo {
  raw: number
  display: string
}

const campoDe = (raw: number): Campo => ({ raw, display: raw > 0 ? fmtInput(raw) : '' })

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
              onChange(Number(digits), fmtInput(Number(digits)))
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
  const [lote, setLote] = useState<Campo>({ raw: 0, display: '' })
  const [cub, setCub] = useState<Campo>({ raw: 0, display: '' })
  const [semi, setSemi] = useState<Campo>({ raw: 0, display: '' })
  const [piscina, setPiscina] = useState<Campo>({ raw: 0, display: '' })
  const [calidad, setCalidad] = useState(calidades[2]?.value ?? calidades[0]?.value ?? 0)
  const [resultados, setResultados] = useState<Resultados | null>(null)
  const [feedbackCompartir, setFeedbackCompartir] = useState<string | null>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const computar = (l: number, c: number, s: number, p: number, costoM2: number): Resultados => {
    const construccion = c * costoM2 + (s + p) * (costoM2 / 2)
    const total = l + construccion
    return { construccion, total, mercado: total * 1.05165 }
  }

  const calcular = () => {
    const res = computar(lote.raw, cub.raw, semi.raw, piscina.raw, calidad)
    setResultados(res)
    trackEvent('recursos_costos_calculo', { calidad, total: Math.round(res.total) })
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }

  // Link compartido: si la URL trae el cálculo, pre-cargar y calcular solo.
  // window.location en useEffect (en vez de useSearchParams) para no exigir
  // un boundary de Suspense en una página estática.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const c = Number(params.get('cub')) || 0
    if (c <= 0) return
    const l = Number(params.get('lote')) || 0
    const s = Number(params.get('semi')) || 0
    const p = Number(params.get('pis')) || 0
    const calParam = Number(params.get('cal')) || 0
    const cal = calidades.some((o) => o.value === calParam)
      ? calParam
      : (calidades[2]?.value ?? calidades[0]?.value ?? 0)

    setLote(campoDe(l))
    setCub(campoDe(c))
    setSemi(campoDe(s))
    setPiscina(campoDe(p))
    setCalidad(cal)
    setResultados(computar(l, c, s, p, cal))
    trackEvent('recursos_costos_calculo_compartido', { calidad: cal })
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 400)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Link a la página de resultado (slug legible de la calidad)
  const slugCalidad = calidades.find((c) => c.value === calidad)?.slug ?? ''
  const urlCalculo = `${CANONICAL}/calculo?lote=${lote.raw}&cub=${cub.raw}&semi=${semi.raw}&pileta=${piscina.raw}&calidad=${slugCalidad}`

  // Copia con ClipboardItem+Promise DENTRO del tap (fix Safari iOS, mismo
  // patrón de lib/share-ficha) + fallback writeText/execCommand.
  const copiarLink = async (url: string): Promise<boolean> => {
    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'text/plain': Promise.resolve(new Blob([url], { type: 'text/plain' })) }),
        ])
        return true
      } catch {
        /* sigue al fallback */
      }
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
        return true
      }
    } catch {
      /* sigue al fallback */
    }
    try {
      const ta = document.createElement('textarea')
      ta.value = url
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(ta)
      return ok
    } catch {
      return false
    }
  }

  const compartir = async () => {
    trackEvent('recursos_costos_compartir_calculo', {})
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: 'Mi proyección de costo de construcción', url: urlCalculo })
        return
      } catch {
        // usuario canceló o el share falló → intentamos copiar
      }
    }
    const ok = await copiarLink(urlCalculo)
    setFeedbackCompartir(ok ? '¡Link copiado!' : 'No se pudo copiar')
    setTimeout(() => setFeedbackCompartir(null), 2500)
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
          help="Ej: si tu piscina es de 10x5, colocá 50 m². Se calcula como semicubierta."
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

          {/* Compartir el cálculo como link a /calculo */}
          <div className="costos-res-cta">
            <div className="costos-res-cta-botones">
              <button type="button" className="costos-res-btn-david" onClick={compartir}>
                {feedbackCompartir ?? 'Compartir este cálculo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
