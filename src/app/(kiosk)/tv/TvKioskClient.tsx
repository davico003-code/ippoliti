'use client'

// Kiosco de TV HORIZONTAL (rediseño 22-oct-2026): pantalla partida. A la
// izquierda la foto a sangre, que va pasando por hasta 4 fotos de la misma casa
// (Ken Burns + crossfade); a la derecha un panel verde oscuro con los datos en
// letra grande para leer a 3-4 m, sin texto encima de la foto. Las miniaturas
// del panel marcan qué foto se ve. Reloj/fecha y logo oficial (kit de marca).
// Sin interacción — pensado para dejar corriendo en un televisor todo el día.

import { useEffect, useRef, useState } from 'react'
import type { Slide } from '../tvData'

const FOTO_MS = 3000
const FOTOS_POR_CASA = 4
const SLIDE_MS = FOTO_MS * FOTOS_POR_CASA
const RELOAD_MS = 40 * 60 * 1000 // recargar cada 40 min para refrescar stock

const mod = (n: number, m: number) => ((n % m) + m) % m

// Pantalla completa con los prefijos de webkit: los navegadores de los
// televisores suelen tener solo la versión vieja.
type DocFs = Document & { webkitFullscreenElement?: Element | null; webkitExitFullscreen?: () => void }
type ElFs = HTMLElement & { webkitRequestFullscreen?: () => void }
const enPantallaCompleta = () => {
  const d = document as DocFs
  return !!(d.fullscreenElement ?? d.webkitFullscreenElement)
}
const fotosDe = (s: Slide) => (s.photos?.length ? s.photos : [s.photo]).slice(0, FOTOS_POR_CASA)

