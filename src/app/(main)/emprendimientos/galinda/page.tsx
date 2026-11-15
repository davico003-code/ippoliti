// Landing de Galinda! — conjunto de usos mixtos de Fundar en Galindo y Picton,
// Funes. Las unidades todavía no están en el feed de HILO (borradores GAL-*):
// ruta estática propia (le gana al [slug] dinámico), mismo patrón que Fisherton
// Work. Datos en src/lib/galinda.ts; renders y planos de Fundar en
// public/emprendimientos/galinda. El gancho es el 25 % de descuento de contado:
// nadie más lo publica (relevamiento 14-nov-2026).

import type { Metadata } from 'next'
import Image from '@/components/Imagen'
import PlanoBoton from '@/components/galinda/PlanoBoton'
import WaGalinda from '@/components/galinda/WaGalinda'
import {
  GAL_BASE,
  GAL_ENTREGA,
  GAL_URL,
  TIPO_LABEL,
  UNIDADES,
  contadoDesde,
  nombreUnidad,
  precioContado,
  usd,
  type TipoUnidad,
} from '@/lib/galinda'

const TITLE = 'Galinda! en Funes · 25 % de descuento de contado'
const DESCRIPTION =
  'Departamentos de 2 y 3 dormitorios y oficinas en Galinda! (Fundar), Galindo y Picton, Funes. 25 % de descuento pagando de contado y entrega en marzo de 2027. Precios, vistas y planos de cada unidad.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: GAL_URL },
  openGraph: {
    title: 'Galinda! · 25 % de descuento pagando de contado',
    description: 'Departamentos y oficinas en Funes con entrega en marzo de 2027. Mirá la vista, el plano y el precio de cada unidad.',
    url: GAL_URL,
    siteName: 'SI INMOBILIARIA',
    images: [{ url: 'https://siinmobiliaria.com/og-galinda.jpg', width: 1200, height: 630, type: 'image/jpeg', alt: 'Galinda! — Funes' }],
    locale: 'es_AR',
    type: 'website',
  },
}

const TIPOS: TipoUnidad[] = ['2d', '3d', 'of']

const CONJUNTO = [
  { img: 'parque.webp', titulo: 'Parque interno', alt: 'Parque interno de Galinda! visto desde una unidad' },
  { img: 'pileta.webp', titulo: 'Pileta y solárium', alt: 'Balcón con vista a la pileta de Galinda!' },
  { img: 'hall.webp', titulo: 'Vista desde el hall', alt: 'Vista abierta desde el hall de Galinda!' },
]

const AMENITIES = [
  'Pileta y solárium',
  'Quincho con parrillero',
  'SUM y gimnasio',
  'Juegos para chicos',
  'Laundry y bicicletero',
  'Grupo electrógeno y seguridad',
  'Cocheras USD 28.435',
  'Paseo comercial de 39 locales',
  'Calle nueva con semáforo y bicisenda',
]

