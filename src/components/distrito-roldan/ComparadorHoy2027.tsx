'use client'

// Comparador "hoy / agosto 2027": la misma toma de drone, con una barra que se
// arrastra. A la izquierda la foto real de la obra; a la derecha, cómo queda el
// barrio con la obra terminada (imagen ilustrativa, ver COMPARADOR).
//
// Se arrastra con el mouse o el dedo (touch-action: pan-y deja hacer scroll
// vertical encima sin quedar atrapado) y con las flechas del teclado desde la
// manija (role="slider"). La primera vez que aparece en pantalla, la barra hace
// un recorrido corto para que se entienda que se mueve.

import { useEffect, useRef, useState } from 'react'
import Image from '@/components/Imagen'
import { ChevronsLeftRight } from 'lucide-react'
import { COMPARADOR } from './avancesObra'

const limitar = (n: number) => Math.min(100, Math.max(0, n))

export default function ComparadorHoy2027() {
  const caja = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState(50)
  const arrastrando = useRef(false)
  const tocado = useRef(false)

  // Pista: una sola vez, al entrar en pantalla, si nadie lo tocó todavía.
  useEffect(() => {
    const el = caja.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        const t0 = performance.now()
        const paso = (t: number) => {
          if (tocado.current) return
          const p = Math.min(1, (t - t0) / 2200)
          // 50 → 78 → 22 → 50, suave.
          setPos(50 + Math.sin(p * Math.PI * 2) * 28 * (1 - p * 0.15))
          if (p < 1) frame = requestAnimationFrame(paso)
          else setPos(50)
        }
        frame = requestAnimationFrame(paso)
      },
      { threshold: 0.6 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [])

  const moverA = (clientX: number) => {
    const r = caja.current?.getBoundingClientRect()
    if (!r) return
    setPos(limitar(((clientX - r.left) / r.width) * 100))
  }

  return (
    <div
      ref={caja}
      className="relative aspect-square w-full cursor-ew-resize select-none overflow-hidden bg-dr-verde [touch-action:pan-y] sm:aspect-[3/2] md:rounded-[28px]"
      onPointerDown={(e) => {
        tocado.current = true
        arrastrando.current = true
        e.currentTarget.setPointerCapture(e.pointerId)
        // Con el dedo no salta al tocar: así, al hacer scroll por encima, la
        // barra no se mueve. Se mueve recién cuando el dedo va de costado.
        if (e.pointerType !== 'touch') moverA(e.clientX)
      }}
      onPointerMove={(e) => arrastrando.current && moverA(e.clientX)}
      onPointerUp={() => (arrastrando.current = false)}
      onPointerCancel={() => (arrastrando.current = false)}
    >
      <Image
        src={COMPARADOR.despues.src}
        alt={COMPARADOR.despues.alt}
        fill
        sizes="(max-width: 1320px) 100vw, 1320px"
        className="pointer-events-none object-cover"
      />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <Image
          src={COMPARADOR.hoy.src}
          alt={COMPARADOR.hoy.alt}
          fill
          sizes="(max-width: 1320px) 100vw, 1320px"
          className="pointer-events-none object-cover"
        />
      </div>

      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-[#143125]/75 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md sm:left-5 sm:top-5 sm:text-sm">
        {COMPARADOR.hoy.rotulo}
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-[#B35E21]/90 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md sm:right-5 sm:top-5 sm:text-sm">
        {COMPARADOR.despues.rotulo}
      </span>

      {/* La barra y su manija. */}
      <div className="pointer-events-none absolute inset-y-0 w-[3px] -translate-x-1/2 bg-dr-crema shadow-[0_0_18px_rgba(0,0,0,.35)]" style={{ left: `${pos}%` }} />
      <div
        role="slider"
        tabIndex={0}
        aria-label="Comparar la obra hoy con el barrio terminado en agosto 2027"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        aria-valuetext={`${Math.round(pos)} % de la foto de hoy`}
        onKeyDown={(e) => {
          const paso = e.shiftKey ? 20 : 5
          if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') setPos((p) => limitar(p - paso))
          else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') setPos((p) => limitar(p + paso))
          else if (e.key === 'Home') setPos(0)
          else if (e.key === 'End') setPos(100)
          else return
          tocado.current = true
          e.preventDefault()
        }}
        className="absolute top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-dr-crema text-dr-verde shadow-[0_8px_30px_rgba(0,0,0,.35)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#B35E21]"
        style={{ left: `${pos}%` }}
      >
        <ChevronsLeftRight className="h-6 w-6" aria-hidden />
      </div>
    </div>
  )
}
