import type { Metadata } from 'next'
import { getAllPosts } from '@/lib/blog'
import { resolveBlogImage } from '@/lib/blog-images'
import BlogClient from './BlogClient'

// Además del revalidate on-demand del publicador, regenerar cada hora para
// que las notas programadas aparezcan solas al llegar su fecha.
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Blog inmobiliario — Funes, Roldán y región | SI Inmobiliaria',
  description:
    'Mercado, consejos y análisis para comprar, vender e invertir en Funes y Roldán. Blog de SI Inmobiliaria.',
  alternates: { canonical: 'https://siinmobiliaria.com/blog' },
  openGraph: {
    title: 'Blog inmobiliario — Funes, Roldán y región',
    description:
      'Mercado, consejos y análisis para comprar, vender e invertir en Funes y Roldán.',
    url: 'https://siinmobiliaria.com/blog',
    images: ['/og-image.jpg'],
  },
}

/* ── Mapeo slug → categoría normalizada ── */
function resolveCategory(slug: string, existing?: string): string {
  if (slug.match(/construccion|pozo|emprendimiento|costo|cac|financiacion|invertir|inversion|pileta|panel|acopio|material/))
    return 'Inversión'
  if (slug.match(/roldan|funes|zona|corredor|mudarse|eje/)) return 'Funes y Roldán'
  if (slug.match(/mercado|precio|m2|valor|alquilar/)) return 'Mercado'
  if (slug.match(/escritura|legal|credito|hipotecario|donacion|herencia|escribano/))
    return 'Legal'
  if (slug.match(/colegio|salud|comercio|supermercado|transporte|restaurante|gimnasio|deporte|seguridad/))
    return 'Calidad de vida'
  if (slug.match(/error|preparar|fijar|elegir|detectar|evaluar|red-flag|arquitecto/))
    return 'Consejos'
  if (slug.match(/historia|susana|si-inmobiliaria|ippoliti/)) return 'Mercado'
  if (existing) return existing
  return 'Mercado'
}

/* Tiempo de lectura estimado (≈200 palabras/min). */
function readingMinutes(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  return Math.max(2, Math.round(words / 200))
}

export default async function BlogPage() {
  const allPosts = await getAllPosts()
  const posts = allPosts.map(p => ({
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    dateDisplay: p.dateDisplay,
    image: resolveBlogImage(p.slug, p.image),
    category: resolveCategory(p.slug, p.category),
    readingMinutes: readingMinutes(p.content),
  }))

  return <BlogClient posts={posts} />
}
