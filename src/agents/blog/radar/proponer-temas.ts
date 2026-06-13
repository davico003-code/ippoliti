import pLimit from 'p-limit';
import { Redis } from '@upstash/redis';
import { FUENTES } from '../config/sources';
import { TEMAS_PROHIBIDOS, ADVERTENCIA_TABOOS } from '../config/taboos';
import { scrapearTitulares, type Titular } from '../lib/scraper';
import { puntuarTitular } from '../lib/scoring';
import { filtrarTemasUsados } from '../lib/dedupe';
import { obtenerContextoEconomico } from '../lib/datos-economicos';
import { llamarClaude } from '../lib/claude-client';
import { registrarActividad } from '../lib/actividad';
import { BLOG_REDIS_KEYS, TTL } from '../lib/redis-keys';
import { TEMAS_EVERGREEN } from './temas-evergreen';
import { getAllPosts } from '@/lib/blog';
import type { TemaPropuesto } from '../types';

const CONCURRENCY = 5;
const TOP_TITULARES = 30;
const TOTAL_PROPUESTAS = 5;
const MODEL_RADAR = 'claude-haiku-4-5-20251001';

function getRedis(): Redis {
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

function stripJsonFences(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();
}

export async function generarPropuestasSemanales(): Promise<TemaPropuesto[]> {
  const limit = pLimit(CONCURRENCY);

  // 1. Scrapear todas las fuentes en paralelo (max 5 simultáneas)
  const resultados = await Promise.allSettled(
    FUENTES.map(fuente => limit(() => scrapearTitulares(fuente))),
  );

  const todosTitulares: (Titular & { score: number })[] = [];
  for (let i = 0; i < resultados.length; i++) {
    const r = resultados[i];
    if (r.status === 'fulfilled') {
      for (const t of r.value) {
        todosTitulares.push({ ...t, score: puntuarTitular(t, FUENTES[i]) });
      }
    }
  }

  console.log(`[radar] ${todosTitulares.length} titulares totales de ${FUENTES.length} fuentes`);

  // 2. Ordenar por score descendente y tomar los top N
  todosTitulares.sort((a, b) => b.score - a.score);
  const top = todosTitulares.slice(0, TOP_TITULARES);

  if (top.length === 0) {
    console.warn('[radar] No se obtuvieron titulares, usando evergreen puro');
    return TEMAS_EVERGREEN.slice(0, TOTAL_PROPUESTAS);
  }

  // 3. Contexto económico
  const contextoEconomico = await obtenerContextoEconomico();

  // 4. Preparar prompt para Claude
  const titularesTexto = top
    .map((t, i) => `${i + 1}. [${t.fuente}] "${t.titulo}" (score: ${t.score.toFixed(1)})${t.resumen ? ` — ${t.resumen}` : ''}`)
    .join('\n');

  const systemPrompt = `Sos un editor de contenido para el blog de SI Inmobiliaria (siinmobiliaria.com), inmobiliaria familiar de Funes, Roldán y Rosario (zona oeste del Gran Rosario, Argentina).

Tu tarea: analizar los titulares de la semana y proponer EXACTAMENTE 5 temas para notas del blog.

REGLAS ESTRICTAS:
- Cada tema DEBE tener ángulo local (Funes, Roldán, Gran Rosario, corredor oeste).
- Diversificar tipos: mínimo 1 "coyuntura", 1 "guia" o "zoom_barrio", 1 "tendencia" o "comparacion".
- Los 5 temas deben ser distintos entre sí.
- Urgencia: "alta" si es tema caliente de esta semana, "media" si es relevante pero no urgente, "baja" si es evergreen.
- score_seo: estimación de 1 a 10 de potencial de búsqueda orgánica.

${ADVERTENCIA_TABOOS}
Temas prohibidos: ${TEMAS_PROHIBIDOS.join(' | ')}

${contextoEconomico}

Responder SOLO con un JSON array válido de 5 objetos con esta estructura exacta:
[
  {
    "titulo": "string",
    "angulo_local": "string (cómo conecta con Funes/Roldán/Rosario)",
    "keywords_seo": ["string"],
    "fuentes_consultar": ["string"],
    "tipo": "coyuntura" | "comparacion" | "guia" | "zoom_barrio" | "tendencia",
    "urgencia": "alta" | "media" | "baja",
    "score_seo": number
  }
]

Sin markdown, sin explicaciones, solo el JSON.`;

  const userPrompt = `Titulares de la semana:\n\n${titularesTexto}`;

  // 5. Llamar a Claude Haiku
  const { texto: respuesta } = await llamarClaude(
    systemPrompt,
    userPrompt,
    4000,
    { model: MODEL_RADAR, temperature: 0.7 },
  );

  // 6. Parsear JSON (strip posibles fences)
  let propuestas: TemaPropuesto[];
  try {
    propuestas = JSON.parse(stripJsonFences(respuesta)) as TemaPropuesto[];
  } catch (err) {
    console.error('[radar] Error parseando JSON de Claude:', err);
    console.error('[radar] Respuesta raw:', respuesta.slice(0, 500));
    return TEMAS_EVERGREEN.slice(0, TOTAL_PROPUESTAS);
  }

  if (!Array.isArray(propuestas) || propuestas.length === 0) {
    console.warn('[radar] Claude devolvió array vacío, usando evergreen');
    return TEMAS_EVERGREEN.slice(0, TOTAL_PROPUESTAS);
  }

  // 7. Deduplicar: contra temasUsados (últimos 30 aprobados) Y contra TODO lo
  //    publicado real (títulos de getAllPosts: estáticas + dinámicas). Cierra
  //    el mismo agujero que el writer, en el extremo de las propuestas. Mismo
  //    criterio (filtrarTemasUsados → normalizar/jaccard, umbral 0.6).
  const redis = getRedis();
  const usadosRaw = await redis.get<string[]>(BLOG_REDIS_KEYS.temasUsados);
  const usados = usadosRaw ?? [];
  let titulosPublicados: string[] = [];
  try {
    titulosPublicados = (await getAllPosts()).map(p => p.title);
  } catch (e) {
    console.warn('[radar] no se pudo leer publicados para dedup:', e);
  }
  const corpus = [...titulosPublicados, ...usados];

  let filtradas = filtrarTemasUsados(propuestas, corpus);

  // 8. Completar con evergreen SOLO si está fresco: se deduplica contra el
  //    corpus completo (publicados + usados) y contra las propuestas ya
  //    elegidas. Nunca se rellena con un tema ya cubierto.
  if (filtradas.length < TOTAL_PROPUESTAS) {
    const evergreenFrescos = filtrarTemasUsados(TEMAS_EVERGREEN, [
      ...corpus,
      ...filtradas.map(f => f.titulo),
    ]);
    for (const eg of evergreenFrescos) {
      if (filtradas.length >= TOTAL_PROPUESTAS) break;
      filtradas.push(eg);
    }
  }

  filtradas = filtradas.slice(0, TOTAL_PROPUESTAS);

  // Si no se llega a 5 temas frescos, NO se rellena con repetidos: se cargan
  // menos. El writer igual publica (cae al pool evergreen si hace falta).
  if (filtradas.length < TOTAL_PROPUESTAS) {
    await registrarActividad({
      tipo: 'info',
      mensaje: `Radar: solo ${filtradas.length} tema(s) fresco(s) esta semana (no se rellenó con repetidos). El writer completa con evergreen si falta.`,
    });
  }

  // 9. Guardar en Redis
  await redis.set(BLOG_REDIS_KEYS.temasSemana, JSON.stringify(filtradas), {
    ex: TTL.temasSemana,
  });

  console.log(`[radar] ${filtradas.length} propuestas guardadas en Redis`);

  return filtradas;
}
