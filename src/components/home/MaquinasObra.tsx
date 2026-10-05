// Capa animada sobre la aérea de Distrito Roldán (tarjeta grande del mosaico
// de la home): tractores y camiones pasan de a ratos por las calles de tierra
// del loteo, levantando un poco de polvo. Un guiño para el que mira la foto,
// con un guion de 96 s que tiene ratos de calma, coreografiado para que los
// vehículos nunca se pisen (el tractor frena en el cruce a que pase el camión,
// el verde entra cuando el camión ya dejó la calle del medio, etc.).
//
// Las figuras (public/maquinas/*.webp, fotorrealistas generadas con IA y
// recortadas) están en isométrica, el ángulo de la aérea: cada vehículo tiene
// una vista "de frente" (va hacia abajo a la derecha) y una "de atrás" (va
// hacia arriba a la derecha); espejadas cubren las cuatro direcciones de las
// calles, así nunca se ve girado raro.
//
// Las coordenadas están trazadas sobre ESA foto (1600×900, la de Tokko en
// proyectosDestacados.ts). El viewBox + `slice` reproducen el `object-fit:
// cover` centrado de la imagen, así que la capa calza en cualquier tamaño de
// tarjeta. Si se cambia la foto, hay que volver a trazar las rutas.
//
// SVG + SMIL puro: sin JS en el cliente. Con reduced-motion se oculta.

type P = readonly [number, number]

// Tamaños en px de la foto aérea. La escala real es ~1,2 px por metro: los
// vehículos van ~4× más grandes para que se reconozcan.
interface Vista {
  href: string
  w: number
  h: number
}

/** Dónde pisa la figura: centrada en x y a este alto (desde arriba), que es
 *  el centro del vehículo sobre el piso en la isométrica. */
const ANCLA_Y = 0.72

interface Modelo {
  /** Va hacia abajo a la derecha: se le ve el frente. */
  frente: Vista
  /** Va hacia arriba a la derecha: se le ve la parte de atrás. */
  atras: Vista
  /** Largo del vehículo sobre la calle (para la sombra y el polvo). */
  largo: number
}

const TRACTOR_ROJO: Modelo = {
  frente: { href: '/maquinas/tractor-rojo-frente.webp', w: 27, h: 27.73 },
  atras: { href: '/maquinas/tractor-rojo-atras.webp', w: 27, h: 25.09 },
  largo: 21,
}
const TRACTOR_VERDE: Modelo = {
  frente: { href: '/maquinas/tractor-verde-frente.webp', w: 27, h: 26.07 },
  atras: { href: '/maquinas/tractor-verde-atras.webp', w: 27, h: 26.92 },
  largo: 21,
}
const CAMION: Modelo = {
  frente: { href: '/maquinas/camion-frente.webp', w: 46, h: 41.2 },
  atras: { href: '/maquinas/camion-atras.webp', w: 46, h: 43 },
  largo: 40,
}

interface Recorrido {
  modelo: Modelo
  ruta: readonly P[]
  /** px de la foto por segundo. */
  vel: number
  /** Segundo del guion en el que aparece. */
  arranque: number
  /** Pausa en segundos al llegar a un vértice de la ruta (índice → s). */
  pausas?: Readonly<Record<number, number>>
}

/** Duración del guion completo, en segundos (incluye el rato sin vehículos). */
const CICLO = 96

const RECORRIDOS: Recorrido[] = [
  // Tractor rojo: entra por el extremo sur de la transversal, baja por la
  // calle de abajo, frena antes del cruce para que pase el camión, dobla y
  // sale por arriba.
  {
    modelo: TRACTOR_ROJO,
    ruta: [[535, 410], [576, 390], [772, 504], [800, 520], [967, 419], [1045, 456]],
    vel: 20,
    arranque: 3,
    pausas: { 2: 3 },
  },
  // Camión: entra desde el sur, cruza delante del tractor, sube hasta el
  // obrador, descarga y sale por el norte.
  {
    modelo: CAMION,
    ruta: [[740, 565], [885, 471], [659, 346], [750, 301], [800, 284], [858, 289]],
    vel: 26,
    arranque: 15,
    pausas: { 3: 5 },
  },
  // Tractor verde: recorre lento la calle del medio, de punta a punta.
  {
    modelo: TRACTOR_VERDE,
    ruta: [[595, 311], [975, 520]],
    vel: 13,
    arranque: 33,
  },
  // El tractor rojo vuelve por la transversal cuando el verde ya cruzó.
  {
    modelo: TRACTOR_ROJO,
    ruta: [[1045, 456], [967, 419], [740, 565]],
    vel: 20,
    arranque: 66,
  },
]

const r2 = (n: number) => Math.round(n * 100) / 100
const k4 = (n: number) => (Math.round(n * 10000) / 10000).toString()

/** Path con esquinas redondeadas y el largo acumulado hasta cada vértice. */
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

type Rumbo = 'frente' | 'frenteEspejo' | 'atras' | 'atrasEspejo'
const RUMBOS: Rumbo[] = ['frente', 'frenteEspejo', 'atras', 'atrasEspejo']

