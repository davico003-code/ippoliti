import type { Metadata } from 'next'
import { getAllPosts, resolveCategory, readingMinutes } from '@/lib/blog'
import { resolveBlogImage } from '@/lib/blog-images'
import BlogClient from './BlogClient'

// Además del revalidate on-demand del publicador, regenerar cada hora para
// que las notas programadas aparezcan solas al llegar su fecha.
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Blog inmobiliario — Funes, Roldán y región | SI INMOBILIARIA',
  description:
    'Mercado, consejos y análisis para comprar, vender e invertir en Funes y Roldán. Blog de SI INMOBILIARIA.',
  alternates: { canonical: 'https://siinmobiliaria.com/blog' },
  openGraph: {
    title: 'Blog inmobiliario — Funes, Roldán y región',
    description:
      'Mercado, consejos y análisis para comprar, vender e invertir en Funes y Roldán.',
    url: 'https://siinmobiliaria.com/blog',
    images: ['/og-image.jpg'],
  },
}

export default async function BlogPage() {
  const allPosts = await getAllPosts()
  const posts = allPosts.map(p => ({
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    date: p.date,
    dateDisplay: p.dateDisplay,
    image: resolveBlogImage(p.slug, p.image, p.hasImageOverride),
    category: resolveCategory(p.slug, p.category),
    readingMinutes: readingMinutes(p.content),
  }))

  return <BlogClient posts={posts} />
}
