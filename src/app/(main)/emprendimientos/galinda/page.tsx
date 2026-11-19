// Landing de Galinda! — conjunto de usos mixtos de Fundar en Galindo y Picton,
// Funes. Las unidades todavía no están en el feed de HILO (borradores GAL-*):
// ruta estática propia (le gana al [slug] dinámico), mismo patrón que Fisherton
// Work. Datos en src/lib/galinda.ts; fotos en public/emprendimientos/galinda.
//
// Estructura calcada de fundar.com.ar/proyecto/galinda (David, 17-nov: "copiale
// bien a la página de Fundar y mejorala"; números siempre en Poppins).
// SIN PRECIO (David, 17-nov-2026). Lo que la hace mejor que la ficha de Fundar:
// fotos y video REALES del showroom terminado y de la obra (de la visita del
// 17-nov), la vista desde cada unidad, su plano y un WhatsApp por unidad.

import type { Metadata } from 'next'
import {
  Baby,
  Bike,
  Car,
  Dumbbell,
  Flame,
  ShieldCheck,
  Store,
  Sun,
  Tent,
  Trees,
  Users,
  Waves,
  WashingMachine,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import Image from '@/components/Imagen'
import Carrusel from '@/components/galinda/Carrusel'
import ListaUnidades from '@/components/galinda/ListaUnidades'
import PropertyMapLazy from '@/components/PropertyMapLazy'
import WaGalinda from '@/components/galinda/WaGalinda'
import {
  GAL_AVANCE,
  GAL_BASE,
  GAL_ENTREGA_OFICINAS,
  GAL_ENTREGA_VIVIENDAS,
  GAL_FECHA_FOTOS,
  GAL_FORMA_PAGO,
  GAL_URL,
} from '@/lib/galinda'

const TITLE = 'Galinda! en Funes · Departamentos, oficina y locales · Showroom terminado'
const DESCRIPTION =
  'Departamentos de 2 y 3 dormitorios, una oficina y locales comerciales en Galinda! (Fundar), Galindo y Picton, Funes. Obra al 91 %: oficina en enero de 2027 y departamentos en marzo-abril de 2027. Mirá el showroom terminado y el plano de cada unidad.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: GAL_URL },
  openGraph: {
    title: 'Galinda! · Funes · El showroom ya está terminado',
    description: 'Departamentos de 2 y 3 dormitorios, oficina y locales comerciales. Obra al 91 %. Oficina en enero y departamentos en marzo-abril de 2027.',
    url: GAL_URL,
    siteName: 'SI INMOBILIARIA',
    images: [{ url: 'https://siinmobiliaria.com/og-galinda.jpg', width: 1200, height: 630, type: 'image/jpeg', alt: 'Galinda! — Funes' }],
    locale: 'es_AR',
    type: 'website',
  },
}

// Fotos reales de la carpeta GALINDA-2 (David, 18-nov-2026): showroom, oficina, cocheras y obra.
const SHOWROOM = [
  { img: 'sr2-living', alt: 'Living comedor del showroom de Galinda! con mesa y sillón', grande: true },
  { img: 'sr2-living-balcon', alt: 'Living con salida al balcón y vista al campo' },
  { img: 'sr2-cocina', alt: 'Cocina integrada con isla y anafe' },
  { img: 'sr2-dormitorio', alt: 'Dormitorio principal del showroom' },
  { img: 'sr2-dormitorio-2', alt: 'Segundo dormitorio con escritorio' },
  { img: 'sr2-bano', alt: 'Baño con vanitory y bacha de apoyo' },
  { img: 'sr2-balcon', alt: 'Balcón con sillones y vista al campo' },
]

const OFICINA = [
  { img: 'of-oficina', alt: 'Oficina terminada, vacía y luminosa', pie: 'La oficina' },
  { img: 'of-ventanales', alt: 'Oficina con ventanales de piso a techo', pie: 'Ventanales' },
  { img: 'of-balcon', alt: 'Balcón de la oficina con vista al campo', pie: 'Balcón' },
  { img: 'of-office', alt: 'Office con mesada y bajo mesada', pie: 'Office' },
  { img: 'of-banos', alt: 'Baños del piso de oficinas', pie: 'Baños' },
  { img: 'of-hall', alt: 'Hall de acceso a las oficinas', pie: 'Hall de oficinas' },
  { img: 'of-edificio', alt: 'Edificio de oficinas sobre la plazoleta', pie: 'El edificio de oficinas' },
]

