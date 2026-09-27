// /como-trabajamos — landing para propietarios: qué hace SI INMOBILIARIA con
// una propiedad desde la tasación hasta la escritura (método, producción,
// difusión, seguimiento, informe, equipo). "Vender" del menú apunta acá y
// desde acá se va al tasador de /tasaciones.
//
// Página estática (server component). Solo los botones de WhatsApp son client
// para registrar el click. Números: únicamente los ya publicados en la web.

import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Camera,
  Clapperboard,
  Drone,
  FileChartColumn,
  GraduationCap,
  Handshake,
  LayoutGrid,
  MapPin,
  Megaphone,
  MessagesSquare,
  SearchCheck,
  ShieldCheck,
  Signature,
  Users,
} from 'lucide-react'
import EncabezadoSeccion from '@/components/home/EncabezadoSeccion'
import WhatsappBoton from '@/components/como-trabajamos/WhatsappBoton'

const URL = 'https://siinmobiliaria.com/como-trabajamos'
const VERDE = '#1A5C38'
const VERDE_OSCURO = '#0E3521'
const ACENTO = '#00754A'
const TINTA = '#111213'
const GRIS = '#5b6170'
const FONDO = '#F7F8F7'

export const metadata: Metadata = {
  title: 'Cómo trabajamos con tu propiedad | SI INMOBILIARIA',
  description:
    'Tasación con datos reales, fotos profesionales, video, drone, publicación en los principales portales, pauta en Instagram y Facebook e informes al propietario. Así vende SI INMOBILIARIA en Funes, Roldán y Rosario.',
  alternates: { canonical: URL },
  openGraph: {
    title: 'Cómo trabajamos con tu propiedad | SI INMOBILIARIA',
    description:
      'Desde la tasación hasta la escritura: método, producción profesional, difusión y un equipo que te informa en cada paso.',
    url: URL,
    images: ['/og-image.jpg'],
  },
}

/* ─────────────────────────────────────────────
   CONTENIDO
───────────────────────────────────────────── */

const PASOS = [
  {
    Icon: SearchCheck,
    titulo: 'Tasación con datos reales',
    texto:
      'Visitamos la propiedad y la comparamos con lo que se vendió y lo que está publicado en tu barrio. Te damos un valor que se puede defender frente a un comprador, no un número para agradarte.',
    detalle: 'Firmada por un corredor matriculado COCIR.',
  },
  {
    Icon: Signature,
    titulo: 'Acuerdo claro, firmado desde el celular',
    texto:
      'La autorización de venta se firma de forma digital, con firma electrónica. Queda por escrito qué vamos a hacer y quién es tu agente.',
    detalle: 'Sin papeles que se pierden ni trámites en la oficina.',
  },
  {
    Icon: Camera,
    titulo: 'Producción profesional',
    texto:
      'Fotos profesionales, video del recorrido y tomas aéreas con drone. La primera impresión se da en una pantalla: la preparamos como se merece.',
    detalle: 'Coordinamos día y horario con vos.',
  },
  {
    Icon: Megaphone,
    titulo: 'Difusión en todos lados',
    texto:
      'Tu propiedad sale en nuestra web, en Zonaprop, Argenprop y Mercado Libre, en nuestras redes y en pauta paga de Instagram y Facebook. Además la cruzamos con clientes que ya están buscando algo así.',
    detalle: 'Una sola carga, todos los canales actualizados.',
  },
  {
    Icon: MessagesSquare,
    titulo: 'Cada consulta, atendida',
    texto:
      'Todas las consultas entran a nuestro sistema, se responden rápido y se filtran. A tu casa llegan interesados reales, y cada visita la acompaña un agente del equipo.',
    detalle: 'Nada queda en un chat perdido.',
  },
  {
    Icon: FileChartColumn,
    titulo: 'Te informamos con datos',
    texto:
      'Recibís informes con dónde está publicada, cuánta gente la vio y consultó, qué visitas hubo, qué opinaron y cómo está el precio frente al mercado. Con un plan de acción para lo que sigue.',
    detalle: 'Datos reales de la gestión, no promesas.',
  },
  {
    Icon: Handshake,
    titulo: 'Negociación y escritura',
    texto:
      'Analizamos cada oferta con vos, negociamos las condiciones y coordinamos la documentación con la escribanía hasta el día de la firma.',
    detalle: 'Te acompañamos hasta entregar las llaves.',
  },
]

const PRODUCCION = [
  {
    Icon: Camera,
    titulo: 'Fotos profesionales',
    texto: 'Encuadre, luz y edición profesional. Las fotos son las que hacen que alguien pida una visita.',
  },
  {
    Icon: Clapperboard,
    titulo: 'Video y reels del recorrido',
    texto: 'Videos verticales para Instagram y TikTok, y el recorrido completo para la ficha.',
  },
  {
    Icon: Drone,
    titulo: 'Tomas aéreas con drone',
    texto: 'El terreno, el entorno y el barrio desde arriba: lo que una foto a nivel del piso no muestra.',
  },
  {
    Icon: LayoutGrid,
    titulo: 'Placas y ficha propia',
    texto: 'Diseño con la identidad de SI para redes, y una ficha en nuestra web con galería, video y mapa.',
  },
]

