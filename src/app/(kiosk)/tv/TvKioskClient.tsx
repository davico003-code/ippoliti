'use client'

// Kiosco de TV (rediseño 22-oct-2026): pantalla partida. La foto a sangre va
// pasando por hasta 4 fotos de la misma casa (Ken Burns + crossfade) y un panel
// verde oscuro lleva los datos en letra grande para leer a 3-4 m, sin texto
// encima de la foto. Las miniaturas del panel marcan qué foto se ve. Reloj/fecha
// y logo oficial (kit de marca). Pensado para dejar corriendo todo el día.
//
// Acostada (/tv): foto a la izquierda, panel a la derecha. Parada
// (/tv-vertical, o /tv en una pantalla vertical): foto arriba, panel abajo. Un
// televisor parado sigue mandando la imagen acostada, así que /tv-vertical gira
// la página 90° (con el botón "Girar", para el otro lado). Las medidas van en
// vmin (el lado corto de la pantalla), que sirven igual en las tres posiciones.

import { useEffect, useRef, useState } from 'react'
import type { Slide } from '../tvData'

const FOTO_MS = 4000
const FUNDIDO_MS = 1600 // cruce entre fotos; el movimiento dura la foto + su salida
const FOTOS_POR_CASA = 4
const SLIDE_MS = FOTO_MS * FOTOS_POR_CASA
const RELOAD_MS = 40 * 60 * 1000 // recargar (stock nuevo) pasados 40 min, al terminar la vuelta

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

// Qué casa y qué foto se ven en un paso, y con qué movimiento. Cada vez que una
// foto vuelve a verse cambia de dirección (eso reinicia el Ken Burns); con una
// sola foto no se reinicia, sigue su recorrido.
function enPaso(slides: Slide[], p: number) {
  const idx = Math.floor(p / FOTOS_POR_CASA) % slides.length
  const foto = p % FOTOS_POR_CASA
  const n = fotosDe(slides[idx]).length
  const visible = foto % n
  const vuelta = n > 1 ? Math.floor(foto / n) : 0
  return { idx, visible, kb: (visible + vuelta) % 2 ? 'tv-kb-b' : 'tv-kb-a' }
}

// Reglas de la tele parada (1080 × 1920): se aplican con /tv-vertical y en
// cualquier pantalla vertical. Datos en una fila de 4 y título en 2 líneas para
// que todo entre en el panel de abajo.
const reglasParada = (pre: string) => `
  ${pre} .tv-stage { grid-template-columns: 1fr; grid-template-rows: 52% 48%; }
  ${pre} .tv-panel { padding: 4vmin 5vmin 0; border-left: 0; border-top: .4vmin solid #17613C; }
  ${pre} .tv-badge { left: 5vmin; padding: 1vmin 2.6vmin; }
  ${pre} .tv-full { left: 5vmin; gap: 1.6vmin; padding: 1.6vmin 3.4vmin; }
  ${pre} .tv-girar { left: auto; right: 5vmin; }
  ${pre} .tv-top { gap: 3vmin; }
  ${pre} .tv-datos { padding-top: 3vmin; }
  ${pre} .tv-titulo { -webkit-line-clamp: 2; }
  ${pre} .tv-specs { grid-template-columns: repeat(4, 1fr); gap: 2vmin; }
  ${pre} .tv-tira { gap: 1.6vmin; }
`

const GIRO_KEY = 'si.tv-vertical.girada-al-reves'

