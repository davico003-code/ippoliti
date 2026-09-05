'use client'

// Paso 1: barrio + tipo + m². Sin pedir datos personales.

import { useId, useRef, useState } from 'react'
import type { BarrioTasacion, TipoTasacion } from '@/lib/tasacion/types'
import { cuentaTipo, M2_FALLBACK, presetsM2, TEXTO_TIPO } from '@/lib/tasacion/formato'
import SelectorBarrios from './SelectorBarrios'
import { BarraFija, cls, IconoFlecha, IconoUbicacion, Spinner } from './ui'

export interface DatosPaso1 {
  barrio: BarrioTasacion | null
  tipo: TipoTasacion
  lote: string
  cubiertos: string
}

interface Props {
  barrios: BarrioTasacion[]
  datos: DatosPaso1
  ciudad: string
  onBarrio: (b: BarrioTasacion) => void
  onTipo: (t: TipoTasacion) => void
  onLote: (v: string) => void
  onCubiertos: (v: string) => void
  onUbicacion: () => void
  geoEstado: 'idle' | 'buscando' | 'ok' | 'fallo'
  onContinuar: () => void
  cargando: boolean
  error: string | null
  tituloRef: React.RefObject<HTMLHeadingElement>
}

const chip = 'si-tap inline-flex h-11 items-center whitespace-nowrap rounded-full border-[1.5px] px-[15px] text-[14.5px] font-semibold transition-colors motion-reduce:transition-none'
const chipOff = `${chip} border-[#E1E6E1] bg-white text-[#3C4A42] hover:border-[#17613C]/50`
const chipOn = `${chip} border-[#17613C] bg-[#17613C] font-bold text-white`
const chipMas = `${chip} gap-1.5 border-dashed border-[#B9C6BD] bg-white text-[#17613C] hover:border-[#17613C]`

