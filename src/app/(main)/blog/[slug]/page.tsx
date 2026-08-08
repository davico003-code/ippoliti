import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, ArrowLeft, ExternalLink, User, Clock } from 'lucide-react'
import { notFound } from 'next/navigation'
import { getAllPosts, getPostBySlug, resolveCategory, readingMinutes } from '@/lib/blog'
import { resolveBlogImage, BLOG_IMAGES } from '@/lib/blog-images'

// Regenerar cada hora: una nota programada deja de dar 404 sola al llegar
// su fecha, sin depender del revalidate on-demand.
export const revalidate = 3600

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  return (await getAllPosts()).map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)
  // Defensa: el body hace notFound() (404 real), pero por si algún día esta
  // ruta gana un boundary de streaming que commitee 200, que quede el noindex.
  if (!post) return { title: 'Artículo no encontrado | SI INMOBILIARIA', robots: { index: false, follow: false } }

  const url = `https://siinmobiliaria.com/blog/${params.slug}`
  // Imagen OG SIEMPRE absoluta: usamos la imagen curada (única por post) y, si
  // fuera un path local (/blog/images/...), la prefijamos con el dominio.
  const resolved = resolveBlogImage(post.slug, post.image, post.hasImageOverride)
  const ogImage = resolved.startsWith('http')
    ? resolved
    : `https://siinmobiliaria.com${resolved}`

  return {
    title: `${post.title} | Blog SI INMOBILIARIA`,
    description: post.summary,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.summary,
      type: 'article',
      publishedTime: post.date,
      siteName: 'SI INMOBILIARIA',
      url,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
      images: [ogImage],
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPostBySlug(params.slug)

  // 404 real (antes: pantalla "Artículo no encontrado" con HTTP 200 — soft-404
  // que Google podía indexar). Cubre slugs inexistentes y notas programadas
  // antes de su fecha. Renderiza el not-found brandeado de (main).
  if (!post) notFound()

  // Categoría normalizada (misma fuente que el listado) para que el chip y los
  // relacionados sean consistentes con lo que el usuario vio en /blog.
  const category = resolveCategory(post.slug, post.category)
  const allPosts = await getAllPosts()
  const related = allPosts
    .filter(p => p.slug !== post.slug)
    .filter(p => resolveCategory(p.slug, p.category) === category)
    .slice(0, 3)

  const authorName = post.author || 'SI INMOBILIARIA'
  const heroImage = resolveBlogImage(post.slug, post.image, post.hasImageOverride)
  const minutos = readingMinutes(post.content)
  // Si la imagen viene del mapa curado, la atribución propia del post ya no
  // corresponde (reemplazamos la foto original).
  const usaImagenCurada = post.hasImageOverride || Boolean(BLOG_IMAGES[post.slug])

  // BlogPosting completo para rich results. Solo campos con datos reales del
  // post. El publisher referencia por @id a la entidad #organization del
  // layout raíz. datePublished usa el ISO completo cuando existe (notas
  // dinámicas); dateModified sale de la edición vía panel (updatedAt) y cae a
  // la fecha de publicación si la nota nunca se editó.
  const postUrl = `https://siinmobiliaria.com/blog/${post.slug}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary,
    datePublished: post.publishAt ?? post.date,
    dateModified: post.updatedAt ?? post.publishAt ?? post.date,
    mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
    url: postUrl,
    inLanguage: 'es-AR',
    image: [heroImage],
    author: {
      '@type': post.author ? 'Person' : 'Organization',
      name: authorName,
      url: 'https://siinmobiliaria.com',
    },
    publisher: {
      '@type': 'Organization',
      '@id': 'https://siinmobiliaria.com/#organization',
      name: 'SI INMOBILIARIA',
      logo: {
        '@type': 'ImageObject',
        url: 'https://siinmobiliaria.com/logo-si-horizontal.png',
      },
    },
  }

  const paragraphs = post.content.split('\n\n').filter(p => p.trim())

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── HERO editorial ── */}
      <header className="relative w-full h-[54vh] min-h-[420px] md:h-[64vh] md:min-h-[520px]">
        <Image
          src={heroImage}
          alt={post.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20" />
        <div className="absolute inset-x-0 bottom-0 px-4 pb-10 md:pb-14">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/blog"
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-white/75 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al blog
            </Link>
            <span
              className="mb-4 inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white"
              style={{ backgroundColor: '#1A5C38' }}
            >
              {category}
            </span>
            <h1 className="text-3xl font-black leading-[1.08] text-white drop-shadow-sm md:text-5xl">
              {post.title}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-white/75">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {post.dateDisplay}
              </span>
              <span className="text-white/40">·</span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {minutos} min de lectura
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── ARTICLE BODY ── */}
      <article className="py-12 md:py-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Author + source */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-8 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1A5C38] flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{authorName}</p>
                <p className="text-xs text-gray-400">{post.dateDisplay}</p>
              </div>
            </div>
            {post.source !== 'SI INMOBILIARIA' && post.source !== 'SI Inmobiliaria' && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <ExternalLink className="w-3.5 h-3.5" />
                Fuente: <span className="font-semibold text-gray-600">{post.source}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-6">
            {(() => {
              // Heurística conservadora de subtítulo (el content es texto plano
              // sin marcado): línea corta que arranca en mayúscula, sin punto y
              // sin coma. Exigir "sin coma" y menos de 70 chars evita marcar
              // frases cortas de prosa como h2. Sigue siendo inferencia.
              const looksHeading = (p: string) =>
                /^[A-ZÁÉÍÓÚÑ¿¡]/.test(p) && p.length < 70 && !p.includes('.') && !p.includes(',')
              const getMarkdownImage = (p: string) => {
                const match = p.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
                if (!match) return null
                return { alt: match[1].trim(), src: match[2].trim() }
              }
              const isRenderableText = (p: string) => !looksHeading(p) && !getMarkdownImage(p)
              const firstParaIdx = paragraphs.findIndex(isRenderableText)
              return paragraphs.map((paragraph, i) => {
                const trimmed = paragraph.trim()
                const inlineImage = getMarkdownImage(trimmed)
                if (inlineImage) {
                  const alt = inlineImage.alt || post.title
                  return (
                    <figure
                      key={i}
                      className="my-10 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
                    >
                      <div className="relative aspect-[4/3] w-full">
                        <Image
                          src={inlineImage.src}
                          alt={alt}
                          fill
                          sizes="(max-width: 768px) 100vw, 768px"
                          className="object-cover"
                        />
                      </div>
                      {inlineImage.alt && (
                        <figcaption className="px-4 py-3 text-sm leading-relaxed text-gray-500">
                          {inlineImage.alt}
                        </figcaption>
                      )}
                    </figure>
                  )
                }

                const markdownHeading = trimmed.match(/^#{2,3}\s+(.+)$/)
                const isHeading = Boolean(markdownHeading) || looksHeading(trimmed)
                if (isHeading) {
                  return (
                    <h2 key={i} className="mb-2 mt-12 text-[1.6rem] font-black leading-tight tracking-tight text-gray-900">
                      {markdownHeading ? markdownHeading[1] : trimmed}
                    </h2>
                  )
                }
                // Capitular solo en el primer párrafo real y si arranca con letra.
                const dropCap = i === firstParaIdx && /^[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(trimmed)
                return (
                  <p
                    key={i}
                    className={`text-[17px] leading-[1.8] text-gray-700 md:text-lg ${
                      dropCap
                        ? 'first-letter:float-left first-letter:mr-2.5 first-letter:mt-1 first-letter:text-[3.4rem] first-letter:font-black first-letter:leading-[0.8] first-letter:text-[#1A5C38]'
                      : ''
                    }`}
                  >
                    {trimmed}
                  </p>
                )
              })
            })()}
          </div>

          {/* ── Atribución Unsplash (requisito de licencia) ── */}
          {!usaImagenCurada && post.imagen_photographer && post.imagen_photographer_url && (
            <p className="text-xs text-gray-500 mt-8 italic">
              Foto:{' '}
              <a
                href={`${post.imagen_photographer_url}?utm_source=si_inmobiliaria&utm_medium=referral`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gray-700"
              >
                {post.imagen_photographer}
              </a>{' '}
              en{' '}
              <a
                href="https://unsplash.com/?utm_source=si_inmobiliaria&utm_medium=referral"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gray-700"
              >
                Unsplash
              </a>
            </p>
          )}

          {/* ── CTA — Apple style ── */}
          <div className="mt-16 -mx-4 md:-mx-16 lg:-mx-24">
            <div className="bg-[#111] rounded-3xl px-8 py-16 md:py-20 text-center">
              <h3 className="text-3xl md:text-4xl font-light text-white leading-tight mb-4 max-w-xl mx-auto">
                La mejor decisión comienza con la mejor asesoría.
              </h3>
              <p className="text-gray-400 text-base mb-10 max-w-md mx-auto">
                Más de 40 años acompañando familias en Roldán y Funes. Hablemos sobre tu proyecto.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="https://wa.me/5493412101694?text=Hola!%20Quiero%20consultar%20por%20una%20propiedad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3.5 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-colors text-center"
                >
                  Consultanos
                </a>
                <Link
                  href="/propiedades"
                  className="px-8 py-3.5 border border-gray-600 text-white font-semibold rounded-full hover:border-gray-400 transition-colors text-center"
                >
                  Ver propiedades
                </Link>
              </div>
            </div>
          </div>

          {/* ── ARTÍCULOS RELACIONADOS ── */}
          {related.length > 0 && (
            <div className="mt-16 pt-8 border-t border-gray-100">
              <h3 className="text-xl font-black text-gray-900 mb-6">Artículos relacionados</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {related.map(r => {
                  const rImage = resolveBlogImage(r.slug, r.image, r.hasImageOverride)
                  return (
                    <Link key={r.slug} href={`/blog/${r.slug}`} className="group block">
                      <div className="relative aspect-video rounded-xl overflow-hidden mb-3 transition-all duration-300 group-hover:shadow-lg group-hover:scale-[1.02]">
                        <Image
                          src={rImage}
                          alt={r.title}
                          fill
                          sizes="(max-width: 640px) 100vw, 33vw"
                          className="object-cover"
                          loading="lazy"
                        />
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-[#1A5C38] transition-colors leading-tight">
                        {r.title}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">{r.dateDisplay}</p>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Back link */}
          <div className="mt-10">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-[#1A5C38] hover:text-[#0F3A23] font-bold transition-colors"
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
