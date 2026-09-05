'use client'

// "Otro barrio": hoja con buscador y TODOS los barrios agrupados por ciudad.

import { useEffect, useMemo, useRef, useState } from 'react'
import type { BarrioTasacion, TipoTasacion } from '@/lib/tasacion/types'
import { cuentaTipo } from '@/lib/tasacion/formato'

interface Props {
  barrios: BarrioTasacion[]
  tipo: TipoTasacion
  seleccionado: string | null
  onElegir: (b: BarrioTasacion) => void
  onCerrar: () => void
}

const ORDEN_CIUDAD = ['Funes', 'Roldán', 'Rosario']

function normalizar(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

export default function SelectorBarrios({ barrios, tipo, seleccionado, onElegir, onCerrar }: Props) {
  const [q, setQ] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [onCerrar])

  const grupos = useMemo(() => {
    const nq = normalizar(q.trim())
    const filtrados = nq ? barrios.filter((b) => normalizar(b.nombre).includes(nq)) : barrios
    const porCiudad = new Map<string, BarrioTasacion[]>()
    for (const b of filtrados) {
      const lista = porCiudad.get(b.ciudad) ?? []
      lista.push(b)
      porCiudad.set(b.ciudad, lista)
    }
    const ciudades = Array.from(porCiudad.keys()).sort((a, b) => {
      const ia = ORDEN_CIUDAD.indexOf(a)
      const ib = ORDEN_CIUDAD.indexOf(b)
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b)
    })
    return ciudades.map((c) => ({
      ciudad: c,
      barrios: (porCiudad.get(c) ?? []).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
    }))
  }, [barrios, q])

  return (
    <div
      className="fixed inset-0 z-50 bg-[#121A15]/45"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="selector-barrios-titulo"
        className="absolute inset-x-0 bottom-0 top-[6vh] mx-auto flex max-w-[560px] flex-col rounded-t-[26px] bg-white shadow-2xl"
      >
        <div className="px-5 pt-4">
          <div className="flex items-center justify-between">
            <h2 id="selector-barrios-titulo" className="font-poppins text-[20px] font-extrabold tracking-[-0.02em] text-[#121A15]">
              ¿En qué barrio está?
            </h2>
            <button
              type="button"
              onClick={onCerrar}
              aria-label="Cerrar"
              className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-[#3C4A42] hover:bg-[#F2F4F0]"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <label htmlFor="buscar-barrio" className="sr-only">
            Buscar barrio
          </label>
          <input
            ref={inputRef}
            id="buscar-barrio"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Escribí el nombre del barrio"
            autoComplete="off"
            enterKeyHint="search"
            className="mt-3 h-[50px] w-full rounded-2xl border-[1.5px] border-[#E1E6E1] bg-white px-4 text-[16px] font-medium text-[#121A15] placeholder:text-[#A6AFAA] focus:border-[#17613C] focus:outline-none focus:ring-4 focus:ring-[#17613C]/10"
          />
        </div>

        <div className="mt-2 flex-1 overflow-y-auto px-3 pb-6" style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}>
          {grupos.length === 0 && (
            <p className="px-2 py-6 text-center text-[14px] font-medium text-[#7C877F]">
              No encontramos ese barrio. Probá con otro nombre o elegí la ciudad.
            </p>
          )}
          {grupos.map((g) => (
            <section key={g.ciudad} aria-labelledby={`ciudad-${g.ciudad}`} className="mt-3">
              <h3 id={`ciudad-${g.ciudad}`} className="px-2 pb-1 font-poppins text-[12px] font-semibold uppercase tracking-[0.09em] text-[#7C877F]">
                {g.ciudad}
              </h3>
              <ul className="divide-y divide-[#F0F2EE]">
                {g.barrios.map((b) => {
                  const activo = b.id === seleccionado
                  const n = cuentaTipo(b, tipo)
                  return (
                    <li key={b.id}>
                      <button
                        type="button"
                        onClick={() => onElegir(b)}
                        aria-pressed={activo}
                        className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-[#F2F4F0] ${activo ? 'text-[#17613C]' : 'text-[#121A15]'}`}
                      >
                        <span className="text-[15.5px] font-semibold">
                          {b.nombre}
                          {b.esCerrado && <span className="ml-2 text-[12px] font-semibold text-[#7C877F]">cerrado</span>}
                        </span>
                        {n === 0 ? (
                          <span className="text-[12px] font-medium text-[#A6AFAA]">pocos datos</span>
                        ) : activo ? (
                          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 flex-none" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12l5 5 9-10" />
                          </svg>
                        ) : null}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
