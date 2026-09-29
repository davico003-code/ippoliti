// /como-trabajamos — producción: fotografía, drone, equipo técnico,
// videotours de YouTube y reels verticales. Todo material real.

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Clapperboard, Drone, Glasses, Laptop, Mic, Smartphone, Video } from 'lucide-react'
import VisorYoutube, { BotonPlay, PosterYoutube } from './VisorYoutube'
import { ShortYoutube, VideoVivo } from './Medios'
import { AEREAS, CANAL_YOUTUBE, EQUIPOS, FOTOS, SHORTS, VIDEOTOURS } from './datos'
import { BORDE, Chip, Contenedor, Encabezado, FONDO, GRIS, LinkFlecha, MENTA, TEXTO, TINTA, VERDE, VERDE_OSCURO, conNumeros } from './ui'

const ICONOS = { drone: Drone, video: Video, celular: Smartphone, mic: Mic, laptop: Laptop, lentes: Glasses }

export function Fotografia() {
  return (
    <section className="py-16 md:py-24" style={{ background: FONDO }} aria-labelledby="fotos-titulo">
      <Contenedor>
        <Encabezado
          id="fotos-titulo"
          eyebrow="Fotografía profesional"
          titulo="Fotos que hacen parar el scroll."
          bajada="Cada propiedad que tomamos se fotografía con equipo profesional, buena luz y edición. Estas son fotos reales de propiedades que publicamos: tocá cualquiera para ver su ficha."
        />

        <ul className="m-0 mt-10 grid list-none grid-cols-2 gap-2.5 p-0 md:grid-cols-4 md:gap-3.5" style={{ gridAutoFlow: 'dense' }}>
          {FOTOS.map((f, i) => (
            <li key={f.src} className={`ct-rev ${f.ancho ? 'col-span-2' : ''}`}>
              <Link
                href={f.href}
                className="group relative block overflow-hidden rounded-[16px] md:rounded-[20px]"
                style={{ aspectRatio: f.ancho ? '16 / 9' : '4 / 5' }}
              >
                <Image
                  src={f.src}
                  alt={f.alt}
                  fill
                  sizes={f.ancho ? '(max-width: 768px) 100vw, 600px' : '(max-width: 768px) 50vw, 300px'}
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  priority={i < 2}
                />
                <span aria-hidden className="absolute inset-0 opacity-80" style={{ background: 'linear-gradient(0deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,0) 38%)' }} />
                <span className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between gap-2 text-[12.5px] font-bold text-white md:bottom-3.5 md:left-4 md:text-[13.5px]">
                  {f.lugar}
                  <ArrowUpRight size={16} aria-hidden className="opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Contenedor>
    </section>
  )
}

export function Aereas() {
  return (
    <section className="relative overflow-hidden text-white" style={{ background: VERDE_OSCURO }} aria-labelledby="drone-titulo">
      <div className="relative h-[340px] w-full overflow-hidden md:h-[560px]">
        <Image
          src="/como-trabajamos/drone-golf-funes.webp"
          alt="Toma aérea con drone de un club de campo con cancha de golf en Funes"
          fill
          sizes="100vw"
          className="ct-zoom object-cover"
        />
        <div aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(0deg, #0E3521 0%, rgba(14,53,33,.35) 45%, rgba(14,53,33,.1) 100%)' }} />
        <Contenedor className="absolute inset-x-0 bottom-0 pb-8 md:pb-14">
          <Encabezado
            id="drone-titulo"
            oscuro
            eyebrow="Tomas aéreas con drone"
            titulo="El entorno también vende."
            bajada="Volamos cada propiedad que lo amerita: el terreno, el barrio, los accesos, los espacios verdes y las distancias. Lo que una foto a nivel del piso no puede mostrar."
          />
        </Contenedor>
      </div>
      <Contenedor className="pb-16 pt-6 md:pb-24">
        {/* Un poco más chicas que el ancho del contenedor; al pasar el mouse
            cada toma se agranda levemente. El hover va en un div interno: el
            .ct-rev del <li> anima transform y le ganaría al scale. */}
        <ul className="m-0 mx-auto grid max-w-[1000px] list-none grid-cols-2 gap-3 p-0 md:grid-cols-12 md:gap-4">
          {AEREAS.map((a, i) => {
            const grande = a.ancho === 6
            // En el celular: las casas y la primera de las chicas a todo el
            // ancho; el resto de a dos.
            const movil = i < 3 ? 'col-span-2' : 'col-span-1'
            return (
              <li key={a.src} className={`ct-rev relative hover:z-10 ${movil} ${grande ? 'md:col-span-6' : 'md:col-span-4'}`}>
                <div
                  className={`relative overflow-hidden rounded-[18px] transition duration-300 ease-out hover:scale-[1.05] hover:shadow-2xl ${grande ? 'aspect-[3/2]' : 'aspect-[4/3]'}`}
                >
                  <Image
                    src={a.src}
                    alt={a.alt}
                    fill
                    sizes={grande ? '(max-width: 768px) 100vw, 500px' : '(max-width: 768px) 100vw, 330px'}
                    className="object-cover"
                  />
                  <Chip className="absolute bottom-3 left-3">
                    <Drone size={13} aria-hidden /> {a.lugar}
                  </Chip>
                </div>
              </li>
            )
          })}
        </ul>
      </Contenedor>
    </section>
  )
}

export function EquipoTecnico() {
  return (
    <section className="py-16 md:py-24" aria-labelledby="equipo-tecnico-titulo">
      <Contenedor className="grid gap-10 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-14">
        <div>
          <Encabezado
            id="equipo-tecnico-titulo"
            eyebrow="Equipo de marketing y producción"
            titulo="Con qué relevamos cada propiedad."
            bajada="Tenemos un equipo propio de marketing y producción audiovisual. Grabamos con equipo profesional y editamos en MacBook Pro con programas avanzados de edición de video."
          />
          <div className="relative mt-8 aspect-[4/5] w-full max-w-[340px] overflow-hidden rounded-[22px]">
            <VideoVivo
              src="/como-trabajamos/video/reel-oficina.mp4"
              poster="/como-trabajamos/video/reel-oficina.webp"
              etiqueta="Reel grabado por el equipo en la oficina de Funes"
              className="absolute inset-0"
            />
            <Chip className="absolute left-3 top-3">
              <Clapperboard size={13} aria-hidden /> Reel hecho por el equipo
            </Chip>
          </div>
        </div>

        <ul className="m-0 grid list-none content-start gap-3 p-0 sm:grid-cols-2 md:gap-4">
          {EQUIPOS.map((e) => {
            const Icon = ICONOS[e.icono]
            return (
              <li key={e.nombre} className="ct-rev overflow-hidden rounded-[20px]" style={{ background: FONDO, border: `1px solid ${BORDE}` }}>
                <span className="relative block aspect-[4/3]" style={{ background: e.oscura ? '#000' : '#fff' }}>
                  <Image
                    src={e.foto}
                    alt={e.nombre}
                    fill
                    sizes="(max-width: 640px) 100vw, 360px"
                    className={e.oscura ? 'object-cover' : 'object-contain p-2'}
                  />
                </span>
                <span className="block p-6 pt-5">
                  <span className="flex items-center gap-2">
                    <Icon size={18} strokeWidth={1.8} style={{ color: VERDE }} aria-hidden />
                    <h3 className="m-0 text-[19px] font-extrabold leading-tight">{conNumeros(e.nombre)}</h3>
                  </span>
                  <p className="mt-2 text-[14.5px] leading-[1.6]" style={{ color: TEXTO }}>
                    {e.uso}
                  </p>
                </span>
              </li>
            )
          })}
          <li className="rounded-[20px] p-6 text-white sm:col-span-2" style={{ background: VERDE }}>
            <p className="m-0 text-[12px] font-bold uppercase tracking-[0.18em]" style={{ color: MENTA }}>
              Del relevamiento a la publicación
            </p>
            <p className="mt-2 text-[16px] font-semibold leading-[1.6]">
              Fotos, video horizontal para YouTube, reels verticales, tomas aéreas, primera persona con Ray-Ban Meta y la voz del
              agente contando la propiedad: todo sale de una misma visita, coordinada con vos, y se edita en nuestro equipo.
            </p>
          </li>
        </ul>
      </Contenedor>
    </section>
  )
}

/** Logo de YouTube (ícono rojo + palabra), para identificar el canal. */
export function LogoYoutube({ className = '' }: { className?: string }) {
  return (
    <a
      href={CANAL_YOUTUBE}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Canal de YouTube de SI INMOBILIARIA"
      className={`inline-flex items-center gap-2 ${className}`}
      style={{ textDecoration: 'none', color: TINTA }}
    >
      <svg width="44" height="31" viewBox="0 0 28 20" aria-hidden>
        <path
          d="M27.4 3.1A3.5 3.5 0 0 0 25 .6C22.8 0 14 0 14 0S5.2 0 3 .6A3.5 3.5 0 0 0 .6 3.1C0 5.3 0 10 0 10s0 4.7.6 6.9A3.5 3.5 0 0 0 3 19.4C5.2 20 14 20 14 20s8.8 0 11-.6a3.5 3.5 0 0 0 2.4-2.5C28 14.7 28 10 28 10s0-4.7-.6-6.9Z"
          fill="#FF0000"
        />
        <path d="M11.2 14.3 18.5 10l-7.3-4.3v8.6Z" fill="#fff" />
      </svg>
      <span className="text-[22px] font-extrabold tracking-[-0.03em]">YouTube</span>
    </a>
  )
}

export function Videotours() {
  return (
    <section className="py-16 md:py-24" style={{ background: FONDO }} aria-labelledby="videotours-titulo">
      <Contenedor>
        <LogoYoutube className="mb-5" />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Encabezado
            id="videotours-titulo"
            eyebrow="Videotours en YouTube"
            titulo="Recorrés la casa antes de ir."
            bajada="Videotours con los detalles de cada ambiente, subidos a nuestro canal y a la ficha de la propiedad. El que llega a la visita ya sabe lo que va a ver."
          />
          <LinkFlecha href={CANAL_YOUTUBE} externo>
            Ver el canal completo
          </LinkFlecha>
        </div>

        <ul className="m-0 mt-10 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 md:gap-5">
          {VIDEOTOURS.map((v) => (
            <li key={v.id} className="ct-rev">
              <VisorYoutube id={v.id} titulo={v.titulo} className="aspect-video overflow-hidden rounded-[18px]">
                <PosterYoutube id={v.id} />
                <span aria-hidden className="absolute inset-0 bg-black/15 transition-colors group-hover:bg-black/25" />
                <BotonPlay />
              </VisorYoutube>
              <p className="mt-2.5 flex items-baseline justify-between gap-3 text-[14.5px] font-bold leading-snug">
                {v.titulo}
                {v.dur && (
                  <span className="shrink-0 font-numeric text-[12.5px] font-semibold" style={{ color: GRIS }}>
                    {v.dur}
                  </span>
                )}
              </p>
            </li>
          ))}
        </ul>
      </Contenedor>
    </section>
  )
}

/** Logo de Instagram (glifo con el degradé de la marca + palabra). */
export function LogoInstagram({ className = '', claro = false }: { className?: string; claro?: boolean }) {
  return (
    <a
      href="https://www.instagram.com/inmobiliaria.si"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Instagram de SI INMOBILIARIA"
      className={`inline-flex items-center gap-2.5 ${className}`}
      style={{ textDecoration: 'none', color: claro ? '#fff' : TINTA }}
    >
      <svg width="34" height="34" viewBox="0 0 24 24" aria-hidden>
        <defs>
          <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
            <stop offset="0%" stopColor="#fdf497" />
            <stop offset="5%" stopColor="#fdf497" />
            <stop offset="45%" stopColor="#fd5949" />
            <stop offset="60%" stopColor="#d6249f" />
            <stop offset="90%" stopColor="#285AEB" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="24" height="24" rx="6.5" fill="url(#ig-grad)" />
        <rect x="5" y="5" width="14" height="14" rx="4.2" fill="none" stroke="#fff" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="3.4" fill="none" stroke="#fff" strokeWidth="1.8" />
        <circle cx="16.6" cy="7.4" r="1.05" fill="#fff" />
      </svg>
      <span className="text-[22px] font-extrabold tracking-[-0.03em]">Instagram</span>
    </a>
  )
}

export function Reels() {
  return (
    <section className="py-16 md:py-24" aria-labelledby="reels-titulo">
      <Contenedor>
        <LogoInstagram className="mb-5" />
        <Encabezado
          id="reels-titulo"
          eyebrow="Reels y shorts"
          titulo="Recorridos verticales, donde hoy busca la gente."
          bajada="Cada propiedad tiene su reel para Instagram, TikTok y YouTube Shorts. Estos son algunos de los que publicamos este año."
        />
      </Contenedor>
      {/* Carril horizontal alineado con el contenedor: el gutter izquierdo
          sigue al del Contenedor (16/24/40 px) y en pantallas anchas suma el
          margen del centrado. */}
      <div
        className="mt-9 overflow-x-auto pb-2 [--gut:16px] [scrollbar-width:thin] sm:[--gut:24px] md:[--gut:40px]"
      >
        <ul
          className="m-0 flex w-max list-none gap-3 p-0 md:gap-4"
          style={{ paddingLeft: 'max(var(--gut), calc((100vw - 1200px) / 2 + var(--gut)))', paddingRight: 'var(--gut)' }}
        >
          {SHORTS.map((s) => (
            <li key={s.id} className="w-[168px] shrink-0 md:w-[200px]">
              <ShortYoutube id={s.id} titulo={s.titulo} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