/** Hacia dónde mira el vehículo en cada tramo (y = hacia abajo en la foto). */
function rumbo(a: P, b: P): Rumbo {
  const haciaLaCamara = b[1] > a[1]
  const izquierda = b[0] < a[0]
  if (haciaLaCamara) return izquierda ? 'frenteEspejo' : 'frente'
  return izquierda ? 'atrasEspejo' : 'atras'
}

/** keyTimes/keyPoints del movimiento, aparición, polvo (solo mientras avanza)
 *  y qué vista se muestra en cada tramo. */
function cronograma(m: Recorrido) {
  const { d, largos, total } = trazar(m.ruta)
  const mov: [number, number][] = [[0, 0], [m.arranque, 0]]
  const tramos: [number, number][] = []
  // La vista cambia al empezar cada tramo: al pasar por el vértice o, si hay
  // pausa, cuando arranca de nuevo (frena mirando hacia donde venía).
  const cambios: [number, Rumbo][] = [[m.arranque, rumbo(m.ruta[0], m.ruta[1])]]
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
      inicioTramo = t
    }
    if (i < largos.length - 1) cambios.push([t, rumbo(m.ruta[i], m.ruta[i + 1])])
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
  // Discreto: el valor k rige desde keyTimes[k] hasta el siguiente. Antes del
  // arranque el vehículo está invisible, así que arranca con la primera vista.
  const vista = Object.fromEntries(
    RUMBOS.map((r) => [
      r,
      {
        keyTimes: ['0', ...cambios.map(([s]) => k4(s / CICLO))].join(';'),
        values: [cambios[0][1] === r ? 1 : 0, ...cambios.map(([, x]) => (x === r ? 1 : 0))].join(';'),
      },
    ]),
  ) as Record<Rumbo, { keyTimes: string; values: string }>
  return { d, mov: anim(mov), visible: anim(visible), polvo: anim(polvo), vista }
}

const COMUN = { dur: `${CICLO}s`, repeatCount: 'indefinite' } as const

/** Hacia dónde avanza en pantalla cada vista (unitario, isométrica). */
const AVANCE: Record<Rumbo, P> = {
  frente: [0.866, 0.5],
  frenteEspejo: [-0.866, 0.5],
  atras: [0.866, -0.5],
  atrasEspejo: [-0.866, -0.5],
}

function Vehiculo({ m }: { m: Recorrido }) {
  const c = cronograma(m)
  const largo = m.modelo.largo
  return (
    <g opacity={0}>
      <animateMotion {...COMUN} calcMode="linear" path={c.d} rotate="0" keyTimes={c.mov.keyTimes} keyPoints={c.mov.values} />
      <animate {...COMUN} calcMode="linear" attributeName="opacity" keyTimes={c.visible.keyTimes} values={c.visible.values} />
      <g className="mq">
        {RUMBOS.map((r) => {
          const v = r.startsWith('atras') ? m.modelo.atras : m.modelo.frente
          const [ax, ay] = AVANCE[r]
          const giro = r2((Math.atan2(ay, ax) * 180) / Math.PI)
          // El polvo queda atrás del vehículo. Si el vehículo viene hacia la
          // cámara el polvo está más lejos (se pinta antes); si se aleja, lo
          // tapa un poco.
          const polvo = (
            <g opacity={0} transform={`translate(${r2(-ax * largo * 0.85)} ${r2(-ay * largo * 0.85)}) rotate(${giro})`}>
              <animate {...COMUN} calcMode="linear" attributeName="opacity" keyTimes={c.polvo.keyTimes} values={c.polvo.values} />
              <ellipse cx={0} cy={0} rx={r2(largo * 0.55)} ry={r2(largo * 0.3)} fill="url(#mq-polvo)">
                <animate attributeName="rx" values={`${r2(largo * 0.5)};${r2(largo * 0.68)};${r2(largo * 0.5)}`} dur="1.7s" repeatCount="indefinite" />
              </ellipse>
            </g>
          )
          return (
            <g key={r} opacity={0}>
              <animate {...COMUN} calcMode="discrete" attributeName="opacity" keyTimes={c.vista[r].keyTimes} values={c.vista[r].values} />
              {/* Sombra en el piso, corrida hacia abajo a la derecha como las de la foto. */}
              <ellipse cx={0} cy={0} rx={r2(largo * 0.52)} ry={r2(largo * 0.2)} fill="url(#mq-sombra)" transform={`translate(${r2(largo * 0.12)} ${r2(largo * 0.08)}) rotate(${giro})`} />
              {ay > 0 && polvo}
              <image
                href={v.href}
                x={r2(-v.w / 2)}
                y={r2(-v.h * ANCLA_Y)}
                width={v.w}
                height={v.h}
                transform={r.endsWith('Espejo') ? 'scale(-1 1)' : undefined}
              />
              {ay < 0 && polvo}
            </g>
          )
        })}
      </g>
    </g>
  )
}

export default function MaquinasObra() {
  return (
    <svg className="maquinas" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="mq-polvo">
          <stop offset="0" stopColor="#ece2cf" stopOpacity="0.8" />
          <stop offset="0.5" stopColor="#e3d6bf" stopOpacity="0.38" />
          <stop offset="1" stopColor="#e3d6bf" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="mq-sombra">
          <stop offset="0" stopColor="#000" stopOpacity="0.35" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      {RECORRIDOS.map((m, i) => (
        <Vehiculo key={i} m={m} />
      ))}
    </svg>
  )
}
