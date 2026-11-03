'use client'

// Portada viva (David, 5-oct-2026): sobre la foto de portada de las destacadas
// corre una escena corta. Desde el 2-nov son escenas de vida (llega la
// familia, sale el perro). El video sale de Hilo (`portada_viva` del feed) y
// arranca y termina en la foto original.
//
// DE A UNA (David, 2-nov: "que no aparezcan juntos sino a medida que uno
// desliza… que sorprendan"): nunca corren dos a la vez. La tarjeta que entra
// en pantalla al deslizar toma el turno y su escena arranca desde cero; al
// terminar vuelve a la foto y le pasa el turno a la siguiente tarjeta visible.
//
// No le cuesta nada a la página: la foto pinta primero como siempre; el video
// recién se pide cuando le toca y aparece con un fundido cuando ya está
// corriendo (nunca un cuadro negro). Corre aunque el celu tenga "reducir
// movimiento" o ahorro de datos.
//
// iPhone (David, 2-nov: "no me aparecen"): con Modo bajo consumo o sin
// "Reproducción automática de previsualizaciones", Safari rechaza el play()
// de CUALQUIER video. Ahí se usa la misma escena como imagen animada (.webp
// al lado del .mp4, la sube Hilo), que ningún ajuste del iPhone frena.
import { useEffect, useRef, useState } from 'react'

type Turno = { el: HTMLElement; arrancar: () => void; frenar: () => void }

// Pausa antes de repetir cuando hay una sola tarjeta animada en pantalla (celu).
const PAUSA_REPETIR_MS = 5000

const visibles = new Set<Turno>()
let actual: Turno | null = null
let recienEntradas: Turno[] = []
let lote: ReturnType<typeof setTimeout> | null = null
let espera: ReturnType<typeof setTimeout> | null = null
// Si el navegador rechazó un video, el resto de las escenas ya van como imagen.
let videoBloqueado = false
const imagenes = new Map<string, Promise<Blob | null>>()
// Duración de respaldo de la escena en imagen si el video nunca cargó metadata.
const DURACION_IMAGEN_MS = 11000

function imagenDe(src: string): Promise<Blob | null> {
  const webp = src.replace(/\.mp4(\?.*)?$/, '.webp')
  let p = imagenes.get(webp)
  if (!p) {
    p = fetch(webp)
      .then((r) => (r.ok ? r.blob() : null))
      .catch(() => null)
    imagenes.set(webp, p)
  }
  return p
}

const izquierda = (t: Turno) => t.el.getBoundingClientRect().left

function darTurno(t: Turno | null) {
  if (espera) clearTimeout(espera)
  espera = null
  if (actual && actual !== t) actual.frenar()
  actual = t
  t?.arrancar()
}

function siguiente(despuesDe: Turno) {
  const vs = Array.from(visibles).sort((a, b) => izquierda(a) - izquierda(b))
  if (!vs.length) return darTurno(null)
  const prox = vs[(vs.indexOf(despuesDe) + 1) % vs.length]
  if (prox === despuesDe) {
    espera = setTimeout(() => visibles.has(prox) && actual === prox && prox.arrancar(), PAUSA_REPETIR_MS)
  } else {
    darTurno(prox)
  }
}

function entrar(t: Turno) {
  visibles.add(t)
  recienEntradas.push(t)
  // Las que entran juntas (la primera carga) se resuelven en un solo paso.
  if (lote) return
  lote = setTimeout(() => {
    const nuevas = recienEntradas.filter((n) => visibles.has(n))
    recienEntradas = []
    lote = null
    if (!nuevas.length) return
    nuevas.sort((a, b) => izquierda(a) - izquierda(b))
    // Al cargar arranca la de más a la izquierda; al deslizar, la que acaba
    // de aparecer le gana el turno a la que estaba corriendo.
    darTurno(actual && visibles.has(actual) ? nuevas[nuevas.length - 1] : nuevas[0])
  }, 50)
}

function salir(t: Turno) {
  visibles.delete(t)
  if (actual !== t) return
  t.frenar()
  actual = null
  const vs = Array.from(visibles).sort((a, b) => izquierda(a) - izquierda(b))
  darTurno(vs[0] ?? null)
}

export default function PortadaViva({ src, activa }: { src: string; activa: boolean }) {
  const ref = useRef<HTMLVideoElement>(null)
  const turno = useRef<Turno | null>(null)
  const [visible, setVisible] = useState(false)
  const [corriendo, setCorriendo] = useState(false)
  // Escena como imagen animada (iPhone que no deja arrancar videos).
  const [imagen, setImagen] = useState<string | null>(null)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.6 })
    io.observe(v)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const v = ref.current
    if (!v || !visible || !activa) return
    let fin: ReturnType<typeof setTimeout> | null = null
    let url: string | null = null
    let vigente = true
    const terminar = () => {
      setCorriendo(false)
      // Deja que el fundido vuelva a la foto antes de pasar el turno.
      setTimeout(() => actual === t && siguiente(t), 700)
    }
    const comoImagen = async () => {
      const blob = await imagenDe(src)
      if (!vigente || actual !== t || !blob) return
      // Una URL nueva por turno: la animación arranca siempre del primer cuadro.
      if (url) URL.revokeObjectURL(url)
      url = URL.createObjectURL(blob)
      setImagen(url)
      const ms = Number.isFinite(v.duration) && v.duration > 0 ? v.duration * 1000 : DURACION_IMAGEN_MS
      fin = setTimeout(terminar, ms)
    }
    const t: Turno = {
      el: v,
      arrancar: () => {
        if (videoBloqueado) return void comoImagen()
        if (!v.paused) return
        // React no siempre refleja `muted` en el elemento: sin esto iOS no
        // deja arrancar el video solo.
        v.muted = true
        if (!v.getAttribute('src')) v.setAttribute('src', src)
        if (v.ended || v.currentTime > 0) v.currentTime = 0
        v.play().catch((e: unknown) => {
          setCorriendo(false)
          if (e instanceof DOMException && e.name === 'NotAllowedError') {
            videoBloqueado = true
            void comoImagen()
          }
        })
      },
      frenar: () => {
        v.pause()
        if (fin) clearTimeout(fin)
        setCorriendo(false)
      },
    }
    turno.current = t
    entrar(t)
    return () => {
      vigente = false
      if (fin) clearTimeout(fin)
      if (url) URL.revokeObjectURL(url)
      setImagen(null)
      turno.current = null
      salir(t)
    }
  }, [visible, activa, src])

  return (
    <>
      <video
        ref={ref}
        muted
        playsInline
        preload="none"
        disablePictureInPicture
        disableRemotePlayback
        aria-hidden="true"
        tabIndex={-1}
        onPlaying={() => setCorriendo(true)}
        onEnded={() => {
          setCorriendo(false)
          const t = turno.current
          if (t) setTimeout(() => actual === t && siguiente(t), 700)
        }}
        className="absolute inset-0 h-full w-full object-cover pointer-events-none transition-opacity duration-700"
        style={{ opacity: corriendo && activa ? 1 : 0 }}
      />
      {imagen && (
        // eslint-disable-next-line @next/next/no-img-element -- blob animado, next/image no lo sirve
        <img
          src={imagen}
          alt=""
          aria-hidden="true"
          onLoad={() => setCorriendo(true)}
          className="absolute inset-0 h-full w-full object-cover pointer-events-none transition-opacity duration-700"
          style={{ opacity: corriendo && activa ? 1 : 0 }}
        />
      )}
    </>
  )
}
