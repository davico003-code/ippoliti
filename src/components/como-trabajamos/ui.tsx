// Piezas compartidas de /como-trabajamos: paleta, contenedor, encabezados y
// botones. Server components (sin estado).

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const VERDE = '#1A5C38'
export const VERDE_OSCURO = '#0E3521'
export const ACENTO = '#00754A'
export const MENTA = '#9FD9B9'
export const TINTA = '#111213'
export const GRIS = '#5b6170'
export const TEXTO = '#3d4247'
export const FONDO = '#F7F8F7'
export const VERDE_SUAVE = '#EAF3EE'
export const BORDE = 'rgba(17,18,19,.07)'

/** Envuelve cada tira de dígitos en Poppins tabular (regla: números en Poppins). */
export function conNumeros(texto: string) {
  return texto.split(/(\d[\d.,]*)/).map((t, i) => (i % 2 ? <span key={i} className="font-numeric">{t}</span> : t))
}

export function Contenedor({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1200px] px-4 sm:px-6 md:px-10 ${className}`}>{children}</div>
}

/** Eyebrow + título + bajada. `oscuro` para secciones sobre fondo verde. */
export function Encabezado({
  id,
  eyebrow,
  titulo,
  bajada,
  oscuro = false,
  centrado = false,
  className = '',
}: {
  id?: string
  eyebrow: string
  titulo: React.ReactNode
  bajada?: React.ReactNode
  oscuro?: boolean
  centrado?: boolean
  className?: string
}) {
  return (
    <header className={`${centrado ? 'mx-auto text-center' : ''} max-w-[46rem] ${className}`}>
      <p className="m-0 text-[12px] font-bold uppercase tracking-[0.22em]" style={{ color: oscuro ? MENTA : ACENTO }}>
        {eyebrow}
      </p>
      <h2
        id={id}
        className="mt-2.5 font-extrabold"
        style={{ fontSize: 'clamp(28px, 3.3vw, 44px)', lineHeight: 1.06, letterSpacing: '-0.035em', color: oscuro ? '#fff' : TINTA }}
      >
        {titulo}
      </h2>
      {bajada && (
        <p
          className={`mt-3.5 text-[16px] font-semibold leading-[1.55] md:text-[17px] ${centrado ? 'mx-auto' : ''}`}
          style={{ color: oscuro ? 'rgba(255,255,255,.78)' : GRIS, maxWidth: 640 }}
        >
          {bajada}
        </p>
      )}
    </header>
  )
}

export function BotonTasar({ claro = false, children = 'Quiero tasar mi propiedad' }: { claro?: boolean; children?: React.ReactNode }) {
  return (
    <Link
      href="/tasaciones"
      className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full px-6 text-[15px] font-bold transition-opacity duration-200 hover:opacity-90"
      style={{ background: claro ? '#fff' : ACENTO, color: claro ? VERDE : '#fff', textDecoration: 'none' }}
    >
      {children}
      <ArrowRight size={18} strokeWidth={2.2} aria-hidden />
    </Link>
  )
}

/** Etiqueta chica sobre fotos (vidrio oscuro). */
export function Chip({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold text-white ${className}`}
      style={{ background: 'rgba(14,53,33,.72)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
    >
      {children}
    </span>
  )
}

/** Link de texto con flecha. */
export function LinkFlecha({ href, children, externo = false, claro = false }: { href: string; children: React.ReactNode; externo?: boolean; claro?: boolean }) {
  const estilo = { color: claro ? MENTA : VERDE, textDecoration: 'none' }
  const cls = 'inline-flex min-h-[44px] items-center gap-2 text-[15px] font-bold'
  return externo ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls} style={estilo}>
      {children} <ArrowRight size={17} aria-hidden />
    </a>
  ) : (
    <Link href={href} className={cls} style={estilo}>
      {children} <ArrowRight size={17} aria-hidden />
    </Link>
  )
}
