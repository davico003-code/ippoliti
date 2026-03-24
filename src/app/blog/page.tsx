import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, ArrowRight } from 'lucide-react'
import { getAllPosts } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Blog | SI Inmobiliaria — Noticias y artículos inmobiliarios',
  description:
    'Artículos sobre el mercado inmobiliario en Roldán, Funes y Rosario. Noticias, consejos y novedades de SI Inmobiliaria.',
  openGraph: {
    title: 'Blog | SI Inmobiliaria',
    description: 'Noticias y artículos inmobiliarios de SI Inmobiliaria.',
  },
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <div className="min-h-screen bg-white">
      {/* Header with background image */}
      <section
        className="relative text-white py-24 md:py-28 px-4 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?w=1400&q=80')" }}
      >
        <div className="absolute inset-0" style={{ background: 'rgba(26,92,56,0.75)' }} />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <p className="text-white/80 text-sm font-bold tracking-widest uppercase mb-4">
            Noticias y artículos
          </p>
          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight drop-shadow-md">Blog</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Novedades del mercado inmobiliario, historias de nuestra empresa y consejos para
            comprar, vender o alquilar en Roldán y la región.
          </p>
        </div>
      </section>

      {/* Posts grid */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-0 divide-y divide-gray-100">
            {posts.map((post) => (
              <article key={post.slug} className="group">
                <Link
                  href={`/blog/${post.slug}`}
                  className="flex flex-col md:flex-row gap-6 py-8 hover:bg-gray-50/60 -mx-4 px-4 rounded-xl transition-colors"
                >
                  {/* Image */}
                  <div className="relative w-full md:w-64 h-44 md:h-40 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                    {post.image.startsWith('http') ? (
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 256px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-brand-50">
                        <div className="bg-brand-600 w-12 h-12 rounded-lg flex items-center justify-center">
                          <span className="text-white font-black text-lg">SI</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Calendar className="w-3.5 h-3.5" />
                        {post.dateDisplay}
                      </span>
                      <span className="text-xs text-brand-600 font-semibold bg-brand-50 px-2 py-0.5 rounded">
                        {post.source}
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-gray-900 mb-2 group-hover:text-brand-600 transition-colors leading-tight">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-3">
                      {post.summary}
                    </p>
                    <span className="inline-flex items-center gap-1 text-brand-600 text-sm font-semibold group-hover:gap-2 transition-all">
                      Leer artículo <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
