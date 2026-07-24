import { list, type ListBlobResultBlob } from '@vercel/blob';
import { hgetallCached } from './redis-isr';
import type { BlogPost } from './blog';

// Cache simple en memoria (60 segundos)
let _cache: { posts: BlogPost[]; ts: number } | null = null;
const CACHE_TTL_MS = 60_000;

// Caches de metadata de Redis (tombstones + overrides de imagen), 60s.
let _redirCache: { map: Record<string, string>; ts: number } | null = null;
let _imgCache: { map: Record<string, string>; ts: number } | null = null;
const META_TTL_MS = 60_000;

function isStaticBuild() {
  return process.env.NEXT_PHASE === 'phase-production-build';
}

// Notas borradas (soft-delete): slug → URL destino del 301. Sirve de tombstone
// (se filtra del listado público) y de fuente del redirect. NO se destruye el
// Blob; quitar el slug del hash revierte el borrado.
export async function getBlogRedirects(): Promise<Record<string, string>> {
  if (_redirCache && Date.now() - _redirCache.ts < META_TTL_MS) return _redirCache.map;
  if (isStaticBuild()) return {};
  // hgetallCached: fetch cacheable (ISR-safe). El cliente @upstash/redis hacía
  // no-store → DYNAMIC_SERVER_USAGE → 500 en slugs desconocidos del blog.
  const map = await hgetallCached('blog:redirects');
  _redirCache = { map, ts: Date.now() };
  return map;
}

// Override manual de imagen por nota: slug → URL de imagen (Blob).
export async function getImageOverrides(): Promise<Record<string, string>> {
  if (_imgCache && Date.now() - _imgCache.ts < META_TTL_MS) return _imgCache.map;
  if (isStaticBuild()) return {};
  const map = await hgetallCached('blog:image_override');
  _imgCache = { map, ts: Date.now() };
  return map;
}

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
  imagen_url?: string;
  imagen_alt?: string;
  imagen_photographer?: string;
  imagen_photographer_url?: string;
}

// Pool mixto de imágenes locales + Pexels gratuitas. El default por nota se
// asigna por hash del slug → estable (mismo slug = misma imagen siempre) y
// repartido para evitar que las notas dinámicas repitan siempre las mismas
// aéreas de Funes/Roldán.
const IMAGENES_BLOG = [
  '/blog/images/funes-autopista-acceso-aerea.webp',
  '/blog/images/funes-avenida-arbolada-campo.webp',
  '/blog/images/funes-barrio-cerrado-lotes-aereo.webp',
  '/blog/images/funes-barrios-arbolados-aerea.webp',
  '/blog/images/funes-barrios-nuevos-aereo.webp',
  '/blog/images/funes-casas-piletas-barrios-aereo.webp',
  '/blog/images/funes-roldan-zona-oeste-aerea.webp',
  '/blog/images/funes-vista-aerea-barrios-2026.webp',
  '/blog/images/funes-zona-residencial-arboles-aereo.webp',
  '/blog/images/roldan-vista-aerea-autopista.webp',
  '/blog/images/roldan-vista-aerea-panoramica.webp',
  'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/1546168/pexels-photo-1546168.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/8293777/pexels-photo-8293777.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/8293744/pexels-photo-8293744.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/4626268/pexels-photo-4626268.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/1109541/pexels-photo-1109541.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/30751525/pexels-photo-30751525.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/7587880/pexels-photo-7587880.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/7578992/pexels-photo-7578992.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/7109314/pexels-photo-7109314.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/31015267/pexels-photo-31015267.jpeg?auto=compress&cs=tinysrgb&w=1200',
] as const;

// Hash estable (multiplicador 31, 32-bit) → índice en IMAGENES_BLOG. Pura
// función del slug: determinística entre renders y revalidaciones.
export function imagenPorSlug(slug: string): string {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (Math.imul(h, 31) + slug.charCodeAt(i)) >>> 0;
  }
  return IMAGENES_BLOG[h % IMAGENES_BLOG.length];
}

function blobToBlogPost(nota: NotaPublicadaBlob): BlogPost | null {
  // Guard: un blob incompleto (sin slug o sin fecha) reventaba en
  // `fecha_publicacion.split` (TypeError) → la nota desaparecía del blog. Mejor
  // descartarla explícita y silenciosamente.
  if (!nota?.slug || !nota?.fecha_publicacion) {
    console.warn('[blog-dinamicos] blob incompleto, se descarta:', nota?.slug);
    return null;
  }
  const fecha = new Date(nota.fecha_publicacion);
  // imagen_url (legacy Unsplash, hoy null en todas) → si no, asignación
  // determinística por hash del slug. Aplica retroactivamente a las notas
  // viejas que caían al fallback único. El override manual tiene prioridad y se
  // aplica en getAllPosts/getPostBySlug (override > imagen_url > hash).
  const image = nota.imagen_url ?? imagenPorSlug(nota.slug);

  return {
    slug: nota.slug,
    title: nota.titulo,
    date: nota.fecha_publicacion.split('T')[0],
    dateDisplay: fecha.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    source: 'SI INMOBILIARIA',
    image,
    summary: nota.bajada,
    content: nota.contenido_markdown,
    category: nota.categoria,
    author: 'David Flores',
    imagen_photographer: nota.imagen_photographer,
    imagen_photographer_url: nota.imagen_photographer_url,
    publishAt: nota.fecha_publicacion,
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

    // Paginar el listado de blobs (store dedicado al blog)
    const token = process.env.BLOG_READ_WRITE_TOKEN;
    do {
      const result = await list({ prefix: 'blog-posts/', cursor, token });
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
          // El pathname se sobrescribe al editar una nota. Versionar la URL con
          // uploadedAt evita que force-cache conserve el JSON anterior después
          // de una edición, sin perder SSG/ISR como ocurriría con no-store.
          const version = new Date(blob.uploadedAt).getTime();
          const res = await fetch(`${blob.url}?v=${version}`, {
            cache: 'force-cache',
            next: { tags: ['blog-posts'] },
          });
          if (!res.ok) {
            console.warn(`[blog-dinamicos] blob ${blob.pathname} devolvió ${res.status}`);
            return null;
          }
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
