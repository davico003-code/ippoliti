// Landing de Fisherton Work — parque logístico y comercial en Fisherton,
// Rosario (NM Capital + Provectta). No está en el feed de HILO: ruta estática
// propia (le gana al [slug] dinámico), mismo patrón que Fincazul. Datos de
// lotes y constantes en src/lib/fisherton-work.ts; assets en
// public/emprendimientos/fisherton-work.

import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  Briefcase,
  Car,
  ChevronDown,
  Navigation,
  Package,
  Plane,
  Store,
  Truck,
  Warehouse,
  Building2,
  TrendingUp,
  ShoppingCart,
  Trophy,
} from 'lucide-react'
import HeroBgVideo from '@/components/fincazul/HeroBgVideo'
import FincazulGaleriaLazy from '@/components/fincazul/FincazulGaleriaLazy'
import LandingLeadForm from '@/components/landing/LandingLeadForm'
import Masterplan from '@/components/fisherton-work/Masterplan'
import UnidadTipo from '@/components/fisherton-work/UnidadTipo'
import WaCta from '@/components/fisherton-work/WaCta'
import { FW_ADDRESS, FW_BASE, FW_GEO, FW_URL } from '@/lib/fisherton-work'

const GREEN = '#1A5C38'

const TITLE = 'Fisherton Work · Parque logístico y comercial en Rosario | SI INMOBILIARIA'
const DESCRIPTION =
  'Fisherton Work: 43 unidades 4 en 1 (showroom, depósito, oficina y 5 cocheras) sobre lotes desde 400 m², a 300 m de Av. Jorge Newbery y 700 m de Circunvalación. Masterplan interactivo, planos y precios con SI INMOBILIARIA.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: FW_URL },
  openGraph: {
    title: 'Fisherton Work · Tu empresa, en un solo lugar',
    description:
      'Showroom, depósito, oficina y cocheras propias en Fisherton, Rosario. 43 unidades sobre lotes desde 400 m². Elegí tu lote en el masterplan interactivo.',
    url: FW_URL,
    siteName: 'SI INMOBILIARIA',
    images: [{ url: 'https://siinmobiliaria.com/og-fisherton-work.jpg', width: 1200, height: 630, type: 'image/jpeg', alt: 'Fisherton Work — Rosario' }],
    locale: 'es_AR',
    type: 'website',
  },
}

const STATS = [
  { v: '43', l: 'Unidades' },
  { v: '400 m²', l: 'Lote desde' },
  { v: '200 m²', l: 'Cubiertos por unidad' },
  { v: '5', l: 'Cocheras propias' },
  { v: '300 m', l: 'De Av. Jorge Newbery' },
]

const CUATRO_EN_UNO = [
  {
    icon: Store,
    n: '01',
    titulo: 'Showroom',
    texto: 'Salón vidriado en planta baja con 16 m de frente. Tu marca a la vista de quien pasa.',
    img: 'interior-showroom.webp',
  },
  {
    icon: Package,
    n: '02',
    titulo: 'Depósito',
    texto: 'Planta libre para stock y logística, con la calle interna llegando hasta la puerta.',
    img: 'render-acceso.webp',
  },
  {
    icon: Briefcase,
    n: '03',
    titulo: 'Oficina',
    texto: 'Entrepiso de 100 m² para administración y ventas, separado de la operación.',
    img: 'interior-oficina.webp',
  },
  {
    icon: Car,
    n: '04',
    titulo: 'Cocheras',
    texto: 'Cinco cocheras propias dentro del lote para tu equipo y tus clientes.',
    img: 'render-frente.webp',
  },
]

const USOS = [
  { icon: Truck, titulo: 'Distribuidoras y mayoristas', texto: 'Stock abajo, ventas arriba y carga en la puerta.' },
  { icon: ShoppingCart, titulo: 'E-commerce y última milla', texto: 'A minutos de Circunvalación para despachar a todo Rosario.' },
  { icon: Store, titulo: 'Showrooms y franquicias', texto: 'Frente vidriado y estacionamiento para recibir clientes.' },
  { icon: Building2, titulo: 'Estudios y empresas de servicios', texto: 'Oficina propia con depósito para equipos e insumos.' },
  { icon: Boxes, titulo: 'Operaciones que crecen', texto: 'Unificá lotes linderos cuando necesites más metros.' },
  { icon: TrendingUp, titulo: 'Inversores', texto: 'Un activo comercial en una zona en plena expansión.' },
]