const PORTALES = [
  { nombre: 'siinmobiliaria.com', logo: '/portal-logos/si-inmobiliaria.png', nota: 'Nuestra web' },
  { nombre: 'Zonaprop', logo: '/portal-logos/zonaprop.jpg', nota: 'Portal' },
  { nombre: 'Argenprop', logo: '/portal-logos/argenprop.jpg', nota: 'Portal' },
  { nombre: 'Mercado Libre', logo: '/portal-logos/mercadolibre.png', nota: 'Portal' },
  { nombre: 'Instagram y Facebook', logo: '/portal-logos/meta.jpg', nota: 'Redes y pauta' },
]

const REDES = [
  { red: 'Instagram', usuario: '@inmobiliaria.si', href: 'https://www.instagram.com/inmobiliaria.si' },
  { red: 'TikTok', usuario: '@si.inmobiliaria', href: 'https://www.tiktok.com/@si.inmobiliaria' },
  { red: 'Instagram', usuario: '@davidflores.pov', href: 'https://www.instagram.com/davidflores.pov' },
  { red: 'Facebook', usuario: 'SI INMOBILIARIA', href: 'https://www.facebook.com/inmobiliariaippoliti' },
]

const INFORME = [
  { titulo: 'Dónde está publicada', texto: 'Cada portal y red, con su link vivo.' },
  { titulo: 'Cuánta gente la vio y consultó', texto: 'Por canal, y comparado con el período anterior.' },
  { titulo: 'Visitas y qué opinaron', texto: 'Lo que dicen los interesados, sin filtro.' },
  { titulo: 'Publicidad activa', texto: 'El anuncio que está corriendo y su alcance.' },
  { titulo: 'Tu precio frente al mercado', texto: 'Contra propiedades comparables de la zona.' },
  { titulo: 'Plan de acción', texto: 'Qué hacemos en el próximo período.' },
]

const EQUIPO_FOTOS = [
  'mauro-matteucci', 'gino-pecchenino', 'leticia-alexenicer', 'carolina-echen', 'aldana-ruiz',
  'mariana-orlate', 'micaela-gonzalez', 'gisela-ramallo', 'maria-jose-espilocin', 'lucia-wilson',
  'marisa-benitez', 'sabrina-rogani', 'eliana-rojas', 'jeremias-caraballo', 'florencia-acquarone',
]

const OFICINAS = [
  { nombre: 'Funes', direccion: 'Hipólito Yrigoyen 2643', nota: 'Inmobiliaria + galería de arte' },
  { nombre: 'Roldán', direccion: 'Primero de Mayo 258', nota: 'Casa matriz, desde 1983' },
  { nombre: 'Roldán', direccion: 'Catamarca 775', nota: 'Sede comercial' },
]

const COMPROMISOS = [
  {
    Icon: ShieldCheck,
    titulo: 'Te decimos el precio real',
    texto: 'Aunque no sea el número que querés escuchar. Una tasación inflada solo hace perder tiempo.',
  },
  {
    Icon: Users,
    titulo: 'Un agente con nombre y apellido',
    texto: 'Sabés quién lleva tu propiedad y tenés su contacto directo.',
  },
  {
    Icon: FileChartColumn,
    titulo: 'Información constante',
    texto: 'No tenés que llamar para saber cómo va: te lo contamos, con datos.',
  },
  {
    Icon: MapPin,
    titulo: 'Conocemos la zona',
    texto: 'Trabajamos en Funes, Roldán y Rosario desde 1983. Sabemos qué se vende y a cuánto.',
  },
]

