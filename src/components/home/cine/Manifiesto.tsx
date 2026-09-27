'use client'

import { useEffect, useRef, useState } from 'react'
import { useScrollProgress, tramo } from './useScrollProgress'

const RALEWAY = "var(--font-raleway), 'Raleway', system-ui, sans-serif"
const POPPINS = "var(--font-poppins), 'Poppins', system-ui, sans-serif"

const TEXTO =
  'Desde 1983 acompañamos a familias de Funes, Roldán y Rosario a encontrar el lugar donde empieza todo. Hoy lo hacemos con la misma cercanía de siempre, y con tecnología que construimos nosotros.'

// Palabras que quedan en verde cuando se "encienden".
const ACENTO = new Set(['1983', 'tecnología', 'nosotros.'])

const CIFRAS: { n: number; pre?: string; suf?: string; label: string }[] = [
  { n: 43, label: 'años en la zona' },
  { n: 3, label: 'ciudades: Funes, Roldán y Rosario' },
  { n: 1, label: 'CRM propio, con IA integrada' },
  { n: 24, suf: '/7', label: 'tu consulta llega a su agente' },
]

/**
 * Manifiesto que se "enciende" palabra por palabra con el scroll (texto gris →
 * negro), y abajo cuatro cifras que cuentan hasta su valor al entrar.
 */
export default function Manifiesto() {
  const wrap = useRef<HTMLElement>(null)
  const palabras = useRef<(HTMLSpanElement | null)[]>([])
  const lista = TEXTO.split(' ')

  useScrollProgress(wrap, (p) => {
    const t = tramo(p, 0.05, 0.8) * lista.length
    palabras.current.forEach((el, i) => {
      if (!el) return
      const on = Math.min(1, Math.max(0, t - i))
      el.style.opacity = String(0.14 + on * 0.86)
    })
  })

  return (
    <>
      <section ref={wrap} className="relative bg-white" style={{ height: '220vh' }}>
        <div className="sticky top-0 flex items-center justify-center px-6 lg:px-10" style={{ height: '100svh' }}>
          <p
            className="mx-auto max-w-[1100px] text-[#111]"
            style={{
              fontFamily: RALEWAY,
              fontWeight: 700,
              fontSize: 'clamp(30px, 4.6vw, 68px)',
              lineHeight: 1.12,
              letterSpacing: '-0.035em',
            }}
          >
            {lista.map((w, i) => (
              <span
                key={i}
                ref={(el) => { palabras.current[i] = el }}
                style={{
                  opacity: 0.14,
                  color: ACENTO.has(w) ? '#00754A' : undefined,
                  transition: 'opacity 120ms linear',
                }}
              >
                {w}{' '}
              </span>
            ))}
          </p>
        </div>
      </section>

      <section className="bg-white px-6 pb-24 lg:px-10 lg:pb-36">
        <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-x-6 gap-y-12 border-t border-black/10 pt-12 lg:grid-cols-4 lg:pt-16">
          {CIFRAS.map((c) => (
            <Cifra key={c.label} {...c} />
          ))}
        </div>
      </section>
    </>
  )
}

function Cifra({ n, pre, suf, label }: { n: number; pre?: string; suf?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [valor, setValor] = useState(0)
  const [visto, setVisto] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisto(true); io.disconnect() }
    }, { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!visto) return
    const dur = 1400
    const t0 = performance.now()
    let raf = 0
    const paso = (t: number) => {
      const k = Math.min(1, (t - t0) / dur)
      setValor(Math.round(n * (1 - Math.pow(1 - k, 4))))
      if (k < 1) raf = requestAnimationFrame(paso)
    }
    raf = requestAnimationFrame(paso)
    return () => cancelAnimationFrame(raf)
  }, [visto, n])

  return (
    <div ref={ref} className="cifra" data-on={visto ? '1' : '0'}>
      <div
        className="font-numeric text-[#111]"
        style={{ fontFamily: POPPINS, fontWeight: 600, fontSize: 'clamp(52px, 6.4vw, 96px)', lineHeight: 1, letterSpacing: '-0.04em' }}
      >
        {pre}{valor}<span style={{ color: '#00754A' }}>{suf}</span>
      </div>
      <p className="mt-3 max-w-[220px] text-[15px] leading-snug text-[#555]" style={{ fontFamily: RALEWAY, fontWeight: 500 }}>
        {label}
      </p>
      <style dangerouslySetInnerHTML={{ __html: `
        .cifra { opacity: 0; transform: translateY(24px); transition: opacity 900ms ease, transform 900ms cubic-bezier(.2,.7,.2,1); }
        .cifra[data-on="1"] { opacity: 1; transform: none; }
      ` }} />
    </div>
  )
}
