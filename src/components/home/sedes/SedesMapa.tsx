'use client'

// Opción 3 · "Buscador de locales": lista de sedes + mapa real con los tres
// puntos. Tocar una sede vuela el mapa hasta ella. El mapa (Leaflet) se
// descarga recién cuando la sección entra en pantalla.

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'
import EncabezadoSeccion from '../EncabezadoSeccion'
import EstadoSede from './EstadoSede'
import { Acciones, RALEWAY, POPPINS, SEDES, VERDE } from './datos'

const Mapa = dynamic(() => import('./MapaSedesLeaflet'), { ssr: false, loading: () => <div className="h-full w-full bg-[#F5F5F7]" /> })

export default function SedesMapa() {
  const [activo, setActivo] = useState(2)
  const [cargar, setCargar] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setCargar(true); io.disconnect() } }, { rootMargin: '300px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section className="bg-white px-5 pb-20 pt-4 md:px-6 md:pb-24">
      <div className="mx-auto max-w-[1200px]">
        <EncabezadoSeccion eyebrow="Nuestras sedes" titulo="Tres lugares para encontrarnos." nivel="h3" />
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-[400px_1fr] md:gap-6">
          <div ref={ref} className="order-1 h-[300px] overflow-hidden rounded-3xl md:order-2 md:h-[600px]" style={{ boxShadow: '0 1px 2px rgba(0,0,0,.04), 0 24px 50px -30px rgba(17,24,39,.35)' }}>
            {cargar ? <Mapa activo={activo} onElegir={setActivo} /> : <div className="h-full w-full bg-[#F5F5F7]" />}
          </div>
          <ul className="order-2 flex flex-col gap-3 md:order-1">
            {SEDES.map((s, i) => {
              const on = i === activo
              return (
                <li key={s.n}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setActivo(i)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActivo(i) } }}
                    className="block w-full cursor-pointer rounded-3xl p-4 text-left transition-all duration-300"
                    style={{ background: on ? '#F5F5F7' : '#fff', boxShadow: on ? `inset 0 0 0 2px ${VERDE}` : 'inset 0 0 0 1px rgba(0,0,0,.08)' }}
                  >
                    <div className="flex gap-4">
                      <div className="relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-2xl">
                        <Image src={s.foto} alt={`${s.nombre} de SI INMOBILIARIA — ${s.direccion}`} fill sizes="84px" className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-numeric text-[12px] font-bold" style={{ fontFamily: POPPINS, color: VERDE }}>{s.n} · desde {s.anio}</p>
                        <p className="text-[19px] font-extrabold leading-tight tracking-[-0.02em] text-gray-900" style={{ fontFamily: RALEWAY }}>{s.nombre}</p>
                        <p className="text-[13px] font-semibold text-gray-500" style={{ fontFamily: RALEWAY }}>{s.subtitulo} · {s.ciudad}</p>
                      </div>
                    </div>
                    <div className="grid transition-all duration-300" style={{ gridTemplateRows: on ? '1fr' : '0fr' }}>
                      <div className="overflow-hidden">
                        <p className="mt-3 flex items-center gap-1.5 text-[14px] text-gray-700" style={{ fontFamily: RALEWAY }}>
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" /> {s.direccion}
                        </p>
                        {s.horario && <div className="mt-2"><EstadoSede horario={s.horario} /></div>}
                        <div className="mt-3"><Acciones s={s} /></div>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
