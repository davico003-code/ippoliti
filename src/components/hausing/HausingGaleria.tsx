'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Images, X } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

// Galería de una casa de la colección: mosaico con varias miniaturas (la última
// muestra "+N") y visor a pantalla completa con TODAS las fotos de la
// publicación — flechas, teclado, deslizar con el dedo y tira de miniaturas.

const VISIBLES = 9

export default function HausingGaleria({ fotos, titulo, id }: { fotos: string[]; titulo: string; id: number }) {
  const [abierta, setAbierta] = useState<number | null>(null)
  if (fotos.length === 0) return null

  // Desktop: 1 grande + 8 miniaturas (grilla 4×3). Celular: 1 grande + 4.
  const visibles = fotos.slice(0, VISIBLES)
  const restoDesk = fotos.length - visibles.length
  const restoMovil = fotos.length - Math.min(fotos.length, 5)

  function abrir(i: number) {
    setAbierta(i)
    trackEvent('hausing_galeria_abierta', { property_id: id, fotos: fotos.length })
  }

  return (
    <>
      <div className="grid grid-cols-4 gap-1.5 sm:aspect-[4/3] sm:grid-rows-3 sm:gap-2">
        {visibles.map((src, i) => {
          const masMovil = i === 4 && restoMovil > 0
          const masDesk = i === visibles.length - 1 && restoDesk > 0
          return (
            <button
              key={src}
              onClick={() => abrir(i)}
              aria-label={`Ver foto ${i + 1} de ${fotos.length}`}
              className={`group relative overflow-hidden bg-white/5 ${
                i === 0 ? 'col-span-4 aspect-[16/9] sm:col-span-2 sm:row-span-2 sm:aspect-auto' : 'aspect-square sm:aspect-auto'
              } ${i > 4 ? 'hidden sm:block' : ''}`}
            >
              <Image
                src={src}
                alt={i === 0 ? titulo : ''}
                fill
                sizes={i === 0 ? '(max-width:640px) 100vw, 30vw' : '(max-width:640px) 25vw, 15vw'}
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
              />
              {masMovil && <Mas n={restoMovil} className="flex sm:hidden" />}
              {masDesk && <Mas n={restoDesk} className="hidden sm:flex" />}
            </button>
          )
        })}
      </div>
      <button
        onClick={() => abrir(0)}
        className="mt-4 inline-flex items-center gap-2 border-b border-white/40 pb-1 text-[13px] font-semibold text-white transition-colors hover:border-white"
      >
        <Images className="h-4 w-4" /> Ver las <span className="font-numeric">{fotos.length}</span> fotos
      </button>

      {abierta !== null && (
        <Visor fotos={fotos} titulo={titulo} inicial={abierta} onClose={() => setAbierta(null)} />
      )}
    </>
  )
}

function Mas({ n, className }: { n: number; className: string }) {
  return (
    <span
      className={`absolute inset-0 flex-col items-center justify-center gap-1 bg-black/60 text-white backdrop-blur-[2px] transition-colors group-hover:bg-black/45 ${className}`}
    >
      <span className="font-numeric text-[22px] font-extralight leading-none">+{n}</span>
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">fotos</span>
    </span>
  )
}

function Visor({
  fotos,
  titulo,
  inicial,
  onClose,
}: {
  fotos: string[]
  titulo: string
  inicial: number
  onClose: () => void
}) {
  const [i, setI] = useState(inicial)
  const tira = useRef<HTMLDivElement>(null)
  const toque = useRef<number | null>(null)
  const total = fotos.length

  const ir = useCallback((n: number) => setI(((n % total) + total) % total), [total])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') ir(i + 1)
      if (e.key === 'ArrowLeft') ir(i - 1)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [i, ir, onClose])

  // La miniatura activa siempre visible en la tira.
  useEffect(() => {
    const el = tira.current?.children[i] as HTMLElement | undefined
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [i])

  return (
    <div className="fixed inset-0 z-[10000] flex flex-col bg-black" role="dialog" aria-modal="true" aria-label={titulo}>
      <div className="flex items-center justify-between px-4 py-3 text-white sm:px-6">
        <p className="truncate pr-4 text-[13px] font-medium text-white/80">
          {titulo}
          <span className="font-numeric ml-3 text-white/45">
            {i + 1} / {total}
          </span>
        </p>
        <button
          onClick={onClose}
          aria-label="Cerrar galería"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div
        className="relative min-h-0 flex-1"
        onTouchStart={e => (toque.current = e.touches[0].clientX)}
        onTouchEnd={e => {
          if (toque.current === null) return
          const dx = e.changedTouches[0].clientX - toque.current
          if (Math.abs(dx) > 40) ir(dx < 0 ? i + 1 : i - 1)
          toque.current = null
        }}
      >
        <Image key={fotos[i]} src={fotos[i]} alt={`${titulo} — foto ${i + 1}`} fill sizes="100vw" priority className="hz-foto-in object-contain" />
        {/* Precarga de la anterior y la siguiente */}
        <div className="hidden" aria-hidden="true">
          <Image src={fotos[(i + 1) % total]} alt="" width={16} height={16} sizes="100vw" />
          <Image src={fotos[(i - 1 + total) % total]} alt="" width={16} height={16} sizes="100vw" />
        </div>
        {total > 1 && (
          <>
            <button
              onClick={() => ir(i - 1)}
              aria-label="Foto anterior"
              className="absolute left-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white ring-1 ring-white/20 backdrop-blur transition-colors hover:bg-white hover:text-black sm:flex"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => ir(i + 1)}
              aria-label="Foto siguiente"
              className="absolute right-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white ring-1 ring-white/20 backdrop-blur transition-colors hover:bg-white hover:text-black sm:flex"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      <div ref={tira} className="flex gap-1.5 overflow-x-auto px-4 py-3 [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden">
        {fotos.map((src, k) => (
          <button
            key={src}
            onClick={() => setI(k)}
            aria-label={`Foto ${k + 1}`}
            aria-current={k === i}
            className={`relative h-14 w-20 shrink-0 overflow-hidden transition-opacity sm:h-16 sm:w-24 ${k === i ? 'opacity-100 ring-2 ring-white' : 'opacity-45 hover:opacity-80'}`}
          >
            <Image src={src} alt="" fill sizes="96px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}
