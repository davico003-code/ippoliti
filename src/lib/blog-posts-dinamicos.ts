import { list, type ListBlobResultBlob } from '@vercel/blob';
import type { BlogPost } from './blog';

// Cache simple en memoria (60 segundos)
let _cache: { posts: BlogPost[]; ts: number } | null = null;
const CACHE_TTL_MS = 60_000;

interface NotaPublicadaBlob {
  titulo: string;
  slug: string;
  meta_description: string;
  bajada: string;
  contenido_markdown: string;
  keywords: string[];
  categoria: string;
  imagen_sugerida: string;
  cta_usado: string;
  fecha_publicacion: string;
  url_completa: string;
}

function blobToBlogPost(nota: NotaPublicadaBlob): BlogPost {
  const fecha = new Date(nota.fecha_publicacion);
  return {
    slug: nota.slug,
    title: nota.titulo,
    date: nota.fecha_publicacion.split('T')[0],
    dateDisplay: fecha.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    source: 'SI Inmobiliaria',
    image: nota.imagen_sugerida.startsWith('http')
      ? nota.imagen_sugerida
      : '/blog/images/funes-barrios-arbolados-aerea.webp',
    summary: nota.bajada,
    content: nota.contenido_markdown,
    category: nota.categoria,
    author: 'David Flores',
  };
}

export async function getPostsDinamicos(): Promise<BlogPost[]> {
  // Servir de cache si está fresco
  if (_cache && Date.now() - _cache.ts < CACHE_TTL_MS) {
    return _cache.posts;
  }

  try {
    const blobs: ListBlobResultBlob[] = [];
    let cursor: string | undefined;

    // Paginar el listado de blobs
    do {
      const result = await list({ prefix: 'blog-posts/', cursor });
      blobs.push(...result.blobs);
      cursor = result.hasMore ? result.cursor : undefined;
    } while (cursor);

    if (blobs.length === 0) {
      _cache = { posts: [], ts: Date.now() };
      return [];
    }

    // Descargar cada blob JSON en paralelo
    const posts = await Promise.all(
      blobs.map(async (blob) => {
        try {
          const res = await fetch(blob.url, { cache: 'no-store' });
          const data = (await res.json()) as NotaPublicadaBlob;
          return blobToBlogPost(data);
        } catch (err) {
          console.warn(`[blog-dinamicos] Error leyendo blob ${blob.pathname}:`, err);
          return null;
        }
      }),
    );

    const valid = posts.filter((p): p is BlogPost => p !== null);
    _cache = { posts: valid, ts: Date.now() };
    return valid;
  } catch (err) {
    console.warn('[blog-dinamicos] Error listando blobs:', err);
    return _cache?.posts ?? [];
  }
}

export async function getAllExistingSlugs(): Promise<Set<string>> {
  // Importar posts hardcodeados (acceso sync)
  const { posts: hardcoded } = await import('./blog');
  const dinamicos = await getPostsDinamicos();

  const slugs = new Set<string>();
  for (const p of hardcoded) slugs.add(p.slug);
  for (const p of dinamicos) slugs.add(p.slug);
  return slugs;
}
