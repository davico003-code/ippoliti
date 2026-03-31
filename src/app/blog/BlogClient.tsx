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
}

const CATEGORIES = [
  'Todas',
  'Mercado',
  'Inversión',
  'Consejos',
  'Zona oeste',
  'Legal',
  'Calidad de vida',
]

export default function BlogClient({ posts }: { posts: PostCard[] }) {
  const [active, setActive] = useState('Todas')

  const filtered = active === 'Todas' ? posts : posts.filter(p => p.category === active)
  const [featured, ...rest] = filtered

  return (
    <div className="min-h-screen bg-white">
      {/* ── HERO ── */}
      <section className="bg-white pt-28 md:pt-36 pb-10 md:pb-14 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-[3.4rem] font-black text-gray-900 leading-tight mb-4">
            Blog inmobiliario
          </h1>
          <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            Mercado, consejos y análisis para comprar, vender e invertir en Funes y Roldán
          </p>

          {/* ── FILTRO CATEGORÍAS ── */}
          <div className="flex gap-2 justify-start md:justify-center overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  active === cat
                    ? 'bg-[#1A5C38] text-white'
                    : 'bg-[#f5f5f5] text-[#444] hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 md:px-8 pb-20">
        {/* ── POST DESTACADO ── */}
        {featured && (
          <Link href={`/blog/${featured.slug}`} className="group block mb-14">
            <article className="grid grid-cols-1 lg:grid-cols-5 gap-0 rounded-2xl overflow-hidden border border-[#f0f0f0] hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] transition-all">
              {/* Imagen */}
              <div className="lg:col-span-3 relative h-64 lg:h-[420px] overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featured.image}
                  alt={featured.title}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
              </div>
              {/* Contenido */}
              <div className="lg:col-span-2 flex flex-col justify-center p-6 lg:p-10">
                <span className="inline-block self-start bg-[#f0f7f4] text-[#1A5C38] text-xs font-semibold rounded-full px-3 py-1 mb-4">
                  {featured.category}
                </span>
                <h2 className="text-2xl lg:text-[2rem] font-black text-[#111] leading-tight mb-3 group-hover:text-[#1A5C38] transition-colors">
                  {featured.title}
                </h2>
                <p className="text-[#666] text-sm leading-relaxed line-clamp-3 mb-4">
                  {featured.summary}
                </p>
                <span className="text-xs text-[#999] mb-4">{featured.dateDisplay}</span>
                <span className="inline-flex items-center gap-1.5 text-[#1A5C38] font-semibold text-sm group-hover:gap-3 transition-all">
                  Leer artículo <span aria-hidden>&rarr;</span>
                </span>
              </div>
            </article>
          </Link>
        )}

        {/* ── GRID DE POSTS ── */}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map(post => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                <article
                  className="h-full flex flex-col rounded-2xl overflow-hidden border border-[#f0f0f0] transition-all duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] hover:-translate-y-0.5"
                >
                  {/* Imagen */}
                  <div className="relative h-[200px] overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  </div>
                  {/* Contenido */}
                  <div className="flex flex-col flex-1 p-5">
                    <span className="inline-block self-start bg-[#f0f7f4] text-[#1A5C38] text-[11px] font-semibold rounded-full px-3 py-1 mb-3">
                      {post.category}
                    </span>
                    <h2 className="text-[17px] font-bold text-[#111] leading-[1.3] mb-2 group-hover:text-[#1A5C38] transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-sm text-[#666] leading-relaxed line-clamp-2 mb-3">
                      {post.summary}
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-xs text-[#999]">{post.dateDisplay}</span>
                      <span className="text-[13px] text-[#1A5C38] font-semibold">
                        Leer &rarr;
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-20">
            No hay artículos en esta categoría todavía.
          </p>
        )}
      </div>
    </div>
  )
}
