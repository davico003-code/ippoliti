import type { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, ArrowLeft, ExternalLink, User } from 'lucide-react'
import { getAllPosts, getPostBySlug } from '@/lib/blog'

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  return (await getAllPosts()).map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)
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

/* Pexels image map — same as blog/page.tsx */
const PEXELS_IMAGES: Record<string, number> = {
  'costo-construccion-argentina-precio-propiedades': 3862132,
  'composicion-precio-m2-pozo-emprendimientos': 1396122,
  'red-flags-emprendimientos-inmobiliarios-pozo': 1370704,
  'inmobiliarias-roldan-como-elegir-la-mejor': 106399,
  'desarrollo-costo-vs-precio-cerrado-compradores': 3184292,
  'arquitectos-roldan-cuando-necesitas-uno-para-tu-propiedad': 1109541,
  'mano-obra-construccion-precio-propiedades-funes': 159358,
  'escribanos-roldan-rol-en-compra-venta-propiedad': 95916,
  'como-evaluar-desarrolladora-antes-invertir': 3184292,
  'constructoras-roldan-funes-construir-casa-2025': 2219024,
  'invertir-pozo-funes-2025-analisis': 1115804,
  'colegios-roldan-funes-guia-familias-que-se-mudan': 764681,
  'financiacion-largo-plazo-emprendimientos-2026': 5699823,
  'que-aspectos-aumentan-valor-lote-funes-roldan': 259588,
  'supermercados-comercios-roldan-vivir-sin-auto': 1005638,
  'acopio-materiales-canje-m2-compradores': 3760529,
  'transporte-colectivo-roldan-rosario-opciones': 1178448,
  'precio-m2-funes-roldan-perspectiva-2026': 323780,
  'salud-medicos-clinicas-roldan-lo-que-tenes-que-saber': 40568,
  'bancos-cajeros-roldan-servicios-financieros': 50987,
  'restaurantes-gastronomia-roldan-para-vivir-y-disfrutar': 1640777,
  'mercado-inmobiliario-2025-que-esta-pasando': 1546168,
  'seguridad-privada-barrios-cerrados-roldan-funes': 280229,
  'gimnasios-deportes-roldan-calidad-de-vida': 260447,
  'piletas-construccion-mantenimiento-roldan-funes': 261102,
  'paneles-solares-roldan-funes-conviene-2025': 2800832,
  'mudarse-roldan-desde-rosario-guia-completa-2025': 1115804,
  'funes-roldan-nuevo-eje-crecimiento-inmobiliario-gran-rosario': 1396122,
  'cuanto-deberia-rendir-inversion-inmobiliaria-dolares': 5699823,
  'comprar-casa-funes-roldan': 106399,
  'comprar-con-escritura-inmediata-inversion-segura': 95916,
  'como-detectar-loteo-confiable-funes-roldan': 259588,
  'barrios-cerrados-vs-abiertos-cual-conviene': 280229,
  'creditos-hipotecarios-argentina-que-tener-en-cuenta': 50987,
  'como-fijar-precio-venta-propiedad-sin-perder-dinero': 1370704,
  'inmobiliarias-en-roldan': 106399,
  '5-errores-comunes-comprar-inmueble-primera-vez': 3184292,
  'invertir-en-pozo-funes-ventajas-riesgos': 1115804,
  'corredor-funes-roldan-historia-crecimiento-proyeccion': 1396122,
  'inmobiliarias-en-funes': 106399,
  'que-es-cac-como-afecta-valor-propiedades-pesos': 5699823,
  'valor-m2-funes-roldan-analisis-por-barrio-tipologia': 323780,
  'como-preparar-propiedad-vender-rapido-mejor-precio': 2219024,
  'alquilar-o-comprar-2025-analisis-zona-oeste-rosario': 1370704,
  'por-que-roldan-nueva-apuesta-desarrolladores-inmobiliarios': 1396122,
  'financiacion-dolares-cuotas-fijas-vs-hipoteca': 50987,
  'donacion-herencia-compraventa-transferir-propiedad-argentina': 95916,
  'guia-completa-invertir-lotes-santa-fe': 259588,
  'por-que-si-inmobiliaria-43-anos-historia-familiar-roldan': 106399,
  'mercado-inmobiliario-roldan-como-saber-propiedad-bien-valuada': 323780,
  'si-inmobiliaria-abre-funes-galeria-arte': 1640777,
  'de-susana-ippoliti-a-si-inmobiliaria-cambio-dice-si-futuro': 106399,
}

function resolveImage(slug: string, originalImage: string): string | null {
  if (PEXELS_IMAGES[slug]) {
    const id = PEXELS_IMAGES[slug]
    return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800`
  }
  if (originalImage.startsWith('http')) return originalImage
  return null
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPostBySlug(params.slug)

  if (!post) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-3xl font-black text-gray-900 mb-4">Artículo no encontrado</h1>
        <Link href="/blog" className="text-[#1A5C38] font-semibold hover:underline">
          &larr; Volver al blog
        </Link>
      </div>
    )
  }

  const allPosts = await getAllPosts()
  const related = allPosts
    .filter(p => p.slug !== post.slug)
    .filter(p => post.category ? p.category === post.category : true)
    .slice(0, 3)

  const authorName = post.author || 'SI Inmobiliaria'
  const heroImage = resolveImage(post.slug, post.image)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    ...(heroImage ? { image: [heroImage] } : {}),
    author: {
      '@type': post.author ? 'Person' : 'Organization',
      name: authorName,
      url: 'https://siinmobiliaria.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'SI Inmobiliaria',
      logo: { '@type': 'ImageObject', url: 'https://siinmobiliaria.com/logo.png' },
    },
  }

  const paragraphs = post.content.split('\n\n').filter(p => p.trim())

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── HERO ── */}
      {heroImage ? (
        <div
          className="relative w-full h-[50vh] md:h-[60vh] bg-cover bg-center"
          style={{ backgroundImage: `url('${heroImage}')` }}
        >
          <div className="absolute inset-0 bg-black/50" />
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
                {post.category && (
                  <span className="px-3 py-1 bg-white/15 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                    {post.category}
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-black leading-tight text-white drop-shadow-md">
                {post.title}
              </h1>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-[50vh] md:h-[60vh] bg-gradient-to-br from-[#1A5C38] to-[#0f3d26]">
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
                {post.category && (
                  <span className="px-3 py-1 bg-white/15 text-white text-xs font-semibold rounded-full">
                    {post.category}
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-black leading-tight text-white">
                {post.title}
              </h1>
            </div>
          </div>
        </div>
      )}

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
            {post.source !== 'SI Inmobiliaria' && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <ExternalLink className="w-3.5 h-3.5" />
                Fuente: <span className="font-semibold text-gray-600">{post.source}</span>
              </div>
            )}
          </div>

          {/* Content */}
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

          {/* ── Atribución Unsplash (requisito de licencia) ── */}
          {post.imagen_photographer && post.imagen_photographer_url && (
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
                  const rImage = resolveImage(r.slug, r.image)
                  return (
                    <Link key={r.slug} href={`/blog/${r.slug}`} className="group block">
                      <div className="relative aspect-video rounded-xl overflow-hidden mb-3 transition-all duration-300 group-hover:shadow-lg group-hover:scale-[1.02]">
                        {rImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={rImage} alt={r.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#1A5C38] to-[#0f3d26] flex items-center justify-center p-4">
                            <span className="text-white/80 text-sm font-semibold text-center leading-tight line-clamp-3">
                              {r.title}
                            </span>
                          </div>
                        )}
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
