import { Redis } from '@upstash/redis';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

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
  const redis = getRedis();

  // Blob storage no está conectado al proyecto (no existe BLOB_READ_WRITE_TOKEN)
  // → no hay nota publicada en Blob para borrar.
  // El publicador falla silenciosamente cuando intenta escribir.
  log.push('NOTA: Vercel Blob no está conectado al proyecto, ninguna nota se publicó nunca');

  // Limpiar Redis ──
  // 1. Borrar publicada por si quedó algún fantasma
  const slugsCandidatos = [
    'zoom-barrio-villa-flores-roldan-historia-infraestructura-y-oportunidades-inmobiliarias',
    'villa-flores-roldan',
    'villa-flores',
    'zoom-barrio-villa-flores',
    'seguridad-hogar-robo-proteccion-funes-roldan',
  ];
  for (const slug of slugsCandidatos) {
    const r = await redis.del(`blog:publicada:${slug}`);
    if (r > 0) log.push(`DEL blog:publicada:${slug} → ${r}`);
  }

  // 2. Filtrar temas_usados
  const usados = await redis.get<string[]>('blog:temas_usados');
  if (Array.isArray(usados)) {
    const filtrados = usados.filter(t => !/villa[-\s]?flores/i.test(t));
    if (filtrados.length !== usados.length) {
      await redis.set('blog:temas_usados', filtrados);
      log.push(`temas_usados: removidos ${usados.length - filtrados.length} relacionados a Villa Flores`);
    }
  }

  // 3. Cleanup general
  const r1 = await redis.del('blog:temas_semana');
  log.push(`DEL blog:temas_semana → ${r1}`);

  let cursor: string | number = 0;
  const toDelete: string[] = [];
  do {
    const scanResult: [string, string[]] = await redis.scan(cursor, { match: 'blog:pendiente:*', count: 100 });
    toDelete.push(...scanResult[1]);
    cursor = scanResult[0];
  } while (String(cursor) !== '0');

  cursor = 0;
  do {
    const scanResult: [string, string[]] = await redis.scan(cursor, { match: 'blog:temas_aprobados*', count: 100 });
    toDelete.push(...scanResult[1]);
    cursor = scanResult[0];
  } while (String(cursor) !== '0');

  for (const k of toDelete) {
    const r = await redis.del(k);
    log.push(`DEL ${k} → ${r}`);
  }

  return Response.json({ ok: true, log });
}
