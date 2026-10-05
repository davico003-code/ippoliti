'use client'

import { useState } from 'react'
import { type BarrioHogar, type TipoHogar, TOPES_HOGAR, textoTope } from '@/lib/feed-en-red'

/**
 * AFINÁ TU BÚSQUEDA (David 5-oct: "en qué momento puede cambiar el criterio de
 * búsqueda… quizá cuando va a cerrar podemos pedirle que afine más y seguimos
 * mostrándole"). Desde el ícono de arriba a la derecha en cualquier momento y,
 * si se va sin ♥, al tocar la X ('salir': "¿Afinamos la búsqueda?"). Lo elige
 * acá y "Conocé tu próximo hogar" vuelve a buscar sin cerrar el mazo.
 */
export type ValoresAfinar = { zona: string; tope: number | null; dorm: number | null; barrio: BarrioHogar | null }

export type AfinarMazo = {
  tipo: TipoHogar
  valores: ValoresAfinar
  /** Ciudades para elegir (y el barrio que eligió, si no es una ciudad). */
  zonas: string[]
  /** El barrio cerrado/abierto solo cuenta buscando en una ciudad. */
  esCiudad: (zona: string) => boolean
  onAplicar: (v: ValoresAfinar) => void
  /** 'buscando' mientras trae las nuevas; 'vacio' = con eso no hay. */
  estado: 'listo' | 'buscando' | 'vacio'
}

const DORMS = [2, 3, 4] as const

export default function AfinarBusqueda({ afinar, modo, onCerrar, onSalir }: { afinar: AfinarMazo; modo: 'boton' | 'salir'; onCerrar: () => void; onSalir: () => void }) {
  const [v, setV] = useState<ValoresAfinar>(afinar.valores)
  const topes = TOPES_HOGAR[afinar.tipo]
  const ciudad = afinar.esCiudad(v.zona)
  const chip = (on: boolean) =>
    `h-10 rounded-full px-3.5 text-[15px] font-semibold border transition-colors ${on ? 'bg-[#1A5C38] border-[#1A5C38] text-white' : 'border-white/20 text-white/85 hover:border-white/40'}`
  const salirTexto = modo === 'salir' ? 'Salir igual' : 'Ahora no'

  return (
    <div className="absolute inset-0 z-30 flex items-end bg-black/50" onClick={(e) => e.target === e.currentTarget && onCerrar()}>
      <div
        className="w-full max-h-full overflow-y-auto rounded-t-[26px] bg-[#151515] px-5 pt-4 pb-[max(22px,env(safe-area-inset-bottom))] text-white"
        role="dialog"
        aria-modal="true"
        aria-label="Afiná tu búsqueda"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded bg-white/25" />
        <h3 className="text-[21px] font-black font-raleway">{modo === 'salir' ? '¿Afinamos la búsqueda?' : 'Afiná tu búsqueda'}</h3>
        <p className="mt-1 text-[15px] text-white/65">
          {modo === 'salir' ? 'Contanos un poco más y te mostramos otras.' : 'Te mostramos las que van con lo que buscás.'}
        </p>

        <fieldset className="mt-4">
          <legend className="mb-2 text-[12px] font-bold uppercase tracking-wider text-white/55">Dónde</legend>
          <div className="flex flex-wrap gap-2">
            {afinar.zonas.map((z) => (
              <button key={z} type="button" aria-pressed={v.zona === z} onClick={() => setV((x) => ({ ...x, zona: z, barrio: afinar.esCiudad(z) ? x.barrio : null }))} className={chip(v.zona === z)}>
                {z}
              </button>
            ))}
          </div>
        </fieldset>

        {ciudad && (
          <fieldset className="mt-4">
            <legend className="mb-2 text-[12px] font-bold uppercase tracking-wider text-white/55">Barrio</legend>
            <div className="flex flex-wrap gap-2">
              {([null, 'cerrado', 'abierto'] as const).map((b) => (
                <button key={b ?? 'igual'} type="button" aria-pressed={v.barrio === b} onClick={() => setV((x) => ({ ...x, barrio: b }))} className={chip(v.barrio === b)}>
                  {b === 'cerrado' ? 'Cerrado' : b === 'abierto' ? 'Abierto' : 'Me da igual'}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <fieldset className="mt-4">
          <legend className="mb-2 text-[12px] font-bold uppercase tracking-wider text-white/55">Hasta</legend>
          <div className="flex flex-wrap gap-2">
            {topes.map((t) => (
              <button key={t} type="button" aria-pressed={v.tope === t} onClick={() => setV((x) => ({ ...x, tope: t }))} className={chip(v.tope === t)}>
                {textoTope(t)}
              </button>
            ))}
            <button type="button" aria-pressed={v.tope == null} onClick={() => setV((x) => ({ ...x, tope: null }))} className={chip(v.tope == null)}>
              Sin tope
            </button>
          </div>
        </fieldset>

        {afinar.tipo !== 'lot' && (
          <fieldset className="mt-4">
            <legend className="mb-2 text-[12px] font-bold uppercase tracking-wider text-white/55">Dormitorios</legend>
            <div className="flex flex-wrap gap-2">
              {DORMS.map((d) => (
                <button key={d} type="button" aria-pressed={v.dorm === d} onClick={() => setV((x) => ({ ...x, dorm: x.dorm === d ? null : d }))} className={chip(v.dorm === d)}>
                  {d} o más
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <button
          type="button"
          onClick={() => afinar.onAplicar(v)}
          className="mt-6 h-12 w-full rounded-2xl bg-[#1A5C38] text-[16px] font-bold text-white"
        >
          Seguir viendo
        </button>
        <button type="button" onClick={onSalir} className="mx-auto mt-3 block text-[15px] font-semibold text-white/60">
          {salirTexto}
        </button>
      </div>
    </div>
  )
}