function CampoM2({
  id,
  etiqueta,
  ayuda,
  valor,
  presets,
  onChange,
}: {
  id: string
  etiqueta: string
  ayuda: React.ReactNode
  valor: string
  presets: number[]
  onChange: (v: string) => void
}) {
  const n = Number(valor)
  return (
    <div className="mt-3">
      <div className="flex items-baseline gap-2">
        <label htmlFor={id} className="text-[15px] font-bold text-[#121A15]">
          {etiqueta}
        </label>
        <span className="text-[12.5px] font-medium text-[#7C877F]">{ayuda}</span>
      </div>
      <div className="mt-[7px] flex items-center gap-[7px]">
        <div className="relative w-[126px] flex-none">
          <input
            id={id}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            value={valor}
            onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="h-[52px] w-full rounded-[14px] border-[1.5px] border-[#E1E6E1] bg-white pl-4 pr-10 text-center font-poppins text-[22px] font-semibold tracking-[-0.01em] text-[#121A15] focus:border-2 focus:border-[#17613C] focus:outline-none focus-visible:outline-none focus:ring-4 focus:ring-[#17613C]/10"
          />
          <span aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-[#7C877F]">
            m²
          </span>
        </div>
        {presets.map((p) => {
          const on = n === p
          return (
            <button
              key={p}
              type="button"
              aria-pressed={on}
              aria-label={`${p} m²`}
              onClick={() => onChange(String(p))}
              className={`si-tap flex h-11 min-w-0 flex-1 items-center justify-center rounded-xl border-[1.5px] font-poppins text-[15px] transition-colors motion-reduce:transition-none ${
                on ? 'border-[#17613C] bg-[#EAF3ED] font-semibold text-[#17613C]' : 'border-[#E1E6E1] bg-white font-medium text-[#3C4A42] hover:border-[#17613C]/50'
              }`}
            >
              {p}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function Paso1Datos({
  barrios,
  datos,
  ciudad,
  onBarrio,
  onTipo,
  onLote,
  onCubiertos,
  onUbicacion,
  geoEstado,
  onContinuar,
  cargando,
  error,
  tituloRef,
}: Props) {
  const [selectorAbierto, setSelectorAbierto] = useState(false)
  const otroRef = useRef<HTMLButtonElement>(null)
  const idLote = useId()
  const idCub = useId()
  const { barrio, tipo } = datos
  const t = TEXTO_TIPO[tipo]

  // Chips: los 4 barrios de la ciudad con más comparables del tipo elegido.
  // El seleccionado siempre está (aunque no sea top).
  const sugeridos = barrios
    .filter((b) => b.ciudad === ciudad && cuentaTipo(b, tipo) > 0)
    .sort((a, b) => cuentaTipo(b, tipo) - cuentaTipo(a, tipo))
    .slice(0, 4)
  if (barrio && !sugeridos.some((b) => b.id === barrio.id)) {
    if (sugeridos.length >= 4) sugeridos.pop()
    sugeridos.unshift(barrio)
  }

  const presetsLote = presetsM2(barrio?.m2Tipico.lote ?? null, M2_FALLBACK.lote)
  const presetsCub = presetsM2(barrio?.m2Tipico.cubiertos ?? null, M2_FALLBACK.cubiertos)

  const pideLote = tipo !== 'depto'
  const pideCub = tipo !== 'lote'

  const cerrar = () => {
    setSelectorAbierto(false)
    // Devolver el foco al chip que abrió la hoja.
    requestAnimationFrame(() => otroRef.current?.focus())
  }

  return (
    <>
      <h1 ref={tituloRef} tabIndex={-1} className={`${cls.h1} mt-2 outline-none focus-visible:outline-none`}>
        ¿Cuánto vale {t.tuCasa} hoy?
      </h1>
      <p className={`${cls.sub} mt-2.5`}>
        Mirá qué se pide por {t.plural} parecid{tipo === 'casa' ? 'as' : 'os'} a {tipo === 'casa' ? 'la tuya' : 'el tuyo'}, en tu barrio.
      </p>

      {/* Barrio */}
      <div className="mt-[18px] flex items-center justify-between gap-3">
        <p className={cls.lbl} id="lbl-barrio">
          Tu barrio
        </p>
        <button
          type="button"
          onClick={onUbicacion}
          disabled={geoEstado === 'buscando'}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-1.5 text-[12.5px] font-semibold text-[#7C877F] hover:text-[#17613C] disabled:opacity-60"
        >
          <IconoUbicacion />
          {geoEstado === 'buscando' ? 'Buscando…' : geoEstado === 'ok' ? 'Ubicación usada' : 'Usar mi ubicación'}
        </button>
      </div>
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
          {barrio && !sugeridos.some((b) => b.id === barrio.id) ? barrio.nombre : 'Otro barrio'}
        </button>
      </div>
      {barrios.length === 0 && (
        <p className="mt-2 text-[13px] font-medium text-[#B7791F]">
          No pudimos cargar los barrios. Recargá la página para intentar de nuevo.
        </p>
      )}

      {/* Propiedad */}
      <p className={`${cls.lbl} mt-[18px]`}>{tipo === 'casa' ? 'Tu casa' : tipo === 'lote' ? 'Tu lote' : 'Tu depto'}</p>
      {pideLote && (
        <CampoM2
          id={idLote}
          etiqueta="Lote"
          ayuda={
            barrio?.m2Tipico.lote ? (
              <>
                terreno · en {barrio.nombre} suele ser <b className="font-poppins font-semibold text-[#3C4A42]">{barrio.m2Tipico.lote}</b> m²
              </>
            ) : (
              'terreno'
            )
          }
          valor={datos.lote}
          presets={presetsLote}
          onChange={onLote}
        />
      )}
      {pideCub && (
        <CampoM2
          id={idCub}
          etiqueta="Cubiertos"
          ayuda={
            !pideLote && barrio?.m2Tipico.cubiertos ? (
              <>
                lo construido · en {barrio.nombre} suele ser <b className="font-poppins font-semibold text-[#3C4A42]">{barrio.m2Tipico.cubiertos}</b> m²
              </>
            ) : (
              'lo construido'
            )
          }
          valor={datos.cubiertos}
          presets={presetsCub}
          onChange={onCubiertos}
        />
      )}

      <p className="mt-4 text-center text-[12.5px] font-medium text-[#7C877F]">
        {tipo === 'casa' ? (
          <>
            ¿No es una casa?{' '}
            <button type="button" onClick={() => onTipo('lote')} className="min-h-11 font-bold text-[#17613C] underline decoration-[1.5px] underline-offset-[3px]">
              Tasá un lote
            </button>{' '}
            o{' '}
            <button type="button" onClick={() => onTipo('depto')} className="min-h-11 font-bold text-[#17613C] underline decoration-[1.5px] underline-offset-[3px]">
              un depto
            </button>
          </>
        ) : (
          <>
            ¿Es otra cosa?{' '}
            <button type="button" onClick={() => onTipo('casa')} className="min-h-11 font-bold text-[#17613C] underline decoration-[1.5px] underline-offset-[3px]">
              Tasá una casa
            </button>{' '}
            o{' '}
            <button
              type="button"
              onClick={() => onTipo(tipo === 'lote' ? 'depto' : 'lote')}
              className="min-h-11 font-bold text-[#17613C] underline decoration-[1.5px] underline-offset-[3px]"
            >
              {tipo === 'lote' ? 'un depto' : 'un lote'}
            </button>
          </>
        )}
      </p>

      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-[#FFF7E8] px-3.5 py-2.5 text-[13.5px] font-medium text-[#7A5A16]">
          {error}
        </p>
      )}

      <BarraFija>
        <button type="button" onClick={onContinuar} disabled={cargando} className={cls.cta} aria-busy={cargando}>
          {cargando ? (
            <>
              <Spinner /> Buscando en tu barrio…
            </>
          ) : (
            <>
              Ver qué se pide en mi barrio <IconoFlecha />
            </>
          )}
        </button>
        <p className={`${cls.fine} mt-1.5`}>Al instante. No te pedimos datos.</p>
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
