// Hero de Distrito Roldán: la obra real desde el drone, al atardecer, a
// pantalla completa, con lo que una visita quiere saber en los primeros
// segundos (cómo se paga, si hay expensas, qué servicios tiene, cuándo
// termina) y los dos accesos: el plano con precios y el tour 360°.
//
// 22-oct-2026: la foto es la aérea de septiembre (obra-5) re-iluminada al
// atardecer; en el celular va la misma toma en vertical. Va con <Image
// priority> y dos fuentes para que el LCP del celular no baje la de la compu.
// La foto se acerca muy lento (dr-acercar, globals.css) salvo con movimiento
// reducido.

import Image from '@/components/Imagen'
import Link from 'next/link'
import { ArrowRight, Check, ChevronDown, Compass, MapPin } from 'lucide-react'

interface Props {
  /** Tour 360° externo. */
  tourUrl: string
  /** Pantalla de disponibilidad y precios (link interno). */
  disponibilidadUrl: string
  titulo: string
  bajada: string
}

// Cuatro datos confirmados por David (11-oct-2026). Sin precios "desde".
const DATOS = ['30\u00a0% + 24 cuotas fijas en USD', 'Sin expensas', 'Luz, agua, gas y pavimento', 'Obras terminadas en agosto 2027']

const NAV = [
  { href: '#proyecto', label: 'La cuenta' },
  { href: '#avances', label: 'La obra' },
  { href: '#barrio', label: 'El barrio' },
  { href: '#plano', label: 'Masterplan' },
  { href: '#ubicacion', label: 'Ubicación' },
]

export default function HeroAerea({ tourUrl, disponibilidadUrl, titulo, bajada }: Props) {
  return (
    <section
      id="inicio"
      data-sin-fab
      className="relative isolate flex w-full flex-col overflow-hidden bg-[#143125] [min-height:max(100svh,660px)]"
    >
      <div className="dr-acercar absolute inset-0">
        <picture className="absolute inset-0">
          <source media="(max-width: 767px)" srcSet="/images/distrito-roldan/portada-atardecer-celu.webp" />
          <Image
            src="/images/distrito-roldan/portada-atardecer.webp"
            alt="Distrito Roldán desde el drone al atardecer: el trazado de las calles en obra, sobre Ruta 9 y María Auxiliadora"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[50%_60%]"
          />
        </picture>
      </div>

      {/* Arriba, para el logo y el menú; abajo, para el título y los datos. */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#143125]/70 to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(20,49,37,.96)_0%,rgba(20,49,37,.72)_34%,rgba(20,49,37,.12)_68%,rgba(20,49,37,0)_100%)] md:bg-[linear-gradient(0deg,rgba(20,49,37,.94)_0%,rgba(20,49,37,.55)_38%,rgba(20,49,37,0)_70%)]" />

      <div className="relative z-10 border-b border-white/[0.15]">
        <div className="mx-auto flex h-24 max-w-[1320px] items-center justify-between px-6 pl-20 sm:pl-32 lg:px-8 lg:pl-36">
          {/* Logo oficial vectorial extraído del brandbook. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/distrito-roldan/brand/logo-distrito-roldan.svg"
            alt="Distrito Roldán, barrio abierto"
            className="h-auto w-[190px] brightness-0 invert sm:w-[240px]"
          />
          <nav aria-label="Secciones de Distrito Roldán" className="hidden items-center gap-7 lg:flex">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="text-sm font-medium text-white/[0.85] transition-colors hover:text-white">
                {n.label}
              </a>
            ))}
          </nav>
          <Link
            href={disponibilidadUrl}
            className="hidden min-h-11 items-center justify-center rounded-full bg-[#B35E21] px-5 text-sm font-bold text-white transition-colors hover:bg-[#9d4f18] sm:inline-flex"
          >
            Ver lotes y precios
          </Link>
        </div>
      </div>

      <div className="relative z-[1] mx-auto flex w-full max-w-[1320px] flex-1 items-end px-6 pb-16 pt-10 md:pb-16 lg:px-8">
        <div className="w-full">
          <p className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#F8F1E6]">
            <MapPin className="h-4 w-4 text-[#BB8D3F]" aria-hidden />
            Barrio abierto · Ruta 9 y María Auxiliadora, Roldán
          </p>
          {/* El nombre va dentro del H1 (oculto a la vista) para que el título
              principal de la página diga qué es. */}
          <h1 className="max-w-[14ch] text-balance text-[clamp(42px,6vw,84px)] font-extrabold leading-[0.95] tracking-[-0.04em] text-[#F8F1E6]">
            <span className="sr-only">{titulo}: </span>
            Tu lote en Roldán, en cuotas fijas en dólares.
          </h1>
          <p className="mt-5 max-w-[52ch] text-pretty text-base leading-7 text-white/[0.88] md:text-xl md:leading-8">{bajada}</p>

          <ul className="mt-7 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2.5" aria-label="Lo esencial">
            {DATOS.map((d) => (
              <li
                key={d}
                className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-[13px] font-semibold leading-tight text-white backdrop-blur-md sm:rounded-full sm:px-4 sm:text-sm"
              >
                <Check className="h-4 w-4 shrink-0 text-[#E2B872]" strokeWidth={2.5} aria-hidden />
                {d}
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={disponibilidadUrl}
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-[#B35E21] px-8 text-base font-bold text-white shadow-[0_10px_30px_rgba(179,94,33,.45)] transition-colors hover:bg-[#9d4f18]"
            >
              Ver lotes y precios
              <ArrowRight className="h-[18px] w-[18px]" aria-hidden />
            </Link>
            <a
              href={tourUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border border-white/[0.45] bg-white/10 px-7 text-[15px] font-semibold text-white backdrop-blur-md transition-colors hover:border-white hover:bg-white/20"
            >
              <Compass className="h-[18px] w-[18px]" aria-hidden />
              Recorrer en 360°
            </a>
          </div>

          {/* Quién lo hace: desarrolladora y constructora, con sus logos en blanco. */}
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-white/[0.18] pt-5">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-white/[0.75]">Un desarrollo de</span>
              <Image
                src="/images/distrito-roldan/brand/logo-transatlantica-blanco.webp"
                alt="Grupo Transatlántica"
                width={640}
                height={162}
                className="h-10 w-auto sm:h-12"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-white/[0.75]">Construye</span>
              <Image
                src="/images/distrito-roldan/brand/logo-edeca-blanco.webp"
                alt="EDECA"
                width={480}
                height={80}
                className="h-[18px] w-auto sm:h-5"
              />
            </div>
          </div>
        </div>
      </div>

      <a
        href="#proyecto"
        aria-label="Bajar a la cuenta del lote"
        className="absolute bottom-5 left-1/2 z-10 hidden h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border border-white/30 text-white/80 transition-colors hover:border-white hover:text-white md:flex"
      >
        <ChevronDown className="h-5 w-5 motion-safe:animate-bounce" aria-hidden />
      </a>
    </section>
  )
}
