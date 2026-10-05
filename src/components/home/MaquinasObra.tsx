// Capa animada sobre la aérea de Distrito Roldán (tarjeta grande del mosaico
// de la home): un tractor, un camión volcador y una motoniveladora pasan de a
// ratos por las calles de tierra del loteo, y una retroexcavadora trabaja en el
// obrador. Es un guiño para el que mira con atención, no un dibujo animado:
// máquinas de pocos píxeles, polvo tenue y un guion de 96 s con ratos de calma.
// El guion está coreografiado para que las máquinas nunca se pisen: el tractor
// espera en el cruce a que pase el camión, la motoniveladora entra cuando el
// camión ya dejó la calle del medio, y el tractor vuelve cuando ella pasó.
//
// Las coordenadas están trazadas sobre ESA foto (1600×900, la de Tokko en
// proyectosDestacados.ts). El viewBox + `slice` reproducen el `object-fit:
// cover` centrado de la imagen, así que la capa calza en cualquier tamaño de
// tarjeta. Si se cambia la foto, hay que volver a trazar las rutas.
//
// SVG + SMIL puro: sin JS en el cliente. Con reduced-motion se oculta.

import type { ReactNode } from 'react'

type P = readonly [number, number]

interface Recorrido {
  ruta: readonly P[]
  /** px de la foto por segundo. */
  vel: number
  /** Segundo del guion en el que aparece. */
  arranque: number
  /** Pausa en segundos al llegar a un vértice de la ruta (índice → s). */
  pausas?: Readonly<Record<number, number>>
}

/** Duración del guion completo, en segundos (incluye el rato sin máquinas). */
const CICLO = 96

const CALLES = {
  // Tractor: entra por el extremo sur de la calle transversal, baja por la
  // calle de abajo, frena en el cruce (pasa el camión) y sale por arriba.
  tractor: {
    ruta: [[535, 410], [576, 390], [800, 520], [967, 419], [1045, 456]],
    vel: 20,
    arranque: 3,
    pausas: { 2: 2.5 },
  },
  // Camión: entra desde el sur, sube hasta el obrador, espera la carga y sale
  // por el norte.
  camion: {
    ruta: [[740, 565], [885, 471], [659, 346], [750, 301], [800, 284], [858, 289]],
    vel: 26,
    arranque: 14,
    pausas: { 3: 7 },
  },
  // Motoniveladora: recorre lenta la calle del medio, de punta a punta.
  moto: {
    ruta: [[595, 311], [975, 520]],
    vel: 10,
    arranque: 32,
  },
  // El tractor vuelve por la transversal cuando la motoniveladora ya cruzó.
  tractorVuelta: {
    ruta: [[1045, 456], [967, 419], [740, 565]],
    vel: 20,
    arranque: 63,
  },
} satisfies Record<string, Recorrido>

const r2 = (n: number) => Math.round(n * 100) / 100
const k4 = (n: number) => (Math.round(n * 10000) / 10000).toString()

/** Path con esquinas redondeadas (las máquinas doblan, no giran en seco) y el
 *  largo acumulado hasta cada vértice. */
function trazar(ruta: readonly P[], radio = 7) {
  const dist = (a: P, b: P) => Math.hypot(b[0] - a[0], b[1] - a[1])
  const hacia = (a: P, b: P, d: number): P => {
    const l = dist(a, b)
    return [a[0] + ((b[0] - a[0]) * d) / l, a[1] + ((b[1] - a[1]) * d) / l]
  }
  const largoCurva = (a: P, c: P, b: P) => {
    let l = 0
    let prev = a
    for (let i = 1; i <= 12; i++) {
      const t = i / 12
      const u = 1 - t
      const p: P = [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]
      l += dist(prev, p)
      prev = p
    }
    return l
  }

  let d = `M${ruta[0][0]},${ruta[0][1]}`
  const largos = [0]
  let total = 0
  let desde: P = ruta[0]
  for (let i = 1; i < ruta.length - 1; i++) {
    const v = ruta[i]
    const r = Math.min(radio, dist(ruta[i - 1], v) / 2, dist(v, ruta[i + 1]) / 2)
    const a = hacia(v, ruta[i - 1], r)
    const b = hacia(v, ruta[i + 1], r)
    const curva = largoCurva(a, v, b)
    total += dist(desde, a)
    largos.push(total + curva / 2)
    total += curva
    d += ` L${r2(a[0])},${r2(a[1])} Q${v[0]},${v[1]} ${r2(b[0])},${r2(b[1])}`
    desde = b
  }
  const ultimo = ruta[ruta.length - 1]
  total += dist(desde, ultimo)
  largos.push(total)
  d += ` L${ultimo[0]},${ultimo[1]}`
  return { d, largos, total }
}

