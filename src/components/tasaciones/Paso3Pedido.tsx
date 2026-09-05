'use client'

// Paso 3: nombre + WhatsApp. Nada más. El pedido va a Hilo; no abre WhatsApp.

import { useId, useState } from 'react'
import type { TipoTasacion } from '@/lib/tasacion/types'
import { celularArValido, normalizarCelularAr, TEXTO_TIPO } from '@/lib/tasacion/formato'
import { AvisoPocosDatos, BarraFija, cls, IconoCheck, IconoEnviar, PillResumen, Spinner, TarjetaConfianza, Volver } from './ui'

interface Props {
  resumen: string
  /** Nivel 4: se llega directo desde el paso 1, sin rango. Se avisa arriba del
   *  formulario, sin ningún número. */
  pocosDatos?: { barrio: string; tipo: TipoTasacion } | null
  textoVolver?: string
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

export default function Paso3Pedido({
  resumen,
  pocosDatos,
  textoVolver = 'Volver',
  nombre,
  whatsapp,
  onNombre,
  onWhatsapp,
  onEnviar,
  enviando,
  error,
  onVolver,
  tituloRef,
}: Props) {
  const idNombre = useId()
  const idTel = useId()
  const idErrTel = useId()
  const idErrNombre = useId()
  const [tocado, setTocado] = useState(false)

  const digitos = normalizarCelularAr(whatsapp)
  const telValido = celularArValido(digitos)
  const nombreValido = nombre.trim().length >= 2
  // Mensajes inline bajo cada campo (control en prod, 5-sep-2026): al tocar "Pedir mi
  // tasación" con el nombre vacío solo se enfocaba el campo y, con el teclado abierto,
  // parecía que el botón no había andado. Vacío y mal cargado dicen cosas distintas.
  const errTel = !tocado || telValido ? null : digitos === '' ? 'Necesitamos tu WhatsApp para mandarte la tasación.' : 'Son 10 dígitos con el código de área (341, 3476…), sin el 15.'
  const errNombre = tocado && !nombreValido ? 'Poné tu nombre para saber a quién escribirle.' : null

  // Foco en el primer inválido y lo trae a la vista: con el teclado abierto el campo
  // puede quedar tapado y el mensaje de error, fuera de pantalla.
  const irA = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    el.focus()
    el.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setTocado(true)
    if (!nombreValido) {
      irA(idNombre)
      return
    }
    if (!telValido) {
      irA(idTel)
      return
    }
    onEnviar()
  }

  return (
    <>
      <Volver onClick={onVolver}>{textoVolver}</Volver>
      <h1 ref={tituloRef} tabIndex={-1} className={`${cls.h2} outline-none focus-visible:outline-none`}>
        Pedí tu tasación
      </h1>
      {pocosDatos && (
        <AvisoPocosDatos>
          Todavía no tenemos suficientes {TEXTO_TIPO[pocosDatos.tipo].plural} {TEXTO_TIPO[pocosDatos.tipo].parecidas} en{' '}
          <b className="font-bold text-[#121A15]">{pocosDatos.barrio}</b>. Un tasador del equipo te lo calcula.
        </AvisoPocosDatos>
      )}
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
        <p id={idErrTel} className={`mt-1.5 text-[13px] font-medium ${errTel ? 'text-[#C2410C]' : 'text-[#6B766E]'}`}>
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
        <p className="mt-3 text-center text-[12.5px] font-medium text-[#6B766E]">Tus datos se usan solo para esta tasación.</p>

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
