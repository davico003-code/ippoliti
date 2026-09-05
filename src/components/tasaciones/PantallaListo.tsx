'use client'

// Pantalla final. No abre WhatsApp: el equipo escribe.

import Link from 'next/link'
import { cls, IconoCheck, PillResumen } from './ui'

interface Props {
  nombre: string
  resumen: string
  tituloRef: React.RefObject<HTMLHeadingElement>
}

export default function PantallaListo({ nombre, resumen, tituloRef }: Props) {
  const primerNombre = nombre.trim().split(/\s+/)[0]
  return (
    <div className="pt-6">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF3ED] text-[#17613C]">
        <IconoCheck className="h-9 w-9" />
      </span>
      <h1 ref={tituloRef} tabIndex={-1} className={`${cls.h1} mt-5 outline-none focus-visible:outline-none`}>
        Listo, {primerNombre}.
      </h1>
      <p className={`${cls.sub} mt-2.5 text-[17px]`}>
        Te escribimos por WhatsApp en menos de <span className="font-poppins font-semibold text-[#121A15]">24 h</span>.
      </p>
      <PillResumen texto={resumen} />
      <p className="mt-6 text-[14.5px] font-medium leading-[1.5] text-[#3C4A42]">
        Un tasador del equipo revisa lo que se vendió de verdad en tu zona y te manda el número por WhatsApp. Sin compromiso.
      </p>
      <p className="mt-2 text-[12.5px] font-medium text-[#7C877F]">SI Inmobiliaria · desde 1983 · David Flores, corredor responsable · Mat. 0621</p>
      <Link
        href="/"
        className="si-tap mt-8 inline-flex h-12 items-center justify-center rounded-2xl border-[1.5px] border-[#E1E6E1] bg-white px-5 text-[15px] font-bold text-[#17613C] hover:border-[#17613C]"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
