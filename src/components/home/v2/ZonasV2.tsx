// "Nuestras zonas" (el "Our Regions" de SERHANT): una hoja blanca que se
// monta sobre la portada con las esquinas de arriba redondeadas, y botones
// por ciudad y por barrio que llevan al buscador ya filtrado.

import Link from 'next/link'
import { Flecha, RALEWAY, Titulo, VERDE } from './ui'

const CIUDADES = ['Funes', 'Roldán', 'Rosario', 'Fisherton']
const BARRIOS = ['Kentucky', 'Funes Hills', 'Vida', 'San Sebastián', 'Cadaqués', 'Don Mateo', 'Tierra de Sueños', 'Aldea Fisherton', 'Distrito Roldán', 'Puerto Roldán']

function Pastilla({ texto, fuerte = false }: { texto: string; fuerte?: boolean }) {
  return (
    <Link
      href={`/propiedades?q=${encodeURIComponent(texto)}`}
      className="group flex items-center justify-between gap-2 rounded-2xl px-5 py-4 transition-all duration-300 hover:-translate-y-0.5"
      style={{ fontFamily: RALEWAY, textDecoration: 'none', background: fuerte ? VERDE : '#fff', color: fuerte ? '#fff' : '#111', boxShadow: fuerte ? 'none' : 'inset 0 0 0 1px rgba(0,0,0,.1)' }}
    >
      <span className={fuerte ? 'text-[18px] font-extrabold' : 'text-[15px] font-bold'}>{texto}</span>
      <span className="transition-transform duration-300 group-hover:translate-x-1" style={{ color: fuerte ? '#fff' : VERDE }}><Flecha /></span>
    </Link>
  )
}

export default function ZonasV2() {
  return (
    <section className="relative z-10 -mt-12 rounded-t-[40px] bg-white px-5 pb-16 pt-14 md:-mt-16 md:rounded-t-[56px] md:px-6 md:pb-20 md:pt-20">
      <div className="mx-auto max-w-[1200px]">
        <Titulo bajada="Elegí dónde querés vivir y te mostramos lo que tenemos ahí.">Nuestras zonas</Titulo>
        <div className="revela mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {CIUDADES.map(c => <Pastilla key={c} texto={c} fuerte />)}
        </div>
        <div className="revela mt-3 grid grid-cols-2 gap-3 md:grid-cols-5">
          {BARRIOS.map(b => <Pastilla key={b} texto={b} />)}
        </div>
      </div>
    </section>
  )
}
