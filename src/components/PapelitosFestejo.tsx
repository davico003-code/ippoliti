'use client'

// Botón festivo + lluvia de papelitos celeste y blanco (festejo argentino).
// El usuario toca el botón y caen los papelitos desde arriba; se van solos en
// unos segundos. Canvas liviano (sin dependencias), pointer-events:none para no
// bloquear la página, y respeta prefers-reduced-motion.

import { useCallback, useEffect, useRef, useState } from 'react'

interface Papel {
  x: number
  y: number
  vx: number
  vy: number
  w: number
  h: number
  rot: number
  vr: number
  color: string
  swayPhase: number
  swayAmp: number
}

// Celeste y blanco de la bandera + un toque de sol de mayo como acento.
const COLORS = ['#75AADB', '#ffffff', '#75AADB', '#ffffff', '#5b95cf', '#F4C430']

export default function PapelitosFestejo() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const papelesRef = useRef<Papel[]>([])
  const rafRef = useRef<number | null>(null)
  const runningRef = useRef(false)
  const [activo, setActivo] = useState(false)

  // Ajustar el canvas al viewport (con DPR para que se vea nítido).
  const resize = useCallback(() => {
    const c = canvasRef.current
    if (!c) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    c.width = Math.floor(window.innerWidth * dpr)
    c.height = Math.floor(window.innerHeight * dpr)
    const ctx = c.getContext('2d')
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }, [])

  useEffect(() => {
    resize()
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [resize])

  const loop = useCallback(() => {
    const c = canvasRef.current
    const ctx = c?.getContext('2d')
    if (!c || !ctx) return
    const W = window.innerWidth
    const H = window.innerHeight
    ctx.clearRect(0, 0, W, H)

    const papeles = papelesRef.current
    const t = performance.now() / 1000
    for (const p of papeles) {
      p.vy += 0.05 // gravedad suave
      p.y += p.vy
      p.x += p.vx + Math.sin(t * 2 + p.swayPhase) * p.swayAmp
      p.rot += p.vr
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
      ctx.restore()
    }
    // Quitar los que ya salieron por abajo.
    papelesRef.current = papeles.filter((p) => p.y < H + 24)

    if (papelesRef.current.length > 0) {
      rafRef.current = requestAnimationFrame(loop)
    } else {
      runningRef.current = false
      ctx.clearRect(0, 0, W, H)
      setActivo(false)
    }
  }, [])

  const lanzar = useCallback(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const W = window.innerWidth
    const H = window.innerHeight
    const N = reduce ? 45 : Math.min(180, Math.round(W / 8))
    const nuevos: Papel[] = []
    for (let i = 0; i < N; i++) {
      nuevos.push({
        x: Math.random() * W,
        // Arrancan escalonados por encima del borde superior → caen en cascada.
        y: -Math.random() * H * 0.9 - 10,
        vx: (Math.random() - 0.5) * 1.4,
        vy: 1.5 + Math.random() * 3,
        w: 6 + Math.random() * 7,
        h: 9 + Math.random() * 10,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.25,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        swayPhase: Math.random() * Math.PI * 2,
        swayAmp: reduce ? 0.2 : 0.6 + Math.random() * 0.8,
      })
    }
    // Acumula si ya hay una tanda cayendo (permite re-tocar el botón).
    papelesRef.current = papelesRef.current.concat(nuevos)
    setActivo(true)
    if (!runningRef.current) {
      runningRef.current = true
      rafRef.current = requestAnimationFrame(loop)
    }
  }, [loop])

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 60 }}
      />
      <button
        type="button"
        onClick={lanzar}
        aria-label="Estamos en la final, festejá con papelitos"
        className={`papelitos-btn${activo ? ' es-activo' : ''}`}
      >
        <span className="papelitos-emoji" aria-hidden>🎉</span>
        <span className="papelitos-txt">¡Estamos en la final! Festejá 🇦🇷</span>
      </button>

      <style>{`
        .papelitos-btn {
          position: fixed; left: 16px; bottom: 16px; z-index: 55;
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 16px 10px 12px; border: none; border-radius: 999px; cursor: pointer;
          background: linear-gradient(135deg, #75AADB, #5b95cf); color: #fff;
          font-family: var(--font-raleway), system-ui, sans-serif; font-weight: 800; font-size: 14px;
          box-shadow: 0 6px 20px rgba(91,149,207,.45); transition: transform .15s ease, box-shadow .15s ease;
          padding-bottom: max(10px, env(safe-area-inset-bottom));
        }
        .papelitos-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 26px rgba(91,149,207,.55); }
        .papelitos-btn:active { transform: translateY(0) scale(.96); }
        .papelitos-btn.es-activo .papelitos-emoji { animation: papelitosPulse .6s ease-in-out infinite; }
        .papelitos-emoji { font-size: 18px; line-height: 1; }
        .papelitos-txt { letter-spacing: .01em; }
        @keyframes papelitosPulse { 0%,100% { transform: rotate(-8deg) scale(1); } 50% { transform: rotate(8deg) scale(1.18); } }
        @media (max-width: 640px) { .papelitos-btn { font-size: 13px; padding: 9px 14px 9px 11px; } }
        @media (prefers-reduced-motion: reduce) {
          .papelitos-btn { transition: none; }
          .papelitos-btn.es-activo .papelitos-emoji { animation: none; }
        }
      `}</style>
    </>
  )
}
