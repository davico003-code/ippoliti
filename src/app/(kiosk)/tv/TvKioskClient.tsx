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
//
// OJO: el televisor de la oficina (Dalton) tiene un navegador VIEJO. Sin `inset`
// la foto medía cero (quedaba negra) y el panel cambiaba de alto en cada
// transición (23-oct-2026). Acá nada de inset, gap en flex, aspect-ratio ni dvh:
// top/right/bottom/left, márgenes y padding-bottom.

import { useEffect, useRef, useState } from 'react'
import type { Slide, SlideEmprendimiento, SlideTasar } from '../tvData'

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
// Algunos navegadores viejos no devuelven promesa: un .catch directo tiraba error.
const sinError = (p: Promise<void> | void) => {
  if (p && typeof p.catch === 'function') p.catch(() => {})
}
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
// cualquier pantalla vertical. Foto arriba (46 %) y panel abajo (54 %), datos en
// una fila de 4 y título y descripción en 2 líneas para que todo entre.
const reglasParada = (pre: string) => `
  ${pre} .tv-stage { grid-template-columns: 1fr; grid-template-rows: 46% 54%; }
  ${pre} .tv-panel { padding: 4vmin 5vmin 0; border-left: 0; border-top: .4vmin solid #17613C; }
  ${pre} .tv-badges { left: 5vmin; }
  ${pre} .tv-badge { padding: 1vmin 2.6vmin; }
  ${pre} .tv-full { left: 5vmin; padding: 1.6vmin 3.4vmin; }
  ${pre} .tv-full svg { margin-right: 1.6vmin; }
  ${pre} .tv-girar { left: auto; right: 5vmin; }
  ${pre} .tv-clock { margin-left: 3vmin; }
  ${pre} .tv-datos { padding-top: 3vmin; }
  ${pre} .tv-titulo { -webkit-line-clamp: 2; }
  ${pre} .tv-specs { grid-template-columns: repeat(4, 1fr); grid-gap: 2vmin; gap: 2vmin; }
  ${pre} .tv-tira { grid-gap: 1.6vmin; gap: 1.6vmin; }
  ${pre} .tv-emp-desc { -webkit-line-clamp: 2; }
  ${pre} .tv-show-velo { background: linear-gradient(0deg, rgba(5,16,10,.95) 0%, rgba(5,16,10,.75) 42%, rgba(5,16,10,0) 70%); }
  ${pre} .tv-show-contenido { left: 7vmin; right: 7vmin; bottom: 9vmin; max-width: none; }
  ${pre} .tv-show-unidades { left: 7vmin; right: 7vmin; }
  ${pre} .tv-show-cards { grid-template-columns: repeat(3, 1fr); }
  ${pre} .tv-show-card img { height: 20vmin; }
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
      if (el.requestFullscreen) sinError(el.requestFullscreen())
      else el.webkitRequestFullscreen?.()
    } else if (d.exitFullscreen) sinError(d.exitFullscreen())
    else d.webkitExitFullscreen?.()
  }

  if (slides.length === 0) {
    return (
      <main style={{ height: '100vh', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
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
  // Presentación de emprendimiento a pantalla completa: entra y sale con un
  // fundido sobre la propiedad; mientras sale sigue mostrando el que se va.
  // Lo mismo para la placa de tasar (solo la tele parada).
  const iShow = s.kind !== 'propiedad' ? idx : antes && slides[antes.idx].kind !== 'propiedad' ? antes.idx : null
  const show = iShow !== null ? (slides[iShow] as SlideEmprendimiento | SlideTasar) : null
  const hayEmprendimientos = slides.some((x) => x.kind !== 'propiedad')
  // Dos momentos en el mismo slide: portada (8 s) y después las unidades (8 s);
  // mientras se va, se queda en las unidades.
  const momentoUnidades =
    show?.kind === 'emprendimiento' && !!show.unidades && (iShow !== idx || paso % FOTOS_POR_CASA >= FOTOS_POR_CASA / 2)

  // Capas de fotos de un slide (Ken Burns + fundido); la que sale sigue moviéndose.
  const capas = (sl: Slide, i: number) =>
    fotosDe(sl).map((src, k, todas) => {
      const activa = i === idx && k === visible
      const saliente = !activa && antes !== null && i === antes.idx && k === antes.visible
      const kb = activa ? ahora.kb : saliente ? antes.kb : ''
      // Con una sola foto, el movimiento dura todo el slide (no se frena a los 5 s).
      const largo = todas.length === 1 ? { animationDuration: `${SLIDE_MS + FUNDIDO_MS}ms` } : undefined
      return (
        <div key={`${i}-${k}`} className="tv-layer" style={{ opacity: activa ? 1 : 0, zIndex: activa ? 2 : 1 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" decoding="async" className={`tv-img ${kb}`} style={largo} />
        </div>
      )
    })
  const fotos = fotosDe(s)
  const precioLargo = s.kind === 'propiedad' && s.precio.length > 11

  return (
    <main
      className={`tv-root${vertical ? ' tv-modo-vertical' : ''}${alReves ? ' tv-al-reves' : ''}`}
      onClick={toggleFullscreen}
      title="Tocar para pantalla completa"
    >
      <div className="tv-stage">
      {/* Foto a sangre (izquierda, o arriba en la tele parada) */}
      <section className="tv-foto">
        {slides.map((sl, i) => (montadas.has(i) ? capas(sl, i) : null))}
        <div key={`b-${idx}`} className="tv-badges tv-in">
          {s.kind === 'emprendimiento' && <span className="tv-badge tv-badge-emp">Emprendimiento</span>}
          {s.kind === 'propiedad' && s.rebaja && (
            <span className="tv-badge tv-badge-rebaja">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 4v15M5.5 12.5 12 19l6.5-6.5" />
              </svg>
              Bajó {s.rebaja.diferencia}
            </span>
          )}
          {s.kind === 'propiedad' && s.destacada && <span className="tv-badge">Selección SI</span>}
        </div>
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

        {s.kind === 'tasar' ? (
          <div key={idx} className="tv-datos" />
        ) : s.kind === 'emprendimiento' ? (
          // Presentación especial: nombre grande, quién lo desarrolla y el gancho.
          <div key={idx} className="tv-datos tv-in">
            <div className="tv-emp-sello">Emprendimiento</div>
            <h2 className="tv-emp-nombre" style={{ fontSize: s.nombre.length > 26 ? '4.6vmin' : s.nombre.length > 16 ? '5.4vmin' : '6.2vmin' }}>
              {s.nombre}
            </h2>
            {s.bajada && <div className="tv-emp-bajada">{s.bajada}</div>}
            {s.ubicacion && <div className="tv-emp-ubic">{s.ubicacion}</div>}
            {s.descripcion && <p className="tv-emp-desc">{s.descripcion}</p>}
            {s.chips.length > 0 && (
              <div className="tv-emp-chips">
                {s.chips.map((c) => (
                  <span key={c}>{c}</span>
                ))}
              </div>
            )}
            {s.marcas.length > 0 && (
              <div className="tv-emp-marcas">
                {s.marcas.map((m) => (
                  <div key={m.nombre} className="tv-emp-marca">
                    <span className="tv-emp-rol">{m.rol}</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {m.logo && <img src={m.logo} alt={m.mostrarNombre ? '' : m.nombre} />}
                    {(!m.logo || m.mostrarNombre) && <strong>{m.nombre}</strong>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div key={idx} className="tv-datos tv-in">
            <div className="tv-tipo">{s.tipo}</div>
            {s.ubicacion && <div className="tv-ubicacion">{s.ubicacion}</div>}
            {s.titulo && <h2 className="tv-titulo">{s.titulo}</h2>}
            {s.rebaja && (
              <div className="tv-antes">
                <s>{s.rebaja.anterior}</s>
              </div>
            )}
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
        )}

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

      {/* Emprendimiento: un momento aparte, a pantalla completa (David, 22-oct-2026:
          "debería ser más distinta la sección de cada emprendimiento"). */}
      {hayEmprendimientos && (
        <div className={`tv-show${s.kind !== 'propiedad' ? ' tv-show-on' : ''}`}>
          {show && iShow !== null && (
            <>
              {capas(show, iShow)}
              <div className="tv-show-velo" />
              <div className="tv-show-marco" />
              <div className="tv-show-si">
                {show.kind === 'emprendimiento' && <span>Comercializa</span>}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/si-inmobiliaria-blanco.svg" alt="SI INMOBILIARIA" />
              </div>
              {show.kind === 'tasar' ? (
                <div key={`t-${iShow}`} className="tv-show-contenido tv-tasar">
                  <div className="tv-show-sello">
                    <span className="tv-show-linea" />
                    Tasación sin cargo
                  </div>
                  <h2 className="tv-tasar-titulo">¿Cuánto vale tu casa?</h2>
                  <div className="tv-tasar-sub">Escaneá y pedí la tasación de un corredor matriculado.</div>
                  <div className="tv-tasar-fila">
                    <div className="tv-tasar-qr">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={show.qr} alt="Código QR para pedir la tasación de tu casa" />
                    </div>
                    <div className="tv-tasar-texto">
                      <strong>{show.url}</strong>
                      <span>Desde 1983 en Funes, Roldán y Rosario</span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div key={`s-${iShow}`} className={`tv-show-contenido${momentoUnidades ? ' tv-show-apagado' : ''}`}>
                    <div className="tv-show-sello">
                      <span className="tv-show-linea" />
                      Emprendimiento
                    </div>
                    <h2
                      className="tv-show-nombre"
                      style={{ fontSize: show.nombre.length > 26 ? '6.6vmin' : show.nombre.length > 16 ? '8vmin' : '10vmin' }}
                    >
                      {show.nombre}
                    </h2>
                    {show.bajada && <div className="tv-show-bajada">{show.bajada}</div>}
                    {show.ubicacion && <div className="tv-show-ubic">{show.ubicacion}</div>}
                    {show.descripcion && <p className="tv-show-desc">{show.descripcion}</p>}
                    {show.chips.length > 0 && (
                      <div className="tv-show-chips">
                        {show.chips.map((c) => (
                          <span key={c}>{c}</span>
                        ))}
                      </div>
                    )}
                    {show.marcas.length > 0 && (
                      <div className="tv-show-marcas">
                        {show.marcas.map((m) => (
                          <div key={m.nombre} className="tv-show-marca">
                            <span className="tv-show-rol">{m.rol}</span>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {m.logo && <img src={m.logo} alt={m.mostrarNombre ? '' : m.nombre} />}
                            {(!m.logo || m.mostrarNombre) && <strong>{m.nombre}</strong>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {show.unidades && (
                    <div key={`u-${iShow}`} className={`tv-show-unidades${momentoUnidades ? ' tv-show-prendido' : ''}`}>
                      <div className="tv-show-sello">
                        <span className="tv-show-linea" />
                        {show.unidades.titulo}
                      </div>
                      {show.unidades.desde && (
                        <div className="tv-show-desde">
                          <span>Desde</span> {show.unidades.desde}
                        </div>
                      )}
                      {show.unidades.resumen && <div className="tv-show-resumen">{show.unidades.resumen}</div>}
                      <div className="tv-show-cards">
                        {show.unidades.lista.map((u, k) => (
                          <div key={k} className="tv-show-card" style={{ transitionDelay: momentoUnidades ? `${300 + k * 180}ms` : '0ms' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={u.foto} alt="" decoding="async" />
                            <div className="tv-show-card-txt">
                              <span>{u.dato}</span>
                              <strong>{u.precio}</strong>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              <div key={`sp-${iShow}`} className="tv-progress tv-show-progress" style={{ animationDuration: `${SLIDE_MS}ms` }} />
            </>
          )}
        </div>
      )}
      </div>

      <style>{`
        .tv-root { position: fixed; top: 0; right: 0; bottom: 0; left: 0; overflow: hidden; background: #0A1F14; }
        .tv-stage { position: absolute; top: 0; right: 0; bottom: 0; left: 0; display: grid; grid-template-columns: 1fr 34vw; }

        .tv-foto { position: relative; overflow: hidden; background: #08100B; }
        .tv-layer { position: absolute; top: 0; right: 0; bottom: 0; left: 0; transition: opacity ${FUNDIDO_MS}ms cubic-bezier(.4,0,.2,1);
          will-change: opacity; }
        .tv-img { position: absolute; top: 0; right: 0; bottom: 0; left: 0; width: 100%; height: 100%; object-fit: cover;
          will-change: transform; backface-visibility: hidden; }
        /* Lineal: un desplazamiento parejo, sin arranques ni frenadas a la vista. */
        .tv-kb-a { animation: tvKbA ${FOTO_MS + FUNDIDO_MS}ms linear forwards; }
        .tv-kb-b { animation: tvKbB ${FOTO_MS + FUNDIDO_MS}ms linear forwards; }
        @keyframes tvKbA { from { transform: scale(1.02); } to { transform: scale(1.09) translate3d(-1%, -1%, 0); } }
        @keyframes tvKbB { from { transform: scale(1.09) translate3d(-1%, 0, 0); } to { transform: scale(1.02) translate3d(1%, -1%, 0); } }
        .tv-badges { position: absolute; top: 4vmin; left: 3vw; z-index: 3; display: flex; flex-wrap: wrap; align-items: center; }
        .tv-badges > * { margin: 0 1.2vmin 1.2vmin 0; }
        .tv-badge { display: inline-flex; align-items: center; background: #17613C; color: #fff;
          font-weight: 700; font-size: 1.9vmin; letter-spacing: .12em; text-transform: uppercase;
          padding: 1vmin 1.6vw; border-radius: 999px; box-shadow: 0 .8vmin 2.4vmin rgba(0,0,0,.35); }

        .tv-badge-emp { background: #C9A84C; color: #0A2418; }
        /* Bajó de precio: coral, más grande y con un latido suave para que se vea de lejos. */
        .tv-badge-rebaja { background: #E2552B; font-size: 2.4vmin; letter-spacing: .06em; padding: 1.1vmin 2.2vmin;
          animation: tvLatido 1800ms ease-in-out infinite; }
        .tv-badge-rebaja svg { margin-right: .8vmin; width: 2.6vmin; height: 2.6vmin; fill: none; stroke: currentColor; stroke-width: 3;
          stroke-linecap: round; stroke-linejoin: round; }
        @keyframes tvLatido { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.06); } }
        .tv-antes { margin-top: 3vmin; font-size: 3vmin; font-weight: 600; color: rgba(255,255,255,.62);
          font-variant-numeric: tabular-nums; }
        .tv-antes s { text-decoration-color: #E2552B; text-decoration-thickness: .35vmin; }
        .tv-antes + .tv-precio { margin-top: .8vmin; }

        .tv-full { position: absolute; left: 3vw; bottom: 4vmin; z-index: 3; display: inline-flex; align-items: center;
          padding: 1.6vmin 2vw; border: 0; border-radius: 999px; background: #fff; color: #0A2418;
          font: 700 2.4vmin/1 var(--font-poppins), sans-serif; cursor: pointer; box-shadow: 0 1vmin 3vmin rgba(0,0,0,.4); }
        .tv-full svg { margin-right: 1vw; width: 3vmin; height: 3vmin; fill: none; stroke: currentColor; stroke-width: 2.4;
          stroke-linecap: round; stroke-linejoin: round; }
        .tv-full:focus-visible { outline: .5vmin solid #8FE3B0; outline-offset: .5vmin; }

        .tv-panel { position: relative; display: flex; flex-direction: column; padding: 5vmin 3vw 0;
          background: linear-gradient(170deg, #12432B 0%, #0A2418 55%, #071A11 100%);
          border-left: .4vmin solid #17613C; }

        .tv-top { display: flex; align-items: flex-start; justify-content: space-between; }
        .tv-logo { height: 3.4vmin; width: auto; margin-top: .6vmin; }
        .tv-clock { text-align: right; margin-left: 2vw; }
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

        .tv-specs { display: grid; grid-template-columns: 1fr 1fr; grid-gap: 2.4vmin 2vw; gap: 2.4vmin 2vw; margin-top: 4vmin;
          padding-top: 3.4vmin; border-top: 1px solid rgba(255,255,255,.18); }
        .tv-spec { display: flex; flex-direction: column; }
        .tv-spec-v { font-weight: 700; font-size: 4.4vmin; line-height: 1; font-variant-numeric: tabular-nums; }
        .tv-spec-l { font-size: 1.9vmin; color: rgba(255,255,255,.7); margin-top: .8vmin; }

        /* Emprendimiento a pantalla completa: foto de punta a punta, marco y acentos
           dorados, nombre enorme. Tapa todo y entra/sale con el mismo fundido. */
        .tv-show { position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 8; opacity: 0; pointer-events: none; overflow: hidden;
          background: #071A11; transition: opacity ${FUNDIDO_MS}ms cubic-bezier(.4,0,.2,1); will-change: opacity; }
        .tv-show-on { opacity: 1; }
        .tv-show-velo { position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 3;
          background: linear-gradient(90deg, rgba(5,16,10,.9) 0%, rgba(5,16,10,.6) 40%, rgba(5,16,10,0) 72%),
            linear-gradient(0deg, rgba(5,16,10,.8) 0%, rgba(5,16,10,0) 45%); }
        .tv-show-marco { position: absolute; top: 3.4vmin; right: 3.4vmin; bottom: 3.4vmin; left: 3.4vmin; z-index: 4; border: .22vmin solid rgba(201,168,76,.75);
          border-radius: 1.4vmin; }
        .tv-show-si { position: absolute; top: 7vmin; right: 7vmin; z-index: 5; display: flex; align-items: center;
          font-size: 1.7vmin; letter-spacing: .16em; text-transform: uppercase; color: rgba(255,255,255,.8); }
        .tv-show-si img { height: 3.6vmin; width: auto; }
        .tv-show-si > * + * { margin-left: 1.6vmin; }
        .tv-show-contenido { position: absolute; left: 8vmin; bottom: 9vmin; z-index: 5; max-width: 62%;
          text-shadow: 0 .3vmin 2vmin rgba(0,0,0,.45);
          transition: opacity ${FUNDIDO_MS}ms cubic-bezier(.4,0,.2,1), transform ${FUNDIDO_MS}ms cubic-bezier(.4,0,.2,1); }
        .tv-show-apagado { opacity: 0; transform: translateY(-2vmin); }
        /* Segundo momento: qué se puede comprar. Entra subiendo, las tarjetas de a una. */
        .tv-show-unidades { position: absolute; left: 8vmin; right: 8vmin; bottom: 9vmin; z-index: 5; opacity: 0;
          transform: translateY(3vmin); text-shadow: 0 .3vmin 2vmin rgba(0,0,0,.45);
          transition: opacity ${FUNDIDO_MS}ms cubic-bezier(.4,0,.2,1), transform ${FUNDIDO_MS}ms cubic-bezier(.4,0,.2,1); }
        .tv-show-prendido { opacity: 1; transform: none; }
        .tv-show-desde { font-weight: 700; font-size: 9vmin; line-height: 1; letter-spacing: -.02em; margin-top: 2.4vmin;
          font-variant-numeric: tabular-nums; }
        .tv-show-desde span { font-size: 3.4vmin; font-weight: 600; letter-spacing: 0; color: #E6C77A; vertical-align: .6em; }
        .tv-show-resumen { font-size: 3vmin; color: rgba(255,255,255,.88); margin-top: 1.6vmin; }
        .tv-show-cards { display: grid; grid-template-columns: repeat(3, 34vmin); grid-gap: 2.4vmin; gap: 2.4vmin; margin-top: 4vmin; }
        .tv-show-card { overflow: hidden; border-radius: 1.4vmin; background: rgba(5,16,10,.78);
          border: .18vmin solid rgba(230,199,122,.55); text-shadow: none; opacity: 0; transform: translateY(2vmin);
          transition: opacity 900ms cubic-bezier(.22,.61,.36,1), transform 900ms cubic-bezier(.22,.61,.36,1); }
        .tv-show-prendido .tv-show-card { opacity: 1; transform: none; }
        .tv-show-card img { display: block; width: 100%; height: 25vmin; object-fit: cover; }
        .tv-show-card-txt { display: flex; flex-direction: column; padding: 1.6vmin 2vmin 2vmin; }
        .tv-show-card-txt span { margin-bottom: .8vmin; font-size: 2vmin; color: rgba(255,255,255,.85); }
        .tv-show-card-txt strong { font-size: 3.2vmin; font-weight: 700; font-variant-numeric: tabular-nums; }
        .tv-show-sello { display: flex; align-items: center; color: #E6C77A; font-size: 2vmin;
          font-weight: 700; letter-spacing: .32em; text-transform: uppercase; }
        /* Elemento y no ::before: un content con comillas se escapa en el HTML del
           servidor y el estilo no coincide al hidratar. */
        .tv-show-linea { margin-right: 1.8vmin; width: 7vmin; height: .25vmin; background: #C9A84C; }
        .tv-show-nombre { font-family: var(--font-raleway), sans-serif; font-weight: 800; line-height: .98;
          letter-spacing: -.02em; margin: 2.6vmin 0 0; }
        .tv-show-bajada { font-size: 3.4vmin; font-weight: 600; line-height: 1.2; color: #E6C77A; margin-top: 2.2vmin; }
        .tv-show-ubic { font-size: 2.4vmin; color: rgba(255,255,255,.8); margin-top: 1.4vmin; }
        .tv-show-desc { font-family: var(--font-raleway), sans-serif; font-size: 2.8vmin; line-height: 1.35;
          color: rgba(255,255,255,.92); margin: 2.6vmin 0 0; max-width: 56ch; }
        .tv-show-chips { display: flex; flex-wrap: wrap; margin-top: 3vmin; }
        .tv-show-chips span { margin: 0 1.4vmin 1.4vmin 0; }
        .tv-show-chips span { padding: 1vmin 2.2vmin; border: .2vmin solid rgba(230,199,122,.8); border-radius: 999px;
          color: #F3E3B5; font-size: 2vmin; font-weight: 600; text-shadow: none; }
        .tv-show-marcas { display: flex; flex-wrap: wrap; align-items: center; margin-top: 4vmin;
          padding-top: 3vmin; border-top: .15vmin solid rgba(230,199,122,.45); }
        .tv-show-marca { display: flex; align-items: center; margin: 0 5vmin 2vmin 0; }
        .tv-show-marca > * + * { margin-left: 1.6vmin; }
        .tv-show-rol { font-size: 1.9vmin; color: rgba(255,255,255,.75); }
        .tv-show-marca img { height: 5vmin; width: auto; filter: brightness(0) invert(1); }
        .tv-show-marca strong { font-size: 2.6vmin; font-weight: 700; }
        .tv-show-progress { z-index: 6; background: linear-gradient(90deg, #C9A84C, #F3E3B5); }

        /* Placa de tasar (tele parada): pregunta enorme y un QR que se lea desde la vereda. */
        .tv-tasar-titulo { font-family: var(--font-raleway), sans-serif; font-weight: 800; font-size: 10vmin; line-height: .98;
          letter-spacing: -.02em; margin: 2.6vmin 0 0; }
        .tv-tasar-sub { font-size: 3.4vmin; font-weight: 600; line-height: 1.25; color: #E6C77A; margin-top: 2.4vmin; }
        .tv-tasar-fila { display: flex; align-items: center; margin-top: 4.4vmin; }
        .tv-tasar-qr { flex: none; margin-right: 4vmin; width: 34vmin; height: 34vmin; padding: 1.6vmin; background: #fff; border-radius: 2vmin;
          box-shadow: 0 1.6vmin 4vmin rgba(0,0,0,.45); }
        .tv-tasar-qr img { display: block; width: 100%; height: 100%; }
        .tv-tasar-texto { display: flex; flex-direction: column; text-shadow: 0 .3vmin 2vmin rgba(0,0,0,.45); }
        .tv-tasar-texto strong { margin-bottom: 1.4vmin; font-size: 3.2vmin; font-weight: 700; }
        .tv-tasar-texto span { font-size: 2.2vmin; color: rgba(255,255,255,.8); }

        /* Presentación especial de emprendimiento: dorado de acento, nombre grande. */
        .tv-emp-sello { display: inline-block; padding: .8vmin 1.8vmin; border: .25vmin solid #C9A84C; border-radius: 999px;
          color: #E6C77A; font-size: 1.8vmin; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; }
        .tv-emp-nombre { font-family: var(--font-raleway), sans-serif; font-weight: 800; font-size: 6.2vmin; line-height: 1.04;
          letter-spacing: -.01em; margin: 2.4vmin 0 0;
          display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .tv-emp-bajada { font-size: 2.7vmin; font-weight: 600; line-height: 1.2; color: #8FE3B0; margin-top: 1.6vmin;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .tv-emp-ubic { font-size: 2vmin; color: rgba(255,255,255,.7); margin-top: 1.2vmin; }
        .tv-emp-desc { font-family: var(--font-raleway), sans-serif; font-size: 2.4vmin; line-height: 1.35;
          color: rgba(255,255,255,.88); margin: 2.4vmin 0 0;
          display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .tv-emp-chips { display: flex; flex-wrap: wrap; margin-top: 2.6vmin; }
        .tv-emp-chips span { margin: 0 1vmin 1vmin 0; }
        .tv-emp-chips span { padding: .7vmin 1.6vmin; border: 1px solid rgba(255,255,255,.35); border-radius: 999px;
          font-size: 1.7vmin; font-weight: 600; }
        .tv-emp-marcas { display: flex; flex-wrap: wrap; align-items: center; margin-top: 3vmin;
          padding-top: 2.6vmin; border-top: 1px solid rgba(255,255,255,.18); }
        .tv-emp-marca { display: flex; align-items: center; margin: 0 3vmin 1.6vmin 0; }
        .tv-emp-marca > * + * { margin-left: 1.2vmin; }
        .tv-emp-rol { font-size: 1.6vmin; color: rgba(255,255,255,.7); }
        /* Cualquier logo en blanco sobre el verde (regla de las portadas). */
        .tv-emp-marca img { height: 3.6vmin; width: auto; filter: brightness(0) invert(1); }
        .tv-emp-marca strong { font-size: 2vmin; font-weight: 700; }

        .tv-tira { display: grid; grid-template-columns: repeat(4, 1fr); grid-gap: .8vw; gap: .8vw; margin-top: 4.4vmin; }
        .tv-mini { position: relative; height: 0; padding-bottom: 75%; border-radius: 1vmin; overflow: hidden; opacity: .45;
          outline: .35vmin solid transparent; outline-offset: .3vmin; transition: opacity ${FUNDIDO_MS}ms, outline-color ${FUNDIDO_MS}ms; }
        .tv-mini img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
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
          .tv-modo-vertical .tv-stage { right: auto; bottom: auto; left: 50%; top: 50%; width: 100vh; height: 100vw;
            transform: translate(-50%, -50%) rotate(90deg); }
          .tv-modo-vertical.tv-al-reves .tv-stage { transform: translate(-50%, -50%) rotate(-90deg); }
        }
        @media (orientation: portrait) { .tv-girar { display: none; } }

        @media (prefers-reduced-motion: reduce) {
          .tv-kb-a, .tv-kb-b, .tv-in, .tv-layer, .tv-mini, .tv-badge-rebaja { animation: none !important; transition: none !important; }
        }
      `}</style>
    </main>
  )
}
