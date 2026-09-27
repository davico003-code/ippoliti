'use client'

// Emprendimientos en tarjetas altas que se deslizan (como "The Boldest New
// Developments" de SERHANT). Flechas en compu, deslizar con el dedo en celular.

import Link from 'next/link'
import Image from 'next/image'
import { useRef } from 'react'
import { MapPin } from 'lucide-react'
import { PROYECTOS_DESTACADOS } from '../proyectosDestacados'
import { Flecha, RALEWAY, Titulo, VERDE } from './ui'

const ITEMS = [
  ...PROYECTOS_DESTACADOS.map(p => ({ id: p.id, nombre: p.title, lugar: p.location, etiqueta: p.badge, href: p.href, foto: p.image })),
  { id: 'fincazul', nombre: 'Fincazul', lugar: 'Funes', etiqueta: 'Casas en condominio', href: '/emprendimientos/fincazul', foto: '/emprendimientos/fincazul/portada.jpg' },
  { id: 'fisherton-work', nombre: 'Fisherton Work', lugar: 'Fisherton', etiqueta: 'Oficinas y locales', href: '/emprendimientos/fisherton-work', foto: '/emprendimientos/fisherton-work/render-conjunto.webp' },
]

export default function EmprendimientosV2() {
  const fila = useRef<HTMLDivElement>(null)
  const mover = (dir: 1 | -1) => fila.current?.scrollBy({ left: dir * 300, behavior: 'smooth' })

  return (
    <section className="bg-white py-20 md:py-24">
      <div className="mx-auto flex max-w-[1200px] items-end justify-between gap-6 px-5 md:px-6">
        <Titulo bajada="Barrios, condominios y desarrollos que comercializamos, con financiación en dólares.">Emprendimientos</Titulo>
        <div className="hidden shrink-0 gap-2 md:flex">
          {([-1, 1] as const).map(d => (
            <button key={d} type="button" onClick={() => mover(d)} aria-label={d < 0 ? 'Anteriores' : 'Siguientes'} className="grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-gray-100" style={{ boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.15)', color: VERDE }}>
              <span style={{ transform: d < 0 ? 'rotate(180deg)' : undefined, display: 'grid' }}><Flecha size={16} /></span>
            </button>
          ))}
        </div>
      </div>
      <div
        ref={fila}
        className="mt-9 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 md:px-[max(24px,calc((100vw-1200px)/2+24px))]"
        style={{ scrollbarWidth: 'none' }}
      >
        {ITEMS.map(it => (
          <Link key={it.id} href={it.href} className="group relative block aspect-[3/4.4] w-[240px] shrink-0 snap-start overflow-hidden rounded-2xl md:w-[270px]" style={{ textDecoration: 'none' }}>
            <Image src={it.foto} alt={`${it.nombre} — ${it.lugar}`} fill sizes="270px" className="object-cover transition-transform duration-700 group-hover:scale-[1.06]" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,.8) 0%, rgba(0,0,0,0) 55%)' }} />
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10.5px] font-extrabold uppercase tracking-[0.12em]" style={{ color: VERDE, fontFamily: RALEWAY }}>{it.etiqueta}</span>
            <div className="absolute inset-x-4 bottom-4 text-white">
              <p className="text-[24px] font-extrabold leading-tight tracking-[-0.02em]" style={{ fontFamily: RALEWAY }}>{it.nombre}</p>
              <p className="mt-1 flex items-center gap-1 text-[12px] font-bold uppercase tracking-[0.12em] text-white/75" style={{ fontFamily: RALEWAY }}>
                <MapPin className="h-3 w-3" /> {it.lugar}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
