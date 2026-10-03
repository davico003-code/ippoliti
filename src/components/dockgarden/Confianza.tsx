// Secciones de confianza de Dock Garden, armadas con la presentación oficial de
// VERS (datos en lib/dockgarden.ts): quién lo construye y qué ya terminó en la
// Aldea, cómo es cada tipología, con qué está hecho y qué hay cerca. Se usan en
// el funnel de /emprendimientos/67173-… y en /dockgarden.

import Image from 'next/image'
import {
  Building2,
  Car,
  CheckCircle2,
  ExternalLink,
  Flag,
  GraduationCap,
  HeartPulse,
  MapPin,
  Plane,
  ShoppingBag,
  Trophy,
  type LucideIcon,
} from 'lucide-react'
import {
  CERCANIAS,
  MAPA_CERCANIAS,
  OFICINA_VENTAS,
  TERMINACIONES,
  TIPOLOGIAS,
  VERS_LOGO,
  VERS_OBRAS,
  mapsObra,
  type Cercania,
} from '@/lib/dockgarden'
import { conCifras } from '@/components/emprendimiento/conCifras'
import type { FunnelSecciones } from '@/components/emprendimiento/EmprendimientoFunnel'
import TipologiasDockGarden from './TipologiasDockGarden'
import Recorridos360 from './Recorridos360'

/** Mismo contenedor que el funnel; /dockgarden pasa el suyo (más angosto). */
export const CONTENEDOR_FUNNEL = 'mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-12'
const EYEBROW = 'text-[13px] font-bold uppercase tracking-[0.14em] text-[#1A5C38]'
const H2 = 'text-balance text-[clamp(28px,3.6vw,48px)] font-black leading-[1.05] tracking-[-0.02em] text-gray-900'

// ── Quién lo construye ────────────────────────────────────────────────────

