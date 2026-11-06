'use client'

// Kiosco de TV: cada casa pasa hasta 4 fotos (Ken Burns + crossfade) con su
// ficha al lado, sin texto encima de la foto. Pensado para dejar corriendo todo
// el día.
//
// Parada (/tv-vertical, o /tv en una pantalla vertical): foto arriba, ficha
// abajo. Acostada (/tv): foto a la izquierda, ficha a la derecha. Un televisor
// parado sigue mandando la imagen acostada, así que /tv-vertical gira la página
// 90° (con el botón "Girar", para el otro lado). Las medidas van en vmin (el
// lado corto de la pantalla), que sirven igual en las tres posiciones.
//
// OJO: el televisor de la oficina (Dalton) tiene un navegador VIEJO. Sin `inset`
// la foto medía cero (quedaba negra) y el panel cambiaba de alto en cada
// transición (23-oct-2026). Acá nada de inset, gap en flex, aspect-ratio ni dvh:
// top/right/bottom/left, márgenes y padding-bottom.
//
// Las dos son una "lámina de galería" (David, 5-nov-2026 la parada: la vidriera
// no se leía desde la vereda; 6-nov la acostada, "con el mismo estilo"). Fondo
// papel crema (la acostada, blanco y crema intercalados), la foto como un cuadro
// con margen y una ficha que se lee de lejos: barrio, QUÉ es ("Casa con
// pileta"), el precio enorme y una línea de datos con los m² totales, y las 4
// miniaturas. Cada renglón se achica solo para entrar (el titular de la
// acostada, a veces en dos líneas). Emprendimientos y tasar siguen a pantalla
// completa encima.

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { RespaldosJpg, Slide, SlideEmprendimiento, SlidePropiedad, SlideTasar } from '../tvData'

const FOTO_MS = 4000
const FUNDIDO_MS = 1600 // cruce entre fotos; el movimiento dura la foto + su salida
const FOTOS_POR_CASA = 4
const SLIDE_MS = FOTO_MS * FOTOS_POR_CASA
const RELOAD_MS = 40 * 60 * 1000 // recargar (stock nuevo) pasados 40 min, al terminar la vuelta
const REINTENTO_MS = 60 * 1000 // sin respuesta de la web, se vuelve a probar al minuto
// Con tantas fotos de R2 que no abren, este televisor no abre R2: todas en JPG.
const FALLAS_PARA_JPG = 3

const mod = (n: number, m: number) => ((n % m) + m) % m

// Pantalla completa con los prefijos de webkit: los navegadores de los
// televisores suelen tener solo la versión vieja.
type DocFs = Document & { webkitFullscreenElement?: Element | null; webkitExitFullscreen?: () => void }
type ElFs = HTMLElement & { webkitRequestFullscreen?: () => void }
// Algunos navegadores viejos no devuelven promesa: un .catch directo tiraba error.
const sinError = (p: Promise<void> | void) => {
  if (p && typeof p.catch === 'function') p.catch(() => {})
}
// Keyboard Lock (solo donde exista): con Escape bloqueado, un toque suelto no
// saca de pantalla completa (hay que mantenerlo apretado).
type NavegadorConTeclado = Navigator & { keyboard?: { lock?: (teclas: string[]) => Promise<void> } }
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

// Reglas de la tele parada (1080 × 1920) para lo que va a pantalla completa
// (emprendimientos y tasar) y el botón "Girar": con /tv-vertical y en cualquier
// pantalla vertical.
const reglasParada = (pre: string) => `
  ${pre} .tv-full { left: 5vmin; padding: 1.6vmin 3.4vmin; }
  ${pre} .tv-full svg { margin-right: 1.6vmin; }
  ${pre} .tv-girar { left: auto; right: 5vmin; }
  ${pre} .tv-show-velo { background: linear-gradient(0deg, rgba(5,16,10,.95) 0%, rgba(5,16,10,.75) 42%, rgba(5,16,10,0) 70%); }
  ${pre} .tv-show-contenido { left: 7vmin; right: 7vmin; bottom: 9vmin; max-width: none; }
  ${pre} .tv-show-unidades { left: 7vmin; right: 7vmin; }
  ${pre} .tv-show-cards { grid-template-columns: repeat(3, 1fr); }
  ${pre} .tv-show-card img { height: 20vmin; }
`