export default function GalindaPage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Place',
      name: 'Galinda!',
      description: DESCRIPTION,
      url: GAL_URL,
      image: `https://siinmobiliaria.com${GAL_BASE}/hero.webp`,
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

      {/* ── Título: el descuento es el gancho ── */}
      <div className="mx-auto max-w-6xl px-4 pt-28 md:pt-32">
        <p className="text-sm font-semibold text-[var(--tinta-mute)]">Galinda! · Galindo y Picton, Funes · Desarrolla Fundar</p>
        <h1 className="mt-3 max-w-3xl text-[38px] font-extrabold leading-[1.02] tracking-tight md:text-6xl">
          <span className="text-[var(--brand)]">25 % de descuento</span> pagando de contado.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-[var(--tinta-mute)] md:text-xl">
          Departamentos de 2 y 3 dormitorios y oficinas, con entrega en {GAL_ENTREGA}. Abajo tenés cada unidad con su
          vista, su plano y los dos precios.
        </p>

        <div className="relative mt-7 aspect-[4/3] overflow-hidden rounded-3xl bg-[var(--cream)] md:aspect-[2/1]">
          <Image
            src={`${GAL_BASE}/hero.webp`}
            alt="Vista desde el balcón de un departamento de Galinda! hacia el parque y la pileta"
            fill
            priority
            sizes="(min-width: 1152px) 1120px, 100vw"
            className="object-cover"
          />
          <span className="absolute bottom-3 left-3 rounded-lg bg-black/50 px-2.5 py-1 text-xs font-semibold text-white">
            Vista desde la unidad 02-11
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {TIPOS.map((t) => (
            <a key={t} href={`#tipo-${t}`} className="rounded-2xl bg-[var(--cream)] px-5 py-4 transition-colors hover:bg-[var(--brand-light)]">
              <span className="block font-bold">{TIPO_LABEL[t]}</span>
              <span className="block text-sm text-[var(--tinta-mute)]">contado desde</span>
              <span className="block text-2xl font-extrabold tabular-nums tracking-tight text-[var(--brand)]">
                {usd(contadoDesde(t))}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* ── Dos formas de comprar ── */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-3xl font-extrabold tracking-tight">Dos formas de comprar</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border-2 border-[var(--brand)] bg-[var(--brand-light)] p-6">
            <p className="text-xl font-bold text-[var(--brand)]">De contado: 25 % menos</p>
            <p className="mt-1 text-[var(--tinta-soft)]">
              Pagás el precio de lista con un 25 % de descuento. En un 2 dormitorios son más de USD 70.000 de ahorro.
            </p>
          </div>
          <div className="rounded-2xl border-2 border-[var(--line)] p-6">
            <p className="text-xl font-bold">Financiado: precio de lista</p>
            <p className="mt-1 text-[var(--tinta-soft)]">Pagás en cuotas. Te pasamos el plan completo para la unidad que elijas.</p>
          </div>
        </div>
      </section>

      {/* ── Unidades ── */}
      <section id="unidades" className="mx-auto max-w-6xl scroll-mt-24 px-4">
        <h2 className="text-3xl font-extrabold tracking-tight">Las unidades disponibles</h2>
        <p className="mt-1 text-lg text-[var(--tinta-mute)]">Cada foto es la vista desde esa unidad.</p>

        {TIPOS.map((t) => (
          <div key={t} id={`tipo-${t}`} className="scroll-mt-24 pt-9">
            <h3 className="mb-4 text-xl font-extrabold">{TIPO_LABEL[t]}</h3>
            <div className="grid gap-5 md:grid-cols-3">
              {UNIDADES.filter((u) => u.tipo === t).map((u) => {
                const contado = precioContado(u)
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
                      <span className="absolute left-3 top-3 rounded-lg bg-[#17613C] px-2.5 py-1 text-xs font-extrabold text-white">
                        −25 % contado
                      </span>
                      <span className="absolute bottom-2.5 left-3 rounded-md bg-black/50 px-2 py-0.5 text-xs font-semibold text-white">
                        Vista desde esta unidad
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-5">
                      <div>
                        <p className="text-lg font-extrabold">
                          {nombre} · {u.m2} m²
                        </p>
                        <p className="text-sm text-[var(--tinta-mute)]">
                          {u.tipo !== 'of' && `${TIPO_LABEL[u.tipo]} · 2 baños · `}Piso {u.piso} · frente a {u.frente}
                        </p>
                      </div>
                      <div className="border-t border-[var(--line)] pt-3 tabular-nums">
                        <p className="text-xs font-bold uppercase tracking-wider text-[var(--brand)]">Contado</p>
                        <p className="text-[28px] font-extrabold leading-tight tracking-tight">{usd(contado)}</p>
                        <p className="text-sm text-[var(--tinta-mute)]">Financiado {usd(u.lista)}</p>
                        <p className="text-sm font-bold text-[var(--brand)]">Ahorrás {usd(u.lista - contado)}</p>
                      </div>
                      <div className="mt-auto grid grid-cols-[auto_1fr] gap-2">
                        <PlanoBoton src={`${GAL_BASE}/plano-${u.id}.webp`} titulo={`Plano · ${nombre} · ${u.m2} m²`} />
                        <WaGalinda
                          origen={`unidad-${u.id}`}
                          label="Consultar"
                          text={`Hola! Quiero información de la ${nombre.toLowerCase()} de Galinda! (${u.m2} m², contado ${usd(contado)}).`}
                        />
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        ))}
      </section>

      {/* ── El conjunto ── */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-3xl font-extrabold tracking-tight">El conjunto</h2>
        <p className="mt-1 max-w-2xl text-lg text-[var(--tinta-mute)]">
          Los departamentos rodean un parque con pileta. Abajo hay un paseo comercial con 39 locales y 38 oficinas.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {CONJUNTO.map((c) => (
            <figure key={c.img}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[var(--cream)]">
                <Image src={`${GAL_BASE}/${c.img}`} alt={c.alt} fill sizes="(min-width: 768px) 360px, 100vw" className="object-cover" />
              </div>
              <figcaption className="mt-2 text-sm font-semibold">{c.titulo}</figcaption>
            </figure>
          ))}
        </div>
        <ul className="mt-6 grid gap-x-6 gap-y-2.5 sm:grid-cols-2 md:grid-cols-3">
          {AMENITIES.map((a) => (
            <li key={a} className="flex items-start gap-2.5">
              <span className="mt-2 h-2 w-2 flex-none rounded-full bg-[#17613C]" aria-hidden />
              {a}
            </li>
          ))}
        </ul>
      </section>

      {/* ── Cierre ── */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="grid items-center gap-6 rounded-3xl bg-[var(--cream)] p-6 md:grid-cols-[1.3fr_1fr] md:p-8">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">¿Querés verla en persona?</h2>
            <p className="mt-2 text-[var(--tinta-mute)]">
              Coordinamos la visita a la obra y te armamos la cuenta de contado y financiado de la unidad que te guste.
            </p>
          </div>
          <div>
            <p className="mb-3 select-all text-2xl font-extrabold tabular-nums">341 334-0916</p>
            <WaGalinda origen="cierre" label="Escribinos por WhatsApp" className="w-full py-3.5 text-base" />
          </div>
        </div>
        <p className="mt-7 max-w-3xl text-xs leading-relaxed text-[var(--tinta-mute)]">
          Desarrolla y construye Fundar (fundar.com.ar). Imágenes ilustrativas: renders del proyecto. Superficies
          aproximadas, sujetas a ajustes del proyecto final. Precios en dólares según stock de Fundar al 31-oct-2026; el
          descuento de contado se aplica sobre el precio de lista. Comercializa SI INMOBILIARIA.
        </p>
      </section>
    </div>
  )
}
