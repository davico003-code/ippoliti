// Hero de Distrito Roldán: la aérea del barrio a pantalla, con los dos accesos
// que buscan las visitas — el tour 360° y la disponibilidad de lotes.
//
// La foto va con <Image priority> y dos fuentes (mobile / desktop) para que el
// LCP no cargue 610 kB en un celular. El degradado inferior es el que sostiene
// la legibilidad del título y los botones sobre cualquier zona de la imagen.

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Compass, MapPin } from 'lucide-react'

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
    <section id="inicio" className="relative isolate min-h-[680px] w-full overflow-hidden bg-[#345544] md:min-h-[760px]">
      <picture>
        <source media="(max-width: 768px)" srcSet="/images/distrito-roldan/hero-aerea-mobile.webp" />
        <Image
          src="/images/distrito-roldan/hero-aerea.webp"
          alt="Vista aérea de Distrito Roldán, sobre Ruta 9 y María Auxiliadora"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </picture>

      <div className="absolute inset-0 bg-[#345544]/20" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,49,37,.88)_0%,rgba(20,49,37,.58)_42%,rgba(20,49,37,.08)_75%)] max-md:bg-[linear-gradient(0deg,rgba(20,49,37,.92)_0%,rgba(20,49,37,.56)_55%,rgba(20,49,37,.1)_100%)]" />

      <div className="absolute inset-x-0 top-0 z-10 border-b border-white/[0.15]">
        <div className="mx-auto flex h-24 max-w-[1240px] items-center justify-between px-6 pl-20 sm:pl-32 lg:px-8 lg:pl-36">
          {/* Logo oficial vectorial extraído del brandbook. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/distrito-roldan/brand/logo-distrito-roldan.svg"
            alt="Distrito Roldán, barrio abierto"
            className="h-auto w-[210px] brightness-0 invert sm:w-[250px]"
          />
          <nav aria-label="Secciones de Distrito Roldán" className="hidden items-center gap-7 lg:flex">
            <a href="#proyecto" className="text-sm font-medium text-white/[0.85] transition-colors hover:text-white">El proyecto</a>
            <a href="#barrio" className="text-sm font-medium text-white/[0.85] transition-colors hover:text-white">El barrio</a>
            <a href="#plano" className="text-sm font-medium text-white/[0.85] transition-colors hover:text-white">Masterplan</a>
            <a href="#avances" className="text-sm font-medium text-white/[0.85] transition-colors hover:text-white">Avances</a>
            <a href="#ubicacion" className="text-sm font-medium text-white/[0.85] transition-colors hover:text-white">Ubicación</a>
          </nav>
          <Link
            href={disponibilidadUrl}
            className="hidden min-h-11 items-center justify-center rounded-full bg-[#B35E21] px-5 text-sm font-bold text-white transition-colors hover:bg-[#9d4f18] sm:inline-flex"
          >
            Ver lotes y precios
          </Link>
        </div>
      </div>

      <div className="relative z-[1] mx-auto flex min-h-[680px] max-w-[1240px] items-end px-6 pb-14 pt-36 md:min-h-[760px] md:items-center md:pb-16 md:pt-32 lg:px-8">
        <div className="max-w-[660px]">
          <p className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#F8F1E6]">
            <MapPin className="h-4 w-4 text-[#BB8D3F]" aria-hidden />
            Ruta 9 y María Auxiliadora, Roldán
          </p>
          <h1 className="max-w-[12ch] text-balance text-[clamp(44px,6vw,84px)] font-extrabold leading-[0.98] tracking-[-0.035em] text-[#F8F1E6]">
            Un barrio abierto a vos
          </h1>
          <p className="mt-7 max-w-[55ch] text-pretty text-base leading-7 text-white/[0.88] md:text-lg md:leading-8">
            {bajada}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href={disponibilidadUrl}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#B35E21] px-7 text-[15px] font-bold text-white transition-colors hover:bg-[#9d4f18]"
            >
              Ver lotes y precios
              <ArrowRight className="h-[18px] w-[18px]" aria-hidden />
            </Link>
            <a
              href={tourUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/[0.45] bg-[#345544]/30 px-7 text-[15px] font-semibold text-white transition-colors hover:border-white hover:bg-[#345544]/[0.55]"
            >
              <Compass className="h-[18px] w-[18px]" aria-hidden />
              Recorrer en 360°
            </a>
          </div>
          <span className="sr-only">{titulo}</span>
        </div>
      </div>
    </section>
  )
}
