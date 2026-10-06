'use client'

// "Tu presupuesto" (David, 6-oct-2026: "preguntarle cuál es su presupuesto y
// mostrarle un 15 % por encima y por debajo, y autocompletar fácilmente cuando
// está escribiendo"). Escribe el número que tiene en la cabeza; mientras
// escribe, abajo aparece lo que quiso decir ("25" → 250.000) y se aplica la
// primera. Vacío = sin presupuesto (todas), con atajos de un toque. Lo usan
// "Conocé tu próximo hogar" y "Afiná tu búsqueda" adentro del mazo (oscuro).

import { useEffect, useRef, useState } from 'react'
import { type TipoHogar, BANDA_TOPE, formatearPresupuesto, presupuestoRaro, sugerirPresupuestos, textoTope } from '@/lib/feed-en-red'
import { cls } from '@/components/tasaciones/ui'

/** Lo que se aplica con lo escrito: la sugerencia más probable (null = sin presupuesto). */
const interpretar = (texto: string, tipo: TipoHogar) => (/\d/.test(texto) ? sugerirPresupuestos(texto, tipo)[0] ?? null : null)

export default function CampoPresupuesto({
  tipo,
  valor,
  onChange,
  oscuro = false,
  demoraMs = 900,
}: {
  tipo: TipoHogar
  valor: number | null
  onChange: (v: number | null) => void
  oscuro?: boolean
  /** Mientras escribe, se aplica después de esta pausa (David 6-oct: "dejá que escriba un poco más"). */
  demoraMs?: number
}) {
  const [texto, setTexto] = useState(() => (valor ? formatearPresupuesto(String(valor)) : ''))
  const espera = useRef<number | null>(null)
  // Si lo cambian de afuera ("Cualquier precio", otro tipo), la casilla lo muestra; lo que escribe no se pisa.
  useEffect(() => {
    if (valor !== interpretar(texto, tipo)) setTexto(valor ? formatearPresupuesto(String(valor)) : '')
    // Solo cuando cambia el valor de afuera.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor])
  useEffect(() => () => void (espera.current && window.clearTimeout(espera.current)), [])

  const aplicar = (v: number | null, ya: boolean) => {
    if (espera.current) window.clearTimeout(espera.current)
    espera.current = null
    if (ya || !demoraMs) return onChange(v)
    // Lo raro para el tipo ("25.000" en casas) casi siempre está a mitad de escribir: espera más.
    espera.current = window.setTimeout(
      () => {
        espera.current = null
        onChange(v)
      },
      presupuestoRaro(v, tipo) ? demoraMs * 2.2 : demoraMs,
    )
  }
  // Sale de la casilla (o toca "Ver casas" enseguida: el blur llega antes del click):
  // se aplica ya lo pendiente y se ve completo lo que se aplicó ("25" → "250.000").
  const alSalir = () => {
    const v = interpretar(texto, tipo)
    if (espera.current || v !== valor) aplicar(v, true)
    if (v) setTexto(formatearPresupuesto(String(v)))
  }
  const escribir = (t: string) => {
    const f = formatearPresupuesto(t)
    setTexto(f)
    const digitos = f.replace(/\D/g, '').length
    // Con un solo dígito no se adivina nada ("3": ¿30 mil o 300 mil?): espera a que siga o salga de la casilla.
    if (digitos === 1) return aplicar(valor, true)
    aplicar(interpretar(f, tipo), false)
  }
  const elegir = (v: number) => {
    setTexto(formatearPresupuesto(String(v)))
    aplicar(v, true)
  }

  const sugerencias = sugerirPresupuestos(texto, tipo)
  const id = oscuro ? 'presupuesto-afinar' : 'presupuesto-hogar'
  const lbl = oscuro ? 'block text-[13px] font-bold uppercase tracking-wider text-white/60' : `block ${cls.lbl}`
  const caja = oscuro
    ? 'bg-white/10 text-white placeholder:text-white/40 focus:shadow-[0_0_0_2px_rgba(255,255,255,0.5)]'
    : 'bg-[#F1F3F1] text-[#121A15] placeholder:text-[#8A958D] focus:bg-white focus:shadow-[0_0_0_2px_#17613C]'
  const chip = (on: boolean) =>
    oscuro
      ? `h-10 rounded-full px-3.5 font-numeric text-[15px] font-semibold border transition-colors ${on ? 'border-transparent bg-[#17613C] text-white' : 'border-white/20 text-white/85 hover:border-white/40'}`
      : `si-tap h-10 rounded-full px-3.5 font-numeric text-[15px] font-semibold border-[1.5px] transition-colors ${on ? 'border-[#17613C] bg-[#17613C] text-white' : 'border-[#E1E6E1] bg-white text-[#3C4A42] hover:border-[#17613C]/50'}`

  return (
    <div className={oscuro ? 'mt-4' : 'mt-5'}>
      <label htmlFor={id} className={lbl}>
        Tu presupuesto (dólares)
      </label>
      <div className="relative mt-2">
        <span aria-hidden="true" className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[15px] font-semibold ${oscuro ? 'text-white/50' : 'text-[#8A958D]'}`}>
          USD
        </span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          enterKeyHint="done"
          placeholder="Ej: 250.000"
          value={texto}
          onChange={(e) => escribir(e.target.value)}
          onBlur={alSalir}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          className={`h-11 w-full rounded-[12px] pl-[52px] pr-11 font-numeric text-[16px] font-semibold tabular-nums outline-none ${caja}`}
        />
        {texto && (
          <button
            type="button"
            onClick={() => (setTexto(''), aplicar(null, true))}
            aria-label="Borrar presupuesto"
            className={`absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full ${oscuro ? 'text-white/60' : 'text-[#5B665F]'}`}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        )}
      </div>
      {/* Vacío: atajos. Escribiendo: lo que quiso decir (la primera es la que se aplica). */}
      <div className="mt-2 flex flex-wrap gap-2">
        {sugerencias.map((v) => (
          <button key={v} type="button" aria-pressed={v === valor} onClick={() => elegir(v)} className={chip(v === valor)}>
            {formatearPresupuesto(String(v))}
          </button>
        ))}
      </div>
      {valor != null && (
        <p aria-live="polite" className={`mt-1.5 text-[14px] font-medium ${oscuro ? 'text-white/60' : 'text-[#5B665F]'}`}>
          Te mostramos de <span className="font-numeric">{textoTope(valor * BANDA_TOPE.min)}</span> a{' '}
          <span className="font-numeric">{textoTope(valor * BANDA_TOPE.max).replace('USD ', '')}</span>.
        </p>
      )}
    </div>
  )
}
