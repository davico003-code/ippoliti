// /como-trabajamos — difusión: redes (con cifras públicas), Charlas Que Sí,
// contenido con IA, portales, pauta en Meta y email marketing.

import Image from 'next/image'
import { Heart, Mail, Megaphone, MessageCircle, Mic, Send, Sparkles } from 'lucide-react'
import YoutubeEmbed from '@/components/nosotros/YoutubeEmbed'
import { VideoVivo } from './Medios'
import { LogoYoutube } from './Produccion'
import { CHARLAS_INVITADOS, CHARLA_DESTACADA, CANAL_YOUTUBE, FOTOS, REDES, RELEVADO } from './datos'
import { ACENTO, BORDE, Contenedor, Encabezado, FONDO, GRIS, LinkFlecha, MENTA, TEXTO, TINTA, VERDE, VERDE_OSCURO, VERDE_SUAVE, conNumeros } from './ui'

const PORTALES = [
  { nombre: 'siinmobiliaria.com', logo: '/portal-logos/si-inmobiliaria.png', nota: 'Nuestra web' },
  { nombre: 'Zonaprop', logo: '/portal-logos/zonaprop.jpg', nota: 'Portal' },
  { nombre: 'Argenprop', logo: '/portal-logos/argenprop.jpg', nota: 'Portal' },
  { nombre: 'Mercado Libre', logo: '/portal-logos/mercadolibre.png', nota: 'Portal' },
  { nombre: 'Instagram y Facebook', logo: '/portal-logos/meta.jpg', nota: 'Redes y pauta' },
]

