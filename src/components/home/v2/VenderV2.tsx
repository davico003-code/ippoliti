// "¿Querés vender?" (el "Move Forward" de SERHANT, que muestra una foto dentro de
// una S gigante): acá la foto de la oficina se ve a través de las letras "SI"
// del logo. A la derecha, el llamado a tasar.

import Link from 'next/link'
import Image from 'next/image'
import { Flecha, RALEWAY, Titulo, VERDE } from './ui'

export default function VenderV2() {
  return (
    <section className="overflow-hidden bg-white px-5 py-20 md:px-6 md:py-28">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
        <div className="revela relative mx-auto aspect-[290/203] w-full max-w-[560px]">
          <div className="absolute inset-0 overflow-hidden" style={{ WebkitMaskImage: 'url(/images/v2/s-mascara.svg)', maskImage: 'url(/images/v2/s-mascara.svg)', WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center' }}>
            <Image src="/nosotros/si-inmobiliaria-oficina-funes-interior.webp" alt="" fill sizes="560px" className="object-cover" />
          </div>
        </div>
        <div>
          <p className="revela text-[12px] font-bold uppercase tracking-[0.22em]" style={{ color: VERDE, fontFamily: RALEWAY }}>Vendé con SI INMOBILIARIA</p>
          <Titulo className="mt-3" bajada="Tasación con datos reales de la zona, publicación en los principales portales e informes para que sepas qué pasa con tu propiedad en cada momento.">
            ¿Querés vender? Hacelo con quienes conocen el barrio.
          </Titulo>
          <div className="revela mt-8 flex flex-wrap gap-3">
            <Link href="/tasaciones" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-extrabold text-white" style={{ background: VERDE, fontFamily: RALEWAY, textDecoration: 'none' }}>
              Tasá tu propiedad <Flecha />
            </Link>
            <a href="https://wa.me/5493413340916?text=Hola!%20Quiero%20vender%20mi%20propiedad." target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-extrabold" style={{ color: VERDE, boxShadow: `inset 0 0 0 1.5px ${VERDE}`, fontFamily: RALEWAY, textDecoration: 'none' }}>
              Hablá con un agente
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
