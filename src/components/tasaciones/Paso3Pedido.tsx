'use client'

// Paso 3: nombre + WhatsApp. Nada más. El pedido va a Hilo; no abre WhatsApp.

import { useId, useState } from 'react'
import { celularArValido, normalizarCelularAr } from '@/lib/tasacion/formato'
import { BarraFija, cls, IconoCheck, IconoEnviar, PillResumen, Spinner, TarjetaConfianza, Volver } from './ui'

interface Props {
  resumen: string
  nombre: string
  whatsapp: string
  onNombre: (v: string) => void
  onWhatsapp: (v: string) => void
  onEnviar: () => void
  enviando: boolean
  error: string | null
  onVolver: () => void
  tituloRef: React.RefObject<HTMLHeadingElement>
}

const input =
  'h-[54px] w-full rounded-2xl border-[1.5px] border-[#E1E6E1] bg-white px-4 text-[16px] font-medium text-[#121A15] placeholder:text-[#A6AFAA] focus:border-2 focus:border-[#17613C] focus:outline-none focus-visible:outline-none focus:ring-4 focus:ring-[#17613C]/10 aria-[invalid=true]:border-[#C2410C]'

export default function Paso3Pedido({ resumen, nombre, whatsapp, onNombre, onWhatsapp, onEnviar, enviando, error, onVolver, tituloRef }: Props) {
  const idNombre = useId()
  const idTel = useId()
  const idErrTel = useId()
  const idErrNombre = useId()
  const [tocado, setTocado] = useState(false)

  const digitos = normalizarCelularAr(whatsapp)
  const telValido = celularArValido(digitos)
  const nombreValido = nombre.trim().length >= 2
  const errTel = tocado && !telValido ? 'Son 10 dígitos con el código de área (341, 3476…), sin el 15.' : null
  const errNombre = tocado && !nombreValido ? 'Contanos tu nombre.' : null

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setTocado(true)
    if (!nombreValido) {
      document.getElementById(idNombre)?.focus()
      return
    }
    if (!telValido) {
      document.getElementById(idTel)?.focus()
      return
    }
    onEnviar()
  }

  return (
    <>
      <Volver onClick={onVolver}>Volver</Volver>
      <h1 ref={tituloRef} tabIndex={-1} className={`${cls.h2} outline-none focus-visible:outline-none`}>
        Pedí tu tasación
      </h1>
      <PillResumen texto={resumen} />
      <TarjetaConfianza />

      <form id="form-pedido" onSubmit={submit} noValidate>
        <label htmlFor={idNombre} className="mt-4 block font-poppins text-[13.5px] font-semibold text-[#3C4A42]">
          Nombre
        </label>
        <input
          id={idNombre}
          name="nombre"
          type="text"
          autoComplete="given-name"
          autoCapitalize="words"
          enterKeyHint="next"
          value={nombre}
          onChange={(e) => onNombre(e.target.value.slice(0, 80))}
          placeholder="¿Cómo te llamás?"
          aria-invalid={errNombre ? true : undefined}
          aria-describedby={errNombre ? idErrNombre : undefined}
          className={`${input} mt-1.5`}
        />
        {errNombre && (
          <p id={idErrNombre} className="mt-1.5 text-[13px] font-medium text-[#C2410C]">
            {errNombre}
          </p>
        )}

        <label htmlFor={idTel} className="mt-4 block font-poppins text-[13.5px] font-semibold text-[#3C4A42]">
          WhatsApp
        </label>
        <div className="relative mt-1.5">
          <span aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 border-r-[1.5px] border-[#E1E6E1] pr-3 font-poppins text-[16px] font-semibold text-[#3C4A42]">
            +54 9
          </span>
          <input
            id={idTel}
            name="whatsapp"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            enterKeyHint="send"
            value={whatsapp}
            onChange={(e) => onWhatsapp(e.target.value.replace(/[^\d\s-]/g, '').slice(0, 16))}
            placeholder="341 …"
            aria-label="WhatsApp, sin el +54 9"
            aria-invalid={errTel ? true : undefined}
            aria-describedby={idErrTel}
            className={`${input} pl-[92px] font-poppins`}
          />
        </div>
        <p id={idErrTel} className={`mt-1.5 text-[13px] font-medium ${errTel ? 'text-[#C2410C]' : 'text-[#7C877F]'}`}>
          {errTel ?? 'Código de área + número, sin el 15. Ej.: 341 555 1234.'}
        </p>

        {/* Honeypot anti-bot: invisible y fuera del tab order. */}
        <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
          <label htmlFor="website">Sitio web</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>

        <ul className="mt-4 space-y-2">
          {['Te escribimos por WhatsApp en menos de 24 h', 'No te llamamos', 'Sin compromiso'].map((txt) => (
            <li key={txt} className="flex items-start gap-2.5 text-[14.5px] font-semibold leading-[1.35] text-[#3C4A42]">
              <span className="mt-px flex-none text-[#17613C]">
                <IconoCheck />
              </span>
              {txt}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-center text-[12.5px] font-medium text-[#7C877F]">Tus datos se usan solo para esta tasación.</p>

        {error && (
          <p role="alert" className="mt-3 rounded-xl border border-[#F3E2BF] bg-[#FFF7E8] px-3.5 py-2.5 text-[13.5px] font-medium text-[#7A5A16]">
            {error}
          </p>
        )}
      </form>

      <BarraFija>
        <button type="submit" form="form-pedido" disabled={enviando} aria-busy={enviando} className={cls.cta}>
          {enviando ? (
            <>
              <Spinner /> Enviando…
            </>
          ) : (
            <>
              Pedir mi tasación <IconoEnviar />
            </>
          )}
        </button>
      </BarraFija>
    </>
  )
}
