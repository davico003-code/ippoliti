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
// movimiento" o ahorro de datos; si el navegador frena el arranque solo
// (iPhone en Modo bajo consumo), se reintenta con el primer toque.
import { useEffect, useRef, useState } from 'react'

type Turno = { el: HTMLElement; arrancar: () => void; frenar: () => void }

// Pausa antes de repetir cuando hay una sola tarjeta animada en pantalla (celu).
const PAUSA_REPETIR_MS = 5000

const visibles = new Set<Turno>()
let actual: Turno | null = null
let recienEntradas: Turno[] = []
let lote: ReturnType<typeof setTimeout> | null = null
let espera: ReturnType<typeof setTimeout> | null = null
let escuchaGestos = false

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

function escucharGestos() {
  if (escuchaGestos) return
  escuchaGestos = true
  // Modo bajo consumo rechaza el play() automático, pero lo acepta dentro
  // de un gesto del usuario.
  const reintentar = () => actual?.arrancar()
  for (const ev of ['touchend', 'click', 'keydown']) {
    document.addEventListener(ev, reintentar, { passive: true })
  }
}

export default function PortadaViva({ src, activa }: { src: string; activa: boolean }) {
  const ref = useRef<HTMLVideoElement>(null)
  const turno = useRef<Turno | null>(null)
  const [visible, setVisible] = useState(false)
  const [corriendo, setCorriendo] = useState(false)

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
    const t: Turno = {
      el: v,
      arrancar: () => {
        if (!v.paused) return
        // React no siempre refleja `muted` en el elemento: sin esto iOS no
        // deja arrancar el video solo.
        v.muted = true
        if (!v.getAttribute('src')) v.setAttribute('src', src)
        if (v.ended || v.currentTime > 0) v.currentTime = 0
        v.play().catch(() => setCorriendo(false))
      },
      frenar: () => {
        v.pause()
        setCorriendo(false)
      },
    }
    turno.current = t
    escucharGestos()
    entrar(t)
    return () => {
      turno.current = null
      salir(t)
    }
  }, [visible, activa, src])

  return (
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
        // Deja que el fundido vuelva a la foto antes de pasar el turno.
        const t = turno.current
        if (t) setTimeout(() => actual === t && siguiente(t), 700)
      }}
      className="absolute inset-0 h-full w-full object-cover pointer-events-none transition-opacity duration-700"
      style={{ opacity: corriendo && activa ? 1 : 0 }}
    />
  )
}
