// /como-trabajamos — presentación para propietarios: qué hace SI INMOBILIARIA
// con una propiedad desde la tasación hasta la escritura. El equipo la muestra
// en el televisor de la oficina o la manda por link.
//
// LINK PRIVADO (por ahora): no está en el menú, el footer ni el sitemap, y
// lleva noindex. Solo la ve quien recibe el link.
//
// Todo lo que se muestra es material real (fotos, videos, notas, cifras
// públicas); ver components/como-trabajamos/datos.ts. Página estática: solo
// los videos y los botones de WhatsApp son client.

import type { Metadata } from 'next'
import {
  Camera,
  Drone,
  FileChartColumn,
  Handshake,
  MapPin,
  Megaphone,
  MessagesSquare,
  SearchCheck,
  ShieldCheck,
  Signature,
  Users,
} from 'lucide-react'
import WhatsappBoton from '@/components/como-trabajamos/WhatsappBoton'
import { VideoVivo } from '@/components/como-trabajamos/Medios'
import { Vendidas } from '@/components/como-trabajamos/Resultados'
import { Aereas, EquipoTecnico, Fotografia, Reels, Videotours } from '@/components/como-trabajamos/Produccion'
import { CharlasQueSi, ContenidoIA, EmailMarketing, PortalesYPauta, Redes } from '@/components/como-trabajamos/Difusion'
import { CalleYEventos, Desarrolladores, Equipo, Hilo, InformeReal, Oficinas, Prensa } from '@/components/como-trabajamos/Respaldo'
import {
  ACENTO,
  BotonTasar,
  Capitulo,
  EstilosMovimiento,
  Contenedor,
  Encabezado,
  FONDO,
  GRIS,
  MENTA,
  TEXTO,
  TINTA,
  VERDE,
  VERDE_OSCURO,
  VERDE_SUAVE,
  conNumeros,
} from '@/components/como-trabajamos/ui'

const URL = 'https://siinmobiliaria.com/como-trabajamos'

export const metadata: Metadata = {
  title: 'Cómo trabajamos con tu propiedad | SI INMOBILIARIA',
  description:
    'Fotos profesionales, drone, videotours, reels, pauta en Instagram y Facebook, portales, email marketing, prensa local, tecnología propia e informes al propietario. Así vende SI INMOBILIARIA en Funes, Roldán y Rosario.',
  alternates: { canonical: URL },
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Cómo trabajamos con tu propiedad | SI INMOBILIARIA',
    description:
      'Desde la tasación hasta la escritura: producción profesional, difusión en todos los canales y un equipo de 19 personas que te informa en cada paso.',
    url: URL,
    images: ['/og-image.jpg'],
  },
}

/* ─────────────────────────────────────────────
   CONTENIDO
───────────────────────────────────────────── */

const NUMEROS = [
  { n: '1983', l: 'trabajando en la zona' },
  { n: '19', l: 'personas en el equipo' },
  { n: '3', l: 'oficinas en Funes y Roldán' },
  { n: '+250', l: 'propiedades publicadas' },
  { n: '+85', l: 'con videotour propio' },
  { n: '+25 mil', l: 'seguidores en redes' },
]

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
    texto: 'La autorización de venta se firma de forma digital, con firma electrónica. Queda por escrito qué vamos a hacer y quién es tu agente.',
    detalle: 'Sin papeles que se pierden ni trámites en la oficina.',
  },
  {
    Icon: Camera,
    titulo: 'Producción profesional',
    texto: 'Fotos profesionales, videotour, reels verticales y tomas aéreas con drone, en una misma visita coordinada con vos.',
    detalle: 'Con equipo propio de marketing y producción.',
  },
  {
    Icon: Megaphone,
    titulo: 'Difusión en todos los canales',
    texto:
      'Nuestra web, Zonaprop, Argenprop, Mercado Libre, Instagram, TikTok, YouTube, email marketing y pauta paga en Meta. Además la ofrecemos a los clientes que ya buscan algo así.',
    detalle: 'Una sola carga, todos los canales actualizados.',
  },
  {
    Icon: MessagesSquare,
    titulo: 'Cada consulta, atendida',
    texto: 'Todas las consultas entran a HILO, nuestro sistema, se responden rápido y se filtran. A tu casa llegan interesados reales, y cada visita la acompaña un agente.',
    detalle: 'Nada queda en un chat perdido.',
  },
  {
    Icon: FileChartColumn,
    titulo: 'Te informamos con datos',
    texto:
      'Recibís informes con dónde está publicada, cuánta gente la vio y consultó, qué visitas hubo, qué opinaron y cómo está el precio frente al mercado. Con un plan de acción.',
    detalle: 'Datos reales de la gestión, no promesas.',
  },
  {
    Icon: Handshake,
    titulo: 'Negociación y escritura',
    texto: 'Analizamos cada oferta con vos, negociamos las condiciones y coordinamos la documentación con la escribanía hasta el día de la firma.',
    detalle: 'Te acompañamos hasta entregar las llaves.',
  },
]

