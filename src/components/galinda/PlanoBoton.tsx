'use client'

import { useRef } from 'react'
import { X } from 'lucide-react'

// "Ver plano" de cada tarjeta de Galinda!: abre el plano oficial de Fundar en
// un <dialog> nativo (Esc y click afuera cierran).
export default function PlanoBoton({ src, titulo }: { src: string; titulo: string }) {
  const ref = useRef<HTMLDialogElement>(null)
  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className="rounded-xl border border-[var(--line)] bg-[var(--card-surface)] px-4 py-3 text-sm font-bold text-[var(--foreground)] transition-colors hover:border-[var(--brand)]"
      >
        Ver plano
      </button>
      <dialog
        ref={ref}
        onClick={(e) => {
          if (e.target === ref.current) ref.current?.close()
        }}
        className="m-auto w-[min(920px,calc(100vw-32px))] max-w-none rounded-2xl bg-[var(--card-surface)] p-0 backdrop:bg-black/60"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-3">
          <p className="font-bold text-[var(--foreground)]">{titulo}</p>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            aria-label="Cerrar plano"
            className="rounded-lg bg-[var(--cream)] p-2 text-[var(--foreground)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- se carga recién al abrir */}
        <img src={src} alt={titulo} loading="lazy" className="block max-h-[78vh] w-full bg-[var(--card-surface)] object-contain" />
      </dialog>
    </>
  )
}
