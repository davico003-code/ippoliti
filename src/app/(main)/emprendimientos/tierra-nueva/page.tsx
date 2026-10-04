// Landing de Tierra Nueva — Condos 22, 23 y 24 en Fisherton, Rosario
// (NM Capital + Proyectta). No está en el feed de HILO como emprendimiento:
// ruta estática propia (le gana al [slug] dinámico), mismo patrón que Fisherton
// Work. Datos, precios y tipologías en src/lib/tierra-nueva.ts; assets en
// public/emprendimientos/tierra-nueva.
//
// Material: renders/planos oficiales (condos22-23-24.com.ar + anexo comercial
// de Condo 22), fotos reales del barrio y de un departamento entregado en
// Condo 7 (aviso propio en HILO), fotos de condos terminados de proyectta.com.ar.

import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Car,
  ChevronDown,
  Droplets,
  Flame,
  KeyRound,
  Plane,
  ShieldCheck,
  ShoppingBag,
  Trees,
  Users,
  Waves,
  Wifi,
  Navigation,
  Building2,
  ArrowUpDown,
} from 'lucide-react'
import FincazulGaleriaLazy from '@/components/fincazul/FincazulGaleriaLazy'
import HeroBgVideo from '@/components/fincazul/HeroBgVideo'
import LandingLeadForm from '@/components/landing/LandingLeadForm'
import ComoSePaga from '@/components/tierra-nueva/ComoSePaga'
import PlanoBarrio from '@/components/tierra-nueva/PlanoBarrio'
import PlantasEdificio from '@/components/tierra-nueva/PlantasEdificio'
import Tipologias from '@/components/tierra-nueva/Tipologias'
import MarcaDesarrollador, { PROYECTTA_LOGO } from '@/components/landing/MarcaDesarrollador'
import WaCta from '@/components/tierra-nueva/WaCta'
import { TN_BASE, TN_GEO, TN_PRECIOS, TN_URL, cuotaMensual, usd } from '@/lib/tierra-nueva'
import Num from '@/components/tierra-nueva/Num'

const GREEN = '#1A5C38'

const TITLE = 'Tierra Nueva · Departamentos en cuotas en Fisherton | SI INMOBILIARIA'
const DESCRIPTION = `Condos 22, 23 y 24 de Tierra Nueva, Fisherton: departamentos de 1 y 2 dormitorios con cochera, pileta y SUM. Desde ${usd(
  TN_PRECIOS.unDorm.contado,
)} de contado o ${TN_PRECIOS.cuotas} cuotas fijas en dólares sin anticipo. Planos, precios y financiación con SI INMOBILIARIA.`

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: TN_URL },
  openGraph: {
    title: 'Tierra Nueva · Tu departamento en Fisherton, en cuotas fijas en dólares',
    description: `1 y 2 dormitorios con cochera. Desde ${usd(cuotaMensual(TN_PRECIOS.unDorm.financiado))} por mes, sin anticipo. Un barrio con más de 500 departamentos ya entregados.`,
    url: TN_URL,
    siteName: 'SI INMOBILIARIA',
    images: [{ url: 'https://siinmobiliaria.com/og-tierra-nueva.jpg', width: 1200, height: 630, type: 'image/jpeg', alt: 'Condo 22 — Tierra Nueva, Fisherton' }],
    locale: 'es_AR',
    type: 'website',
  },
}

const CUOTA_1D = cuotaMensual(TN_PRECIOS.unDorm.financiado)

const STATS = [
  { v: usd(TN_PRECIOS.unDorm.contado), l: 'Desde, de contado' },
  { v: `${TN_PRECIOS.cuotas} cuotas`, l: 'Fijas en USD, sin anticipo' },
  { v: '1 y 2', l: 'Dormitorios' },
  { v: 'Incluida', l: 'Cochera propia' },
  { v: '+500', l: 'Deptos entregados en el barrio' },
]

const PASOS = [
  { n: '1', t: 'Elegís', d: 'Condo, tipo de departamento y orientación.' },
  { n: '2', t: 'Reservás', d: 'Con la primera cuota o con tu entrega.' },
  { n: '3', t: 'Pagás fijo', d: `${TN_PRECIOS.cuotas} cuotas en dólares que no cambian.` },
  { n: '4', t: 'Te mudás', d: `Condo 22: entrega estimada ${TN_PRECIOS.entregaCondo22.toLowerCase()}.` },
]

