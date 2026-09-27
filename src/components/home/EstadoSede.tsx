'use client'

import { useEffect, useState } from 'react'

// Horario por día (0 = domingo … 6 = sábado): [abre, cierra] en horas.
export type Horario = Partial<Record<number, [number, number]>>

const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']

/** Hora actual en Argentina, sin depender de la zona del visitante. */
function ahoraAR() {
  const f = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Argentina/Buenos_Aires', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false })
  const p = Object.fromEntries(f.formatToParts(new Date()).map(x => [x.type, x.value]))
  const dia = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday)
  return { dia, hora: (parseInt(p.hour, 10) % 24) + parseInt(p.minute, 10) / 60 }
}

function estado(h: Horario) {
  const { dia, hora } = ahoraAR()
  const hoy = h[dia]
  if (hoy && hora >= hoy[0] && hora < hoy[1]) return { abierto: true, texto: `Abierto · cierra ${hoy[1]} h` }
  // Próxima apertura: hoy más tarde o el próximo día con horario.
  if (hoy && hora < hoy[0]) return { abierto: false, texto: `Cerrado · abre ${hoy[0]} h` }
  for (let i = 1; i <= 7; i++) {
    const d = (dia + i) % 7
    const x = h[d]
    if (x) return { abierto: false, texto: `Cerrado · abre ${i === 1 ? 'mañana' : DIAS[d]} ${x[0]} h` }
  }
  return null
}

/**
 * "Abierto ahora / Cerrado" calculado en el navegador (la home es estática:
 * si se calculara en el servidor quedaría viejo). Antes de montar no muestra
 * nada, así no hay parpadeo de un estado equivocado.
 */
export default function EstadoSede({ horario }: { horario: Horario }) {
  const [e, setE] = useState<ReturnType<typeof estado>>(null)
  useEffect(() => {
    setE(estado(horario))
    const id = setInterval(() => setE(estado(horario)), 60_000)
    return () => clearInterval(id)
  }, [horario])
  if (!e) return <span className="inline-block h-[26px]" aria-hidden="true" />
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-bold"
      style={{ background: e.abierto ? '#E7F5EE' : '#F2F2F4', color: e.abierto ? '#00754A' : '#5b6170', fontFamily: "var(--font-raleway), 'Raleway', sans-serif" }}
    >
      <span className="relative flex h-2 w-2">
        {e.abierto && <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: '#00754A' }} />}
        <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: e.abierto ? '#00754A' : '#9aa0ad' }} />
      </span>
      {e.texto}
    </span>
  )
}