const INFORME = [
  { titulo: 'Dónde está publicada', texto: 'Cada portal y red, con su link vivo.' },
  { titulo: 'Cuánta gente la vio y consultó', texto: 'Por canal, y comparado con el período anterior.' },
  { titulo: 'Visitas y qué opinaron', texto: 'Lo que dicen los interesados, sin filtro.' },
  { titulo: 'Publicidad activa', texto: 'El anuncio que está corriendo y su alcance.' },
  { titulo: 'Tu precio frente al mercado', texto: 'Contra propiedades comparables de la zona.' },
  { titulo: 'Plan de acción', texto: 'Qué hacemos en el próximo período.' },
]


const COMPROMISOS = [
  { Icon: ShieldCheck, titulo: 'Te decimos el precio real', texto: 'Aunque no sea el número que querés escuchar. Una tasación inflada solo hace perder tiempo.' },
  { Icon: Users, titulo: 'Un agente con nombre y apellido', texto: 'Sabés quién lleva tu propiedad y tenés su contacto directo.' },
  { Icon: FileChartColumn, titulo: 'Información constante', texto: 'No tenés que llamar para saber cómo va: te lo contamos, con datos.' },
  { Icon: MapPin, titulo: 'Conocemos la zona', texto: 'Trabajamos en Funes, Roldán y Rosario desde 1983. Sabemos qué se vende y a cuánto.' },
]

const FAQ = [
  {
    q: '¿Cómo empiezo?',
    a: 'Pedí la tasación desde la web o escribinos por WhatsApp. Un tasador del equipo te contacta por WhatsApp en menos de 24 horas para coordinar la visita a la propiedad.',
  },
  {
    q: '¿Qué producción hacen con mi propiedad?',
    a: 'Fotos profesionales, videotour para YouTube, reels verticales para Instagram y TikTok, tomas aéreas con drone y, en muchas propiedades, un audio narrado en la ficha. Lo hace nuestro propio equipo de marketing y producción.',
  },
  {
    q: '¿Dónde publican mi propiedad?',
    a: 'En siinmobiliaria.com, Zonaprop, Argenprop y Mercado Libre; en nuestras redes de Instagram, TikTok, YouTube y Facebook; en campañas de email marketing a nuestra base de contactos, y en pauta paga de Instagram y Facebook que lleva al interesado directo a una conversación por WhatsApp.',
  },
  {
    q: '¿Cómo me entero de cómo va la venta?',
    a: 'Recibís informes con la difusión, las consultas y visitas, lo que opinan los interesados y cómo está el precio frente a propiedades comparables, con un plan de acción. Además tu agente te avisa ante cada novedad importante, como una visita o una oferta.',
  },
  {
    q: '¿Puedo seguir viviendo en la casa mientras se vende?',
    a: 'Sí. Las visitas y la producción de fotos y video se coordinan con vos en días y horarios acordados, y las visitas siempre van acompañadas por un agente del equipo.',
  },
  {
    q: '¿Trabajan con desarrolladores e inversores?',
    a: 'Sí. Asesoramos y comercializamos emprendimientos como Distrito Roldán y Dock Garden: estudio de mercado antes del lanzamiento, estrategia de precio y reportes periódicos del avance comercial. También acompañamos a inversores con análisis del mercado local.',
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
        'Tasación, fotografía profesional, drone, videotours, reels, difusión en portales y redes, pauta en Meta, email marketing, seguimiento de consultas e informes al propietario hasta la escritura.',
    },
    {
      '@type': 'FAQPage',
      '@id': `${URL}#preguntas`,
      mainEntity: FAQ.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    },
  ],
}

/* ─────────────────────────────────────────────
   PÁGINA
───────────────────────────────────────────── */

