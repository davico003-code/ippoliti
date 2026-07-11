import Image from 'next/image'
import { MapPin, Star } from 'lucide-react'

const GREEN = '#1A5C38'
const INK = '#111827'

const STATS = [
  { num: '+1.500', label: 'Propiedades' },
  { num: '3', label: 'Oficinas' },
  { num: '20K+', label: 'Instagram' },
  { num: '98%', label: 'Recomendación' },
]

const SEDES = [
  {
    nombre: 'Oficina Histórica',
    subtitulo: 'Casa matriz · Roldán',
    badge: 'DESDE 1983',
    badgeRight: null,
    direccion: '1ro de Mayo 258, Roldán',
    foto: '/oficina-historica.webp',
  },
  {
    nombre: 'Oficina Ventas',
    subtitulo: 'Sede comercial · Roldán',
    badge: 'DESDE 2015',
    badgeRight: null,
    direccion: 'Catamarca 775, Roldán',
    foto: '/oficina-ruta9.webp',
  },
  {
    nombre: 'Oficina Funes',
    subtitulo: 'Inmobiliaria + Galería de Arte',
    badge: 'GALERÍA',
    badgeRight: 'NUEVO 2024',
    direccion: 'Hipólito Yrigoyen 2643, Funes',
    foto: '/oficina-funes.webp',
  },
]

export default function ConfianzaDesktop() {
  return (
    <section className="relative overflow-hidden bg-[#fbf8f2] font-raleway" style={{ color: INK }}>
      <div className="relative min-h-[520px] overflow-hidden border-b border-[#e9dfd2]">
        <div className="absolute inset-y-0 left-0 w-[54%] min-w-[620px]">
          <Image
            src="/familia-flores.webp"
            alt="Familia Flores - SI INMOBILIARIA desde 1983"
            fill
            sizes="54vw"
            className="object-cover object-center"
            style={{ objectPosition: 'center 18%' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#fbf8f2]/30 to-[#fbf8f2]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#fbf8f2] via-transparent to-transparent" />
        </div>

        <div className="relative mx-auto flex min-h-[520px] max-w-[1320px] items-center justify-end px-8 lg:px-12">
          <div className="w-full max-w-[570px] py-20">
            <p className="text-[12px] font-extrabold uppercase tracking-[0.28em]" style={{ color: GREEN }}>
              SI INMOBILIARIA · DESDE 1983
            </p>

            <div className="mt-9 text-[42px] font-black leading-none" style={{ color: GREEN }}>
              &ldquo;
            </div>

            <p className="mt-3 max-w-[560px] text-[30px] font-medium leading-[1.26] tracking-[-0.015em] text-[#132033]">
              Cada familia que entra por nuestra puerta sale con algo más que una propiedad.
              Sale con la tranquilidad de que alguien la cuidó.
            </p>

            <div className="mt-9 flex items-center gap-4">
              <div className="h-px w-12" style={{ backgroundColor: GREEN }} />
              <p className="text-[15px] font-semibold text-[#53606d]">
                <span style={{ color: GREEN }}>Susana Ippoliti</span> · Fundadora
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-[#e9dfd2] bg-[#fffdf9]/70">
        <div className="mx-auto grid max-w-[1320px] grid-cols-[minmax(320px,0.85fr)_1fr] items-center gap-12 px-8 py-10 lg:px-12">
          <div>
            <h2 className="text-[42px] font-extrabold leading-[1.05] tracking-[-0.025em] text-[#132033]">
              No vendemos casas.<br />
              <span className="italic" style={{ color: GREEN }}>Acompañamos historias.</span>
            </h2>
          </div>

          <div className="grid grid-cols-4 divide-x divide-[#ded6cc]">
            {STATS.map((s) => (
              <div key={s.label} className="px-7 text-center first:pl-0 last:pr-0">
                <p className="text-[30px] font-extrabold leading-none" style={{ color: GREEN, fontVariantNumeric: 'tabular-nums' }}>
                  {s.num}
                </p>
                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#68717c]">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1320px] grid-cols-[240px_1fr] gap-10 px-8 py-10 lg:px-12">
        <div className="pt-12">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.28em]" style={{ color: GREEN }}>
            Nuestras sedes
          </p>
          <h3 className="mt-3 text-[30px] font-extrabold leading-[1.08] tracking-[-0.02em] text-[#132033]">
            Tres lugares para encontrarnos.
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {SEDES.map(sede => (
            <article key={sede.nombre} className="group overflow-hidden rounded-lg border border-[#ded6cc] bg-white/80 shadow-[0_10px_35px_rgba(19,32,51,0.06)]">
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={sede.foto}
                  alt={`${sede.nombre} - ${sede.direccion}`}
                  fill
                  sizes="(min-width: 768px) 28vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

                <div className="absolute left-4 top-4 flex gap-2">
                  <span className="inline-flex items-center rounded-md bg-white/90 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em]" style={{ color: GREEN, fontVariantNumeric: 'tabular-nums' }}>
                    {sede.badge === 'GALERÍA' ? (
                      <><Star className="mr-1.5 h-3 w-3 fill-current" />GALERÍA</>
                    ) : sede.badge}
                  </span>

                  {sede.badgeRight && (
                    <span className="rounded-md px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white" style={{ backgroundColor: GREEN, fontVariantNumeric: 'tabular-nums' }}>
                      {sede.badgeRight}
                    </span>
                  )}
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-[22px] font-extrabold leading-tight tracking-[-0.01em]">{sede.nombre}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-3 text-[13px] font-medium text-[#68717c]">
                <MapPin className="h-4 w-4 shrink-0" style={{ color: GREEN }} />
                <span>{sede.direccion}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
