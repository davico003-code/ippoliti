import Image from 'next/image'
import { MapPin, Clock, Star } from 'lucide-react'

const GREEN = '#1A5C38'

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
    horario: 'Lun a Vie · 9 a 17hs',
    foto: '/oficina-historica.webp',
  },
  {
    nombre: 'Oficina Ventas',
    subtitulo: 'Sede comercial · Roldán',
    badge: 'DESDE 2015',
    badgeRight: null,
    direccion: 'Catamarca 775, Roldán',
    horario: 'Lun a Vie · 9 a 17hs',
    foto: '/oficina-ruta9.webp',
  },
  {
    nombre: 'Oficina Funes',
    subtitulo: 'Inmobiliaria + Galería de Arte',
    badge: 'GALERÍA',
    badgeRight: 'NUEVO 2024',
    direccion: 'Hipólito Yrigoyen 2643, Funes',
    horario: 'Lun a Vie · 9 a 17hs',
    foto: '/oficina-funes.webp',
  },
]

export default function ConfianzaDesktop() {
  return (
    <>
      {/* 2.1 Hero editorial con foto familia — 2 columnas */}
      <section className="relative bg-brand-600 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ minHeight: 600 }}>
          {/* Foto izquierda */}
          <div className="relative">
            <Image
              src="/familia-flores.webp"
              alt="Familia Flores — SI Inmobiliaria desde 1983"
              width={900}
              height={1125}
              priority
              className="w-full h-full object-cover"
              style={{ minHeight: 600 }}
            />
          </div>

          {/* Texto derecha */}
          <div className="relative flex flex-col justify-center px-10 lg:px-16 py-16 lg:py-20 text-white">
            <p className="font-poppins text-white/80 text-[12px] font-bold tracking-[0.25em] uppercase">
              SI Inmobiliaria · Est. 1983
            </p>

            <div className="mt-4">
              <span className="bg-white/15 backdrop-blur-md border border-white/30 px-3 py-1.5 rounded-full font-poppins text-white text-[11px] font-bold tracking-wider" style={{ fontVariantNumeric: 'tabular-nums' }}>
                43 AÑOS
              </span>
            </div>

            <div className="font-playfair text-white/20 text-[120px] leading-[0.6] mt-8">&ldquo;</div>

            <p className="font-lora text-white text-[26px] leading-[1.35] italic font-medium max-w-[520px]">
              Cada familia que entra por nuestra puerta sale con algo más que una propiedad. Sale con la tranquilidad de que alguien la cuidó.
            </p>

            <div className="mt-8 flex items-center gap-3">
              <div className="w-10 h-px bg-white/40" />
              <p className="font-poppins text-white/80 text-[12px] font-semibold tracking-[0.2em] uppercase">
                Susana Ippoliti · Fundadora
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2.2 Bloque introductorio */}
      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-8 text-center">
          <p className="font-poppins text-[12px] font-bold tracking-[0.2em] uppercase" style={{ color: GREEN }}>
            Dos generaciones
          </p>
          <h2 className="font-raleway font-black text-[48px] leading-[1.1] mt-3 text-gray-900">
            No vendemos casas.<br />
            <span className="italic" style={{ color: GREEN }}>Acompañamos historias.</span>
          </h2>
          <p className="font-poppins text-gray-600 text-[17px] mt-6 leading-relaxed max-w-[640px] mx-auto">
            Empezamos en 1983 cuando Susana abrió la primera oficina en Roldán. Hoy somos un equipo en tres sedes, pero seguimos pensándonos como un estudio: pocos clientes a la vez, mucha cabeza puesta en cada uno.
          </p>
        </div>
      </section>

      {/* 2.3 Stats */}
      <section className="bg-white pb-16">
        <div className="max-w-4xl mx-auto px-8">
          <div className="flex items-center justify-center gap-8 lg:gap-12 text-center">
            {STATS.map((s, i) => (
              <div key={s.label} className="flex items-center gap-8 lg:gap-12">
                {i > 0 && <div className="w-px h-14 bg-gray-200" />}
                <div>
                  <p className="font-poppins font-bold text-[38px] leading-none" style={{ color: GREEN, fontVariantNumeric: 'tabular-nums' }}>{s.num}</p>
                  <p className="font-poppins text-gray-500 text-[11px] font-semibold tracking-[0.15em] uppercase mt-3">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2.4 Las 3 sedes */}
      <section className="bg-white pb-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-10">
            <p className="font-poppins text-[12px] font-bold tracking-[0.2em] uppercase" style={{ color: GREEN }}>
              Nuestras sedes
            </p>
            <h3 className="font-raleway font-black text-[36px] leading-tight mt-2 text-gray-900">
              Tres lugares para encontrarnos.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SEDES.map(sede => (
              <div key={sede.nombre} className="rounded-2xl overflow-hidden border border-gray-200 group">
                <div className="relative aspect-[4/3] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sede.foto}
                    alt={sede.nombre}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                  <span className="absolute top-4 left-4 bg-white/15 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full tracking-wider font-poppins border border-white/20" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {sede.badge === 'GALERÍA' ? (
                      <><Star className="w-3 h-3 inline mr-1 -mt-0.5 fill-current" />GALERÍA</>
                    ) : sede.badge}
                  </span>

                  {sede.badgeRight && (
                    <span className="absolute top-4 right-4 text-white text-[11px] font-bold px-3 py-1.5 rounded-full tracking-wider font-poppins" style={{ background: GREEN, fontVariantNumeric: 'tabular-nums' }}>
                      {sede.badgeRight}
                    </span>
                  )}

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="font-raleway font-black text-[22px] leading-tight">{sede.nombre}</p>
                    <p className="font-poppins text-[12px] opacity-90 font-medium mt-0.5">{sede.subtitulo}</p>
                  </div>
                </div>
                <div className="p-5 bg-gray-50">
                  <p className="font-poppins text-gray-700 text-[13px] flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: GREEN }} />
                    <span>{sede.direccion}</span>
                  </p>
                  <p className="font-poppins text-gray-500 text-[12px] mt-2 flex items-center gap-2">
                    <Clock className="w-3 h-3 shrink-0" />
                    {sede.horario}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </>
  )
}