const SERVICIOS = [
  { icon: Droplets, t: 'Agua y cloacas' },
  { icon: Navigation, t: 'Calles pavimentadas' },
  { icon: Wifi, t: 'Fibra óptica' },
  { icon: ShieldCheck, t: 'Seguridad privada' },
  { icon: ShoppingBag, t: 'Comercios en el barrio' },
  { icon: Trees, t: 'Plazas y espacio verde' },
]

const ENTREGADOS = [
  { img: 'condo-7.webp', n: 'Condo 7' },
  { img: 'condo-8.webp', n: 'Condo 8' },
  { img: 'condo-9.webp', n: 'Condo 9' },
  { img: 'condo-loft.webp', n: 'Condo Loft' },
  { img: 'condo-suite.webp', n: 'Condo Suite' },
  { img: 'condo-3.webp', n: 'Condo 3' },
]

const AMENITIES = [
  { icon: Waves, t: 'Pileta', d: 'En el jardín de cada edificio' },
  { icon: Users, t: 'SUM', d: 'Para reuniones y cumpleaños' },
  { icon: Flame, t: 'Parrilla', d: 'De uso común, junto al SUM' },
  { icon: Trees, t: 'Jardín', d: 'Espacio verde recreativo' },
  { icon: Car, t: '36 cocheras', d: 'Una por departamento' },
  { icon: ArrowUpDown, t: 'Ascensor', d: 'En los 4 pisos' },
]

const TERMINACIONES = [
  'Pisos cerámicos símil madera en todos los ambientes',
  'Aberturas de aluminio con DVH (doble vidrio)',
  'Placares con interiores completos',
  'Cocina con bajo mesada y alacenas',
  'Balcón con espacio para parrillero',
  'Previsión para aire acondicionado',
  'Portero eléctrico',
]

const ENTREGADO_FOTOS = ['entregado-living.webp', 'entregado-cocina.webp', 'entregado-balcon.webp', 'entregado-bano.webp']

const DISTANCIAS = [
  { icon: Building2, lugar: 'Country Carlos Pellegrini', dist: '800 m' },
  { icon: Navigation, lugar: 'Autopista Rosario–Córdoba', dist: '2 km' },
  { icon: ShoppingBag, lugar: 'Fisherton Plaza y Av. Jorge Newbery', dist: '2 km' },
  { icon: Plane, lugar: 'Aeropuerto Internacional Rosario', dist: '2,2 km' },
  { icon: Navigation, lugar: 'Bv. Wilde', dist: '2,3 km' },
]

const FAQ = [
  {
    q: '¿Cuánto cuesta un departamento en Tierra Nueva?',
    a: `El departamento de 1 dormitorio con cochera arranca en ${usd(TN_PRECIOS.unDorm.contado)} de contado, o ${usd(
      TN_PRECIOS.unDorm.financiado,
    )} financiado en ${TN_PRECIOS.cuotas} cuotas fijas de ${usd(CUOTA_1D)}. El de 2 dormitorios se financia en ${
      TN_PRECIOS.cuotas
    } cuotas de ${usd(cuotaMensual(TN_PRECIOS.dosDorm.financiado))}. Escribinos y te pasamos la lista del día.`,
  },
  {
    q: '¿Hace falta un anticipo?',
    a: `No. Podés pagar el 100% en ${TN_PRECIOS.cuotas} cuotas fijas en dólares sin anticipo. Si tenés una entrega inicial, también se puede: el saldo va en cuotas y el precio total baja.`,
  },
  {
    q: '¿Las cuotas se ajustan?',
    a: 'No. Son cuotas fijas en dólares: lo que pagás el primer mes es lo que pagás el último.',
  },
  {
    q: '¿Cuándo se entrega?',
    a: `Condo 22 tiene entrega estimada en ${TN_PRECIOS.entregaCondo22.toLowerCase()}. Para Condo 23 y Condo 24 consultanos la fecha actualizada.`,
  },
  {
    q: '¿La cochera está incluida?',
    a: 'Sí. Cada departamento tiene su cochera propia de 12,50 m² incluida en el precio.',
  },
  {
    q: '¿Dónde queda Tierra Nueva?',
    a: 'En Fisherton, Rosario, sobre las calles Casacuberta, Alippi, Parravicini y Malabia, a 800 m del Country Carlos Pellegrini y a unos 2 km del aeropuerto, de Fisherton Plaza y de la autopista a Córdoba.',
  },
  {
    q: '¿Quién lo construye?',
    a: 'Tierra Nueva es un desarrollo de Proyectta y NM Capital, que ya entregaron más de 500 unidades en el barrio. SI INMOBILIARIA lo comercializa y te acompaña en toda la operación.',
  },
]

