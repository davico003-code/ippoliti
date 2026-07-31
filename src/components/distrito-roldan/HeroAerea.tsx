// Hero de Distrito Roldán: la aérea del barrio a pantalla, con los dos accesos
// que buscan las visitas — el tour 360° y la disponibilidad de lotes.
//
// La foto va con <Image priority> y dos fuentes (mobile / desktop) para que el
// LCP no cargue 610 kB en un celular. El degradado inferior es el que sostiene
// la legibilidad del título y los botones sobre cualquier zona de la imagen.

import Image from 'next/image'
import Link from 'next/link'
import { Compass, MapPinned } from 'lucide-react'

const VERDE = '#1A5C38'

interface Props {
  /** Tour 360° externo. */
  tourUrl: string
  /** Pantalla de disponibilidad y precios (link interno). */
  disponibilidadUrl: string
  titulo: string
  bajada: string
}

export default function HeroAerea({ tourUrl, disponibilidadUrl, titulo, bajada }: Props) {
  return (
    <section className="relative w-full h-[68vh] min-h-[440px] md:h-[78vh]">
      {/* Aérea: mobile y desktop por separado para no bajar 610 kB en celular. */}
      <picture>
        <source media="(max-width: 768px)" srcSet="/images/distrito-roldan/hero-aerea-mobile.webp" />
        <Image
          src="/images/distrito-roldan/hero-aerea.webp"
          alt="Vista aérea de Distrito Roldán, sobre Ruta 9 y María Auxiliadora"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </picture>

      {/* Degradado: sostiene el texto sin tapar la vista del barrio. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

      <div className="absolute inset-x-0 bottom-0 p-6 pb-8 md:p-12">
        <div className="mx-auto max-w-[1180px]">
          <h1
            className="max-w-[16ch] text-[clamp(30px,5.5vw,52px)] font-extrabold leading-[1.05] tracking-tight text-white"
            style={{ textShadow: '0 2px 14px rgba(0,0,0,.45)' }}
          >
            {titulo}
          </h1>
          <p
            className="mt-2.5 max-w-[46ch] text-[15px] font-medium text-white/90 md:text-[17px]"
            style={{ textShadow: '0 1px 10px rgba(0,0,0,.5)' }}
          >
            {bajada}
          </p>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:gap-3">
            <a
              href={tourUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-[15px] font-bold text-white transition-transform hover:scale-[1.02]"
              style={{ background: VERDE, boxShadow: '0 8px 24px rgba(9,30,20,.35)' }}
            >
              <Compass className="h-[18px] w-[18px]" aria-hidden />
              Ver tour 360°
            </a>
            <Link
              href={disponibilidadUrl}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-[15px] font-bold transition-transform hover:scale-[1.02]"
              style={{ color: VERDE, boxShadow: '0 8px 24px rgba(0,0,0,.22)' }}
            >
              <MapPinned className="h-[18px] w-[18px]" aria-hidden />
              Ver disponibilidad
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
