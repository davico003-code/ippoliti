import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Clock } from 'lucide-react'

const GREEN = '#1A5C38'

const SEDES = [
  {
    nombre: 'Oficina Histórica',
    subtitulo: 'Casa matriz · Roldán',
    badge: 'DESDE 1983',
    badgeRight: null,
    direccion: '1ro de Mayo 258, Roldán',
    horario: 'Lun a Vie · 9 a 17hs',
    // TODO: reemplazar por foto real en /public/oficinas/roldan-historica.jpg
    foto: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
  },
  {
    nombre: 'Oficina Ventas',
    subtitulo: 'Sede comercial · Roldán',
    badge: 'DESDE 2015',
    badgeRight: null,
    direccion: 'Catamarca 775, Roldán',
    horario: 'Lun a Vie · 9 a 17hs',
    // TODO: reemplazar por foto real en /public/oficinas/roldan-ventas.jpg
    foto: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&q=80',
  },
  {
    nombre: 'Oficina Funes',
    subtitulo: 'Inmobiliaria + Galería de Arte',
    badge: 'GALERÍA',
    badgeRight: 'NUEVO 2024',
    direccion: 'Hipólito Yrigoyen 2643, Funes',
    horario: 'Lun a Vie · 9 a 17hs',
    // TODO: reemplazar por foto real en /public/oficinas/funes.jpg
    foto: 'https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?w=600&q=80',
  },
]

const STATS = [
  { num: '+1.500', label: 'Propiedades' },
  { num: '3', label: 'Oficinas' },
  { num: '20K+', label: 'Instagram' },
  { num: '98%', label: 'Recomendación' },
]

export default function ConfianzaSection() {
  return (
    <>
      {/* 1. Hero editorial con foto full-bleed + quote */}
      <section className="relative bg-gray-900 overflow-hidden">
        <div className="relative" style={{ aspectRatio: '4/5' }}>
          {/* TODO: reemplazar por foto real en /public/nosotros/familia-flores.jpg */}
          <Image
            src="https://images.unsplash.com/photo-1511895426328-dc8714191300?w=900&q=80"
            alt="Familia Flores — SI Inmobiliaria desde 1983"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 0%, transparent 35%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.92) 100%)' }} />

          {/* Año arriba */}
          <div className="absolute top-6 left-5 right-5 flex items-start justify-between">
            <div>
              <p className="font-poppins text-white/70 text-[10px] font-bold tracking-[0.25em] uppercase">SI Inmobiliaria</p>
              <p className="font-poppins text-white/50 text-[10px] font-medium tracking-[0.15em] mt-0.5" style={{ fontVariantNumeric: 'tabular-nums' }}>EST. 1983</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full">
              <p className="font-poppins text-white text-[10px] font-bold tracking-wider" style={{ fontVariantNumeric: 'tabular-nums' }}>43 AÑOS</p>
            </div>
          </div>

          {/* Quote editorial */}
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-8">
            <div className="font-playfair text-white/30 text-[80px] leading-[0.6] mb-2">&ldquo;</div>
            <p className="font-lora text-white text-[19px] leading-[1.3] italic font-medium">
              Cada familia que entra por nuestra puerta sale con algo más que una propiedad. Sale con la tranquilidad de que alguien la cuidó.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <div className="w-8 h-px bg-white/40" />
              <p className="font-poppins text-white/80 text-[11px] font-semibold tracking-[0.15em] uppercase">
                Susana Ippoliti · Fundadora
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Bloque introductorio */}
      <section className="px-5 pt-9 pb-7 bg-white">
        <p className="font-poppins text-[12px] font-bold tracking-[0.15em] uppercase" style={{ color: GREEN }}>
          Dos generaciones
        </p>
        <h2 className="font-raleway font-black text-[28px] leading-[1.05] mt-2 text-gray-900">
          No vendemos casas.<br />
          <span className="italic" style={{ color: GREEN }}>Acompañamos historias.</span>
        </h2>
        <p className="font-poppins text-gray-600 text-[14px] mt-4 leading-relaxed">
          Empezamos en 1983 cuando Susana abrió la primera oficina en Roldán. Hoy somos un equipo en tres sedes, pero seguimos pensándonos como un estudio: pocos clientes a la vez, mucha cabeza puesta en cada uno.
        </p>
      </section>

      {/* 3. Stats */}
      <section className="px-5 py-7 bg-white">
        <div className="flex items-center justify-center gap-4 text-center">
          {STATS.map((s, i) => (
            <div key={s.label} className="flex items-center gap-4">
              {i > 0 && <div className="w-px h-9 bg-gray-200" />}
              <div>
                <p className="font-poppins font-bold text-[19px] leading-none" style={{ color: GREEN, fontVariantNumeric: 'tabular-nums' }}>{s.num}</p>
                <p className="font-poppins text-gray-500 text-[9px] font-semibold tracking-[0.1em] uppercase mt-1.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Las 3 oficinas */}
      <section className="px-5 pt-4 pb-7 bg-white">
        <p className="font-poppins text-[12px] font-bold tracking-[0.15em] uppercase" style={{ color: GREEN }}>
          Nuestras sedes
        </p>
        <h3 className="font-raleway font-black text-[22px] leading-tight mt-1 text-gray-900">
          Tres puertas. Mismo estudio.
        </h3>

        <div className="mt-5 -mx-5 px-5 flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2" style={{ scrollbarWidth: 'none' }}>
          {SEDES.map(sede => (
            <div key={sede.nombre} className="min-w-[78%] snap-start rounded-2xl overflow-hidden border border-gray-200">
              <div className="relative" style={{ aspectRatio: '4/3' }}>
                <Image src={sede.foto} alt={`${sede.nombre} — ${sede.direccion}`} fill className="object-cover" sizes="78vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <span className="absolute top-3 left-3 bg-white/15 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider font-poppins border border-white/20" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {sede.badge}
                </span>
                {sede.badgeRight && (
                  <span className="absolute top-3 right-3 text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider font-poppins" style={{ background: GREEN, fontVariantNumeric: 'tabular-nums' }}>
                    {sede.badgeRight}
                  </span>
                )}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="font-raleway font-black text-[18px] leading-tight">{sede.nombre}</p>
                  <p className="font-poppins text-[11px] opacity-90 font-medium mt-0.5">{sede.subtitulo}</p>
                </div>
              </div>
              <div className="p-3.5 bg-gray-50">
                <p className="font-poppins text-gray-700 text-[12px] flex items-start gap-1.5">
                  <MapPin className="w-3 h-3 mt-0.5 shrink-0" style={{ color: GREEN }} />
                  <span>{sede.direccion}</span>
                </p>
                <p className="font-poppins text-gray-500 text-[11px] mt-1.5 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 shrink-0" />
                  {sede.horario}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CTA final */}
      <section className="px-5 pt-2 pb-10 bg-white">
        <Link href="/nosotros" className="block bg-gray-900 text-white rounded-2xl p-5 hover:bg-gray-800 transition" style={{ textDecoration: 'none' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-poppins text-white/60 text-[10px] font-bold tracking-[0.15em] uppercase">
                Conocé el equipo
              </p>
              <p className="font-raleway font-black text-[18px] mt-1 leading-tight">
                La historia completa<br />de SI Inmobiliaria
              </p>
            </div>
            <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 ml-3" style={{ background: GREEN }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </div>
        </Link>
      </section>
    </>
  )
}