export default function ComoTrabajamosPage() {
  return (
    <main className="ct-tv bg-white font-raleway" style={{ color: TINTA }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* En el televisor de la oficina (pantallas muy anchas) todo se agranda
          para leerse a distancia. */}
      <style dangerouslySetInnerHTML={{ __html: '@media (min-width: 1800px) { .ct-tv { zoom: 1.2; } }' }} />
      <EstilosMovimiento />

      {/* ── PORTADA ───────────────────────────────
          Video de pantalla completa con tomas reales de nuestro drone
          (lagunas, jacarandás de Funes, club de campo, barrios cerrados).
          Horizontal en desktop/TV, recorte vertical en el celular: cada uno
          solo se descarga si se ve (VideoVivo con preload none). */}
      <section
        className="relative isolate flex flex-col overflow-hidden text-white"
        style={{ background: '#08170F', minHeight: 'min(100svh, 980px)' }}
      >
        <div className="absolute inset-0 -z-10 hidden md:block">
          <VideoVivo
            src="/como-trabajamos/video/portada-drone.mp4"
            poster="/como-trabajamos/video/portada-drone.webp"
            etiqueta="Tomas aéreas con drone de Funes, Roldán y barrios cerrados, filmadas por SI INMOBILIARIA"
            className="absolute inset-0"
          />
        </div>
        <div className="absolute inset-0 -z-10 md:hidden">
          <VideoVivo
            src="/como-trabajamos/video/portada-drone-vertical.mp4"
            poster="/como-trabajamos/video/portada-drone-vertical.webp"
            etiqueta="Tomas aéreas con drone de Funes, Roldán y barrios cerrados, filmadas por SI INMOBILIARIA"
            className="absolute inset-0"
          />
        </div>
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              'linear-gradient(90deg, rgba(6,20,12,.82) 0%, rgba(6,20,12,.5) 42%, rgba(6,20,12,.08) 75%), linear-gradient(0deg, rgba(6,20,12,.92) 0%, rgba(6,20,12,0) 42%)',
          }}
        />
        {/* En el celular el texto ocupa todo el ancho: velo parejo para que se lea. */}
        <div aria-hidden className="absolute inset-0 -z-10 md:hidden" style={{ background: 'rgba(6,20,12,.42)' }} />

        <Contenedor className="flex flex-1 flex-col justify-end pb-10 pt-24 md:pb-14 md:pt-32">
          <p className="ct-in m-0 text-[12px] font-bold uppercase tracking-[0.28em]" style={{ color: MENTA }}>
            SI INMOBILIARIA · Para propietarios
          </p>
          <h1
            className="ct-in ct-in-1 mt-5 max-w-[15ch] font-extrabold"
            style={{ fontSize: 'clamp(2.9rem, 7.2vw, 6.4rem)', lineHeight: 0.98, letterSpacing: '-0.045em', textShadow: '0 2px 24px rgba(0,0,0,.25)' }}
          >
            Así trabajamos con <span style={{ color: MENTA }}>tu propiedad.</span>
          </h1>
          <p className="ct-in ct-in-2 mt-6 max-w-[36rem] text-[17px] font-medium leading-[1.6] md:text-[19px]" style={{ color: 'rgba(255,255,255,.9)', textShadow: '0 1px 14px rgba(0,0,0,.45)' }}>
            Drone, videotours, redes, prensa y pauta paga, tecnología propia y un equipo que te cuenta cómo va, con datos. Todo lo
            que vas a ver es trabajo real, hecho por nosotros.
          </p>
          <div className="ct-in ct-in-3 mt-8 flex flex-col gap-3 sm:flex-row">
            <BotonTasar />
            <WhatsappBoton ubicacion="portada" />
          </div>

          <dl
            className="ct-in ct-in-4 m-0 mt-12 grid grid-cols-2 gap-x-4 gap-y-5 rounded-[22px] px-5 py-6 sm:grid-cols-3 lg:grid-cols-6 md:mt-16 md:px-8"
            style={{
              background: 'rgba(255,255,255,.08)',
              border: '1px solid rgba(255,255,255,.14)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
            }}
          >
            {NUMEROS.map((s) => (
              <div key={s.l} className="flex flex-col-reverse">
                <dt className="mt-1.5 text-[12.5px] font-semibold leading-snug" style={{ color: 'rgba(255,255,255,.7)' }}>
                  {s.l}
                </dt>
                <dd className="m-0 font-numeric text-[28px] font-bold leading-none text-white md:text-[34px]">{s.n}</dd>
              </div>
            ))}
          </dl>
          <p className="m-0 mt-4 flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: 'rgba(255,255,255,.6)' }}>
            <Drone size={14} aria-hidden /> Tomas reales de nuestro drone en Funes, Roldán y la zona
          </p>
        </Contenedor>
      </section>

      {/* ── EL MÉTODO ───────────────────────────── */}
      <section className="py-16 md:py-24" aria-labelledby="metodo-titulo">
        <Contenedor className="grid gap-10 lg:grid-cols-[minmax(0,380px)_1fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Encabezado
              id="metodo-titulo"
              eyebrow="El método"
              titulo="Qué pasa con tu propiedad, paso a paso."
              bajada="Siete etapas, siempre las mismas, para que sepas en todo momento en qué punto está tu venta y qué viene después. Más abajo te mostramos cada una con ejemplos reales."
            />
          </div>
          <ol className="relative m-0 list-none p-0">
            {PASOS.map(({ Icon, titulo, texto, detalle }, i) => (
              <li key={titulo} className="ct-rev relative grid grid-cols-[52px_1fr] gap-4 pb-9 last:pb-0 md:grid-cols-[64px_1fr] md:gap-6">
                {i < PASOS.length - 1 && (
                  <span aria-hidden className="absolute bottom-[4px] left-[25px] top-[56px] w-px md:left-[31px] md:top-[68px]" style={{ background: 'rgba(26,92,56,.22)' }} />
                )}
                <div
                  className="flex h-[52px] w-[52px] items-center justify-center rounded-full md:h-[64px] md:w-[64px]"
                  style={{ background: i === 0 ? VERDE : VERDE_SUAVE, color: i === 0 ? '#fff' : VERDE }}
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
                  <p className="mt-2 text-[15.5px] leading-[1.65]" style={{ color: TEXTO }}>
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

      {/* ── RESULTADOS: ventas propias reales ───── */}
      <Vendidas />

      {/* ── PRODUCCIÓN ──────────────────────────── */}
      <Capitulo numero="01" nombre="Producción" frase="Primero, que tu propiedad se vea increíble." />
      <Fotografia />
      <Aereas />
      <EquipoTecnico />
      <Videotours />
      <Reels />

      {/* ── DIFUSIÓN ────────────────────────────── */}
      <Capitulo numero="02" nombre="Difusión" frase="Después, que la vea la gente correcta." />
      <Redes />
      <CharlasQueSi />
      <ContenidoIA />
      <PortalesYPauta />
      <EmailMarketing />
      <Prensa />
      <CalleYEventos />

      {/* ── TECNOLOGÍA Y SEGUIMIENTO ────────────── */}
      <Capitulo numero="03" nombre="Datos" frase="Y cada decisión, tomada con datos reales." />
      <Hilo />

      <section className="py-16 md:py-24" style={{ background: FONDO }} aria-labelledby="informe-titulo">
        <Contenedor>
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-14">
            <Encabezado
              id="informe-titulo"
              eyebrow="Informe al propietario"
              titulo="Nunca te vas a quedar preguntando cómo va."
              bajada="Todas las consultas, visitas y respuestas quedan registradas en HILO. Con eso armamos el informe que recibís: datos reales de la gestión de tu propiedad. Abajo, bloques de un informe real de este mes."
            />
            <ul className="m-0 grid list-none content-end gap-x-6 gap-y-4 p-0 sm:grid-cols-2">
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
          <div className="mt-10">
            <InformeReal />
          </div>
        </Contenedor>
      </section>

      {/* ── RESPALDO ────────────────────────────── */}
      <Capitulo numero="04" nombre="Respaldo" frase="Detrás, cuatro décadas de trabajo en la zona." oscuro />
      <Desarrolladores />
      <Equipo />
      <Oficinas />

      {/* ── COMPROMISOS ─────────────────────────── */}
      <section className="py-16 text-white md:py-24" style={{ background: VERDE_OSCURO }} aria-labelledby="compromisos-titulo">
        <Contenedor>
          <Encabezado id="compromisos-titulo" oscuro eyebrow="Nuestros compromisos" titulo="Lo que podés esperar de nosotros, siempre." />
          <ul className="m-0 mt-10 grid list-none gap-8 p-0 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
            {COMPROMISOS.map(({ Icon, titulo, texto }) => (
              <li key={titulo} className="ct-rev">
                <span className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: 'rgba(159,217,185,.14)' }}>
                  <Icon size={22} strokeWidth={1.7} style={{ color: MENTA }} aria-hidden />
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
          <Encabezado id="faq-como-trabajamos" eyebrow="Preguntas frecuentes" titulo="Lo que nos preguntan los propietarios." />
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
                <p className="m-0 pb-5 text-[15.5px] leading-[1.65]" style={{ color: TEXTO }}>
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
          <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(60% 90% at 50% 120%, rgba(0,117,74,.7) 0%, rgba(0,117,74,0) 70%)' }} />
          <div className="relative mx-auto max-w-[40rem]">
            <h2 className="m-0 font-extrabold" style={{ fontSize: 'clamp(28px, 3.6vw, 46px)', lineHeight: 1.06, letterSpacing: '-0.035em' }}>
              ¿Empezamos por saber cuánto vale?
            </h2>
            <p className="mt-4 text-[16.5px] font-medium leading-[1.6]" style={{ color: 'rgba(255,255,255,.85)' }}>
              Pedí la tasación y un tasador del equipo te escribe por WhatsApp para coordinar la visita. Sin compromiso.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <BotonTasar claro />
              <WhatsappBoton ubicacion="cierre" />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