export function SeccionVers({ contenedor = CONTENEDOR_FUNNEL }: { contenedor?: string }) {
  const desde = VERS_OBRAS[0].anio
  return (
    <section id="desarrollador" className="bg-[#0f2a1c] py-14 text-white md:py-20">
      <div className={contenedor}>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[760px]">
            <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-white/60">Quién lo construye</p>
            <h2 className="mt-3 text-balance text-[clamp(28px,3.6vw,48px)] font-black leading-[1.05] tracking-[-0.02em]">
              VERS Arquitectos ya terminó <span className="font-numeric">{VERS_OBRAS.length}</span> obras en Aldea Fisherton
            </h2>
            <p className="mt-5 text-pretty text-lg leading-relaxed text-white/80">
              Dock Garden lo diseña y lo construye el mismo estudio que trabaja en el barrio desde{' '}
              <span className="font-numeric">{desde}</span>. Estas son sus obras terminadas, con la dirección de cada una
              para que puedas pasar a verlas.
            </p>
          </div>
          <Image
            src={VERS_LOGO.src}
            alt="VERS Arquitectos"
            width={VERS_LOGO.width}
            height={VERS_LOGO.height}
            className="h-12 w-auto shrink-0 self-start sm:h-14 lg:self-end"
          />
        </div>

        <dl className="mt-10 grid grid-cols-3 gap-px overflow-hidden rounded-2xl bg-white/15">
          {[
            { valor: String(desde), label: 'En la Aldea desde' },
            { valor: String(VERS_OBRAS.length), label: 'Obras terminadas' },
            { valor: String(VERS_OBRAS[VERS_OBRAS.length - 1].anio), label: 'Última terminada' },
          ].map(s => (
            <div key={s.label} className="flex flex-col-reverse bg-[#0f2a1c] p-4 sm:p-6">
              <dt className="mt-1 text-xs leading-snug text-white/65 sm:text-sm">{s.label}</dt>
              <dd className="font-numeric text-2xl font-bold sm:text-4xl">{s.valor}</dd>
            </div>
          ))}
        </dl>

        {/* En celular, de a dos: las 6 a lo ancho eran un scroll interminable. */}
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {VERS_OBRAS.map(o => (
            <li key={o.nombre} className="overflow-hidden rounded-2xl bg-white/[0.06] ring-1 ring-white/10">
              <div className="relative aspect-[4/3]">
                <Image
                  src={o.foto}
                  alt={`${o.nombre}, obra terminada de VERS Arquitectos en ${o.direccion}`}
                  fill
                  sizes="(max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
                <span className="absolute left-2 top-2 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[#0f2a1c] sm:left-3 sm:top-3 sm:px-3">
                  <span className="hidden sm:inline">Terminada en </span>
                  <span className="font-numeric">{o.anio}</span>
                </span>
              </div>
              <div className="p-3.5 sm:p-5">
                <h3 className="text-[15px] font-bold leading-snug sm:text-lg">{o.nombre}</h3>
                <a
                  href={mapsObra(o.direccion)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-start gap-1.5 text-[13px] leading-snug text-white/75 sm:text-sm underline decoration-white/30 underline-offset-4 transition-colors hover:text-white"
                >
                  <MapPin className="mt-px h-4 w-4 shrink-0" aria-hidden />
                  <span>{conCifras(o.direccion)}</span>
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// ── Terminaciones ─────────────────────────────────────────────────────────

const MARCAS = ['Aluar A40', 'TST', 'Johnson Luxor', 'Ilva', 'Peirano', 'Ferrum Bari', 'Piazza', 'Vision', 'Faplac']
const RE_MARCAS = new RegExp(`(${MARCAS.join('|')})`, 'g')

/** Las marcas en negrita: son lo que el cliente reconoce de un vistazo. */
function conMarcas(texto: string) {
  return texto.split(RE_MARCAS).map((parte, i) =>
    i % 2 === 1 ? <strong key={i} className="font-bold text-gray-900">{parte}</strong> : <span key={i}>{conCifras(parte)}</span>,
  )
}

export function SeccionTerminaciones({ contenedor = CONTENEDOR_FUNNEL }: { contenedor?: string }) {
  return (
    <section id="terminaciones" className="bg-gray-50 py-14 md:py-20">
      <div className={contenedor}>
        <p className={EYEBROW}>Terminaciones</p>
        <h2 className={`${H2} mt-3`}>Con qué está hecho cada departamento</h2>
        <p className="mt-4 max-w-[65ch] text-pretty text-base leading-relaxed text-gray-600 md:text-[17px]">
          Todas las unidades llevan las mismas terminaciones, de marcas reconocidas. Esto es lo que recibís.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-10">
          <div className="relative min-h-[260px] overflow-hidden rounded-2xl sm:min-h-[340px]">
            <Image
              src="/images/dockgarden/interior-04.webp"
              alt="Interior de un departamento de Dock Garden (render)"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 sm:grid-cols-2">
            {TERMINACIONES.map(g => (
              <div key={g.titulo} className="bg-white p-5 md:p-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[#1A5C38]">{g.titulo}</h3>
                <ul className="mt-3 space-y-2">
                  {g.items.map(item => (
                    <li key={item} className="flex gap-2.5 text-[15px] leading-snug text-gray-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#1A5C38]" aria-hidden />
                      <span>{conMarcas(item)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Qué hay cerca ─────────────────────────────────────────────────────────

const ICONO: Record<Cercania['tipo'], LucideIcon> = {
  aeropuerto: Plane,
  shopping: ShoppingBag,
  salud: HeartPulse,
  colegio: GraduationCap,
  golf: Flag,
  hipico: Trophy,
  autodromo: Car,
}

export function SeccionCercanias({ contenedor = CONTENEDOR_FUNNEL }: { contenedor?: string }) {
  const maximo = Math.max(...CERCANIAS.map(c => c.minutos))
  const conFoto = CERCANIAS.filter(c => c.foto).sort((a, b) => a.minutos - b.minutos)
  return (
    <section id="cercanias" className="bg-white py-14 md:py-20">
      <div className={contenedor}>
        <p className={EYEBROW}>Qué hay cerca</p>
        <h2 className={`${H2} mt-3`}>
          Todo a <span className="font-numeric">{maximo}</span> minutos o menos
        </h2>
        <p className="mt-4 max-w-[65ch] text-pretty text-base leading-relaxed text-gray-600 md:text-[17px]">
          Colegios, golf, salud, shopping y aeropuerto: tiempos en auto desde Dock Garden. Cada número de la lista es el
          mismo punto en el mapa.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-12">
          <ol className="divide-y divide-gray-100 rounded-2xl border border-gray-200">
            {CERCANIAS.map(c => {
              const Icono = ICONO[c.tipo]
              return (
                <li key={c.n} className="flex items-center gap-4 px-4 py-3.5 sm:px-5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1f3a2d] font-numeric text-sm font-bold text-white">
                    {c.n}
                  </span>
                  <Icono className="hidden h-5 w-5 shrink-0 text-[#1A5C38] sm:block" aria-hidden />
                  <span className="min-w-0 flex-1 text-[15px] font-semibold leading-snug text-gray-900 sm:text-base">{c.nombre}</span>
                  <span className="shrink-0 text-right">
                    <span className="font-numeric text-xl font-bold text-gray-900">{c.minutos}</span>
                    <span className="ml-1 text-sm text-gray-500">min</span>
                  </span>
                </li>
              )
            })}
          </ol>
          <figure>
            <div className="overflow-hidden rounded-2xl border border-gray-200">
              <Image
                src={MAPA_CERCANIAS.src}
                alt="Mapa de Fisherton con Dock Garden y los 8 lugares de referencia numerados"
                width={MAPA_CERCANIAS.width}
                height={MAPA_CERCANIAS.height}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="h-auto w-full"
              />
            </div>
            <figcaption className="mt-2 text-sm text-gray-500">
              La foto circular marca dónde está Dock Garden, junto al Rosario Golf Club.
            </figcaption>
          </figure>
        </div>

        <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-5">
          {conFoto.map((c, i) => (
            <li key={c.n} className={`overflow-hidden rounded-2xl border border-gray-200 bg-white ${i === conFoto.length - 1 ? 'col-span-2 md:col-span-1' : ''}`}>
              <div className={`relative ${i === conFoto.length - 1 ? 'aspect-[2/1] md:aspect-[4/3]' : 'aspect-[4/3]'}`}>
                <Image src={c.foto!} alt={c.nombre} fill sizes="(max-width: 768px) 50vw, 20vw" className="object-cover" />
              </div>
              <div className="p-3.5">
                <p className="text-sm font-semibold leading-snug text-gray-900">{c.nombre}</p>
                <p className="mt-0.5 text-sm text-gray-500">
                  a <span className="font-numeric font-bold text-[#1A5C38]">{c.minutos}</span> min
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// ── Oficina de ventas ─────────────────────────────────────────────────────

export function OficinaVentas({ className = '' }: { className?: string }) {
  return (
    <a
      href={OFICINA_VENTAS.mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex items-start gap-3.5 rounded-2xl border border-gray-200 p-4 transition-colors hover:bg-gray-50 ${className}`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1A5C38]/10 text-[#1A5C38]">
        <Building2 className="h-5 w-5" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-bold uppercase tracking-[0.12em] text-gray-400">Oficina de ventas</span>
        <span className="mt-0.5 flex items-center gap-1.5 font-bold text-gray-900">
          <span>{conCifras(OFICINA_VENTAS.direccion)}</span>
          <ExternalLink className="h-3.5 w-3.5 text-gray-400 transition-colors group-hover:text-gray-600" aria-hidden />
        </span>
        <span className="mt-0.5 block text-sm text-gray-500">Te mostramos planos, terminaciones y precios en persona.</span>
      </span>
    </a>
  )
}

// ── Armado para el funnel ─────────────────────────────────────────────────

/** Las secciones de Dock Garden en los huecos del funnel genérico. */
export async function seccionesDockGarden(): Promise<FunnelSecciones> {
  return {
    trasProyecto: <SeccionVers />,
    antesDeUnidades: (
      <>
        <Recorridos360 contenedor={CONTENEDOR_FUNNEL} />
        <TipologiasDockGarden tipologias={TIPOLOGIAS} contenedor={CONTENEDOR_FUNNEL} hrefPrecios="#unidades" />
        <SeccionTerminaciones />
      </>
    ),
    antesDeUbicacion: <SeccionCercanias />,
    enContacto: <OficinaVentas className="mt-6 max-w-md" />,
  }
}
