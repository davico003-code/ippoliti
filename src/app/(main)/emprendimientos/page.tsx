import type { Metadata } from 'next'
import Image from '@/components/Imagen'
import Link from 'next/link'
import { MapPin, Building2, ArrowRight } from 'lucide-react'
import ShareCardButton from '@/components/ShareCardButton'
import MarcaDesarrollador from '@/components/landing/MarcaDesarrollador'
import { getTarjetasEmprendimientos, GREEN, GOLD, type Card } from '@/lib/emprendimientos-tarjetas'

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
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'SI INMOBILIARIA' }],
  },
}

export default async function EmprendimientosPage() {
  const cards = await getTarjetasEmprendimientos()

  return (
    <div className="min-h-screen bg-white">
      {/* ── Portada ───────────────────────────────────────────────── */}
      {/* Tipográfica: en desktop la aérea de Distrito Roldán va recortada DENTRO
          de las letras (bg-clip-text). El verde de fondo es el fallback mientras
          carga la foto, así el H1 nunca queda invisible. El tamaño sale del ancho
          del contenedor (la palabra mide ~8.3em) para que entre siempre en una
          línea. En mobile la letra es chica para el efecto: título verde pleno, y
          la aérea aparece enseguida en la primera fila. */}
      <section className="bg-white px-6 pt-14 md:pt-24">
        <div className="mx-auto max-w-6xl">
          <h1
            className="whitespace-nowrap pb-2 font-black leading-none tracking-tighter text-[var(--brand)] md:bg-[#1A5C38] md:bg-[url('/images/distrito-roldan/hero-aerea-titulo.webp')] md:bg-cover md:bg-center md:bg-clip-text md:pb-3 md:text-transparent"
            style={{ fontSize: 'min(calc((100vw - 48px) / 8.3), 138px)' }}
          >
            Emprendimientos
          </h1>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-x-10 gap-y-4 border-t border-gray-200 pt-5 md:mt-7 md:pt-6">
            <p className="max-w-md text-base leading-relaxed text-gray-600 md:text-lg">
              Los desarrollos que comercializamos en Roldán, Funes y Rosario.
            </p>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--brand)] md:text-xs">
              <span className="font-numeric">{cards.length}</span> desarrollos · <span className="font-numeric">3</span> zonas
            </p>
          </div>

        </div>
      </section>

      {/* ── Grilla de emprendimientos ──────────────────────────────── */}
      <section className="px-6 pb-16 pt-12 md:pb-24 md:pt-20">
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
        {card.marcas && card.marcas.length > 0 && (
          <MarcaDesarrollador tono="claro" className="mt-6" marcas={card.marcas} />
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
