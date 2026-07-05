'use client'

// Kiosco VERTICAL (televisor parado / portrait): UNA propiedad por vez con estilo
// "hero + tira". Una foto principal inmersiva a todo lo ancho con el precio
// gigante encima, y abajo una tira con el resto de fotos de la MISMA casa + QR.
// Cicla a la siguiente propiedad. Sin interacción — corre todo el día.

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
  const all = s.photos.length ? s.photos : [s.photo]
  const hero = all[0]
  const thumbs = all.slice(1, 4) // resto de fotos de la misma casa (hasta 3)

  return (
    <main className="tvv-root">
      {/* HERO inmersivo — foto principal a todo lo ancho */}
      <section key={`hero-${idx}`} className="tvv-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={hero} alt="" className="tvv-hero-img tvv-kb" />
        <div className="tvv-scrim-top" />
        <div className="tvv-scrim-bottom" />

        {/* Header sobre la foto */}
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

        {/* Info sobre la foto */}
        <div className="tvv-info tvv-in">
          <div className="tvv-eyebrow">
            {s.destacada && <span className="tvv-badge">Selección SI</span>}
            <span className="tvv-meta">{s.tipo}{s.ubicacion ? ` · ${s.ubicacion}` : ''}</span>
          </div>
          {s.titulo && <h2 className="tvv-title">{s.titulo}</h2>}
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

      {/* TIRA — resto de fotos de la misma casa + QR */}
      <div key={`strip-${idx}`} className="tvv-strip">
        {thumbs.map((src, k) => (
          <div key={k} className="tvv-thumb tvv-in" style={{ animationDelay: `${k * 90}ms` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="tvv-thumb-img" />
          </div>
        ))}
        {s.qr && (
          <div className="tvv-qr tvv-in" style={{ animationDelay: `${thumbs.length * 90}ms` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.qr} alt="Código QR" className="tvv-qr-img" />
            <span className="tvv-qr-t">Escaneá</span>
          </div>
        )}
      </div>

      {/* Barra de progreso */}
      {slides.length > 1 && (
        <div key={`p-${idx}`} className="tvv-progress" style={{ animationDuration: `${SLIDE_MS}ms` }} />
      )}

      <style>{`
        .tvv-root { position: fixed; inset: 0; overflow: hidden; background: #08100B;
          display: flex; flex-direction: column; }

        /* HERO */
        .tvv-hero { position: relative; flex: 1; min-height: 0; overflow: hidden; }
        .tvv-hero-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .tvv-kb { animation: tvvKb ${SLIDE_MS + 2000}ms ease-out forwards; }
        @keyframes tvvKb { from { transform: scale(1.03); } to { transform: scale(1.13); } }
        .tvv-scrim-top { position: absolute; inset: 0; pointer-events: none; z-index: 1;
          background: linear-gradient(180deg, rgba(6,14,9,.72) 0%, rgba(6,14,9,0) 16%); }
        .tvv-scrim-bottom { position: absolute; inset: 0; pointer-events: none; z-index: 1;
          background: linear-gradient(0deg, rgba(6,14,9,.96) 0%, rgba(6,14,9,.75) 18%, rgba(6,14,9,.15) 40%, rgba(6,14,9,0) 58%); }

        .tvv-header { position: absolute; top: 0; left: 0; right: 0; z-index: 3;
          display: flex; align-items: flex-start; justify-content: space-between; padding: 3vh 4vw 0; }
        .tvv-logo { height: 3vh; min-height: 32px; width: auto; filter: drop-shadow(0 2px 10px rgba(0,0,0,.6)); }
        .tvv-clock { text-align: right; text-shadow: 0 2px 12px rgba(0,0,0,.6); }
        .tvv-clock-h { font-family: var(--font-poppins), sans-serif; font-weight: 700; font-size: 3.2vh; line-height: 1;
          font-variant-numeric: tabular-nums; letter-spacing: -.01em; }
        .tvv-clock-d { font-size: 1.4vh; color: rgba(255,255,255,.85); margin-top: .4vh; }

        .tvv-info { position: absolute; left: 0; right: 0; bottom: 0; z-index: 3; padding: 0 4vw 3.4vh; }
        .tvv-eyebrow { display: flex; align-items: center; gap: 1.4vw; margin-bottom: 1.4vh; flex-wrap: wrap; }
        .tvv-badge { background: #1A5C38; color: #fff; font-weight: 700; font-size: 1.55vw; letter-spacing: .1em;
          text-transform: uppercase; padding: .6vh 1.5vw; border-radius: 999px; }
        .tvv-meta { font-size: 2vw; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: #A6E7BE;
          text-shadow: 0 1px 8px rgba(0,0,0,.6); }
        .tvv-title { font-family: var(--font-raleway), sans-serif; font-weight: 400; font-size: 3vw; line-height: 1.12;
          margin: 0 0 1.4vh; color: #fff; text-shadow: 0 2px 14px rgba(0,0,0,.6);
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .tvv-price { font-family: var(--font-poppins), sans-serif; font-weight: 700; font-size: 10.5vw; line-height: .92;
          letter-spacing: -.03em; color: #fff; font-variant-numeric: tabular-nums; text-shadow: 0 3px 24px rgba(0,0,0,.55); }
        .tvv-specs { display: flex; margin-top: 1.8vh; }
        .tvv-spec { padding: 0 2.4vw; display: flex; flex-direction: column; }
        .tvv-spec:first-child { padding-left: 0; }
        .tvv-spec:last-child { padding-right: 0; }
        .tvv-spec + .tvv-spec { border-left: 1px solid rgba(255,255,255,.3); }
        .tvv-spec-v { font-family: var(--font-poppins), sans-serif; font-weight: 700; font-size: 4vw; line-height: 1;
          font-variant-numeric: tabular-nums; text-shadow: 0 2px 12px rgba(0,0,0,.5); }
        .tvv-spec-l { font-size: 1.7vw; color: rgba(255,255,255,.85); margin-top: .6vh; }

        /* TIRA */
        .tvv-strip { flex: none; display: flex; gap: 1.6vw; padding: 1.8vh 4vw 2.4vh; height: 17vh; }
        .tvv-thumb { flex: 1; position: relative; border-radius: 1.8vh; overflow: hidden;
          box-shadow: 0 1vh 2.4vh rgba(0,0,0,.5); outline: 1px solid rgba(255,255,255,.08); outline-offset: -1px; }
        .tvv-thumb-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .tvv-qr { flex: none; aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: .6vh; background: #fff; border-radius: 1.8vh; padding: 1vh; box-shadow: 0 1vh 2.4vh rgba(0,0,0,.5); }
        .tvv-qr-img { flex: 1; min-height: 0; width: auto; aspect-ratio: 1; display: block; }
        .tvv-qr-t { font-size: 1.3vw; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; color: #0E1A14; }

        .tvv-progress { position: absolute; left: 0; bottom: 0; height: .5vh; min-height: 4px; z-index: 8;
          background: linear-gradient(90deg, #1A5C38, #8CF0B4); width: 0; animation-name: tvvProg;
          animation-timing-function: linear; animation-fill-mode: forwards; }
        @keyframes tvvProg { from { width: 0; } to { width: 100%; } }

        /* Entrada como PLUS: arranca desde un estado ya visible; si el navegador
           pausa animaciones (tab en background, navegadores de TV) nada queda oculto. */
        .tvv-in { animation: tvvIn 700ms cubic-bezier(.2,.7,.2,1) both; }
        @keyframes tvvIn { from { opacity: .85; transform: translateY(14px); } to { opacity: 1; transform: none; } }

        @media (prefers-reduced-motion: reduce) {
          .tvv-kb, .tvv-in { animation: none !important; }
        }
      `}</style>
    </main>
  )
}
