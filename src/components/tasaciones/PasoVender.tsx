'use client'

// Paso 1 (27-sep-2026): página para VENDEDORES, sin ningún número automático.
// David: "es muy difícil que establezcas un precio parecido… no queremos
// curiosos, queremos vendedores reales". El rango de comparables mostraba el
// dato y el dueño se iba (≈260 lo vieron, 1 pidió). Ahora: qué vendés · dónde ·
// cuándo pensás vender → nombre + WhatsApp. El valor lo da un tasador del equipo.

import { useRef, useState } from 'react'
import type { BarrioTasacion, PlazoVenta, TipoTasacion } from '@/lib/tasacion/types'
import { cuentaTipo, PLAZOS_VENTA, TEXTO_TIPO } from '@/lib/tasacion/formato'
import SelectorBarrios from './SelectorBarrios'
import { BarraFija, cls, FotoDavid, IconoCheck, IconoFlecha } from './ui'

interface Props {
  barrios: BarrioTasacion[]
  tipo: TipoTasacion
  barrio: BarrioTasacion | null
  plazo: PlazoVenta | null
  onTipo: (t: TipoTasacion) => void
  onBarrio: (b: BarrioTasacion) => void
  onPlazo: (p: PlazoVenta) => void
  onContinuar: () => void
  error: string | null
  tituloRef: React.RefObject<HTMLHeadingElement>
}

const chip = 'si-tap inline-flex h-11 items-center whitespace-nowrap rounded-full border-[1.5px] px-[15px] text-[14.5px] font-semibold transition-colors motion-reduce:transition-none'
const chipOff = `${chip} border-[#E1E6E1] bg-white text-[#3C4A42] hover:border-[#17613C]/50`
const chipOn = `${chip} border-[#17613C] bg-[#17613C] font-bold text-white`
const chipMas = `${chip} gap-1.5 border-dashed border-[#B9C6BD] bg-white text-[#17613C] hover:border-[#17613C]`

const TIPOS: { v: TipoTasacion; label: string }[] = [
  { v: 'casa', label: 'Casa' },
  { v: 'lote', label: 'Lote' },
  { v: 'depto', label: 'Depto' },
]

/** Los barrios más activos de Funes y Roldán para el tipo elegido (el elegido siempre está). */
function barriosSugeridos(barrios: BarrioTasacion[], tipo: TipoTasacion, elegido: BarrioTasacion | null): BarrioTasacion[] {
  const zona = barrios.filter((b) => b.ciudad === 'Funes' || b.ciudad === 'Roldán')
  const base = zona.length ? zona : barrios
  const conDatos = base.filter((b) => cuentaTipo(b, tipo) > 0).sort((a, b) => cuentaTipo(b, tipo) - cuentaTipo(a, tipo))
  const lista = (conDatos.length ? conDatos : base).slice(0, 5)
  if (elegido && !lista.some((b) => b.id === elegido.id)) {
    if (lista.length >= 5) lista.pop()
    lista.unshift(elegido)
  }
  return lista
}

export default function PasoVender({ barrios, tipo, barrio, plazo, onTipo, onBarrio, onPlazo, onContinuar, error, tituloRef }: Props) {
  const [selectorAbierto, setSelectorAbierto] = useState(false)
  const otroRef = useRef<HTMLButtonElement>(null)
  const t = TEXTO_TIPO[tipo]
  const sugeridos = barriosSugeridos(barrios, tipo, barrio)

  const cerrar = () => {
    setSelectorAbierto(false)
    requestAnimationFrame(() => otroRef.current?.focus())
  }

  return (
    <>
      <h1 ref={tituloRef} tabIndex={-1} className={`${cls.h1} mt-2 outline-none focus-visible:outline-none`}>
        ¿Querés vender {t.tuCasa}?
      </h1>
      <p className={`${cls.sub} mt-2.5`}>
        Un tasador del equipo te dice cuánto vale <b className="font-bold text-[#121A15]">de verdad</b>: con lo que se vendió en tu barrio, no con lo que se pide en los portales.
      </p>

      <div className="mt-3.5 flex items-center gap-3 rounded-[18px] bg-[#EAF3ED] px-3.5 py-2.5">
        <FotoDavid size={40} className="border-2 border-white" />
        <p className="text-[13px] font-semibold leading-[1.35] text-[#3C4A42]">
          SI INMOBILIARIA · desde <span className="font-poppins">1983</span>
          <br />
          <span className="font-medium text-[#6B766E]">David Flores, corredor responsable · Mat. 0621</span>
        </p>
      </div>

      {/* Qué */}
      <p className={`${cls.lbl} mt-5`} id="lbl-tipo">
        ¿Qué querés vender?
      </p>
      <div role="group" aria-labelledby="lbl-tipo" className="mt-2 flex flex-wrap gap-2">
        {TIPOS.map(({ v, label }) => (
          <button key={v} type="button" aria-pressed={tipo === v} onClick={() => onTipo(v)} className={tipo === v ? chipOn : chipOff}>
            {label}
          </button>
        ))}
      </div>

      {/* Dónde */}
      <p className={`${cls.lbl} mt-5`} id="lbl-barrio">
        ¿En qué barrio?
      </p>
      <div role="group" aria-labelledby="lbl-barrio" className="mt-2 flex flex-wrap gap-2">
        {sugeridos.map((b) => {
          const on = barrio?.id === b.id
          return (
            <button key={b.id} type="button" aria-pressed={on} onClick={() => onBarrio(b)} className={on ? chipOn : chipOff}>
              {b.nombre}
            </button>
          )
        })}
        <button ref={otroRef} type="button" onClick={() => setSelectorAbierto(true)} className={chipMas} aria-haspopup="dialog">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Otro barrio
        </button>
      </div>
      {barrios.length === 0 && (
        <p className="mt-2 text-[13px] font-medium text-[#B7791F]">No pudimos cargar los barrios. Recargá la página para intentar de nuevo.</p>
      )}

      {/* Cuándo: el filtro de intención. El agente atiende primero a "lo antes posible". */}
      <p className={`${cls.lbl} mt-5`} id="lbl-plazo">
        ¿Cuándo pensás vender?
      </p>
      <div role="radiogroup" aria-labelledby="lbl-plazo" className="mt-2 space-y-2">
        {PLAZOS_VENTA.map(({ v, label }) => {
          const on = plazo === v
          return (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onPlazo(v)}
              className={`si-tap flex min-h-[52px] w-full items-center justify-between gap-3 rounded-2xl border-[1.5px] px-4 text-left text-[15.5px] font-semibold transition-colors motion-reduce:transition-none ${
                on ? 'border-[#17613C] bg-[#EAF3ED] text-[#17613C]' : 'border-[#E1E6E1] bg-white text-[#3C4A42] hover:border-[#17613C]/50'
              }`}
            >
              {label}
              {on && <IconoCheck />}
            </button>
          )
        })}
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-[#FFF7E8] px-3.5 py-2.5 text-[13.5px] font-medium text-[#7A5A16]">
          {error}
        </p>
      )}

      <BarraFija>
        <button type="button" onClick={onContinuar} className={cls.cta}>
          Seguir <IconoFlecha />
        </button>
        <p className={`${cls.fine} mt-1.5`}>Un paso más: tu nombre y WhatsApp. Sin compromiso.</p>
      </BarraFija>

      {selectorAbierto && (
        <SelectorBarrios
          barrios={barrios}
          tipo={tipo}
          seleccionado={barrio?.id ?? null}
          onElegir={(b) => {
            onBarrio(b)
            cerrar()
          }}
          onCerrar={cerrar}
        />
      )}
    </>
  )
}
