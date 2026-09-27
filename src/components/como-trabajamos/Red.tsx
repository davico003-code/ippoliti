// /como-trabajamos — el equipo como una red de relaciones personales:
// SI al centro, la dirección en el primer anillo, los agentes en el segundo y
// las relaciones que trae cada uno alrededor. Todo en HTML + SVG, con las
// posiciones calculadas en el servidor; el único movimiento es CSS (líneas
// que "fluyen" y anillos que respiran), quieto si se pidió menos movimiento.

import Image from 'next/image'
import { AGENTES, DIRECCION } from './datos'
import { MENTA } from './ui'

const RELACIONES = [
  'Propietarios',
  'Compradores',
  'Inversores',
  'Desarrolladores',
  'Colegas',
  'Escribanías',
  'Barrios cerrados',
  'Clientes ABC1',
]

const R_DIR = 17
const R_AGE = 33
const R_REL = 45

function punto(r: number, grados: number) {
  const a = (grados * Math.PI) / 180
  return { x: 50 + r * Math.cos(a), y: 50 + r * Math.sin(a) }
}

export default function RedRelaciones() {
  const dir = DIRECCION.map((p, i) => ({ ...p, ...punto(R_DIR, -90 + i * 120) }))
  const age = AGENTES.map((a, i) => ({ ...a, ang: -90 + 360 / 32 + (i * 360) / AGENTES.length, ...punto(R_AGE, -90 + 360 / 32 + (i * 360) / AGENTES.length) }))
  const rel = RELACIONES.map((t, i) => ({ t, ...punto(R_REL, -90 + 22.5 + i * 45) }))
  // Cada agente cuelga del directivo más cercano (en ángulo).
  const padre = (ang: number) => {
    const n = (((ang + 90) % 360) + 360) % 360
    return dir[Math.round(n / 120) % 3]
  }

  return (
    <div className="ct-red relative mx-auto aspect-square w-full max-w-[820px]">
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
        <circle cx="50" cy="50" r={R_DIR} fill="none" stroke="rgba(159,217,185,.18)" strokeWidth=".15" />
        <circle cx="50" cy="50" r={R_AGE} fill="none" stroke="rgba(159,217,185,.14)" strokeWidth=".15" />
        <circle className="ct-red-anillo hidden md:block" cx="50" cy="50" r={R_REL} fill="none" stroke="rgba(159,217,185,.28)" strokeWidth=".18" strokeDasharray=".6 1.4" />
        {dir.map((d) => (
          <line key={d.nombre} className="ct-red-flujo" x1="50" y1="50" x2={d.x} y2={d.y} stroke={MENTA} strokeOpacity=".7" strokeWidth=".3" strokeDasharray="1 1.2" />
        ))}
        {age.map((a) => {
          const p = padre(a.ang)
          return <line key={a.nombre} className="ct-red-flujo" x1={p.x} y1={p.y} x2={a.x} y2={a.y} stroke={MENTA} strokeOpacity=".35" strokeWidth=".18" strokeDasharray=".8 1" />
        })}
        {rel.map((r, i) => {
          const a = age[(i * 2) % age.length]
          return <line key={r.t} className="ct-red-flujo hidden md:block" x1={a.x} y1={a.y} x2={r.x} y2={r.y} stroke={MENTA} strokeOpacity=".25" strokeWidth=".15" strokeDasharray=".5 1" />
        })}
      </svg>

      {/* Centro */}
      <div className="absolute left-1/2 top-1/2 flex h-[15%] w-[15%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_0_0_6px_rgba(159,217,185,.15),0_0_60px_rgba(0,117,74,.55)]">
        <div className="relative h-[62%] w-[62%]">
          <Image src="/logo-si-inmobiliaria.svg" alt="SI INMOBILIARIA" fill sizes="80px" className="object-contain" />
        </div>
      </div>

      {/* Dirección */}
      {dir.map((d) => (
        <figure key={d.nombre} className="absolute m-0 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center" style={{ left: `${d.x}%`, top: `${d.y}%`, width: '15%' }}>
          <span className="relative block aspect-square w-full overflow-hidden rounded-full" style={{ boxShadow: `0 0 0 3px ${MENTA}, 0 10px 30px rgba(0,0,0,.45)` }}>
            <Image src={d.foto} alt={d.nombre} fill sizes="130px" className="object-cover" style={{ objectPosition: 'center 22%' }} />
          </span>
          <figcaption className="mt-1.5 whitespace-nowrap text-center text-[10px] font-extrabold text-white sm:text-[12px] md:text-[13.5px]">{d.nombre}</figcaption>
        </figure>
      ))}

      {/* Agentes */}
      {age.map((a) => (
        <span
          key={a.nombre}
          title={a.nombre}
          className="absolute block aspect-square -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full bg-neutral-700"
          style={{ left: `${a.x}%`, top: `${a.y}%`, width: '9%', boxShadow: '0 0 0 2px rgba(255,255,255,.85), 0 6px 18px rgba(0,0,0,.4)' }}
        >
          <Image src={a.foto} alt={a.nombre} fill sizes="80px" className="object-cover" style={{ objectPosition: 'center 22%' }} />
        </span>
      ))}

      {/* Relaciones (desktop) */}
      {rel.map((r) => (
        <span
          key={r.t}
          className="absolute hidden -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full px-3 py-1.5 text-[12.5px] font-bold text-white md:block"
          style={{ left: `${r.x}%`, top: `${r.y}%`, background: 'rgba(14,53,33,.85)', border: '1px solid rgba(159,217,185,.35)', backdropFilter: 'blur(6px)' }}
        >
          {r.t}
        </span>
      ))}

      <style
        dangerouslySetInnerHTML={{
          __html: `
@keyframes ctRedFlujo { to { stroke-dashoffset: -8; } }
@keyframes ctRedGiro { to { transform: rotate(360deg); } }
.ct-red-anillo { transform-origin: 50px 50px; }
@media (prefers-reduced-motion: no-preference) {
  .ct-red-flujo { animation: ctRedFlujo 3.2s linear infinite; }
  .ct-red-anillo { animation: ctRedGiro 90s linear infinite; }
}`,
        }}
      />
    </div>
  )
}

export { RELACIONES }