const GIRO_KEY = 'si.tv-vertical.girada-al-reves'

// "USD 455.000" → moneda chica arriba y el número grande.
const partirPrecio = (t: string) => {
  const m = /^([^\d]+?)\s*(\d.*)$/.exec(t)
  return m ? { mon: m[1], num: m[2] } : { mon: '', num: t }
}

// Galería: cada renglón de la ficha se achica hasta entrar en una línea, sin
// bajar de su mínimo (proporción del tamaño de diseño). El titular de la
// acostada puede ir en dos: primero prueba en una (hasta UNA_LINEA_HASTA) y,
// si no entra, en dos.
const MINIMOS_FICHA: [string, string, number][] = [
  ['.gal-lugar', '.gal-lugar', 0.68],
  ['.gal-titular', '.gal-titular', 0.66],
  ['.gal-precio', '.gal-num', 0.66],
  ['.gal-datos', '.gal-datos', 0.7],
]
const UNA_LINEA_HASTA = 0.85
function encogerFicha(caja: HTMLElement) {
  for (const [linea, texto, minimo] of MINIMOS_FICHA) {
    const l = caja.querySelector<HTMLElement>(linea)
    const t = caja.querySelector<HTMLElement>(texto)
    if (!l || !t) continue
    l.style.whiteSpace = ''
    t.style.fontSize = ''
    const diseno = parseFloat(window.getComputedStyle(t).fontSize)
    const achicar = (hasta: number, sobra: () => boolean) => {
      let z = diseno
      t.style.fontSize = ''
      while (sobra() && z > diseno * hasta) {
        z -= 1
        t.style.fontSize = `${z}px`
      }
    }
    const ancho = () => l.scrollWidth > l.clientWidth
    if (window.getComputedStyle(l).whiteSpace === 'nowrap') {
      achicar(minimo, ancho)
      continue
    }
    l.style.whiteSpace = 'nowrap'
    achicar(UNA_LINEA_HASTA, ancho)
    if (!ancho()) continue
    l.style.whiteSpace = ''
    t.style.fontSize = ''
    // Una línea de más suma un renglón entero; lo que asoman las letras, unos px.
    const renglon = parseFloat(window.getComputedStyle(l).lineHeight)
    achicar(minimo, () => ancho() || l.scrollHeight > l.clientHeight + renglon / 2)
  }
}

// Acostada (David, 6-nov-2026, "el A está bien"): la ficha y las miniaturas van
// juntas al medio de la columna, entre el borde de arriba de la foto y el pie,
// así no queda un hueco entre los datos y las fotos. Parada (o /tv en una
// pantalla parada): mandan las medidas del CSS.
const MARGEN = 5.93 // vmin, el de la foto
const ANTES_DE_LA_TIRA = 4.4 // vmin
const ANTES_DEL_PIE = 3 // vmin
function centrarEnLaColumna(ficha: HTMLElement, tira: HTMLElement | null, pie: HTMLElement | null) {
  ficha.style.top = ''
  if (tira) tira.style.top = ''
  if (!pie || !window.matchMedia('(orientation: landscape)').matches) return
  const vmin = Math.min(window.innerWidth, window.innerHeight) / 100
  const arriba = MARGEN * vmin
  const alto = ficha.offsetHeight + (tira ? ANTES_DE_LA_TIRA * vmin + tira.offsetHeight : 0)
  const top = Math.max(arriba, arriba + (pie.offsetTop - ANTES_DEL_PIE * vmin - arriba - alto) / 2)
  ficha.style.top = `${top}px`
  if (tira) tira.style.top = `${top + ficha.offsetHeight + ANTES_DE_LA_TIRA * vmin}px`
}

