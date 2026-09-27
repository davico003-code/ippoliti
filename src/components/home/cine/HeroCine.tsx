'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import HeroSearch from '@/components/HeroSearch'
import { useScrollProgress, tramo, suave, prefiereQuieto } from './useScrollProgress'

const RALEWAY = "var(--font-raleway), 'Raleway', system-ui, sans-serif"
const CIUDADES = ['Funes.', 'Roldán.', 'Rosario.']

/**
 * Hero cinematográfico de la home. Un contenedor de 260vh con un escenario
 * sticky: el video (drone acercándose a una casa al anochecer) arranca a
 * sangre completa y, a medida que se scrollea, el titular se va, aparecen las
 * tres ciudades y el cuadro se encoge hasta quedar como una tarjeta
 * redondeada — la transición "de película a producto" de las páginas de Apple.
 */
export default function HeroCine() {
  const wrap = useRef<HTMLElement>(null)
  const cuadro = useRef<HTMLDivElement>(null)
  const media = useRef<HTMLDivElement>(null)
  const velo = useRef<HTMLDivElement>(null)
  const copy = useRef<HTMLDivElement>(null)
  const pista = useRef<HTMLDivElement>(null)
  const ciudades = useRef<(HTMLSpanElement | null)[]>([])
  const video = useRef<HTMLVideoElement>(null)
  const [src, setSrc] = useState<string | null>(null)
  const [listo, setListo] = useState(false)

  // El video se elige en el cliente (vertical liviano en celular, 1080p en
  // desktop) y nunca bloquea el LCP: el póster es una <Image priority>.
  useEffect(() => {
    const cel = window.matchMedia('(max-width: 767px)').matches
    setSrc(cel ? '/videos/home-cine-mobile.mp4' : '/videos/home-cine.mp4')
  }, [])

  useEffect(() => {
    const v = video.current
    if (!v || !src) return
    if (prefiereQuieto()) return
    v.play().catch(() => { /* autoplay bloqueado: queda el póster */ })
  }, [src])

  useScrollProgress(wrap, (p) => {
    const desk = window.innerWidth >= 1024
    const nav = desk ? 70 : 61
    const vw = window.innerWidth
    const vh = window.innerHeight

    // A · el titular y el buscador se van hacia arriba, desenfocándose.
    const a = suave(tramo(p, 0.02, 0.22))
    if (copy.current) {
      copy.current.style.opacity = String(1 - a)
      copy.current.style.transform = `translate3d(0, ${-a * 90}px, 0) scale(${1 - a * 0.04})`
      copy.current.style.filter = a > 0.01 ? `blur(${a * 10}px)` : 'none'
      copy.current.style.pointerEvents = a > 0.5 ? 'none' : 'auto'
    }
    if (pista.current) pista.current.style.opacity = String(1 - tramo(p, 0, 0.06))

    // B · las tres ciudades entran una por una.
    ciudades.current.forEach((el, i) => {
      if (!el) return
      const t = suave(tramo(p, 0.2 + i * 0.1, 0.34 + i * 0.1))
      el.style.opacity = String(t)
      el.style.transform = `translate3d(0, ${(1 - t) * 60}px, 0)`
      el.style.filter = t < 0.99 ? `blur(${(1 - t) * 14}px)` : 'none'
    })

    // C · el cuadro se encoge a tarjeta y el video se "asienta" adentro.
    const c = suave(tramo(p, 0.5, 0.92))
    const lado = c * (desk ? vw * 0.035 : 12)
    const arriba = c * (nav + (desk ? 18 : 10))
    const abajo = c * (desk ? vh * 0.04 : 14)
    const radio = c * (desk ? 32 : 24)
    if (cuadro.current) {
      cuadro.current.style.clipPath = `inset(${arriba}px ${lado}px ${abajo}px ${lado}px round ${radio}px)`
    }
    if (media.current) {
      media.current.style.transform = `scale(${1.12 - c * 0.1 + tramo(p, 0, 0.5) * 0.04})`
    }
    // El velo oscuro sube mientras entran las ciudades (legibilidad) y afloja
    // cuando el cuadro ya es tarjeta.
    if (velo.current) {
      velo.current.style.opacity = String(0.6 + tramo(p, 0.15, 0.4) * 0.3 - c * 0.2)
    }
  })

  return (
    <section
      ref={wrap}
      aria-label="SI INMOBILIARIA — Funes, Roldán y Rosario"
      className="relative lg:-mt-[77px]"
      style={{ height: '260vh', background: '#fff' }}
    >
      <div className="sticky top-0 w-full overflow-hidden" style={{ height: '100svh' }}>
        {/* ── Cuadro (video) ── */}
        <div ref={cuadro} className="absolute inset-0 overflow-hidden" style={{ willChange: 'clip-path', background: '#0b1a2e' }}>
          <div
            ref={media}
            className="absolute inset-0"
            style={{ transform: 'scale(1.12)', willChange: 'transform', transformOrigin: '42% 55%' }}
          >
            <Image
              src="/images/hero/home-cine-poster.webp"
              alt=""
              fill
              priority
              quality={80}
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: '38% 50%' }}
            />
            {src && (
              <video
                ref={video}
                src={src}
                muted
                playsInline
                loop
                preload="auto"
                aria-hidden="true"
                onPlaying={() => setListo(true)}
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  // El vertical ya viene recortado centrado en la casa.
                  objectPosition: src.includes('mobile') ? '50% 50%' : '38% 50%',
                  opacity: listo ? 1 : 0,
                  transition: 'opacity 900ms ease',
                }}
              />
            )}
          </div>
          <div
            ref={velo}
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              opacity: 0.6,
              background:
                'radial-gradient(70% 45% at 50% 30%, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 100%), linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0.75) 100%)',
            }}
          />

          {/* ── B · Ciudades ── */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 px-6 pb-[12vh] lg:px-[7vw] lg:pb-[13vh]"
          >
            {CIUDADES.map((c, i) => (
              <span
                key={c}
                ref={(el) => { ciudades.current[i] = el }}
                className="block text-white"
                style={{
                  fontFamily: RALEWAY,
                  fontWeight: 800,
                  fontSize: 'clamp(54px, 11vw, 168px)',
                  lineHeight: 0.92,
                  letterSpacing: '-0.045em',
                  opacity: 0,
                  willChange: 'transform, opacity, filter',
                  textShadow: '0 10px 40px rgba(0,0,0,0.35)',
                }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* ── A · Titular + buscador ── */}
        <div
          ref={copy}
          className="absolute inset-0 z-10 flex items-start justify-center px-5 pt-[17vh] lg:pt-[19vh]"
          style={{ willChange: 'transform, opacity, filter' }}
        >
          <div className="w-full max-w-[1180px] text-center">
            <p
              className="cine-in text-white/85"
              style={{
                fontFamily: RALEWAY,
                fontWeight: 600,
                fontSize: 13,
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
                ['--d' as string]: '0ms',
              }}
             
            >
              SI INMOBILIARIA · Desde 1983
            </p>
            <h2
              className="mt-5 text-white"
              style={{
                fontFamily: RALEWAY,
                fontWeight: 800,
                fontSize: 'clamp(46px, 7.6vw, 118px)',
                lineHeight: 0.95,
                letterSpacing: '-0.05em',
                textShadow: '0 6px 40px rgba(0,0,0,0.35)',
              }}
            >
              {['Encontrá', 'tu', 'hogar.'].map((w, i) => (
                <span
                  key={w}
                  className="cine-in inline-block"
                 
                  style={{ ['--d' as string]: `${150 + i * 110}ms`, marginRight: i < 2 ? '0.22em' : 0 }}
                >
                  {w}
                </span>
              ))}
            </h2>
            <p
              className="cine-in mx-auto mt-5 max-w-[520px] text-white/90"
             
              style={{
                fontFamily: RALEWAY,
                fontWeight: 500,
                fontSize: 'clamp(16px, 1.6vw, 20px)',
                lineHeight: 1.45,
                ['--d' as string]: '560ms',
                textShadow: '0 2px 16px rgba(0,0,0,0.45)',
              }}
            >
              Casas, terrenos y departamentos en Funes, Roldán y Rosario.
            </p>
            <div className="cine-in mt-8" style={{ ['--d' as string]: '700ms' }}>
              <HeroSearch />
            </div>
          </div>
        </div>

        {/* Pista de scroll */}
        <div
          ref={pista}
          aria-hidden="true"
          className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-white/80"
          style={{ fontFamily: RALEWAY, fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase' }}
        >
          <span>Deslizá</span>
          <span className="cine-pista" />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .cine-in { animation: cineIn 1100ms cubic-bezier(.2,.7,.2,1) var(--d) both; }
        @keyframes cineIn { from { opacity: 0; transform: translate3d(0, 28px, 0); filter: blur(12px); } to { opacity: 1; transform: none; filter: none; } }
        .cine-pista { width: 1px; height: 44px; background: linear-gradient(to bottom, rgba(255,255,255,0), #fff); animation: cinePista 2.2s cubic-bezier(.6,0,.4,1) infinite; transform-origin: top; }
        @keyframes cinePista { 0% { transform: scaleY(0); opacity: 1 } 60% { transform: scaleY(1); opacity: 1 } 100% { transform: scaleY(1); opacity: 0 } }
        @media (prefers-reduced-motion: reduce) {
          .cine-in { animation: none; }
          .cine-pista { animation: none; }
        }
      ` }} />
    </section>
  )
}