const FAQ = [
  {
    q: '¿Cómo empiezo?',
    a: 'Pedí la tasación desde la web o escribinos por WhatsApp. Un tasador del equipo te contacta por WhatsApp en menos de 24 horas para coordinar la visita a la propiedad.',
  },
  {
    q: '¿Qué producción hacen con mi propiedad?',
    a: 'Fotos profesionales, video del recorrido y reels para redes, y tomas aéreas con drone. Con ese material armamos la ficha en nuestra web, las publicaciones en portales, las placas para redes y los anuncios pagos.',
  },
  {
    q: '¿Dónde publican mi propiedad?',
    a: 'En siinmobiliaria.com, Zonaprop, Argenprop y Mercado Libre, en nuestras redes de Instagram, TikTok y Facebook, y en pauta paga de Instagram y Facebook que lleva al interesado directo a una conversación por WhatsApp.',
  },
  {
    q: '¿Cómo me entero de cómo va la venta?',
    a: 'Recibís informes con la difusión, las consultas y visitas, lo que opinan los interesados y cómo está el precio frente a propiedades comparables, con un plan de acción. Además tu agente te avisa ante cada novedad importante, como una visita o una oferta.',
  },
  {
    q: '¿Puedo seguir viviendo en la casa mientras se vende?',
    a: 'Sí. Las visitas se coordinan con vos en días y horarios acordados, y siempre van acompañadas por un agente del equipo.',
  },
  {
    q: '¿En qué zonas trabajan?',
    a: 'En Funes, Roldán, Fisherton y Rosario, incluidos los barrios cerrados del corredor oeste. Tenemos tres oficinas: una en Funes y dos en Roldán.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      '@id': `${URL}#service`,
      name: 'Comercialización de propiedades',
      serviceType: 'Venta de inmuebles',
      url: URL,
      provider: { '@id': 'https://siinmobiliaria.com/#organization' },
      areaServed: ['Funes', 'Roldán', 'Fisherton', 'Rosario'].map((name) => ({ '@type': 'City', name })),
      description:
        'Tasación, producción fotográfica y audiovisual, difusión en portales y redes, pauta en Meta, seguimiento de consultas e informes al propietario hasta la escritura.',
    },
    {
      '@type': 'FAQPage',
      '@id': `${URL}#preguntas`,
      mainEntity: FAQ.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    },
  ],
}

/* ─────────────────────────────────────────────
   PIEZAS
───────────────────────────────────────────── */

/** Envuelve cada tira de dígitos en Poppins tabular (regla: números en Poppins). */
function conNumeros(texto: string) {
  return texto.split(/(\d+)/).map((t, i) => (i % 2 ? <span key={i} className="font-numeric">{t}</span> : t))
}

function BotonTasar({ children = 'Quiero tasar mi propiedad' }: { children?: React.ReactNode }) {
  return (
    <Link
      href="/tasaciones"
      className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full px-6 font-raleway text-[15px] font-bold text-white transition-opacity duration-200 hover:opacity-90"
      style={{ background: ACENTO, textDecoration: 'none' }}
    >
      {children}
      <ArrowRight size={18} strokeWidth={2.2} aria-hidden />
    </Link>
  )
}

