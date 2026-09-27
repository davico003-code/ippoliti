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
  Users,
} from 'lucide-react'
import { VideoVivo } from './Medios'
import MapaUbicacion from './MapaUbicacion'
import RedRelaciones, { RELACIONES } from './Red'
import { MuroHilo } from './Resultados'
import { AGENTES, BARRIOS, COLEGAS, DIRECCION, EMPRENDIMIENTOS, INFORMES, OFICINAS, PRENSA } from './datos'
import { ACENTO, BORDE, Chip, Contenedor, Encabezado, FONDO, GRIS, LinkFlecha, MENTA, TEXTO, TINTA, VERDE, VERDE_SUAVE, conNumeros } from './ui'

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
            <li key={n.href} className="ct-rev">
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
          bajada="Cada desarrollo que comercializamos tiene su cartelería en la obra y en la ruta, y cada lote su cartel con nuestra identidad. Además presentamos los proyectos con eventos de lanzamiento para clientes, inversores e invitados."
        />

        {/* Cartelería de desarrollos, colocada */}
        <div className="mt-10 grid gap-4 md:grid-cols-[2fr_1fr_1fr] md:gap-5">
          <figure className="m-0">
            <div className="relative aspect-[3/2] overflow-hidden rounded-[18px] shadow-md">
              <Image
                src="/como-trabajamos/cartel-obra-dockgarden.webp"
                alt="Cartel de Dock Garden y cerco de obra en Aldea Fisherton, con SI INMOBILIARIA como comercializadora"
                fill
                sizes="(max-width: 768px) 100vw, 760px"
                className="ct-zoom object-cover"
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
          <figure className="m-0 flex flex-col">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[18px] shadow-md md:aspect-auto md:flex-1">
              <Image
                src="/como-trabajamos/cartel-distrito-roldan-obra.webp"
                alt="Carteles de Distrito Roldán en el terreno, con SI INMOBILIARIA como comercializadora"
                fill
                sizes="(max-width: 768px) 100vw, 380px"
                className="object-cover"
                style={{ objectPosition: 'center 60%' }}
              />
            </div>
            <figcaption className="mt-2.5 text-[13.5px] font-bold" style={{ color: TEXTO }}>
              Distrito Roldán · carteles en el terreno
            </figcaption>
          </figure>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 md:mt-6 md:gap-5">
          {[
            { src: '/como-trabajamos/cartel-marca-acceso-funes.webp', alt: 'Cartel de SI INMOBILIARIA en el acceso a Funes', txt: 'Cartel de marca en el acceso a Funes' },
            { src: '/como-trabajamos/cartel-4-lotes-funes.webp', alt: 'Cartel de 4 lotes en venta de SI INMOBILIARIA y Rodriguez Tuttobene en Funes', txt: 'Lotes en Funes, comercializados junto con Rodriguez Tuttobene' },
          ].map((c) => (
            <figure key={c.src} className="m-0">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[18px] shadow-md">
                <Image src={c.src} alt={c.alt} fill sizes="(max-width: 640px) 100vw, 560px" className="object-cover" />
              </div>
              <figcaption className="mt-2.5 text-[13.5px] font-bold" style={{ color: TEXTO }}>
                {c.txt}
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Evento de lanzamiento: el video va grande, protagonista */}
        <div className="mt-12 grid items-center gap-8 md:mt-16 md:grid-cols-[minmax(0,400px)_1fr] md:gap-14">
          <div className="relative mx-auto aspect-[9/16] w-full max-w-[400px] overflow-hidden rounded-[24px] shadow-2xl">
            <VideoVivo
              src="/como-trabajamos/video/evento-pared.mp4"
              poster="/como-trabajamos/video/evento-pared.webp"
              etiqueta="Evento de lanzamiento organizado por SI INMOBILIARIA"
              className="absolute inset-0"
            />
            <Chip className="absolute left-3 top-3">Evento de lanzamiento</Chip>
          </div>
          <div>
            <p className="m-0 text-[12px] font-bold uppercase tracking-[0.22em]" style={{ color: ACENTO }}>
              Eventos exclusivos
            </p>
            <h3 className="mt-2.5 text-[26px] font-extrabold leading-tight md:text-[34px]" style={{ letterSpacing: '-0.03em' }}>
              Cada proyecto se presenta con un evento de lanzamiento.
            </h3>
            <p className="mt-4 text-[16px] leading-[1.65] md:text-[17px]" style={{ color: TEXTO }}>
              Invitamos a nuestra base de clientes, inversores y colegas a conocer el proyecto en persona: la propuesta, los
              números y el equipo que lo vende. Los hacemos en nuestra oficina de Funes, que además es galería de arte.
            </p>
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

        <div className="mt-10">
          <MuroHilo />
        </div>

        <div className="mt-14 grid gap-14 md:mt-20 md:gap-20">
          {HILO_PANTALLAS.map((p, i) => (
            <div key={p.paso} className="ct-rev grid items-center gap-7 lg:grid-cols-[1fr_1.35fr] lg:gap-12">
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
            <li key={t} className="ct-rev rounded-[18px] p-6" style={{ background: '#F4F4FB', border: '1px solid rgba(33,30,120,.08)' }}>
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
        <div key={b.src} className="ct-rev overflow-hidden rounded-[16px] bg-white shadow-lg" style={{ border: `1px solid ${BORDE}` }}>
          <Image src={b.src} alt={b.alt} width={770} height={340} sizes="(max-width: 768px) 100vw, 560px" className="h-auto w-full" />
        </div>
      ))}
    </div>
  )
}

