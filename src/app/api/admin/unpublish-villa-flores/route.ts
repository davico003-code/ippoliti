import { list, del } from '@vercel/blob';
import { Redis } from '@upstash/redis';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface NotaBlob {
  titulo?: string;
}

function getRedis(): Redis {
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

export async function POST(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const log: string[] = [];
  const result: Record<string, unknown> = {};

  // 1.a) Listar
  const { blobs } = await list({ prefix: 'blog-posts/' });
  const slugs = blobs.map(b => b.pathname.replace('blog-posts/', '').replace('.json', ''));
  log.push(`blobs encontrados: ${blobs.length}`);
  result.allSlugs = slugs;

  // 1.b) Identificar Villa Flores
  const target = blobs.find(b => /villa[-_]?flores/i.test(b.pathname));
  if (!target) {
    log.push('NO se encontró ningún blob de Villa Flores');
    result.log = log;
    return Response.json(result);
  }
  const slug = target.pathname.replace('blog-posts/', '').replace('.json', '');
  log.push(`target: ${slug}`);
  result.slugBorrado = slug;

  // Leer título
  let titulo: string | null = null;
  try {
    const r = await fetch(target.url);
    const data = (await r.json()) as NotaBlob;
    titulo = data.titulo ?? null;
    log.push(`titulo: "${titulo}"`);
  } catch (err) {
    log.push(`error leyendo blob: ${(err as Error).message}`);
  }

  // 1.c) Borrar blob
  await del(target.url);
  log.push(`blob borrado: ${target.pathname}`);

  // 1.d) Borrar Redis
  const redis = getRedis();
  const publicadaKey = `blog:publicada:${slug}`;
  const delPub = await redis.del(publicadaKey);
  log.push(`DEL ${publicadaKey} → ${delPub}`);

  const usados = await redis.get<string[]>('blog:temas_usados');
  if (Array.isArray(usados)) {
    const filtrados = usados.filter(t => {
      if (titulo && t === titulo) return false;
      return !/villa[-\s]?flores/i.test(t);
    });
    if (filtrados.length !== usados.length) {
      await redis.set('blog:temas_usados', filtrados);
      log.push(`temas_usados: removidos ${usados.length - filtrados.length}`);
    } else {
      log.push('temas_usados: sin cambios');
    }
  }

  // 1.e) Revalidar (server-side directo)
  revalidatePath('/blog');
  revalidatePath(`/blog/${slug}`);
  log.push(`revalidatePath /blog y /blog/${slug}`);

  // 3) Cleanup Redis general
  const cleaned: string[] = [];
  const r1 = await redis.del('blog:temas_semana');
  cleaned.push(`blog:temas_semana → ${r1}`);

  // SCAN blog:pendiente:*
  let cursor: string | number = 0;
  const toDelete: string[] = [];
  do {
    const scanResult: [string, string[]] = await redis.scan(cursor, { match: 'blog:pendiente:*', count: 100 });
    toDelete.push(...scanResult[1]);
    cursor = scanResult[0];
  } while (String(cursor) !== '0');

  // SCAN blog:temas_aprobados*
  cursor = 0;
  do {
    const scanResult: [string, string[]] = await redis.scan(cursor, { match: 'blog:temas_aprobados*', count: 100 });
    toDelete.push(...scanResult[1]);
    cursor = scanResult[0];
  } while (String(cursor) !== '0');

  for (const k of toDelete) {
    const r = await redis.del(k);
    cleaned.push(`${k} → ${r}`);
  }

  result.redisCleaned = cleaned;
  result.log = log;
  return Response.json(result);
}