/** Arma los keyTimes/keyPoints del movimiento y las curvas de opacidad
 *  (máquina visible mientras recorre; polvo solo mientras avanza). */
function cronograma(m: Recorrido) {
  const { d, largos, total } = trazar(m.ruta)
  const mov: [number, number][] = [[0, 0], [m.arranque, 0]]
  const tramos: [number, number][] = []
  const finPausa: Record<number, number> = {}
  let t = m.arranque
  let inicioTramo = t
  for (let i = 1; i < largos.length; i++) {
    t += (largos[i] - largos[i - 1]) / m.vel
    mov.push([t, largos[i] / total])
    const pausa = m.pausas?.[i]
    if (pausa) {
      tramos.push([inicioTramo, t])
      t += pausa
      mov.push([t, largos[i] / total])
      finPausa[i] = t
      inicioTramo = t
    }
  }
  const fin = t
  if (inicioTramo < fin) tramos.push([inicioTramo, fin])
  if (fin > CICLO - 1) throw new Error('MaquinasObra: el recorrido no entra en el guion')
  mov.push([CICLO, 1])

  const visible: [number, number][] = [[0, 0], [m.arranque, 0], [m.arranque + 0.9, 1], [fin - 0.9, 1], [fin, 0], [CICLO, 0]]
  const polvo: [number, number][] = [[0, 0]]
  for (const [a, b] of tramos) polvo.push([a, 0], [a + 0.6, 1], [b - 0.4, 1], [b, 0])
  polvo.push([CICLO, 0])

  const anim = (puntos: [number, number][]) => ({
    keyTimes: puntos.map(([s]) => k4(s / CICLO)).join(';'),
    values: puntos.map(([, v]) => k4(v)).join(';'),
  })
  return { d, mov: anim(mov), visible: anim(visible), polvo: anim(polvo), finPausa }
}

const TRACTOR = cronograma(CALLES.tractor)
const CAMION = cronograma(CALLES.camion)
const MOTO = cronograma(CALLES.moto)
const TRACTOR_VUELTA = cronograma(CALLES.tractorVuelta)

// El camión se va del obrador con la caja llena: se carga en el último tramo
// de la pausa.
const finCarga = CAMION.finPausa[3]
const CARGA = {
  keyTimes: ['0', k4((finCarga - 2.5) / CICLO), k4(finCarga / CICLO), '1'].join(';'),
  values: '0;0;1;1',
}

type Crono = ReturnType<typeof cronograma>