/** Un informe como libro: tapa nítida adelante y páginas en miniatura atrás. */
function Libro({ informe }: { informe: (typeof INFORMES)[number] }) {
  const slide = informe.formato === 'slide'
  const ancho = slide ? 'w-[86%]' : 'w-[62%]'
  const aspecto = slide ? 'aspect-[16/9]' : 'aspect-[1/1.414]'
  return (
    <div className="relative mx-auto flex h-[300px] w-full max-w-[360px] items-center justify-center md:h-[330px]" aria-hidden>
      {informe.paginas.map((src, i) => (
        <div
          key={src}
          className={`absolute ${ancho} ${aspecto} overflow-hidden rounded-[6px] bg-white shadow-lg`}
          style={{ transform: `translate(${(i + 1) * 16}px, ${-(i + 1) * 8}px) rotate(${(i + 1) * 3.2}deg)`, zIndex: 3 - i, border: '1px solid rgba(17,18,19,.08)' }}
        >
          <Image src={src} alt="" fill sizes="220px" className="object-cover object-top" style={{ filter: 'blur(0.6px)' }} />
        </div>
      ))}
      <div
        className={`absolute ${ancho} ${aspecto} overflow-hidden rounded-[6px] bg-white`}
        style={{ zIndex: 10, transform: 'rotate(-2deg)', boxShadow: '0 22px 44px -12px rgba(0,0,0,.45)', border: '1px solid rgba(17,18,19,.1)' }}
      >
        <Image src={informe.tapa} alt="" fill sizes="280px" className="object-cover object-top" />
        {/* Lomo del libro */}
        <span className="absolute inset-y-0 left-0 w-[10px]" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,.22), rgba(0,0,0,0))' }} />
      </div>
    </div>
  )
}

