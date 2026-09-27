'use client'

// Opción 4 · Editorial: una foto grande por sede, con la info encima. Pasa
// sola cada 6 s (se frena si el mouse está encima o si se eligió una) y se
// cambia con las pestañas de abajo.

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'
import EncabezadoSeccion from '../EncabezadoSeccion'
import EstadoSede from './EstadoSede'
import { Acciones, RALEWAY, POPPINS, SEDES } from './datos'

const PASO = 6000

export default function SedesEditorial() {
  const [i, setI] = useState(0)
  const [quieto, setQuieto] = useState(false)
  const [ciclo, setCiclo] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (quieto || !visible || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setTimeout(() => { setI(x => (x + 1) % SEDES.length); setCiclo(c => c + 1) }, PASO)
    return () => clearTimeout(id)
  }, [i, quieto, visible, ciclo])

  const elegir = (k: number) => { setI(k); setQuieto(true) }

  return (
    <section className="bg-white px-5 pb-20 pt-4 md:px-6 md:pb-24">
      <div className="mx-auto max-w-[1200px]">
        <EncabezadoSeccion eyebrow="Nuestras sedes" titulo="Tres lugares para encontrarnos." nivel="h3" />
        <div
          ref={ref}
          className="relative mt-8 aspect-[4/5] overflow-hidden rounded-3xl bg-neutral-900 sm:aspect-[16/10] md:aspect-[16/8]"
          onMouseEnter={() => setQuieto(true)}
          onMouseLeave={() => setQuieto(false)}
        >
          {SEDES.map((s, k) => (
            <div key={s.n} className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: k === i ? 1 : 0 }} aria-hidden={k !== i}>
              <Image
                src={s.foto}
                alt={`${s.nombre} de SI INMOBILIARIA — ${s.direccion}`}
                fill
                sizes="(min-width: 1240px) 1200px, 100vw"
                className="object-cover"
                style={{ transform: k === i ? 'scale(1)' : 'scale(1.06)', transition: 'transform 7s cubic-bezier(.2,.7,.2,1)' }}
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,.78) 0%, rgba(0,0,0,.35) 38%, rgba(0,0,0,0) 65%), linear-gradient(to right, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 55%)' }} />
              <div
                className="absolute inset-x-5 bottom-20 text-white md:inset-x-12 md:bottom-24"
                style={{ opacity: k === i ? 1 : 0, transform: k === i ? 'none' : 'translate3d(0,16px,0)', transition: 'opacity .8s ease .25s, transform .8s cubic-bezier(.2,.7,.2,1) .25s' }}
              >
                <p className="font-numeric text-[13px] font-semibold uppercase tracking-[0.22em] text-white/80" style={{ fontFamily: POPPINS }}>Desde {s.anio}</p>
                <h4 className="mt-2 text-[34px] font-extrabold leading-[1] tracking-[-0.035em] md:text-[60px]" style={{ fontFamily: RALEWAY }}>{s.nombre}</h4>
                <p className="mt-2 text-[15px] font-semibold text-white/85 md:text-[18px]" style={{ fontFamily: RALEWAY }}>{s.subtitulo} · {s.ciudad}</p>
                <p className="mt-3 flex items-center gap-1.5 text-[14px] text-white/85" style={{ fontFamily: RALEWAY }}>
                  <MapPin className="h-3.5 w-3.5 shrink-0" /> {s.direccion}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Acciones s={s} claro />
                  {s.horario && <EstadoSede horario={s.horario} />}
                </div>
              </div>
            </div>
          ))}

          {/* Pestañas con barra de tiempo */}
          <div className="absolute inset-x-5 bottom-5 grid grid-cols-3 gap-3 md:inset-x-12 md:bottom-8">
            {SEDES.map((s, k) => (
              <button key={s.n} type="button" onClick={() => elegir(k)} className="text-left" aria-label={`Ver ${s.nombre}`}>
                <span className="block h-[3px] overflow-hidden rounded-full bg-white/25">
                  <span
                    key={`${k}-${i}-${ciclo}-${quieto}`}
                    className="block h-full rounded-full bg-white"
                    style={{
                      width: k < i ? '100%' : k === i ? (quieto || !visible ? '100%' : '0%') : '0%',
                      animation: k === i && !quieto && visible ? `sedeBarra ${PASO}ms linear forwards` : undefined,
                    }}
                  />
                </span>
                <span className={`mt-2 block truncate text-[12px] font-bold md:text-[13px] ${k === i ? 'text-white' : 'text-white/60'}`} style={{ fontFamily: RALEWAY }}>{s.nombre.replace('Oficina ', '')}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `@keyframes sedeBarra { from { width: 0% } to { width: 100% } }` }} />
    </section>
  )
}
