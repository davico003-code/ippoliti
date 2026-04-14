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

export async function publicarNota(nota: NotaDraft): Promise<NotaPublicada> {
  const fechaPublicacion = new Date().toISOString();
  const urlCompleta = `${BASE_URL}/blog/${nota.slug}`;

  const publicada: NotaPublicada = {
    ...nota,
    fecha_publicacion: fechaPublicacion,
    url_completa: urlCompleta,
  };

  // 1. Guardar en Vercel Blob
  const blobPath = `blog-posts/${nota.slug}.json`;
  await put(blobPath, JSON.stringify(publicada), {
    access: 'public',
    contentType: 'application/json',
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
