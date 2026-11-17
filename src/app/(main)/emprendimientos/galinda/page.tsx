// Landing de Galinda! — conjunto de usos mixtos de Fundar en Galindo y Picton,
// Funes. Las unidades todavía no están en el feed de HILO (borradores GAL-*):
// ruta estática propia (le gana al [slug] dinámico), mismo patrón que Fisherton
// Work. Datos en src/lib/galinda.ts; fotos en public/emprendimientos/galinda.
//
// SIN PRECIO (David, 17-nov-2026). Lo que la hace mejor que la ficha de Fundar:
// fotos y video REALES del showroom terminado y de la obra (de la visita del
// 17-nov), la vista desde cada unidad, su plano y un WhatsApp por unidad.

import type { Metadata } from 'next'
import Image from '@/components/Imagen'
import PlanoBoton from '@/components/galinda/PlanoBoton'
import PropertyMapLazy from '@/components/PropertyMapLazy'
import WaGalinda from '@/components/galinda/WaGalinda'
import {
  GAL_AVANCE,
  GAL_BASE,
  GAL_ENTREGA,
  GAL_FECHA_FOTOS,
  GAL_URL,
  TIPO_LABEL,
  UNIDADES,
  frenteA,
  nombreUnidad,
  rangoM2,
  type TipoUnidad,
} from '@/lib/galinda'

const TITLE = 'Galinda! en Funes · Departamentos y oficinas · Showroom terminado'
const DESCRIPTION =
  'Departamentos de 2 y 3 dormitorios y oficinas en Galinda! (Fundar), Galindo y Picton, Funes. Obra al 91 % y entrega en marzo de 2027. Mirá el showroom terminado, la vista y el plano de cada unidad.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: GAL_URL },
  openGraph: {
    title: 'Galinda! · Funes · El showroom ya está terminado',
    description: 'Departamentos de 2 y 3 dormitorios y oficinas. Obra al 91 %, entrega en marzo de 2027.',
    url: GAL_URL,
    siteName: 'SI INMOBILIARIA',
    images: [{ url: 'https://siinmobiliaria.com/og-galinda.jpg', width: 1200, height: 630, type: 'image/jpeg', alt: 'Galinda! — Funes' }],
    locale: 'es_AR',
    type: 'website',
  },
}

const TIPOS: TipoUnidad[] = ['2d', '3d', 'of']

const SHOWROOM = [
  { img: 'sr-living', alt: 'Living comedor del showroom de Galinda! con salida al balcón', grande: true },
  { img: 'sr-balcon', alt: 'Balcón del showroom con vista al campo' },
  { img: 'sr-cocina', alt: 'Cocina integrada al living en el showroom' },
  { img: 'sr-dormitorio', alt: 'Dormitorio principal del showroom' },
  { img: 'sr-bano', alt: 'Baño del showroom con vanitory y bacha de apoyo' },
]

const OBRA = [
  { img: 'obra-fachada', alt: 'Frente de Galinda! sobre la calle, con el cartel de Fundar', pie: 'El frente sobre Galindo' },
  { img: 'obra-paseo', alt: 'Vereda del paseo comercial ya con adoquines', pie: 'El paseo comercial' },
  { img: 'obra-vista', alt: 'Balcón de un departamento en obra con vista al parque', pie: 'Balcones al parque' },
  { img: 'obra-dron', alt: 'Vista aérea de la obra de Galinda! sobre la bajada de la autopista', pie: 'Desde el dron (Fundar)' },
]

const PROYECTO = [
  { img: 'r-plazoleta', alt: 'Render de la plazoleta central con locales y oficinas', pie: 'La plazoleta' },
  { img: 'r-paseo', alt: 'Render del paseo comercial techado', pie: 'El paseo comercial' },
  { img: 'r-aerea', alt: 'Render aéreo del parque interno sobre las cocheras', pie: 'El parque interno' },
  { img: 'r-gimnasio', alt: 'Render del gimnasio con vista al parque', pie: 'Gimnasio al parque' },
  { img: 'r-balcon', alt: 'Render de un balcón con vista al parque y la pileta', pie: 'Balcón al parque' },
  { img: 'r-exterior', alt: 'Render del conjunto visto desde Av. Galindo', pie: 'Desde Av. Galindo' },
]

const AMENITIES = [
  'Pileta y solárium',
  'Parque interno',
  'Quincho con parrillero',
  'SUM y gimnasio',
  'Juegos para chicos',
  'Laundry y bicicletero',
  'Cocheras cubiertas',
  'Grupo electrógeno',
  'Seguridad las 24 h',
  'Paseo comercial con 39 locales',
]

