// /como-trabajamos — prueba de resultados: propiedades que ya vendimos
// (ventas propias reales, sin montos) y el muro de propiedades de HILO.

import Image from 'next/image'
import { MURO, VENDIDAS } from './datos'
import { CircleCheck, MapPin } from 'lucide-react'
import { Contenedor, Encabezado, TINTA, conNumeros } from './ui'

/** Sello "VENDIDA" en el mismo estilo de las placas de Instagram. */
function Sello({ grande = false }: { grande?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[10px] font-extrabold uppercase text-white ${grande ? 'px-4 py-2 text-[20px] md:text-[28px]' : 'px-2.5 py-1 text-[12px] md:text-[13px]'}`}
      style={{ background: '#1A5C38', letterSpacing: '0.06em', boxShadow: '0 8px 24px rgba(0,0,0,.3)' }}
    >
      <CircleCheck size={grande ? 26 : 15} strokeWidth={2.4} aria-hidden />
      Vendida
    </span>
  )
}

export function Vendidas() {
  return (
    <section className="py-16 md:py-24" style={{ background: '#0B1510' }} aria-labelledby="vendidas-titulo">
      <Contenedor>
        <Encabezado
          id="vendidas-titulo"
          oscuro
          eyebrow="Resultados"
          titulo="Propiedades que ya vendimos."
          bajada="Casas y lotes en los barrios cerrados, clubes de campo y desarrollos más buscados de la zona. Cada una pasó por el mismo método que vas a ver en esta presentación."
        />
        <ul className="m-0 mt-10 grid list-none auto-rows-[210px] grid-cols-2 gap-3 p-0 sm:auto-rows-[240px] md:gap-4 lg:auto-rows-[250px] lg:grid-cols-4">
          {VENDIDAS.map((v) => (
            <li
              key={v.foto}
              className={`ct-rev group relative overflow-hidden rounded-[18px] ${v.destacada ? 'col-span-2 row-span-2' : ''}`}
            >
              <Image
                src={v.foto}
                alt={`${v.titulo} vendida en ${v.zona}`}
                fill
                sizes={v.destacada ? '(max-width: 1024px) 100vw, 600px' : '(max-width: 1024px) 50vw, 300px'}
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <span aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(0deg, rgba(8,14,11,.92) 0%, rgba(8,14,11,.45) 38%, rgba(8,14,11,0) 62%)' }} />
              <span
                className="absolute right-2.5 top-2.5 inline-flex max-w-[calc(100%-20px)] items-center gap-1 truncate rounded-full bg-white px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-[0.08em] md:right-3 md:top-3 md:text-[11.5px]"
                style={{ color: TINTA }}
              >
                <MapPin size={12} strokeWidth={2.4} style={{ color: '#1A5C38' }} aria-hidden className="shrink-0" />
                <span className="truncate">{v.zona}</span>
              </span>
              {v.nota && (
                <span className="absolute left-2.5 top-2.5 rounded-full bg-black/55 px-2 py-0.5 text-[10.5px] font-bold text-white md:left-3 md:top-3">{v.nota}</span>
              )}
              <span className={`absolute inset-x-0 bottom-0 block ${v.destacada ? 'p-5 md:p-7' : 'p-3 md:p-4'}`}>
                <Sello grande={v.destacada} />
                <span
                  className={`mt-2 block font-extrabold leading-tight text-white ${v.destacada ? 'text-[22px] md:text-[32px]' : 'text-[14.5px] md:text-[16px]'}`}
                  style={{ letterSpacing: '-0.02em' }}
                >
                  {v.titulo}
                </span>
                <span className="mt-2 flex flex-wrap gap-1.5">
                  {v.specs.map((sp) => (
                    <span
                      key={sp}
                      className={`rounded-full border border-white/35 font-semibold text-white/90 ${v.destacada ? 'px-3 py-1 text-[13px] md:text-[14.5px]' : 'px-2 py-0.5 text-[11px] md:text-[12px]'}`}
                    >
                      {conNumeros(sp)}
                    </span>
                  ))}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </Contenedor>
    </section>
  )
}

/**
 * Mockup de HILO con muchas propiedades: una pantalla índigo con dos filas de
 * portadas reales que se deslizan en sentidos opuestos (loop continuo).
 */
export function MuroHilo() {
  const filaA = MURO.slice(0, 10)
  const filaB = MURO.slice(10)
  const fila = (fotos: string[], sentido: 'izq' | 'der') => (
    <div className="ct-muro-fila overflow-hidden">
      <div className={`ct-muro-pista flex w-max gap-3 ${sentido === 'izq' ? 'ct-muro-izq' : 'ct-muro-der'}`}>
        {[...fotos, ...fotos].map((src, i) => (
          <span key={`${src}-${i}`} className="relative block h-[118px] w-[176px] shrink-0 overflow-hidden rounded-[12px] md:h-[150px] md:w-[222px]">
            <Image src={src} alt="" fill sizes="222px" className="object-cover" />
          </span>
        ))}
      </div>
    </div>
  )
  return (
    <div className="ct-rev overflow-hidden rounded-[26px] text-white shadow-2xl" style={{ background: 'linear-gradient(135deg,#12132F 0%,#1C1A63 55%,#262293 100%)' }}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pb-4 pt-5 md:px-8 md:pt-7">
        <span className="flex items-center gap-2.5">
          <svg width="30" height="30" viewBox="0 0 1024 1024" aria-hidden style={{ borderRadius: 8 }}>
            <rect width="1024" height="1024" fill="#181A33" />
            <path d="M 400 656 C 542 540, 492 478, 636 366" fill="none" stroke="#fff" strokeWidth="78" strokeLinecap="round" />
            <circle cx="400" cy="656" r="50" fill="#fff" />
            <circle cx="636" cy="366" r="50" fill="#fff" />
          </svg>
          <span className="text-[15px] font-extrabold tracking-[0.12em]">HILO · Inventario</span>
        </span>
        <span className="text-[13px] font-semibold" style={{ color: 'rgba(255,255,255,.75)' }}>
          Más de <span className="font-numeric font-bold text-white">250</span> propiedades publicadas, en una sola pantalla
        </span>
      </div>
      <div className="grid gap-3 pb-6 md:pb-8" aria-hidden>
        {fila(filaA, 'izq')}
        {fila(filaB, 'der')}
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
.ct-muro-fila { mask-image: linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%); -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%); }
@keyframes ctMuroIzq { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes ctMuroDer { from { transform: translateX(-50%); } to { transform: translateX(0); } }
@media (prefers-reduced-motion: no-preference) {
  .ct-muro-izq { animation: ctMuroIzq 60s linear infinite; }
  .ct-muro-der { animation: ctMuroDer 60s linear infinite; }
}`,
        }}
      />
    </div>
  )
}
