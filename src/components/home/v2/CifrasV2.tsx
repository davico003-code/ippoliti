// Cifras con mapa de puntos (el bloque "SellIt" de SERHANT, con su globo de
// puntos). Acá los puntos dibujan la zona y los pines marcan dónde estamos.
// La cantidad de propiedades es la real del inventario publicado.

import { getPropertyCount } from '@/lib/tokko'
import { POPPINS, RALEWAY, Titulo, VERDE } from './ui'

// Puntos en un círculo, más densos al centro: se genera una vez en el servidor.
function puntos() {
  const out: { x: number; y: number; o: number }[] = []
  for (let y = 10; y <= 390; y += 13) {
    for (let x = 10; x <= 390; x += 13) {
      const d = Math.hypot(x - 200, y - 200)
      if (d > 185) continue
      out.push({ x, y, o: 0.18 + 0.5 * (1 - d / 185) })
    }
  }
  return out
}

const PINES = [
  { x: 120, y: 175, t: 'Roldán', s: '2 sedes' },
  { x: 215, y: 215, t: 'Funes', s: '1 sede' },
  { x: 305, y: 190, t: 'Rosario', s: 'operamos' },
]

export default async function CifrasV2() {
  let total = 0
  try { total = await getPropertyCount() } catch { /* sin feed: se oculta la cifra */ }
  const cifras = [
    { n: '43', l: 'años en la zona' },
    { n: '3', l: 'sedes' },
    ...(total ? [{ n: String(total), l: 'propiedades publicadas' }] : []),
    { n: '2', l: 'generaciones' },
  ]
  return (
    <section className="overflow-hidden bg-[#F5F5F7] px-5 py-20 md:px-6 md:py-24">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-12 md:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="revela text-[12px] font-bold uppercase tracking-[0.22em]" style={{ color: VERDE, fontFamily: RALEWAY }}>Desde 1983</p>
          <Titulo className="mt-3" bajada="Empezamos con una oficina en Roldán. Hoy somos un equipo en tres sedes que conoce cada barrio de Funes, Roldán y Rosario, y que atiende pocos clientes a la vez para cuidar cada operación.">
            La inmobiliaria que conoce la zona.
          </Titulo>
          <div className="revela mt-10 grid grid-cols-2 gap-x-6 gap-y-8">
            {cifras.map(c => (
              <div key={c.l}>
                <p className="font-numeric" style={{ fontFamily: POPPINS, fontWeight: 600, fontSize: 'clamp(40px, 4.4vw, 58px)', lineHeight: 1, letterSpacing: '-0.04em', color: VERDE }}>{c.n}</p>
                <p className="mt-2 text-[14px] font-semibold text-gray-600" style={{ fontFamily: RALEWAY }}>{c.l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="revela relative mx-auto w-full max-w-[460px]" aria-hidden="true">
          <svg viewBox="0 0 400 400" className="h-auto w-full">
            {puntos().map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={2.6} fill={VERDE} opacity={p.o} />)}
            {PINES.map(p => (
              <g key={p.t}>
                <circle cx={p.x} cy={p.y} r={16} fill={VERDE} opacity={0.18} />
                <circle cx={p.x} cy={p.y} r={7} fill={VERDE} stroke="#fff" strokeWidth={3} />
                <text x={p.x} y={p.y - 24} textAnchor="middle" style={{ font: `800 15px ${RALEWAY}`, fill: '#111' }}>{p.t}</text>
                <text x={p.x} y={p.y + 32} textAnchor="middle" style={{ font: `600 11px ${RALEWAY}`, fill: '#5b6170' }}>{p.s}</text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </section>
  )
}
