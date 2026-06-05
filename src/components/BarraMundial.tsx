'use client'

// PIEZA 1 — Barra superior con cuenta regresiva al próximo partido de Argentina.
// Se monta en ConditionalChrome, justo arriba del <Navbar>. Gateada por
// esEdicionMundial(): fuera del rango no monta nada.
//
// Hydration-safe: en SSR / primer render devuelve un placeholder estable (misma
// altura y fondo, sin texto de tiempo). Recién tras montar arranca el conteo por
// segundo. Esto evita el mismatch por diferencia de reloj server/cliente.
//
// La barra es sticky (queda pinneada arriba) y publica su altura real en la CSS
// var --mundial-bar-h, que Navbar usa para correr los headers hacia abajo. Al
// desmontar/desaparecer la resetea a 0px → el header vuelve a top:0.

import { useEffect, useRef, useState } from 'react'
import { esEdicionMundial, proximoPartido, estaEnVivo, tiempoHasta } from '@/lib/mundial'

const BG = '#f4f1ea'
const TEXTO = '#5a574e'
const AZUL = '#0d3a5c'
const CELESTE = '#75AADB'
const RALEWAY = 'var(--font-raleway), Raleway, sans-serif'
const POPPINS = 'var(--font-poppins), Poppins, sans-serif'

function BanderaAR() {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: 22,
        height: 14,
        borderRadius: 3,
        overflow: 'hidden',
        flexShrink: 0,
        boxShadow: '0 0 0 1px rgba(0,0,0,0.06)',
      }}
    >
      <span style={{ flex: 1, background: CELESTE }} />
      <span style={{ flex: 1, background: '#fff' }} />
      <span style={{ flex: 1, background: CELESTE }} />
    </span>
  )
}

const pad = (n: number) => String(n).padStart(2, '0')

// Cáscara común: mismo fondo / altura / sticky en placeholder y contenido real.
function Shell({ children, innerRef }: { children?: React.ReactNode; innerRef: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={innerRef}
      role="status"
      aria-live="off"
      className="sticky top-0 z-[60] flex flex-wrap items-center justify-center gap-x-2.5 gap-y-0.5 px-4 text-center"
      style={{
        minHeight: 48,
        background: BG,
        color: TEXTO,
        fontFamily: RALEWAY,
        fontWeight: 500,
        fontSize: 13.5,
        lineHeight: 1.3,
      }}
    >
      {children}
    </div>
  )
}

export default function BarraMundial() {
  const [mounted, setMounted] = useState(false)
  const [now, setNow] = useState<Date | null>(null)
  const barRef = useRef<HTMLDivElement | null>(null)

  // Arranca el conteo recién tras montar (evita mismatch de hydration).
  useEffect(() => {
    setMounted(true)
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const active = esEdicionMundial()
  const partido = mounted && now ? proximoPartido(now) : null
  const showPlaceholder = active && !mounted
  const showReal = active && mounted && !!partido && !!now
  const visible = showPlaceholder || showReal

  // Publica la altura real de la barra en --mundial-bar-h para que los headers
  // (fixed/sticky) se corran abajo. Re-mide ante wrap/resize. Limpia a 0px.
  useEffect(() => {
    const root = document.documentElement
    const el = barRef.current
    if (!visible || !el) {
      root.style.setProperty('--mundial-bar-h', '0px')
      return
    }
    const sync = () => root.style.setProperty('--mundial-bar-h', `${el.offsetHeight}px`)
    sync()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(sync) : null
    ro?.observe(el)
    window.addEventListener('resize', sync)
    return () => {
      ro?.disconnect()
      window.removeEventListener('resize', sync)
      root.style.setProperty('--mundial-bar-h', '0px')
    }
  }, [visible])

  if (!active) return null

  // Placeholder estable (SSR / pre-mount): misma altura y fondo, sin tiempo.
  if (!mounted) {
    return (
      <Shell innerRef={barRef}>
        <BanderaAR />
      </Shell>
    )
  }

  // Montado pero sin próximo partido (entre rondas / torneo terminado): nada.
  if (!partido || !now) return null

  const live = estaEnVivo(partido, now)
  const t = tiempoHasta(partido.kickoff, now)

  return (
    <Shell innerRef={barRef}>
      <BanderaAR />
      {live ? (
        <span>
          <strong style={{ fontWeight: 700 }}>Argentina está jugando</strong>
          {' · '}vs {partido.rival}{' · '}
          <span style={{ color: AZUL, fontWeight: 700 }}>¡Vamos!</span>
        </span>
      ) : (
        <span>
          <strong style={{ fontWeight: 700 }}>Argentina</strong> vs {partido.rival}
          {' · '}
          {partido.dia} {partido.hora}hs
          {' · '}
          faltan{' '}
          <span
            style={{
              fontFamily: POPPINS,
              fontVariantNumeric: 'tabular-nums',
              color: AZUL,
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            {t.d}d {pad(t.h)}:{pad(t.m)}:{pad(t.s)}
          </span>
        </span>
      )}
    </Shell>
  )
}