/** Máquina que recorre su ruta: movimiento + aparición + polvo detrás. */
function Recorriendo({ c, largo, children }: { c: Crono; largo: number; children: ReactNode }) {
  const comun = { dur: `${CICLO}s`, repeatCount: 'indefinite', calcMode: 'linear' } as const
  return (
    <g opacity={0}>
      <animateMotion {...comun} path={c.d} rotate="auto" keyTimes={c.mov.keyTimes} keyPoints={c.mov.values} />
      <animate {...comun} attributeName="opacity" keyTimes={c.visible.keyTimes} values={c.visible.values} />
      <g className="mq">
        <g opacity={0}>
          <animate {...comun} attributeName="opacity" keyTimes={c.polvo.keyTimes} values={c.polvo.values} />
          <ellipse cx={-largo / 2 - 15} cy={0} rx={13} ry={7} fill="url(#mq-polvo)" opacity={0.55}>
            <animate attributeName="ry" values="6;8;6" dur="2.3s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx={-largo / 2 - 4} cy={0} rx={8} ry={5} fill="url(#mq-polvo)">
            <animate attributeName="rx" values="7;9.5;7" dur="1.7s" repeatCount="indefinite" />
          </ellipse>
        </g>
        {children}
      </g>
    </g>
  )
}

const AMARILLO = '#d9ad2b'
const GOMA = '#2b2a28'
const SOMBRA = { fill: '#000', opacity: 0.28 }

function Tractor() {
  return (
    <>
      <rect x={-5.2} y={-3.4} width={11} height={7} rx={1.4} {...SOMBRA} transform="translate(1 1)" />
      <rect x={-6} y={-4.2} width={4.6} height={1.8} rx={0.6} fill={GOMA} />
      <rect x={-6} y={2.4} width={4.6} height={1.8} rx={0.6} fill={GOMA} />
      <rect x={2.6} y={-3.2} width={2.6} height={1.2} rx={0.4} fill={GOMA} />
      <rect x={2.6} y={2} width={2.6} height={1.2} rx={0.4} fill={GOMA} />
      <rect x={-2.4} y={-1.7} width={8.4} height={3.4} rx={1} fill="#b33a2e" />
      <rect x={-5} y={-2.7} width={4.4} height={5.4} rx={0.8} fill="#ece9e2" />
    </>
  )
}

export default function MaquinasObra() {
  return (
    <svg className="maquinas" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="mq-polvo">
          <stop offset="0" stopColor="#ece2cf" stopOpacity="0.85" />
          <stop offset="0.5" stopColor="#e3d6bf" stopOpacity="0.4" />
          <stop offset="1" stopColor="#e3d6bf" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Retroexcavadora en el obrador: gira entre la pila y la calle. */}
      <g transform="translate(744 283)">
        <g className="mq">
          <g transform="rotate(-27)">
            <rect x={-5.2} y={-3.6} width={11} height={7.6} rx={1} {...SOMBRA} transform="translate(1 1)" />
            <rect x={-5.5} y={-4} width={11} height={2.2} rx={0.8} fill={GOMA} />
            <rect x={-5.5} y={1.8} width={11} height={2.2} rx={0.8} fill={GOMA} />
          </g>
          <g>
            <animateTransform attributeName="transform" type="rotate" values="207;207;72;72;207" keyTimes="0;0.3;0.48;0.74;1" dur="8.5s" repeatCount="indefinite" calcMode="spline" keySplines="0 0 1 1;.45 0 .55 1;0 0 1 1;.45 0 .55 1" />
            <rect x={-3.2} y={-3.4} width={7} height={6.8} rx={1.2} {...SOMBRA} transform="translate(1 1)" />
            <rect x={-3.6} y={-3.4} width={7} height={6.8} rx={1.2} fill={AMARILLO} />
            <rect x={0.4} y={-3.1} width={2.6} height={2.8} rx={0.5} fill="#3d3f40" />
            <rect x={3.2} y={-0.8} width={8.5} height={1.6} rx={0.6} fill={AMARILLO} />
            <rect x={11.2} y={-1.6} width={2.2} height={3.2} rx={0.5} fill={GOMA} />
          </g>
        </g>
      </g>

      {/* Tractor (rojo, techo blanco): va y, más tarde, vuelve. */}
      <Recorriendo c={TRACTOR} largo={12}>
        <Tractor />
      </Recorriendo>
      <Recorriendo c={TRACTOR_VUELTA} largo={12}>
        <Tractor />
      </Recorriendo>

      {/* Camión volcador: cabina amarilla, caja gris que vuelve con tierra. */}
      <Recorriendo c={CAMION} largo={17}>
        <rect x={-8.5} y={-3.2} width={17} height={6.4} rx={1} {...SOMBRA} transform="translate(1 1)" />
        <rect x={-9} y={-3.3} width={11.6} height={6.6} rx={0.7} fill="#6f675f" />
        <rect x={-8.1} y={-2.5} width={9.8} height={5} rx={0.6} fill="#8b6b4f" opacity={0}>
          <animate attributeName="opacity" dur={`${CICLO}s`} repeatCount="indefinite" calcMode="linear" keyTimes={CARGA.keyTimes} values={CARGA.values} />
        </rect>
        <rect x={3.4} y={-3} width={4.8} height={6} rx={1.1} fill={AMARILLO} />
        <rect x={6.2} y={-2.6} width={1.6} height={5.2} rx={0.5} fill="#3d3f40" />
      </Recorriendo>

      {/* Motoniveladora: larga, con la cuchilla en diagonal. */}
      <Recorriendo c={MOTO} largo={20}>
        <rect x={-9.5} y={-2.6} width={20} height={5.2} rx={1} {...SOMBRA} transform="translate(1 1)" />
        <rect x={-1.5} y={-4} width={1.6} height={8} rx={0.4} fill="#4a4a48" transform="rotate(28 -0.7 0)" />
        <rect x={-10} y={-2.8} width={6.4} height={5.6} rx={1} fill={AMARILLO} />
        <rect x={-4.4} y={-2.4} width={4} height={4.8} rx={0.8} fill="#ece9e2" />
        <rect x={-0.6} y={-0.8} width={9.4} height={1.6} rx={0.5} fill={AMARILLO} />
        <rect x={7.8} y={-3} width={2.4} height={1.3} rx={0.4} fill={GOMA} />
        <rect x={7.8} y={1.7} width={2.4} height={1.3} rx={0.4} fill={GOMA} />
      </Recorriendo>
    </svg>
  )
}
