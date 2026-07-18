import { Redis } from '@upstash/redis';
import { BLOG_REDIS_KEYS } from '../lib/redis-keys';
import { seleccionarCTA } from '../config/ctas';
import { obtenerContextoEconomico } from '../lib/datos-economicos';
import { registrarActividad } from '../lib/actividad';
import { generarNotaConRetries } from './generar-nota';
import { publicarNota } from './publicador';
import { filtrarTemasUsados } from '../lib/dedupe';
import { TEMAS_EVERGREEN } from '../radar/temas-evergreen';
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

// Auto-selección 100% autónoma (sin aprobación humana, jun-2026):
// 1. Lee la cola del radar (blog:temas_semana, que el cron del lunes llena).
// 2. Dedup jaccard contra TODO lo publicado (getAllPosts) + temasUsados.
// 3. Devuelve el PRIMER tema fresco de la cola; si la cola está vacía o todos
//    sus temas ya se cubrieron, cae al pool evergreen (también dedupeado).
//    Garantía: el blog SIEMPRE tiene un tema fresco para publicar martes y
//    viernes — solo devuelve null en el caso extremo de que hasta el evergreen
//    completo esté agotado (10 temas vs 2/semana: improbable).
function autoSeleccionarTema(
  cola: TemaPropuesto[],
  corpusUsado: string[],
): { tema: TemaPropuesto; origen: 'radar' | 'evergreen' } | null {
  const [fresco] = filtrarTemasUsados(cola, corpusUsado);
  if (fresco) return { tema: fresco, origen: 'radar' };

  const [evergreen] = filtrarTemasUsados(TEMAS_EVERGREEN, corpusUsado);
  if (evergreen) return { tema: evergreen, origen: 'evergreen' };

  return null;
}

export async function ejecutarWriterDia(
  dia: 'martes' | 'viernes',
): Promise<WriterResult> {
  const redis = getRedis();

  // 0. Lock de idempotencia por día: si el cron se dispara dos veces (o alguien
  //    corre el endpoint mientras el cron ya está en vuelo) NO se publican dos
  //    notas el mismo día. Lock de 10 min con NX.
  const hoy = new Date().toISOString().slice(0, 10);
  const lockKey = `blog:writer:lock:${dia}:${hoy}`;
  const gotLock = await redis.set(lockKey, '1', { nx: true, ex: 600 });
  if (!gotLock) {
    await registrarActividad({
      tipo: 'error',
      mensaje: `${dia}: ya hay una ejecución del writer en curso/hecha hoy (lock activo). No se publica de nuevo.`,
    });
    return { ok: false, error: 'lock-activo' };
  }

  // 1. Leer la cola de temas del radar (ya no hay estado "aprobado": el radar
  //    del lunes llena blog:temas_semana y el writer auto-selecciona).
  const raw = await redis.get<string>(BLOG_REDIS_KEYS.temasSemana);
  let cola: TemaPropuesto[];
  try {
    cola = raw
      ? (typeof raw === 'string' ? JSON.parse(raw) : raw) as TemaPropuesto[]
      : [];
  } catch {
    cola = [];
  }

  // 2. Corpus de dedup: títulos publicados (estáticas + dinámicas) + usados.
  const usadosRaw = await redis.get<string[]>(BLOG_REDIS_KEYS.temasUsados);
  const usados = usadosRaw ?? [];
  let titulosPublicados: string[] = [];
  try {
    titulosPublicados = (await getAllPosts()).map(p => p.title);
  } catch (e) {
    console.warn('[orquestador] no se pudo leer publicados para dedup:', e);
  }
  const corpusUsado = [...titulosPublicados, ...usados];

  // 3. Auto-seleccionar (radar fresco → evergreen de respaldo). NUNCA repite
  //    un tema ya publicado/usado por el dedup jaccard.
  const seleccion = autoSeleccionarTema(cola, corpusUsado);
  if (!seleccion) {
    await registrarActividad({
      tipo: 'error',
      mensaje: `${dia}: ni el radar ni el pool evergreen tienen un tema fresco (todo ya publicado). No se publicó.`,
    });
    return { ok: false, error: 'sin-temas-frescos' };
  }
  const { tema, origen } = seleccion;
  if (origen === 'evergreen') {
    await registrarActividad({
      tipo: 'evergreen',
      mensaje: `${dia}: la cola del radar estaba vacía o sin temas frescos. Caigo al pool evergreen.`,
      titulo: tema.titulo,
    });
  }

  // 4. Elegir CTA (rotar)
  const ultimosCTAsRaw = await redis.get<string[]>(BLOG_REDIS_KEYS.ultimosCTAs);
  const ultimosCTAs = ultimosCTAsRaw ?? [];
  const cta = seleccionarCTA(ultimosCTAs);

  // 5. Contexto económico
  await obtenerContextoEconomico(); // para log; el writer lo obtiene internamente también

  // 6. Generar nota con retries
  console.log(`[orquestador] ${dia}: generando nota para "${tema.titulo}" con CTA "${cta.id}"`);
  const resultado = await generarNotaConRetries(tema, cta);

  if (!resultado.ok) {
    const razonesTxt = resultado.razones.map((r, i) => `${i + 1}. ${r}`).join('; ');
    const tituloFallido = resultado.ultimoDraft?.titulo ?? tema.titulo;
    await registrarActividad({
      tipo: 'error',
      mensaje: `${dia}: el writer no pudo generar una nota válida. Razones: ${razonesTxt}`,
      titulo: tituloFallido,
    });
    return { ok: false, error: 'draft-invalido' };
  }

  // 7. Publicar
  console.log(`[orquestador] Publicando "${resultado.nota.titulo}"`);
  const publicada = await publicarNota(resultado.nota);

  // 8. Dedup permanente: sumar el título publicado a temasUsados (últimos 30).
  //    Esto reemplaza lo que antes hacía el webhook de aprobación y garantiza
  //    que el radar y los writers futuros no repitan este tema.
  usados.push(tema.titulo);
  await redis.set(BLOG_REDIS_KEYS.temasUsados, usados.slice(-30));

  // 8b. Si el tema salió de la cola del radar, consumirlo de blog:temas_semana
  //     (los evergreen no están en la cola, no hay nada que sacar).
  if (origen === 'radar') {
    const colaRestante = cola.filter((t) => t.titulo !== tema.titulo);
    await redis.set(BLOG_REDIS_KEYS.temasSemana, JSON.stringify(colaRestante));
  }

  // 9. Actualizar últimos CTAs
  ultimosCTAs.push(resultado.nota.cta_usado);
  await redis.set(BLOG_REDIS_KEYS.ultimosCTAs, ultimosCTAs.slice(-4));

  // 10. Registrar la publicación en el feed del panel admin (sin WhatsApp).
  const palabras = contarPalabras(resultado.nota.contenido_markdown);
  await registrarActividad({
    tipo: 'publicada',
    mensaje: `Publicada automáticamente (${dia}, ${origen === 'evergreen' ? 'evergreen' : 'radar'}) · ${palabras} palabras · CTA ${publicada.cta_usado}`,
    titulo: publicada.titulo,
    url: publicada.url_completa,
  });

  return { ok: true, notaUrl: publicada.url_completa };
}
