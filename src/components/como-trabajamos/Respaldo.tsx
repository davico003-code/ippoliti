// /como-trabajamos — respaldo: prensa, cartelería y eventos, HILO,
// desarrolladores e inversores, red de contactos, equipo y oficinas.

import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowUpRight,
  Building2,
  FileChartColumn,
  GraduationCap,
  Handshake,
  Inbox,
  MapPin,
  Sparkles,
  Users,
} from 'lucide-react'
import { VideoVivo } from './Medios'
import { AGENTES, BARRIOS, DIRECCION, EMPRENDIMIENTOS, OFICINAS, PRENSA } from './datos'
import { ACENTO, BORDE, Chip, Contenedor, Encabezado, FONDO, GRIS, LinkFlecha, MENTA, TEXTO, TINTA, VERDE, VERDE_OSCURO, VERDE_SUAVE, conNumeros } from './ui'

export function Prensa() {
  return (
    <section className="py-16 md:py-24" aria-labelledby="prensa-titulo">
      <Contenedor>
        <Encabezado
          id="prensa-titulo"
          eyebrow="Medios locales"
          titulo="Lo que dicen de nosotros los medios de la zona."
          bajada="Columnas de opinión, notas sobre nuestros proyectos y datos del mercado en InfoFunes y El Roldanense. Tocá cualquiera para leer la nota original."
        />
        <ul className="m-0 mt-10 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4 md:gap-5">
          {PRENSA.map((n) => (
            <li key={n.href}>
              <a
                href={n.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col overflow-hidden rounded-[18px] bg-white transition-shadow duration-200 hover:shadow-lg"
                style={{ border: `1px solid ${BORDE}`, color: TINTA, textDecoration: 'none' }}
              >
                <span className="relative block aspect-[1.91/1]">
                  <Image src={n.img} alt="" fill sizes="(max-width: 640px) 100vw, 290px" className="object-cover" />
                </span>
                <span className="flex flex-1 flex-col p-4">
                  <span className="flex items-center justify-between gap-2 text-[11.5px] font-bold uppercase tracking-[0.12em]" style={{ color: ACENTO }}>
                    {n.medio}
                    <span className="font-numeric normal-case tracking-normal" style={{ color: GRIS }}>
                      {n.fecha}
                    </span>
                  </span>
                  <span className="mt-2 block text-[15px] font-extrabold leading-snug">{conNumeros(n.titulo)}</span>
                  {n.firma && (
                    <span className="mt-2 block text-[12.5px] font-bold" style={{ color: VERDE }}>
                      {n.firma}
                    </span>
                  )}
                  <span className="mt-auto flex items-center gap-1 pt-3 text-[13px] font-bold" style={{ color: VERDE }}>
                    Leer nota <ArrowUpRight size={15} aria-hidden />
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Contenedor>
    </section>
  )
}

export function CalleYEventos() {
  return (
    <section className="py-16 md:py-24" style={{ background: FONDO }} aria-labelledby="eventos-titulo">
      <Contenedor>
        <Encabezado
          id="eventos-titulo"
          eyebrow="Cartelería y eventos"
          titulo="También en la calle, y en persona."
          bajada="Cada desarrollo que comercializamos tiene su cartelería en la obra y en la ruta, y cada lote su cartel con nuestra identidad. Además organizamos eventos en la galería de arte PARED de nuestra oficina de Funes para presentar proyectos a clientes e invitados."
        />

        {/* Cartelería de desarrollos, colocada */}
        <div className="mt-10 grid gap-4 md:grid-cols-[2fr_1fr] md:gap-5">
          <figure className="m-0">
            <div className="relative aspect-[3/2] overflow-hidden rounded-[18px] shadow-md">
              <Image
                src="/como-trabajamos/cartel-obra-dockgarden.webp"
                alt="Cartel de Dock Garden y cerco de obra en Aldea Fisherton, con SI INMOBILIARIA como comercializadora"
                fill
                sizes="(max-width: 768px) 100vw, 760px"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-2.5 text-[13.5px] font-bold" style={{ color: TEXTO }}>
              Dock Garden · cartel y cerco de obra en Aldea Fisherton
            </figcaption>
          </figure>
          <figure className="m-0 flex flex-col">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[18px] shadow-md md:aspect-auto md:flex-1">
              <Image
                src="/como-trabajamos/cartel-ruta-distrito-roldan.webp"
                alt="Cartel de Distrito Roldán en la ruta, con SI INMOBILIARIA como comercializadora"
                fill
                sizes="(max-width: 768px) 100vw, 380px"
                className="object-cover"
                style={{ objectPosition: 'center 52%' }}
              />
            </div>
            <figcaption className="mt-2.5 text-[13.5px] font-bold" style={{ color: TEXTO }}>
              Distrito Roldán · cartel en ruta
            </figcaption>
          </figure>
        </div>

        <div className="mt-5 grid gap-4 md:mt-6 md:grid-cols-[1fr_1fr_1.1fr] md:gap-5">
          {[
            { src: '/como-trabajamos/cartel-lotes-ruta9.webp', alt: 'Cartel de SI INMOBILIARIA de venta de lotes con plano sobre Ruta 9', txt: 'Cartel de obra con plano de lotes' },
            { src: '/como-trabajamos/cartel-vende-lotes.webp', alt: 'Cartel de SI INMOBILIARIA "Vende lotes"', txt: 'Cartel de venta en el terreno' },
          ].map((c) => (
            <figure key={c.src} className="m-0">
              <div className="relative aspect-square overflow-hidden rounded-[18px] bg-white shadow-md">
                <Image src={c.src} alt={c.alt} fill sizes="(max-width: 768px) 100vw, 360px" className="object-contain" />
              </div>
              <figcaption className="mt-2.5 text-[13.5px] font-bold" style={{ color: TEXTO }}>
                {c.txt}
              </figcaption>
            </figure>
          ))}
          <div className="grid grid-cols-2 gap-3">
            {[
              { v: 'evento-pared', txt: 'Evento en PARED' },
              { v: 'galeria-pared', txt: 'Galería PARED, Funes' },
            ].map((e) => (
              <figure key={e.v} className="m-0">
                <div className="relative aspect-[9/16] overflow-hidden rounded-[18px] shadow-md">
                  <VideoVivo
                    src={`/como-trabajamos/video/${e.v}.mp4`}
                    poster={`/como-trabajamos/video/${e.v}.webp`}
                    etiqueta={e.txt}
                    className="absolute inset-0"
                  />
                </div>
                <figcaption className="mt-2.5 text-[13.5px] font-bold" style={{ color: TEXTO }}>
                  {e.txt}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </Contenedor>
    </section>
  )
}

/** Marco de ventana de navegador para mostrar pantallas reales de HILO. */
function Pantalla({ src, alt, ancho, alto, url = 'meethilo.com', className = '' }: { src: string; alt: string; ancho: number; alto: number; url?: string; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-[16px] bg-white shadow-2xl ${className}`} style={{ border: '1px solid rgba(33,30,120,.12)' }}>
      <div className="flex items-center gap-1.5 px-4 py-2.5" style={{ background: '#EEF0F4' }} aria-hidden>
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        <span className="ml-3 truncate rounded-md bg-white px-3 py-0.5 text-[11.5px] font-semibold" style={{ color: GRIS }}>
          {url}
        </span>
      </div>
      <Image src={src} alt={alt} width={ancho} height={alto} sizes="(max-width: 1024px) 100vw, 640px" className="h-auto w-full" />
    </div>
  )
}

const INDIGO = '#211E78'

// HILO visto desde el dueño: solo lo que le sirve a su venta (David, 27-sep:
// "de HILO no hace falta mostrar todo"). Pantallas reales, sin datos de
// clientes ni internos.
const HILO_PANTALLAS = [
  {
    paso: 'Mercado local, todos los días',
    titulo: 'Sabemos cuánto vale el metro cuadrado en cada barrio.',
    texto:
      'HILO lee todos los días más de 3.000 avisos de Zonaprop, Argenprop y Mercado Libre y calcula el valor del metro cuadrado de cada barrio y hacia dónde va. Tu precio se define con esos datos, no a ojo.',
    src: '/como-trabajamos/hilo/mercado.webp',
    alt: 'Pantalla real de HILO: mercado por barrio con valor del metro cuadrado y tendencia',
    ancho: 1204,
    alto: 989,
  },
  {
    paso: 'Valores y mapa de cierres',
    titulo: 'A cuánto se vende de verdad, no a cuánto se publica.',
    texto:
      'Registramos cada venta de la zona, las nuestras y las de colegas, con su valor y su ubicación en el mapa. Es la referencia más firme para poner el precio justo y negociar.',
    src: '/como-trabajamos/hilo/cierres.webp',
    alt: 'Pantalla real de HILO: cierres de venta por mes y mapa de cierres en Funes, Roldán y Rosario',
    ancho: 1165,
    alto: 650,
  },
  {
    paso: 'Tasación',
    titulo: 'Una tasación armada con datos, revisada por un corredor.',
    texto:
      'Fotos, plano y comparables reales de la zona: HILO los ordena y prepara el informe de tasación. El corredor matriculado revisa, ajusta y firma.',
    src: '/como-trabajamos/hilo/tasacion.webp',
    alt: 'Pantalla real de HILO: nueva tasación en tres pasos',
    ancho: 1204,
    alto: 989,
  },
]

const HILO_PARA_EL_DUENO = [
  { Icon: Inbox, t: 'Cada consulta, atendida al instante', d: 'Las consultas por tu propiedad se responden enseguida, también fuera de horario, y el agente sabe qué busca cada interesado antes de llamarlo.' },
  { Icon: Handshake, t: 'La devolución de cada visita', d: 'Después de cada visita el agente registra qué gustó y qué frenó. Esa opinión te llega en el informe.' },
  { Icon: FileChartColumn, t: 'Tu informe, con datos reales', d: 'Difusión, consultas, visitas y mercado en un informe claro, con el plan para el período que sigue.' },
]

export function Hilo() {
  return (
    <section className="py-16 md:py-24" aria-labelledby="hilo-titulo">
      <Contenedor>
        <Encabezado
          id="hilo-titulo"
          eyebrow="HILO · tecnología propia"
          titulo="Datos del mercado local para vender mejor tu propiedad."
          bajada="HILO es el sistema con inteligencia artificial que desarrollamos para el equipo. Esto es lo que hace por tu venta. Son pantallas reales."
        />

        <div className="mt-12 grid gap-14 md:gap-20">
          {HILO_PANTALLAS.map((p, i) => (
            <div key={p.paso} className="grid items-center gap-7 lg:grid-cols-[1fr_1.35fr] lg:gap-12">
              <div className={i % 2 ? 'lg:order-2' : ''}>
                <p className="m-0 text-[12px] font-bold uppercase tracking-[0.2em]" style={{ color: INDIGO }}>
                  {p.paso}
                </p>
                <h3 className="mt-2 text-[24px] font-extrabold leading-tight md:text-[30px]" style={{ letterSpacing: '-0.025em' }}>
                  {conNumeros(p.titulo)}
                </h3>
                <p className="mt-3 text-[16px] leading-[1.65]" style={{ color: TEXTO }}>
                  {conNumeros(p.texto)}
                </p>
              </div>
              <Pantalla src={p.src} alt={p.alt} ancho={p.ancho} alto={p.alto} className={i % 2 ? 'lg:order-1' : ''} />
            </div>
          ))}
        </div>

        <ul className="m-0 mt-16 grid list-none grid-cols-1 gap-3 p-0 md:mt-20 md:grid-cols-3 md:gap-4">
          {HILO_PARA_EL_DUENO.map(({ Icon, t, d }) => (
            <li key={t} className="rounded-[18px] p-6" style={{ background: '#F4F4FB', border: '1px solid rgba(33,30,120,.08)' }}>
              <Icon size={22} strokeWidth={1.8} style={{ color: INDIGO }} aria-hidden />
              <p className="mt-3 text-[16.5px] font-extrabold leading-tight">{t}</p>
              <p className="mt-1.5 text-[14px] leading-[1.55]" style={{ color: GRIS }}>
                {d}
              </p>
            </li>
          ))}
        </ul>
      </Contenedor>
    </section>
  )
}

/** Bloques reales de un informe al propietario (sin datos del dueño). */
export function InformeReal() {
  const bloques = [
    { src: '/como-trabajamos/hilo/informe-difusion.webp', alt: 'Bloque real del informe: así se muestra su propiedad hoy, con los portales donde está publicada' },
    { src: '/como-trabajamos/hilo/informe-indice.webp', alt: 'Bloque real del informe: índice de comercialización con siete dimensiones' },
    { src: '/como-trabajamos/hilo/informe-acciones.webp', alt: 'Bloque real del informe: próximas acciones del plan de trabajo' },
    { src: '/como-trabajamos/hilo/informe-mirada.webp', alt: 'Bloque real del informe: preguntas al propietario para ajustar la estrategia' },
  ]
  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-5">
      {bloques.map((b) => (
        <div key={b.src} className="overflow-hidden rounded-[16px] bg-white shadow-lg" style={{ border: `1px solid ${BORDE}` }}>
          <Image src={b.src} alt={b.alt} width={770} height={340} sizes="(max-width: 768px) 100vw, 560px" className="h-auto w-full" />
        </div>
      ))}
    </div>
  )
}

export function Desarrolladores() {
  return (
    <section className="py-16 md:py-24" style={{ background: FONDO }} aria-labelledby="desarrolladores-titulo">
      <Contenedor>
        <Encabezado
          id="desarrolladores-titulo"
          eyebrow="Inversores, desarrolladores y constructores"
          titulo="Acompañamos proyectos desde el lanzamiento."
          bajada="Asesoramos a desarrolladores y constructores en el producto, el precio y la estrategia de venta, y comercializamos sus proyectos. A los inversores les mostramos números: rentabilidad, valor del metro cuadrado y oportunidades reales."
        />
        <ul className="m-0 mt-10 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 md:gap-5">
          {EMPRENDIMIENTOS.map((e) => (
            <li key={e.nombre}>
              <Link
                href={e.href}
                className="group block h-full overflow-hidden rounded-[20px] bg-white transition-shadow duration-200 hover:shadow-lg"
                style={{ border: `1px solid ${BORDE}`, color: TINTA, textDecoration: 'none' }}
              >
                <span className="relative block aspect-[16/10]">
                  <Image src={e.img} alt={`${e.nombre}: ${e.tipo}`} fill sizes="(max-width: 640px) 100vw, 380px" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                  {e.render && <Chip className="absolute left-3 top-3">Render del proyecto</Chip>}
                </span>
                <span className="block p-5">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-[19px] font-extrabold leading-tight">{e.nombre}</span>
                    <ArrowUpRight size={18} aria-hidden style={{ color: VERDE }} />
                  </span>
                  <span className="mt-1 block text-[13.5px] font-semibold" style={{ color: GRIS }}>
                    {e.tipo}
                  </span>
                  <span className="mt-3 block rounded-[12px] px-3 py-2 text-[13.5px] font-bold" style={{ background: VERDE_SUAVE, color: VERDE }}>
                    {conNumeros(e.dato)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <ul className="m-0 mt-8 grid list-none gap-3 p-0 md:grid-cols-4">
          {[
            ['Estrategia de lanzamiento', 'Precio, etapas, formas de pago y público al que apuntar.'],
            ['Comercialización', 'Equipo de venta, difusión, pauta, cartelería y eventos.'],
            ['Informes de mercado', 'Costo de construcción, valor del m² y comparables de la zona.'],
            ['Inversores', 'Rentabilidad estimada y oportunidades detectadas con datos.'],
          ].map(([t, d]) => (
            <li key={t} className="rounded-[18px] bg-white p-5" style={{ border: `1px solid ${BORDE}` }}>
              <Building2 size={19} strokeWidth={1.8} style={{ color: VERDE }} aria-hidden />
              <p className="mt-2.5 text-[15.5px] font-extrabold leading-tight">{t}</p>
              <p className="mt-1 text-[13.5px] leading-[1.5]" style={{ color: GRIS }}>
                {d}
              </p>
            </li>
          ))}
        </ul>
      </Contenedor>
    </section>
  )
}

export function RedDeContactos() {
  return (
    <section className="relative overflow-hidden text-white" style={{ background: VERDE_OSCURO }} aria-labelledby="red-titulo">
      <Image src="/como-trabajamos/drone-roldan.webp" alt="" fill sizes="100vw" className="object-cover opacity-25" />
      <div aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(14,53,33,.96) 0%, rgba(14,53,33,.82) 55%, rgba(14,53,33,.6) 100%)' }} />
      <Contenedor className="relative grid gap-10 py-16 md:py-24 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <Encabezado
          id="red-titulo"
          oscuro
          eyebrow="Red de contactos"
          titulo="Cuatro décadas de relaciones en la zona."
          bajada="Desde 1983 construimos una base de clientes, inversores, desarrolladores y colegas muy amplia, con fuerte presencia en el segmento ABC1 de Funes, Roldán y Rosario. Cuando entra una propiedad, lo primero que hacemos es ofrecérsela a quienes ya nos pidieron algo así."
        />
        <div>
          <p className="m-0 text-[12px] font-bold uppercase tracking-[0.2em]" style={{ color: MENTA }}>
            Barrios donde trabajamos
          </p>
          <ul className="m-0 mt-4 flex list-none flex-wrap gap-2 p-0">
            {BARRIOS.map((b) => (
              <li key={b} className="rounded-full px-3.5 py-1.5 text-[13.5px] font-bold" style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.14)' }}>
                {b}
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <LinkFlecha href="/barrios-privados" claro>
              Ver los barrios cerrados
            </LinkFlecha>
          </div>
        </div>
      </Contenedor>
    </section>
  )
}

export function Equipo() {
  return (
    <section className="py-16 md:py-24" aria-labelledby="equipo-titulo">
      <Contenedor>
        <Encabezado
          id="equipo-titulo"
          eyebrow="El equipo"
          titulo={<><span className="font-numeric">19</span> personas que conocen el mercado.</>}
          bajada="Corredores matriculados y agentes que viven y trabajan en la zona. Saben qué se vende en cada barrio, a cuánto y en cuánto tiempo, y se capacitan todo el tiempo en SI School, nuestra escuela interna."
        />

        <ul className="m-0 mt-10 grid list-none gap-4 p-0 md:grid-cols-3 md:gap-5">
          {DIRECCION.map((p) => (
            <li key={p.nombre} className="overflow-hidden rounded-[22px]" style={{ background: FONDO }}>
              <span className="relative block aspect-[4/5]">
                <Image src={p.foto} alt={p.nombre} fill sizes="(max-width: 768px) 100vw, 380px" className="object-cover" style={{ objectPosition: 'center 20%' }} />
              </span>
              <span className="block p-5">
                <span className="block text-[20px] font-extrabold leading-tight">{p.nombre}</span>
                <span className="mt-0.5 block text-[14px] font-bold" style={{ color: VERDE }}>
                  {p.cargo}
                </span>
                <span className="mt-1.5 block text-[13.5px] leading-[1.5]" style={{ color: GRIS }}>
                  {conNumeros(p.detalle)}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <ul className="m-0 mt-5 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 md:gap-4">
          {AGENTES.map((a) => (
            <li key={a.nombre}>
              <span className="relative block aspect-[3/4] overflow-hidden rounded-[16px] bg-neutral-200">
                <Image src={a.foto} alt={a.nombre} fill sizes="(max-width: 640px) 50vw, 150px" className="object-cover" style={{ objectPosition: 'center 22%' }} />
              </span>
              <span className="mt-2 block text-[13.5px] font-bold leading-tight">{a.nombre}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 grid gap-3 md:grid-cols-3 md:gap-4">
          {[
            { Icon: Users, t: 'Un agente responsable', d: 'Tu propiedad tiene un agente con nombre, apellido y celular.' },
            { Icon: Sparkles, t: 'Marketing y producción propios', d: 'Fotos, video, drone, redes y pauta los hace nuestro equipo.' },
            { Icon: GraduationCap, t: 'Capacitación continua', d: 'SI School: tasación, negociación, documentación y atención, con evaluaciones.' },
          ].map(({ Icon, t, d }) => (
            <div key={t} className="flex gap-4 rounded-[18px] p-5" style={{ background: FONDO }}>
              <Icon size={24} strokeWidth={1.7} className="shrink-0" style={{ color: VERDE }} aria-hidden />
              <p className="m-0 text-[14.5px] leading-[1.55]" style={{ color: TEXTO }}>
                <strong style={{ color: TINTA }}>{t}.</strong> {d}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <LinkFlecha href="/nosotros">Conocé nuestra historia</LinkFlecha>
        </div>
      </Contenedor>
    </section>
  )
}

export function Oficinas() {
  return (
    <section className="py-16 md:py-24" style={{ background: FONDO }} aria-labelledby="oficinas-titulo">
      <Contenedor>
        <Encabezado
          id="oficinas-titulo"
          eyebrow="Tres oficinas"
          titulo="Siempre cerca, en Funes y en Roldán."
          bajada="Te esperamos en cualquiera de las tres. La de Funes, además, es una galería de arte donde organizamos presentaciones y eventos."
        />
        <ul className="m-0 mt-10 grid list-none gap-4 p-0 md:grid-cols-3 md:gap-5">
          {OFICINAS.map((o) => (
            <li key={o.direccion} className="overflow-hidden rounded-[20px] bg-white" style={{ border: `1px solid ${BORDE}` }}>
              <span className="relative block aspect-[4/3]">
                <Image src={o.foto} alt={`Oficina de SI INMOBILIARIA en ${o.direccion}`} fill sizes="(max-width: 768px) 100vw, 380px" className="object-cover" />
              </span>
              <span className="flex gap-3 p-5">
                <MapPin size={20} strokeWidth={1.8} className="mt-0.5 shrink-0" style={{ color: ACENTO }} aria-hidden />
                <span>
                  <span className="block text-[16.5px] font-extrabold">{o.nombre}</span>
                  <span className="block text-[14.5px] font-semibold" style={{ color: TEXTO }}>
                    {conNumeros(o.direccion)}
                  </span>
                  <span className="block text-[13px]" style={{ color: GRIS }}>
                    {conNumeros(o.nota)}
                  </span>
                </span>
              </span>
            </li>
          ))}
        </ul>
      </Contenedor>
    </section>
  )
}
