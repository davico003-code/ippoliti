'use client'

// PIEZA 1 — Barra superior con cuenta regresiva al próximo partido de Argentina.
// Se monta en ConditionalChrome, justo arriba del <Navbar>. Gateada por
// esEdicionMundial(): fuera del rango no monta nada.
//
// Hydration-safe: en SSR / primer render devuelve un placeholder estable (misma
// altura y fondo, sin texto de tiempo). Recién tras montar arranca el conteo por
// segundo. Esto evita el mismatch por diferencia de reloj server/cliente.
//
// Va en FLUJO NORMAL (position:relative, sin sticky/fixed): se va sola al
// scrollear y no reserva espacio ni empuja al header. El <Navbar> es sticky
// top:0 y se pinea solo al borde superior cuando la barra sale de vista.

import { useEffect, useState } from 'react'
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

// Cáscara común: mismo fondo / altura en placeholder y contenido real.
// En FLUJO NORMAL (relative, no sticky/fixed): se va sola al scrollear y no
// reserva espacio ni empuja al header. El header pinea solo a top:0.
function Shell({ children }: { children?: React.ReactNode }) {
  return (
    <div
      role="status"
      aria-live="off"
      className="relative z-[60] flex flex-wrap items-center justify-center gap-x-2.5 gap-y-0.5 px-4 text-center"
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

  // Arranca el conteo recién tras montar (evita mismatch de hydration).
  useEffect(() => {
    setMounted(true)
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const active = esEdicionMundial()
  const partido = mounted && now ? proximoPartido(now) : null

  if (!active) return null

  // Placeholder estable (SSR / pre-mount): misma altura y fondo, sin tiempo.
  if (!mounted) {
    return (
      <Shell>
        <BanderaAR />
      </Shell>
    )
  }

  // Montado pero sin próximo partido (entre rondas / torneo terminado): nada.
  if (!partido || !now) return null

  const live = estaEnVivo(partido, now)
  const t = tiempoHasta(partido.kickoff, now)

  return (
    <Shell>
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