export default function TvKioskClient({ slides, vertical = false }: { slides: Slide[]; vertical?: boolean }) {
  // Un paso cada FOTO_MS: FOTOS_POR_CASA pasos por casa.
  const [paso, setPaso] = useState(0)
  const [clock, setClock] = useState<{ h: string; d: string } | null>(null)
  const [completa, setCompleta] = useState(false)
  const botonFull = useRef<HTMLButtonElement>(null)
  // Tele parada al revés de lo previsto: el giro va para el otro lado.
  const [alReves, setAlReves] = useState(false)

  useEffect(() => {
    if (!vertical) return
    try {
      setAlReves(localStorage.getItem(GIRO_KEY) === '1')
    } catch { /* sin almacenamiento: gira para el lado de siempre */ }
  }, [vertical])

  const girar = () => {
    setAlReves((v) => {
      try {
        localStorage.setItem(GIRO_KEY, v ? '0' : '1')
      } catch { /* sin almacenamiento: vale hasta recargar */ }
      return !v
    })
  }

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

  // Recarga para traer stock nuevo: pasados RELOAD_MS, recién al terminar la
  // vuelta, así ninguna casa se queda sin salir aunque la vuelta dure más (con
  // ~130 casas son ~35 min). Sin casas (feed caído) recarga a los RELOAD_MS.
  const inicio = useRef(0)
  const vuelta = FOTOS_POR_CASA * slides.length
  useEffect(() => {
    inicio.current = Date.now()
    if (slides.length > 0) return
    const t = setTimeout(() => window.location.reload(), RELOAD_MS)
    return () => clearTimeout(t)
  }, [slides.length])
  useEffect(() => {
    if (paso > 0 && vuelta > 0 && paso % vuelta === 0 && Date.now() - inicio.current >= RELOAD_MS) window.location.reload()
  }, [paso, vuelta])

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
  const ahora = enPaso(slides, paso)
  // La foto que se va sigue moviéndose mientras se funde (si no, salta).
  const antes = paso > 0 ? enPaso(slides, paso - 1) : null
  const { idx, visible } = ahora
  const montadas = new Set([mod(idx - 1, slides.length), idx, mod(idx + 1, slides.length)])
  const s = slides[idx]
  const fotos = fotosDe(s)
  const precioLargo = s.precio.length > 11

  return (
    <main
      className={`tv-root${vertical ? ' tv-modo-vertical' : ''}${alReves ? ' tv-al-reves' : ''}`}
      onClick={toggleFullscreen}
      title="Tocar para pantalla completa"
    >
      <div className="tv-stage">
      {/* Foto a sangre (izquierda, o arriba en la tele parada) */}
      <section className="tv-foto">
        {slides.map((sl, i) =>
          montadas.has(i)
            ? fotosDe(sl).map((src, k) => {
                const activa = i === idx && k === visible
                const saliente = !activa && antes !== null && i === antes.idx && k === antes.visible
                const kb = activa ? ahora.kb : saliente ? antes.kb : ''
                return (
                  <div key={`${i}-${k}`} className="tv-layer" style={{ opacity: activa ? 1 : 0, zIndex: activa ? 2 : 1 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" decoding="async" className={`tv-img ${kb}`} />
                  </div>
                )
              })
            : null,
        )}
        {s.destacada && <span key={`b-${idx}`} className="tv-badge tv-in">Selección SI</span>}
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
        {vertical && !completa && (
          <button
            type="button"
            className="tv-full tv-girar"
            onClick={(e) => {
              e.stopPropagation()
              girar()
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v4.5h-4.5" />
            </svg>
            Girar
          </button>
        )}
      </section>

      {/* Panel de datos (derecha, o abajo en la tele parada) */}
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
          <div className="tv-precio" style={{ fontSize: precioLargo ? '6vmin' : '7.4vmin' }}>{s.precio}</div>
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
          <div key={`t-${idx}`} className="tv-tira tv-in">
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
      </div>

      <style>{`
        .tv-root { position: fixed; inset: 0; overflow: hidden; background: #0A1F14; }
        .tv-stage { position: absolute; inset: 0; display: grid; grid-template-columns: 1fr 34vw; }

        .tv-foto { position: relative; overflow: hidden; background: #08100B; }
        .tv-layer { position: absolute; inset: 0; transition: opacity ${FUNDIDO_MS}ms cubic-bezier(.4,0,.2,1);
          will-change: opacity; }
        .tv-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
          will-change: transform; backface-visibility: hidden; }
        /* Lineal: un desplazamiento parejo, sin arranques ni frenadas a la vista. */
        .tv-kb-a { animation: tvKbA ${FOTO_MS + FUNDIDO_MS}ms linear forwards; }
        .tv-kb-b { animation: tvKbB ${FOTO_MS + FUNDIDO_MS}ms linear forwards; }
        @keyframes tvKbA { from { transform: scale(1.02); } to { transform: scale(1.09) translate3d(-1%, -1%, 0); } }
        @keyframes tvKbB { from { transform: scale(1.09) translate3d(-1%, 0, 0); } to { transform: scale(1.02) translate3d(1%, -1%, 0); } }
        .tv-badge { position: absolute; top: 4vmin; left: 3vw; z-index: 3; background: #17613C; color: #fff;
          font-weight: 700; font-size: 1.9vmin; letter-spacing: .12em; text-transform: uppercase;
          padding: 1vmin 1.6vw; border-radius: 999px; box-shadow: 0 .8vmin 2.4vmin rgba(0,0,0,.35); }

        .tv-full { position: absolute; left: 3vw; bottom: 4vmin; z-index: 3; display: inline-flex; align-items: center;
          gap: 1vw; padding: 1.6vmin 2vw; border: 0; border-radius: 999px; background: #fff; color: #0A2418;
          font: 700 2.4vmin/1 var(--font-poppins), sans-serif; cursor: pointer; box-shadow: 0 1vmin 3vmin rgba(0,0,0,.4); }
        .tv-full svg { width: 3vmin; height: 3vmin; fill: none; stroke: currentColor; stroke-width: 2.4;
          stroke-linecap: round; stroke-linejoin: round; }
        .tv-full:focus-visible { outline: .5vmin solid #8FE3B0; outline-offset: .5vmin; }

        .tv-panel { position: relative; display: flex; flex-direction: column; padding: 5vmin 3vw 0;
          background: linear-gradient(170deg, #12432B 0%, #0A2418 55%, #071A11 100%);
          border-left: .4vmin solid #17613C; }

        .tv-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 2vw; }
        .tv-logo { height: 3.4vmin; width: auto; margin-top: .6vmin; }
        .tv-clock { text-align: right; }
        .tv-clock-h { font-weight: 700; font-size: 3.6vmin; line-height: 1; letter-spacing: -.01em;
          font-variant-numeric: tabular-nums; }
        .tv-clock-d { font-size: 1.7vmin; color: rgba(255,255,255,.7); margin-top: .6vmin; }

        .tv-datos { margin-top: auto; }
        .tv-tipo { font-size: 2vmin; font-weight: 600; letter-spacing: .16em; text-transform: uppercase;
          color: rgba(255,255,255,.65); }
        .tv-ubicacion { font-size: 3vmin; font-weight: 600; line-height: 1.15; color: #8FE3B0; margin-top: 1vmin;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .tv-titulo { font-family: var(--font-raleway), sans-serif; font-weight: 400; font-size: 2.9vmin; line-height: 1.2;
          margin: 2vmin 0 0; color: rgba(255,255,255,.92);
          display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .tv-precio { font-weight: 700; line-height: 1; letter-spacing: -.02em; margin-top: 3.2vmin;
          font-variant-numeric: tabular-nums; white-space: nowrap; }

        .tv-specs { display: grid; grid-template-columns: 1fr 1fr; gap: 2.4vmin 2vw; margin-top: 4vmin;
          padding-top: 3.4vmin; border-top: 1px solid rgba(255,255,255,.18); }
        .tv-spec { display: flex; flex-direction: column; }
        .tv-spec-v { font-weight: 700; font-size: 4.4vmin; line-height: 1; font-variant-numeric: tabular-nums; }
        .tv-spec-l { font-size: 1.9vmin; color: rgba(255,255,255,.7); margin-top: .8vmin; }

        .tv-tira { display: grid; grid-template-columns: repeat(4, 1fr); gap: .8vw; margin-top: 4.4vmin; }
        .tv-mini { aspect-ratio: 4 / 3; border-radius: 1vmin; overflow: hidden; opacity: .45;
          outline: .35vmin solid transparent; outline-offset: .3vmin; transition: opacity ${FUNDIDO_MS}ms, outline-color ${FUNDIDO_MS}ms; }
        .tv-mini img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .tv-mini-on { opacity: 1; outline-color: #8FE3B0; }

        .tv-pie { display: flex; justify-content: space-between; align-items: center; margin-top: 3.6vmin;
          padding: 2.4vmin 0 3vmin; border-top: 1px solid rgba(255,255,255,.12);
          font-size: 1.7vmin; color: rgba(255,255,255,.6); letter-spacing: .04em; }
        .tv-contador { font-variant-numeric: tabular-nums; }

        .tv-progress { position: absolute; left: 0; bottom: 0; height: .5vmin; min-height: 4px;
          background: linear-gradient(90deg, #17613C, #8FE3B0); width: 0; animation-name: tvProgress;
          animation-timing-function: linear; animation-fill-mode: forwards; }
        @keyframes tvProgress { from { width: 0; } to { width: 100%; } }

        /* Entrada de los datos de cada casa, al ritmo del cruce de fotos. Arranca
           en opacity .3 (no 0) para que nunca quede en blanco si el navegador
           pausa animaciones. */
        .tv-in { animation: tvIn ${FUNDIDO_MS}ms cubic-bezier(.22,.61,.36,1) both; }
        @keyframes tvIn { from { opacity: .3; transform: translateY(1.2vmin); } to { opacity: 1; transform: none; } }

        /* Tele parada: foto arriba, panel abajo. */
        ${reglasParada('.tv-modo-vertical')}
        @media (orientation: portrait) { ${reglasParada('')} }
        /* El televisor parado sigue mandando la imagen acostada: se gira la página. */
        @media (orientation: landscape) {
          .tv-modo-vertical .tv-stage { inset: auto; left: 50%; top: 50%; width: 100vh; height: 100vw;
            transform: translate(-50%, -50%) rotate(90deg); }
          .tv-modo-vertical.tv-al-reves .tv-stage { transform: translate(-50%, -50%) rotate(-90deg); }
        }
        @media (orientation: portrait) { .tv-girar { display: none; } }

        @media (prefers-reduced-motion: reduce) {
          .tv-kb-a, .tv-kb-b, .tv-in, .tv-layer, .tv-mini { animation: none !important; transition: none !important; }
        }
      `}</style>
    </main>
  )
}
