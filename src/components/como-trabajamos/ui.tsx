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
    <header className={`ct-rev ${centrado ? 'mx-auto text-center' : ''} max-w-[46rem] ${className}`}>
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

/**
 * Movimiento de la presentación, estilo Apple, solo con CSS:
 * - .ct-rev: aparece subiendo al entrar en pantalla.
 * - .ct-zoom: la foto se acerca levemente al entrar (de 1.14 a 1).
 * - .ct-palabra: en los capítulos, cada palabra se "enciende" al scrollear.
 * - .ct-in: entrada de la portada al cargar.
 * Scroll-driven animations nativas: si el navegador no las soporta o se pidió
 * menos movimiento, todo queda quieto y visible.
 */
export function EstilosMovimiento() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
@keyframes ctRev { from { opacity: 0; transform: translate3d(0, 44px, 0) scale(.985); } to { opacity: 1; transform: none; } }
@keyframes ctZoom { from { transform: scale(1.14); } to { transform: scale(1); } }
@keyframes ctPalabra { from { opacity: .16; } to { opacity: 1; } }
@keyframes ctIn { from { opacity: 0; transform: translate3d(0, 30px, 0); filter: blur(6px); } to { opacity: 1; transform: none; filter: none; } }
.ct-capitulo { view-timeline-name: --ct-cap; }
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .ct-rev { animation: ctRev linear both; animation-timeline: view(); animation-range: entry 0% entry 60%; }
    .ct-zoom { animation: ctZoom linear both; animation-timeline: view(); animation-range: entry 0% cover 50%; }
    .ct-palabra { animation: ctPalabra linear both; animation-timeline: --ct-cap; animation-range: cover var(--ini) cover var(--fin); }
  }
}
@media (prefers-reduced-motion: no-preference) {
  .ct-in { animation: ctIn 1s cubic-bezier(.2,.7,.2,1) both; }
  .ct-in-1 { animation-delay: .1s; } .ct-in-2 { animation-delay: .25s; } .ct-in-3 { animation-delay: .4s; } .ct-in-4 { animation-delay: .6s; }
}
`,
      }}
    />
  )
}

/**
 * Capítulo: una frase grande a pantalla completa que se ilumina palabra por
 * palabra mientras se scrollea (como las páginas de producto de Apple).
 */
export function Capitulo({ numero, nombre, frase, oscuro = false }: { numero: string; nombre: string; frase: string; oscuro?: boolean }) {
  const palabras = frase.split(' ')
  const n = palabras.length
  return (
    <section
      className="ct-capitulo flex min-h-[70svh] items-center py-24 md:min-h-[88svh] md:py-32"
      style={{ background: oscuro ? '#08170F' : '#fff', color: oscuro ? '#fff' : TINTA }}
      aria-label={`${nombre}: ${frase}`}
    >
      <Contenedor>
        <p className="m-0 flex items-center gap-3 text-[12px] font-bold uppercase tracking-[0.3em]" style={{ color: oscuro ? MENTA : ACENTO }}>
          <span className="font-numeric">{numero}</span>
          <span aria-hidden className="h-px w-10" style={{ background: 'currentColor' }} />
          {nombre}
        </p>
        <p
          aria-hidden
          className="m-0 mt-6 max-w-[18ch] font-extrabold"
          style={{ fontSize: 'clamp(2.6rem, 7.4vw, 7rem)', lineHeight: 1.0, letterSpacing: '-0.045em' }}
        >
          {palabras.map((p, i) => {
            // Se enciende entre el 14% y el ~50% del recorrido: la frase queda
            // completa justo cuando está centrada en la pantalla.
            const ini = 14 + (i / n) * 28
            return (
              <span
                key={i}
                className="ct-palabra"
                style={{ ['--ini' as string]: `${ini.toFixed(1)}%`, ['--fin' as string]: `${(ini + 8).toFixed(1)}%` } as React.CSSProperties}
              >
                {p}
                {i < n - 1 ? ' ' : ''}
              </span>
            )
          })}
        </p>
      </Contenedor>
    </section>
  )
}
