import { Redis } from '@upstash/redis';
import { BLOG_REDIS_KEYS } from '../lib/redis-keys';
import { seleccionarCTA } from '../config/ctas';
import { obtenerContextoEconomico } from '../lib/datos-economicos';
import { notificarConAlerta } from '../lib/alert';
import { generarNotaConRetries } from './generar-nota';
import { publicarNota } from './publicador';
import { filtrarTemasUsados } from '../lib/dedupe';
import { getAllPosts } from '@/lib/blog';
import type { TemaPropuesto } from '../types';

function getRedis(): Redis {
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

function contarPalabras(markdown: string): number {
  return markdown
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/>\s*/gm, '')
    .replace(/[-*]\s+/gm, '')
    .replace(/\*\*|__|\*|_/g, '')
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 0).length;
}

interface WriterResult {
  ok: boolean;
  notaUrl?: string;
  error?: string;
}

export async function ejecutarWriterDia(
  dia: 'martes' | 'viernes',
): Promise<WriterResult> {
  const redis = getRedis();

  // 1. Leer temas aprobados
  const raw = await redis.get<string>(BLOG_REDIS_KEYS.temasAprobados);

  let aprobados: TemaPropuesto[];
  try {
    aprobados = raw
      ? (typeof raw === 'string' ? JSON.parse(raw) : raw) as TemaPropuesto[]
      : [];
  } catch {
    aprobados = [];
  }

  // Cola FIFO: cada corrida consume el primero. Si quedó vacía (porque ya se
  // consumieron los temas de la semana), NO se republica nada ni se publica
  // vacío: se saltea el ciclo con aviso.
  if (aprobados.length < 1) {
    await notificarConAlerta(
      `⚠️ No hay temas aprobados para ${dia}. No se publica nada. Aprobá temas nuevos respondiendo al radar del lunes (2 números).`,
      `writer-${dia}: sin-temas`,
    );
    return { ok: false, error: 'sin-temas' };
  }

  // 2. Tomar el primero de la cola
  const tema = aprobados[0];

  // 2b. Dedup ANTES de generar — contra TODO lo publicado real (estáticas +
  //     dinámicas vía getAllPosts) y contra temasUsados. Cierra el agujero
  //     original (que solo chequeaba temasUsados). Si el tema ya existe, se
  //     consume (sale de la cola) y se saltea el ciclo con aviso.
  const usadosRaw = await redis.get<string[]>(BLOG_REDIS_KEYS.temasUsados);
  const usados = usadosRaw ?? [];
  let titulosPublicados: string[] = [];
  try {
    titulosPublicados = (await getAllPosts()).map(p => p.title);
  } catch (e) {
    console.warn('[orquestador] no se pudo leer publicados para dedup:', e);
  }
  const noDuplicado = filtrarTemasUsados([tema], [...titulosPublicados, ...usados]);
  if (noDuplicado.length === 0) {
    await redis.set(BLOG_REDIS_KEYS.temasAprobados, JSON.stringify(aprobados.slice(1)));
    await notificarConAlerta(
      `⚠️ "${tema.titulo}" (${dia}) ya estaba publicado o usado. Lo salteo y lo saco de la cola. Aprobá un tema nuevo.`,
      `writer-${dia}: tema-duplicado`,
    );
    return { ok: false, error: 'tema-duplicado' };
  }

  // 3. Elegir CTA (rotar)
  const ultimosCTAsRaw = await redis.get<string[]>(BLOG_REDIS_KEYS.ultimosCTAs);
  const ultimosCTAs = ultimosCTAsRaw ?? [];
  const cta = seleccionarCTA(ultimosCTAs);

  // 4. Contexto económico
  await obtenerContextoEconomico(); // para log; el writer lo obtiene internamente también

  // 5. Generar nota con retries
  console.log(`[orquestador] ${dia}: generando nota para "${tema.titulo}" con CTA "${cta.id}"`);
  const resultado = await generarNotaConRetries(tema, cta);

  if (!resultado.ok) {
    const razonesTxt = resultado.razones.map((r, i) => `${i + 1}. ${r}`).join('\n');
    const tituloFallido = resultado.ultimoDraft?.titulo ?? tema.titulo;

    await notificarConAlerta(
      `❌ El writer falló para "${tituloFallido}" (${dia}).\n\nRazones:\n${razonesTxt}\n\nEditá manualmente y publicá vos.`,
      `writer-${dia}: draft-invalido`,
    );
    return { ok: false, error: 'draft-invalido' };
  }

  // 6. Publicar
  console.log(`[orquestador] Publicando "${resultado.nota.titulo}"`);
  const publicada = await publicarNota(resultado.nota);

  // 6b. Consumir el tema de la cola SOLO tras publicar OK (si la generación
  //     falla, queda en la cola para reintentar el próximo ciclo, no se pierde).
  await redis.set(BLOG_REDIS_KEYS.temasAprobados, JSON.stringify(aprobados.slice(1)));

  // 7. Actualizar últimos CTAs
  ultimosCTAs.push(resultado.nota.cta_usado);
  await redis.set(BLOG_REDIS_KEYS.ultimosCTAs, ultimosCTAs.slice(-4));

  // 8. Notificar por WhatsApp
  const palabras = contarPalabras(resultado.nota.contenido_markdown);
  await notificarConAlerta(
    `✅ Publicada: ${publicada.titulo}\nLink: ${publicada.url_completa}\nCTA: ${publicada.cta_usado}\nPalabras: ${palabras}`,
    `writer-${dia}: publicada`,
  );

  return { ok: true, notaUrl: publicada.url_completa };
}
