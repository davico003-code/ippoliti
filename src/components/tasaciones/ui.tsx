'use client'

// Piezas compartidas del flujo de tasación: barra fija inferior con el CTA,
// tarjeta del equipo, pill de resumen, íconos. Tokens del mockup aprobado.

import Image from 'next/image'
import type { ReactNode } from 'react'

export const VERDE = '#17613C'

export const cls = {
  h1: 'font-poppins text-[29px] font-extrabold leading-[1.12] tracking-[-0.025em] text-[#121A15]',
  h2: 'font-poppins text-[26px] font-extrabold leading-[1.15] tracking-[-0.02em] text-[#121A15]',
  lbl: 'font-poppins text-[12px] font-semibold uppercase tracking-[0.09em] text-[#7C877F]',
  sub: 'text-[15px] leading-[1.4] font-medium text-[#3C4A42]',
  fine: 'text-center text-[12.5px] font-medium text-[#7C877F]',
  cta: 'si-tap flex h-[52px] w-full items-center justify-center gap-2.5 rounded-2xl bg-[#17613C] font-poppins text-[17px] font-semibold tracking-[-0.01em] text-white shadow-[0_10px_22px_-10px_rgba(23,97,60,0.6)] transition-colors hover:bg-[#0E4529] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none',
}

export function IconoFlecha() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export function IconoEnviar() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 3L10 14" />
      <path d="M21 3l-7 18-4-7-7-4z" />
    </svg>
  )
}

export function IconoCheck({ className = 'h-[18px] w-[18px]' }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5" />
    </svg>
  )
}

export function IconoCasa() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[15px] w-[15px] flex-none text-[#17613C]" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
    </svg>
  )
}

export function IconoUbicacion() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      <circle cx="12" cy="12" r="8" />
    </svg>
  )
}

export function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none"
    />
  )
}

/** Barra fija arriba del borde inferior (safe-area incluida). El contenido de
 *  cada paso deja padding-bottom para que nunca quede tapado. */
export function BarraFija({ children }: { children: ReactNode }) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E1E6E1] bg-white/95 shadow-[0_-10px_24px_-18px_rgba(18,30,22,0.25)] backdrop-blur"
      style={{ paddingBottom: 'calc(10px + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="mx-auto max-w-[520px] px-5 pt-2.5">{children}</div>
    </div>
  )
}

export function FotoDavid({ size, className = '' }: { size: number; className?: string }) {
  return (
    <Image
      src="/team/david-flores.jpg"
      alt="David Flores, corredor responsable de SI Inmobiliaria"
      width={size}
      height={size}
      sizes={`${size}px`}
      className={`flex-none rounded-full object-cover ${className}`}
      style={{ width: size, height: size, objectPosition: '50% 20%' }}
    />
  )
}

/** Tarjeta verde "¿Y la tuya?" del paso 2 (también en nivel 4). */
export function TarjetaEquipo({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <section
      aria-label="Quién hace la tasación"
      className="mt-5 flex items-start gap-3.5 rounded-[22px] bg-[#EAF3ED] p-[18px]"
    >
      <FotoDavid size={54} className="border-[2.5px] border-white shadow-[0_2px_8px_rgba(18,30,22,0.15)]" />
      <div>
        <h3 className="font-poppins text-[18px] font-semibold leading-[1.2] tracking-[-0.015em] text-[#121A15]">{titulo}</h3>
        <p className="mt-1.5 text-[14.5px] font-medium leading-[1.45] text-[#3C4A42]">{texto}</p>
        <p className="mt-2 font-poppins text-[11px] font-semibold uppercase tracking-[0.08em] text-[#17613C]">
          SI Inmobiliaria · David Flores, corredor responsable · Mat. 0621
        </p>
      </div>
    </section>
  )
}

/** Tarjeta de confianza del paso 3. */
export function TarjetaConfianza() {
  return (
    <section
      aria-label="Quién te atiende"
      className="mt-3.5 flex items-center gap-3.5 rounded-[18px] border-[1.5px] border-[#E1E6E1] bg-white px-4 py-[13px]"
    >
      <FotoDavid size={60} className="border-[2.5px] border-[#D7E8DD]" />
      <div className="flex-1 min-w-0">
        <p className="mb-0.5 font-poppins text-[11px] font-semibold uppercase tracking-[0.09em] text-[#7C877F]">Te atiende</p>
        <p className="font-poppins text-[16px] font-semibold leading-tight tracking-[-0.01em] text-[#121A15]">El equipo de SI Inmobiliaria</p>
        <p className="mt-0.5 text-[13.5px] font-medium text-[#3C4A42]">
          David Flores, corredor responsable · Mat. <span className="font-poppins font-semibold">0621</span>
        </p>
        <p className="mt-1.5 border-t border-[#E1E6E1] pt-1.5 text-[13px] font-bold text-[#17613C]">
          SI Inmobiliaria · desde <span className="font-poppins">1983</span>
        </p>
      </div>
    </section>
  )
}

export function PillResumen({ texto }: { texto: string }) {
  return (
    <p className="mt-3 inline-flex max-w-full items-center gap-2 rounded-full bg-[#F2F4F0] px-[13px] py-2 text-[13px] font-semibold text-[#3C4A42]">
      <IconoCasa />
      <span className="truncate">{texto}</span>
    </p>
  )
}

/** Link discreto para volver al paso anterior. */
export function Volver({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="-ml-2 inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-[13.5px] font-semibold text-[#7C877F] hover:text-[#17613C]"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 5l-7 7 7 7" />
      </svg>
      {children}
    </button>
  )
}
