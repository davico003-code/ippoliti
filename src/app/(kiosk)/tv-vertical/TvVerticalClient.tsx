'use client'

// Kiosco VERTICAL (televisor parado / portrait): muestra UNA propiedad por vez
// con 3 fotos de esa MISMA casa apiladas en columna (aprovechando el alto), su
// precio/datos/QR una sola vez, y cicla a la siguiente propiedad. Sin
// interacción — pensado para dejar corriendo todo el día.

import { useEffect, useState } from 'react'
import type { Slide } from '../tvData'

const SLIDE_MS = 11000
const RELOAD_MS = 40 * 60 * 1000

export default function TvVerticalClient({ slides }: { slides: Slide[] }) {
  const [idx, setIdx] = useState(0)
  const [clock, setClock] = useState<{ h: string; d: string } | null>(null)

  useEffect(() => {
    if (slides.length <= 1) return
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), SLIDE_MS)
    return () => clearInterval(t)
  }, [slides.length])

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

  useEffect(() => {
    const t = setTimeout(() => window.location.reload(), RELOAD_MS)
    return () => clearTimeout(t)
  }, [])

  if (slides.length === 0) {
    return (
      <main style={{ height: '100dvh', display: 'grid', placeItems: 'center' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-blanco.webp" alt="SI INMOBILIARIA" style={{ height: 56, width: 'auto', opacity: 0.9 }} />
      </main>
    )
  }

  const s = slides[idx]
  // Siempre 3 huecos de foto; si la propiedad tiene menos, repetimos para llenar.
  const fotos = s.photos.length
    ? Array.from({ length: 3 }, (_, i) => s.photos[i % s.photos.length])
    : [s.photo, s.photo, s.photo]

  return (
    <main className="tvv-root">
      {/* Header */}
      <header className="tvv-header">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-blanco.webp" alt="SI INMOBILIARIA" className="tvv-logo" />
        {clock && (
          <div className="tvv-clock">
            <div className="tvv-clock-h">{clock.h}</div>
            <div className="tvv-clock-d">{clock.d}</div>
          </div>
        )}
      </header>

      {/* 3 fotos de la MISMA propiedad, apiladas. key={idx} → reanima al cambiar. */}
      <div key={idx} className="tvv-photos">
        {fotos.map((src, k) => (
          <div key={k} className="tvv-shot tvv-in" style={{ animationDelay: `${k * 120}ms` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="tvv-photo tvv-kb" />
            <div className="tvv-shot-scrim" />
          </div>
        ))}

        {/* QR de la propiedad (arriba a la derecha, sobre las fotos) */}
        {s.qr && (
          <div className="tvv-qr">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.qr} alt="Código QR" className="tvv-qr-img" />
            <span className="tvv-qr-t">Escaneá</span>
          </div>
        )}
      </div>

      {/* Info de la propiedad (una sola vez) */}
      <section key={`info-${idx}`} className="tvv-info tvv-in">
        <div className="tvv-eyebrow">
          {s.destacada && <span className="tvv-badge">Selección SI</span>}
          <span className="tvv-meta">{s.tipo}{s.ubicacion ? ` · ${s.ubicacion}` : ''}</span>
        </div>
        {s.titulo && <h2 className="tvv-title">{s.titulo}</h2>}
        <div className="tvv-row">
          <div className="tvv-price">{s.precio}</div>
          {s.specs.length > 0 && (
            <div className="tvv-specs">
              {s.specs.map((sp, i) => (
                <div key={i} className="tvv-spec">
                  <span className="tvv-spec-v">{sp.v}</span>
                  <span className="tvv-spec-l">{sp.l}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Barra de progreso del slide */}
      {slides.length > 1 && (
        <div key={`p-${idx}`} className="tvv-progress" style={{ animationDuration: `${SLIDE_MS}ms` }} />
      )}

      <style>{`
        .tvv-root { position: fixed; inset: 0; overflow: hidden; background: #08100B;
          display: flex; flex-direction: column; }
        .tvv-header { flex: none; display: flex; align-items: center; justify-content: space-between;
          padding: 2.4vh 3.4vw 1.6vh; }
        .tvv-logo { height: 2.8vh; min-height: 30px; width: auto; filter: drop-shadow(0 2px 8px rgba(0,0,0,.5)); }
        .tvv-clock { text-align: right; }
        .tvv-clock-h { font-family: var(--font-raleway), sans-serif; font-weight: 700; font-size: 2.6vh; line-height: 1;
          font-variant-numeric: tabular-nums; }
        .tvv-clock-d { font-size: 1.35vh; color: rgba(255,255,255,.75); margin-top: .4vh; }

        .tvv-photos { position: relative; flex: 1; display: flex; flex-direction: column; gap: 1.3vh;
          padding: 0 2.6vw; min-height: 0; }
        .tvv-shot { position: relative; flex: 1; min-height: 0; border-radius: 2vh; overflow: hidden;
          box-shadow: 0 1vh 2.6vh rgba(0,0,0,.4); }
        .tvv-photo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .tvv-kb { animation: tvvKb ${SLIDE_MS + 2000}ms ease-out forwards; }
        @keyframes tvvKb { from { transform: scale(1.02); } to { transform: scale(1.12); } }
        .tvv-shot-scrim { position: absolute; inset: 0;
          background: linear-gradient(90deg, rgba(6,14,9,.35) 0%, rgba(6,14,9,0) 30%); }

        .tvv-qr { position: absolute; top: 2vh; right: 2.4vw; z-index: 4; display: flex; flex-direction: column;
          align-items: center; gap: .5vh; background: rgba(255,255,255,.14); backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,.25); border-radius: 1.4vh;
          padding: 1vh 1vw; box-shadow: 0 .6vh 2vh rgba(0,0,0,.35); }
        .tvv-qr-img { width: 8.4vh; height: 8.4vh; min-width: 72px; min-height: 72px; background: #fff; border-radius: .8vh;
          padding: .5vh; display: block; }
        .tvv-qr-t { font-size: 1.4vw; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: #fff; }

        .tvv-info { flex: none; padding: 2.4vh 3.4vw 3vh; }
        .tvv-eyebrow { display: flex; align-items: center; gap: 1.4vw; margin-bottom: 1.2vh; flex-wrap: wrap; }
        .tvv-badge { background: #1A5C38; color: #fff; font-weight: 700; font-size: 1.5vw; letter-spacing: .1em;
          text-transform: uppercase; padding: .5vh 1.4vw; border-radius: 999px; }
        .tvv-meta { font-size: 1.9vw; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: #A6E7BE; }
        .tvv-title { font-family: var(--font-raleway), sans-serif; font-weight: 400; font-size: 3vw; line-height: 1.14;
          margin: 0 0 1.6vh; color: #fff;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .tvv-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 2vw; flex-wrap: wrap; }
        .tvv-price { font-family: var(--font-raleway), sans-serif; font-weight: 800; font-size: 6.4vw; line-height: 1;
          letter-spacing: -.02em; color: #fff; font-variant-numeric: tabular-nums; }
        .tvv-specs { display: flex; padding-bottom: .6vh; }
        .tvv-spec { padding: 0 2vw; display: flex; flex-direction: column; }
        .tvv-spec:last-child { padding-right: 0; }
        .tvv-spec + .tvv-spec { border-left: 1px solid rgba(255,255,255,.28); }
        .tvv-spec-v { font-family: var(--font-raleway), sans-serif; font-weight: 700; font-size: 2.6vw; line-height: 1;
          font-variant-numeric: tabular-nums; }
        .tvv-spec-l { font-size: 1.4vw; color: rgba(255,255,255,.75); margin-top: .5vh; }

        .tvv-progress { position: absolute; left: 0; bottom: 0; height: .5vh; min-height: 4px; z-index: 8;
          background: linear-gradient(90deg, #1A5C38, #8CF0B4); width: 0; animation-name: tvvProg;
          animation-timing-function: linear; animation-fill-mode: forwards; }
        @keyframes tvvProg { from { width: 0; } to { width: 100%; } }

        /* Entrada como PLUS: arranca desde un estado ya visible (opacity .85 +
           leve slide). Si el navegador pausa las animaciones (tab en background,
           navegadores de TV/signage) el contenido NUNCA queda invisible. */
        .tvv-in { animation: tvvIn 700ms cubic-bezier(.2,.7,.2,1) both; }
        @keyframes tvvIn { from { opacity: .85; transform: translateY(16px); } to { opacity: 1; transform: none; } }

        @media (prefers-reduced-motion: reduce) {
          .tvv-kb, .tvv-in { animation: none !important; }
        }
      `}</style>
    </main>
  )
}
