// Dot plot (beeswarm simple) en SVG inline: un punto por comparable sobre la
// recta min–max. Si dos puntos caen encima, el segundo sube una fila.

import { fmtMiles } from '@/lib/tasacion/formato'

interface Props {
  valores: number[]
  min: number
  max: number
  /** Texto accesible, ej. "6 casas entre USD 350.000 y 545.000". */
  etiqueta: string
}

const W = 320
const PAD = 10
const R = 7
const GAP = R * 2 + 3

export default function DotPlot({ valores, min, max, etiqueta }: Props) {
  const orden = [...valores].filter((v) => Number.isFinite(v)).sort((a, b) => a - b)
  const span = max > min ? max - min : 1
  const puntos: { x: number; fila: number }[] = []
  for (const v of orden) {
    const t = Math.min(1, Math.max(0, (v - min) / span))
    const x = PAD + t * (W - 2 * PAD)
    let fila = 0
    while (puntos.some((p) => p.fila === fila && Math.abs(p.x - x) < GAP)) fila++
    puntos.push({ x, fila })
  }
  const filas = puntos.reduce((m, p) => Math.max(m, p.fila), 0)
  const yBase = 6 + R + filas * (R * 2 + 2)
  const H = yBase + R + 4

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={etiqueta}
      className="block h-auto w-full"
    >
      <title>{etiqueta}</title>
      <line x1={PAD} x2={W - PAD} y1={yBase} y2={yBase} stroke="#D7E8DD" strokeWidth="4" strokeLinecap="round" />
      {puntos.map((p, i) => {
        const y = yBase - p.fila * (R * 2 + 2)
        return (
          <g key={i}>
            <circle cx={p.x} cy={y} r={R} fill="#fff" stroke="#17613C" strokeWidth="2" />
            <circle cx={p.x} cy={y} r={R - 3.5} fill="#17613C" />
          </g>
        )
      })}
      <desc>
        Valores: {orden.map((v) => `USD ${fmtMiles(v)}`).join(', ')}
      </desc>
    </svg>
  )
}
