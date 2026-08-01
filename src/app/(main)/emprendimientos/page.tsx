import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Building2, ArrowDown, ArrowRight, ArrowUpRight, MessageCircle } from 'lucide-react'
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
    'Emprendimientos inmobiliarios en Roldán, Funes y Rosario. Condominios, barrios abiertos y cerrados. SI INMOBILIARIA, desde 1983.',
  alternates: { canonical: 'https://siinmobiliaria.com/emprendimientos' },
}

const WHATSAPP_URL = `https://wa.me/5493412101694?text=${encodeURIComponent(
  'Hola, quiero recibir asesoramiento sobre los desarrollos que comercializa SI INMOBILIARIA.',
)}`

type Card = {
  key: string
  href: string
  image: string | null
  eyebrow?: string
  title: string
  location?: string
  description?: string
  chips: string[]
  share?: { slug: string; title: string; path: string }
}

export default async function EmprendimientosPage() {
  const [developments, clientes] = await Promise.all([
    getDevelopments().catch(() => []),
    getAllClientes().catch(() => []),
  ])

  // Normalizamos todas las fuentes (feed Tokko + landings propias + clientes de
  // Redis) a una sola forma para renderizar una selección visual coherente.
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
  })

  cards.push({
    key: 'hausing',
    href: '/hausing',
    image: '/hausing-portada.jpg',
    eyebrow: 'Barrios cerrados premium · Funes',
    title: 'Hausing · Casas de Diseño',
    location: 'Vida, Cadaques, Don Mateo, Kentucky · Funes',
    description:
      'Casas exclusivas en los mejores barrios cerrados de Funes. Diseño contemporáneo, pileta, 3 y 4 dormitorios. Financiación en dólares.',
    chips: ['Casas premium', 'Funes'],
  })

  cards.push({
    key: 'aurea',
    href: '/propiedades/7296792-lotes-en-venta-desde-500m2-barrio-privado-aurea-en-roldan',
    image: '/aurea-portada.jpg',
    eyebrow: 'Desarrollo residencial premium · Roldán',
    title: 'Aurea · Barrio Privado',
    location: 'Roldán · Acceso directo por autopista',
    description:
      'Lotes desde 500 m² en barrio privado con seguridad 24 hs, club house, pileta y espacios verdes. Financiación disponible.',
    chips: ['Lotes desde 500m²', 'Roldán'],
  })

  for (const c of clientes) {
    cards.push({
      key: `cliente-${c.slug}`,
      href: `/emprendimientos/${c.slug}`,
      image: c.coverImage || null,
      title: c.name,
      description: c.description || undefined,
      chips: ['Comercializamos'],
    })
  }

  const [featured, ...rest] = cards

  return (
    <main className="min-h-screen bg-[#F6F6F4]">
      <section className="relative flex min-h-[680px] items-end overflow-hidden md:min-h-[760px]">
        <Image
          src="/images/distrito-roldan/render-residencial.webp"
          alt="Vista aérea de un desarrollo residencial comercializado por SI INMOBILIARIA"
          fill
          className="object-cover object-[62%_center] md:object-center"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-[#06150D]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07140D] via-[#07140D]/50 to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-[1240px] px-5 pb-12 pt-32 sm:px-8 md:pb-16 lg:px-10">
          <p className="max-w-max border-b border-white/45 pb-2 text-sm font-semibold text-white/90">
            Roldán · Funes · Rosario
          </p>
          <h1 className="mt-7 max-w-5xl text-balance text-[clamp(3.25rem,9vw,6rem)] font-extrabold leading-[0.92] tracking-[-0.035em] text-white">
            Desarrollos con lugar propio.
          </h1>
          <p className="mt-7 max-w-2xl text-pretty text-base leading-7 text-white/85 sm:text-lg sm:leading-8">
            Barrios, condominios y proyectos residenciales que conocemos de cerca, seleccionados y
            comercializados por SI INMOBILIARIA.
          </p>
          <Link
            href="#proyectos"
            className="si-tap mt-9 inline-flex min-h-11 items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#132219] transition-colors hover:bg-[#E8F1ED] focus-visible:outline-white focus-visible:outline-offset-4"
          >
            Explorar proyectos
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="bg-[#1A5C38] px-5 py-7 text-white sm:px-8 md:py-9 lg:px-10">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="max-w-2xl text-pretty text-lg font-semibold leading-7 md:text-xl">
            Elegimos proyectos por su ubicación, su propuesta y la calidad de quienes los hacen.
          </p>
          <p className="shrink-0 text-sm text-white/75">
            Acompañando la región desde <span className="font-poppins tabular-nums">1983</span>
          </p>
        </div>
      </section>

      <section id="proyectos" className="px-5 py-16 sm:px-8 md:py-24 lg:px-10">
        <div className="mx-auto max-w-[1240px]">
          <div className="mb-10 grid gap-5 md:mb-14 md:grid-cols-12 md:items-end">
            <h2 className="text-balance text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] text-[#1C1C1E] sm:text-5xl md:col-span-7 md:text-6xl">
              Proyectos que conocemos de cerca
            </h2>
            <div className="md:col-span-4 md:col-start-9">
              <p className="text-pretty text-base leading-7 text-[#4A4845]">
                Reunimos alternativas con identidades distintas para que puedas comparar ubicación,
                tipología y etapa de obra con información clara.
              </p>
              <p className="mt-4 text-sm font-semibold text-[#1A5C38]">
                <span className="font-poppins tabular-nums">{cards.length}</span>{' '}
                {cards.length === 1 ? 'proyecto disponible' : 'proyectos disponibles'}
              </p>
            </div>
          </div>

          {cards.length === 0 ? (
            <div className="rounded-[2rem] bg-white px-6 py-20 text-center ring-1 ring-black/5">
              <Building2 className="mx-auto mb-4 h-12 w-12 text-[#1A5C38]/30" aria-hidden="true" />
              <p className="text-lg text-[#4A4845]">No hay emprendimientos disponibles actualmente.</p>
            </div>
          ) : (
            <>
              {featured && <FeaturedCard card={featured} />}

              {rest.length > 0 && (
                <div className="mt-7 grid grid-cols-1 gap-7 md:grid-cols-12 md:gap-8">
                  {rest.map((card, index) => (
                    <ProjectCard key={card.key} card={card} wide={index % 4 === 0 || index % 4 === 3} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8 md:pb-24 lg:px-10">
        <div className="relative mx-auto max-w-[1240px] overflow-hidden rounded-[2rem] bg-[#113E27] px-6 py-10 text-white sm:px-10 md:px-14 md:py-14">
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border border-white/10" aria-hidden="true" />
          <div className="absolute -right-4 -top-12 h-44 w-44 rounded-full border border-white/10" aria-hidden="true" />
          <div className="relative grid gap-8 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <h2 className="text-balance text-3xl font-extrabold leading-tight tracking-[-0.025em] sm:text-4xl">
                ¿Estás evaluando invertir en un desarrollo?
              </h2>
              <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-white/75">
                Te ayudamos a entender las diferencias entre cada proyecto, sus etapas y sus
                alternativas de pago.
              </p>
            </div>
            <div className="md:col-span-4 md:col-start-9 md:flex md:justify-end">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="si-tap inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#113E27] transition-colors hover:bg-[#E8F1ED] focus-visible:outline-white focus-visible:outline-offset-4"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Consultar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

/* ── Sub-componentes ──────────────────────────────────────────────── */

function Details({ chips }: { chips: string[] }) {
  return (
    <p className="flex flex-wrap text-xs font-semibold leading-5 text-[#1A5C38]">
      {chips.map((chip, index) => (
        <span key={chip} className={hasDigits(chip) ? 'font-poppins tabular-nums' : undefined}>
          {index > 0 && <span className="px-1.5 font-raleway" aria-hidden="true">·</span>}
          {chip}
        </span>
      ))}
    </p>
  )
}

function FeaturedCard({ card }: { card: Card }) {
  return (
    <article className="group relative overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_70px_rgba(20,40,28,0.10)] ring-1 ring-black/5">
      {card.share && (
        <div className="absolute left-4 top-4 z-20 [&>div>button]:h-11 [&>div>button]:w-11 md:left-auto md:right-4">
          <ShareCardButton slug={card.share.slug} title={card.share.title} path={card.share.path} />
        </div>
      )}
      <Link
        href={card.href}
        className="si-tap grid min-h-full md:grid-cols-12"
      >
        <div className="si-img-shimmer relative aspect-[4/3] overflow-hidden md:col-span-7 md:aspect-auto md:min-h-[560px]">
          {card.image ? (
            <Image
              src={card.image}
              alt={`${card.title}${card.location ? ` en ${card.location}` : ''}`}
              fill
              className="object-cover transition-transform duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035]"
              sizes="(max-width: 767px) 100vw, 58vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#E8F1ED]">
              <Building2 className="h-16 w-16 text-[#1A5C38]/35" aria-hidden="true" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        <div className="flex flex-col justify-center p-6 sm:p-8 md:col-span-5 md:p-10 lg:p-12">
          <Details chips={card.chips} />
          <h3 className={`mt-4 text-balance text-3xl font-extrabold leading-[1.05] tracking-[-0.025em] text-[#1C1C1E] sm:text-4xl ${hasDigits(card.title) ? 'font-poppins tabular-nums' : ''}`}>
            {card.title}
          </h3>
          {card.eyebrow && <p className={`mt-4 text-base font-semibold leading-6 text-[#1A5C38] ${hasDigits(card.eyebrow) ? 'font-poppins tabular-nums' : ''}`}>{card.eyebrow}</p>}
          {card.location && (
            <div className="mt-5 flex items-start gap-2 text-sm leading-6 text-[#4A4845]">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#1A5C38]" aria-hidden="true" />
              <span className={hasDigits(card.location) ? 'font-poppins tabular-nums' : undefined}>{card.location}</span>
            </div>
          )}
          {card.description && (
            <p className={`mt-5 line-clamp-3 text-sm leading-7 text-[#5B5956] md:text-base ${hasDigits(card.description) ? 'font-poppins tabular-nums' : ''}`}>
              {card.description}
            </p>
          )}
          <span className="mt-8 inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-[#1A5C38] px-5 py-3 text-sm font-bold text-white">
            Conocer el proyecto
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
          </span>
        </div>
      </Link>
    </article>
  )
}

function ProjectCard({ card, wide }: { card: Card; wide: boolean }) {
  return (
    <article className={`group relative overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-black/5 ${wide ? 'md:col-span-7' : 'md:col-span-5'}`}>
      {card.share && (
        <div className="absolute right-4 top-4 z-20 [&>div>button]:h-11 [&>div>button]:w-11">
          <ShareCardButton slug={card.share.slug} title={card.share.title} path={card.share.path} />
        </div>
      )}
      <Link href={card.href} className="si-tap flex h-full flex-col">
        <div className={`si-img-shimmer relative overflow-hidden ${wide ? 'aspect-[16/10]' : 'aspect-[4/3]'}`}>
          {card.image ? (
            <Image
              src={card.image}
              alt={`${card.title}${card.location ? ` en ${card.location}` : ''}`}
              fill
              className="object-cover transition-transform duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
              sizes={wide ? '(max-width: 767px) 100vw, 58vw' : '(max-width: 767px) 100vw, 42vw'}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#E8F1ED]">
              <Building2 className="h-14 w-14 text-[#1A5C38]/35" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-6 sm:p-7">
          <Details chips={card.chips} />
          <h3 className={`mt-3 text-balance text-2xl font-extrabold leading-[1.08] tracking-[-0.02em] text-[#1C1C1E] sm:text-[1.7rem] ${hasDigits(card.title) ? 'font-poppins tabular-nums' : ''}`}>
            {card.title}
          </h3>
          {card.eyebrow && <p className={`mt-3 text-sm font-semibold leading-6 text-[#1A5C38] ${hasDigits(card.eyebrow) ? 'font-poppins tabular-nums' : ''}`}>{card.eyebrow}</p>}
          {card.location && (
            <div className="mt-4 flex items-start gap-2 text-sm leading-6 text-[#5B5956]">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#1A5C38]" aria-hidden="true" />
              <span className={`line-clamp-2 ${hasDigits(card.location) ? 'font-poppins tabular-nums' : ''}`}>{card.location}</span>
            </div>
          )}
          {card.description && (
            <p className={`mt-4 line-clamp-2 text-sm leading-6 text-[#6A6864] ${hasDigits(card.description) ? 'font-poppins tabular-nums' : ''}`}>
              {card.description}
            </p>
          )}
          <span className="mt-6 inline-flex min-h-11 items-center gap-2 self-start text-sm font-bold text-[#1A5C38]">
            Conocer el proyecto
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </div>
      </Link>
    </article>
  )
}

function hasDigits(value?: string) {
  return Boolean(value && /\d/.test(value))
}
