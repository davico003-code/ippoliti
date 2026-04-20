// Lee una nota publicada por slug desde Vercel Blob (la misma fuente que usa
// /blog en el frontend). Usada por el cron y por el endpoint dev del extractor.

import { list } from '@vercel/blob'
import type { NotaParaExtractor } from '../types'

interface NotaPublicadaBlob {
  titulo: string
  slug: string
  meta_description: string
  bajada: string
  contenido_markdown: string
  keywords: string[]
  categoria: string
  imagen_sugerida: string
  imagen_url?: string
  cta_usado?: string
  fecha_publicacion?: string
  url_completa?: string
}

export async function leerNotaPorSlug(slug: string): Promise<NotaParaExtractor | null> {
  const blobPath = `blog-posts/${slug}.json`
  const result = await list({ prefix: blobPath })
  const match = result.blobs.find(b => b.pathname === blobPath)
  if (!match) return null

  const res = await fetch(match.url, { cache: 'no-store' })
  if (!res.ok) return null
  const data = (await res.json()) as NotaPublicadaBlob

  return {
    titulo: data.titulo,
    slug: data.slug,
    meta_description: data.meta_description,
    bajada: data.bajada,
    contenido_markdown: data.contenido_markdown,
    keywords: data.keywords,
    categoria: data.categoria,
    imagen_sugerida: data.imagen_sugerida,
    imagen_url: data.imagen_url,
  }
}

/** Lista las notas más recientes (ordenadas por fecha desc) — para el cron
 *  que necesita "la última publicada". */
export async function leerUltimaNota(): Promise<NotaParaExtractor | null> {
  const result = await list({ prefix: 'blog-posts/' })
  if (result.blobs.length === 0) return null
  const sorted = [...result.blobs].sort((a, b) =>
    new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
  )
  const res = await fetch(sorted[0].url, { cache: 'no-store' })
  if (!res.ok) return null
  const data = (await res.json()) as NotaPublicadaBlob
  return {
    titulo: data.titulo,
    slug: data.slug,
    meta_description: data.meta_description,
    bajada: data.bajada,
    contenido_markdown: data.contenido_markdown,
    keywords: data.keywords,
    categoria: data.categoria,
    imagen_sugerida: data.imagen_sugerida,
    imagen_url: data.imagen_url,
  }
}
