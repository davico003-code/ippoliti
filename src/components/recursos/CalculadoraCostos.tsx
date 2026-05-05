'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Download } from 'lucide-react'
import { events } from '@/lib/analytics'
import {
  calcularCostosIngreso,
  VERIFICACION_ARS,
  type Moneda,
  type TipoFiscal as Tipo,
} from '@/lib/calculadora-alquiler'
import DepositoCard from './shared/DepositoCard'
import DisclaimerInfo from './shared/DisclaimerInfo'
import CtaWhatsapp from './shared/CtaWhatsapp'

type Frecuencia = 'trimestral' | 'cuatrimestral'
type Indice = 'ICL' | 'IPC'

// ── Formatos ─────────────────────────────────────────────────────────────
const fmtArs = (n: number) =>
  `$ ${Math.round(n).toLocaleString('es-AR')}`

const fmtUsd = (n: number) =>
  `US$ ${n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const fmt = (n: number, m: Moneda) => (m === 'USD' ? fmtUsd(n) : fmtArs(n))

const todayStr = () => {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}-${mm}-${d.getFullYear()}`
}

// ── Sub-componentes locales ──────────────────────────────────────────────
function Toggle<T extends string>({
  options,
  value,
  onChange,
  cols = 2,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  cols?: 2 | 3
}) {
  return (
    <div
      role="group"
      className="grid gap-1.5 p-1 rounded-lg"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        background: '#FAFAF7',
        border: '1px solid var(--line)',
      }}
    >
      {options.map(opt => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className="px-3 py-2.5 rounded-md text-sm font-semibold transition-all font-raleway"
            style={{
              background: active ? 'var(--si-green)' : 'transparent',
              color: active ? '#fff' : 'var(--tinta-soft)',
              boxShadow: active ? '0 1px 4px rgba(26, 92, 56, 0.25)' : 'none',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[12px] font-semibold uppercase tracking-[0.5px] mb-2"
      style={{ color: 'var(--tinta-mute)' }}
    >
      {children}
    </label>
  )
}

function NumInput({
  id,
  value,
  onChange,
  prefix,
  suffix,
  min,
  step = 1,
}: {
  id: string
  value: number
  onChange: (n: number) => void
  prefix?: string
  suffix?: string
  min?: number
  step?: number
}) {
  return (
    <div
      className="flex items-center rounded-lg transition-all focus-within:bg-white"
      style={{
        background: '#FAFAF7',
        border: '1px solid var(--line)',
      }}
    >
      {prefix && (
        <span
          className="pl-3.5 font-poppins font-semibold text-[17px]"
          style={{ color: 'var(--tinta-mute)' }}
        >
          {prefix}
        </span>
      )}
      <input
        id={id}
        type="number"
        inputMode="decimal"
        value={Number.isFinite(value) ? value : 0}
        min={min}
        step={step}
        onChange={e => {
          const v = parseFloat(e.target.value)
          onChange(Number.isNaN(v) ? 0 : v)
        }}
        className="flex-1 bg-transparent border-0 outline-none w-full px-2 py-3 font-poppins font-semibold text-[17px] tabular-nums"
        style={{ color: 'var(--tinta)' }}
      />
      {suffix && (
        <span
          className="pr-3.5 font-poppins font-semibold text-[15px]"
          style={{ color: 'var(--tinta-mute)' }}
        >
          {suffix}
        </span>
      )}
    </div>
  )
}

function Flash({ value, children }: { value: string | number; children: React.ReactNode }) {
  return (
    <span key={String(value)} className="recursos-flash">
      {children}
    </span>
  )
}

// ── Componente principal ─────────────────────────────────────────────────
export default function CalculadoraCostos() {
  const searchParams = useSearchParams()

  const [moneda, setMoneda] = useState<Moneda>('ARS')
  const [tipo, setTipo] = useState<Tipo>('vivienda')
  const [frecuencia, setFrecuencia] = useState<Frecuencia>('cuatrimestral')
  const [indice, setIndice] = useState<Indice>('ICL')
  const [alquiler, setAlquiler] = useState<number>(450_000)
  const [meses, setMeses] = useState<number>(24)
  const [cotizacion, setCotizacion] = useState<number>(1430)
  const [advancedOpen, setAdvancedOpen] = useState<boolean>(false)
  const [isCapturing, setIsCapturing] = useState<boolean>(false)

  const captureRef = useRef<HTMLDivElement>(null)

  // Prefill desde query params (ej. cuando el usuario llega desde la card
  // de la ficha de propiedad). Solo se aplica al mount; cambios posteriores
  // del usuario no se sobrescriben.
  useEffect(() => {
    const qMoneda = searchParams?.get('moneda')
    const qTipo = searchParams?.get('tipo')
    const qAlquiler = searchParams?.get('alquiler')
    const qMeses = searchParams?.get('meses')

    if (qMoneda === 'ARS' || qMoneda === 'USD') setMoneda(qMoneda)
    if (qTipo === 'vivienda' || qTipo === 'comercio') {
      setTipo(qTipo)
      // Reflejar la lógica de handleTipo: frecuencia + índice automáticos
      if (qTipo === 'vivienda') {
        setFrecuencia('cuatrimestral')
        setIndice('ICL')
      } else {
        setFrecuencia('trimestral')
        setIndice('IPC')
      }
    }
    const a = qAlquiler ? parseFloat(qAlquiler) : NaN
    if (Number.isFinite(a) && a > 0) setAlquiler(a)
    const m = qMeses ? parseInt(qMeses, 10) : NaN
    if (Number.isFinite(m) && m > 0) setMeses(m)
    // Prefill intencionalmente solo-mount; no sobrescribir cambios manuales.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Track view + cotización oficial
  useEffect(() => {
    events.calculadoraCostosView()
    fetch('https://dolarapi.com/v1/dolares/oficial')
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        const venta = d?.venta
        if (typeof venta === 'number' && venta > 0) setCotizacion(venta)
      })
      .catch(() => {})
  }, [])

  // Auto-select frecuencia + índice al cambiar tipo
  const handleTipo = (t: Tipo) => {
    setTipo(t)
    if (t === 'vivienda') {
      setFrecuencia('cuatrimestral')
      setIndice('ICL')
    } else {
      setFrecuencia('trimestral')
      setIndice('IPC')
    }
  }

  // Defaults razonables al cambiar moneda
  const handleMoneda = (m: Moneda) => {
    if (m === moneda) return
    setMoneda(m)
    if (m === 'USD') {
      setAlquiler(800)
      setMeses(36)
    } else {
      setAlquiler(450_000)
      setMeses(24)
    }
  }

  // ── Cálculo principal ──────────────────────────────────────────────────
  const c = useMemo(
    () => calcularCostosIngreso({ alquiler, meses, moneda, tipo, cotizacion }),
    [alquiler, meses, moneda, tipo, cotizacion],
  )

  // Total al ingresar — separado por moneda
  // USD: alquiler + honoCuota + admin (USD)  ·  sellado + verificacion (ARS)
  // ARS: alquiler + honoCuota + sellado + verificacion + admin (ARS)
  const totalUsd = moneda === 'USD' ? c.totalSubMonedaContrato : 0
  const totalArs = moneda === 'USD' ? c.totalSubARS : c.totalSubMonedaContrato

  // Timeline — Mes 1 = ingreso completo. Mes 2 y 3 = alquiler + honoCuota + admin. Mes 4+ = alquiler + admin.
  const mes1Usd = totalUsd
  const mes1Ars = totalArs
  const mes23Usd = moneda === 'USD' ? alquiler + c.honoCuota + c.admin : 0
  const mes23Ars = moneda === 'USD' ? 0 : alquiler + c.honoCuota + c.admin
  const mes4Usd = moneda === 'USD' ? alquiler + c.admin : 0
  const mes4Ars = moneda === 'USD' ? 0 : alquiler + c.admin

  // ── Descarga PNG ───────────────────────────────────────────────────────
  const handleDescargar = async () => {
    if (!captureRef.current) return
    setIsCapturing(true)
    events.calculadoraCostosDescargar()
    // Esperar 2 frames para que el DOM termine de actualizar (oculta botones/CTA)
    await new Promise<void>(r =>
      requestAnimationFrame(() => requestAnimationFrame(() => r())),
    )
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(captureRef.current, {
        scale: 2,
        backgroundColor: '#FAFAF7',
        useCORS: true,
        logging: false,
      })
      const link = document.createElement('a')
      link.download = `costos-alquiler-SI-${todayStr()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (e) {
      console.error('Error al generar PNG', e)
    } finally {
      setIsCapturing(false)
    }
  }

  // ── Helpers de render ──────────────────────────────────────────────────
  const monedaLabel = moneda === 'USD' ? 'en dólares' : 'en pesos'
  const tipoLabel = tipo === 'vivienda' ? 'Vivienda' : 'Comercio'
  const ajusteSubtitulo =
    moneda === 'USD'
      ? 'Consultar ajuste anual. Los contratos en dólares tienen un solo ajuste al año.'
      : `Ajuste ${frecuencia} por ${indice}`
  const selladoSmall =
    tipo === 'vivienda' ? 'exento (vivienda · Santa Fe)' : '1,2% del total contrato'

  // Total compuesto component
  function TotalAmount() {
    if (moneda === 'USD') {
      return (
        <>
          <Flash value={`usd-${totalUsd.toFixed(2)}`}>
            <div className="font-poppins font-bold text-[clamp(28px,7vw,40px)] leading-[1.05] tracking-tight tabular-nums">
              {fmtUsd(totalUsd)}
            </div>
          </Flash>
          <Flash value={`ars-${Math.round(totalArs)}`}>
            <div
              className="font-poppins font-semibold text-[clamp(18px,4vw,24px)] leading-[1.1] tabular-nums mt-1"
              style={{ color: 'rgba(255,255,255,0.85)' }}
            >
              + {fmtArs(totalArs)} en pesos
            </div>
          </Flash>
        </>
      )
    }
    return (
      <Flash value={`ars-${Math.round(totalArs)}`}>
        <div className="font-poppins font-bold text-[clamp(34px,8vw,46px)] leading-none tracking-tight tabular-nums">
          {fmtArs(totalArs)}
        </div>
      </Flash>
    )
  }

  // Mes valor compuesto (USD muestra dos líneas si hay mezcla; sino una)
  function MesValor({ usd, ars }: { usd: number; ars: number }) {
    if (moneda === 'USD') {
      return (
        <div className="text-right">
          {usd > 0 && (
            <Flash value={`u-${usd.toFixed(2)}`}>
              <div className="font-poppins font-semibold text-[15px] tabular-nums" style={{ color: 'var(--tinta)' }}>
                {fmtUsd(usd)}
              </div>
            </Flash>
          )}
          {ars > 0 && (
            <Flash value={`a-${Math.round(ars)}`}>
              <div className="font-poppins font-medium text-[13px] tabular-nums" style={{ color: 'var(--tinta-mute)' }}>
                + {fmtArs(ars)} en pesos
              </div>
            </Flash>
          )}
        </div>
      )
    }
    return (
      <Flash value={`a-${Math.round(ars)}`}>
        <div className="font-poppins font-semibold text-[15px] tabular-nums" style={{ color: 'var(--tinta)' }}>
          {fmtArs(ars)}
        </div>
      </Flash>
    )
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: '#FAFAF7' }}
    >
      <style>{`
        @keyframes recursosFlash {
          0% { color: var(--si-green-soft); }
          100% { color: inherit; }
        }
        .recursos-flash > * { animation: recursosFlash 0.45s ease-out; }
        .recursos-card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .recursos-card-hover:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(20, 30, 25, 0.08); }
        .recursos-faq summary::-webkit-details-marker { display: none; }
        .recursos-faq summary { list-style: none; }
        .recursos-faq details > summary { cursor: pointer; }
      `}</style>

      <div className="max-w-[860px] mx-auto px-5 pt-8 pb-20 font-raleway" style={{ color: 'var(--tinta)' }}>

        {/* ── HERO ── */}
        <header className="mb-7">
          <div className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[1.4px] mb-3"
               style={{ color: 'var(--si-green)' }}>
            <span
              aria-hidden
              className="w-2 h-2 rounded-full animate-pulse-slow"
              style={{ background: 'var(--si-green-soft)' }}
            />
            Calculadora · Alquiler permanente
          </div>
          <h1 className="font-black text-[clamp(28px,6vw,40px)] leading-[1.05] tracking-tight m-0 mb-2"
              style={{ color: 'var(--tinta)' }}>
            ¿Cuánto necesito para alquilar?
          </h1>
          <p className="text-[15px] max-w-[580px] m-0" style={{ color: 'var(--tinta-soft)' }}>
            Calculá en segundos cuánto necesitás para ingresar a una propiedad.
            Ajustá moneda, tipo de inmueble y monto del alquiler.
          </p>
        </header>

        {/* ── CONFIG CARD ── */}
        <section
          className="rounded-2xl p-6 mb-4 shadow-sm"
          style={{ background: '#FFFFFF', border: '1px solid var(--line)' }}
        >
          <div className="mb-4">
            <Label>Moneda</Label>
            <Toggle<Moneda>
              cols={2}
              value={moneda}
              onChange={handleMoneda}
              options={[
                { value: 'ARS', label: 'Pesos (ARS)' },
                { value: 'USD', label: 'Dólares (USD)' },
              ]}
            />
          </div>

          <div className="mb-4">
            <Label>Tipo de inmueble</Label>
            <Toggle<Tipo>
              cols={2}
              value={tipo}
              onChange={handleTipo}
              options={[
                { value: 'vivienda', label: 'Vivienda' },
                { value: 'comercio', label: 'Comercio' },
              ]}
            />
          </div>

          {moneda === 'ARS' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
              <div>
                <Label>Frecuencia de ajuste</Label>
                <Toggle<Frecuencia>
                  cols={2}
                  value={frecuencia}
                  onChange={setFrecuencia}
                  options={[
                    { value: 'trimestral', label: 'Trimestral' },
                    { value: 'cuatrimestral', label: 'Cuatrimestral' },
                  ]}
                />
              </div>
              <div>
                <Label>Índice</Label>
                <Toggle<Indice>
                  cols={2}
                  value={indice}
                  onChange={setIndice}
                  options={[
                    { value: 'ICL', label: 'ICL' },
                    { value: 'IPC', label: 'IPC' },
                  ]}
                />
              </div>
            </div>
          ) : (
            <div
              className="rounded-lg px-4 py-3 mb-4 text-[13px] leading-relaxed"
              style={{ background: 'var(--si-green-tint)', color: 'var(--si-green-dark)' }}
            >
              <strong className="block uppercase tracking-[0.6px] text-[11px] mb-1">
                Ajuste anual
              </strong>
              Consultar ajuste anual. Los contratos en dólares tienen un solo ajuste al año.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <Label htmlFor="alquiler">Alquiler mensual</Label>
              <NumInput
                id="alquiler"
                value={alquiler}
                onChange={setAlquiler}
                prefix={moneda === 'USD' ? 'US$' : '$'}
                min={0}
                step={moneda === 'USD' ? 50 : 1000}
              />
            </div>
            <div>
              <Label htmlFor="meses">Duración del contrato</Label>
              <NumInput
                id="meses"
                value={meses}
                onChange={n => setMeses(Math.max(1, Math.round(n)))}
                suffix="meses"
                min={1}
                step={1}
              />
            </div>
          </div>

          {/* Avanzados */}
          <details
            open={advancedOpen}
            onToggle={(e) => setAdvancedOpen((e.currentTarget as HTMLDetailsElement).open)}
            className="mt-4 pt-4"
            style={{ borderTop: '1px solid var(--line)' }}
          >
            <summary
              className="cursor-pointer text-[13px] font-semibold flex items-center gap-1.5 select-none list-none"
              style={{ color: 'var(--tinta-mute)' }}
            >
              Ajustar valores avanzados
              <span className="ml-auto font-poppins font-semibold text-lg" aria-hidden>
                {advancedOpen ? '−' : '+'}
              </span>
            </summary>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <Label htmlFor="cotizacion">Cotización dólar oficial</Label>
                <NumInput
                  id="cotizacion"
                  value={cotizacion}
                  onChange={n => setCotizacion(n > 0 ? n : 1)}
                  prefix="$"
                  min={1}
                  step={10}
                />
                <p className="text-[12px] mt-1.5" style={{ color: 'var(--tinta-mute)' }}>
                  Se usa para el depósito y para convertir el sellado cuando el alquiler está en USD.
                </p>
              </div>
            </div>
          </details>
        </section>

        {/* ── BOTÓN DESCARGAR ── */}
        {!isCapturing && (
          <div className="flex justify-end mb-3">
            <button
              type="button"
              onClick={handleDescargar}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-all hover:-translate-y-px"
              style={{
                background: '#FFFFFF',
                color: 'var(--si-green)',
                border: '1px solid var(--line)',
                boxShadow: '0 1px 2px rgba(20, 30, 25, 0.04)',
              }}
            >
              <Download className="w-4 h-4" />
              Descargar como imagen
            </button>
          </div>
        )}

        {/* ── ÁREA CAPTURABLE ── */}
        <div ref={captureRef}>

          {/* Tabla horizontal — 5 columnas / 2 cols mobile */}
          <section
            className="rounded-2xl p-5 sm:p-6 mb-4 shadow-sm"
            style={{ background: '#FFFFFF', border: '1px solid var(--line)' }}
          >
            <h2
              className="font-bold text-[11px] uppercase tracking-[1.5px] m-0 mb-3.5 pb-2.5"
              style={{ color: 'var(--si-green)', borderBottom: '1px solid var(--line)' }}
            >
              Costos al ingresar — desglose
            </h2>
            <div className="grid grid-cols-2 gap-3 min-[720px]:grid-cols-5">
              <Cell
                label="Primer mes"
                small="alquiler"
                value={fmt(alquiler, moneda)}
                flashKey={`pm-${moneda}-${alquiler}`}
              />
              <Cell
                label="Honorarios"
                small="1ª cuota de 3"
                value={fmt(c.honoCuota, moneda)}
                flashKey={`h-${moneda}-${c.honoCuota.toFixed(2)}`}
              />
              <Cell
                label="Sellado"
                small={selladoSmall}
                value={fmtArs(c.sellado)}
                flashKey={`s-${tipo}-${Math.round(c.sellado)}`}
              />
              <Cell
                label="Garantes"
                small="verificación"
                value={fmtArs(c.verificacion)}
                flashKey={`g-${c.verificacion}`}
              />
              <Cell
                label="Administrativo"
                small="por mes"
                value={fmt(c.admin, moneda)}
                flashKey={`ad-${moneda}-${c.admin.toFixed(2)}`}
                fullOnMobile
              />
            </div>
          </section>

          {/* TOTAL */}
          <section
            className="rounded-2xl p-7 mb-4 text-white shadow-md relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, var(--si-green) 0%, var(--si-green-dark) 100%)',
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 90% 0%, rgba(255,255,255,0.10) 0%, transparent 55%)',
              }}
            />
            <div className="relative">
              <div
                className="text-[11px] font-bold uppercase tracking-[1.6px] mb-1.5"
                style={{ color: 'rgba(255,255,255,0.7)' }}
              >
                Monto total al ingresar
              </div>
              <TotalAmount />
              <div
                className="text-[13px] font-medium mt-2"
                style={{ color: 'rgba(255,255,255,0.78)' }}
              >
                {moneda === 'USD'
                  ? `Sellado y verificación se abonan en pesos · ${tipoLabel}`
                  : `Pagando honorarios en 3 cuotas · ${tipoLabel} ${monedaLabel}`}
              </div>
            </div>
          </section>

          {/* TIMELINE */}
          <section
            className="rounded-2xl p-5 sm:p-6 mb-4 shadow-sm"
            style={{ background: '#FFFFFF', border: '1px solid var(--line)' }}
          >
            <h2
              className="font-bold text-[11px] uppercase tracking-[1.5px] m-0 mb-3.5 pb-2.5"
              style={{ color: 'var(--si-green)', borderBottom: '1px solid var(--line)' }}
            >
              Cronograma estimado
            </h2>

            <TimelineRow
              title="Mes 1 — al ingresar"
              detail="alquiler + 1ª cuota honorarios + sellado + verificación + admin"
            >
              <MesValor usd={mes1Usd} ars={mes1Ars} />
            </TimelineRow>

            <TimelineRow title="Mes 2" detail="alquiler + 2ª cuota honorarios + admin">
              <MesValor usd={mes23Usd} ars={mes23Ars} />
            </TimelineRow>

            <TimelineRow title="Mes 3" detail="alquiler + 3ª cuota honorarios + admin">
              <MesValor usd={mes23Usd} ars={mes23Ars} />
            </TimelineRow>

            <TimelineRow title="Mes 4 en adelante" detail={`alquiler + admin · ${ajusteSubtitulo}`} last>
              <MesValor usd={mes4Usd} ars={mes4Ars} />
            </TimelineRow>
          </section>

          {/* DEPÓSITO */}
          <section className="mb-4">
            <DepositoCard amountUsd={c.depositoUSD} />
          </section>

          {/* GARANTÍAS QUE NECESITÁS */}
          <section
            className="rounded-2xl p-5 sm:p-6 mb-4 shadow-sm"
            style={{ background: '#FFFFFF', border: '1px solid var(--line)' }}
          >
            <h3
              className="font-bold text-[11px] uppercase tracking-[1.5px] m-0 mb-3"
              style={{ color: 'var(--si-green)' }}
            >
              Garantías que necesitás — opción 1 ó 2
            </h3>
            <ul className="list-none p-0 m-0 grid gap-2.5">
              <li className="flex gap-3 items-start text-[14px]" style={{ color: 'var(--tinta-soft)' }}>
                <GarantiaNum>1</GarantiaNum>
                <span><strong>1 garantía propietaria</strong> + 3 recibos de sueldo</span>
              </li>
              <li className="flex gap-3 items-start text-[14px]" style={{ color: 'var(--tinta-soft)' }}>
                <GarantiaNum>2</GarantiaNum>
                <span><strong>4 recibos de sueldo</strong></span>
              </li>
            </ul>
          </section>

          {/* IMPUESTOS / SEGURO */}
          <section className="mb-4 grid gap-3">
            <div
              className="rounded-2xl px-5 py-4 text-[13px] leading-relaxed"
              style={{ background: 'var(--si-green-tint)', color: 'var(--si-green-dark)' }}
            >
              <strong className="block font-bold uppercase text-[11px] tracking-[0.8px] mb-1">
                Impuestos a cargo del locatario
              </strong>
              Tasa General de Inmuebles (TGI), Aguas Santafesinas, API, luz y gas.
            </div>
            <div
              className="rounded-2xl px-5 py-4 text-[13px] leading-relaxed"
              style={{
                background: '#FFF8E6',
                borderLeft: '3px solid #D4A93B',
                color: '#6B5316',
              }}
            >
              <strong className="block font-bold uppercase text-[11px] tracking-[0.8px] mb-1"
                      style={{ color: '#4A3A0F' }}>
                Importante — seguro obligatorio
              </strong>
              Al ingresar, el locatario debe contar con seguro contra incendio,
              piedras y responsabilidad civil a linderos.
            </div>
          </section>

        </div>
        {/* ── /ÁREA CAPTURABLE ── */}

        {/* DISCLAIMER */}
        <div className="mb-4">
          <DisclaimerInfo />
        </div>

        {/* FAQ */}
        <section
          className="recursos-faq rounded-2xl p-5 sm:p-6 mb-4 shadow-sm"
          style={{ background: '#FFFFFF', border: '1px solid var(--line)' }}
        >
          <h2
            className="font-bold text-[11px] uppercase tracking-[1.5px] m-0 mb-2"
            style={{ color: 'var(--si-green)' }}
          >
            Dudas frecuentes
          </h2>
          <h3
            className="font-bold text-[20px] m-0 mb-3 tracking-tight"
            style={{ color: 'var(--tinta)' }}
          >
            Lo que la gente nos pregunta
          </h3>

          <Faq q="¿Qué incluye este cálculo?">
            <p>
              Mostramos los <strong>costos iniciales</strong> que se abonan al firmar y al ingresar a la propiedad:
              primer mes de alquiler, primera cuota de honorarios, sellado, verificación de garantes y costo
              administrativo del primer mes. El depósito se devuelve al finalizar el contrato (no es un costo).
            </p>
          </Faq>

          <Faq q="¿Qué cubre el costo administrativo?">
            <p>
              El costo administrativo (<strong>3% del alquiler + IVA</strong>) está fijado por el{' '}
              <strong>COCIR</strong> (Colegio de Corredores Inmobiliarios de Rosario) y cubre tres funciones del mes:
            </p>
            <ul className="list-disc pl-5 mt-1.5">
              <li><strong>Cobranza</strong>: gestión del cobro mensual.</li>
              <li><strong>Intermediación</strong>: contacto con propietario para reclamos, arreglos y consultas.</li>
              <li><strong>Seguimiento</strong>: control del cumplimiento del contrato durante toda su vigencia.</li>
            </ul>
          </Faq>

          <Faq q="¿Cómo se calculan los honorarios?">
            <p>
              <code>alquiler × meses × 5% × 1,21</code>. Se dividen en <strong>3 cuotas iguales</strong> que se
              abonan junto con los primeros 3 meses de alquiler.
            </p>
          </Faq>

          <Faq q="¿Cómo se ajusta el alquiler?">
            <p>
              Depende de la moneda y el tipo de contrato:
            </p>
            <ul className="list-disc pl-5 mt-1.5">
              <li><strong>Vivienda en pesos</strong>: ajuste cuatrimestral por <strong>ICL</strong> (sugerido).</li>
              <li><strong>Comercio en pesos</strong>: ajuste trimestral por <strong>IPC</strong> (sugerido).</li>
              <li><strong>Contratos en dólares</strong>: un solo ajuste anual.</li>
            </ul>
            <p className="mt-1.5">
              El índice y la frecuencia exacta los fijás de común acuerdo y quedan asentados en el contrato.
            </p>
          </Faq>

          <Faq q="¿Qué garantías necesito?">
            <p>
              Una de estas dos opciones: <strong>1 garantía propietaria + 3 recibos de sueldo</strong> · ó ·{' '}
              <strong>4 recibos de sueldo</strong>. La verificación de garantes tiene un costo fijo de{' '}
              <strong>{fmtArs(VERIFICACION_ARS)}</strong>.
            </p>
          </Faq>

          <Faq q="¿Qué impuestos paga el locatario?">
            <p>
              El locatario abona Tasa General de Inmuebles (TGI), Aguas Santafesinas, API, luz y gas durante
              toda la vigencia del contrato.
            </p>
          </Faq>

          <Faq q="¿Es obligatorio el seguro?">
            <p>
              Sí. Al ingresar tenés que contar con seguro contra <strong>incendio</strong>,{' '}
              <strong>piedras</strong> y <strong>responsabilidad civil a linderos</strong>. Te orientamos
              con compañías que trabajamos habitualmente.
            </p>
          </Faq>

          <Faq q="¿Puedo pagar todos los honorarios al inicio?">
            <p>
              Sí, también es posible. El cálculo por defecto los divide en 3 cuotas para mostrar el monto
              mínimo de ingreso, pero podés abonarlos al contado.
            </p>
          </Faq>

          <Faq q="¿Por qué algunos valores se muestran en pesos en contratos USD?">
            <p>
              El <strong>sellado</strong> es un impuesto provincial que se liquida en pesos sobre el valor del
              contrato (convertido a pesos al cambio del día). La <strong>verificación de garantes</strong>{' '}
              tiene un costo administrativo fijo en pesos. Por eso aparecen como una línea adicional cuando el
              alquiler está en dólares.
            </p>
          </Faq>
        </section>

        {/* CTA */}
        {!isCapturing && (
          <CtaWhatsapp
            source="costos"
            message={`Hola! Tengo dudas con los costos iniciales para alquilar. Estuve mirando un contrato de ${tipoLabel.toLowerCase()} ${moneda === 'USD' ? `de US$ ${alquiler}` : `de $ ${alquiler.toLocaleString('es-AR')}`} por ${meses} meses.`}
          />
        )}
      </div>
    </div>
  )
}

// ── Cell de la tabla horizontal ──────────────────────────────────────────
function Cell({
  label,
  small,
  value,
  flashKey,
  fullOnMobile = false,
}: {
  label: string
  small?: string
  value: string
  flashKey: string
  fullOnMobile?: boolean
}) {
  return (
    <div
      className={`rounded-xl p-3.5 ${fullOnMobile ? 'col-span-2 min-[720px]:col-span-1' : ''}`}
      style={{ background: '#FAFAF7', border: '1px solid var(--line)' }}
    >
      <div className="text-[10.5px] font-bold uppercase tracking-[0.8px] mb-1"
           style={{ color: 'var(--tinta-mute)' }}>
        {label}
      </div>
      <Flash value={flashKey}>
        <div className="font-poppins font-semibold text-[16px] tabular-nums leading-tight"
             style={{ color: 'var(--tinta)' }}>
          {value}
        </div>
      </Flash>
      {small && (
        <div className="text-[11.5px] mt-0.5" style={{ color: 'var(--tinta-mute)' }}>
          {small}
        </div>
      )}
    </div>
  )
}

function TimelineRow({
  title,
  detail,
  children,
  last = false,
}: {
  title: string
  detail: string
  children: React.ReactNode
  last?: boolean
}) {
  return (
    <div
      className="flex justify-between items-start gap-4 py-3"
      style={!last ? { borderBottom: '1px dashed var(--line)' } : undefined}
    >
      <div className="min-w-0">
        <div className="text-[14px] font-semibold leading-tight" style={{ color: 'var(--tinta)' }}>
          {title}
        </div>
        <div className="text-[12px] mt-0.5 leading-snug" style={{ color: 'var(--tinta-mute)' }}>
          {detail}
        </div>
      </div>
      {children}
    </div>
  )
}

function GarantiaNum({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="flex-shrink-0 w-6 h-6 rounded-full font-poppins font-bold text-[12px] flex items-center justify-center mt-0.5"
      style={{ background: 'var(--si-green-tint)', color: 'var(--si-green)' }}
    >
      {children}
    </span>
  )
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details
      className="py-4"
      style={{ borderTop: '1px solid var(--line)' }}
    >
      <summary className="cursor-pointer flex items-center justify-between gap-3 select-none">
        <span className="text-[15px] font-semibold" style={{ color: 'var(--tinta)' }}>{q}</span>
        <span className="font-poppins font-semibold text-[22px] flex-shrink-0"
              style={{ color: 'var(--tinta-mute)' }} aria-hidden>
          +
        </span>
      </summary>
      <div className="mt-2.5 text-[14px] leading-relaxed" style={{ color: 'var(--tinta-soft)' }}>
        {children}
      </div>
    </details>
  )
}
