import Image from '@/components/Imagen'
import { MapPin, Clock } from 'lucide-react'
import EncabezadoSeccion from './EncabezadoSeccion'
import TextoConNumeros from './TextoConNumeros'

const GREEN = '#1A5C38'
const RALEWAY = "var(--font-raleway, 'Raleway'), system-ui, sans-serif"
const FUNDACION = 1983

// horario: solo el real. Las dos sedes de Roldán decían "Horario vigente en
// Google" (un placeholder que le dice al cliente "andá a buscarlo a otro
// lado"): sin el dato, la línea no se muestra. badgeRight: el "NUEVO 2024" de
// Funes se fue (en 2026 ya no es nuevo y restaba credibilidad).
const SEDES: {
  nombre: string
  subtitulo: string
  badge: string
  badgeRight: string | null
  direccion: string
  horario: string | null
  foto: string
}[] = [
  {
    nombre: 'Oficina Histórica',
    subtitulo: 'Casa matriz · Roldán',
    badge: 'DESDE 1983',
    badgeRight: null,
    direccion: '1ro de Mayo 258, Roldán',
    horario: null,
    foto: '/images/sedes/historica.webp',
  },
  {
    nombre: 'Oficina Ventas',
    subtitulo: 'Sede comercial · Roldán',
    badge: 'DESDE 2015',
    badgeRight: null,
    direccion: 'Catamarca 775, Roldán',
    horario: null,
    foto: '/images/sedes/ventas.webp',
  },
  {
    nombre: 'Oficina Funes',
    subtitulo: 'Inmobiliaria + Galería de Arte',
    badge: 'GALERÍA',
    badgeRight: null,
    direccion: 'Hipólito Yrigoyen 2643, Funes',
    horario: 'Lun a Vie · 9 a 17hs · Sáb · 9 a 13hs',
    foto: '/images/sedes/funes.webp',
  },
]

export default function ConfianzaSection() {
  // Se calcula (antes "43 AÑOS" fijo): la home es ISR de 6 h, se actualiza sola.
  const anios = new Date().getFullYear() - FUNDACION
  return (
    <>
      {/* 1. Hero editorial con foto full-bleed + quote */}
      <section className="relative bg-gray-900 overflow-hidden">
        <div className="relative" style={{ aspectRatio: '4/5' }}>
          <Image
            src="/familia-flores.webp"
            alt="Familia Flores — SI INMOBILIARIA desde 1983"
            width={900}
            height={1125}
            sizes="(max-width: 767px) 100vw, 1px"
            quality={72}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 0%, transparent 35%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.92) 100%)' }} />

          {/* Año arriba */}
          <div className="absolute top-6 left-5 right-5 flex items-start justify-between">
            <div>
              {/* 12 px como piso: a 10 px en mayúscula sobre foto no se leía. */}
              <p className="font-raleway text-white/75 text-[12px] font-bold tracking-[0.2em] uppercase">SI INMOBILIARIA</p>
              <p className="font-raleway text-white/60 text-[12px] font-medium tracking-[0.12em] mt-0.5">
                EST. <span className="font-numeric">{FUNDACION}</span>
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full">
              <p className="font-raleway text-white text-[12px] font-bold tracking-wider">
                <span className="font-numeric">{anios}</span> AÑOS
              </p>
            </div>
          </div>

          {/* Quote editorial. En Raleway: font-lora/font-playfair no cargan
              ninguna fuente (son Georgia/Times del sistema), así que la frase
              más emocional de la home salía distinta en cada teléfono y con
              una tercera voz tipográfica. Derecha y no itálica: Raleway se
              carga sin itálica y el navegador la inclinaría a la fuerza. */}
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-8">
            <div className="text-white/30 text-[80px] leading-[0.6] mb-2" style={{ fontFamily: RALEWAY, fontWeight: 800 }} aria-hidden="true">&ldquo;</div>
            <p className="text-white text-[20px] leading-[1.35] tracking-[-0.01em]" style={{ fontFamily: RALEWAY, fontWeight: 600 }}>
              Cada familia que entra por nuestra puerta sale con algo más que una propiedad. Sale con la tranquilidad de que alguien la cuidó.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <div className="w-8 h-px bg-white/40" />
              <p className="font-raleway text-white/80 text-[12px] font-semibold tracking-[0.12em] uppercase">
                Susana Ippoliti · Fundadora
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Bloque introductorio */}
      <section className="px-5 pt-10 pb-7 bg-white">
        <EncabezadoSeccion
          titulo={<>No vendemos casas.<br /><span style={{ color: 'var(--theme-accent, #1A5C38)' }}>Acompañamos historias.</span></>}
          bajada="Empezamos en 1983 cuando Susana abrió la primera oficina en Roldán. Hoy somos un equipo en tres sedes, pero seguimos pensándonos como un estudio: pocos clientes a la vez, mucha cabeza puesta en cada uno."
        />
      </section>

      {/* (Acá iba una fila de cifras: 1983 · 3 Oficinas · 2 Generaciones · 2
          Ciudades con oficina. Se fue: repetía lo que ya dicen la bajada de
          arriba y la cita, "2 ciudades" repetía "3 oficinas", y es el
          hero-metric de plantilla que PRODUCT.md descarta.) */}

      {/* 3. Las 3 oficinas */}
      <section className="px-5 pt-4 pb-7 bg-white">
        <EncabezadoSeccion titulo="Tres lugares para encontrarnos." nivel="h3" />

        <div className="mt-5 -mx-5 px-5 scroll-pl-5 flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2" style={{ scrollbarWidth: 'none' }}>
          {SEDES.map(sede => (
            <div key={sede.nombre} className="min-w-[88%] snap-start rounded-2xl overflow-hidden border border-gray-200">
              <div className="relative" style={{ aspectRatio: '4/3' }}>
                <Image src={sede.foto} alt={`${sede.nombre} — ${sede.direccion}`} fill className="object-cover" sizes="88vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <span className="absolute top-3 left-3 bg-white/15 backdrop-blur-md text-white text-[12px] font-bold px-2.5 py-1 rounded-full tracking-wider font-raleway border border-white/20">
                  <TextoConNumeros texto={sede.badge} />
                </span>
                {sede.badgeRight && (
                  <span className="absolute top-3 right-3 text-white text-[12px] font-bold px-2.5 py-1 rounded-full tracking-wider font-raleway" style={{ background: GREEN }}>
                    <TextoConNumeros texto={sede.badgeRight} />
                  </span>
                )}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="font-raleway font-black text-[21px] leading-tight">{sede.nombre}</p>
                  <p className="font-raleway text-[12px] opacity-90 font-medium mt-0.5">{sede.subtitulo}</p>
                </div>
              </div>
              <div className="p-3.5 bg-gray-50">
                <p className="font-raleway text-gray-700 text-[12px] flex items-start gap-1.5">
                  <MapPin className="w-3 h-3 mt-0.5 shrink-0" style={{ color: 'var(--theme-accent, #1A5C38)' }} aria-hidden="true" />
                  <span><TextoConNumeros texto={sede.direccion} /></span>
                </p>
                {sede.horario && (
                  <p className="font-raleway text-gray-500 text-[12px] mt-1.5 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 shrink-0" aria-hidden="true" />
                    <span><TextoConNumeros texto={sede.horario} /></span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

    </>
  )
}
