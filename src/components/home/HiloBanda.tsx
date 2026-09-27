'use client'

import { useEffect, useRef, useState } from 'react'

const RALEWAY = "var(--font-raleway), 'Raleway', system-ui, sans-serif"
// HILO es el producto (va en su índigo); SI sigue siendo blanco + verde.
const INDIGO = '#211E78'
const LILA = '#A7A3FF'

const AVISOS = [
  { titulo: 'Consulta nueva', texto: 'Ya está con el agente de la propiedad.' },
  { titulo: 'Casa en Funes', texto: 'Publicada en la web y en los portales.' },
  { titulo: 'Informe semanal', texto: 'Enviado al propietario.' },
]

/**
 * Banda compacta de HILO: una tarjeta oscura con el mensaje en dos líneas y,
 * al costado, avisos estilo notificación de iPhone que llegan de a uno. Un
 * hilo de luz se dibuja cuando la tarjeta entra en pantalla.
 */
export default function HiloBanda() {
  const ref = useRef<HTMLElement>(null)
  const [visto, setVisto] = useState(false)
  const [n, setN] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisto(true); io.disconnect() }
    }, { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Llegan de a uno; cuando están los tres, se vacía y vuelve a empezar.
  useEffect(() => {
    if (!visto) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setN(AVISOS.length); return }
    const id = setInterval(() => setN((x) => (x >= AVISOS.length + 1 ? 0 : x + 1)), 1500)
    return () => clearInterval(id)
  }, [visto])

  const mostrados = Math.min(n, AVISOS.length)

  return (
    <section ref={ref} className="bg-white px-4 py-8 md:px-6 md:py-12">
      <div
        className="relative mx-auto grid max-w-7xl items-center gap-8 overflow-hidden rounded-[28px] px-6 py-9 md:grid-cols-[1.1fr_1fr] md:gap-10 md:px-14 md:py-14"
        style={{ background: '#08071A', color: '#fff' }}
      >
        {/* Resplandor + hilo */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{
          background: `radial-gradient(55% 90% at 85% 50%, ${INDIGO} 0%, rgba(33,30,120,0.35) 45%, transparent 75%)`,
        }} />
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1000 400" preserveAspectRatio="none">
          <defs>
            <linearGradient id="hiloBandaGrad" x1="0" x2="1">
              <stop offset="0" stopColor={LILA} stopOpacity="0" />
              <stop offset="0.5" stopColor={LILA} stopOpacity="0.9" />
              <stop offset="1" stopColor="#fff" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path
            d="M -20 330 C 180 330, 260 120, 470 170 S 760 380, 1020 90"
            fill="none"
            stroke="url(#hiloBandaGrad)"
            strokeWidth="1.5"
            pathLength={1}
            vectorEffect="non-scaling-stroke"
            style={{
              strokeDasharray: 1,
              strokeDashoffset: visto ? 0 : 1,
              transition: 'stroke-dashoffset 2400ms cubic-bezier(.65,0,.35,1)',
            }}
          />
        </svg>

        <div className="relative">
          <p style={{ fontFamily: RALEWAY, fontWeight: 700, fontSize: 12, letterSpacing: '0.24em', textTransform: 'uppercase', color: LILA }}>
            Tecnología propia
          </p>
          <h2
            className="mt-3"
            style={{ fontFamily: RALEWAY, fontWeight: 800, fontSize: 'clamp(28px, 3.2vw, 44px)', lineHeight: 1.05, letterSpacing: '-0.035em' }}
          >
            Trabajamos con <span style={{ color: LILA }}>HILO</span>,
            <br className="hidden md:block" /> nuestro CRM con inteligencia artificial.
          </h2>
          <p className="mt-4 max-w-[460px] text-white/65" style={{ fontFamily: RALEWAY, fontWeight: 500, fontSize: 16, lineHeight: 1.55 }}>
            Lo desarrollamos nosotros para que nada se pierda: cada consulta, cada publicación y cada informe, a tiempo.
          </p>
        </div>

        {/* Avisos */}
        <div aria-hidden="true" className="relative mx-auto flex h-[228px] w-full max-w-[380px] flex-col justify-start gap-2.5">
          {AVISOS.map((a, i) => {
            const on = i < mostrados
            return (
              <div
                key={a.titulo}
                className="flex items-start gap-3 rounded-[20px] px-3.5 py-3"
                style={{
                  background: 'rgba(255,255,255,0.10)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(18px) saturate(160%)',
                  WebkitBackdropFilter: 'blur(18px) saturate(160%)',
                  opacity: on ? 1 : 0,
                  transform: on ? 'none' : 'translate3d(0, -14px, 0) scale(0.96)',
                  transition: 'opacity 500ms ease, transform 600ms cubic-bezier(.3,1.35,.5,1)',
                }}
              >
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] text-[10px] font-extrabold tracking-[0.08em]"
                  style={{ background: INDIGO, color: '#fff', boxShadow: `0 0 0 1px ${LILA}55`, fontFamily: RALEWAY }}
                >
                  HILO
                </span>
                <div className="min-w-0 flex-1" style={{ fontFamily: RALEWAY }}>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-[14px] font-bold">{a.titulo}</p>
                    <span className="shrink-0 text-[11px] text-white/45">ahora</span>
                  </div>
                  <p className="text-[13px] leading-snug text-white/70">{a.texto}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
