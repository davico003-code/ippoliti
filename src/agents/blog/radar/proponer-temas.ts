import pLimit from 'p-limit';
import { Redis } from '@upstash/redis';
import { FUENTES } from '../config/sources';
import { TEMAS_PROHIBIDOS, ADVERTENCIA_TABOOS } from '../config/taboos';
import { scrapearTitulares, type Titular } from '../lib/scraper';
import { puntuarTitular } from '../lib/scoring';
import { filtrarTemasUsados } from '../lib/dedupe';
import { obtenerContextoEconomico } from '../lib/datos-economicos';
import { llamarClaude } from '../lib/claude-client';
import { BLOG_REDIS_KEYS, TTL } from '../lib/redis-keys';
import { TEMAS_EVERGREEN } from './temas-evergreen';
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

  // 7. Deduplicar contra temas ya usados
  const redis = getRedis();
  const usadosRaw = await redis.get<string[]>(BLOG_REDIS_KEYS.temasUsados);
  const usados = usadosRaw ?? [];

  let filtradas = filtrarTemasUsados(propuestas, usados);

  // 8. Completar con evergreen si quedan menos de 5
  if (filtradas.length < TOTAL_PROPUESTAS) {
    const evergreenFiltrados = filtrarTemasUsados(TEMAS_EVERGREEN, usados);
    for (const eg of evergreenFiltrados) {
      if (filtradas.length >= TOTAL_PROPUESTAS) break;
      filtradas.push(eg);
    }
  }

  filtradas = filtradas.slice(0, TOTAL_PROPUESTAS);

  // 9. Guardar en Redis
  await redis.set(BLOG_REDIS_KEYS.temasSemana, JSON.stringify(filtradas), {
    ex: TTL.temasSemana,
  });

  console.log(`[radar] ${filtradas.length} propuestas guardadas en Redis`);

  return filtradas;
}