function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p className={`text-[11px] font-bold uppercase tracking-[0.22em] ${light ? 'text-[#7FD1A3]' : 'text-[#1A5C38]'}`}>
      {children}
    </p>
  )
}

export default function TierraNuevaPage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'ApartmentComplex',
      name: 'Tierra Nueva — Condos 22, 23 y 24',
      description: DESCRIPTION,
      url: TN_URL,
      image: `https://siinmobiliaria.com${TN_BASE}/hero-atardecer.webp`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Casacuberta 9100',
        addressLocality: 'Rosario',
        addressRegion: 'Santa Fe',
        addressCountry: 'AR',
      },
      geo: { '@type': 'GeoCoordinates', latitude: TN_GEO.lat, longitude: TN_GEO.lng },
      amenityFeature: AMENITIES.map((a) => ({ '@type': 'LocationFeatureSpecification', name: a.t, value: true })),
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
        { '@type': 'ListItem', position: 3, name: 'Tierra Nueva', item: TN_URL },
      ],
    },
  ]

  return (
    <div className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Portada ── */}
      <section className="relative flex min-h-[92svh] items-end overflow-hidden bg-[#0E120F]">
        <Image
          src={`${TN_BASE}/portada-poster.webp`}
          alt="Condo 22 de Tierra Nueva al atardecer, Fisherton, Rosario"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* Recorrido de cámara generado con IA (Higgsfield · Kling) desde el render
            oficial; ida y vuelta para que el loop no salte. */}
        <HeroBgVideo poster={`${TN_BASE}/portada-poster.webp`} mp4={`${TN_BASE}/portada.mp4`} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E120F] via-black/45 to-black/10" />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-10 pt-36 text-white md:pb-14">
          <Link href="/emprendimientos" className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Emprendimientos
          </Link>
          <div className="mb-5 flex flex-wrap gap-2">
            <span className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white" style={{ background: GREEN }}>
              Condos <span className="font-numeric">22 · 23 · 24</span>
            </span>
            <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
              Fisherton · Rosario
            </span>
          </div>
          <h1 className="text-[clamp(3.2rem,12vw,8rem)] font-black leading-[0.88] tracking-tight drop-shadow-lg">
            Tierra
            <br />
            Nueva
          </h1>
          <p className="mt-5 max-w-xl text-lg font-medium leading-snug text-white/90 md:text-2xl">
            Tu departamento con cochera en Fisherton, desde{' '}
            <span className="font-numeric font-bold text-white">{usd(CUOTA_1D)}</span> por mes en cuotas fijas en dólares.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <WaCta origen="hero" label="Quiero precios y disponibilidad" />
            <a
              href="#como-se-paga"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              Cómo se paga <ChevronDown className="h-4 w-4" />
            </a>
          </div>

          <MarcaDesarrollador
            className="mt-10"
            marcas={[
              { rol: 'Un desarrollo de', nombre: 'Proyectta', logo: PROYECTTA_LOGO },
              { rol: 'junto a', nombre: 'NM Capital' },
            ]}
          />

          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-3 md:grid-cols-5">
            {STATS.map((s, i) => (
              <div key={s.l} className={`bg-[#0E120F]/70 px-4 py-4 backdrop-blur-md md:px-5 ${i === 4 ? 'col-span-2 sm:col-span-1' : ''}`}>
                <dd className="font-numeric text-xl font-bold md:text-2xl">{s.v}</dd>
                <dt className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/55"><Num>{s.l}</Num></dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Cómo se paga ── */}
      <section id="como-se-paga" className="scroll-mt-20 bg-gray-50 px-5 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 items-end gap-5 md:grid-cols-2 md:gap-12">
            <div>
              <Eyebrow>Cómo se paga</Eyebrow>
              <h2 className="mt-3 text-4xl font-black leading-[1.02] tracking-tight text-gray-900 md:text-6xl">
                Sin anticipo.
                <br />
                <span className="text-gray-400">Cuota fija en dólares.</span>
              </h2>
            </div>
            <p className="text-lg leading-relaxed text-gray-600">
              Elegí el tamaño y mirá cuánto pagás por mes. La cuota no se ajusta: lo que pagás el primer mes es lo que
              pagás el último.
            </p>
          </div>
          <div className="mt-10">
            <ComoSePaga />
          </div>

          <ol className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-gray-200 bg-gray-200 md:grid-cols-4">
            {PASOS.map((p) => (
              <li key={p.n} className="bg-white p-5 md:p-6">
                <span className="font-numeric text-sm font-black text-[#1A5C38]">0{p.n}</span>
                <p className="mt-2 text-lg font-black text-gray-900"><Num>{p.t}</Num></p>
                <p className="mt-1 text-sm leading-snug text-gray-500"><Num>{p.d}</Num></p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Un barrio que ya existe ── */}
      <section className="relative overflow-hidden bg-[#0E120F] text-white">
        <div className="relative h-[62svh] min-h-[420px] w-full md:h-[78svh]">
          <Image
            src={`${TN_BASE}/barrio-drone.webp`}
            alt="Vista aérea de Tierra Nueva, Fisherton: condos terminados, pileta y espacios verdes"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E120F] via-[#0E120F]/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-5 pb-10 md:pb-16">
            <Eyebrow light>Un barrio que ya existe</Eyebrow>
            <p className="mt-3 max-w-3xl text-4xl font-black leading-[1.02] tracking-tight md:text-7xl">
              Más de <span className="font-numeric text-[#7FD1A3]">500</span> departamentos ya entregados.
            </p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/75 md:text-lg">
              No comprás un pozo en el medio de la nada: Condo <span className="font-numeric">22</span>,{' '}
              <span className="font-numeric">23</span> y <span className="font-numeric">24</span> se suman a un barrio con vecinos, servicios y
              plazas, hecho por Proyectta, el mismo desarrollador.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-5 pb-20 md:pb-28">
          <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-white/10 sm:grid-cols-3 lg:grid-cols-6">
            {SERVICIOS.map(({ icon: Icon, t }) => (
              <li key={t} className="flex items-center gap-3 bg-[#0E120F] px-5 py-5">
                <Icon className="h-5 w-5 shrink-0 text-[#7FD1A3]" strokeWidth={1.8} />
                <span className="text-sm font-semibold"><Num>{t}</Num></span>
              </li>
            ))}
          </ul>

          <p className="mb-5 mt-14 text-sm font-bold text-white/80">Algunos condos que ya se construyeron en Tierra Nueva</p>
          <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0">
            {ENTREGADOS.map((e) => (
              <figure key={e.img} className="relative aspect-[4/3] w-[78%] shrink-0 snap-start overflow-hidden rounded-2xl bg-white/5 md:w-auto">
                <Image src={`${TN_BASE}/entregados/${e.img}`} alt={`${e.n}, Tierra Nueva — terminado`} fill className="object-cover" sizes="(max-width: 768px) 80vw, 33vw" />
                <figcaption className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-xs font-bold backdrop-blur">
                  <KeyRound className="h-3.5 w-3.5 text-[#7FD1A3]" /> <Num>{e.n}</Num>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-3 text-xs text-white/40">Fotos reales de edificios terminados del barrio.</p>
        </div>
      </section>

      {/* ── Los 3 edificios ── */}
      <section id="condos" className="scroll-mt-20 px-5 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 grid grid-cols-1 items-end gap-5 md:grid-cols-2 md:gap-12">
            <div>
              <Eyebrow>Los <span className="font-numeric">3</span> edificios</Eyebrow>
              <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-gray-900 md:text-5xl">
                Tres condos. Elegí dónde.
              </h2>
            </div>
            <p className="text-base leading-relaxed text-gray-600 md:text-lg">
              Mismo edificio en tres lugares del barrio: <span className="font-numeric">4</span> pisos,{' '}
              <span className="font-numeric">9</span> departamentos por piso y pileta, SUM y parrilla propios. Tocá un
              condo en el plano.
            </p>
          </div>
          <PlanoBarrio />
        </div>
      </section>

      {/* ── Elegí tu departamento ── */}
      <section id="departamentos" className="scroll-mt-20 bg-gray-50 px-5 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <Eyebrow>Elegí tu departamento</Eyebrow>
          <h2 className="mb-10 mt-3 max-w-3xl text-3xl font-black leading-tight tracking-tight text-gray-900 md:text-5xl">
            <span className="font-numeric">9</span> tipos, de <span className="font-numeric">42</span> a{' '}
            <span className="font-numeric">61</span> m², todos con balcón y cochera.
          </h2>
          <Tipologias />
        </div>
      </section>

      {/* ── Amenities ── */}
      <section className="px-5 py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-gray-100 lg:aspect-square">
            <Image
              src={`${TN_BASE}/barrio-pileta.webp`}
              alt="Vista aérea de la pileta y el jardín de un condo terminado en Tierra Nueva"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-3 py-1 text-xs font-bold text-white backdrop-blur">
              Así se vive hoy en Tierra Nueva
            </span>
          </div>
          <div>
            <Eyebrow>En tu edificio</Eyebrow>
            <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-gray-900 md:text-5xl">
              Pileta, SUM y parrilla, sin salir de casa.
            </h2>
            <ul className="mt-8 grid grid-cols-2 gap-3">
              {AMENITIES.map(({ icon: Icon, t, d }) => (
                <li key={t} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <Icon className="h-5 w-5" style={{ color: GREEN }} strokeWidth={1.9} />
                  <p className="mt-2 font-bold text-gray-900"><Num>{t}</Num></p>
                  <p className="text-[13px] leading-snug text-gray-500"><Num>{d}</Num></p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Interiores + terminaciones ── */}
      <section className="bg-[#0E120F] px-5 py-20 text-white md:py-28">
        <div className="mx-auto max-w-6xl">
          <Eyebrow light>Por dentro</Eyebrow>
          <h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight tracking-tight md:text-5xl">
            Ambientes luminosos, listos para vivir.
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
            {['interior-living.webp', 'interior-comedor.webp'].map((img, i) => (
              <div key={img} className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-white/5">
                <Image
                  src={`${TN_BASE}/${img}`}
                  alt={i === 0 ? 'Living comedor de un departamento de Tierra Nueva (render)' : 'Cocina integrada de un departamento de Tierra Nueva (render)'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-white/40">Imágenes ilustrativas.</p>

          <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14">
            <div>
              <h3 className="text-2xl font-black tracking-tight md:text-3xl">Terminaciones</h3>
              <ul className="mt-6 space-y-3">
                {TERMINACIONES.map((t) => (
                  <li key={t} className="flex items-start gap-3 text-[15px] text-white/80">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7FD1A3]" />
                    <Num>{t}</Num>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight md:text-3xl">Así se entregan</h3>
              <p className="mt-2 text-sm text-white/60">Fotos reales de un departamento ya entregado en Condo <span className="font-numeric">7</span>, del mismo barrio.</p>
              <div className="mt-6">
                <FincazulGaleriaLazy base={TN_BASE} items={ENTREGADO_FOTOS} alt="Departamento entregado en Tierra Nueva" layout="fotos" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Plantas del edificio ── */}
      <section className="px-5 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <Eyebrow>Plantas del edificio</Eyebrow>
          <h2 className="mb-3 mt-3 text-3xl font-black tracking-tight text-gray-900 md:text-4xl">Cómo está armado cada condo</h2>
          <p className="mb-8 max-w-2xl text-base text-gray-600">
            Planta baja con ingreso, SUM, parrilla, pileta y las <span className="font-numeric">36</span> cocheras. Arriba,{' '}
            <span className="font-numeric">9</span> departamentos por piso con frente al este o al oeste.
          </p>
          <PlantasEdificio />
        </div>
      </section>

      {/* ── Ubicación ── */}
      <section id="ubicacion" className="bg-gray-50 px-5 py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
          <div>
            <Eyebrow>Ubicación</Eyebrow>
            <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-gray-900 md:text-5xl">
              Fisherton, a minutos de todo.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-gray-600 md:text-lg">
              Entre el Country Carlos Pellegrini y Los Pasos, en la zona que más crece del oeste de Rosario, con salida
              rápida a la autopista a Córdoba y al aeropuerto.
            </p>
            <ul className="mt-8 divide-y divide-gray-200 border-y border-gray-200">
              {DISTANCIAS.map(({ icon: Icon, lugar, dist }) => (
                <li key={lugar} className="flex items-center justify-between gap-4 py-3.5">
                  <span className="flex items-center gap-3 text-[15px] font-semibold text-gray-800">
                    <Icon className="h-4 w-4 shrink-0" style={{ color: GREEN }} /> {lugar}
                  </span>
                  <span className="font-numeric shrink-0 text-base font-bold text-gray-900">{dist}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-gray-400">Distancias aproximadas.</p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${TN_GEO.lat},${TN_GEO.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold hover:underline"
              style={{ color: GREEN }}
            >
              Cómo llegar <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="grid grid-rows-[auto_minmax(320px,1fr)] gap-3">
            <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-gray-200">
              <Image
                src={`${TN_BASE}/barrio-drone-amplio.webp`}
                alt="Vista aérea de Tierra Nueva y su entorno en Fisherton"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
            </div>
            <div className="relative min-h-[320px] overflow-hidden rounded-3xl border border-gray-200 bg-gray-100 shadow-sm">
              <iframe
                title="Mapa de Tierra Nueva, Fisherton"
                src={`https://www.google.com/maps?q=${TN_GEO.lat},${TN_GEO.lng}&z=15&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Respaldo ── */}
      <section className="px-5 py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl grid-cols-1 overflow-hidden rounded-3xl md:grid-cols-2">
          <div className="relative min-h-[280px]">
            <Image
              src={`${TN_BASE}/entregados/condo-loft.webp`}
              alt="Condo Loft, Tierra Nueva — terminado"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="flex flex-col justify-center p-8 text-white md:p-12" style={{ background: GREEN }}>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/70">El respaldo</p>
            <Image src={PROYECTTA_LOGO.src} alt="Proyectta" width={PROYECTTA_LOGO.width} height={PROYECTTA_LOGO.height} className="mt-5 h-10 w-auto self-start md:h-12" />
            <p className="mt-3 text-2xl font-black leading-snug md:text-3xl">
              Desarrollan Proyectta y NM Capital. Comercializa SI INMOBILIARIA.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-white/75">
              Los que hicieron Tierra Nueva desde el primer condo. Nosotros te acompañamos desde la elección de la
              unidad hasta la escritura, con más de <span className="font-numeric">40</span> años en el mercado de
              Rosario, Funes y Roldán.
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
                  <Num>{f.q}</Num>
                  <ChevronDown className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-[15px] leading-relaxed text-gray-600"><Num>{f.a}</Num></p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section id="contacto" className="relative overflow-hidden px-5 py-20 text-white md:py-28">
        <Image src={`${TN_BASE}/hero-atardecer.webp`} alt="" fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-[#0B2A19]/90" />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-14">
          <div>
            <KeyRound className="h-8 w-8 text-[#7FD1A3]" strokeWidth={1.6} />
            <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight md:text-5xl">
              Tu llave en Fisherton, cuota a cuota.
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-white/75">
              Escribinos y te mandamos la lista de precios, las unidades disponibles hoy y el plan de cuotas que mejor te
              quede.
            </p>
            <div className="mt-6">
              <WaCta origen="cta-final" label="Escribir ahora por WhatsApp" />
            </div>
          </div>
          <div className="rounded-3xl border border-white/15 bg-white/[0.06] p-6 backdrop-blur-sm md:p-8">
            <p className="mb-4 text-sm font-bold text-white/85">Prefiero que me contacten</p>
            <LandingLeadForm
              origen="emprendimiento-tierra-nueva"
              operation="Sale"
              propertyType="Departamento (Tierra Nueva, Condos 22-23-24)"
              ciudad="Tierra Nueva · Fisherton"
              budgetMin={null}
              budgetMax={null}
            />
          </div>
        </div>
      </section>

      <footer className="px-5 py-6 text-center text-xs leading-relaxed text-gray-400">
        Imágenes y planos orientativos, sujetos a cambios municipales y/o del proyecto. No constituyen información contractual.
      </footer>

      <WaCta origen="fab" fab />
    </div>
  )
}
