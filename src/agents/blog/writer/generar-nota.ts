import { llamarClaude } from '../lib/claude-client';
import { obtenerContextoEconomico } from '../lib/datos-economicos';
import { buildSystemPrompt, buildUserPrompt } from './prompts';
import { validarNotaDraft, generarSlugUnico } from './validaciones';
import { getAllExistingSlugs } from '@/lib/blog-posts-dinamicos';
import type { TemaPropuesto, NotaDraft } from '../types';
import type { CTA } from '../config/ctas';

const MODEL_WRITER = 'claude-opus-4-7';
const MAX_INTENTOS = 3;

function stripJsonFences(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();
}

// Normalizar slug a kebab-case ASCII sin tildes
function normalizarSlug(slug: string): string {
  return slug
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quitar tildes
    .replace(/[^a-z0-9-]/g, '-')     // solo alfanumérico y guiones
    .replace(/-+/g, '-')             // colapsar guiones
    .replace(/^-|-$/g, '');          // trim guiones
}

type GenerarResult =
  | { ok: true; nota: NotaDraft }
  | { ok: false; razones: string[]; ultimoDraft?: NotaDraft };

export async function generarNotaConRetries(
  tema: TemaPropuesto,
  cta: CTA,
): Promise<GenerarResult> {
  const systemPrompt = buildSystemPrompt();
  const contexto = await obtenerContextoEconomico();
  const slugsExistentes = await getAllExistingSlugs();

  let ultimoDraft: NotaDraft | undefined;
  let ultimasRazones: string[] = [];

  for (let intento = 1; intento <= MAX_INTENTOS; intento++) {
    const feedback = intento > 1
      ? ultimasRazones.map((r, i) => `${i + 1}. ${r}`).join('\n')
      : undefined;

    const userPrompt = buildUserPrompt(tema, cta, contexto, feedback);

    console.log(`[writer] Intento ${intento}/${MAX_INTENTOS} para "${tema.titulo}"`);

    const { texto, inputTokens, outputTokens } = await llamarClaude(
      systemPrompt,
      userPrompt,
      6000,
      { model: MODEL_WRITER, temperature: 0.7 },
    );

    console.log(`[writer] Intento ${intento}: in=${inputTokens} out=${outputTokens}`);

    // Parsear JSON
    let nota: NotaDraft;
    try {
      nota = JSON.parse(stripJsonFences(texto)) as NotaDraft;
    } catch (err) {
      ultimasRazones = [`JSON inválido en respuesta de Claude: ${err instanceof Error ? err.message : String(err)}`];
      console.error(`[writer] Intento ${intento}: JSON parse error`);
      continue;
    }

    // Normalizar slug
    nota.slug = normalizarSlug(nota.slug);

    // Validar
    const resultado = validarNotaDraft(nota);
    ultimoDraft = nota;

    if (resultado.ok) {
      // Asegurar slug único
      nota.slug = generarSlugUnico(nota.slug, slugsExistentes);
      console.log(`[writer] Intento ${intento}: APROBADO → slug="${nota.slug}"`);
      return { ok: true, nota };
    }

    ultimasRazones = resultado.errores;
    console.warn(`[writer] Intento ${intento}: RECHAZADO por ${resultado.errores.length} errores:`, resultado.errores);
  }

  return { ok: false, razones: ultimasRazones, ultimoDraft };
}