const DISTANCIAS = [
  { icon: Navigation, lugar: 'Av. Jorge Newbery', dist: '300 m' },
  { icon: Trophy, lugar: 'Rosario Arena Sports', dist: '300 m' },
  { icon: ShoppingCart, lugar: 'Hipermercado Carrefour', dist: 'A metros' },
  { icon: Navigation, lugar: 'Av. de Circunvalación', dist: '700 m' },
  { icon: Plane, lugar: 'Aeropuerto Internacional Rosario', dist: '5 km' },
]

const GALERIA = [
  'render-conjunto.webp',
  'render-frente.webp',
  'render-oficina.webp',
  'render-acceso.webp',
  'interior-showroom.webp',
  'interior-oficina.webp',
]

const FAQ = [
  {
    q: '¿Dónde queda Fisherton Work?',
    a: `En ${FW_ADDRESS}, detrás de Carrefour, entre las calles Santa Coloma, Sánchez de Loria y Lago Puelo. Está a 300 metros de Av. Jorge Newbery y a 700 metros de Av. de Circunvalación, con salida directa a las autopistas.`,
  },
  {
    q: '¿Qué incluye cada unidad?',
    a: 'Cada unidad es un 4 en 1: salón vidriado de 100 m² en planta baja (showroom o depósito), entrepiso de 100 m² para oficinas y 5 cocheras propias dentro del lote. En total son 200 m² cubiertos sobre un lote desde 400 m².',
  },
  {
    q: '¿Se pueden unir varias unidades?',
    a: 'Sí. El proyecto permite unificar lotes linderos cuando la operación necesita más espacio. En el masterplan de esta página podés elegir varios lotes y ver cómo quedaría la unidad unificada.',
  },
  {
    q: '¿Qué usos permite?',
    a: 'El uso es logístico y comercial: locales, showrooms, oficinas y depósitos. El FOS es 0,60, es decir que se puede ocupar hasta el 60% del lote en planta.',
  },
  {
    q: '¿Quién desarrolla el proyecto?',
    a: 'Fisherton Work es un desarrollo de NM Capital y Provectta. SI INMOBILIARIA lo comercializa y te acompaña en toda la operación.',
  },
  {
    q: '¿Cuánto cuesta y hay financiación?',
    a: 'Los precios y las condiciones de financiación dependen del lote y del momento de la obra. Escribinos por WhatsApp y te pasamos la lista actualizada con la disponibilidad del día.',
  },
]

function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p className={`text-[11px] font-bold uppercase tracking-[0.22em] ${light ? 'text-[#7FD1A3]' : 'text-[#1A5C38]'}`}>
      {children}
    </p>
  )
}

