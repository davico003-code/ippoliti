'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Download } from 'lucide-react'
import { events } from '@/lib/analytics'
import {
  calcularCostosIngreso,
  VERIFICACION_ARS,
  type Moneda,
  type TipoFiscal as Tipo,
  type FormaPagoHonorarios,
} from '@/lib/calculadora-alquiler'
import DepositoCard from './shared/DepositoCard'
import DisclaimerInfo from './shared/DisclaimerInfo'
import CtaWhatsapp from './shared/CtaWhatsapp'

type Frecuencia = 'trimestral' | 'cuatrimestral'
type Indice = 'ICL' | 'IPC'
type MesesPreset = 24 | 36 | 'custom' | null

// ── Formatos ─────────────────────────────────────────────────────────────
const fmtArs = (n: number) =>
  `$ ${Math.round(n).toLocaleString('es-AR')}`

const fmtUsd = (n: number) =>
  `US$ ${n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const fmt = (n: number, m: Moneda) => (m === 'USD' ? fmtUsd(n) : fmtArs(n))

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

// Formateador único reutilizado. Sin decimales — esta calculadora trabaja con
// enteros (pesos redondos / dólares sin centavos para el alquiler).
const fmtMiles = new Intl.NumberFormat('es-AR')

function NumInput({
  id,
  value,
  onChange,
  prefix,
  suffix,
  placeholder,
}: {
  id: string
  value: number
  onChange: (n: number) => void
  prefix?: string
  suffix?: string
  /** Si se pasa, cuando value=0 el input se muestra vacío (no "0") y aparece el placeholder en gris claro. */
  placeholder?: string
}) {
  // Si hay placeholder y el value es 0, dejamos el input vacío visualmente
  // para que el usuario vea la sugerencia ("Ej: 500.000") en lugar de un cero literal.
  const showEmpty = placeholder != null && (!Number.isFinite(value) || value === 0)

  // Estado interno: string formateado para presentación. El estado del padre
  // sigue siendo Number puro — el formateo es solo en el render del input.
  const [displayValue, setDisplayValue] = useState<string>(() =>
    showEmpty ? '' : fmtMiles.format(Number.isFinite(value) ? Math.round(value) : 0),
  )

  // Sincroniza el display con cambios externos al input (query params al
  // mount, reset, cambio de moneda, etc). No reformatea si el valor numérico
  // ya coincide con lo que está escrito — evita que el cursor del usuario
  // salte mientras tipea.
  useEffect(() => {
    const numeric = Number.isFinite(value) ? Math.round(value) : 0
    const currentParsed = parseInt(displayValue.replace(/\D/g, ''), 10)
    const currentNumeric = Number.isFinite(currentParsed) ? currentParsed : 0
    if (currentNumeric === numeric) return
    if (placeholder != null && numeric === 0) setDisplayValue('')
    else setDisplayValue(fmtMiles.format(numeric))
    // displayValue intencionalmente excluido — sincronizamos cuando el valor
    // externo cambia, no cuando el usuario tipea.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, placeholder])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Acepta dígitos solamente — esto absorbe naturalmente "1.500.000",
    // "1,500,000" o "$1.500.000" pegados del clipboard.
    const cleaned = e.target.value.replace(/\D/g, '')
    if (cleaned === '') {
      setDisplayValue('')
      onChange(0)
      return
    }
    const n = parseInt(cleaned, 10)
    setDisplayValue(fmtMiles.format(n))
    onChange(n)
  }

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
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={displayValue}
        placeholder={placeholder}
        onChange={handleChange}
        className="flex-1 bg-transparent border-0 outline-none w-full px-2 py-3 font-poppins font-semibold text-[17px] tabular-nums placeholder:text-gray-300 placeholder:font-medium"
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
  // Inicio vacío: el usuario completa el alquiler para ver el cálculo.
  const [alquiler, setAlquiler] = useState<number>(0)
  // Expensas: campo informativo, NO entra en el cálculo. Se persiste en URL
  // para que el flujo de compartir lo conserve.
  const [expensas, setExpensas] = useState<number>(0)
  // Duración como toggle (24/36/custom) + custom value. `meses` se deriva.
  const [mesesPreset, setMesesPreset] = useState<MesesPreset>(null)
  const [mesesCustom, setMesesCustom] = useState<number>(0)
  const [cotizacion, setCotizacion] = useState<number>(1430)
  // Gasto administrativo: por defecto se incluye. Se puede excluir desde el
  // toggle en "Ajustar valores avanzados" o por query (?admin=no).
  const [incluirAdmin, setIncluirAdmin] = useState<boolean>(true)
  // Forma de pago de honorarios: 3 cuotas (default) o 1 pago al ingreso.
  const [formaPago, setFormaPago] = useState<FormaPagoHonorarios>('3cuotas')
  const [advancedOpen, setAdvancedOpen] = useState<boolean>(false)
  // Toast inline para feedback de "Compartir cálculo".
  const [toast, setToast] = useState<string | null>(null)

  // Meses real para el cálculo. Cuando preset es null caemos a 24 (no se
  // muestran resultados igual hasta que alquiler > 0, así que el valor solo
  // entra al cálculo cuando ya hay un preset elegido).
  const meses: number =
    mesesPreset === 'custom'
      ? (mesesCustom > 0 ? Math.round(mesesCustom) : 24)
      : (mesesPreset ?? 24)

  // Prefill desde query params (ej. cuando alguien comparte el link de la
  // calculadora ya cargada). Solo se aplica al mount; cambios posteriores del
  // usuario no se sobrescriben.
  useEffect(() => {
    const qMoneda = searchParams?.get('moneda')
    const qTipo = searchParams?.get('tipo')
    const qAlquiler = searchParams?.get('alquiler')
    const qExpensas = searchParams?.get('expensas')
    const qMeses = searchParams?.get('meses')
    const qFrecuencia = searchParams?.get('frecuencia')
    const qIndice = searchParams?.get('indice')

    if (qMoneda === 'ARS' || qMoneda === 'USD') setMoneda(qMoneda)
    if (qTipo === 'vivienda' || qTipo === 'comercio') {
      setTipo(qTipo)
      // Refleja la lógica de handleTipo: ambos tipos arrancan con
      // cuatrimestral + ICL. Si el query trae frecuencia/indice explícitos,
      // se aplican después y ganan sobre el default.
      setFrecuencia('cuatrimestral')
      setIndice('ICL')
    }
    const a = qAlquiler ? parseFloat(qAlquiler) : NaN
    if (Number.isFinite(a) && a > 0) setAlquiler(a)
    const e = qExpensas ? parseFloat(qExpensas) : NaN
    if (Number.isFinite(e) && e >= 0) setExpensas(e)
    const m = qMeses ? parseInt(qMeses, 10) : NaN
    if (Number.isFinite(m) && m > 0) {
      if (m === 24 || m === 36) {
        setMesesPreset(m)
        setMesesCustom(0)
      } else {
        setMesesPreset('custom')
        setMesesCustom(m)
      }
    }
    if (qFrecuencia === 'trimestral' || qFrecuencia === 'cuatrimestral') setFrecuencia(qFrecuencia)
    if (qIndice === 'ICL' || qIndice === 'IPC') setIndice(qIndice)
    // Gasto administrativo: ?admin=no lo excluye (default incluir). Legacy: ?sinAdmin=1.
    if (searchParams?.get('admin') === 'no' || searchParams?.get('sinAdmin') === '1') setIncluirAdmin(false)
    // Forma de pago de honorarios: ?pago=1pago. Legacy: ?honoCuotas=1.
    if (searchParams?.get('pago') === '1pago' || searchParams?.get('honoCuotas') === '1') setFormaPago('1pago')
    // Prefill intencionalmente solo-mount; no sobrescribir cambios manuales.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Si el usuario completa alquiler antes de elegir duración, default 24.
  useEffect(() => {
    if (alquiler > 0 && mesesPreset == null) setMesesPreset(24)
  }, [alquiler, mesesPreset])

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

  // Auto-select frecuencia + índice al cambiar tipo — ambos arrancan en
  // cuatrimestral + ICL. El usuario puede cambiarlo manualmente.
  const handleTipo = (t: Tipo) => {
    setTipo(t)
    setFrecuencia('cuatrimestral')
    setIndice('ICL')
  }

  // Cambiar moneda no toca el monto que cargó el usuario (UI arranca vacía,
  // los defaults previos generaban un cálculo de ejemplo no deseado).
  const handleMoneda = (m: Moneda) => {
    if (m === moneda) return
    setMoneda(m)
  }

  // ── Cálculo principal ──────────────────────────────────────────────────
  const c = useMemo(
    () => calcularCostosIngreso({ alquiler, meses, moneda, tipo, cotizacion, incluirAdmin, formaPagoHonorarios: formaPago }),
    [alquiler, meses, moneda, tipo, cotizacion, incluirAdmin, formaPago],
  )

  // Total al ingresar — separado por moneda
  // USD: alquiler + honoCuota + admin (USD)  ·  sellado + verificacion (ARS)
  // ARS: alquiler + honoCuota + sellado + verificacion + admin (ARS)
  const totalUsd = moneda === 'USD' ? c.totalSubMonedaContrato : 0
  const totalArs = moneda === 'USD' ? c.totalSubARS : c.totalSubMonedaContrato

  // Timeline — Mes 1 = ingreso completo. Mes 2 y 3 = alquiler + honoCuota + admin. Mes 4+ = alquiler + admin.
  const mes1Usd = totalUsd
  const mes1Ars = totalArs
  // Con pago único, los honorarios van completos en el Mes 1: los meses 2 y 3 ya
  // no suman cuota (quedan como el Mes 4: solo alquiler + admin).
  const honoMes23 = c.honoEnMes23
  const mes23Usd = moneda === 'USD' ? alquiler + honoMes23 + c.admin : 0
  const mes23Ars = moneda === 'USD' ? 0 : alquiler + honoMes23 + c.admin
  const mes4Usd = moneda === 'USD' ? alquiler + c.admin : 0
  const mes4Ars = moneda === 'USD' ? 0 : alquiler + c.admin

  // ── Descarga PDF — abre la planilla en nueva pestaña y dispara print() ─
  // El browser muestra el diálogo nativo de impresión donde el usuario elige
  // "Guardar como PDF". Cero dependencias server, vectorial nativo, funciona
  // en cualquier dispositivo.
  const handleDescargar = () => {
    events.calculadoraCostosDescargar()
    const params = new URLSearchParams({
      alquiler: String(alquiler),
      meses: String(meses),
      moneda,
      tipo,
      frecuencia,
      indice,
      cotizacion: String(cotizacion),
      pago: formaPago,
      admin: incluirAdmin ? 'incluir' : 'no',
    })
    window.open(
      `/recursos/calculadora-alquiler/planilla?${params.toString()}`,
      '_blank',
      'noopener,noreferrer',
    )
  }

  // ── Compartir cálculo — Web Share API (mobile) o fallback clipboard ────
  // Construye la URL pública de la calculadora con todos los valores actuales
  // como query params. La persona que reciba el link la abre con el cálculo
  // ya cargado y listo para mostrar.
  const handleCompartir = async () => {
    const params = new URLSearchParams({
      alquiler: String(alquiler),
      meses: String(meses),
      moneda,
      tipo,
      expensas: String(expensas),
      frecuencia,
      indice,
      pago: formaPago,
      admin: incluirAdmin ? 'incluir' : 'no',
    })
    const url = `${window.location.origin}/recursos/calculadora-alquiler?${params.toString()}`

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: 'Planilla de costos de alquiler — SI INMOBILIARIA',
          text: 'Mirá este cálculo de costos de alquiler',
          url,
        })
        return
      } catch (err) {
        // Si el usuario cancela el share nativo, no caemos a clipboard.
        if (err instanceof Error && err.name === 'AbortError') return
        // Otros errores → caemos al fallback de clipboard.
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      setToast('Link copiado al portapapeles')
    } catch {
      setToast('No pudimos copiar el link, probá de nuevo')
    }
    setTimeout(() => setToast(null), 2000)
  }

  // ── Helpers de render ──────────────────────────────────────────────────
  const monedaLabel = moneda === 'USD' ? 'en dólares' : 'en pesos'
  const tipoLabel = tipo === 'vivienda' ? 'Vivienda' : 'Comercio'
  // Sufijo de admin en el detalle del cronograma — vacío si no se incluye admin.
  const adminLabel = incluirAdmin ? ' + admin' : ''
  const ajusteSubtitulo =
    moneda === 'USD'
      ? 'Consultar ajuste anual. Los contratos en dólares tienen un solo ajuste al año.'
      : `Ajuste ${frecuencia} por ${indice}`
  // Labels de honorarios según forma de pago elegida.
  const es3Cuotas = formaPago === '3cuotas'
  const honoTotalLabel =
    es3Cuotas ? 'Pagando honorarios en 3 cuotas' : 'Honorarios al contado (1 pago)'
  const honoMes1Label = es3Cuotas ? '1ª cuota honorarios' : 'honorarios'

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
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes recursosFlash {
          0% { color: var(--si-green-soft); }
          100% { color: inherit; }
        }
        .recursos-flash > * { animation: recursosFlash 0.45s ease-out; }
        @keyframes recursosFadein {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .recursos-fadein { animation: recursosFadein 200ms ease-out; }
        .recursos-card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .recursos-card-hover:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(20, 30, 25, 0.08); }
        .recursos-faq summary::-webkit-details-marker { display: none; }
        .recursos-faq summary { list-style: none; }
        .recursos-faq details > summary { cursor: pointer; }
        @keyframes recursosToast {
          0%   { opacity: 0; transform: translateY(8px) translateX(-50%); }
          15%  { opacity: 1; transform: translateY(0)   translateX(-50%); }
          85%  { opacity: 1; transform: translateY(0)   translateX(-50%); }
          100% { opacity: 0; transform: translateY(-4px) translateX(-50%); }
        }
        .recursos-toast { animation: recursosToast 2s ease-out forwards; }
      ` }} />

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
          <p className="text-[15px] max-w-[580px] m-0 mt-1" style={{ color: 'var(--tinta-soft)' }}>
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
                placeholder={moneda === 'USD' ? 'Ej: 500' : 'Ej: 500.000'}
              />
            </div>
            <div>
              <Label htmlFor="expensas">Expensas mensuales (opcional)</Label>
              <NumInput
                id="expensas"
                value={expensas}
                onChange={setExpensas}
                prefix={moneda === 'USD' ? 'US$' : '$'}
                placeholder={moneda === 'USD' ? 'Ej: 30 (opcional)' : 'Ej: 30.000 (opcional)'}
              />
            </div>
          </div>

          {/* Duración del contrato — toggle 24 / 36 / Otro + input custom condicional */}
          <div className="mt-4">
            <Label htmlFor="meses-custom">Duración del contrato</Label>
            <div
              role="group"
              className="grid gap-1.5 p-1 rounded-lg"
              style={{
                gridTemplateColumns: 'repeat(3, 1fr)',
                background: '#FAFAF7',
                border: '1px solid var(--line)',
              }}
            >
              {([24, 36, 'custom'] as const).map(opt => {
                const active = mesesPreset === opt
                const label = opt === 'custom' ? 'Otro' : `${opt} meses`
                return (
                  <button
                    key={String(opt)}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setMesesPreset(opt)}
                    className="px-3 py-2.5 rounded-md text-sm font-semibold transition-all font-raleway"
                    style={{
                      background: active ? 'var(--si-green)' : 'transparent',
                      color: active ? '#fff' : 'var(--tinta-soft)',
                      boxShadow: active ? '0 1px 4px rgba(26, 92, 56, 0.25)' : 'none',
                      cursor: 'pointer',
                      border: 'none',
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
            {mesesPreset === 'custom' && (
              <div className="mt-2.5">
                <NumInput
                  id="meses-custom"
                  value={mesesCustom}
                  onChange={n => setMesesCustom(n > 0 ? Math.round(n) : 0)}
                  suffix="meses"
                  placeholder="Ej: 18"
                />
              </div>
            )}
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

            {/* Forma de pago de honorarios */}
            <div className="mt-4">
              <Label>Forma de pago de honorarios</Label>
              <Toggle<FormaPagoHonorarios>
                cols={2}
                value={formaPago}
                onChange={setFormaPago}
                options={[
                  { value: '3cuotas', label: '3 cuotas' },
                  { value: '1pago', label: '1 pago' },
                ]}
              />
              <p className="text-[12px] mt-1.5" style={{ color: 'var(--tinta-mute)' }}>
                {formaPago === '3cuotas'
                  ? '3 cuotas iguales junto a los primeros 3 meses (mínimo de ingreso).'
                  : 'Los honorarios completos se abonan al ingresar.'}
              </p>
            </div>

            {/* Gasto administrativo */}
            <div className="mt-4">
              <Label>Gasto administrativo</Label>
              <Toggle<'incluir' | 'no'>
                cols={2}
                value={incluirAdmin ? 'incluir' : 'no'}
                onChange={(v) => setIncluirAdmin(v === 'incluir')}
                options={[
                  { value: 'incluir', label: 'Incluir' },
                  { value: 'no', label: 'No incluir' },
                ]}
              />
              <p className="text-[12px] mt-1.5" style={{ color: 'var(--tinta-mute)' }}>
                Marcá &quot;No incluir&quot; si SI solo confecciona el contrato sin administrar el alquiler.
              </p>
            </div>

            {/* Cotización */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <Label htmlFor="cotizacion">Cotización dólar oficial</Label>
                <NumInput
                  id="cotizacion"
                  value={cotizacion}
                  onChange={n => setCotizacion(n > 0 ? n : 1)}
                  prefix="$"
                />
                <p className="text-[12px] mt-1.5" style={{ color: 'var(--tinta-mute)' }}>
                  Se usa para convertir el sellado cuando el alquiler está en USD.
                </p>
              </div>
            </div>
          </details>
        </section>

        {/* ── Empty state (alquiler === 0) ───────────────────────────────── */}
        {alquiler === 0 && (
          <section
            className="rounded-2xl p-7 mb-4 text-center recursos-fadein"
            style={{ background: '#FFFFFF', border: '1px solid var(--line)' }}
          >
            <div
              aria-hidden
              className="mx-auto mb-3 flex items-center justify-center rounded-full"
              style={{
                width: 52, height: 52,
                background: 'var(--si-green-tint)',
                color: 'var(--si-green)',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <line x1="8" y1="6" x2="16" y2="6" />
                <line x1="8" y1="10" x2="10" y2="10" />
                <line x1="13" y1="10" x2="16" y2="10" />
                <line x1="8" y1="14" x2="10" y2="14" />
                <line x1="13" y1="14" x2="16" y2="14" />
                <line x1="8" y1="18" x2="10" y2="18" />
                <line x1="13" y1="18" x2="16" y2="18" />
              </svg>
            </div>
            <div
              className="text-[11px] font-bold uppercase tracking-[1.6px] mb-2"
              style={{ color: 'var(--si-green)' }}
            >
              Para empezar
            </div>
            <p
              className="text-[16px] leading-snug max-w-[420px] mx-auto m-0 mb-2 font-medium"
              style={{ color: 'var(--tinta)' }}
            >
              Ingresá el monto de tu alquiler para ver el cálculo completo de costos iniciales.
            </p>
            <p
              className="text-[13px] leading-relaxed max-w-[480px] mx-auto m-0"
              style={{ color: 'var(--tinta-mute)' }}
            >
              Ajustá los demás valores y vas a ver al instante el total a pagar al ingresar, depósito, timeline de pagos mensuales y más.
            </p>
          </section>
        )}

        {/* ── Bloque de resultados — solo cuando hay alquiler > 0 ────────── */}
        {alquiler > 0 && (
          <div className="recursos-fadein">

        {/* TOTAL — banda verde protagonista (arriba). Componente intacto. */}
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
                  ? `${honoTotalLabel} · sellado y verificación en pesos · ${tipoLabel}`
                  : `${honoTotalLabel} · ${tipoLabel} ${monedaLabel}`}
              </div>
            </div>
          </section>

          {/* DESGLOSE — card unificada: filas + línea separadora + total al final */}
          <section
            className="rounded-2xl p-5 sm:p-6 mb-4 shadow-sm"
            style={{ background: '#FFFFFF', border: '1px solid var(--line)' }}
          >
            <h2
              className="font-bold text-[11px] uppercase tracking-[1.5px] m-0 mb-2 pb-2.5"
              style={{ color: 'var(--si-green)', borderBottom: '1px solid var(--line)' }}
            >
              Costos al ingresar — desglose
            </h2>
            <div>
              <DesgloseRow label="PRIMER MES" value={fmt(alquiler, moneda)} />
              <DesgloseRow
                label={`HONORARIOS ${c.honoMes1Label}`}
                value={fmt(c.honoEnMes1, moneda)}
              />
              <DesgloseRow label="SELLADO" value={fmtArs(c.sellado)} />
              <DesgloseRow label="GARANTES" value={fmtArs(c.verificacion)} />
              {c.mostrarAdmin && (
                <DesgloseRow label="ADMINISTRATIVO" value={fmt(c.admin, moneda)} />
              )}
              {/* Total al final con línea separadora arriba */}
              <div
                className="flex items-baseline justify-between gap-4 pt-3 mt-1"
                style={{ borderTop: '1.5px solid var(--line)' }}
              >
                <span
                  className="text-[12.5px] font-bold uppercase tracking-[0.8px]"
                  style={{ color: 'var(--tinta)' }}
                >
                  Total
                </span>
                <div className="text-right">
                  {moneda === 'USD' ? (
                    <>
                      <Flash value={`tot-u-${totalUsd.toFixed(2)}`}>
                        <div
                          className="font-poppins font-bold text-[19px] tabular-nums leading-tight"
                          style={{ color: 'var(--tinta)' }}
                        >
                          {fmtUsd(totalUsd)}
                        </div>
                      </Flash>
                      <Flash value={`tot-a-${Math.round(totalArs)}`}>
                        <div
                          className="font-poppins font-semibold text-[13px] tabular-nums"
                          style={{ color: 'var(--tinta-mute)' }}
                        >
                          + {fmtArs(totalArs)} en pesos
                        </div>
                      </Flash>
                    </>
                  ) : (
                    <Flash value={`tot-a-${Math.round(totalArs)}`}>
                      <div
                        className="font-poppins font-bold text-[19px] tabular-nums leading-tight"
                        style={{ color: 'var(--tinta)' }}
                      >
                        {fmtArs(totalArs)}
                      </div>
                    </Flash>
                  )}
                </div>
              </div>
            </div>
            {!incluirAdmin && (
              <p className="text-[12px] italic mt-3" style={{ color: 'var(--tinta-mute)' }}>
                Sin gasto administrativo: SI solo confecciona el contrato.
              </p>
            )}
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
              detail={`alquiler + ${honoMes1Label} + sellado + verificación${adminLabel}`}
            >
              <MesValor usd={mes1Usd} ars={mes1Ars} />
            </TimelineRow>

            {c.mostrarMeses23 ? (
              <>
                <TimelineRow title="Mes 2" detail={`alquiler + 2ª cuota honorarios${adminLabel}`}>
                  <MesValor usd={mes23Usd} ars={mes23Ars} />
                </TimelineRow>

                <TimelineRow title="Mes 3" detail={`alquiler + 3ª cuota honorarios${adminLabel}`}>
                  <MesValor usd={mes23Usd} ars={mes23Ars} />
                </TimelineRow>

                <TimelineRow title="Mes 4 en adelante" detail={`alquiler${adminLabel} · ${ajusteSubtitulo}`} last>
                  <MesValor usd={mes4Usd} ars={mes4Ars} />
                </TimelineRow>
              </>
            ) : (
              <TimelineRow title="Mes 2 en adelante" detail={`alquiler${adminLabel} · ${ajusteSubtitulo}`} last>
                <MesValor usd={mes4Usd} ars={mes4Ars} />
              </TimelineRow>
            )}
          </section>

          {/* DEPÓSITO */}
          <section className="mb-4">
            <DepositoCard
              alquilerFmt={alquiler > 0 ? fmt(alquiler, moneda) : undefined}
              sumaFmt={alquiler > 0 ? fmt(alquiler * 2, moneda) : undefined}
            />
          </section>

          {/* ── CTA DESCARGAR + COMPARTIR — botonera compacta dual ──────────── */}
          <section
            className="rounded-2xl px-6 py-4 mb-4 shadow-sm"
            style={{ background: '#FFFFFF', border: '1px solid var(--line)' }}
          >
            <div
              className="text-[10px] font-bold uppercase tracking-[1.6px] mb-3"
              style={{ color: 'var(--si-green)' }}
            >
              Planilla de costos · PDF A4
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {/* Descargar — verde sólido */}
              <button
                type="button"
                onClick={handleDescargar}
                aria-label="Abrir planilla de costos para imprimir o guardar como PDF"
                className="group relative text-left rounded-xl px-4 py-3 overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background:
                    'linear-gradient(135deg, var(--si-green) 0%, var(--si-green-dark) 100%)',
                  color: '#fff',
                  boxShadow: '0 6px 16px rgba(15, 61, 36, 0.18)',
                  border: 'none',
                }}
              >
                <div className="relative flex items-center gap-3">
                  <div
                    aria-hidden
                    className="flex-shrink-0 flex items-center justify-center rounded-lg"
                    style={{
                      width: 44,
                      height: 44,
                      background: 'rgba(255,255,255,0.14)',
                      border: '1px solid rgba(255,255,255,0.22)',
                    }}
                  >
                    <Download className="w-[22px] h-[22px]" strokeWidth={2.25} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-raleway font-bold text-[18px] leading-tight tracking-tight">
                      Descargar planilla
                    </div>
                    <div
                      className="hidden sm:block text-[12px] mt-0.5 leading-snug"
                      style={{ color: 'rgba(255,255,255,0.82)' }}
                    >
                      PDF listo para imprimir y enviar
                    </div>
                  </div>
                </div>
              </button>

              {/* Compartir — verde con borde, fondo blanco */}
              <button
                type="button"
                onClick={handleCompartir}
                aria-label="Compartir el cálculo por link o app nativa"
                className="group relative text-left rounded-xl px-4 py-3 overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: '#FFFFFF',
                  color: 'var(--si-green)',
                  border: '1.5px solid var(--si-green)',
                }}
              >
                <div className="relative flex items-center gap-3">
                  <div
                    aria-hidden
                    className="flex-shrink-0 flex items-center justify-center rounded-lg"
                    style={{
                      width: 44,
                      height: 44,
                      background: 'var(--si-green-tint)',
                      border: '1px solid var(--si-green)',
                      color: 'var(--si-green)',
                    }}
                  >
                    {/* SVG inline (no lucide): cuadrado con flecha hacia arriba — share */}
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
                      <polyline points="16 6 12 2 8 6" />
                      <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-raleway font-bold text-[18px] leading-tight tracking-tight">
                      Compartir cálculo
                    </div>
                    <div
                      className="hidden sm:block text-[12px] mt-0.5 leading-snug"
                      style={{ color: 'var(--tinta-mute)' }}
                    >
                      Enviá el link con los valores cargados
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </section>

          </div>
        )}

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
        <CtaWhatsapp
          source="costos"
          message={`Hola! Tengo dudas con los costos iniciales para alquilar. Estuve mirando un contrato de ${tipoLabel.toLowerCase()} ${moneda === 'USD' ? `de US$ ${alquiler}` : `de $ ${alquiler.toLocaleString('es-AR')}`} por ${meses} meses.`}
        />
      </div>

      {/* Toast inline para feedback de "Compartir cálculo" — aparece sobre todo */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="recursos-toast fixed left-1/2 z-[10000] px-4 py-2.5 rounded-full shadow-lg text-[13px] font-semibold font-raleway"
          style={{
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
            background: 'var(--si-green)',
            color: '#fff',
            boxShadow: '0 8px 24px rgba(15, 61, 36, 0.28)',
          }}
        >
          {toast}
        </div>
      )}
    </div>
  )
}

// ── Fila del desglose unificado (label izq · valor der) ───────────────────
function DesgloseRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex items-baseline justify-between gap-4 py-2.5"
      style={{ borderBottom: '1px solid var(--line)' }}
    >
      <span
        className="text-[12px] font-bold uppercase tracking-[0.8px]"
        style={{ color: 'var(--tinta-mute)' }}
      >
        {label}
      </span>
      <Flash value={value}>
        <span
          className="font-poppins font-semibold text-[15px] tabular-nums whitespace-nowrap"
          style={{ color: 'var(--tinta)' }}
        >
          {value}
        </span>
      </Flash>
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
