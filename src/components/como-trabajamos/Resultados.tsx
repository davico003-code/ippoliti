// /como-trabajamos — prueba de resultados: propiedades que ya vendimos
// (ventas propias reales, sin montos) y el muro de propiedades de HILO.

import Image from 'next/image'
import { MURO, VENDIDAS } from './datos'
import { BORDE, Contenedor, Encabezado, FONDO, GRIS, TEXTO, TINTA } from './ui'

const ROJO = '#F40009'

export function Vendidas() {
  return (
    <section className="py-16 md:py-24" style={{ background: FONDO }} aria-labelledby="vendidas-titulo">
      <Contenedor>
        <Encabezado
          id="vendidas-titulo"
          eyebrow="Resultados"
          titulo="Propiedades que ya vendimos."
          bajada="Algunas de las ventas que cerramos en el último año, con la foto original de su publicación. Cada una pasó por el mismo método que vas a ver en esta presentación."
        />
        <ul className="m-0 mt-10 grid list-none grid-cols-2 gap-3 p-0 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
          {VENDIDAS.map((v) => (
            <li key={v.slug} className="ct-rev overflow-hidden rounded-[18px] bg-white" style={{ border: `1px solid ${BORDE}` }}>
              <span className="relative block aspect-[4/3]">
                <Image src={v.foto} alt={`${v.tipo} vendida en ${v.zona}`} fill sizes="(max-width: 768px) 50vw, 290px" className="object-cover" />
                <span
                  className="absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white md:left-3 md:top-3 md:px-3 md:text-[12px]"
                  style={{ background: ROJO, boxShadow: '0 6px 16px rgba(244,0,9,.35)' }}
                >
                  Vendida
                </span>
              </span>
              <span className="block p-3.5 md:p-4">
                <span className="block text-[14px] font-extrabold leading-snug md:text-[15.5px]" style={{ color: TINTA }}>
                  {v.tipo}
                </span>
                <span className="mt-0.5 block text-[12.5px] font-semibold md:text-[13.5px]" style={{ color: TEXTO }}>
                  {v.zona}
                </span>
                <span className="mt-1 block text-[12px] font-semibold md:text-[12.5px]" style={{ color: GRIS }}>
                  Vendida en {v.fecha.toLowerCase()}
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
