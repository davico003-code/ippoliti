'use client'

import { MapPin } from 'lucide-react'
import { listaBarrios } from '@/lib/barrios-parecidos'
import { VERDE } from './marca-mazo'

/**
 * Al terminar un barrio con parecidos: la PREGUNTA (David 4-oct: "mostrale
 * alguno parecido, pero primero preguntale"). Nunca se suman solas.
 */
export default function PreguntaParecidos({
  barrio,
  parecidos,
  estado,
  onSi,
  onNo,
}: {
  barrio: string | null
  parecidos: string[]
  estado: 'pendiente' | 'cargando' | 'sumados' | 'vacio' | 'no'
  onSi: () => void
  onNo: () => void
}) {
  if (estado === 'vacio') {
    return (
      <div className="text-center">
        <p className="text-xl font-black text-gray-900 font-raleway">Por ahora no hay otras</p>
        <p className="text-[16px] text-gray-600 mt-2">
          No encontramos casas en {listaBarrios(parecidos)} con lo que buscás. Te avisamos cuando entre alguna.
        </p>
        <button type="button" onClick={onNo} className="mt-5 w-full h-12 rounded-2xl text-white font-bold" style={{ background: VERDE }}>
          Seguir
        </button>
      </div>
    )
  }
  const cargando = estado === 'cargando'
  return (
    <div className="text-center">
      <div className="mx-auto w-12 h-12 rounded-full grid place-items-center" style={{ background: '#EAF3EE', color: VERDE }} aria-hidden="true">
        <MapPin className="w-6 h-6" />
      </div>
      <p className="mt-3 text-xl font-black text-gray-900 font-raleway [text-wrap:balance]">¿Te muestro casas en barrios parecidos?</p>
      <p className="text-[16px] text-gray-600 mt-2">{barrio ? `Ya viste las de ${barrio}. ` : ''}Estos barrios se le parecen:</p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {parecidos.map((b) => (
          <span key={b} className="inline-flex items-center h-9 px-3.5 rounded-full border border-gray-200 bg-gray-50 text-[15px] font-semibold text-gray-800">
            {b}
          </span>
        ))}
      </div>
      <button
        type="button"
        onClick={onSi}
        disabled={cargando}
        className="mt-6 w-full h-12 rounded-2xl text-white font-bold disabled:opacity-70"
        style={{ background: VERDE }}
      >
        {cargando ? 'Buscando…' : 'Sí, mostrame'}
      </button>
      <button type="button" onClick={onNo} disabled={cargando} className="mt-2 w-full h-12 rounded-2xl border border-gray-200 text-gray-800 font-semibold">
        No, gracias
      </button>
    </div>
  )
}
