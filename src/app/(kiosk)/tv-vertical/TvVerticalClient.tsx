'use client'

// Kiosco VERTICAL (televisor parado / portrait): UNA propiedad por vez con estilo
// "hero + tira". Una foto principal inmersiva con el precio gigante encima, y
// abajo una tira con el resto de fotos de la MISMA casa + QR. Cicla a la
// siguiente propiedad. Sin interacción — corre todo el día.
//
// El contenido se dibuja SIEMPRE dentro de un marco vertical 9:16 centrado
// (.tvv-stage), sin importar la orientación real de la pantalla: en un tele
// apaisado queda una franja vertical con barras negras a los lados; en el tele
// parado llena la pantalla. Todo se mide en container units (cqw/cqh) relativas
// a ese marco, así los tamaños son correctos en cualquier pantalla.

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
      <main style={{ height: '100dvh', display: 'grid', placeItems: 'center', background: '#08100B' }}>
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
      <div className="tvv-stage">
        {/* HERO inmersivo — foto principal */}
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
      </div>

      <style>{`
        .tvv-root { position: fixed; inset: 0; overflow: hidden; background: #000; }

        /* Marco vertical que llena la pantalla. En una pantalla PORTRAIT (celu)
           se ve normal. En una pantalla LANDSCAPE (el TV, que emite apaisado) el
           contenido se ROTA 90° a la derecha y se dibuja como portrait a pantalla
           completa: al parar físicamente el TV queda derecho. */
        .tvv-stage { position: absolute; top: 50%; left: 50%; overflow: hidden; background: #08100B;
          width: 100vw; height: 100dvh; transform: translate(-50%, -50%);
          container-type: size; display: flex; flex-direction: column; }
        @media (orientation: landscape) {
          .tvv-stage { width: 100dvh; height: 100vw; transform: translate(-50%, -50%) rotate(90deg); }
        }

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
          display: flex; align-items: flex-start; justify-content: space-between; padding: 3cqh 4cqw 0; }
        .tvv-logo { height: 3.4cqh; min-height: 26px; width: auto; filter: drop-shadow(0 2px 10px rgba(0,0,0,.6)); }
        .tvv-clock { text-align: right; text-shadow: 0 2px 12px rgba(0,0,0,.6); }
        .tvv-clock-h { font-family: var(--font-poppins), sans-serif; font-weight: 700; font-size: 3.4cqh; line-height: 1;
          font-variant-numeric: tabular-nums; letter-spacing: -.01em; }
        .tvv-clock-d { font-size: 1.5cqh; color: rgba(255,255,255,.85); margin-top: .4cqh; }

        .tvv-info { position: absolute; left: 0; right: 0; bottom: 0; z-index: 3; padding: 0 4cqw 3.4cqh; }
        .tvv-eyebrow { display: flex; align-items: center; gap: 1.4cqw; margin-bottom: 1.4cqh; flex-wrap: wrap; }
        .tvv-badge { background: #1A5C38; color: #fff; font-weight: 700; font-size: 2.6cqw; letter-spacing: .1em;
          text-transform: uppercase; padding: .6cqh 2.4cqw; border-radius: 999px; }
        .tvv-meta { font-size: 3.2cqw; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: #A6E7BE;
          text-shadow: 0 1px 8px rgba(0,0,0,.6); }
        .tvv-title { font-family: var(--font-raleway), sans-serif; font-weight: 400; font-size: 5cqw; line-height: 1.12;
          margin: 0 0 1.6cqh; color: #fff; text-shadow: 0 2px 14px rgba(0,0,0,.6);
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .tvv-price { font-family: var(--font-poppins), sans-serif; font-weight: 700; font-size: 12cqw; line-height: .95;
          letter-spacing: -.03em; color: #fff; font-variant-numeric: tabular-nums; text-shadow: 0 3px 24px rgba(0,0,0,.55); }
        .tvv-specs { display: flex; margin-top: 2cqh; }
        .tvv-spec { padding: 0 3.4cqw; display: flex; flex-direction: column; }
        .tvv-spec:first-child { padding-left: 0; }
        .tvv-spec:last-child { padding-right: 0; }
        .tvv-spec + .tvv-spec { border-left: 1px solid rgba(255,255,255,.3); }
        .tvv-spec-v { font-family: var(--font-poppins), sans-serif; font-weight: 700; font-size: 6cqw; line-height: 1;
          font-variant-numeric: tabular-nums; text-shadow: 0 2px 12px rgba(0,0,0,.5); }
        .tvv-spec-l { font-size: 2.5cqw; color: rgba(255,255,255,.85); margin-top: .6cqh; }

        /* TIRA */
        .tvv-strip { flex: none; display: flex; gap: 2.4cqw; padding: 2cqh 4cqw 2.6cqh; height: 17cqh; }
        .tvv-thumb { flex: 1; position: relative; border-radius: 2.6cqw; overflow: hidden;
          box-shadow: 0 1cqh 2.4cqh rgba(0,0,0,.5); outline: 1px solid rgba(255,255,255,.08); outline-offset: -1px; }
        .tvv-thumb-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .tvv-qr { flex: none; aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: .6cqh; background: #fff; border-radius: 2.6cqw; padding: 1cqh; box-shadow: 0 1cqh 2.4cqh rgba(0,0,0,.5); }
        .tvv-qr-img { flex: 1; min-height: 0; width: auto; aspect-ratio: 1; display: block; }
        .tvv-qr-t { font-size: 2.2cqw; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; color: #0E1A14; }

        .tvv-progress { position: absolute; left: 0; bottom: 0; height: .6cqh; min-height: 3px; z-index: 8;
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
