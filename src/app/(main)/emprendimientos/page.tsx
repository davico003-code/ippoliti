import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Building2, ArrowRight } from 'lucide-react'
import ShareCardButton from '@/components/ShareCardButton'
import {
  getDevelopments,
  generateDevSlug,
  getDevMainPhoto,
  getConstructionStatus,
  translateDevType,
} from '@/lib/developments'
import { getAllClientes } from '@/lib/clientes'

export const revalidate = 21600

export const metadata: Metadata = {
  title: 'Emprendimientos | SI INMOBILIARIA',
  description:
    'Emprendimientos inmobiliarios en Roldán, Funes y Rosario. Condominios, barrios abiertos y cerrados. SI INMOBILIARIA — desde 1983.',
  alternates: { canonical: 'https://siinmobiliaria.com/emprendimientos' },
  // Sin este bloque, la página hereda el openGraph del root layout y publica
  // og:url = https://siinmobiliaria.com (el home) en vez de su propia URL.
  openGraph: {
    title: 'Emprendimientos | SI INMOBILIARIA',
    description:
      'Emprendimientos inmobiliarios en Roldán, Funes y Rosario. Condominios, barrios abiertos y cerrados.',
    url: 'https://siinmobiliaria.com/emprendimientos',
  },
}

const GREEN = '#1A5C38'
const GOLD = '#C9A84C'

type Card = {
  key: string
  href: string
  image: string | null
  eyebrow?: string
  title: string
  location?: string
  description?: string
  chips: string[]
  accent: string
  share?: { slug: string; title: string; path: string }
}

export default async function EmprendimientosPage() {
  const [developments, clientes] = await Promise.all([
    getDevelopments().catch(() => []),
    getAllClientes().catch(() => []),
  ])

  // Normalizamos todas las fuentes (feed Tokko + landings propias + clientes de
  // Redis) a una sola forma para renderizar una grilla cohesiva tipo "poster".
  const cards: Card[] = []

  for (const dev of developments) {
    const slug = generateDevSlug(dev)
    cards.push({
      key: `dev-${dev.id}`,
      href: `/emprendimientos/${slug}`,
      image: getDevMainPhoto(dev),
      eyebrow: dev.publication_title && dev.publication_title !== dev.name ? dev.publication_title : undefined,
      title: dev.name,
      location: dev.location?.name || dev.fake_address || dev.address || undefined,
      description: dev.description ? `${dev.description.replace(/<[^>]*>/g, '').slice(0, 260)}…` : undefined,
      chips: [translateDevType(dev.type?.name || ''), getConstructionStatus(dev.construction_status)].filter(Boolean),
      accent: GREEN,
      share: { slug, title: dev.name, path: `/emprendimientos/${slug}` },
    })
  }

  cards.push({
    key: 'fincazul',
    href: '/emprendimientos/fincazul',
    image: '/emprendimientos/fincazul/portada.jpg',
    eyebrow: 'Tu casa en condominio en Funes',
    title: 'Fincazul',
    location: 'Paseo del Norte, Funes',
    description:
      'Conjuntos privados de doce casas dúplex con portón de acceso. 2 dormitorios y 2 baños, con jardín, piscina y parrillero propios. A pasos de Fisherton.',
    chips: ['Casas en condominio', 'En construcción'],
    accent: GREEN,
  })

  cards.push({
    key: 'hausing',
    href: '/hausing',
    image: '/hausing-portada.jpg',
    eyebrow: 'Barrios cerrados premium · Funes',
    title: 'Hausing — Casas de Diseño',
    location: 'Vida, Cadaques, Don Mateo, Kentucky · Funes',
    description:
      'Casas exclusivas en los mejores barrios cerrados de Funes. Diseño contemporáneo, pileta, 3 y 4 dormitorios. Financiación en dólares.',
    chips: ['Casas premium', 'Funes'],
    accent: GREEN,
  })

  cards.push({
    key: 'aurea',
    href: '/propiedades/7296792-lotes-en-venta-desde-500m2-barrio-privado-aurea-en-roldan',
    image: '/aurea-portada.jpg',
    eyebrow: 'Desarrollo residencial premium · Roldán',
    title: 'Aurea — Barrio Privado',
    location: 'Roldán · Acceso directo por autopista',
    description:
      'Lotes desde 500 m² en barrio privado con seguridad 24 hs, club house, pileta y espacios verdes. Financiación disponible.',
    chips: ['Lotes desde 500m²', 'Roldán'],
    accent: GOLD,
  })

  for (const c of clientes) {
    cards.push({
      key: `cliente-${c.slug}`,
      href: `/emprendimientos/${c.slug}`,
      image: c.coverImage || null,
      title: c.name,
      description: c.description || undefined,
      chips: ['Comercializamos'],
      accent: GREEN,
    })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero inmersivo ─────────────────────────────────────────── */}
      <section className="relative flex min-h-[560px] items-end overflow-hidden md:min-h-[640px]">
        <Image
          src="/images/distrito-roldan/render-residencial.webp"
          alt="Emprendimientos y desarrollos de SI INMOBILIARIA"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30" />
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{ backgroundImage: `linear-gradient(120deg, ${GREEN} 0%, transparent 55%)` }}
        />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-14 pt-32 md:pb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4ADE80]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/90">
              Inversión y Desarrollo
            </span>
          </div>

          <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[0.95] tracking-tight text-white drop-shadow-xl md:text-7xl">
            Emprendimientos
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
            Los desarrollos que comercializamos en Roldán, Funes y Rosario. Barrios, condominios y
            proyectos con financiación — seleccionados por SI INMOBILIARIA.
          </p>

          {/* Franja de datos */}
          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Stat value={String(cards.length)} label="Desarrollos activos" />
            <span className="hidden h-8 w-px bg-white/20 sm:block" />
            <Stat value="3" label="Zonas · Roldán · Funes · Rosario" />
            <span className="hidden h-8 w-px bg-white/20 sm:block" />
            <Stat value="1983" label="Trayectoria desde" />
          </div>
        </div>
      </section>

      {/* ── Grilla de emprendimientos ──────────────────────────────── */}
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          {cards.length === 0 ? (
            <div className="py-20 text-center">
              <Building2 className="mx-auto mb-4 h-12 w-12 text-gray-200" />
              <p className="text-lg text-gray-500">No hay emprendimientos disponibles actualmente.</p>
            </div>
          ) : (
            <div className="space-y-12 md:space-y-16">
              {cards.map((card, i) => (
                <RowCard key={card.key} card={card} reverse={i % 2 === 1} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

/* ── Sub-componentes ──────────────────────────────────────────────── */

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-3xl font-black leading-none text-white md:text-4xl">{value}</p>
      <p className="mt-1.5 text-[11px] font-medium uppercase tracking-wider text-white/60">{label}</p>
    </div>
  )
}

function Chips({ chips, accent }: { chips: string[]; accent: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip, i) => (
        <span
          key={chip}
          className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur-md"
          style={
            i === 0
              ? { backgroundColor: accent, color: accent === GOLD ? '#000' : '#fff' }
              : { backgroundColor: 'rgba(255,255,255,0.85)', color: '#111' }
          }
        >
          {chip}
        </span>
      ))}
    </div>
  )
}

