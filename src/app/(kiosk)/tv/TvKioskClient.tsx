'use client'

// Kiosco de TV HORIZONTAL: una propiedad a pantalla completa con Ken Burns +
// crossfade, precio y datos, burbujas redondas con el resto de fotos de la misma
// casa y QR para abrir en el celular. Reloj/fecha y branding SI. Sin interacción
// — pensado para dejar corriendo en un televisor todo el día.

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
  const bubbles = (s.photos ?? []).slice(1, 4) // resto de fotos de la misma casa

  return (
    <main className="tv-root">
      {/* Capas de foto (crossfade + Ken Burns; alterna dirección para no aburrir) */}
      {slides.map((sl, i) =>
        windowIdx.has(i) ? (
          <div key={i} className="tv-layer" style={{ opacity: i === idx ? 1 : 0, zIndex: i === idx ? 2 : 1 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sl.photo} alt="" className={`tv-photo ${i === idx ? (idx % 2 ? 'tv-kb tv-kb-b' : 'tv-kb tv-kb-a') : ''}`} />
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

      {/* Columna derecha: burbujas de fotos + QR */}
      <div key={`side-${idx}`} className="tv-side">
        {bubbles.map((src, k) => (
          <div key={k} className="tv-bubble" style={{ animationDelay: `${120 + k * 120}ms` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="tv-bubble-img" />
          </div>
        ))}
        {s.qr && (
          <div className="tv-qr" style={{ animationDelay: `${120 + bubbles.length * 120}ms` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.qr} alt="Código QR de la propiedad" className="tv-qr-img" />
            <div className="tv-qr-text">Escaneá</div>
          </div>
        )}
      </div>

      {/* Barra de progreso */}
      <div key={`p-${idx}`} className="tv-progress" style={{ animationDuration: `${SLIDE_MS}ms` }} />

      <style>{`
        .tv-root { position: fixed; inset: 0; overflow: hidden; background: #08100B; }
        .tv-layer { position: absolute; inset: 0; transition: opacity 1100ms ease-in-out; }
        .tv-photo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .tv-kb-a { animation: tvKbA ${SLIDE_MS + 1500}ms ease-out forwards; }
        .tv-kb-b { animation: tvKbB ${SLIDE_MS + 1500}ms ease-out forwards; }
        @keyframes tvKbA { from { transform: scale(1.02) translate3d(0,0,0); } to { transform: scale(1.14) translate3d(-1.5%, -1.5%, 0); } }
        @keyframes tvKbB { from { transform: scale(1.14) translate3d(-1.5%, 0, 0); } to { transform: scale(1.02) translate3d(1.5%, -1.5%, 0); } }
        .tv-scrim-bottom { position: absolute; inset: 0; z-index: 3; pointer-events: none;
          background: linear-gradient(0deg, rgba(6,14,9,.94) 0%, rgba(6,14,9,.55) 26%, rgba(6,14,9,0) 55%); }
        .tv-scrim-left { position: absolute; inset: 0; z-index: 3; pointer-events: none;
          background: linear-gradient(100deg, rgba(6,14,9,.72) 0%, rgba(6,14,9,.2) 34%, rgba(6,14,9,0) 58%); }

        .tv-logo { position: absolute; top: 3.4vh; left: 3.2vw; z-index: 6; height: 3.2vh; min-height: 26px; width: auto;
          filter: drop-shadow(0 2px 10px rgba(0,0,0,.5)); }

        .tv-clock { position: absolute; top: 3vh; right: 3.2vw; z-index: 6; text-align: right;
          text-shadow: 0 2px 12px rgba(0,0,0,.5); }
        .tv-clock-h { font-family: var(--font-poppins), sans-serif; font-weight: 700; font-size: 3.4vh; line-height: 1;
          letter-spacing: -.01em; font-variant-numeric: tabular-nums; }
        .tv-clock-d { font-size: 1.5vh; color: rgba(255,255,255,.8); margin-top: .6vh; }

        .tv-content { position: absolute; left: 3.2vw; bottom: 5vh; z-index: 6; max-width: 58vw; }
        .tv-eyebrow { display: flex; align-items: center; gap: 1.2vw; margin-bottom: 1.6vh; }
        .tv-badge { background: #1A5C38; color: #fff; font-weight: 700; font-size: 1.5vh; letter-spacing: .12em;
          text-transform: uppercase; padding: .7vh 1.2vw; border-radius: 999px; }
        .tv-meta { font-size: 1.9vh; font-weight: 600; letter-spacing: .1em; text-transform: uppercase;
          color: #A6E7BE; text-shadow: 0 1px 8px rgba(0,0,0,.5); }
        .tv-title { font-family: var(--font-raleway), sans-serif; font-weight: 400; font-size: 3.2vh; line-height: 1.12;
          margin: 0 0 1.6vh; color: #fff; text-shadow: 0 2px 16px rgba(0,0,0,.5); max-width: 42ch;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .tv-price { font-family: var(--font-poppins), sans-serif; font-weight: 700; font-size: 6.4vh; line-height: 1;
          letter-spacing: -.02em; color: #fff; text-shadow: 0 3px 30px rgba(0,0,0,.5); font-variant-numeric: tabular-nums; }
        .tv-specs { display: flex; align-items: stretch; margin-top: 2.6vh; gap: 0; }
        .tv-spec { padding: 0 1.8vw; display: flex; flex-direction: column; }
        .tv-spec:first-child { padding-left: 0; }
        .tv-spec + .tv-spec { border-left: 1px solid rgba(255,255,255,.28); }
        .tv-spec-v { font-family: var(--font-poppins), sans-serif; font-weight: 700; font-size: 3vh; line-height: 1;
          font-variant-numeric: tabular-nums; }
        .tv-spec-l { font-size: 1.5vh; color: rgba(255,255,255,.75); margin-top: .7vh; }

        /* Columna derecha: burbujas + QR, centradas verticalmente */
        .tv-side { position: absolute; right: 3.4vw; top: 50%; transform: translateY(-50%); z-index: 6;
          display: flex; flex-direction: column; align-items: center; gap: 2.6vh; }
        .tv-bubble { width: 15vh; height: 15vh; border-radius: 50%; overflow: hidden; position: relative;
          border: .35vh solid rgba(255,255,255,.9); box-shadow: 0 1.4vh 3vh rgba(0,0,0,.5);
          animation: tvPop 700ms cubic-bezier(.34,1.56,.64,1) both; }
        .tv-bubble-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .tv-qr { width: 15vh; display: flex; flex-direction: column; align-items: center; gap: .8vh;
          background: #fff; border-radius: 1.6vh; padding: 1.2vh; box-shadow: 0 1.4vh 3vh rgba(0,0,0,.5);
          animation: tvPop 700ms cubic-bezier(.34,1.56,.64,1) both; }
        .tv-qr-img { width: 100%; aspect-ratio: 1; display: block; }
        .tv-qr-text { font-size: 1.5vh; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; color: #0E1A14; }

        .tv-progress { position: absolute; left: 0; bottom: 0; height: .55vh; min-height: 4px; z-index: 7;
          background: linear-gradient(90deg, #1A5C38, #8CF0B4); width: 0; animation-name: tvProgress;
          animation-timing-function: linear; animation-fill-mode: forwards; }
        @keyframes tvProgress { from { width: 0; } to { width: 100%; } }

        /* Entradas: arrancan desde estado visible (opacity .85) para que nunca
           queden en blanco si el navegador pausa animaciones. */
        .tv-in { animation: tvIn 800ms cubic-bezier(.2,.7,.2,1) both; }
        @keyframes tvIn { from { opacity: .85; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        @keyframes tvPop { from { opacity: .5; transform: scale(.7); } to { opacity: 1; transform: scale(1); } }

        @media (prefers-reduced-motion: reduce) {
          .tv-kb-a, .tv-kb-b, .tv-in, .tv-layer, .tv-bubble, .tv-qr { animation: none !important; transition: none !important; }
        }
      `}</style>
    </main>
  )
}