export default function TvKioskClient({ slides }: { slides: Slide[] }) {
  // Un paso cada FOTO_MS: FOTOS_POR_CASA pasos por casa.
  const [paso, setPaso] = useState(0)
  const [clock, setClock] = useState<{ h: string; d: string } | null>(null)
  const [completa, setCompleta] = useState(false)
  const botonFull = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const t = setInterval(() => setPaso((p) => p + 1), FOTO_MS)
    return () => clearInterval(t)
  }, [])

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

  // El botón "Pantalla completa" se ve solo mientras la página no lo está.
  useEffect(() => {
    const cambio = () => setCompleta(enPantallaCompleta())
    cambio()
    // Con el control remoto alcanza con apretar OK (autoFocus no corre al hidratar).
    botonFull.current?.focus()
    document.addEventListener('fullscreenchange', cambio)
    document.addEventListener('webkitfullscreenchange', cambio)
    return () => {
      document.removeEventListener('fullscreenchange', cambio)
      document.removeEventListener('webkitfullscreenchange', cambio)
    }
  }, [])

  // Tocar/clickear la pantalla (o el botón) → pantalla completa; el TV no maximiza solo.
  const toggleFullscreen = () => {
    const d = document as DocFs
    const el = document.documentElement as ElFs
    if (!enPantallaCompleta()) {
      if (el.requestFullscreen) el.requestFullscreen().catch(() => {})
      else el.webkitRequestFullscreen?.()
    } else if (d.exitFullscreen) d.exitFullscreen().catch(() => {})
    else d.webkitExitFullscreen?.()
  }

  if (slides.length === 0) {
    return (
      <main style={{ height: '100dvh', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/si-inmobiliaria-blanco.svg" alt="SI INMOBILIARIA" style={{ height: 64, width: 'auto', opacity: 0.9 }} />
      </main>
    )
  }

  // Se montan la casa anterior (para el fundido), la actual y la siguiente
  // (así sus fotos ya están bajadas cuando le toca).
  const idx = Math.floor(paso / FOTOS_POR_CASA) % slides.length
  const foto = paso % FOTOS_POR_CASA
  const montadas = new Set([mod(idx - 1, slides.length), idx, mod(idx + 1, slides.length)])
  const s = slides[idx]
  const fotos = fotosDe(s)
  const visible = foto % fotos.length
  const precioLargo = s.precio.length > 11

  return (
    <main className="tv-root" onClick={toggleFullscreen} title="Tocar para pantalla completa">
      {/* Foto a sangre (izquierda) */}
      <section className="tv-foto">
        {slides.map((sl, i) =>
          montadas.has(i)
            ? fotosDe(sl).map((src, k) => {
                const activa = i === idx && k === visible
                return (
                  <div key={`${i}-${k}`} className="tv-layer" style={{ opacity: activa ? 1 : 0, zIndex: activa ? 2 : 1 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className={`tv-img ${activa ? (k % 2 ? 'tv-kb-b' : 'tv-kb-a') : ''}`} />
                  </div>
                )
              })
            : null,
        )}
        {s.destacada && <span className="tv-badge">Selección SI</span>}
        {!completa && (
          <button
            ref={botonFull}
            type="button"
            className="tv-full"
            onClick={(e) => {
              e.stopPropagation()
              toggleFullscreen()
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
            </svg>
            Pantalla completa
          </button>
        )}
      </section>

      {/* Panel de datos (derecha) */}
      <aside className="tv-panel">
        <header className="tv-top">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/si-inmobiliaria-blanco.svg" alt="SI INMOBILIARIA" className="tv-logo" />
          {clock && (
            <div className="tv-clock">
              <div className="tv-clock-h">{clock.h}</div>
              <div className="tv-clock-d">{clock.d}</div>
            </div>
          )}
        </header>

        <div key={idx} className="tv-datos tv-in">
          <div className="tv-tipo">{s.tipo}</div>
          {s.ubicacion && <div className="tv-ubicacion">{s.ubicacion}</div>}
          {s.titulo && <h2 className="tv-titulo">{s.titulo}</h2>}
          <div className="tv-precio" style={{ fontSize: precioLargo ? '6vh' : '7.4vh' }}>{s.precio}</div>
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

        {fotos.length > 1 && (
          <div className="tv-tira">
            {fotos.map((src, k) => (
              <div key={`${idx}-${k}`} className={`tv-mini ${k === visible ? 'tv-mini-on' : ''}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" />
              </div>
            ))}
          </div>
        )}

        <footer className="tv-pie">
          <span>siinmobiliaria.com</span>
          <span className="tv-contador">{idx + 1} / {slides.length}</span>
        </footer>
        <div key={`p-${idx}`} className="tv-progress" style={{ animationDuration: `${SLIDE_MS}ms` }} />
      </aside>

      <style>{`
        .tv-root { position: fixed; inset: 0; overflow: hidden; background: #0A1F14; display: grid;
          grid-template-columns: 1fr 34vw; }

        .tv-foto { position: relative; overflow: hidden; background: #08100B; }
        .tv-layer { position: absolute; inset: 0; transition: opacity 1000ms ease-in-out; }
        .tv-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .tv-kb-a { animation: tvKbA ${FOTO_MS + 1200}ms ease-out forwards; }
        .tv-kb-b { animation: tvKbB ${FOTO_MS + 1200}ms ease-out forwards; }
        @keyframes tvKbA { from { transform: scale(1.02); } to { transform: scale(1.09) translate3d(-1%, -1%, 0); } }
        @keyframes tvKbB { from { transform: scale(1.09) translate3d(-1%, 0, 0); } to { transform: scale(1.02) translate3d(1%, -1%, 0); } }
        .tv-badge { position: absolute; top: 4vh; left: 3vw; z-index: 3; background: #17613C; color: #fff;
          font-weight: 700; font-size: 1.9vh; letter-spacing: .12em; text-transform: uppercase;
          padding: 1vh 1.6vw; border-radius: 999px; box-shadow: 0 .8vh 2.4vh rgba(0,0,0,.35); }

        .tv-full { position: absolute; left: 3vw; bottom: 4vh; z-index: 3; display: inline-flex; align-items: center;
          gap: 1vw; padding: 1.6vh 2vw; border: 0; border-radius: 999px; background: #fff; color: #0A2418;
          font: 700 2.4vh/1 var(--font-poppins), sans-serif; cursor: pointer; box-shadow: 0 1vh 3vh rgba(0,0,0,.4); }
        .tv-full svg { width: 3vh; height: 3vh; fill: none; stroke: currentColor; stroke-width: 2.4;
          stroke-linecap: round; stroke-linejoin: round; }
        .tv-full:focus-visible { outline: .5vh solid #8FE3B0; outline-offset: .5vh; }

        .tv-panel { position: relative; display: flex; flex-direction: column; padding: 5vh 3vw 0;
          background: linear-gradient(170deg, #12432B 0%, #0A2418 55%, #071A11 100%);
          border-left: .4vh solid #17613C; }

        .tv-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 2vw; }
        .tv-logo { height: 3.4vh; width: auto; margin-top: .6vh; }
        .tv-clock { text-align: right; }
        .tv-clock-h { font-weight: 700; font-size: 3.6vh; line-height: 1; letter-spacing: -.01em;
          font-variant-numeric: tabular-nums; }
        .tv-clock-d { font-size: 1.7vh; color: rgba(255,255,255,.7); margin-top: .6vh; }

        .tv-datos { margin-top: auto; }
        .tv-tipo { font-size: 2vh; font-weight: 600; letter-spacing: .16em; text-transform: uppercase;
          color: rgba(255,255,255,.65); }
        .tv-ubicacion { font-size: 3vh; font-weight: 600; line-height: 1.15; color: #8FE3B0; margin-top: 1vh;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .tv-titulo { font-family: var(--font-raleway), sans-serif; font-weight: 400; font-size: 2.9vh; line-height: 1.2;
          margin: 2vh 0 0; color: rgba(255,255,255,.92);
          display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .tv-precio { font-weight: 700; line-height: 1; letter-spacing: -.02em; margin-top: 3.2vh;
          font-variant-numeric: tabular-nums; white-space: nowrap; }

        .tv-specs { display: grid; grid-template-columns: 1fr 1fr; gap: 2.4vh 2vw; margin-top: 4vh;
          padding-top: 3.4vh; border-top: 1px solid rgba(255,255,255,.18); }
        .tv-spec { display: flex; flex-direction: column; }
        .tv-spec-v { font-weight: 700; font-size: 4.4vh; line-height: 1; font-variant-numeric: tabular-nums; }
        .tv-spec-l { font-size: 1.9vh; color: rgba(255,255,255,.7); margin-top: .8vh; }

        .tv-tira { display: grid; grid-template-columns: repeat(4, 1fr); gap: .8vw; margin-top: 4.4vh; }
        .tv-mini { aspect-ratio: 4 / 3; border-radius: 1vh; overflow: hidden; opacity: .45;
          outline: .35vh solid transparent; outline-offset: .3vh; transition: opacity 600ms, outline-color 600ms; }
        .tv-mini img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .tv-mini-on { opacity: 1; outline-color: #8FE3B0; }

        .tv-pie { display: flex; justify-content: space-between; align-items: center; margin-top: 3.6vh;
          padding: 2.4vh 0 3vh; border-top: 1px solid rgba(255,255,255,.12);
          font-size: 1.7vh; color: rgba(255,255,255,.6); letter-spacing: .04em; }
        .tv-contador { font-variant-numeric: tabular-nums; }

        .tv-progress { position: absolute; left: 0; bottom: 0; height: .5vh; min-height: 4px;
          background: linear-gradient(90deg, #17613C, #8FE3B0); width: 0; animation-name: tvProgress;
          animation-timing-function: linear; animation-fill-mode: forwards; }
        @keyframes tvProgress { from { width: 0; } to { width: 100%; } }

        /* Entrada: arranca visible (opacity .85) para que nunca quede en blanco
           si el navegador pausa animaciones. */
        .tv-in { animation: tvIn 800ms cubic-bezier(.2,.7,.2,1) both; }
        @keyframes tvIn { from { opacity: .85; transform: translateY(16px); } to { opacity: 1; transform: none; } }

        @media (prefers-reduced-motion: reduce) {
          .tv-kb-a, .tv-kb-b, .tv-in, .tv-layer, .tv-mini { animation: none !important; transition: none !important; }
        }
      `}</style>
    </main>
  )
}