const UBICACION = [
  'Sobre la bajada de la autopista Rosario–Córdoba, en el acceso a Funes por calle Galindo.',
  'Frente a Lion Place, en la entrada de Funes.',
  'Con el paseo comercial abajo: comprás, comés y trabajás sin agarrar el auto.',
]

function Seccion({ id, titulo, bajada, children }: { id?: string; titulo: string; bajada?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mx-auto max-w-6xl scroll-mt-24 px-4 py-12 md:py-16">
      <h2 className="text-[30px] font-extrabold leading-tight tracking-tight md:text-4xl">{titulo}</h2>
      {bajada && <p className="mt-2 max-w-2xl text-lg text-[var(--tinta-mute)]">{bajada}</p>}
      {children}
    </section>
  )
}

function VideoVertical({ src, poster, label }: { src: string; poster: string; label: string }) {
  return (
    <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-[var(--cream)]">
      <video
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={label}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <span className="absolute bottom-3 left-3 rounded-lg bg-black/55 px-2.5 py-1 text-xs font-semibold text-white">
        Video real · {GAL_FECHA_FOTOS}
      </span>
    </div>
  )
}

export default function GalindaPage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Place',
      name: 'Galinda!',
      description: DESCRIPTION,
      url: GAL_URL,
      image: `https://siinmobiliaria.com${GAL_BASE}/hero-obra.webp`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Galindo y Picton',
        addressLocality: 'Funes',
        addressRegion: 'Santa Fe',
        addressCountry: 'AR',
      },
      geo: { '@type': 'GeoCoordinates', latitude: -32.93135, longitude: -60.82085 },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://siinmobiliaria.com' },
        { '@type': 'ListItem', position: 2, name: 'Emprendimientos', item: 'https://siinmobiliaria.com/emprendimientos' },
        { '@type': 'ListItem', position: 3, name: 'Galinda!', item: GAL_URL },
      ],
    },
  ]

  return (
    <div className="bg-[var(--background)] pb-24 text-[var(--foreground)] md:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Portada ── */}
      <div className="mx-auto max-w-6xl px-4 pt-28 md:pt-32">
        <p className="text-sm font-semibold text-[var(--tinta-mute)]">Galinda! · Galindo y Picton, Funes · Desarrolla Fundar</p>
        <h1 className="mt-3 max-w-3xl text-[38px] font-extrabold leading-[1.02] tracking-tight md:text-6xl">
          Departamentos y oficinas en Funes. <span className="text-[var(--brand)]">El showroom ya está terminado.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-[var(--tinta-mute)] md:text-xl">
          2 y 3 dormitorios y oficinas sobre un parque con pileta, con paseo comercial abajo. Vení a ver cómo queda tu
          departamento antes de comprarlo.
        </p>

        <div className="relative mt-7 aspect-[4/3] overflow-hidden rounded-3xl bg-[var(--cream)] md:aspect-[2/1]">
          <Image
            src={`${GAL_BASE}/hero-obra.webp`}
            alt="Edificio de Galinda! con el cartel del emprendimiento, ya construido"
            fill
            priority
            sizes="(min-width: 1152px) 1120px, 100vw"
            className="object-cover"
          />
          <span className="absolute bottom-3 left-3 rounded-lg bg-black/55 px-2.5 py-1 text-xs font-semibold text-white">
            Foto real de la obra
          </span>
        </div>

        {/* Estado: lo que la persona quiere saber primero */}
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-[var(--cream)] px-5 py-4">
            <p className="text-sm text-[var(--tinta-mute)]">Avance de obra</p>
            <p className="text-2xl font-extrabold tabular-nums tracking-tight">{GAL_AVANCE} %</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--line)]" aria-hidden>
              <div className="h-full rounded-full bg-[#17613C]" style={{ width: `${GAL_AVANCE}%` }} />
            </div>
          </div>
          <div className="rounded-2xl bg-[var(--cream)] px-5 py-4">
            <p className="text-sm text-[var(--tinta-mute)]">Entrega</p>
            <p className="text-2xl font-extrabold tracking-tight">Marzo 2027</p>
          </div>
          <div className="rounded-2xl bg-[var(--cream)] px-5 py-4">
            <p className="text-sm text-[var(--tinta-mute)]">Unidades</p>
            <p className="text-2xl font-extrabold tracking-tight">2 y 3 dorm. · Oficinas</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <WaGalinda
            origen="portada"
            label="Coordinar visita al showroom"
            text="Hola! Quiero coordinar una visita al showroom de Galinda!."
            className="py-3.5 text-base"
          />
          <a
            href="#unidades"
            className="inline-flex items-center justify-center rounded-xl border border-[var(--line)] px-5 py-3.5 text-base font-bold transition-colors hover:border-[var(--brand)]"
          >
            Ver las unidades
          </a>
        </div>
      </div>

      {/* ── Showroom: lo que Fundar no muestra ── */}
      <Seccion
        id="showroom"
        titulo="Así se ve por dentro"
        bajada={`Fotos y video del showroom terminado, sacados el ${GAL_FECHA_FOTOS}. No son renders: es el departamento real.`}
      >
        <div className="mt-6 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <VideoVertical
            src={`${GAL_BASE}/video-showroom.mp4`}
            poster={`${GAL_BASE}/video-showroom-poster.webp`}
            label="Recorrido en video por el showroom de Galinda!"
          />
          <div className="grid grid-cols-2 gap-3">
            {SHOWROOM.map((f) => (
              <div
                key={f.img}
                className={`relative overflow-hidden rounded-2xl bg-[var(--cream)] ${f.grande ? 'col-span-2 aspect-[16/10]' : 'aspect-[4/3]'}`}
              >
                <Image
                  src={`${GAL_BASE}/${f.img}.webp`}
                  alt={f.alt}
                  fill
                  sizes={f.grande ? '(min-width: 768px) 740px, 100vw' : '(min-width: 768px) 370px, 50vw'}
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </Seccion>

      {/* ── Unidades ── */}
      <Seccion
        id="unidades"
        titulo="Las unidades disponibles"
        bajada="Cada foto es la vista real desde esa unidad. Tocá «Ver plano» para ver cómo es por dentro."
      >
        <nav aria-label="Tipos de unidad" className="mt-5 flex flex-wrap gap-2">
          {TIPOS.map((t) => (
            <a
              key={t}
              href={`#tipo-${t}`}
              className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-bold transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
            >
              {TIPO_LABEL[t]} <span className="font-medium text-[var(--tinta-mute)]">· {rangoM2(t)}</span>
            </a>
          ))}
        </nav>

        {TIPOS.map((t) => (
          <div key={t} id={`tipo-${t}`} className="scroll-mt-24 pt-9">
            <h3 className="mb-4 text-xl font-extrabold">{TIPO_LABEL[t]}</h3>
            <div className="grid gap-5 md:grid-cols-3">
              {UNIDADES.filter((u) => u.tipo === t).map((u) => {
                const nombre = nombreUnidad(u)
                return (
                  <article key={u.id} className="flex flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--card-surface)]">
                    <div className="relative aspect-[4/3] bg-[var(--cream)]">
                      <Image
                        src={`${GAL_BASE}/vista-${u.id}.webp`}
                        alt={`Vista desde la ${nombre.toLowerCase()} hacia ${u.frente}`}
                        fill
                        sizes="(min-width: 768px) 360px, 100vw"
                        className="object-cover"
                      />
                      <span className="absolute bottom-2.5 left-3 rounded-md bg-black/55 px-2 py-0.5 text-xs font-semibold text-white">
                        Vista desde esta unidad
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-5">
                      <div>
                        <p className="text-lg font-extrabold">
                          {nombre} · {u.m2} m²
                        </p>
                        <p className="text-sm text-[var(--tinta-mute)]">
                          {u.tipo !== 'of' && `${TIPO_LABEL[u.tipo]} · 2 baños · `}Piso {u.piso} · {frenteA(u.frente)}
                        </p>
                        <p className="text-sm text-[var(--tinta-mute)]">{u.m2Exclusivos} m² propios + espacios comunes</p>
                      </div>
                      <div className="mt-auto grid grid-cols-[auto_1fr] gap-2">
                        <PlanoBoton src={`${GAL_BASE}/plano-${u.id}.webp`} titulo={`Plano · ${nombre} · ${u.m2} m²`} />
                        <WaGalinda
                          origen={`unidad-${u.id}`}
                          label="Consultar precio"
                          text={`Hola! Quiero el precio de la ${nombre.toLowerCase()} de Galinda! (${u.m2} m², ${frenteA(u.frente)}).`}
                        />
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        ))}
        <div className="mt-8 flex flex-col items-start gap-3 rounded-2xl border border-[var(--line)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold">¿Buscás otra orientación u otro piso? Hay más unidades disponibles.</p>
          <WaGalinda origen="mas-unidades" label="Preguntar por otras" text="Hola! Quiero ver otras unidades disponibles en Galinda!." />
        </div>
      </Seccion>

      {/* ── Obra ── */}
      <Seccion
        id="obra"
        titulo={`La obra, al ${GAL_AVANCE} %`}
        bajada={`Así estaba el ${GAL_FECHA_FOTOS}. Los edificios están levantados y se están terminando los interiores y el paseo.`}
      >
        <div className="mt-6 grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="grid grid-cols-2 gap-3">
            {OBRA.map((f) => (
              <figure key={f.img}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[var(--cream)]">
                  <Image src={`${GAL_BASE}/${f.img}.webp`} alt={f.alt} fill sizes="(min-width: 768px) 370px, 50vw" className="object-cover" />
                </div>
                <figcaption className="mt-1.5 text-sm font-semibold">{f.pie}</figcaption>
              </figure>
            ))}
          </div>
          <VideoVertical
            src={`${GAL_BASE}/video-obra.mp4`}
            poster={`${GAL_BASE}/video-obra-poster.webp`}
            label="Recorrido en video por la obra de Galinda!"
          />
        </div>
      </Seccion>

      {/* ── Proyecto terminado ── */}
      <Seccion
        id="proyecto"
        titulo="Cómo va a quedar"
        bajada="Los departamentos rodean un parque con pileta. Abajo, un paseo comercial con 39 locales y oficinas."
      >
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
          {PROYECTO.map((f) => (
            <figure key={f.img}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[var(--cream)]">
                <Image src={`${GAL_BASE}/${f.img}.webp`} alt={f.alt} fill sizes="(min-width: 768px) 360px, 50vw" className="object-cover" />
              </div>
              <figcaption className="mt-1.5 text-sm font-semibold">{f.pie}</figcaption>
            </figure>
          ))}
        </div>
        <h3 className="mt-10 text-xl font-extrabold">Lo que tiene el conjunto</h3>
        <ul className="mt-4 grid gap-x-6 gap-y-2.5 sm:grid-cols-2 md:grid-cols-3">
          {AMENITIES.map((a) => (
            <li key={a} className="flex items-start gap-2.5">
              <span className="mt-2 h-2 w-2 flex-none rounded-full bg-[#17613C]" aria-hidden />
              {a}
            </li>
          ))}
        </ul>
      </Seccion>

      {/* ── Ubicación ── */}
      <Seccion id="ubicacion" titulo="Dónde está">
        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_1.3fr]">
          <div>
            <p className="text-xl font-extrabold">Galindo y Picton, Funes</p>
            <ul className="mt-4 space-y-3">
              {UBICACION.map((u) => (
                <li key={u} className="flex items-start gap-2.5 text-[var(--tinta-soft)]">
                  <span className="mt-2 h-2 w-2 flex-none rounded-full bg-[#17613C]" aria-hidden />
                  {u}
                </li>
              ))}
            </ul>
            <a
              href="https://www.google.com/maps/search/?api=1&query=-32.93135,-60.82085"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex rounded-xl border border-[var(--line)] px-5 py-3 text-sm font-bold transition-colors hover:border-[var(--brand)]"
            >
              Abrir en Google Maps
            </a>
          </div>
          <div>
            <PropertyMapLazy lat={-32.93135} lng={-60.82085} address="Galindo y Picton, Funes" />
          </div>
        </div>
      </Seccion>

      {/* ── Cierre ── */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="grid items-center gap-6 rounded-3xl bg-[var(--cream)] p-6 md:grid-cols-[1.3fr_1fr] md:p-8">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Vení a conocer el showroom</h2>
            <p className="mt-2 text-[var(--tinta-mute)]">
              Te mostramos el departamento terminado y la unidad que te interese, y te pasamos el precio y las formas de
              pago.
            </p>
          </div>
          <div>
            <p className="mb-3 select-all text-2xl font-extrabold tabular-nums">341 334-0916</p>
            <WaGalinda
              origen="cierre"
              label="Escribinos por WhatsApp"
              text="Hola! Quiero coordinar una visita al showroom de Galinda!."
              className="w-full py-3.5 text-base"
            />
          </div>
        </div>
        <p className="mt-7 max-w-3xl text-xs leading-relaxed text-[var(--tinta-mute)]">
          Desarrolla y construye Fundar (fundar.com.ar). Las fotos y videos del showroom y de la obra son reales, del{' '}
          {GAL_FECHA_FOTOS}; las imágenes de «Cómo va a quedar» son renders ilustrativos del proyecto. Superficies
          aproximadas, sujetas a ajustes del proyecto final. Entrega estimada: {GAL_ENTREGA}. Comercializa SI INMOBILIARIA.
        </p>
      </section>

      {/* ── Barra fija en el celu ── */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-[var(--background)]/95 p-3 backdrop-blur md:hidden">
        <WaGalinda
          origen="barra"
          label="Consultar por WhatsApp"
          className="w-full py-3.5 text-base"
        />
      </div>
    </div>
  )
}
