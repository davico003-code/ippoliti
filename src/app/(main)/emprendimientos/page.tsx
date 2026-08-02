import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Building2, ArrowRight, ArrowUpRight } from 'lucide-react'
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
      description: dev.description ? `${dev.description.replace(/<[^>]*>/g, '').slice(0, 160)}…` : undefined,
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

  const [featured, ...rest] = cards

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
            <>
              {featured && <FeaturedCard card={featured} />}

              {rest.length > 0 && (
                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map(card => (
                    <PosterCard key={card.key} card={card} />
                  ))}
                </div>
              )}
            </>
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

// Card destacada: formato cinematográfico ancho con el texto sobre la imagen.
function FeaturedCard({ card }: { card: Card }) {
  const accentText = card.accent === GOLD ? GOLD : '#4ADE80'
  return (
    <div className="group relative">
      {card.share && (
        <div className="absolute right-4 top-4 z-20">
          <ShareCardButton slug={card.share.slug} title={card.share.title} path={card.share.path} />
        </div>
      )}
      <Link
        href={card.href}
        className="si-img-shimmer si-tap relative block aspect-[16/10] overflow-hidden rounded-3xl shadow-lg md:aspect-[21/9]"
      >
        {card.image ? (
          <Image
            src={card.image}
            alt={card.title}
            fill
            priority
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 1152px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100">
            <Building2 className="h-16 w-16 text-gray-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
          <Chips chips={card.chips} accent={card.accent} />
          {card.eyebrow && (
            <p className="mt-4 text-sm font-semibold" style={{ color: accentText }}>
              {card.eyebrow}
            </p>
          )}
          <h2 className="mt-1 max-w-2xl text-3xl font-black leading-tight text-white md:text-5xl">
            {card.title}
          </h2>
          {card.location && (
            <div className="mt-3 flex items-center gap-1.5 text-sm text-white/75">
              <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: accentText }} />
              <span>{card.location}</span>
            </div>
          )}
          {card.description && (
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70 line-clamp-2 md:text-base">
              {card.description}
            </p>
          )}
          <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-gray-900 transition-all group-hover:gap-3">
            Ver emprendimiento
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </div>
  )
}

// Card estándar tipo "poster": imagen vertical con overlay y datos abajo.
function PosterCard({ card }: { card: Card }) {
  const accentText = card.accent === GOLD ? GOLD : '#4ADE80'
  return (
    <div className="group relative">
      {card.share && (
        <div className="absolute right-3 top-3 z-20">
          <ShareCardButton slug={card.share.slug} title={card.share.title} path={card.share.path} />
        </div>
      )}
      <Link
        href={card.href}
        className="si-img-shimmer si-tap relative block aspect-[4/5] overflow-hidden rounded-3xl shadow-sm ring-1 ring-black/5 transition-shadow duration-300 hover:shadow-xl"
      >
        {card.image ? (
          <Image
            src={card.image}
            alt={card.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100">
            <Building2 className="h-14 w-14 text-gray-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

        <div className="absolute left-4 right-4 top-4">
          <Chips chips={card.chips} accent={card.accent} />
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5">
          {card.eyebrow && (
            <p className="text-xs font-semibold" style={{ color: accentText }}>
              {card.eyebrow}
            </p>
          )}
          <h2 className="mt-0.5 text-xl font-black leading-tight text-white">{card.title}</h2>
          {card.location && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-white/70">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" style={{ color: accentText }} />
              <span className="line-clamp-1">{card.location}</span>
            </div>
          )}
          <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-white transition-all group-hover:gap-2.5">
            Ver emprendimiento
            <ArrowRight className="h-4 w-4" style={{ color: accentText }} />
          </span>
        </div>
      </Link>
    </div>
  )
}
