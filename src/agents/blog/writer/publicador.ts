import { put } from '@vercel/blob';
import { Redis } from '@upstash/redis';
import { BLOG_REDIS_KEYS } from '../lib/redis-keys';
import type { NotaDraft, NotaPublicada } from '../types';

const BASE_URL = 'https://siinmobiliaria.com';

function getRedis(): Redis {
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

// `fechaProgramada` (ISO) permite cargar notas con fecha futura (carga masiva);
// sin el parámetro se comporta igual que siempre: publica con el timestamp actual.
export async function publicarNota(
  nota: NotaDraft,
  fechaProgramada?: string,
): Promise<NotaPublicada> {
  const fechaPublicacion = fechaProgramada || new Date().toISOString();
  const urlCompleta = `${BASE_URL}/blog/${nota.slug}`;

  // La imagen NO se busca acá. Unsplash era una dependencia externa frágil (la
  // key no está en prod → todas las notas caían al fallback único). El display
  // asigna una imagen determinística por hash del slug sobre las estáticas
  // curadas (ver imagenPorSlug en blog-posts-dinamicos), con override manual
  // desde /admin/notas con prioridad. Así no se guarda imagen_url al publicar.
  const publicada: NotaPublicada = {
    ...nota,
    fecha_publicacion: fechaPublicacion,
    url_completa: urlCompleta,
  };

  // 1. Guardar en Vercel Blob (store dedicado al blog, público)
  const blobPath = `blog-posts/${nota.slug}.json`;
  await put(blobPath, JSON.stringify(publicada), {
    access: 'public',
    contentType: 'application/json',
    token: process.env.BLOG_READ_WRITE_TOKEN,
  });
  console.log(`[publicador] Blob guardado: ${blobPath}`);

  // 2. Marcar en Redis como publicada (permanente)
  const redis = getRedis();
  await redis.set(BLOG_REDIS_KEYS.notaPublicada(nota.slug), urlCompleta);
  console.log(`[publicador] Redis key: ${BLOG_REDIS_KEYS.notaPublicada(nota.slug)}`);

  // 3. Revalidar rutas en Next.js
  try {
    const secret = process.env.REVALIDATE_SECRET;
    if (secret) {
      await fetch(`${BASE_URL}/api/revalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify({ slug: nota.slug }),
      });
      console.log(`[publicador] Revalidación disparada para /blog y /blog/${nota.slug}`);
    } else {
      console.warn('[publicador] REVALIDATE_SECRET no configurado, skip revalidación');
    }
  } catch (err) {
    // No fallar la publicación por un error de revalidación
    console.warn('[publicador] Error en revalidación (no crítico):', err);
  }

  return publicada;
}