export function Desarrolladores() {
  return (
    <section className="bg-white py-16 md:py-24" aria-labelledby="desarrolladores-titulo">
      <Contenedor>
        <Encabezado
          id="desarrolladores-titulo"
          eyebrow="Desarrolladores e inversores"
          titulo="Detrás de cada emprendimiento, un análisis."
          bajada="Asesoramos a los desarrolladores en producto, precio y estrategia de venta antes de lanzar, y les reportamos el avance comercial con datos durante toda la comercialización."
        />

        <ul className="m-0 mt-10 grid list-none gap-4 p-0 md:grid-cols-2 md:gap-5">
          {EMPRENDIMIENTOS.map((e) => (
            <li key={e.nombre} className="ct-rev">
              <Link
                href={e.href}
                className="group block h-full overflow-hidden rounded-[22px] bg-white transition-shadow duration-200 hover:shadow-lg"
                style={{ border: `1px solid ${BORDE}`, color: TINTA, textDecoration: 'none' }}
              >
                <span className="relative block aspect-[16/9]">
                  <Image src={e.img} alt={`${e.nombre}: ${e.tipo}`} fill sizes="(max-width: 768px) 100vw, 580px" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                </span>
                <span className="block p-6">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-[24px] font-extrabold leading-tight" style={{ letterSpacing: '-0.02em' }}>
                      {e.nombre}
                    </span>
                    <ArrowUpRight size={20} aria-hidden style={{ color: VERDE }} />
                  </span>
                  <span className="mt-1 block text-[14px] font-semibold" style={{ color: GRIS }}>
                    {e.tipo} · Desarrolla {e.desarrolla}
                  </span>
                  <span className="mt-4 block rounded-[12px] px-4 py-3 text-[14.5px] font-bold" style={{ background: VERDE_SUAVE, color: VERDE }}>
                    {conNumeros(e.dato)}
                    {e.fuente && (
                      <span className="mt-0.5 block text-[12px] font-semibold" style={{ color: ACENTO }}>
                        {e.fuente}
                      </span>
                    )}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <h3 className="mb-0 mt-16 text-[24px] font-extrabold md:mt-20 md:text-[30px]" style={{ letterSpacing: '-0.025em' }}>
          Informes reales que entregamos a los desarrolladores
        </h3>
        <p className="mt-2 max-w-[46rem] text-[15.5px] leading-[1.6]" style={{ color: TEXTO }}>
          Análisis de mercado antes del lanzamiento, planes de acción y reportes del avance comercial. Estas son páginas reales,
          en miniatura: el detalle es confidencial de cada desarrollador.
        </p>
        <ul className="m-0 mt-10 grid list-none gap-12 p-0 md:gap-16">
          {INFORMES.map((inf) => (
            <li key={inf.tapa} className="grid items-center gap-6 rounded-[24px] p-5 md:p-8 lg:grid-cols-[320px_1fr] lg:gap-10" style={{ background: FONDO, border: `1px solid ${BORDE}` }}>
              <div>
                <Libro informe={inf} />
                <div className="mt-2 text-center">
                  <p className="m-0 text-[11.5px] font-bold uppercase tracking-[0.18em]" style={{ color: ACENTO }}>
                    {inf.proyecto} · {inf.tipo}
                  </p>
                  <p className="mt-1.5 text-[18px] font-extrabold leading-snug">{inf.titulo}</p>
                  <p className="mt-0.5 text-[13px] font-semibold" style={{ color: GRIS }}>
                    {conNumeros(inf.fecha)}
                  </p>
                  <p className="mx-auto mt-2 max-w-[34ch] text-[14px] leading-[1.55]" style={{ color: TEXTO }}>
                    {inf.detalle}
                  </p>
                </div>
              </div>
              <ul className={`m-0 grid list-none gap-3 p-0 ${inf.formato === 'slide' ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
                {inf.muestras.map((pg) => (
                  <li key={pg.src}>
                    <span
                      className="relative block overflow-hidden rounded-[8px] bg-white shadow-md"
                      style={{ aspectRatio: `${pg.ancho} / ${pg.alto}`, border: '1px solid rgba(17,18,19,.1)' }}
                    >
                      <Image src={pg.src} alt={`${inf.proyecto}: ${pg.etiqueta}`} fill sizes="(max-width: 640px) 45vw, 200px" className="object-cover object-top" />
                    </span>
                    <span className="mt-1.5 block text-[12.5px] font-bold leading-snug" style={{ color: TEXTO }}>
                      {pg.etiqueta}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        <ul className="m-0 mt-14 grid list-none gap-3 p-0 md:grid-cols-4">
          {[
            ['Estudio de mercado', 'Comparables reales, valor del m² y a quién le vendemos, antes de fijar precios.'],
            ['Estrategia de lanzamiento', 'Precio, etapas, formas de pago y condiciones comerciales.'],
            ['Comercialización', 'Equipo de venta, difusión, pauta, cartelería y eventos de lanzamiento.'],
            ['Reporte de avance', 'Cada trimestre: ventas, ritmo, competencia y el plan para lo que sigue.'],
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

export function Equipo() {
  return (
    <section className="overflow-hidden py-16 text-white md:py-24" style={{ background: '#0B1510' }} aria-labelledby="equipo-titulo">
      <Contenedor>
        <Encabezado
          id="equipo-titulo"
          oscuro
          eyebrow="El equipo"
          titulo="Una red de relaciones personales."
          bajada="19 personas que viven y trabajan en la zona. Cada una trae su propia red: propietarios que ya confiaron en nosotros, compradores, inversores, desarrolladores, colegas y escribanías. Desde 1983, con fuerte presencia en el segmento ABC1 de Funes, Roldán y Rosario. Cuando entra tu propiedad, la ofrecemos primero dentro de esa red."
        />

        <div className="mt-10 md:mt-14">
          <RedRelaciones />
        </div>

        <ul className="m-0 mt-8 flex list-none flex-wrap justify-center gap-2 p-0 md:hidden">
          {RELACIONES.map((r) => (
            <li key={r} className="rounded-full px-3 py-1.5 text-[12.5px] font-bold" style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(159,217,185,.3)' }}>
              {r}
            </li>
          ))}
        </ul>

        {/* Colegas: trabajo en red, rondas de negocios y camaradería */}
        <div className="mt-14 overflow-hidden rounded-[24px] md:mt-20" style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(159,217,185,.18)' }}>
          <figure className="relative m-0">
            <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]">
              <Image
                src="/como-trabajamos/encuentro-colegas.webp"
                alt="Encuentro de SI INMOBILIARIA con colegas inmobiliarios de Funes y Roldán"
                fill
                sizes="(max-width: 1200px) 100vw, 1120px"
                className="ct-zoom object-cover"
                style={{ objectPosition: 'center 55%' }}
              />
            </div>
            <div aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(0deg, rgba(11,21,16,.95) 0%, rgba(11,21,16,.35) 40%, rgba(11,21,16,0) 65%)' }} />
            <figcaption className="absolute inset-x-0 bottom-0 p-5 md:p-8">
              <p className="m-0 text-[12px] font-bold uppercase tracking-[0.22em]" style={{ color: MENTA }}>
                Colegas
              </p>
              <h3 className="mt-2 max-w-[22ch] text-[26px] font-extrabold leading-[1.05] md:text-[40px]" style={{ letterSpacing: '-0.035em' }}>
                Trabajamos en red con los colegas de la zona.
              </h3>
              <p className="mt-2 text-[13px] font-semibold" style={{ color: 'rgba(255,255,255,.7)' }}>
                Encuentro con colegas de Funes y Roldán.
              </p>
            </figcaption>
          </figure>

          <div className="grid items-start gap-8 p-5 md:p-8 lg:grid-cols-[1fr_1fr] lg:gap-12">
            <div>
              <p className="m-0 text-[15.5px] leading-[1.65] md:text-[16.5px]" style={{ color: 'rgba(255,255,255,.8)' }}>
                Con las inmobiliarias de Funes y Roldán no competimos: trabajamos en red. Hacemos rondas de negocios, compartimos
                propiedades para que la tuya llegue también a sus compradores y mantenemos una camaradería de años. Más ojos y más
                compradores para tu propiedad.
              </p>
              <ul className="m-0 mt-5 grid list-none gap-2.5 p-0">
                {[
                  'Rondas de negocios: nos juntamos a cruzar propiedades y compradores.',
                  'Co-comercialización: como los lotes de Funes que vendemos junto con Rodriguez Tuttobene.',
                  'Fichas para colegas: les pasamos la propiedad lista para ofrecer a sus clientes.',
                  'Charlas Que Sí: conversamos en cámara con colegas y referentes del mercado.',
                ].map((t) => (
                  <li key={t} className="flex gap-2.5 text-[14.5px] leading-[1.55]" style={{ color: 'rgba(255,255,255,.85)' }}>
                    <span aria-hidden className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: MENTA }} />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <figure className="ct-rev m-0">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[14px]">
                  <Image src="/como-trabajamos/reunion-colegas.webp" alt="Ronda de negocios con colegas en la sala de reuniones de SI INMOBILIARIA" fill sizes="(max-width: 1024px) 50vw, 280px" className="object-cover" style={{ objectPosition: 'center 40%' }} />
                </div>
                <figcaption className="mt-2 text-[12.5px] font-semibold" style={{ color: 'rgba(255,255,255,.6)' }}>
                  Ronda de negocios en nuestra sala.
                </figcaption>
              </figure>
              <figure className="ct-rev m-0">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[14px]">
                  <Image src="/como-trabajamos/charla-colegas-rodaje.webp" alt="Grabación de Charlas Que Sí con un colega" fill sizes="(max-width: 1024px) 50vw, 280px" className="object-cover" style={{ objectPosition: '40% center' }} />
                </div>
                <figcaption className="mt-2 text-[12.5px] font-semibold" style={{ color: 'rgba(255,255,255,.6)' }}>
                  Grabando Charlas Que Sí.
                </figcaption>
              </figure>
            </div>
          </div>

          <div className="px-5 pb-6 md:px-8 md:pb-8">
          <p className="m-0 text-[12px] font-bold uppercase tracking-[0.2em]" style={{ color: MENTA }}>
            Algunos colegas con los que trabajamos
          </p>
          <ul className="m-0 mt-4 grid list-none grid-cols-1 gap-2.5 p-0 sm:grid-cols-2 lg:grid-cols-4">
            {COLEGAS.map((c) => (
              <li key={c.inmobiliaria} className="ct-rev rounded-[14px] px-4 py-3" style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)' }}>
                <span className="block text-[15px] font-extrabold leading-tight">{c.inmobiliaria}</span>
                <span className="mt-0.5 block text-[13px]" style={{ color: 'rgba(255,255,255,.65)' }}>
                  {c.personas}
                </span>
              </li>
            ))}
          </ul>
          </div>
        </div>

        <ul className="m-0 mt-12 grid list-none gap-4 p-0 md:grid-cols-3">
          {DIRECCION.map((p) => (
            <li key={p.nombre} className="ct-rev flex items-center gap-4 rounded-[18px] p-4" style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)' }}>
              <span className="relative block h-16 w-16 shrink-0 overflow-hidden rounded-full">
                <Image src={p.foto} alt={p.nombre} fill sizes="64px" className="object-cover" style={{ objectPosition: 'center 22%' }} />
              </span>
              <span>
                <span className="block text-[16.5px] font-extrabold leading-tight">{p.nombre}</span>
                <span className="block text-[13px] font-bold" style={{ color: MENTA }}>
                  {p.cargo}
                </span>
                <span className="mt-0.5 block text-[12.5px] leading-[1.45]" style={{ color: 'rgba(255,255,255,.65)' }}>
                  {conNumeros(p.detalle)}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-6 max-w-[60rem] text-center text-[13px] leading-[1.7]" style={{ color: 'rgba(255,255,255,.6)' }}>
          {AGENTES.map((a) => a.nombre).join(' · ')}
        </p>

        <div className="mt-10 grid gap-3 md:grid-cols-3 md:gap-4">
          {[
            { Icon: Users, t: 'Un agente responsable', d: 'Tu propiedad tiene un agente con nombre, apellido y celular.' },
            { Icon: MapPin, t: 'Barrio por barrio', d: `Trabajamos en ${BARRIOS.slice(0, 6).join(', ')} y muchos más.` },
            { Icon: GraduationCap, t: 'Capacitación continua', d: 'SI School: tasación, negociación, documentación y atención, con evaluaciones.' },
          ].map(({ Icon, t, d }) => (
            <div key={t} className="flex gap-4 rounded-[18px] p-5" style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)' }}>
              <Icon size={24} strokeWidth={1.7} className="shrink-0" style={{ color: MENTA }} aria-hidden />
              <p className="m-0 text-[14.5px] leading-[1.55]" style={{ color: 'rgba(255,255,255,.75)' }}>
                <strong className="text-white">{t}.</strong> {d}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <LinkFlecha href="/nosotros" claro>
            Conocé nuestra historia
          </LinkFlecha>
        </div>
      </Contenedor>
    </section>
  )
}

export function Oficinas() {
  const funes = OFICINAS[0]
  const roldan = OFICINAS.slice(1)
  return (
    <section className="py-16 md:py-24" style={{ background: FONDO }} aria-labelledby="oficinas-titulo">
      <Contenedor>
        <Encabezado
          id="oficinas-titulo"
          eyebrow="Nuestra oficina de Funes"
          titulo="Un lugar a la altura de tu propiedad."
          bajada="Sobre Hipólito Yrigoyen, la avenida principal de Funes: en el centro del corredor oeste, entre Rosario, Roldán y los barrios cerrados. Es inmobiliaria y galería de arte a la vez."
        />

        <figure className="relative m-0 mt-10 overflow-hidden rounded-[24px] shadow-xl">
          <div className="relative aspect-[16/10] md:aspect-[2000/858]">
            <Image src="/como-trabajamos/oficina/fachada.webp" alt="Fachada de la oficina de SI INMOBILIARIA en Hipólito Yrigoyen 2643, Funes" fill sizes="(max-width: 1200px) 100vw, 1120px" className="ct-zoom object-cover" />
          </div>
          <div aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(0deg, rgba(6,20,12,.78) 0%, rgba(6,20,12,0) 50%)' }} />
          <figcaption className="absolute bottom-0 left-0 right-0 flex flex-wrap items-end justify-between gap-3 p-5 text-white md:p-8">
            <span>
              <span className="block text-[12px] font-bold uppercase tracking-[0.2em]" style={{ color: MENTA }}>
                Funes
              </span>
              <span className="mt-1 block text-[22px] font-extrabold md:text-[30px]">{conNumeros(funes.direccion)}</span>
            </span>
            <span className="text-[13.5px] font-semibold" style={{ color: 'rgba(255,255,255,.85)' }}>
              Lunes a viernes {conNumeros('9 a 17')} · sábados {conNumeros('9 a 13')}
            </span>
          </figcaption>
        </figure>

        <div className="mt-4 grid gap-4 md:mt-5 md:grid-cols-2 md:gap-5">
          {[
            { src: '/como-trabajamos/oficina/sala-reuniones.webp', alt: 'Sala de reuniones de la oficina de Funes con vista al jardín', txt: 'Sala de reuniones para firmar con tranquilidad' },
            { src: '/como-trabajamos/oficina/sala-equipo.webp', alt: 'Espacio de trabajo del equipo en la oficina de Funes', txt: 'El espacio donde trabaja el equipo' },
          ].map((f) => (
            <figure key={f.src} className="ct-rev m-0">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[20px]">
                <Image src={f.src} alt={f.alt} fill sizes="(max-width: 768px) 100vw, 560px" className="object-cover" />
              </div>
              <figcaption className="mt-2.5 text-[13.5px] font-bold" style={{ color: TEXTO }}>
                {f.txt}
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-10 grid items-stretch gap-5 md:mt-12 lg:grid-cols-[1fr_1.2fr] lg:gap-8">
          <ul className="m-0 grid list-none content-start gap-3 p-0">
            {[
              { t: 'Ubicación estratégica', d: 'Sobre la avenida principal de Funes, a mano desde Rosario, Roldán y los barrios cerrados del corredor.' },
              { t: 'Inmobiliaria y galería de arte', d: 'La galería PARED funciona dentro de la oficina: ahí presentamos proyectos y hacemos eventos.' },
              { t: 'Pensada para recibir', d: 'Sala de reuniones para tasar, negociar y firmar con comodidad, fuera del ruido de un local tradicional.' },
              { t: 'Tres oficinas, una sola forma de trabajar', d: 'Funes y dos en Roldán, conectadas por HILO: cualquier oficina sabe cómo va tu propiedad.' },
            ].map((x) => (
              <li key={x.t} className="flex gap-3 rounded-[18px] bg-white p-5" style={{ border: `1px solid ${BORDE}` }}>
                <MapPin size={20} strokeWidth={1.8} className="mt-0.5 shrink-0" style={{ color: ACENTO }} aria-hidden />
                <span>
                  <span className="block text-[16px] font-extrabold">{x.t}</span>
                  <span className="mt-0.5 block text-[14px] leading-[1.55]" style={{ color: TEXTO }}>
                    {x.d}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <MapaUbicacion className="min-h-[360px] w-full overflow-hidden rounded-[20px] lg:min-h-full" />
        </div>

        <ul className="m-0 mt-10 grid list-none gap-4 p-0 md:grid-cols-2 md:gap-5">
          {roldan.map((o) => (
            <li key={o.direccion} className="grid grid-cols-[120px_1fr] overflow-hidden rounded-[18px] bg-white md:grid-cols-[160px_1fr]" style={{ border: `1px solid ${BORDE}` }}>
              <span className="relative block min-h-[120px]">
                <Image src={o.foto} alt={`Oficina de SI INMOBILIARIA en ${o.direccion}, Roldán`} fill sizes="160px" className="object-cover" />
              </span>
              <span className="block p-4 md:p-5">
                <span className="block text-[16px] font-extrabold">{o.nombre}</span>
                <span className="block text-[14px] font-semibold" style={{ color: TEXTO }}>
                  {conNumeros(o.direccion)}
                </span>
                <span className="mt-0.5 block text-[13px]" style={{ color: GRIS }}>
                  {conNumeros(o.nota)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </Contenedor>
    </section>
  )
}
