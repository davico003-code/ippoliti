'use client'

import Link from 'next/link'
import PortadaViva from './PortadaViva'
import CiudadRotativa from './CiudadRotativa'
import { BuscadorHero } from './SugerenciasBusqueda'
import { TINDER_ACTIVO } from '@/lib/tinder'

export default function HeroMobile() {
  return (
    // Sin overflow-hidden: recortaba el dropdown de sugerencias al borde del
    // hero. z-20 para que el dropdown quede por encima de las secciones de abajo.
    <section className="relative z-20 flex flex-col" style={{ height: 330 }}>
      {/* Portada viva (foto → video) + velo */}
      <PortadaViva
        poster="/images/hero/portada-viva-mobile.webp"
        video="/videos/portada-viva-mobile.mp4"
        sizes="(max-width: 767px) 100vw, 1px"
        velo="radial-gradient(80% 60% at 50% 45%, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0) 100%), linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0.3) 100%)"
      />

      {/* Contenido del hero (header global se encarga del navbar) */}
      <div data-portada-contenido className="flex-1 flex flex-col justify-center items-center px-5 text-white text-center relative z-10">
        <h2 className="font-raleway font-black text-[36px] leading-[1.02] tracking-[-0.03em] drop-shadow-lg whitespace-nowrap">
          {/* Espacio REAL entre palabras (y --sep en 0): antes la separación
              era solo un margen de CSS y el titular se leía "Encontrátuhogar"
              (lectores de pantalla, copiar y pegar, Google). El espacio mide
              casi lo mismo que el margen de antes: el titular se ve igual. */}
          {['Encontrá', 'tu', 'hogar'].map((w, i) => (
            <span key={w}>
              {i > 0 && ' '}
              <span className="portada-in portada-palabra inline-block" style={{ ['--d' as string]: `${100 + i * 100}ms`, ['--sep' as string]: '0em' }}>
                {w}
              </span>
            </span>
          ))}
        </h2>
        <p className="portada-in font-raleway font-semibold text-white/95 text-[15px] mt-1.5 drop-shadow" style={{ ['--d' as string]: '450ms' }}>
          Propiedades en <CiudadRotativa />
        </p>

        {/* Buscador compartido con la compu (SugerenciasBusqueda.tsx). z-20:
            el link de abajo (también con portada-in) pintaba ENCIMA del panel
            de sugerencias. */}
        <BuscadorHero
          variante="celu"
          className="portada-in mt-4 z-20"
          style={{ ['--d' as string]: '600ms' }}
        />

        {/* La puerta para quien vende: el segundo público de SI no tenía
            ninguna entrada en la home del celu antes del footer (solo el
            tercer ítem del menú). Una sola, chica y blanca: buscar sigue
            siendo LA acción; esto no compite. Lleva al tasador, que da un
            valor al instante. */}
        <Link
          href="/tasar"
          className="portada-in si-tap mt-1.5 inline-flex min-h-[44px] items-center rounded-full px-3 font-raleway text-[14px] text-white drop-shadow"
          style={{ ['--d' as string]: '750ms', textDecoration: 'none' }}
        >
          {/* Un solo renglón de texto con espacio real (no gap de flex): así
              se lee "¿Vendés? Mirá…" y no "¿Vendés?Mirá…". */}
          <span>
            <span className="font-medium text-white/85">¿Vendés?</span>{' '}
            <span className="font-bold">Mirá cuánto vale tu casa →</span>
          </span>
        </Link>

        {/* El mazo tipo Tinder por zona (David, 3-oct: "que lo usen pero que
            no sea lo principal"; 4-oct: solo celu). Hoy apagado. Si se
            reactiva, elegir UNA puerta secundaria con el link de tasar de
            arriba: dos links apilados bajo el buscador ya compiten. */}
        {TINDER_ACTIVO && (
          <Link
            href="/conoce-tu-hogar"
            className="portada-in si-tap mt-1.5 inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 py-1.5 font-raleway text-[14px] font-bold text-white underline decoration-white/60 underline-offset-4 drop-shadow"
            style={{ ['--d' as string]: '750ms' }}
          >
            <span aria-hidden="true" className="text-[#FF6B8E] no-underline">♥</span>
            Conocé tu próximo hogar
          </Link>
        )}
      </div>
    </section>
  )
}