// Fila alternada (zig-zag): foto a un lado, ficha de datos al otro. En mobile
// apila foto arriba y texto abajo; desde md alterna el lado de la foto por fila.
function RowCard({ card, reverse, index }: { card: Card; reverse: boolean; index: number }) {
  const isGold = card.accent === GOLD
  return (
    <article
      className={`group grid grid-cols-1 items-center gap-6 md:grid-cols-12 md:gap-10 ${
        reverse ? 'md:[&>*:first-child]:order-2' : ''
      }`}
    >
      {/* Foto */}
      <div className="relative md:col-span-7">
        {card.share && (
          <div className="absolute right-4 top-4 z-20">
            <ShareCardButton slug={card.share.slug} title={card.share.title} path={card.share.path} />
          </div>
        )}
        <Link
          href={card.href}
          aria-label={card.title}
          className="si-img-shimmer si-tap relative block aspect-[16/10] overflow-hidden rounded-3xl bg-gray-100 shadow-sm ring-1 ring-black/5 transition-shadow duration-300 hover:shadow-xl md:aspect-[4/3] lg:aspect-[16/10]"
        >
          {card.image ? (
            <Image
              src={card.image}
              alt={card.title}
              fill
              priority={index === 0}
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, 60vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Building2 className="h-16 w-16 text-gray-300" />
            </div>
          )}
          <div className="absolute left-4 top-4">
            <Chips chips={card.chips} accent={card.accent} />
          </div>
        </Link>
      </div>

      {/* Ficha */}
      <div className="md:col-span-5">
        {card.eyebrow && (
          <p
            className="text-[11px] font-bold uppercase tracking-[0.2em]"
            style={{ color: isGold ? '#8A6D2B' : GREEN }}
          >
            {card.eyebrow}
          </p>
        )}
        <h2 className="mt-2 text-3xl font-black leading-[1.05] tracking-tight text-gray-900 md:text-4xl">
          <Link href={card.href} className="hover:underline decoration-2 underline-offset-4">
            {card.title}
          </Link>
        </h2>
        {card.location && (
          <div className="mt-3 flex items-center gap-1.5 text-sm text-gray-500">
            <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: GREEN }} />
            <span>{card.location}</span>
          </div>
        )}
        {card.description && (
          <p className="mt-4 text-[15px] leading-relaxed text-gray-600 line-clamp-4 md:text-base">
            {card.description}
          </p>
        )}
        <Link
          href={card.href}
          className="si-tap mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white transition-all hover:gap-3"
          style={{ backgroundColor: GREEN }}
        >
          Ver emprendimiento
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  )
}
