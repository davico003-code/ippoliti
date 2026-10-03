import { llamarClaude } from '../lib/claude-client';
import { CTAS } from '../config/ctas';
import type { NotaDraft } from '../types';

// Segunda lectura antes de publicar: un verificador separado busca en la nota
// cada afirmación concreta (cifra, nombre, fecha, tendencia, "lo que vemos")
// que no esté respaldada por el material local ni por conocimiento general
// estable. La auditoría del 03-oct-2026 encontró datos inventados en 82 de
// 102 notas; el writer solo no alcanza para frenarlo.

const MODEL_VERIFICADOR = 'claude-sonnet-4-6';

export async function verificarHechos(nota: NotaDraft, materialLocal: string, contexto: string): Promise<string[]> {
  const system = `Sos el editor que verifica datos antes de publicar una nota de un blog inmobiliario de Funes y Roldán (Santa Fe, Argentina). Fecha de hoy: ${new Date().toISOString().slice(0, 10)}.

Marcá cada afirmación de la nota que NO esté respaldada por:
(a) el MATERIAL LOCAL que se te pasa, o
(b) el CONTEXTO ECONÓMICO que se te pasa, o
(c) conocimiento general estable de Argentina: leyes vigentes, cómo funcionan los índices, los créditos, los contratos y los trámites (por ejemplo, que el DNU 70/2023 derogó la ley 27.551).

Marcá en especial: cifras y porcentajes, poblaciones, precios, fechas, nombres de lugares u obras, tendencias del mercado ("creció la oferta"), experiencias atribuidas a la inmobiliaria ("en los contratos que cerramos vemos…") y errores de cuenta o de concepto (por ejemplo, decir que un ajuste cuatrimestral son cuatro ajustes por año).
Las herramientas del sitio solo hacen esto: ${CTAS.map((c) => `${c.link}: ${c.idea}`).join('; ')}. Marcá si la nota les atribuye algo más.

No marques opiniones presentadas como tales ("yo miraría…"), consejos generales ni la firma.
Respondé SOLO con JSON: {"problemas": ["cita textual corta → por qué no está respaldada"]}. Si no hay problemas: {"problemas": []}.`;
  const user = `MATERIAL LOCAL:\n${materialLocal}\n\nCONTEXTO ECONÓMICO:\n${contexto}\n\nNOTA:\n# ${nota.titulo}\n${nota.bajada}\n\n${nota.contenido_markdown}`;
  try {
    const { texto } = await llamarClaude(system, user, 1500, { model: MODEL_VERIFICADOR, temperature: 0 });
    const json = JSON.parse(texto.slice(texto.indexOf('{'), texto.lastIndexOf('}') + 1)) as { problemas?: string[] };
    return Array.isArray(json.problemas) ? json.problemas : [];
  } catch (e) {
    // Si el verificador falla, no bloquea la publicación: las reglas del
    // prompt y del validador siguen aplicando.
    console.warn('[verificar-hechos] no se pudo verificar:', e);
    return [];
  }
}