export default function FishertonWorkPage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Place',
      name: 'Fisherton Work',
      description: DESCRIPTION,
      url: FW_URL,
      image: `https://siinmobiliaria.com${FW_BASE}/render-conjunto.webp`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Av. Hernán Pujato 7880',
        addressLocality: 'Rosario',
        addressRegion: 'Santa Fe',
        addressCountry: 'AR',
      },
      geo: { '@type': 'GeoCoordinates', latitude: FW_GEO.lat, longitude: FW_GEO.lng },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://siinmobiliaria.com' },
        { '@type': 'ListItem', position: 2, name: 'Emprendimientos', item: 'https://siinmobiliaria.com/emprendimientos' },
        { '@type': 'ListItem', position: 3, name: 'Fisherton Work', item: FW_URL },
      ],
    },
  ]

  return (
    <div className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Hero ── */}
      <section className="relative flex min-h-[88svh] items-end overflow-hidden bg-[#0F1411]">
        <Image
          src={`${FW_BASE}/render-conjunto.webp`}
          alt="Fisherton Work — parque logístico y comercial en Fisherton, Rosario"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <HeroBgVideo poster={`${FW_BASE}/render-conjunto.webp`} mp4={`${FW_BASE}/recorrido.mp4`} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1411] via-black/40 to-black/30" />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-10 pt-36 text-white md:pb-14">
          <Link href="/emprendimientos" className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Emprendimientos
          </Link>
          <div className="mb-5 flex flex-wrap gap-2">
            <span className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white" style={{ background: GREEN }}>
              Parque logístico y comercial
            </span>
            <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
              Fisherton · Rosario
            </span>
          </div>
          <h1 className="text-[clamp(3rem,11vw,7.5rem)] font-black leading-[0.9] tracking-tight drop-shadow-lg">
            Fisherton
            <br />
            Work
          </h1>
          <p className="mt-5 max-w-xl text-lg font-medium leading-snug text-white/90 md:text-2xl">
            Tu empresa, en un solo lugar: showroom, depósito, oficina y cocheras propias.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <WaCta origen="hero" label="Quiero precios y disponibilidad" />
            <a
              href="#masterplan"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              Elegir mi lote <ChevronDown className="h-4 w-4" />
            </a>
          </div>

          {/* Números */}
          <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-3 md:grid-cols-5">
            {STATS.map((s, i) => (
              <div key={s.l} className={`bg-[#0F1411]/70 px-4 py-4 backdrop-blur-md md:px-5 ${i === 4 ? 'col-span-2 sm:col-span-1' : ''}`}>
                <dd className="font-numeric text-2xl font-bold md:text-3xl">{s.v}</dd>
                <dt className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/55">{s.l}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Concepto 4 en 1 ── */}
      <section className="px-5 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 items-end gap-6 md:grid-cols-2 md:gap-12">
            <div>
              <Eyebrow>El concepto</Eyebrow>
              <h2 className="mt-3 text-4xl font-black leading-[1.02] tracking-tight text-gray-900 md:text-6xl">
                <span className="font-numeric">4</span> en <span className="font-numeric">1</span>.
                <br />
                <span className="text-gray-400">Una sola llave.</span>
              </h2>
            </div>
            <p className="text-lg leading-relaxed text-gray-600">
              Hoy muchas empresas pagan un local para vender, un depósito en otra punta y una oficina en el centro. En
              Fisherton Work las cuatro cosas conviven en tu propia unidad, con diseño industrial y a metros de
              Circunvalación.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 md:mt-12 md:gap-4 lg:grid-cols-4">
            {CUATRO_EN_UNO.map(({ icon: Icon, n, titulo, texto, img }) => (
              <article key={titulo} className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm md:rounded-3xl">
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <Image
                    src={`${FW_BASE}/${img}`}
                    alt={`Fisherton Work — ${titulo.toLowerCase()}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                  <span className="font-numeric absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-gray-900 backdrop-blur">
                    {n}
                  </span>
                </div>
                <div className="p-3.5 md:p-5">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 md:h-5 md:w-5" style={{ color: GREEN }} strokeWidth={2} />
                    <h3 className="text-base font-black text-gray-900 md:text-lg">{titulo}</h3>
                  </div>
                  <p className="mt-1.5 text-[13px] leading-snug text-gray-500 md:mt-2 md:text-sm md:leading-relaxed">{texto}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Unidad tipo ── */}
      <section id="unidad" className="bg-gray-50 px-5 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <Eyebrow>La unidad</Eyebrow>
          <h2 className="mb-10 mt-3 max-w-2xl text-3xl font-black leading-tight tracking-tight text-gray-900 md:text-5xl">
            <span className="font-numeric">200</span> m² cubiertos sobre un lote de <span className="font-numeric">400</span> m².
          </h2>
          <UnidadTipo />
        </div>
      </section>

      {/* ── Masterplan ── */}
      <section id="masterplan" className="scroll-mt-20 px-5 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 grid grid-cols-1 items-end gap-5 md:grid-cols-2 md:gap-12">
            <div>
              <Eyebrow>Masterplan interactivo</Eyebrow>
              <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-gray-900 md:text-5xl">
                Elegí tu lote. O sumá varios.
              </h2>
            </div>
            <p className="text-base leading-relaxed text-gray-600 md:text-lg">
              <span className="font-numeric">43</span> lotes de <span className="font-numeric">400</span> a{' '}
              <span className="font-numeric">735</span> m² en dos manzanas, con pasaje interno y frente a Av. Hernán
              Pujato. Si tu empresa necesita más metros, unificá lotes linderos.
            </p>
          </div>
          <Masterplan />
        </div>
      </section>

      {/* ── Galería ── */}
      <section className="px-5 pb-20 md:pb-28">
        <div className="mx-auto max-w-6xl">
          <Eyebrow>Galería</Eyebrow>
          <h2 className="mb-8 mt-3 text-3xl font-black tracking-tight text-gray-900 md:text-4xl">Así va a ser Fisherton Work</h2>
          <FincazulGaleriaLazy base={FW_BASE} items={GALERIA} alt="Fisherton Work — render" layout="renders" />
        </div>
      </section>

      {/* ── Para quién ── */}
      <section className="bg-[#0F1411] px-5 py-20 text-white md:py-28">
        <div className="mx-auto max-w-6xl">
          <Eyebrow light>Para quién es</Eyebrow>
          <h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight tracking-tight md:text-5xl">
            Pensado para empresas que venden, guardan y despachan.
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-3xl bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {USOS.map(({ icon: Icon, titulo, texto }) => (
              <div key={titulo} className="bg-[#0F1411] p-7">
                <Icon className="h-6 w-6 text-[#7FD1A3]" strokeWidth={1.8} />
                <h3 className="mt-4 text-lg font-bold">{titulo}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/60">{texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ubicación ── */}
      <section id="ubicacion" className="px-5 py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
          <div>
            <Eyebrow>Ubicación</Eyebrow>
            <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-gray-900 md:text-5xl">
              Entre Newbery y Circunvalación.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-gray-600 md:text-lg">
              Detrás de Carrefour, en el corredor comercial y logístico que más crece de Rosario. Salís a Circunvalación
              y en minutos estás en las autopistas a Córdoba, Santa Fe y Buenos Aires.
            </p>
            <ul className="mt-8 divide-y divide-gray-100 border-y border-gray-100">
              {DISTANCIAS.map(({ icon: Icon, lugar, dist }) => (
                <li key={lugar} className="flex items-center justify-between gap-4 py-3.5">
                  <span className="flex items-center gap-3 text-[15px] font-semibold text-gray-800">
                    <Icon className="h-4 w-4" style={{ color: GREEN }} /> {lugar}
                  </span>
                  <span className="font-numeric text-base font-bold text-gray-900">{dist}</span>
                </li>
              ))}
            </ul>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Av.+Hern%C3%A1n+Pujato+7880%2C+Rosario%2C+Santa+Fe"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold hover:underline"
              style={{ color: GREEN }}
            >
              Cómo llegar <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="relative min-h-[360px] overflow-hidden rounded-3xl border border-gray-200 bg-gray-100 shadow-sm lg:min-h-0">
            <iframe
              title="Mapa de Fisherton Work"
              src="https://www.google.com/maps?q=Pujato+7880,+Rosario,+Santa+Fe,+Argentina&z=15&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
        </div>
      </section>

      {/* ── Respaldo ── */}
      <section className="px-5 pb-20 md:pb-28">
        <div className="mx-auto grid max-w-6xl grid-cols-1 overflow-hidden rounded-3xl md:grid-cols-2">
          <div className="relative min-h-[280px]">
            <Image
              src={`${FW_BASE}/render-oficina.webp`}
              alt="Oficinas en el entrepiso de Fisherton Work"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="flex flex-col justify-center p-8 text-white md:p-12" style={{ background: GREEN }}>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/70">El respaldo</p>
            <p className="mt-3 text-2xl font-black leading-snug md:text-3xl">
              Desarrollan NM Capital y Provectta. Comercializa SI INMOBILIARIA.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-white/75">
              Te acompañamos desde la elección del lote hasta la escritura, con más de <span className="font-numeric">40</span>{' '}
              años en el mercado de Rosario, Funes y Roldán.
            </p>
            <div className="mt-6">
              <WaCta origen="respaldo" label="Hablar con un asesor" className="!bg-white !text-[#1A5C38]" />
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-gray-50 px-5 py-20 md:py-28">
        <div className="mx-auto max-w-3xl">
          <Eyebrow>Preguntas frecuentes</Eyebrow>
          <h2 className="mb-8 mt-3 text-3xl font-black tracking-tight text-gray-900 md:text-4xl">Lo que más nos preguntan</h2>
          <div className="divide-y divide-gray-200 rounded-3xl border border-gray-200 bg-white">
            {FAQ.map((f) => (
              <details key={f.q} className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-bold text-gray-900">
                  {f.q}
                  <ChevronDown className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-[15px] leading-relaxed text-gray-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section id="contacto" className="relative overflow-hidden px-5 py-20 text-white md:py-28">
        <Image src={`${FW_BASE}/render-conjunto.webp`} alt="" fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-[#0B2A19]/90" />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-14">
          <div>
            <Warehouse className="h-8 w-8 text-[#7FD1A3]" strokeWidth={1.6} />
            <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight md:text-5xl">
              Tu próximo capítulo empieza en Fisherton.
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-white/75">
              Dejanos tu WhatsApp y te mandamos la lista de precios, la disponibilidad del día y las condiciones de
              financiación.
            </p>
            <div className="mt-6">
              <WaCta origen="cta-final" label="Escribir ahora por WhatsApp" />
            </div>
          </div>
          <div className="rounded-3xl border border-white/15 bg-white/[0.06] p-6 backdrop-blur-sm md:p-8">
            <p className="mb-4 text-sm font-bold text-white/85">Prefiero que me contacten</p>
            <LandingLeadForm
              origen="emprendimiento-fisherton-work"
              operation="Sale"
              propertyType="Local / depósito (Fisherton Work)"
              ciudad="Fisherton Work · Rosario"
              budgetMin={null}
              budgetMax={null}
            />
          </div>
        </div>
      </section>

      <WaCta origen="fab" fab />
    </div>
  )
}