export default function TvKioskClient({
  slides,
  respaldos,
  vertical = false,
}: {
  slides: Slide[]
  respaldos: RespaldosJpg
  vertical?: boolean
}) {
  // Un paso cada FOTO_MS: FOTOS_POR_CASA pasos por casa.
  const [paso, setPaso] = useState(0)
  // En una ref, como el resto de la recarga (no cambia entre renders).
  const router = useRef(useRouter())
  // Fotos: primero la copia de R2; la que no abre pasa a su JPG de la web, y con
  // FALLAS_PARA_JPG fallidas pasan todas (así no queda en negro ni una).
  const [fallidas, setFallidas] = useState<string[]>([])
  const sinR2 = fallidas.length >= FALLAS_PARA_JPG
  const fuente = (src: string) => (respaldos[src] && (sinR2 || fallidas.includes(src)) ? respaldos[src] : src)
  const fallo = (src: string) => {
    if (respaldos[src]) setFallidas((f) => (f.includes(src) ? f : [...f, src]))
  }
  // Una foto que falló antes de que React tomara la página no dispara onError.
  const vigilar = (src: string) => (el: HTMLImageElement | null) => {
    if (el && el.complete && el.naturalWidth === 0) fallo(src)
  }
  const [completa, setCompleta] = useState(false)
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

  // Stock nuevo: pasados RELOAD_MS, recién al terminar la vuelta, así ninguna
  // casa se queda sin salir aunque la vuelta dure más (con ~130 casas son
  // ~35 min). Sin casas (feed caído) a los RELOAD_MS. SIN recargar la página
  // (David, 29-oct: "que no se minimice"): un reload saca de pantalla completa
  // y sin un toque no vuelve; router.refresh trae la lista nueva del servidor
  // y la tele sigue en pantalla completa.
  // Solo si la web contesta: sin internet, reload() deja la pantalla de "sin
  // conexión" del navegador hasta que alguien la toque. Mientras no contesta,
  // sigue pasando lo que tiene y prueba de nuevo cada REINTENTO_MS.
  const inicio = useRef(0)
  const recargando = useRef(false)
  const vuelta = FOTOS_POR_CASA * slides.length
  const recargar = () => {
    if (recargando.current) return
    recargando.current = true
    const probar = () => {
      fetch(window.location.href, { method: 'HEAD', cache: 'no-store' })
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`)
          router.current.refresh()
          recargando.current = false
          inicio.current = Date.now()
        })
        .catch(() => setTimeout(probar, REINTENTO_MS))
    }
    probar()
  }
  useEffect(() => {
    inicio.current = Date.now()
    if (slides.length > 0) return
    const t = setTimeout(recargar, RELOAD_MS)
    return () => clearTimeout(t)
  }, [slides.length])
  useEffect(() => {
    if (paso > 0 && vuelta > 0 && paso % vuelta === 0 && Date.now() - inicio.current >= RELOAD_MS) recargar()
  }, [paso, vuelta])
  // Llegó la lista nueva: la vuelta arranca de nuevo con ella.
  const primeraLista = useRef(true)
  useEffect(() => {
    if (primeraLista.current) {
      primeraLista.current = false
      return
    }
    setPaso(0)
  }, [slides])

  // El botón "Girar" (tele parada) se ve solo mientras la página no está en pantalla completa.
  useEffect(() => {
    const cambio = () => {
      const completaAhora = enPantallaCompleta()
      setCompleta(completaAhora)
      if (completaAhora) sinError((navigator as NavegadorConTeclado).keyboard?.lock?.(['Escape']))
    }
    cambio()
    document.addEventListener('fullscreenchange', cambio)
    document.addEventListener('webkitfullscreenchange', cambio)
    return () => {
      document.removeEventListener('fullscreenchange', cambio)
      document.removeEventListener('webkitfullscreenchange', cambio)
    }
  }, [])

  const entrarPantallaCompleta = () => {
    if (enPantallaCompleta()) return
    const el = document.documentElement as ElFs
    if (el.requestFullscreen) sinError(el.requestFullscreen())
    else el.webkitRequestFullscreen?.()
  }

  // Pantalla completa sin cartel (David, 29-oct-2026): la página la pide sola a
  // los 15 s y con CUALQUIER tecla del control remoto. Los navegadores solo la
  // dan después de una tecla o un toque: si el de la tele no deja la de los
  // 15 s, alcanza con apretar un botón del control una vez.
  useEffect(() => {
    const t = setTimeout(entrarPantallaCompleta, 15_000)
    document.addEventListener('keydown', entrarPantallaCompleta)
    return () => {
      clearTimeout(t)
      document.removeEventListener('keydown', entrarPantallaCompleta)
    }
  }, [])

  // Tocar la pantalla (o el OK del control, que muchas teles mandan como toque)
  // solo ENTRA en pantalla completa: nunca la saca.

  // Galería: la ficha se vuelve a medir cuando cargan las letras (antes miden
  // con la de reemplazo) y si cambia el tamaño de la pantalla.
  const ficha = useRef<HTMLDivElement>(null)
  const tira = useRef<HTMLDivElement>(null)
  const pie = useRef<HTMLElement>(null)
  const [medida, setMedida] = useState(0)
  useEffect(() => {
    const otra = () => setMedida((n) => n + 1)
    const letras = (document as Document & { fonts?: { ready?: Promise<unknown> } }).fonts?.ready
    if (letras) letras.then(otra, () => {})
    window.addEventListener('resize', otra)
    return () => window.removeEventListener('resize', otra)
  }, [])

  // La ficha muestra la última propiedad: mientras pasa un emprendimiento o
  // tasar (que la tapan), queda la de antes y no hay un hueco en el fundido.
  const idxActual = slides.length ? enPaso(slides, paso).idx : 0
  let iFicha: number | null = null
  for (let k = 0; k < slides.length && iFicha === null; k++) {
    const i = mod(idxActual - k, slides.length)
    if (slides[i].kind === 'propiedad') iFicha = i
  }
  const fichaS = iFicha !== null ? (slides[iFicha] as SlidePropiedad) : null
  // Acostada: fondo blanco, y una casa sí y otra no papel crema (David, 6-nov-2026:
  // "fondo blanco no cremita... igual podés ir intercalando"; la parada sigue en crema).
  const crema =
    !vertical && iFicha !== null && slides.slice(0, iFicha).filter((x) => x.kind === 'propiedad').length % 2 === 1
  useEffect(() => {
    if (!ficha.current) return
    encogerFicha(ficha.current)
    if (!vertical) centrarEnLaColumna(ficha.current, tira.current, pie.current)
  }, [fichaS, medida, vertical])

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
          <img
            src={fuente(src)}
            ref={vigilar(src)}
            onError={() => fallo(src)}
            alt=""
            decoding="async"
            className={`tv-img ${kb}`}
            style={largo}
          />
        </div>
      )
    })
  const botonGirar = vertical && !completa && (
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
  )
  const precioFicha = fichaS ? partirPrecio(fichaS.precio) : null

  return (
    <main
      className={`tv-root${vertical ? ' tv-modo-vertical' : ''}${alReves ? ' tv-al-reves' : ''}${crema ? ' tv-crema' : ''}`}
      onClick={entrarPantallaCompleta}
    >
      <div className="tv-stage">
      {/* La foto como un cuadro con margen; sus fotos pasan como siempre. */}
      <section className="gal-foto">
        {slides.map((sl, i) => (montadas.has(i) ? capas(sl, i) : null))}
        {botonGirar}
      </section>

      {fichaS && precioFicha && iFicha !== null && (
        <>
          <div key={`f-${iFicha}`} ref={ficha} className="gal-ficha tv-in">
            <div className="gal-lugar">{fichaS.lugar}</div>
            <h2 className="gal-titular">{fichaS.titular}</h2>
            <div className="gal-raya" />
            <div className="gal-precio">
              {precioFicha.mon && <span className="gal-mon">{precioFicha.mon}</span>}
              <span className="gal-num">{precioFicha.num}</span>
              {fichaS.rebaja && (
                <span className="gal-antes">
                  <small>Bajó de</small>
                  <s>{partirPrecio(fichaS.rebaja.anterior).num}</s>
                </span>
              )}
            </div>
            {fichaS.datos.length > 0 && (
              <div className="gal-datos">
                {fichaS.datos.map((d, k) => (
                  <span key={k}>
                    {k > 0 && <b>·</b>}
                    {d}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Miniaturas (en la parada, en el tercio de abajo); la raya verde marca la que se ve. */}
          {fotosDe(fichaS).length > 1 && (
            <div key={`g-${iFicha}`} ref={tira} className="gal-tira tv-in">
              {fotosDe(fichaS).map((src, k) => (
                <div key={k} className={`gal-mini gal-m${k}${iFicha === idx && k === visible ? ' gal-mini-on' : ''}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={fuente(src)} ref={vigilar(src)} onError={() => fallo(src)} alt="" />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <footer ref={pie} className="gal-pie">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-si-inmobiliaria.svg" alt="SI INMOBILIARIA" />
        <span>siinmobiliaria.com</span>
      </footer>

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
                            <img src={fuente(u.foto)} ref={vigilar(u.foto)} onError={() => fallo(u.foto)} alt="" decoding="async" />
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

      {/* Por innerHTML: como hijo de texto, React escapa ' " > & en el HTML del
          servidor (dentro de <style> el navegador no lo des-escapa) y el estilo no
          coincide al hidratar: errores 418/425 y reglas que se caen. */}
      <style dangerouslySetInnerHTML={{ __html: `
        .tv-root { position: fixed; top: 0; right: 0; bottom: 0; left: 0; overflow: hidden; background: #F6F4EF; }
        .tv-stage { position: absolute; top: 0; right: 0; bottom: 0; left: 0; background: #F6F4EF; }
        .tv-root:not(.tv-modo-vertical), .tv-root:not(.tv-modo-vertical) .tv-stage { background: #fff; }
        .tv-root:not(.tv-modo-vertical) .tv-stage { transition: background-color ${FUNDIDO_MS}ms cubic-bezier(.4,0,.2,1); }
        .tv-root.tv-crema .tv-stage { background: #F6F4EF; }

        .tv-layer { position: absolute; top: 0; right: 0; bottom: 0; left: 0; transition: opacity ${FUNDIDO_MS}ms cubic-bezier(.4,0,.2,1);
          will-change: opacity; }
        .tv-img { position: absolute; top: 0; right: 0; bottom: 0; left: 0; width: 100%; height: 100%; object-fit: cover;
          will-change: transform; backface-visibility: hidden; }
        /* Lineal: un desplazamiento parejo, sin arranques ni frenadas a la vista. */
        .tv-kb-a { animation: tvKbA ${FOTO_MS + FUNDIDO_MS}ms linear forwards; }
        .tv-kb-b { animation: tvKbB ${FOTO_MS + FUNDIDO_MS}ms linear forwards; }
        @keyframes tvKbA { from { transform: scale(1.02); } to { transform: scale(1.09) translate3d(-1%, -1%, 0); } }
        @keyframes tvKbB { from { transform: scale(1.09) translate3d(-1%, 0, 0); } to { transform: scale(1.02) translate3d(1%, -1%, 0); } }
        .tv-full { position: absolute; left: 3vw; bottom: 4vmin; z-index: 3; display: inline-flex; align-items: center;
          padding: 1.6vmin 2vw; border: 0; border-radius: 999px; background: #fff; color: #0A2418;
          font: 700 2.4vmin/1 var(--font-poppins), sans-serif; cursor: pointer; box-shadow: 0 1vmin 3vmin rgba(0,0,0,.4); }
        .tv-full svg { margin-right: 1vw; width: 3vmin; height: 3vmin; fill: none; stroke: currentColor; stroke-width: 2.4;
          stroke-linecap: round; stroke-linejoin: round; }
        .tv-full:focus-visible { outline: .5vmin solid #8FE3B0; outline-offset: .5vmin; }

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

        .tv-progress { position: absolute; left: 0; bottom: 0; height: .5vmin; min-height: 4px;
          background: linear-gradient(90deg, #17613C, #8FE3B0); width: 0; animation-name: tvProgress;
          animation-timing-function: linear; animation-fill-mode: forwards; }
        @keyframes tvProgress { from { width: 0; } to { width: 100%; } }

        /* Entrada de los datos de cada casa, al ritmo del cruce de fotos. Arranca
           en opacity .3 (no 0) para que nunca quede en blanco si el navegador
           pausa animaciones. */
        .tv-in { animation: tvIn ${FUNDIDO_MS}ms cubic-bezier(.22,.61,.36,1) both; }
        @keyframes tvIn { from { opacity: .3; transform: translateY(1.2vmin); } to { opacity: 1; transform: none; } }

        /* Tele parada: emprendimientos, tasar y el botón "Girar". */
        ${reglasParada('.tv-modo-vertical')}
        @media (orientation: portrait) { ${reglasParada('')} }
        /* El televisor parado sigue mandando la imagen acostada: se gira la página. */
        @media (orientation: landscape) {
          .tv-modo-vertical .tv-stage { right: auto; bottom: auto; left: 50%; top: 50%; width: 100vh; height: 100vw;
            transform: translate(-50%, -50%) rotate(90deg); }
          .tv-modo-vertical.tv-al-reves .tv-stage { transform: translate(-50%, -50%) rotate(-90deg); }
        }
        @media (orientation: portrait) { .tv-girar { display: none; } }

        /* Lámina de galería. Parada (lo de base): diseñada sobre 1080 × 1920 (1 px = 1/10,8 vmin).
           Todo lo que hay que leer termina antes del 70 % del alto (abajo tapan las plantas). */
        .gal-foto { position: absolute; left: 5.93vmin; right: 5.93vmin; top: 5.93vmin; height: 70vmin; overflow: hidden;
          background: #E7E3DA; }
        .gal-ficha, .gal-pie { font-family: var(--font-montserrat), var(--font-poppins), sans-serif; color: #141413; }
        .gal-ficha { position: absolute; left: 5.93vmin; right: 5.93vmin; top: 78.89vmin; }
        .gal-lugar, .gal-titular, .gal-datos { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .gal-lugar { font-weight: 700; font-size: 3.52vmin; line-height: 1.2; letter-spacing: .14em; text-transform: uppercase; color: #17613C; }
        .gal-titular { margin: 1.3vmin 0 0; font-weight: 700; font-size: 10vmin; line-height: 1.04; letter-spacing: -.025em; }
        .gal-raya { width: 8.15vmin; height: .56vmin; margin-top: 2.78vmin; background: #17613C; }
        .gal-precio { margin-top: 2.59vmin; white-space: nowrap; overflow: hidden; line-height: 1; }
        .gal-mon { display: inline-block; vertical-align: top; margin: 1.48vmin 1.48vmin 0 0; font-weight: 700; font-size: 4.07vmin;
          letter-spacing: .08em; color: #6E6A60; }
        .gal-num { font-weight: 800; font-size: 14.44vmin; letter-spacing: -.035em; }
        .gal-antes { display: inline-block; vertical-align: top; margin: 1.3vmin 0 0 2.78vmin; padding-left: 2.59vmin;
          border-left: 2px solid #CFCAC0; }
        .gal-antes small { display: block; font-weight: 700; font-size: 2.59vmin; letter-spacing: .14em; text-transform: uppercase; color: #17613C; }
        .gal-antes s { display: block; margin-top: .93vmin; font-weight: 700; font-size: 4.63vmin; color: #8F8A7F; }
        .gal-datos { margin-top: 2.78vmin; font-weight: 600; font-size: 4.44vmin; line-height: 1.2; color: #3D3A34; }
        .gal-datos b { margin: 0 1.67vmin; font-weight: 600; color: #ABA69A; }
        .gal-tira { position: absolute; left: 5.93vmin; top: 134.44vmin; width: 88.15vmin; height: 19.26vmin; }
        .gal-mini { position: absolute; top: 0; width: 20.93vmin; height: 19.26vmin; }
        .gal-mini img { position: absolute; top: 0; left: 0; width: 100%; height: 17.41vmin; object-fit: cover; display: block;
          background: #E7E3DA; }
        .gal-mini:after { content: ''; position: absolute; left: 0; right: 0; top: 18.52vmin; height: .74vmin; background: #17613C;
          opacity: 0; transition: opacity ${FUNDIDO_MS}ms; }
        .gal-mini-on:after { opacity: 1; }
        .gal-m1 { left: 22.41vmin; }
        .gal-m2 { left: 44.82vmin; }
        .gal-m3 { left: 67.23vmin; }
        .gal-pie { position: absolute; left: 5.93vmin; right: 5.93vmin; bottom: 5.93vmin; height: 5.93vmin; border-top: 2px solid #DDD8CD; }
        .gal-pie img { position: absolute; left: 0; bottom: 0; height: 4.26vmin; width: auto; }
        .gal-pie span { position: absolute; right: 0; bottom: .56vmin; font-weight: 600; font-size: 2.78vmin; letter-spacing: .04em; color: #6E6A60; }

        /* Acostada (/tv en una pantalla acostada), sobre 1920 × 1080: la foto a la izquierda
           de punta a punta del alto y la ficha en una columna de 60 vmin a la derecha, con
           el titular a veces en dos líneas y la rebaja abajo del precio. La ficha y las
           miniaturas van juntas al medio de la columna (centrarEnLaColumna; estos top son
           los de una ficha corta, hasta que mide) y el pie al fondo. */
        @media (orientation: landscape) {
          .tv-root:not(.tv-modo-vertical) .gal-foto { right: 71.86vmin; bottom: 5.93vmin; height: auto; }
          .tv-root:not(.tv-modo-vertical) .gal-ficha { left: auto; right: 5.93vmin; width: 60vmin; top: 18.5vmin; }
          .tv-root:not(.tv-modo-vertical) .gal-lugar { font-size: 3.24vmin; }
          .tv-root:not(.tv-modo-vertical) .gal-titular { font-size: 8.15vmin; white-space: normal;
            display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
          .tv-root:not(.tv-modo-vertical) .gal-raya { margin-top: 2.6vmin; }
          .tv-root:not(.tv-modo-vertical) .gal-mon { margin: 1.1vmin 1.1vmin 0 0; font-size: 3.15vmin; }
          .tv-root:not(.tv-modo-vertical) .gal-num { font-size: 11.11vmin; }
          .tv-root:not(.tv-modo-vertical) .gal-antes { display: block; margin: 1.85vmin 0 0; padding-left: 0; border-left: 0; }
          .tv-root:not(.tv-modo-vertical) .gal-antes small { display: inline; font-size: 2.2vmin; }
          .tv-root:not(.tv-modo-vertical) .gal-antes s { display: inline; margin: 0 0 0 1.3vmin; font-size: 3.7vmin; }
          .tv-root:not(.tv-modo-vertical) .gal-datos { margin-top: 2.6vmin; font-size: 3.7vmin; }
          .tv-root:not(.tv-modo-vertical) .gal-datos b { margin: 0 1.3vmin; }
          .tv-root:not(.tv-modo-vertical) .gal-tira { left: auto; right: 5.93vmin; top: 59.6vmin; width: 60vmin; height: 12.6vmin; }
          .tv-root:not(.tv-modo-vertical) .gal-mini { width: 13.61vmin; height: 12.6vmin; }
          .tv-root:not(.tv-modo-vertical) .gal-mini img { height: 11.3vmin; }
          .tv-root:not(.tv-modo-vertical) .gal-mini:after { top: 11.96vmin; height: .64vmin; }
          .tv-root:not(.tv-modo-vertical) .gal-m1 { left: 15.46vmin; }
          .tv-root:not(.tv-modo-vertical) .gal-m2 { left: 30.93vmin; }
          .tv-root:not(.tv-modo-vertical) .gal-m3 { left: 46.39vmin; }
          .tv-root:not(.tv-modo-vertical) .gal-pie { left: auto; width: 60vmin; }
          .tv-root:not(.tv-modo-vertical) .gal-pie span { font-size: 2.41vmin; }
        }

        @media (prefers-reduced-motion: reduce) {
          .tv-kb-a, .tv-kb-b, .tv-in, .tv-layer, .gal-mini:after { animation: none !important; transition: none !important; }
        }
      ` }} />
    </main>
  )
}
