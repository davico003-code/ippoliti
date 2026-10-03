import { llamarClaude } from '../lib/claude-client';
import { obtenerContextoEconomico } from '../lib/datos-economicos';
import { obtenerMaterialLocal } from '../lib/material-local';
import { buildSystemPrompt, buildUserPrompt } from './prompts';
import { validarNotaDraft } from './validaciones';
import { verificarHechos } from './verificar-hechos';
import { getAllExistingSlugs } from '@/lib/blog-posts-dinamicos';
import type { TemaPropuesto, NotaDraft } from '../types';

const MODEL_WRITER = 'claude-opus-4-7';
const MAX_INTENTOS = 4;

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
): Promise<GenerarResult> {
  const systemPrompt = buildSystemPrompt();
  const [contexto, materialLocal] = await Promise.all([
    obtenerContextoEconomico(),
    obtenerMaterialLocal(tema),
  ]);
  const slugsExistentes = await getAllExistingSlugs();

  let ultimoDraft: NotaDraft | undefined;
  let ultimasRazones: string[] = [];

  for (let intento = 1; intento <= MAX_INTENTOS; intento++) {
    const feedback = intento > 1
      ? ultimasRazones.map((r, i) => `${i + 1}. ${r}`).join('\n')
      : undefined;

    const userPrompt = buildUserPrompt(tema, materialLocal, contexto, feedback);

    console.log(`[writer] Intento ${intento}/${MAX_INTENTOS} para "${tema.titulo}"`);

    const { texto, inputTokens, outputTokens } = await llamarClaude(
      systemPrompt,
      userPrompt,
      8000,
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
      // Abortar si el slug ya existe entre TODO lo publicado (estáticas +
      // dinámicas). NO se agrega sufijo -N: eso era la vía de escape que
      // dejaba publicar duplicados. Se reintenta pidiendo otro ángulo; si tras
      // los reintentos sigue colisionando, devuelve ok:false y el orquestador
      // avisa (no publica).
      if (slugsExistentes.has(nota.slug)) {
        ultimasRazones = [
          `El slug "${nota.slug}" ya existe entre las notas publicadas. Generá un ángulo y un slug distintos (no se permiten sufijos -2/-3).`,
        ];
        console.warn(`[writer] Intento ${intento}: slug duplicado "${nota.slug}", reintentando`);
        ultimoDraft = nota;
        continue;
      }
      // Verificación de datos contra el material local: si hay afirmaciones
      // sin respaldo, se reintenta con la lista; si en el último intento
      // siguen, no se publica.
      const sinRespaldo = await verificarHechos(nota, materialLocal, contexto);
      if (sinRespaldo.length) {
        ultimasRazones = sinRespaldo.map((p) => `Dato sin respaldo en el material, sacalo o reformulalo sin el dato: ${p}`);
        console.warn(`[writer] Intento ${intento}: ${sinRespaldo.length} datos sin respaldo`, sinRespaldo);
        continue;
      }
      console.log(`[writer] Intento ${intento}: APROBADO → slug="${nota.slug}"`);
      return { ok: true, nota };
    }

    ultimasRazones = resultado.errores;
    console.warn(`[writer] Intento ${intento}: RECHAZADO por ${resultado.errores.length} errores:`, resultado.errores);
  }

  return { ok: false, razones: ultimasRazones, ultimoDraft };
}
