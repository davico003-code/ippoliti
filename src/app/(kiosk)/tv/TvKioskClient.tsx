'use client'

// Kiosco de TV: cicla los slides en loop con Ken Burns + crossfade, precio y
// datos grandes, QR para abrir en el celular, reloj/fecha y branding SI.
// Sin interacción — pensado para dejar corriendo en un televisor todo el día.

import { useEffect, useState } from 'react'
import type { Slide } from '../tvData'

const SLIDE_MS = 9000
const RELOAD_MS = 40 * 60 * 1000 // recargar cada 40 min para refrescar stock

const mod = (n: number, m: number) => ((n % m) + m) % m

export default function TvKioskClient({ slides }: { slides: Slide[] }) {
  const [idx, setIdx] = useState(0)
  const [clock, setClock] = useState<{ h: string; d: string } | null>(null)

  // Ciclo de slides
  useEffect(() => {
    if (slides.length <= 1) return
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), SLIDE_MS)
    return () => clearInterval(t)
  }, [slides.length])

  // Reloj (solo cliente → sin mismatch de hidratación)
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const h = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })
      const d = now.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
      setClock({ h, d: d.charAt(0).toUpperCase() + d.slice(1) })
    }
    tick()
    const t = setInterval(tick, 15000)
    return () => clearInterval(t)
  }, [])

  // Recarga periódica para traer stock nuevo
  useEffect(() => {
    const t = setTimeout(() => window.location.reload(), RELOAD_MS)
    return () => clearTimeout(t)
  }, [])

  if (slides.length === 0) {
    return (
      <main style={{ height: '100dvh', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-blanco.webp" alt="SI INMOBILIARIA" style={{ height: 64, width: 'auto', opacity: 0.9 }} />
      </main>
    )
  }

  const windowIdx = new Set([mod(idx - 1, slides.length), idx, mod(idx + 1, slides.length)])
  const s = slides[idx]

  return (
    <main className="tv-root">
      {/* Capas de foto (crossfade + Ken Burns) */}
      {slides.map((sl, i) =>
        windowIdx.has(i) ? (
          <div key={i} className="tv-layer" style={{ opacity: i === idx ? 1 : 0, zIndex: i === idx ? 2 : 1 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sl.photo} alt="" className={`tv-photo ${i === idx ? 'tv-kb' : ''}`} />
          </div>
        ) : null,
      )}

      {/* Velos para legibilidad */}
      <div className="tv-scrim-bottom" />
      <div className="tv-scrim-left" />

      {/* Logo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-blanco.webp" alt="SI INMOBILIARIA" className="tv-logo" />

      {/* Reloj + fecha */}
      {clock && (
        <div className="tv-clock">
          <div className="tv-clock-h">{clock.h}</div>
          <div className="tv-clock-d">{clock.d}</div>
        </div>
      )}

      {/* Contenido (se re-anima en cada slide por el key) */}
      <div key={idx} className="tv-content tv-in">
        <div className="tv-eyebrow">
          {s.destacada && <span className="tv-badge">Selección SI</span>}
          <span className="tv-meta">{s.tipo}{s.ubicacion ? ` · ${s.ubicacion}` : ''}</span>
        </div>
        {s.titulo && <h2 className="tv-title">{s.titulo}</h2>}
        <div className="tv-price">{s.precio}</div>
        {s.specs.length > 0 && (
          <div className="tv-specs">
            {s.specs.map((sp, k) => (
              <div key={k} className="tv-spec">
                <span className="tv-spec-v">{sp.v}</span>
                <span className="tv-spec-l">{sp.l}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR */}
      {s.qr && (
        <div key={`qr-${idx}`} className="tv-qr tv-in">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.qr} alt="Código QR de la propiedad" className="tv-qr-img" />
          <div className="tv-qr-text">Escaneá para<br />verla en tu celular</div>
        </div>
      )}

      {/* Barra de progreso */}
      <div key={`p-${idx}`} className="tv-progress" style={{ animationDuration: `${SLIDE_MS}ms` }} />

      <style>{`
        .tv-root { position: fixed; inset: 0; overflow: hidden; background: #08100B; }
        .tv-layer { position: absolute; inset: 0; transition: opacity 1000ms ease-in-out; }
        .tv-photo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .tv-kb { animation: tvKenBurns ${SLIDE_MS + 1500}ms ease-out forwards; }
        @keyframes tvKenBurns {
          from { transform: scale(1.02) translate3d(0,0,0); }
          to   { transform: scale(1.13) translate3d(-1.5%, -1.5%, 0); }
        }
        .tv-scrim-bottom { position: absolute; inset: 0; z-index: 3; pointer-events: none;
          background: linear-gradient(0deg, rgba(6,14,9,.94) 0%, rgba(6,14,9,.55) 26%, rgba(6,14,9,0) 55%); }
        .tv-scrim-left { position: absolute; inset: 0; z-index: 3; pointer-events: none;
          background: linear-gradient(100deg, rgba(6,14,9,.72) 0%, rgba(6,14,9,.2) 34%, rgba(6,14,9,0) 58%); }

        .tv-logo { position: absolute; top: 3.4vh; left: 3.2vw; z-index: 6; height: 3.2vh; min-height: 26px; width: auto;
          filter: drop-shadow(0 2px 10px rgba(0,0,0,.5)); }

        .tv-clock { position: absolute; top: 3vh; right: 3.2vw; z-index: 6; text-align: right;
          text-shadow: 0 2px 12px rgba(0,0,0,.5); }
        .tv-clock-h { font-family: var(--font-raleway), sans-serif; font-weight: 700; font-size: 3.4vh; line-height: 1;
          letter-spacing: -.01em; font-variant-numeric: tabular-nums; }
        .tv-clock-d { font-size: 1.5vh; color: rgba(255,255,255,.8); margin-top: .6vh; }

        .tv-content { position: absolute; left: 3.2vw; bottom: 5vh; z-index: 6; max-width: 62vw; }
        .tv-eyebrow { display: flex; align-items: center; gap: 1.2vw; margin-bottom: 1.6vh; }
        .tv-badge { background: #1A5C38; color: #fff; font-weight: 700; font-size: 1.5vh; letter-spacing: .12em;
          text-transform: uppercase; padding: .7vh 1.2vw; border-radius: 999px; }
        .tv-meta { font-size: 1.9vh; font-weight: 600; letter-spacing: .1em; text-transform: uppercase;
          color: #A6E7BE; text-shadow: 0 1px 8px rgba(0,0,0,.5); }
        .tv-title { font-family: var(--font-raleway), sans-serif; font-weight: 400; font-size: 3.4vh; line-height: 1.12;
          margin: 0 0 1.4vh; color: #fff; text-shadow: 0 2px 16px rgba(0,0,0,.5); max-width: 46ch;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .tv-price { font-family: var(--font-raleway), sans-serif; font-weight: 800; font-size: 8.6vh; line-height: .98;
          letter-spacing: -.02em; color: #fff; text-shadow: 0 3px 30px rgba(0,0,0,.5); font-variant-numeric: tabular-nums; }
        .tv-specs { display: flex; align-items: stretch; margin-top: 3vh; gap: 0; }
        .tv-spec { padding: 0 2vw; display: flex; flex-direction: column; }
        .tv-spec:first-child { padding-left: 0; }
        .tv-spec + .tv-spec { border-left: 1px solid rgba(255,255,255,.28); }
        .tv-spec-v { font-family: var(--font-raleway), sans-serif; font-weight: 700; font-size: 3.4vh; line-height: 1;
          font-variant-numeric: tabular-nums; }
        .tv-spec-l { font-size: 1.6vh; color: rgba(255,255,255,.75); margin-top: .7vh; }

        .tv-qr { position: absolute; right: 3.2vw; bottom: 5vh; z-index: 6; display: flex; align-items: center; gap: 1.3vw;
          background: rgba(255,255,255,.1); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,.2); border-radius: 1.6vh; padding: 1.4vh 1.4vw; }
        .tv-qr-img { width: 12vh; height: 12vh; min-width: 96px; min-height: 96px; border-radius: 1vh; display: block;
          background: #fff; padding: .7vh; }
        .tv-qr-text { font-size: 1.7vh; font-weight: 600; line-height: 1.3; color: #fff; text-align: left; white-space: nowrap; }

        .tv-progress { position: absolute; left: 0; bottom: 0; height: .55vh; min-height: 4px; z-index: 7;
          background: linear-gradient(90deg, #1A5C38, #8CF0B4); width: 0; animation-name: tvProgress;
          animation-timing-function: linear; animation-fill-mode: forwards; }
        @keyframes tvProgress { from { width: 0; } to { width: 100%; } }

        .tv-in { animation: tvIn 900ms cubic-bezier(.2,.7,.2,1) both; }
        @keyframes tvIn { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }

        @media (prefers-reduced-motion: reduce) {
          .tv-kb, .tv-in, .tv-layer { animation: none !important; transition: none !important; }
        }
      `}</style>
    </main>
  )
}