function Contenedor({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1200px] px-4 sm:px-6 md:px-10 ${className}`}>{children}</div>
}

/* ─────────────────────────────────────────────
   PÁGINA
───────────────────────────────────────────── */

export default function ComoTrabajamosPage() {
  return (
    <main className="bg-white font-raleway" style={{ color: TINTA }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── PORTADA ─────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: VERDE_OSCURO }}>
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(70% 80% at 0% 100%, rgba(0,117,74,.45) 0%, rgba(0,117,74,0) 70%), radial-gradient(50% 60% at 100% 0%, rgba(26,92,56,.6) 0%, rgba(26,92,56,0) 70%)',
          }}
        />
        <Contenedor className="relative grid items-center gap-10 py-14 md:py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-24">
          <div className="text-white">
            <p className="m-0 text-[12px] font-bold uppercase tracking-[0.24em]" style={{ color: '#9FD9B9' }}>
              Para propietarios
            </p>
            <h1
              className="mt-4 font-extrabold"
              style={{ fontSize: 'clamp(2.3rem, 5vw, 4.1rem)', lineHeight: 1.03, letterSpacing: '-0.035em' }}
            >
              Así trabajamos con tu propiedad.
            </h1>
            <p className="mt-6 max-w-[34rem] text-[17px] font-medium leading-[1.65] md:text-[18px]" style={{ color: 'rgba(255,255,255,.82)' }}>
              Desde la tasación hasta la escritura: un método claro, producción profesional, difusión en todos
              los canales y un equipo que te cuenta cómo va, con datos. Lo hacemos en Funes, Roldán y Rosario
              desde <span className="font-numeric">1983</span>.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <BotonTasar />
              <WhatsappBoton ubicacion="portada" />
            </div>

            <dl className="mt-11 grid grid-cols-3 gap-4 border-t pt-6 sm:max-w-[30rem]" style={{ borderColor: 'rgba(255,255,255,.16)' }}>
              {[
                { n: '1983', l: 'Desde' },
                { n: '3', l: 'Oficinas' },
                { n: '2', l: 'Generaciones' },
              ].map((s) => (
                <div key={s.l}>
                  <dd className="m-0 font-numeric text-[28px] font-bold leading-none md:text-[32px]">{s.n}</dd>
                  <dt className="mt-2 text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: 'rgba(255,255,255,.6)' }}>
                    {s.l}
                  </dt>
                </div>
              ))}
            </dl>
          </div>

          {/* Collage: foto profesional + toma aérea */}
          <div className="relative mx-auto w-full max-w-[460px] lg:max-w-none">
            <div className="relative ml-auto aspect-[4/5] w-[86%] overflow-hidden rounded-[26px] shadow-2xl">
              <Image
                src="/casa-cadaques-openhouse.webp"
                alt="Casa en venta fotografiada por el equipo de SI INMOBILIARIA al atardecer"
                fill
                priority
                sizes="(max-width: 1024px) 80vw, 460px"
                className="object-cover"
                style={{ objectPosition: 'center 62%' }}
              />
              <span
                className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold text-white"
                style={{ background: 'rgba(14,53,33,.72)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
              >
                <Camera size={14} aria-hidden /> Foto profesional
              </span>
            </div>
            <div
              className="absolute bottom-[-18px] left-0 aspect-[4/3] w-[52%] overflow-hidden rounded-[20px] border-4 shadow-2xl"
              style={{ borderColor: VERDE_OSCURO }}
            >
              <Image
                src="/barrios/kentucky/hero-cover.webp"
                alt="Toma aérea con drone de un club de campo en Funes"
                fill
                sizes="(max-width: 1024px) 45vw, 260px"
                className="object-cover"
              />
              <span
                className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold text-white"
                style={{ background: 'rgba(14,53,33,.72)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
              >
                <Drone size={13} aria-hidden /> Drone
              </span>
            </div>
          </div>
        </Contenedor>
      </section>

      {/* ── EL MÉTODO ───────────────────────────── */}
      <section className="py-16 md:py-24" aria-labelledby="metodo-titulo">
        <Contenedor className="grid gap-10 lg:grid-cols-[minmax(0,380px)_1fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="m-0 text-[12px] font-bold uppercase tracking-[0.22em]" style={{ color: ACENTO }}>
              El método
            </p>
            <h2
              id="metodo-titulo"
              className="mt-2.5 font-extrabold"
              style={{ fontSize: 'clamp(28px, 3.3vw, 44px)', lineHeight: 1.06, letterSpacing: '-0.035em' }}
            >
              Qué pasa con tu propiedad, paso a paso.
            </h2>
            <p className="mt-4 text-[16px] font-semibold leading-[1.55]" style={{ color: GRIS }}>
              Siete etapas, siempre las mismas, para que sepas en todo momento en qué punto está tu venta y qué
              viene después.
            </p>
          </div>

          <ol className="relative m-0 list-none p-0">
            {PASOS.map(({ Icon, titulo, texto, detalle }, i) => (
              <li key={titulo} className="relative grid grid-cols-[52px_1fr] gap-4 pb-9 last:pb-0 md:grid-cols-[64px_1fr] md:gap-6">
                {i < PASOS.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute left-[25px] top-[56px] bottom-[4px] w-px md:left-[31px] md:top-[68px]"
                    style={{ background: 'rgba(26,92,56,.22)' }}
                  />
                )}
                <div
                  className="flex h-[52px] w-[52px] items-center justify-center rounded-full md:h-[64px] md:w-[64px]"
                  style={{ background: i === 0 ? VERDE : '#EAF3EE', color: i === 0 ? '#fff' : VERDE }}
                >
                  <Icon size={24} strokeWidth={1.7} aria-hidden />
                </div>
                <div className="pt-1 md:pt-2">
                  <p className="m-0 font-numeric text-[13px] font-semibold" style={{ color: ACENTO }}>
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-1 text-[20px] font-extrabold leading-tight md:text-[22px]" style={{ letterSpacing: '-0.02em' }}>
                    {titulo}
                  </h3>
                  <p className="mt-2 text-[15.5px] leading-[1.65]" style={{ color: '#3d4247' }}>
                    {texto}
                  </p>
                  <p className="mt-2 text-[13.5px] font-bold" style={{ color: VERDE }}>
                    {detalle}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Contenedor>
      </section>

      {/* ── PRODUCCIÓN ──────────────────────────── */}
      <section className="py-16 md:py-24" style={{ background: FONDO }} aria-labelledby="produccion-titulo">
        <Contenedor>
          <EncabezadoSeccion
            eyebrow="Producción"
            titulo={<span id="produccion-titulo">Tu propiedad, mostrada como se merece.</span>}
            bajada="Hoy la primera visita es en una pantalla. Por eso cada propiedad que tomamos pasa por producción antes de salir a la calle."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-[1.35fr_1fr] md:gap-5">
            {/* Foto aérea grande */}
            <figure className="relative m-0 min-h-[300px] overflow-hidden rounded-[22px] md:min-h-[460px]">
              <Image
                src="/barrios/san-sebastian/hero-cover.webp"
                alt="Toma aérea con drone de un barrio cerrado, con club house y pileta"
                fill
                sizes="(max-width: 768px) 100vw, 680px"
                className="object-cover"
              />
              <div aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(0deg, rgba(10,30,19,.72) 0%, rgba(10,30,19,0) 45%)' }} />
              <figcaption className="absolute bottom-0 left-0 right-0 p-5 text-white md:p-7">
                <span className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.18em]" style={{ color: '#9FD9B9' }}>
                  <Drone size={14} aria-hidden /> Tomas aéreas
                </span>
                <p className="mt-1.5 max-w-[26rem] text-[18px] font-bold leading-snug md:text-[21px]">
                  El entorno también vende: el barrio, los accesos y los espacios verdes, desde arriba.
                </p>
              </figcaption>
            </figure>

            {/* Teléfono con reel */}
            <div className="flex items-center justify-center rounded-[22px] bg-white px-6 py-8 md:py-6" style={{ border: '1px solid rgba(17,18,19,.07)' }}>
              <div className="flex flex-col items-center gap-5 sm:flex-row md:flex-col lg:flex-row">
                <div
                  className="relative aspect-[9/19] w-[170px] shrink-0 overflow-hidden rounded-[30px] border-[6px] shadow-xl"
                  style={{ borderColor: TINTA, background: TINTA }}
                >
                  <video
                    className="absolute inset-0 h-full w-full object-cover"
                    src="/videos/portada-viva-mobile.mp4"
                    poster="/images/hero/portada-viva-mobile.webp"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="none"
                    aria-label="Ejemplo de video vertical de una propiedad"
                  />
                  <span
                    aria-hidden
                    className="absolute left-1/2 top-2 h-[14px] w-[54px] -translate-x-1/2 rounded-full"
                    style={{ background: TINTA }}
                  />
                </div>
                <div className="max-w-[15rem] text-center sm:text-left md:text-center lg:text-left">
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.18em]" style={{ color: ACENTO }}>
                    <Clapperboard size={14} aria-hidden /> Video y reels
                  </span>
                  <p className="mt-1.5 text-[17px] font-bold leading-snug">
                    Videos verticales pensados para Instagram y TikTok, donde hoy busca la gente.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <ul className="m-0 mt-5 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4 md:gap-5">
            {PRODUCCION.map(({ Icon, titulo, texto }) => (
              <li key={titulo} className="rounded-[18px] bg-white p-5 md:p-6" style={{ border: '1px solid rgba(17,18,19,.07)' }}>
                <Icon size={24} strokeWidth={1.7} style={{ color: VERDE }} aria-hidden />
                <h3 className="mt-3 text-[17px] font-extrabold leading-tight">{titulo}</h3>
                <p className="mt-1.5 text-[14.5px] leading-[1.55]" style={{ color: GRIS }}>
                  {texto}
                </p>
              </li>
            ))}
          </ul>
        </Contenedor>
      </section>

      {/* ── DIFUSIÓN Y REDES ────────────────────── */}
      <section className="py-16 md:py-24" aria-labelledby="difusion-titulo">
        <Contenedor>
          <EncabezadoSeccion
            eyebrow="Difusión"
            titulo={<span id="difusion-titulo">Dónde se va a ver tu propiedad.</span>}
            bajada="Cargamos la propiedad una vez y sale en todos los canales a la vez. Si cambia el precio o una foto, se actualiza en todos."
          />

          <ul className="m-0 mt-10 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 lg:grid-cols-5 md:gap-4">
            {PORTALES.map((p) => (
              <li
                key={p.nombre}
                className="flex flex-col items-center gap-3 rounded-[18px] px-3 py-6 text-center"
                style={{ background: FONDO }}
              >
                <span className="relative h-14 w-14 overflow-hidden rounded-[14px] bg-white shadow-sm">
                  <Image src={p.logo} alt={`Logo de ${p.nombre}`} fill sizes="56px" className="object-contain p-1" />
                </span>
                <span>
                  <span className="block text-[14.5px] font-extrabold leading-tight">{p.nombre}</span>
                  <span className="mt-0.5 block text-[12.5px] font-semibold" style={{ color: GRIS }}>
                    {p.nota}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-5 grid gap-4 md:mt-6 md:grid-cols-2 md:gap-5">
            {/* Pauta */}
            <div className="rounded-[22px] p-6 text-white md:p-8" style={{ background: VERDE }}>
              <Megaphone size={26} strokeWidth={1.7} aria-hidden style={{ color: '#9FD9B9' }} />
              <h3 className="mt-4 text-[22px] font-extrabold leading-tight md:text-[24px]" style={{ letterSpacing: '-0.02em' }}>
                Pauta paga en Instagram y Facebook
              </h3>
              <p className="mt-3 text-[15.5px] leading-[1.65]" style={{ color: 'rgba(255,255,255,.84)' }}>
                Invertimos en anuncios segmentados para quienes buscan en Funes, Roldán y Rosario. El anuncio lleva
                directo a una conversación por WhatsApp con nosotros: el que escribe ya está interesado.
              </p>
              <p className="mt-4 text-[15.5px] leading-[1.65]" style={{ color: 'rgba(255,255,255,.84)' }}>
                Además, cruzamos tu propiedad con las búsquedas activas de clientes que ya nos pidieron algo parecido.
              </p>
            </div>

            {/* Redes */}
            <div className="rounded-[22px] p-6 md:p-8" style={{ background: FONDO }}>
              <Users size={26} strokeWidth={1.7} aria-hidden style={{ color: VERDE }} />
              <h3 className="mt-4 text-[22px] font-extrabold leading-tight md:text-[24px]" style={{ letterSpacing: '-0.02em' }}>
                Redes con contenido propio
              </h3>
              <p className="mt-3 text-[15.5px] leading-[1.65]" style={{ color: '#3d4247' }}>
                Publicamos propiedades, recorridos y datos del mercado de la zona. En nuestro blog y en los informes
                de mercado analizamos qué pasa con los precios, para que decidas con información.
              </p>
              <ul className="m-0 mt-5 grid list-none gap-2 p-0 sm:grid-cols-2">
                {REDES.map((r) => (
                  <li key={r.usuario}>
                    <a
                      href={r.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-[48px] items-center justify-between gap-2 rounded-xl bg-white px-4 py-2.5 transition-colors duration-200 hover:bg-[#EAF3EE]"
                      style={{ textDecoration: 'none', color: TINTA, border: '1px solid rgba(17,18,19,.07)' }}
                    >
                      <span>
                        <span className="block text-[11.5px] font-bold uppercase tracking-[0.12em]" style={{ color: GRIS }}>
                          {r.red}
                        </span>
                        <span className="block text-[14.5px] font-bold">{r.usuario}</span>
                      </span>
                      <ArrowRight size={16} aria-hidden style={{ color: VERDE }} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Contenedor>
      </section>

      {/* ── INFORME AL PROPIETARIO ──────────────── */}
      <section className="py-16 md:py-24" style={{ background: FONDO }} aria-labelledby="informe-titulo">
        <Contenedor className="grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          <div>
            <EncabezadoSeccion
              eyebrow="Seguimiento"
              titulo={<span id="informe-titulo">Nunca te vas a quedar preguntando cómo va.</span>}
              bajada="Todas las consultas, visitas y respuestas quedan registradas en nuestro sistema. Con eso armamos el informe que recibís: datos reales de la gestión de tu propiedad."
            />
            <ul className="m-0 mt-8 grid list-none gap-x-6 gap-y-4 p-0 sm:grid-cols-2">
              {INFORME.map((it) => (
                <li key={it.titulo} className="flex gap-3">
                  <span aria-hidden className="mt-[7px] h-2 w-2 shrink-0 rounded-full" style={{ background: ACENTO }} />
                  <span>
                    <span className="block text-[15.5px] font-extrabold leading-snug">{it.titulo}</span>
                    <span className="block text-[14px] leading-[1.5]" style={{ color: GRIS }}>
                      {it.texto}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Maqueta del informe (ilustrativa, sin cifras) */}
          <figure className="m-0">
            <div className="overflow-hidden rounded-[22px] bg-white shadow-xl" style={{ border: '1px solid rgba(17,18,19,.06)' }}>
              <div className="relative h-[150px] md:h-[170px]">
                <Image
                  src="/casa-cadaques-openhouse.webp"
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 560px"
                  className="object-cover"
                  style={{ objectPosition: 'center 58%' }}
                />
                <div aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(14,53,33,.92) 0%, rgba(14,53,33,.55) 60%, rgba(14,53,33,.2) 100%)' }} />
                <div className="absolute inset-0 flex flex-col justify-end p-5 text-white md:p-6">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: '#9FD9B9' }}>
                    Informe al propietario
                  </span>
                  <span className="mt-1 text-[20px] font-extrabold leading-tight md:text-[22px]">Así va tu propiedad</span>
                </div>
              </div>

              <div className="grid gap-4 p-5 md:p-6">
                <div>
                  <p className="m-0 text-[12px] font-bold uppercase tracking-[0.14em]" style={{ color: GRIS }}>
                    Difusión activa
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {PORTALES.map((p) => (
                      <span key={p.nombre} className="relative h-9 w-9 overflow-hidden rounded-[10px] bg-white" style={{ border: '1px solid rgba(17,18,19,.08)' }}>
                        <Image src={p.logo} alt="" fill sizes="36px" className="object-contain p-0.5" />
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="m-0 text-[12px] font-bold uppercase tracking-[0.14em]" style={{ color: GRIS }}>
                    Consultas por canal
                  </p>
                  <div className="mt-3 grid gap-2" aria-hidden>
                    {[
                      { l: 'Portales', w: '86%' },
                      { l: 'Instagram y Facebook', w: '64%' },
                      { l: 'Web SI', w: '48%' },
                    ].map((b) => (
                      <div key={b.l} className="grid grid-cols-[120px_1fr] items-center gap-3 text-[12.5px] font-semibold md:grid-cols-[150px_1fr]" style={{ color: '#3d4247' }}>
                        <span>{b.l}</span>
                        <span className="h-2.5 rounded-full" style={{ background: '#EAF3EE' }}>
                          <span className="block h-full rounded-full" style={{ width: b.w, background: ACENTO }} />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[14px] p-4" style={{ background: '#EAF3EE' }}>
                  <p className="m-0 text-[12px] font-bold uppercase tracking-[0.14em]" style={{ color: VERDE }}>
                    Qué dicen los interesados
                  </p>
                  <p className="mt-1.5 text-[14px] font-semibold italic leading-snug" style={{ color: '#2b3a31' }}>
                    “Les encantó el jardín y la luz del living. Preguntaron por la distancia al colegio.”
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-[14px] p-4 text-white" style={{ background: VERDE }}>
                  <span>
                    <span className="block text-[12px] font-bold uppercase tracking-[0.14em]" style={{ color: '#9FD9B9' }}>
                      Próximo paso
                    </span>
                    <span className="block text-[14.5px] font-bold">Plan de acción del próximo período</span>
                  </span>
                  <ArrowRight size={18} aria-hidden />
                </div>
              </div>
            </div>
            <figcaption className="mt-3 text-center text-[12.5px] font-semibold" style={{ color: GRIS }}>
              Ejemplo ilustrativo del formato del informe.
            </figcaption>
          </figure>
        </Contenedor>
      </section>

      {/* ── EQUIPO ──────────────────────────────── */}
      <section className="py-16 md:py-24" aria-labelledby="equipo-titulo">
        <Contenedor>
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
            <div className="relative aspect-[5/4] overflow-hidden rounded-[22px]">
              <Image
                src="/familia-flores.webp"
                alt="Susana Ippoliti, David Flores y Laura Flores, dirección de SI INMOBILIARIA"
                fill
                sizes="(max-width: 1024px) 100vw, 560px"
                className="object-cover"
                style={{ objectPosition: 'center 25%' }}
              />
            </div>
            <div>
              <EncabezadoSeccion
                eyebrow="El equipo"
                titulo={<span id="equipo-titulo">Personas que conocen la zona y a sus clientes.</span>}
                bajada="Una empresa familiar de dos generaciones, con un equipo propio de agentes en tres oficinas."
              />
              <ul className="m-0 mt-7 grid list-none gap-3 p-0">
                {[
                  { n: 'Susana Ippoliti', c: 'Fundadora', m: '0559 COCIR' },
                  { n: 'David Flores', c: 'Corredor inmobiliario · Funes', m: '0621 COCIR' },
                  { n: 'Laura Flores', c: 'Corredora inmobiliaria · Roldán', m: '' },
                ].map((p) => (
                  <li key={p.n} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-b pb-3" style={{ borderColor: 'rgba(17,18,19,.08)' }}>
                    <span>
                      <span className="text-[16.5px] font-extrabold">{p.n}</span>
                      <span className="ml-2 text-[14px] font-semibold" style={{ color: GRIS }}>
                        {p.c}
                      </span>
                    </span>
                    {p.m && (
                      <span className="text-[13px] font-bold" style={{ color: VERDE }}>
                        Matrícula {conNumeros(p.m)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex items-center">
                <div className="flex -space-x-3">
                  {EQUIPO_FOTOS.slice(0, 9).map((slug) => (
                    <span key={slug} className="relative h-11 w-11 overflow-hidden rounded-full border-[3px] border-white bg-neutral-200">
                      <Image src={`/team/${slug}.jpg`} alt="" fill sizes="44px" className="object-cover" />
                    </span>
                  ))}
                </div>
                <span className="ml-3 text-[14px] font-bold" style={{ color: '#3d4247' }}>
                  y todo el equipo de agentes
                </span>
              </div>

              <div className="mt-7 flex gap-4 rounded-[18px] p-5" style={{ background: FONDO }}>
                <GraduationCap size={26} strokeWidth={1.7} className="shrink-0" style={{ color: VERDE }} aria-hidden />
                <p className="m-0 text-[14.5px] leading-[1.6]" style={{ color: '#3d4247' }}>
                  <strong style={{ color: TINTA }}>Capacitación continua.</strong> El equipo se forma en SI School,
                  nuestra escuela interna: tasación, negociación, documentación y atención al cliente, con evaluaciones.
                </p>
              </div>

              <Link
                href="/nosotros"
                className="mt-6 inline-flex min-h-[44px] items-center gap-2 text-[15px] font-bold"
                style={{ color: VERDE, textDecoration: 'none' }}
              >
                Conocé nuestra historia y a todo el equipo <ArrowRight size={17} aria-hidden />
              </Link>
            </div>
          </div>

          <ul className="m-0 mt-12 grid list-none gap-3 p-0 md:grid-cols-3 md:gap-4">
            {OFICINAS.map((o) => (
              <li key={o.direccion} className="flex gap-3 rounded-[18px] p-5" style={{ background: FONDO }}>
                <MapPin size={20} strokeWidth={1.8} className="mt-0.5 shrink-0" style={{ color: ACENTO }} aria-hidden />
                <span>
                  <span className="block text-[16px] font-extrabold">{o.nombre}</span>
                  <span className="block text-[14.5px] font-semibold" style={{ color: '#3d4247' }}>
                    {conNumeros(o.direccion)}
                  </span>
                  <span className="block text-[13px]" style={{ color: GRIS }}>
                    {conNumeros(o.nota)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Contenedor>
      </section>

      {/* ── COMPROMISOS ─────────────────────────── */}
      <section className="py-16 text-white md:py-24" style={{ background: VERDE_OSCURO }} aria-labelledby="compromisos-titulo">
        <Contenedor>
          <p className="m-0 text-[12px] font-bold uppercase tracking-[0.22em]" style={{ color: '#9FD9B9' }}>
            Nuestros compromisos
          </p>
          <h2
            id="compromisos-titulo"
            className="mt-2.5 max-w-[36rem] font-extrabold"
            style={{ fontSize: 'clamp(28px, 3.3vw, 44px)', lineHeight: 1.06, letterSpacing: '-0.035em' }}
          >
            Lo que podés esperar de nosotros, siempre.
          </h2>
          <ul className="m-0 mt-10 grid list-none gap-8 p-0 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
            {COMPROMISOS.map(({ Icon, titulo, texto }) => (
              <li key={titulo}>
                <span className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: 'rgba(159,217,185,.14)' }}>
                  <Icon size={22} strokeWidth={1.7} style={{ color: '#9FD9B9' }} aria-hidden />
                </span>
                <h3 className="mt-4 text-[18px] font-extrabold leading-tight">{titulo}</h3>
                <p className="mt-2 text-[15px] leading-[1.6]" style={{ color: 'rgba(255,255,255,.78)' }}>
                  {conNumeros(texto)}
                </p>
              </li>
            ))}
          </ul>
        </Contenedor>
      </section>

      {/* ── PREGUNTAS ───────────────────────────── */}
      <section className="py-16 md:py-24" aria-labelledby="faq-como-trabajamos">
        <Contenedor className="max-w-[860px]">
          <EncabezadoSeccion
            eyebrow="Preguntas frecuentes"
            titulo={<span id="faq-como-trabajamos">Lo que nos preguntan los propietarios.</span>}
          />
          <div className="mt-8 grid gap-3">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="group rounded-[16px] px-5 py-1" style={{ background: FONDO }}>
                <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-4 text-[16.5px] font-extrabold [&::-webkit-details-marker]:hidden">
                  {q}
                  <span
                    aria-hidden
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[18px] leading-none transition-transform duration-200 group-open:rotate-45"
                    style={{ background: '#fff', color: VERDE }}
                  >
                    +
                  </span>
                </summary>
                <p className="m-0 pb-5 text-[15.5px] leading-[1.65]" style={{ color: '#3d4247' }}>
                  {conNumeros(a)}
                </p>
              </details>
            ))}
          </div>
        </Contenedor>
      </section>

      {/* ── CIERRE ──────────────────────────────── */}
      <section className="px-3 pb-10 md:px-6 md:pb-16">
        <div className="relative mx-auto max-w-[1240px] overflow-hidden rounded-[28px] px-6 py-14 text-center text-white md:py-20" style={{ background: VERDE }}>
          <div
            aria-hidden
            className="absolute inset-0"
            style={{ background: 'radial-gradient(60% 90% at 50% 120%, rgba(0,117,74,.7) 0%, rgba(0,117,74,0) 70%)' }}
          />
          <div className="relative mx-auto max-w-[40rem]">
            <h2 className="m-0 font-extrabold" style={{ fontSize: 'clamp(28px, 3.6vw, 46px)', lineHeight: 1.06, letterSpacing: '-0.035em' }}>
              ¿Empezamos por saber cuánto vale?
            </h2>
            <p className="mt-4 text-[16.5px] font-medium leading-[1.6]" style={{ color: 'rgba(255,255,255,.85)' }}>
              Pedí la tasación y un tasador del equipo te escribe por WhatsApp para coordinar la visita. Sin compromiso.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/tasaciones"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-white px-6 text-[15px] font-bold transition-opacity duration-200 hover:opacity-90"
                style={{ color: VERDE, textDecoration: 'none' }}
              >
                Quiero tasar mi propiedad <ArrowRight size={18} strokeWidth={2.2} aria-hidden />
              </Link>
              <WhatsappBoton ubicacion="cierre" />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
