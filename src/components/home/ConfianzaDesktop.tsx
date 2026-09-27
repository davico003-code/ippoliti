import Image from 'next/image'
import { Clock, MapPin, Star } from 'lucide-react'
import EncabezadoSeccion from './EncabezadoSeccion'
import SedesModernas from './SedesModernas'

const GREEN = '#1A5C38'

const STATS = [
  { num: '1983', label: 'Desde' },
  { num: '3', label: 'Oficinas' },
  { num: '2', label: 'Generaciones' },
  { num: '2', label: 'Ciudades con oficina' },
]

const SEDES = [
  {
    nombre: 'Oficina Histórica',
    subtitulo: 'Casa matriz · Roldán',
    badge: 'DESDE 1983',
    badgeRight: null,
    direccion: '1ro de Mayo 258, Roldán',
    horario: 'Horario vigente en Google',
    foto: '/oficina-historica.webp',
  },
  {
    nombre: 'Oficina Ventas',
    subtitulo: 'Sede comercial · Roldán',
    badge: 'DESDE 2015',
    badgeRight: null,
    direccion: 'Catamarca 775, Roldán',
    horario: 'Horario vigente en Google',
    foto: '/oficina-ruta9.webp',
  },
  {
    nombre: 'Oficina Funes',
    subtitulo: 'Inmobiliaria + Galería de Arte',
    badge: 'GALERÍA',
    badgeRight: 'NUEVO 2024',
    direccion: 'Hipólito Yrigoyen 2643, Funes',
    horario: 'Lun a Vie · 9 a 17hs · Sáb · 9 a 13hs',
    foto: '/oficina-funes.webp',
  },
]

export default function ConfianzaDesktop() {
  return (
    <>
      <section className="relative overflow-hidden bg-neutral-950">
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ minHeight: 600 }}>
          <div className="relative min-h-[600px] overflow-hidden">
            <Image
              src="/familia-flores.webp"
              alt="Familia Flores - SI INMOBILIARIA desde 1983"
              fill
              sizes="(min-width: 1024px) 50vw, (min-width: 768px) 100vw, 1px"
              quality={72}
              className="object-cover"
              style={{ objectPosition: 'center 18%' }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-black/15 to-neutral-950/95" />
            <div className="absolute inset-y-0 right-[-72px] w-48 bg-neutral-950 blur-3xl" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-neutral-950/70 to-transparent" />
          </div>

          <div className="relative flex flex-col justify-center overflow-hidden px-10 py-16 text-white lg:px-16 lg:py-20">
            <div className="absolute left-[-90px] top-1/2 h-[320px] w-[320px] -translate-y-1/2 rounded-full bg-black/70 blur-3xl" />
            <div className="relative">
              <p className="font-raleway text-[12px] font-bold uppercase tracking-[0.25em] text-white/80">
                SI INMOBILIARIA · EST. 1983
              </p>

              <div className="mt-10 font-playfair text-[120px] leading-[0.55] text-white/18">&ldquo;</div>

              <p className="font-lora mt-1 max-w-[520px] text-[27px] font-medium italic leading-[1.36] text-white">
                Cada familia que entra por nuestra puerta sale con algo más que una propiedad.
                Sale con la tranquilidad de que alguien la cuidó.
              </p>

              <div className="mt-9 flex items-center gap-3">
                <div className="h-px w-10 bg-white/40" />
                <p className="font-raleway text-[12px] font-semibold uppercase tracking-[0.2em] text-white/80">
                  Susana Ippoliti · Fundadora
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Opción de oficinas elegida en el preview (ver OpcionesPreview). */}
      <div className="sedes-op sedes-op-0">
      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-[1200px] grid-cols-[minmax(0,1fr)_minmax(390px,0.72fr)] items-center gap-14 px-6">
          <div className="text-left">
            <EncabezadoSeccion
              eyebrow="Dos generaciones"
              titulo={<>No vendemos casas.<br /><span style={{ color: GREEN }}>Acompañamos historias.</span></>}
              bajada="Empezamos en 1983 cuando Susana abrió la primera oficina en Roldán. Hoy somos un equipo en tres sedes, pero seguimos pensándonos como un estudio: pocos clientes a la vez, mucha cabeza puesta en cada uno."
            />
          </div>

          <div className="revela rounded-2xl border border-gray-200 bg-gray-50/80 p-5 shadow-[0_18px_45px_rgba(17,24,39,0.06)]">
            <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-gray-200 bg-white">
              {STATS.map((s, i) => (
                <div
                  key={s.label}
                  className={[
                    'px-6 py-5 text-left',
                    i % 2 === 0 ? 'border-r border-gray-200' : '',
                    i < 2 ? 'border-b border-gray-200' : '',
                  ].join(' ')}
                >
                  <p className="font-poppins text-[34px] font-bold leading-none" style={{ color: GREEN, fontVariantNumeric: 'tabular-nums' }}>
                    {s.num}
                  </p>
                  <p className="font-raleway mt-3 text-[10.5px] font-bold uppercase tracking-[0.16em] text-gray-500">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white pb-24">
        <div className="mx-auto max-w-[1200px] px-6">
          <EncabezadoSeccion eyebrow="Nuestras sedes" titulo="Tres lugares para encontrarnos." nivel="h3" className="mb-8" />

          <div className="revela grid grid-cols-1 gap-6 md:grid-cols-3">
            {SEDES.map(sede => (
              <div key={sede.nombre} className="group overflow-hidden rounded-2xl border border-gray-200">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={sede.foto}
                    alt={`${sede.nombre} - ${sede.direccion}`}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                  <span className="font-poppins absolute left-4 top-4 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-[11px] font-bold tracking-wider text-white backdrop-blur-md" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {sede.badge === 'GALERÍA' ? (
                      <><Star className="-mt-0.5 mr-1 inline h-3 w-3 fill-current" />GALERÍA</>
                    ) : sede.badge}
                  </span>

                  {sede.badgeRight && (
                    <span className="font-poppins absolute right-4 top-4 rounded-full px-3 py-1.5 text-[11px] font-bold tracking-wider text-white" style={{ background: GREEN, fontVariantNumeric: 'tabular-nums' }}>
                      {sede.badgeRight}
                    </span>
                  )}

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="font-raleway text-[22px] font-extrabold leading-tight">{sede.nombre}</p>
                    <p className="font-raleway mt-0.5 text-[12px] font-medium opacity-90">{sede.subtitulo}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-5">
                  <p className="font-raleway flex items-start gap-2 text-[13px] text-gray-700">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: GREEN }} />
                    <span>{sede.direccion}</span>
                  </p>
                  <p className="font-raleway mt-2 flex items-center gap-2 text-[12px] text-gray-500">
                    <Clock className="h-3 w-3 shrink-0" />
                    {sede.horario}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      </div>
      <div className="sedes-op sedes-op-1"><SedesModernas variante="linea" /></div>
      <div className="sedes-op sedes-op-2"><SedesModernas variante="tarjetas" /></div>
    </>
  )
}
