'use client'

// Kiosco VERTICAL (televisor parado / portrait): muestra 3 propiedades apiladas
// en columna, cada una con foto (Ken Burns), precio, datos y QR. El set de 3
// cicla en loop. Sin interacción — pensado para dejar corriendo todo el día.

import { useEffect, useState } from 'react'
import type { Slide } from '../tvData'

const SET_MS = 12000
const RELOAD_MS = 40 * 60 * 1000

export default function TvVerticalClient({ slides }: { slides: Slide[] }) {
  const [page, setPage] = useState(0)
  const [clock, setClock] = useState<{ h: string; d: string } | null>(null)

  const perPage = Math.min(3, slides.length || 1)
  const pages = perPage > 0 ? Math.ceil(slides.length / perPage) : 1

  useEffect(() => {
    if (slides.length <= perPage) return
    const t = setInterval(() => setPage((p) => (p + 1) % pages), SET_MS)
    return () => clearInterval(t)
  }, [slides.length, perPage, pages])

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

  const visibles = Array.from({ length: perPage }, (_, k) => slides[(page * perPage + k) % slides.length])

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

      {/* Columna de tarjetas (cicla el set) */}
      <div className="tvv-col">
        {visibles.map((s, k) => (
          <article
            key={`${page}-${k}`}
            className="tvv-card tvv-in"
            style={{ animationDelay: `${k * 140}ms` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.photo} alt="" className="tvv-photo tvv-kb" />
            <div className="tvv-card-scrim" />

            {s.qr && (
              <div className="tvv-qr">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.qr} alt="Código QR" className="tvv-qr-img" />
                <span className="tvv-qr-t">Escaneá</span>
              </div>
            )}

            <div className="tvv-card-body">
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
          </article>
        ))}
      </div>

      {/* Barra de progreso del set */}
      {slides.length > perPage && (
        <div key={`p-${page}`} className="tvv-progress" style={{ animationDuration: `${SET_MS}ms` }} />
      )}

      <style>{`
        .tvv-root { position: fixed; inset: 0; overflow: hidden; background: #08100B;
          display: flex; flex-direction: column; }
        .tvv-header { flex: none; display: flex; align-items: center; justify-content: space-between;
          padding: 2.6vh 3.4vw 1.8vh; }
        .tvv-logo { height: 2.8vh; min-height: 30px; width: auto; filter: drop-shadow(0 2px 8px rgba(0,0,0,.5)); }
        .tvv-clock { text-align: right; }
        .tvv-clock-h { font-family: var(--font-raleway), sans-serif; font-weight: 700; font-size: 2.6vh; line-height: 1;
          font-variant-numeric: tabular-nums; }
        .tvv-clock-d { font-size: 1.35vh; color: rgba(255,255,255,.75); margin-top: .4vh; }

        .tvv-col { flex: 1; display: flex; flex-direction: column; gap: 1.6vh; padding: 0 2.6vw 2.6vh; min-height: 0; }
        .tvv-card { position: relative; flex: 1; min-height: 0; border-radius: 2.2vh; overflow: hidden;
          box-shadow: 0 1.2vh 3vh rgba(0,0,0,.4); }
        .tvv-photo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .tvv-kb { animation: tvvKb ${SET_MS + 2000}ms ease-out forwards; }
        @keyframes tvvKb { from { transform: scale(1.02); } to { transform: scale(1.12); } }
        .tvv-card-scrim { position: absolute; inset: 0;
          background: linear-gradient(0deg, rgba(6,14,9,.92) 0%, rgba(6,14,9,.42) 34%, rgba(6,14,9,0) 62%),
                      linear-gradient(90deg, rgba(6,14,9,.55) 0%, rgba(6,14,9,0) 40%); }

        .tvv-card-body { position: absolute; left: 3.4vw; right: 3.4vw; bottom: 3vh; z-index: 2; }
        .tvv-eyebrow { display: flex; align-items: center; gap: 1.4vw; margin-bottom: 1vh; flex-wrap: wrap; }
        .tvv-badge { background: #1A5C38; color: #fff; font-weight: 700; font-size: 1.5vw; letter-spacing: .1em;
          text-transform: uppercase; padding: .5vh 1.4vw; border-radius: 999px; }
        .tvv-meta { font-size: 1.8vw; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: #A6E7BE;
          text-shadow: 0 1px 6px rgba(0,0,0,.5); }
        .tvv-title { font-family: var(--font-raleway), sans-serif; font-weight: 400; font-size: 2.6vw; line-height: 1.14;
          margin: 0 0 1vh; color: #fff; text-shadow: 0 2px 12px rgba(0,0,0,.5);
          display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .tvv-price { font-family: var(--font-raleway), sans-serif; font-weight: 800; font-size: 6vw; line-height: 1;
          letter-spacing: -.02em; color: #fff; text-shadow: 0 3px 20px rgba(0,0,0,.5); font-variant-numeric: tabular-nums; }
        .tvv-specs { display: flex; margin-top: 1.6vh; }
        .tvv-spec { padding: 0 2.4vw; display: flex; flex-direction: column; }
        .tvv-spec:first-child { padding-left: 0; }
        .tvv-spec + .tvv-spec { border-left: 1px solid rgba(255,255,255,.28); }
        .tvv-spec-v { font-family: var(--font-raleway), sans-serif; font-weight: 700; font-size: 2.5vw; line-height: 1;
          font-variant-numeric: tabular-nums; }
        .tvv-spec-l { font-size: 1.4vw; color: rgba(255,255,255,.75); margin-top: .5vh; }

        .tvv-qr { position: absolute; top: 2.2vh; right: 2.4vw; z-index: 3; display: flex; flex-direction: column;
          align-items: center; gap: .5vh; background: rgba(255,255,255,.12); backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,.22); border-radius: 1.4vh;
          padding: 1vh 1vw; }
        .tvv-qr-img { width: 8vh; height: 8vh; min-width: 70px; min-height: 70px; background: #fff; border-radius: .8vh;
          padding: .5vh; display: block; }
        .tvv-qr-t { font-size: 1.3vw; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: #fff; }

        .tvv-progress { position: absolute; left: 0; bottom: 0; height: .5vh; min-height: 4px; z-index: 8;
          background: linear-gradient(90deg, #1A5C38, #8CF0B4); width: 0; animation-name: tvvProg;
          animation-timing-function: linear; animation-fill-mode: forwards; }
        @keyframes tvvProg { from { width: 0; } to { width: 100%; } }

        /* Entrada como PLUS: arranca desde un estado ya visible (opacity .85 +
           leve slide). Si el navegador pausa las animaciones (tab en background,
           navegadores de TV/signage) las tarjetas NUNCA quedan invisibles. */
        .tvv-in { animation: tvvIn 700ms cubic-bezier(.2,.7,.2,1) both; }
        @keyframes tvvIn { from { opacity: .85; transform: translateY(16px); } to { opacity: 1; transform: none; } }

        @media (prefers-reduced-motion: reduce) {
          .tvv-kb, .tvv-in { animation: none !important; }
        }
      `}</style>
    </main>
  )
}
