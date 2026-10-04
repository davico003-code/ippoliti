import { llamarClaude } from '../lib/claude-client';
import { CTAS } from '../config/ctas';
import type { NotaDraft } from '../types';

// Segunda lectura antes de publicar: un verificador separado busca en la nota
// cada afirmación concreta (cifra, nombre, fecha, tendencia, "lo que vemos")
// que no esté respaldada por el material local ni por conocimiento general
// estable. La auditoría del 03-oct-2026 encontró datos inventados en 82 de
// 102 notas; el writer solo no alcanza para frenarlo.

const MODEL_VERIFICADOR = 'claude-sonnet-4-6';

/**
 * Lista de afirmaciones sin respaldo ([] = la nota está limpia). `null` = no se
 * pudo verificar (la API no respondió ni al reintento): la nota NO se publica
 * ese día — vale más no publicar que publicar datos inventados (revisión 4-oct).
 */
export async function verificarHechos(nota: NotaDraft, materialLocal: string, contexto: string): Promise<string[] | null> {
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
  for (let intento = 1; intento <= 2; intento++) {
    try {
      const { texto } = await llamarClaude(system, user, 3000, { model: MODEL_VERIFICADOR, temperature: 0 });
      return leerProblemas(texto);
    } catch (e) {
      console.warn(`[verificar-hechos] no se pudo verificar (intento ${intento}):`, e);
      if (intento === 1) await new Promise((r) => setTimeout(r, 5000));
    }
  }
  return null;
}

/**
 * Lee la lista de problemas del verificador. Si la respuesta vino cortada
 * (muchos problemas = JSON sin cerrar), rescata los que llegaron enteros:
 * antes el JSON roto daba [] y la nota MÁS llena de datos sin respaldo era
 * justo la que se publicaba sin frenos.
 */
export function leerProblemas(texto: string): string[] {
  const ini = texto.indexOf('{');
  const fin = texto.lastIndexOf('}');
  if (ini >= 0 && fin > ini) {
    try {
      const json = JSON.parse(texto.slice(ini, fin + 1)) as { problemas?: unknown };
      if (Array.isArray(json.problemas)) return json.problemas.filter((p): p is string => typeof p === 'string');
    } catch {
      /* cortado o mal formado: se rescata abajo */
    }
  }
  const lista = texto.indexOf('[');
  if (lista < 0) return [];
  const rescatados = Array.from(texto.slice(lista + 1).matchAll(/"((?:[^"\\]|\\.)*)"/g), (m) => {
    try {
      return JSON.parse(`"${m[1]}"`) as string;
    } catch {
      return m[1];
    }
  }).filter((p) => p.trim().length > 0);
  if (rescatados.length) return rescatados;
  // Abrió la lista pero no llegó ni un problema entero: tampoco es un "sin problemas".
  return /\[\s*"/.test(texto) ? ['El verificador marcó datos sin respaldo pero la respuesta llegó cortada: revisá cifras, nombres y fechas que no estén en el material.'] : [];
}
