'use client'

import { useState } from 'react'
import Link from 'next/link'

interface PostCard {
  slug: string
  title: string
  summary: string
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

const GREEN = '#1A5C38'

function Meta({ post, light = false }: { post: PostCard; light?: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] ${
        light ? 'text-white/70' : 'text-gray-400'
      }`}
    >
      <span>{post.dateDisplay}</span>
      <span className={light ? 'text-white/40' : 'text-gray-300'}>·</span>
      <span>{post.readingMinutes} min de lectura</span>
    </div>
  )
}

export default function BlogClient({ posts }: { posts: PostCard[] }) {
  const [active, setActive] = useState('Todas')

  const filtered = active === 'Todas' ? posts : posts.filter(p => p.category === active)
  const [featured, ...rest] = filtered

  return (
    <div className="min-h-screen bg-white">
      {/* ── HERO / MASTHEAD ── */}
      <section className="px-4 pt-28 md:pt-36 pb-8 md:pb-12">
        <div className="mx-auto max-w-6xl">
          <p
            className="mb-4 text-[12px] font-bold uppercase tracking-[0.28em]"
            style={{ color: GREEN }}
          >
            SI Inmobiliaria · Editorial
          </p>
          <h1 className="max-w-3xl text-4xl font-black leading-[1.02] tracking-tight text-gray-900 md:text-6xl">
            Blog inmobiliario
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-gray-500 md:text-xl">
            Mercado, consejos y análisis para comprar, vender e invertir en Funes, Roldán y la región.
          </p>

          {/* ── FILTRO CATEGORÍAS ── */}
          <div className="mt-9 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map(cat => {
              const on = active === cat
              return (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                    on
                      ? 'border-transparent text-white shadow-sm'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900'
                  }`}
                  style={on ? { backgroundColor: GREEN } : undefined}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-24 md:px-8">
        {/* ── POST DESTACADO — full-bleed editorial ── */}
        {featured && (
          <Link href={`/blog/${featured.slug}`} className="group si-tap mb-14 block md:mb-16">
            <article className="si-img-shimmer relative aspect-[4/3] w-full overflow-hidden rounded-3xl sm:aspect-[16/9] lg:aspect-[21/9]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featured.image}
                alt={featured.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

              <div className="absolute inset-x-0 bottom-0 p-6 md:p-10 lg:p-12">
                <span
                  className="inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white"
                  style={{ backgroundColor: GREEN }}
                >
                  {featured.category}
                </span>
                <h2 className="mt-4 max-w-3xl text-2xl font-black leading-[1.08] text-white drop-shadow-sm md:text-4xl lg:text-[2.75rem]">
                  {featured.title}
                </h2>
                <p className="mt-3 hidden max-w-xl text-[15px] leading-relaxed text-white/80 line-clamp-2 md:block">
                  {featured.summary}
                </p>
                <div className="mt-5 flex items-center gap-4">
                  <Meta post={featured} light />
                  <span className="ml-auto hidden items-center gap-1.5 text-sm font-bold text-white sm:inline-flex">
                    Leer artículo
                    <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
                      &rarr;
                    </span>
                  </span>
                </div>
              </div>
            </article>
          </Link>
        )}

        {/* ── SECCIÓN ── */}
        {rest.length > 0 && (
          <div className="mb-6 flex items-baseline justify-between">
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-gray-900">
              {active === 'Todas' ? 'Últimas notas' : active}
            </h3>
            <span className="text-xs font-medium text-gray-400">
              {filtered.length} {filtered.length === 1 ? 'artículo' : 'artículos'}
            </span>
          </div>
        )}

        {/* ── GRID DE POSTS ── */}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map(post => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group si-tap block">
                <article className="flex h-full flex-col">
                  {/* Imagen */}
                  <div className="si-img-shimmer relative aspect-[16/10] overflow-hidden rounded-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.image}
                      alt={post.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                    />
                    <span
                      className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide backdrop-blur-sm"
                      style={{ color: GREEN }}
                    >
                      {post.category}
                    </span>
                  </div>
                  {/* Contenido */}
                  <div className="flex flex-1 flex-col pt-4">
                    <Meta post={post} />
                    <h2 className="mt-2.5 text-[18px] font-black leading-[1.25] tracking-tight text-gray-900 transition-colors group-hover:text-[#1A5C38]">
                      {post.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-gray-500 line-clamp-2">
                      {post.summary}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-[#1A5C38]">
                      Leer
                      <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
                        &rarr;
                      </span>
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <p className="py-20 text-center text-gray-400">
            No hay artículos en esta categoría todavía.
          </p>
        )}
      </div>
    </div>
  )
}