const COCHERAS = [
  { img: 'co-cocheras', alt: 'Cocheras cubiertas de Galinda!', pie: 'Cocheras cubiertas' },
  { img: 'co-cocheras-2', alt: 'Cocheras cubiertas con ventilación natural', pie: 'Cocheras cubiertas' },
  { img: 'co-cocheras-3', alt: 'Sector de cocheras cubiertas', pie: 'Cocheras cubiertas' },
  { img: 'co-cortesia', alt: 'Estacionamiento de cortesía frente al conjunto', pie: 'Estacionamiento de cortesía' },
]

const OBRA = [
  { img: 'obra2-frente', alt: 'Frente de Galinda! sobre Av. Galindo, con el cartel de Fundar', pie: 'El frente sobre Galindo' },
  { img: 'obra2-calle', alt: 'Calle interna adoquinada entre los edificios', pie: 'La calle interna' },
  { img: 'obra2-paseo', alt: 'Acceso al paseo comercial y las oficinas', pie: 'El paseo comercial' },
  { img: 'obra2-locales', alt: 'Interior de un local comercial en obra', pie: 'Los locales' },
  { img: 'obra2-entre', alt: 'Pasaje entre los edificios de departamentos', pie: 'Entre los edificios' },
  { img: 'obra2-escalera', alt: 'Escalera y ascensor de un edificio de departamentos', pie: 'Escaleras y ascensor' },
  { img: 'obra-dron', alt: 'Vista aérea de la obra de Galinda! sobre la bajada de la autopista', pie: 'Desde el dron (Fundar)' },
]

const PROYECTO = [
  { img: 'r-plazoleta', alt: 'Render de la plazoleta central con locales y oficinas', pie: 'La plazoleta' },
  { img: 'r-paseo', alt: 'Render del paseo comercial techado', pie: 'El paseo comercial' },
  { img: 'r-aerea', alt: 'Render del estacionamiento de cortesía residencial, con el parque arriba', pie: 'Estacionamiento de cortesía residencial' },
  { img: 'r-gimnasio', alt: 'Render del gimnasio con vista al parque', pie: 'Gimnasio al parque' },
  { img: 'r-balcon', alt: 'Render de un balcón con vista al parque y la pileta', pie: 'Balcón al parque' },
  { img: 'r-exterior', alt: 'Render del conjunto visto desde Av. Galindo', pie: 'Desde Av. Galindo' },
]

const AMENITIES: { icono: LucideIcon; label: string }[] = [
  { icono: Waves, label: 'Pileta' },
  { icono: Sun, label: 'Solárium' },
  { icono: Trees, label: 'Parque interno' },
  { icono: Tent, label: 'Quincho' },
  { icono: Flame, label: 'Parrillero' },
  { icono: Users, label: 'Salón de usos múltiples' },
  { icono: Dumbbell, label: 'Gimnasio' },
  { icono: WashingMachine, label: 'Laundry' },
  { icono: Baby, label: 'Juegos de exterior' },
  { icono: Bike, label: 'Bicicletero' },
  { icono: Car, label: 'Cocheras opcionales' },
  { icono: Zap, label: 'Grupo electrógeno' },
  { icono: ShieldCheck, label: 'Seguridad' },
  { icono: Store, label: 'Paseo comercial' },
]

const UBICACION = [
  'Sobre la bajada de la autopista Rosario–Córdoba, en el acceso a Funes por calle Galindo.',
  'Frente a Lion Place, en la entrada de Funes.',
  'Con el paseo comercial abajo: comprás, comés y trabajás sin agarrar el auto.',
]

// Títulos como los de Fundar: Poppins, en verde, peso medio. Números: Poppins
// siempre (regla de la casa); texto corrido: la letra de la web.
function Seccion({
  id,
  titulo,
  bajada,
  className = '',
  children,
}: {
  id?: string
  titulo: string
  bajada?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className={`mx-auto max-w-6xl scroll-mt-24 px-4 py-14 md:py-20 ${className}`}>
      <h2 className="font-poppins text-[34px] font-medium leading-tight tracking-tight text-[var(--brand)] md:text-5xl">{titulo}</h2>
      {bajada && <p className="mt-3 max-w-2xl text-lg text-[var(--tinta-mute)]">{bajada}</p>}
      {children}
    </section>
  )
}

