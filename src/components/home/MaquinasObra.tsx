// Capa animada sobre la aérea de Distrito Roldán (tarjeta grande del mosaico
// de la home): un tractor verde baja despacio por la calle del medio del
// loteo, se pierde entre los árboles y al rato vuelve. Un guiño para el que
// mira la foto. El camión estacionado en el obrador no se mueve: está
// integrado en la foto (public/images/distrito-roldan/portada-home-aerea.webp).
//
// Realismo: el tractor va a ~3× la escala real de la aérea, con el color de
// la foto y la sombra hacia la derecha como la de los árboles (horneada en
// cada figura: public/maquinas/tractor-verde-{baja,sube}.webp).
//
// Las coordenadas están trazadas sobre ESA foto (1600×900). El viewBox +
// `slice` reproducen el `object-fit: cover` centrado de la imagen, así que la
// capa calza en cualquier tamaño de tarjeta. Si se cambia la foto, hay que
// volver a trazar las rutas.
//
// SVG + SMIL puro: sin JS en el cliente. Con reduced-motion se oculta.

type P = readonly [number, number]

interface Vista {
  href: string
  /** Tamaño de la figura en px de la foto. */
  w: number
  h: number
  /** Dónde pisa el tractor dentro de la figura (px de la foto). */
  x: number
  y: number
}

const TRACTOR = {
  /** Va hacia abajo a la derecha. */
  baja: { href: '/maquinas/tractor-verde-baja.webp', w: 25.5, h: 19, x: 8.5, y: 12.24 },
  /** Va hacia arriba a la izquierda. */
  sube: { href: '/maquinas/tractor-verde-sube.webp', w: 25.5, h: 23, x: 8.5, y: 16.67 },
} satisfies Record<string, Vista>

/** Duración del guion completo, en segundos (incluye los ratos sin tractor). */
const CICLO = 122
/** px de la foto por segundo: andar de tractor, sin apuro. */
const VEL = 9

// La calle del medio, de punta a punta (entra y sale entre los árboles).
const ARRIBA: P = [595, 311]
const ABAJO: P = [975, 520]

const VIAJES: { desde: P; hasta: P; arranque: number; vista: Vista }[] = [
  { desde: ARRIBA, hasta: ABAJO, arranque: 2, vista: TRACTOR.baja },
  { desde: ABAJO, hasta: ARRIBA, arranque: 63, vista: TRACTOR.sube },
]

const r2 = (n: number) => Math.round(n * 100) / 100
const k4 = (n: number) => (Math.round(n * 10000) / 10000).toString()
const COMUN = { dur: `${CICLO}s`, repeatCount: 'indefinite', calcMode: 'linear' } as const

function Viaje({ desde, hasta, arranque, vista }: (typeof VIAJES)[number]) {
  const largo = Math.hypot(hasta[0] - desde[0], hasta[1] - desde[1])
  const fin = arranque + largo / VEL
  if (fin > CICLO - 1) throw new Error('MaquinasObra: el viaje no entra en el guion')
  const t = (s: number) => k4(s / CICLO)
  // Aparece y se va fundiéndose (entra y sale entre los árboles).
  const tiempos = ['0', t(arranque), t(arranque + 1.5), t(fin - 1.5), t(fin), '1'].join(';')
  // El polvo queda atrás, en sentido contrario al que avanza.
  const [ux, uy] = [(hasta[0] - desde[0]) / largo, (hasta[1] - desde[1]) / largo]
  const giro = r2((Math.atan2(uy, ux) * 180) / Math.PI)
  const polvo = (
    <ellipse cx={0} cy={0} rx={10} ry={4.5} fill="url(#mq-polvo)" transform={`translate(${r2(-ux * 14)} ${r2(-uy * 14)}) rotate(${giro})`}>
      <animate attributeName="rx" values="9;12;9" dur="2.2s" repeatCount="indefinite" />
    </ellipse>
  )
  return (
    <g opacity={0}>
      <animateMotion {...COMUN} path={`M${desde[0]},${desde[1]} L${hasta[0]},${hasta[1]}`} keyTimes={['0', t(arranque), t(fin), '1'].join(';')} keyPoints="0;0;1;1" />
      <animate {...COMUN} attributeName="opacity" keyTimes={tiempos} values="0;0;1;1;0;0" />
      <g className="mq">
        {/* Si viene hacia la cámara el polvo queda más lejos (atrás de la figura); si se aleja, adelante. */}
        {uy > 0 && polvo}
        <image href={vista.href} x={-vista.x} y={-vista.y} width={vista.w} height={vista.h} />
        {uy < 0 && polvo}
      </g>
    </g>
  )
}

export default function MaquinasObra() {
  return (
    <svg className="maquinas" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="mq-polvo">
          <stop offset="0" stopColor="#d9c7a8" stopOpacity="0.45" />
          <stop offset="1" stopColor="#d9c7a8" stopOpacity="0" />
        </radialGradient>
      </defs>
      {VIAJES.map((v) => (
        <Viaje key={v.arranque} {...v} />
      ))}
    </svg>
  )
}
