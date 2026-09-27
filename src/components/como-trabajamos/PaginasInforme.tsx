'use client'

// Páginas reales de un informe a desarrolladores: miniaturas legibles y, al
// tocar, la página en grande con flechas (pensado para recorrerlo en la TV
// de la oficina con el cliente). Esc o tocar afuera cierra.

import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react'

export type Pagina = { src: string; ancho: number; alto: number; etiqueta: string }

export default function PaginasInforme({ paginas, titulo }: { paginas: Pagina[]; titulo: string }) {
  const [abierta, setAbierta] = useState<number | null>(null)
  const cerrar = useCallback(() => setAbierta(null), [])
  const mover = useCallback(
    (d: number) => setAbierta((i) => (i === null ? i : (i + d + paginas.length) % paginas.length)),
    [paginas.length],
  )

  useEffect(() => {
    if (abierta === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrar()
      if (e.key === 'ArrowRight') mover(1)
      if (e.key === 'ArrowLeft') mover(-1)
    }
    window.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [abierta, cerrar, mover])

  const actual = abierta === null ? null : paginas[abierta]

  return (
    <>
      <ul className={`m-0 grid list-none gap-3 p-0 ${paginas[0]?.ancho > paginas[0]?.alto ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {paginas.map((p, i) => (
          <li key={p.src}>
            <button
              type="button"
              onClick={() => setAbierta(i)}
              className="group block w-full cursor-zoom-in border-0 bg-transparent p-0 text-left"
              aria-label={`Ver en grande: ${p.etiqueta}`}
            >
              <span
                className="relative block overflow-hidden rounded-[8px] bg-white shadow-md transition-transform duration-200 group-hover:-translate-y-1"
                style={{ aspectRatio: `${p.ancho} / ${p.alto}`, border: '1px solid rgba(17,18,19,.1)' }}
              >
                <Image src={p.src} alt={`${titulo}: ${p.etiqueta}`} fill sizes="(max-width: 640px) 50vw, 260px" className="object-cover object-top" />
                <span className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white opacity-80 transition-opacity group-hover:opacity-100">
                  <Maximize2 size={13} aria-hidden />
                </span>
              </span>
              <span className="mt-1.5 block text-[12.5px] font-bold leading-snug" style={{ color: '#3d4247' }}>
                {p.etiqueta}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {actual && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${titulo}: ${actual.etiqueta}`}
          className="fixed inset-0 z-[10000] flex flex-col bg-black/90 p-3 md:p-6"
          onClick={cerrar}
        >
          <div className="flex items-center justify-between gap-3 pb-3 text-white" onClick={(e) => e.stopPropagation()}>
            <p className="m-0 text-[14px] font-bold md:text-[15px]">
              {titulo} · <span className="font-semibold opacity-80">{actual.etiqueta}</span>
              <span className="ml-2 font-numeric text-[13px] opacity-60">
                {(abierta ?? 0) + 1}/{paginas.length}
              </span>
            </p>
            <button type="button" onClick={cerrar} aria-label="Cerrar" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white">
              <X size={22} aria-hidden />
            </button>
          </div>
          <div className="relative flex-1" onClick={(e) => e.stopPropagation()}>
            <Image src={actual.src} alt={`${titulo}: ${actual.etiqueta}`} fill sizes="100vw" className="object-contain" />
            {paginas.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => mover(-1)}
                  aria-label="Página anterior"
                  className="absolute left-0 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white md:left-2"
                >
                  <ChevronLeft size={26} aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => mover(1)}
                  aria-label="Página siguiente"
                  className="absolute right-0 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white md:right-2"
                >
                  <ChevronRight size={26} aria-hidden />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