function Foto({ img, alt, pie, real }: { img: string; alt: string; pie: string; real?: boolean }) {
  return (
    <figure className="w-[78vw] max-w-[340px] flex-none snap-start md:w-[340px]">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[var(--cream)]">
        <Image src={`${GAL_BASE}/${img}.webp`} alt={alt} fill sizes="340px" className="object-cover" />
        {real && (
          <span className="absolute bottom-3 left-3 rounded-lg bg-black/55 px-2.5 py-1 text-xs font-semibold text-white">Foto real</span>
        )}
      </div>
      <figcaption className="mt-2 text-sm font-semibold">{pie}</figcaption>
    </figure>
  )
}

function VideoTarjeta({ src, poster, label, pie }: { src: string; poster: string; label: string; pie: string }) {
  return (
    <figure className="w-[78vw] max-w-[340px] flex-none snap-start md:w-[340px]">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[var(--cream)]">
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
        <span className="absolute bottom-3 left-3 rounded-lg bg-black/55 px-2.5 py-1 text-xs font-semibold text-white">Video real</span>
      </div>
      <figcaption className="mt-2 text-sm font-semibold">{pie}</figcaption>
    </figure>
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
    <div className="bg-[var(--background)] pb-24 text-[var(--foreground)] [font-variant-numeric:lining-nums] md:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Portada "revista" (David, 17-nov: la de foto oscura a todo el ancho quedaba
          igual a la de Fundar; eligió la opción C): video de dron arriba sin nada encima
          y un panel blanco montado sobre él con el nombre y los datos. ── */}
      <section>
        <div className="relative h-[46vh] min-h-[300px] overflow-hidden bg-[var(--cream)] md:h-[62vh] md:min-h-[420px]">
          {/* Póster como imagen con prioridad (LCP); con movimiento reducido queda solo la foto. */}
          <Image
            src={`${GAL_BASE}/video-portada-poster.webp`}
            alt="Vista aérea de Galinda! sobre Av. Galindo, con el cartel de Fundar"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <video
            src={`${GAL_BASE}/video-portada.mp4`}
            poster={`${GAL_BASE}/video-portada-poster.webp`}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
          />
          <span className="absolute right-3 top-3 rounded-lg bg-black/55 px-2.5 py-1 text-xs font-semibold text-white">
            Video real de la obra
          </span>
        </div>
        <div className="relative mx-auto -mt-10 grid max-w-[1120px] gap-6 rounded-t-[22px] bg-[var(--background)] px-4 pb-4 pt-6 md:-mt-[120px] md:grid-cols-[1.2fr_1fr] md:gap-10 md:rounded-t-[28px] md:px-12 md:pt-10">
          <div>
            <p className="font-poppins text-xs font-semibold uppercase tracking-[0.14em] text-[var(--tinta-mute)]">Galindo y Picton · Funes</p>
            <h1 className="font-poppins mt-2 text-[58px] font-semibold leading-none tracking-tight text-[var(--brand)] md:text-[84px]">Galinda!</h1>
            <p className="mt-4 text-lg text-[var(--tinta-mute)] md:text-xl">
              Departamentos de <span className="font-poppins">2</span> y <span className="font-poppins">3</span> dormitorios sobre un
              parque con pileta, una oficina y locales. El showroom ya está terminado: vení a verlo.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
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
                Ver unidades
              </a>
            </div>
          </div>
          <dl className="self-center">
            {[
              ['Avance de obra', `${GAL_AVANCE} %`],
              ['Tipologías', '2 y 3 dorm. · Oficina'],
              ['Entrega oficina', 'Ene 2027'],
              ['Entrega departamentos', 'Mar–Abr 2027'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-4 border-b border-[var(--line)] py-3.5">
                <dt className="text-[var(--tinta-mute)]">{k}</dt>
                <dd className="font-poppins whitespace-nowrap text-[22px] font-medium md:text-[26px]">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Cómo va a quedar: carrusel de renders, como Fundar ── */}
      <div className="pt-14 md:pt-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-poppins text-[34px] font-medium leading-tight tracking-tight text-[var(--brand)] md:text-5xl">Cómo va a quedar</h2>
          <p className="mt-3 max-w-2xl text-lg text-[var(--tinta-mute)]">
            Usos mixtos: departamentos alrededor de un parque con pileta, oficinas y un paseo comercial con{' '}
            <span className="font-poppins">39</span> locales.
          </p>
        </div>
        <div className="mt-7">
          <Carrusel label="Renders del proyecto">
            {PROYECTO.map((f) => (
              <Foto key={f.img} {...f} />
            ))}
          </Carrusel>
        </div>
      </div>

      {/* ── Amenidades con íconos, como Fundar ── */}
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-[1fr_1.6fr] md:items-center md:py-20">
        <div>
          <h2 className="font-poppins text-[34px] font-medium leading-tight tracking-tight text-[var(--brand)] md:text-5xl">Amenidades</h2>
          <p className="mt-3 text-lg text-[var(--tinta-mute)]">
            Espacios para disfrutar sin salir de casa, y todo lo del día a día resuelto en el mismo lugar.
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
          {AMENITIES.map(({ icono: Icono, label }) => (
            <li key={label} className="flex items-center gap-3">
              <Icono className="h-7 w-7 flex-none text-[var(--brand)]" strokeWidth={1.4} aria-hidden />
              <span className="text-[15px] leading-tight">{label}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Showroom: lo que Fundar no muestra ── */}
      <div className="bg-[var(--cream)]">
        <Seccion
          id="showroom"
          titulo="El showroom, terminado"
          bajada={<>Fotos y video reales, sacados el <span className="font-poppins">{GAL_FECHA_FOTOS}</span>. No son renders: así queda tu departamento.</>}
        >
          <div className="mt-7 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-[var(--background)]">
              <video
                src={`${GAL_BASE}/video-showroom.mp4`}
                poster={`${GAL_BASE}/video-showroom-poster.webp`}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="Recorrido en video por el showroom de Galinda!"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <span className="absolute bottom-3 left-3 rounded-lg bg-black/55 px-2.5 py-1 text-xs font-semibold text-white">Video real</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {SHOWROOM.map((f) => (
                <div
                  key={f.img}
                  className={`relative overflow-hidden rounded-2xl bg-[var(--background)] ${f.grande ? 'col-span-2 aspect-[16/10]' : 'aspect-[4/3]'}`}
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
      </div>

      {/* ── La oficina disponible y las cocheras: fotos reales ── */}
      <div className="pt-14 md:pt-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-poppins text-[34px] font-medium leading-tight tracking-tight text-[var(--brand)] md:text-5xl">La oficina</h2>
          <p className="mt-3 max-w-2xl text-lg text-[var(--tinta-mute)]">
            Queda una sola: la <span className="font-poppins">03-02</span>, de <span className="font-poppins">51</span> m², frente a la plazoleta y orientada al norte. Se entrega en enero de{' '}
            <span className="font-poppins">2027</span>.
          </p>
        </div>
        <div className="mt-7">
          <Carrusel label="Fotos de la oficina">
            {OFICINA.map((f) => (
              <Foto key={f.img} {...f} real />
            ))}
          </Carrusel>
        </div>
      </div>

      <div className="pt-14 md:pt-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-poppins text-[34px] font-medium leading-tight tracking-tight text-[var(--brand)] md:text-5xl">Cocheras</h2>
          <p className="mt-3 max-w-2xl text-lg text-[var(--tinta-mute)]">
            Cocheras cubiertas opcionales: se suman aparte a la unidad. Y estacionamiento de cortesía para las visitas.
          </p>
        </div>
        <div className="mt-7">
          <Carrusel label="Fotos de las cocheras">
            {COCHERAS.map((f) => (
              <Foto key={f.img} {...f} real />
            ))}
          </Carrusel>
        </div>
      </div>

      {/* ── Avances de obra: carrusel, como Fundar (con nuestras fotos y video) ── */}
      <div className="pt-14 md:pt-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-poppins text-[34px] font-medium leading-tight tracking-tight text-[var(--brand)] md:text-5xl">Avances de obra</h2>
          <p className="mt-3 max-w-2xl text-lg text-[var(--tinta-mute)]">
            Así estaba el <span className="font-poppins">{GAL_FECHA_FOTOS}</span>, con la obra al <span className="font-poppins">{GAL_AVANCE} %</span>: edificios
            levantados, terminando interiores y el paseo.
          </p>
        </div>
        <div className="mt-7">
          <Carrusel label="Fotos y video de la obra">
            <VideoTarjeta
              src={`${GAL_BASE}/video-obra.mp4`}
              poster={`${GAL_BASE}/video-obra-poster.webp`}
              label="Recorrido en video por la obra de Galinda!"
              pie="Recorrido por la obra"
            />
            {OBRA.map((f) => (
              <Foto key={f.img} {...f} real />
            ))}
          </Carrusel>
        </div>
      </div>

      {/* ── Unidades: tarjetas con plano, como Fundar ── */}
      <div className="mt-14 bg-[var(--cream)] md:mt-20">
        <Seccion
          id="unidades"
          titulo="Unidades disponibles"
          bajada="Una selección de las disponibles: hay más en cada tipología. Tocá el plano para verlo grande y pedinos el precio o la unidad que buscás por WhatsApp."
        >
          <ListaUnidades />
        </Seccion>
      </div>

      {/* ── Cómo se paga ── */}
      <Seccion id="pago" titulo="Cómo se paga">
        <div className="mt-7 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--line)] p-6">
            <p className="font-poppins text-5xl font-medium tracking-tight text-[var(--brand)]">30 %</p>
            <p className="mt-2 text-lg font-bold">de anticipo</p>
          </div>
          <div className="rounded-2xl border border-[var(--line)] p-6">
            <p className="font-poppins text-5xl font-medium tracking-tight text-[var(--brand)]">12 o 24</p>
            <p className="mt-2 text-lg font-bold">cuotas para el resto</p>
          </div>
          <div className="rounded-2xl border border-[var(--line)] p-6">
            <p className="font-poppins text-5xl font-medium tracking-tight text-[var(--brand)]">$ + CAC</p>
            <p className="mt-2 text-lg font-bold">cuotas en pesos, si preferís</p>
          </div>
        </div>
        <div className="mt-5 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <p className="text-[var(--tinta-mute)]">{GAL_FORMA_PAGO.moneda} Te armamos la cuenta de la unidad que elijas.</p>
          <WaGalinda origen="pago" label="Pedir el plan de pagos" text="Hola! Quiero el precio y el plan de pagos de Galinda!." />
        </div>
      </Seccion>

      {/* ── Ubicación ── */}
      <Seccion id="ubicacion" titulo="Dónde está" className="pt-0 md:pt-0">
        <div className="mt-7 grid gap-6 md:grid-cols-[1fr_1.3fr]">
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
        <div className="grid items-center gap-6 rounded-3xl bg-[#17613C] p-6 text-white md:grid-cols-[1.3fr_1fr] md:p-10">
          <div>
            <h2 className="font-poppins text-3xl font-medium tracking-tight md:text-4xl">Vení a conocer el showroom</h2>
            <p className="mt-2 text-white/85">
              Te mostramos el departamento terminado y la unidad que te interese, y te pasamos el precio y las formas de pago.
            </p>
          </div>
          <div>
            <p className="font-poppins mb-3 select-all text-3xl font-medium tabular-nums">341 334-0916</p>
            <WaGalinda
              origen="cierre"
              label="Escribinos por WhatsApp"
              text="Hola! Quiero coordinar una visita al showroom de Galinda!."
              className="w-full !bg-white py-3.5 text-base !text-[#17613C] hover:!bg-white/90"
            />
          </div>
        </div>
        <p className="mt-7 max-w-3xl text-xs leading-relaxed text-[var(--tinta-mute)]">
          Desarrolla y construye Fundar (fundar.com.ar). Las fotos y videos del showroom y de la obra son reales, del{' '}
          {GAL_FECHA_FOTOS}; las imágenes de «Cómo va a quedar» son renders ilustrativos del proyecto. Superficies
          aproximadas, sujetas a ajustes del proyecto final. Entrega estimada: oficinas, {GAL_ENTREGA_OFICINAS}; departamentos,{' '}
          {GAL_ENTREGA_VIVIENDAS}. Forma de pago sujeta a confirmación del desarrollador. Comercializa SI INMOBILIARIA.
        </p>
      </section>

      {/* ── Barra fija en el celu ── */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-[var(--background)]/95 p-3 backdrop-blur md:hidden">
        <WaGalinda origen="barra" label="Consultar por WhatsApp" className="w-full py-3.5 text-base" />
      </div>
    </div>
  )
}
