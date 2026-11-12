'use client'

// "Así va la venta": un cuadradito por lote, en el orden del plano, con los
// vendidos pintados. Sale del plano vivo. Muestra SOLO los vendidos: el conteo
// de disponibles del plano va atrasado (David, 06-sep-2026: "no quedan 28,
// quedan más, eso no va"), así que el resto se muestra como "el resto del
// barrio", sin decir que está a la venta.
//
// Los vendidos se pintan de a uno la primera vez que el mosaico entra en
// pantalla (nada con movimiento reducido).

import { useEffect, useRef, useState } from 'react'
import { usePlanoVivo } from './usePlanoVivo'

export default function VendidosMosaico() {
  const plano = usePlanoVivo()
  const ref = useRef<HTMLDivElement>(null)
  const [visto, setVisto] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisto(true)
      return
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        setVisto(true)
        io.disconnect()
      },
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [plano])

  if (plano === null) return null
  if (plano === undefined) return <div className="min-h-[300px]" aria-hidden />
  if (!plano.vendidos) return null

  const vendidos = new Set(plano.vendidosNros)
  let orden = 0

  return (
    <div ref={ref} className="mb-16 grid gap-10 border-b border-white/[0.15] pb-16 lg:grid-cols-[.75fr_1.25fr] lg:items-center lg:gap-16">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-dr-oro">Así va la venta</p>
        <p className="mt-4 text-[clamp(72px,10vw,140px)] font-extrabold leading-[0.85] tracking-[-0.05em] text-dr-claro [font-variant-numeric:tabular-nums]">
          {plano.vendidos}
        </p>
        <p className="mt-4 text-2xl font-bold tracking-[-0.02em] text-dr-claro">lotes ya tienen dueño.</p>
        <p className="mt-3 max-w-[40ch] text-pretty text-base leading-7 text-white/70">
          El barrio con mayor proyección de Roldán no te va a esperar.
        </p>
      </div>

      <div>
        <div
          className="grid grid-cols-[repeat(18,minmax(0,1fr))] gap-[3px] sm:grid-cols-[repeat(30,minmax(0,1fr))] sm:gap-1"
          role="img"
          aria-label={`${plano.vendidos} de ${plano.total} lotes vendidos`}
        >
          {Array.from({ length: plano.total }, (_, i) => {
            const vendido = vendidos.has(i + 1)
            const demora = vendido ? orden++ * 12 : 0
            return (
              <span
                key={i}
                className={`aspect-square rounded-[3px] transition-colors duration-300 motion-reduce:transition-none ${
                  vendido && visto ? 'bg-[#B35E21]' : 'bg-white/[0.13]'
                }`}
                style={vendido ? { transitionDelay: `${demora}ms` } : undefined}
              />
            )
          })}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/65 sm:text-sm">
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-[3px] bg-[#B35E21]" aria-hidden /> Vendido
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-[3px] bg-white/[0.13]" aria-hidden /> El resto del barrio
          </span>
          {plano.actualizado && <span className="ml-auto">Actualizado: {plano.actualizado}</span>}
        </div>
      </div>
    </div>
  )
}