export function Redes() {
  const grilla = FOTOS.slice(0, 9)
  return (
    <section className="py-16 text-white md:py-24" style={{ background: VERDE_OSCURO }} aria-labelledby="redes-titulo">
      <Contenedor className="grid items-center gap-12 lg:grid-cols-[1fr_minmax(0,460px)] lg:gap-16">
        <div>
          <Encabezado
            id="redes-titulo"
            oscuro
            eyebrow="Redes sociales"
            titulo={<>Más de <span className="font-numeric">25</span> mil seguidores en nuestras redes.</>}
            bajada="Publicamos seguido propiedades, recorridos y datos del mercado de la zona. Tu propiedad le llega a una comunidad que ya mira inmuebles en Funes, Roldán y Rosario."
          />
          <ul className="m-0 mt-9 grid list-none gap-3 p-0 sm:grid-cols-2">
            {REDES.map((r) => (
              <li key={r.usuario} className="ct-rev">
                <a
                  href={r.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-[18px] p-5 transition-colors duration-200 hover:bg-white/[.09]"
                  style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: '#fff', textDecoration: 'none' }}
                >
                  <span className="block text-[11.5px] font-bold uppercase tracking-[0.16em]" style={{ color: MENTA }}>
                    {r.red}
                  </span>
                  <span className="mt-2 block font-numeric text-[38px] font-bold leading-none">{r.cifra}</span>
                  <span className="mt-1.5 block text-[13.5px] font-semibold" style={{ color: 'rgba(255,255,255,.72)' }}>
                    {conNumeros(r.detalle)}
                  </span>
                  <span className="mt-3 block text-[14.5px] font-bold">{r.usuario}</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[12.5px]" style={{ color: 'rgba(255,255,255,.5)' }}>
            Cifras públicas de cada perfil, relevadas en {RELEVADO}.
          </p>
        </div>

        {/* Perfil de Instagram (maqueta con fotos reales publicadas) */}
        <a
          href="https://www.instagram.com/inmobiliaria.si"
          target="_blank"
          rel="noopener noreferrer"
          className="ct-rev mx-auto block w-full max-w-[400px] overflow-hidden rounded-[28px] bg-white p-4 shadow-2xl"
          style={{ color: TINTA, textDecoration: 'none' }}
          aria-label="Ver el perfil de Instagram @inmobiliaria.si"
        >
          <div className="flex items-center gap-4 px-1 pb-4 pt-1">
            <span className="relative h-[68px] w-[68px] shrink-0 overflow-hidden rounded-full p-[3px]" style={{ background: 'linear-gradient(45deg,#f9ce34,#ee2a7b,#6228d7)' }}>
              <span className="relative block h-full w-full overflow-hidden rounded-full bg-white">
                <Image src="/logo-si-inmobiliaria.svg" alt="" fill sizes="62px" className="object-contain p-2.5" />
              </span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="m-0 text-[15px] font-bold">
                inmobiliaria.si
              </p>
              <div className="mt-2 grid grid-cols-3 gap-1 text-center">
                {[
                  ['451', 'posts'],
                  ['21K', 'seguidores'],
                  ['434', 'seguidos'],
                ].map(([n, l]) => (
                  <span key={l}>
                    <span className="block font-numeric text-[15px] font-bold">{n}</span>
                    <span className="block text-[11.5px]" style={{ color: GRIS }}>
                      {l}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-[3px] overflow-hidden rounded-[10px]">
            {grilla.map((f) => (
              <span key={f.src} className="relative aspect-square">
                <Image src={f.src} alt="" fill sizes="130px" className="object-cover" />
              </span>
            ))}
          </div>
        </a>
      </Contenedor>
    </section>
  )
}

export function CharlasQueSi() {
  return (
    <section className="py-16 md:py-24" aria-labelledby="charlas-titulo">
      <Contenedor className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        <YoutubeEmbed
          videoId={CHARLA_DESTACADA.id}
          title={CHARLA_DESTACADA.titulo}
          poster={`https://i.ytimg.com/vi/${CHARLA_DESTACADA.id}/hqdefault.jpg`}
          className="aspect-video w-full overflow-hidden rounded-[22px] shadow-xl"
        />
        <div>
          <LogoYoutube className="mb-5" />
          <Encabezado
            id="charlas-titulo"
            eyebrow="Charlas Que Sí"
            titulo="Un programa propio sobre el mercado."
            bajada="Conversaciones largas, grabadas en nuestra oficina, con desarrolladores, colegas y referentes de la zona. Entre ellas, la de Susana y sus 43 años en el mercado."
          />
          <ul className="m-0 mt-6 flex list-none flex-wrap gap-2 p-0">
            {CHARLAS_INVITADOS.map((n) => (
              <li key={n} className="rounded-full px-3.5 py-1.5 text-[13px] font-bold" style={{ background: VERDE_SUAVE, color: VERDE }}>
                {n}
              </li>
            ))}
          </ul>
          <div className="mt-5">
            <LinkFlecha href={CANAL_YOUTUBE} externo>
              Ver todas las charlas
            </LinkFlecha>
          </div>
        </div>
      </Contenedor>
    </section>
  )
}

export function ContenidoIA() {
  return (
    <section className="py-16 md:py-24" style={{ background: FONDO }} aria-labelledby="ia-titulo">
      <Contenedor>
        <Encabezado
          id="ia-titulo"
          eyebrow="Contenido con inteligencia artificial"
          titulo="Producimos más, y mejor, con IA."
          bajada="Trabajamos con Claude y Codex para preparar el contenido de cada propiedad: textos, placas animadas con locución, audios narrados, portadas del blog e informes de mercado. Todo pasa por el equipo antes de publicarse."
        />

        <div className="mt-10 grid gap-4 md:grid-cols-[auto_auto_1fr] md:gap-5">
          {[
            { src: 'placa-voz-los-robles', txt: 'Los Robles 210, Funes' },
            { src: 'placa-voz-vida-058', txt: 'Lote 058, barrio Vida' },
          ].map((p) => (
            <figure key={p.src} className="ct-rev m-0">
              <div className="relative mx-auto aspect-[9/16] w-[210px] overflow-hidden rounded-[26px] border-[5px] shadow-xl md:w-[220px]" style={{ borderColor: TINTA }}>
                <VideoVivo
                  src={`/como-trabajamos/video/${p.src}.mp4`}
                  poster={`/como-trabajamos/video/${p.src}.webp`}
                  etiqueta={`Placa animada con locución: ${p.txt}`}
                  conSonido
                  className="absolute inset-0"
                />
              </div>
              <figcaption className="mt-2.5 text-center text-[13px] font-bold" style={{ color: TEXTO }}>
                Placa con voz · {conNumeros(p.txt)}
              </figcaption>
            </figure>
          ))}

          <div className="grid content-start gap-4">
            <div className="rounded-[20px] bg-white p-6" style={{ border: `1px solid ${BORDE}` }}>
              <span className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.16em]" style={{ color: ACENTO }}>
                <Mic size={15} aria-hidden /> Audio narrado en la ficha
              </span>
              <p className="mt-2 text-[15px] font-semibold leading-[1.55]" style={{ color: TEXTO }}>
                Más de <span className="font-numeric">100</span> propiedades tienen su audio: el comprador escucha la casa mientras mira las fotos. Este es el de la casa en Cadaqués.
              </p>
              <audio
                className="mt-4 w-full"
                controls
                preload="none"
                src="https://bsrkifcrrwhewvgj.public.blob.vercel-storage.com/audio/v3/7875941.mp3"
              >
                Tu navegador no reproduce audio.
              </audio>
            </div>
            <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
              {[
                ['Textos de fichas y portales', 'Descripciones completas, con los datos que busca cada portal.'],
                ['Blog e informes de mercado', 'Notas y análisis de precios de la zona, con fuentes.'],
                ['Placas y carruseles', 'Diseño con la marca SI para historias, feed y anuncios.'],
                ['Revisión humana', 'La IA propone; el agente revisa y aprueba lo que sale.'],
              ].map(([t, d]) => (
                <li key={t} className="rounded-[18px] bg-white p-5" style={{ border: `1px solid ${BORDE}` }}>
                  <Sparkles size={18} strokeWidth={1.8} style={{ color: VERDE }} aria-hidden />
                  <p className="mt-2 text-[15px] font-extrabold leading-tight">{t}</p>
                  <p className="mt-1 text-[13.5px] leading-[1.5]" style={{ color: GRIS }}>
                    {d}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Contenedor>
    </section>
  )
}

export function PortalesYPauta() {
  return (
    <section className="py-16 md:py-24" aria-labelledby="pauta-titulo">
      <Contenedor>
        <Encabezado
          id="pauta-titulo"
          eyebrow="Portales y publicidad paga"
          titulo="Tu propiedad, en todos lados a la vez."
          bajada="Cargamos la propiedad una vez y sale en nuestra web y en los principales portales. Si cambia el precio o una foto, se actualiza en todos. Y la empujamos con pauta paga en Instagram y Facebook."
        />

        <ul className="m-0 mt-10 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 lg:grid-cols-5 md:gap-4">
          {PORTALES.map((p) => (
            <li key={p.nombre} className="ct-rev flex flex-col items-center gap-3 rounded-[18px] px-3 py-6 text-center" style={{ background: FONDO }}>
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

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-[minmax(0,400px)_1fr] lg:gap-16">
          {/* Maqueta del anuncio (formato real de nuestra pauta) */}
          <figure className="ct-rev m-0">
            <div className="mx-auto w-full max-w-[380px] overflow-hidden rounded-[22px] bg-white shadow-2xl" style={{ border: `1px solid ${BORDE}` }}>
              <div className="flex items-center gap-2.5 px-4 py-3">
                <span className="relative h-8 w-8 overflow-hidden rounded-full" style={{ border: `1px solid ${BORDE}` }}>
                  <Image src="/logo-si-inmobiliaria.svg" alt="" fill sizes="32px" className="object-contain p-1" />
                </span>
                <span>
                  <span className="block text-[13.5px] font-bold leading-tight">inmobiliaria.si</span>
                  <span className="block text-[11.5px]" style={{ color: GRIS }}>
                    Publicidad
                  </span>
                </span>
              </div>
              <div className="relative aspect-[4/5]">
                <Image src="/como-trabajamos/cadaques-fachada.webp" alt="" fill sizes="380px" className="object-cover" />
              </div>
              <div className="flex items-center justify-between gap-3 px-4 py-3 text-white" style={{ background: '#25D366' }}>
                <span className="text-[14px] font-bold">Enviar mensaje de WhatsApp</span>
                <Send size={17} aria-hidden />
              </div>
              <div className="px-4 pb-4 pt-3">
                <div className="flex gap-3" style={{ color: TINTA }} aria-hidden>
                  <Heart size={21} /> <MessageCircle size={21} /> <Send size={21} />
                </div>
                <p className="mt-2.5 text-[13.5px] leading-[1.5]" style={{ color: TINTA }}>
                  <strong>inmobiliaria.si</strong> ¿Te imaginás los domingos con este jardín? Casa de {conNumeros('3 dormitorios en Cadaqués, Funes: 212 m² cubiertos, lote de 800 m², pileta y quincho.')} Escribinos y te contamos todo.
                </p>
              </div>
            </div>
            <figcaption className="mt-3 text-center text-[12.5px] font-semibold" style={{ color: GRIS }}>
              Formato de los anuncios que corremos, con una propiedad real.
            </figcaption>
          </figure>

          <div>
            <span className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: VERDE_SUAVE }}>
              <Megaphone size={22} strokeWidth={1.7} style={{ color: VERDE }} aria-hidden />
            </span>
            <h3 className="mt-4 text-[24px] font-extrabold leading-tight md:text-[28px]" style={{ letterSpacing: '-0.025em' }}>
              Pauta en Meta Ads que termina en una conversación.
            </h3>
            <ul className="m-0 mt-5 grid list-none gap-4 p-0">
              {[
                ['Directo a WhatsApp', 'El anuncio abre una conversación con nosotros: el que escribe ya está interesado en tu propiedad.'],
                ['Segmentado a la zona', 'Apuntamos a quienes buscan en Funes, Roldán y Rosario, y a los perfiles que compran ese tipo de propiedad.'],
                ['Formatos que rinden', 'Placas con los datos clave, carruseles con las mejores fotos y video vertical para historias y reels.'],
                ['Medido', 'Cada anuncio se sigue con sus consultas reales, y el resultado te lo mostramos en el informe.'],
              ].map(([t, d]) => (
                <li key={t} className="flex gap-3">
                  <span aria-hidden className="mt-[8px] h-2 w-2 shrink-0 rounded-full" style={{ background: ACENTO }} />
                  <span>
                    <span className="block text-[16px] font-extrabold">{t}</span>
                    <span className="block text-[15px] leading-[1.6]" style={{ color: TEXTO }}>
                      {d}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Contenedor>
    </section>
  )
}

export function EmailMarketing() {
  return (
    <section className="py-16 md:py-24" style={{ background: FONDO }} aria-labelledby="email-titulo">
      <Contenedor className="grid items-center gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-14">
        <div>
          <span className="mb-5 inline-flex items-center rounded-[12px] px-4 py-2.5" style={{ background: '#1B45C8' }}>
            <Image src="/como-trabajamos/logo-emblue-blanco.webp" alt="emBlue" width={120} height={29} className="h-[26px] w-auto" />
          </span>
          <Encabezado
            id="email-titulo"
            eyebrow="Email marketing con emBlue"
            titulo="Tu propiedad llega a la bandeja de nuestra base."
            bajada="Enviamos campañas por email a nuestra base de contactos: cada ingreso nuevo, cada baja de precio, una selección semanal y notas del mercado local. Son las plantillas reales que usamos."
          />
          <ul className="m-0 mt-7 grid list-none gap-2.5 p-0">
            {['Nuevo ingreso', 'Nuevo valor (baja de precio)', 'Selección de la semana', 'Nota del mercado local'].map((t) => (
              <li key={t} className="flex items-center gap-3 text-[15.5px] font-bold">
                <Mail size={17} style={{ color: ACENTO }} aria-hidden /> {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {[
            { src: '/como-trabajamos/mail-nuevo-ingreso.webp', alt: 'Email de nuevo ingreso con una casa en Cadaqués', label: 'Nuevo ingreso', alto: 2173 },
            { src: '/como-trabajamos/mail-seleccion.webp', alt: 'Email con la selección de la semana', label: 'Selección de la semana', alto: 3587 },
          ].map((m) => (
            <figure key={m.src} className="ct-rev m-0">
              <div className="relative h-[380px] overflow-hidden rounded-[18px] shadow-xl md:h-[520px]" style={{ background: '#0c1a13' }}>
                <Image src={m.src} alt={m.alt} width={900} height={m.alto} sizes="(max-width: 1024px) 50vw, 330px" className="h-auto w-full" />
                <span aria-hidden className="absolute inset-x-0 bottom-0 h-20" style={{ background: 'linear-gradient(0deg, #0c1a13 0%, rgba(12,26,19,0) 100%)' }} />
              </div>
              <figcaption className="mt-2.5 text-center text-[13px] font-bold" style={{ color: TEXTO }}>
                {m.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </Contenedor>
    </section>
  )
}

