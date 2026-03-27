import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, ArrowLeft, ExternalLink, MessageCircle, User } from 'lucide-react'
import { getAllPosts, getPostBySlug } from '@/lib/blog'

interface Props {
  params: { slug: string }
}

export function generateStaticParams() {
  return getAllPosts().map(p => ({ slug: p.slug }))
}

export function generateMetadata({ params }: Props): Metadata {
  const post = getPostBySlug(params.slug)
  if (!post) return { title: 'Artículo no encontrado | SI Inmobiliaria' }

  return {
    title: `${post.title} | Blog SI Inmobiliaria`,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: 'article',
      publishedTime: post.date,
      siteName: 'SI Inmobiliaria',
      ...(post.image.startsWith('http') ? { images: [{ url: post.image, width: 800, height: 450 }] } : {}),
    },
  }
}

export default function BlogPostPage({ params }: Props) {
  const post = getPostBySlug(params.slug)

  if (!post) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-3xl font-black text-gray-900 mb-4">Artículo no encontrado</h1>
        <Link href="/blog" className="text-brand-600 font-semibold hover:text-brand-700">
          ← Volver al blog
        </Link>
      </div>
    )
  }

  const allPosts = getAllPosts()
  const related = allPosts
    .filter(p => p.slug !== post.slug)
    .filter(p => post.category ? p.category === post.category : true)
    .slice(0, 3)

  const authorName = post.author || 'SI Inmobiliaria'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    ...(post.image.startsWith('http') ? { image: [post.image] } : {}),
    author: {
      '@type': post.author ? 'Person' : 'Organization',
      name: authorName,
      url: 'https://siinmobiliaria.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'SI Inmobiliaria',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.inmobiliariaippoliti.com/logo.png',
      },
    },
  }

  // Split content into paragraphs
  const paragraphs = post.content.split('\n\n').filter(p => p.trim())

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero image */}
      {post.image.startsWith('http') && (
        <div className="relative w-full h-[40vh] md:h-[50vh]">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-900/90 via-brand-900/40 to-brand-900/20" />
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-10 md:pb-14">
            <div className="max-w-3xl mx-auto">
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al blog
              </Link>
              <div className="flex items-center gap-3 mb-3">
                <span className="flex items-center gap-1.5 text-sm text-white/70">
                  <Calendar className="w-4 h-4" />
                  {post.dateDisplay}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black leading-tight text-white drop-shadow-md">
                {post.title}
              </h1>
            </div>
          </div>
        </div>
      )}

      {/* Fallback header (no image) */}
      {!post.image.startsWith('http') && (
        <section className="bg-brand-600 text-white py-16 md:py-24 px-4">
          <div className="max-w-3xl mx-auto">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-brand-200 hover:text-white text-sm font-medium transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al blog
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center gap-1.5 text-sm text-brand-200">
                <Calendar className="w-4 h-4" />
                {post.dateDisplay}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black leading-tight mb-4">
              {post.title}
            </h1>
            <p className="text-brand-100 text-lg leading-relaxed">{post.summary}</p>
          </div>
        </section>
      )}

      {/* Article body */}
      <article className="py-12 md:py-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Author + source */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-8 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{authorName}</p>
                <p className="text-xs text-gray-400">{post.dateDisplay}</p>
              </div>
            </div>
            {post.source !== 'SI Inmobiliaria' && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <ExternalLink className="w-3.5 h-3.5" />
                Fuente: <span className="font-semibold text-gray-600">{post.source}</span>
              </div>
            )}
            {post.category && (
              <span className="px-3 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-full">{post.category}</span>
            )}
          </div>

          {/* Content — lines ending in ? rendered as H2 subheadings */}
          <div className="space-y-6">
            {paragraphs.map((paragraph, i) => {
              const isHeading = /^[A-ZÁÉÍÓÚÑ¿¡]/.test(paragraph) && (paragraph.endsWith('?') || (paragraph.length < 80 && !paragraph.includes('.')))
              if (isHeading) {
                return <h2 key={i} className="text-2xl font-black text-gray-900 mt-10 mb-2">{paragraph}</h2>
              }
              return (
                <p key={i} className="text-gray-700 text-lg leading-relaxed">
                  {paragraph}
                </p>
              )
            })}
          </div>

          {/* Footer CTA */}
          <div className="mt-16 pt-8 border-t border-gray-100">
            <div className="bg-brand-50 rounded-2xl p-8 text-center">
              <h3 className="text-xl font-black text-gray-900 mb-3">
                ¿Buscás comprar, vender o alquilar?
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Con más de 40 años de experiencia en Roldán y Funes, te acompañamos en cada
                paso.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <a
                  href="https://wa.me/5493412101694?text=Hola!%20Quiero%20consultar%20por%20una%20propiedad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Consultar por WhatsApp
                </a>
                <Link
                  href="/tasaciones"
                  className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg transition-colors"
                >
                  Solicitá tu tasación en 24hs
                </Link>
                <Link
                  href="/propiedades"
                  className="px-6 py-3 border-2 border-brand-600 text-brand-600 hover:bg-brand-600 hover:text-white font-bold rounded-lg transition-colors"
                >
                  Ver propiedades
                </Link>
              </div>
            </div>
          </div>

          {/* Related articles */}
          {related.length > 0 && (
            <div className="mt-16 pt-8 border-t border-gray-100">
              <h3 className="text-xl font-black text-gray-900 mb-6">Art\u00edculos relacionados</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {related.map(r => (
                  <Link key={r.slug} href={`/blog/${r.slug}`} className="group block">
                    {r.image.startsWith('http') && (
                      <div className="relative h-36 rounded-xl overflow-hidden mb-3 bg-gray-100">
                        <Image src={r.image} alt={r.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="33vw" />
                      </div>
                    )}
                    <h4 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-brand-600 transition-colors leading-tight">{r.title}</h4>
                    <p className="text-xs text-gray-400 mt-1">{r.dateDisplay}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back link */}
          <div className="mt-10">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al blog
            </Link>
          </div>
        </div>
      </article>
    </div>
  )
}
