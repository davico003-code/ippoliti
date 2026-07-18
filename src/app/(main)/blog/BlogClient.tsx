'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Clock3, Search, SlidersHorizontal, X } from 'lucide-react'

interface PostCard {
  slug: string
  title: string
  summary: string
  date: string
  dateDisplay: string
  image: string
  category: string
  readingMinutes: number
}

const CATEGORIES = [
  'Todas',
  'Mercado',
  'Inversión',
  'Consejos',
  'Funes y Roldán',
  'Legal',
  'Calidad de vida',
]

const SORT_OPTIONS = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'quick', label: 'Lectura rápida' },
  { value: 'deep', label: 'Más completos' },
] as const

type SortOption = (typeof SORT_OPTIONS)[number]['value']

const GREEN = '#1A5C38'
const INK = '#173229'
const CLAY = '#B76E38'

function Meta({ post, light = false }: { post: PostCard; light?: boolean }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
        light ? 'text-white/75' : 'text-gray-500'
      }`}
    >
      <span>{post.dateDisplay}</span>
      <span className={light ? 'text-white/40' : 'text-gray-300'}>·</span>
      <span className="inline-flex items-center gap-1">
        <Clock3 className="h-3 w-3" aria-hidden />
        {post.readingMinutes} min
      </span>
    </div>
  )
}

function ArticleImage({
  post,
  priority = false,
  sizes,
}: {
  post: PostCard
  priority?: boolean
  sizes: string
}) {
  return (
    <Image
      src={post.image}
      alt={post.title}
      fill
      priority={priority}
      sizes={sizes}
      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
    />
  )
}

function CompactFeature({ post, priority = false }: { post: PostCard; priority?: boolean }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group si-tap block">
      <article className="grid grid-cols-[112px_1fr] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
        <div className="si-img-shimmer relative min-h-[128px]">
          <ArticleImage post={post} priority={priority} sizes="112px" />
        </div>
        <div className="flex min-w-0 flex-col justify-between p-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#B76E38]">
              {post.category}
            </span>
            <h3 className="mt-1.5 line-clamp-3 text-[15px] font-black leading-snug text-gray-900 transition-colors group-hover:text-[#1A5C38]">
              {post.title}
            </h3>
          </div>
          <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#1A5C38]">
            Leer <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </article>
    </Link>
  )
}

function PostGridCard({ post }: { post: PostCard }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group si-tap block">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
        <div className="si-img-shimmer relative aspect-[16/10] overflow-hidden">
          <ArticleImage
            post={post}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#1A5C38] shadow-sm backdrop-blur-sm">
            {post.category}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <Meta post={post} />
          <h2 className="mt-2.5 line-clamp-2 text-[18px] font-black leading-[1.22] tracking-tight text-gray-900 transition-colors group-hover:text-[#1A5C38]">
            {post.title}
          </h2>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-500">{post.summary}</p>
          <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-bold text-[#1A5C38]">
            Leer artículo
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </article>
    </Link>
  )
}

export default function BlogClient({ posts }: { posts: PostCard[] }) {
  const [active, setActive] = useState('Todas')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('recent')

  const categoryCounts = useMemo(() => {
    return posts.reduce<Record<string, number>>(
      (acc, post) => {
        acc.Todas += 1
        acc[post.category] = (acc[post.category] ?? 0) + 1
        return acc
      },
      { Todas: 0 },
    )
  }, [posts])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()

    return posts
      .filter(post => active === 'Todas' || post.category === active)
      .filter(post => {
        if (!query) return true
        return `${post.title} ${post.summary} ${post.category}`.toLowerCase().includes(query)
      })
      .sort((a, b) => {
        if (sort === 'quick') return a.readingMinutes - b.readingMinutes
        if (sort === 'deep') return b.readingMinutes - a.readingMinutes
        return b.date.localeCompare(a.date)
      })
  }, [active, posts, search, sort])

  const [featured, secondaryOne, secondaryTwo, ...rest] = filtered
  const hasFilters = active !== 'Todas' || search.trim() !== '' || sort !== 'recent'

  return (
    <div className="min-h-screen bg-[#FAFBF7]">
      <section className="border-b border-[#E8EEE7] bg-white px-4 pb-5 pt-20 md:pb-10 md:pt-36">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-5 md:gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <p
                className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] md:mb-4 md:text-[12px] md:tracking-[0.24em]"
                style={{ color: GREEN }}
              >
                SI INMOBILIARIA · Editorial
              </p>
              <h1 className="max-w-3xl text-[42px] font-black leading-[1.02] tracking-tight text-gray-950 md:text-6xl">
                Blog inmobiliario
              </h1>
              <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-gray-600 md:mt-5 md:text-xl">
                Mercado, consejos y análisis para comprar, vender e invertir con más claridad
                en Funes, Roldán y la región.
              </p>
            </div>

            <div className="hidden grid-cols-3 overflow-hidden rounded-2xl border border-[#DDE8DF] bg-[#F4F7F2] sm:grid">
              <div className="border-r border-[#DDE8DF] p-4">
                <span className="block font-poppins text-2xl font-black text-[#173229]">
                  {posts.length}
                </span>
                <span className="mt-1 block text-xs font-semibold text-gray-500">notas</span>
              </div>
              <div className="border-r border-[#DDE8DF] p-4">
                <span className="block font-poppins text-2xl font-black text-[#173229]">
                  {CATEGORIES.length - 1}
                </span>
                <span className="mt-1 block text-xs font-semibold text-gray-500">temas</span>
              </div>
              <div className="p-4">
                <span className="block font-poppins text-2xl font-black text-[#173229]">
                  1h
                </span>
                <span className="mt-1 block text-xs font-semibold text-gray-500">actualización</span>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-2 md:mt-8 md:gap-3 lg:grid-cols-[1fr_230px]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Buscar nota o zona"
                className="h-11 w-full rounded-2xl border border-[#DDE8DF] bg-white pl-11 pr-10 text-sm font-semibold text-gray-800 outline-none transition focus:border-[#1A5C38] focus:ring-4 focus:ring-[#1A5C38]/10 md:h-12 md:pl-12 md:pr-11"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>

            <label className="relative block">
              <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <select
                value={sort}
                onChange={event => setSort(event.target.value as SortOption)}
                className="h-11 w-full appearance-none rounded-2xl border border-[#DDE8DF] bg-white pl-11 pr-4 text-sm font-bold text-gray-800 outline-none transition focus:border-[#1A5C38] focus:ring-4 focus:ring-[#1A5C38]/10 md:h-12 md:pl-12"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide md:mt-5 md:pb-2">
            {CATEGORIES.map(cat => {
              const on = active === cat
              const count = categoryCounts[cat] ?? 0
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActive(cat)}
                  aria-pressed={on}
                  className={`shrink-0 rounded-full border px-3.5 py-2 text-[13px] font-bold transition-all md:px-4 md:text-sm ${
                    on
                      ? 'border-transparent text-white shadow-sm'
                      : 'border-[#DDE8DF] bg-white text-gray-600 hover:border-[#AFC5B6] hover:text-gray-950'
                  }`}
                  style={on ? { backgroundColor: GREEN } : undefined}
                >
                  {cat}
                  <span className={on ? 'ml-2 text-white/70' : 'ml-2 text-gray-400'}>{count}</span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-5 md:px-8 md:py-12">
        {featured && (
          <div className="mb-8 grid gap-5 md:mb-12 lg:grid-cols-[1fr_380px]">
            <Link href={`/blog/${featured.slug}`} className="group si-tap block">
              <article className="si-img-shimmer relative aspect-[5/4] overflow-hidden rounded-2xl bg-[#173229] shadow-sm sm:aspect-[16/9] lg:aspect-[16/10]">
                <ArticleImage
                  post={featured}
                  priority
                  sizes="(max-width: 1024px) 100vw, 720px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

                <div className="absolute inset-x-0 bottom-0 p-4 md:p-8 lg:p-10">
                  <span
                    className="inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white"
                    style={{ backgroundColor: CLAY }}
                  >
                    Destacado · {featured.category}
                  </span>
                  <h2 className="mt-3 max-w-3xl text-[23px] font-black leading-[1.08] text-white drop-shadow-sm md:mt-4 md:text-4xl">
                    {featured.title}
                  </h2>
                  <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-white/80 line-clamp-2 md:mt-3 md:text-base">
                    {featured.summary}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 md:mt-5 md:gap-4">
                    <Meta post={featured} light />
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-black text-[#173229] transition group-hover:bg-[#F4F7F2]">
                      Leer artículo
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </article>
            </Link>

            <aside className="grid gap-4 content-start">
              <div className="rounded-2xl border border-[#DDE8DF] bg-white p-5 shadow-sm">
                <h2 className="text-sm font-black uppercase tracking-[0.16em]" style={{ color: INK }}>
                  Para leer ahora
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  Una selección rápida según el filtro activo, con prioridad en notas recientes y
                  fáciles de escanear.
                </p>
              </div>
              {secondaryOne && <CompactFeature post={secondaryOne} priority />}
              {secondaryTwo && <CompactFeature post={secondaryTwo} priority />}
            </aside>
          </div>
        )}

        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.18em] text-gray-950">
              {active === 'Todas' ? 'Últimas notas' : active}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {filtered.length} {filtered.length === 1 ? 'artículo encontrado' : 'artículos encontrados'}
            </p>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setActive('Todas')
                setSearch('')
                setSort('recent')
              }}
              className="inline-flex items-center gap-2 rounded-full border border-[#DDE8DF] bg-white px-4 py-2 text-sm font-bold text-[#1A5C38] transition hover:border-[#1A5C38]"
            >
              <X className="h-4 w-4" />
              Limpiar filtros
            </button>
          )}
        </div>

        {rest.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map(post => (
              <PostGridCard key={post.slug} post={post} />
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#C9D9CE] bg-white px-6 py-16 text-center">
            <h2 className="text-xl font-black text-gray-950">No encontramos notas para esa búsqueda</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-500">
              Probá con otro término o limpiá los filtros para volver a ver todo el blog.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
