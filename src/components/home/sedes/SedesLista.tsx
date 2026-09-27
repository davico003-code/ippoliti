'use client'

// Opción 5 · Lista minimalista: tipografía grande, líneas finas. En compu, al
// pasar el mouse por una sede aparece su foto flotando junto al cursor; en
// celular cada fila lleva su foto chica.

import Image from 'next/image'
import { useRef, useState } from 'react'
import { MapPin } from 'lucide-react'
import EncabezadoSeccion from '../EncabezadoSeccion'
import EstadoSede from './EstadoSede'
import { Acciones, RALEWAY, POPPINS, SEDES, VERDE } from './datos'

export default function SedesLista() {
  const [hover, setHover] = useState<number | null>(null)
  const flotante = useRef<HTMLDivElement>(null)
  const zona = useRef<HTMLDivElement>(null)

  const mover = (e: React.MouseEvent) => {
    const f = flotante.current, z = zona.current
    if (!f || !z) return
    const r = z.getBoundingClientRect()
    f.style.transform = `translate3d(${e.clientX - r.left + 28}px, ${e.clientY - r.top - 120}px, 0)`
  }

  return (
    <section className="bg-white px-5 pb-20 pt-4 md:px-6 md:pb-24">
      <div className="mx-auto max-w-[1200px]">
        <EncabezadoSeccion eyebrow="Nuestras sedes" titulo="Tres lugares para encontrarnos." nivel="h3" />
        <div ref={zona} className="relative mt-8 border-t border-black/10" onMouseMove={mover} onMouseLeave={() => setHover(null)}>
          {/* Foto flotante (solo compu) */}
          <div ref={flotante} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-10 hidden h-[240px] w-[340px] overflow-hidden rounded-2xl md:block" style={{ opacity: hover === null ? 0 : 1, transition: 'opacity .35s ease', boxShadow: '0 30px 60px -20px rgba(0,0,0,.45)' }}>
            {SEDES.map((s, k) => (
              <Image key={s.n} src={s.foto} alt="" fill sizes="340px" className="object-cover transition-opacity duration-300" style={{ opacity: hover === k ? 1 : 0 }} />
            ))}
          </div>

          {SEDES.map((s, k) => (
            <article
              key={s.n}
              onMouseEnter={() => setHover(k)}
              className="revela grid grid-cols-[72px_1fr] items-center gap-4 border-b border-black/10 py-6 md:grid-cols-[80px_1.3fr_1fr_auto] md:gap-8 md:py-9"
            >
              <div className="relative h-[72px] w-[72px] overflow-hidden rounded-2xl md:hidden">
                <Image src={s.foto} alt={`${s.nombre} de SI INMOBILIARIA — ${s.direccion}`} fill sizes="72px" className="object-cover" />
              </div>
              <p className="font-numeric hidden text-[15px] font-semibold md:block" style={{ fontFamily: POPPINS, color: hover === k ? VERDE : '#9aa0ad', transition: 'color .3s' }}>{s.n}</p>
              <div>
                <p className="font-numeric text-[12px] font-bold md:hidden" style={{ fontFamily: POPPINS, color: VERDE }}>Desde {s.anio}</p>
                <h4 className="text-[26px] font-extrabold leading-[1.02] tracking-[-0.035em] md:text-[44px]" style={{ fontFamily: RALEWAY, color: '#111', transform: hover === k ? 'translateX(8px)' : 'none', transition: 'transform .4s cubic-bezier(.2,.7,.2,1)' }}>
                  {s.nombre}
                </h4>
                <p className="mt-1 text-[14px] font-semibold text-gray-500 md:text-[16px]" style={{ fontFamily: RALEWAY }}>{s.subtitulo} · {s.ciudad}<span className="font-numeric hidden md:inline"> · desde {s.anio}</span></p>
              </div>
              <div className="col-span-2 md:col-span-1">
                <p className="flex items-center gap-1.5 text-[14px] text-gray-700 md:text-[15px]" style={{ fontFamily: RALEWAY }}>
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" /> {s.direccion}
                </p>
                {s.horario && <div className="mt-2"><EstadoSede horario={s.horario} /></div>}
              </div>
              <div className="col-span-2 md:col-span-1"><Acciones s={s} /></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
