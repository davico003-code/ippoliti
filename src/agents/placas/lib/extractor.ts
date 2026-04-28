// Extractor — recibe una nota del blog y devuelve un Carrusel listo para
// renderizar. Usa Claude Sonnet 4.5 con retries + feedback de validaciones.
//
// Reutiliza el cliente Claude del agente blog (misma infra: ANTHROPIC_API_KEY,
// backoff exponencial en 429/5xx).

import { llamarClaude } from '@/agents/blog/lib/claude-client'
import { CATALOGO_BLOQUES, CHROME_GUIDE } from '../config/bloques-config'
import type { Carrusel, NotaParaExtractor } from '../types'
import { asCarrusel, validarCarrusel } from './validaciones'

const MODEL = 'claude-sonnet-4-6'
const MAX_INTENTOS = 3
const MAX_TOKENS = 8000
const TEMPERATURE = 0.65

function stripJsonFences(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim()
}

function serializarCatalogo(): string {
  return CATALOGO_BLOQUES.map(
    b =>
      `  • ${b.tipo}\n      props: ${b.props}\n      uso: ${b.cuando_usar}`,
  ).join('\n')
}

function serializarChrome(): string {
  return Object.entries(CHROME_GUIDE)
    .map(
      ([key, v]) =>
        `  • ${key} — ${v.descripcion}\n      ejemplos: ${v.ejemplos.map(e => `"${e}"`).join(' · ')}\n      regla: ${v.regla}`,
    )
    .join('\n')
}

function buildSystemPrompt(): string {
  return `Sos director de arte y editor de contenido de SI Inmobiliaria (siinmobiliaria.com),
inmobiliaria familiar de Funes, Roldán y Rosario fundada en 1983. Tu tarea:
recibir una nota del blog y diseñar un carrusel de Instagram de 3 a 6 placas
que transmita profesionalismo editorial, conocimiento local del corredor oeste
del Gran Rosario, y datos concretos (sin hype, sin motivación genérica).

# REFERENCIAS ESTÉTICAS
The Economist · Monocle · Bloomberg Green · reportes sectoriales premium.
NO: plantillas de Canva, tips motivacionales, placas de "inmobiliaria feliz",
emojis decorativos, neón, sombras saturadas, Archivo Black, serifas raras.

# SISTEMA DE BLOQUES COMPONIBLES
El diseño NO es un catálogo de 9 templates fijos. Es una caja de bloques
atómicos que vos componés libremente para cada placa. Cada placa tiene
chrome fijo (head-bar arriba, logo + meta-foot abajo) y un body que vos
armás con bloques.

## Bloques disponibles:
${serializarCatalogo()}

## Chrome obligatorio — 3 campos por placa:
${serializarChrome()}

# FONDOS POR PLACA
Tres únicos fondos: "verde-profundo", "crema", "blanco".
Máximo 3 placas con "verde-profundo" por carrusel. Alternar crea ritmo visual.
La portada suele ir con fondo oscuro (verde-profundo). Los datos crudos se
leen mejor sobre claros. Las citas quedan potentes sobre oscuro.

# REGLAS EDITORIALES
- Siempre ángulo local cuando aplique: Funes, Roldán, Fisherton, corredor oeste,
  Gran Rosario. Si la nota es genérica, insertá ejemplos concretos de zona.
- Datos duros > frases vagas. "+17,7% según COCIR" > "el mercado subió".
- Cada dato numérico debe llevar un bloque fuente acompañando.
- Frases marca que podés incorporar con naturalidad (sin forzar):
  · "Siempre hay oportunidades, solo hay que saber leerlas"
  · "Animarse a actuar"
  · "Saber leer el mercado"
  · "Invertir con criterio"
- La firma editorial es "— David Flores, Corredor Inmobiliario (Mat. N° 0621)".

# ANTI-PATTERN (rechazo automático)
- Emojis en cualquier lado (cuerpo, chrome, bloques).
- Menciones políticas, crypto, o competidores (Vanzini, Crestale, Squadra,
  SkyGarden, RE/MAX, Eigen, Altos de Funes, Funes Inmobiliaria).
- Clichés: "en un mercado cambiante", "es importante destacar", "cabe mencionar",
  "sin lugar a dudas", "oportunidad única", "imperdible".
- Lenguaje informal: "te cambia la jugada", "mirá esto que es fuego".
- Inventar datos que no están en la nota ni en fuentes citadas.

# ESTRUCTURA DEL CARRUSEL
- Primera placa: portada. Eyebrow + título grande (usa \`*italic*\` para acento
  y \`**bold**\` para énfasis inline) + bajada. Fondo recomendado: verde-profundo.
- Placas 2..N-1: data, citas, comparativas, imagen, gráficos, listas.
- Última placa: CTA final. Eyebrow "Si llegaste hasta acá" + título (ej:
  "Es porque te interesa invertir mejor") + bloque parrafo breve + cta-actions
  + handle "@inmobiliaria.si". Fondo recomendado: crema.

# FORMATO DE SALIDA
Devolvé SOLO un JSON válido (sin markdown fences, sin texto adicional) con
esta estructura exacta:

{
  "total": number,       // 3 a 6
  "placas": [
    {
      "orden": 1,
      "fondo": "verde-profundo" | "crema" | "blanco",
      "nombre": "portada",  // descriptor humano (opcional, solo para logs)
      "head_bar_izquierda": "string",
      "head_bar_derecha": "string",
      "meta_foot": "string",
      "bloques": [
        { "tipo": "eyebrow", "texto": "..." },
        { "tipo": "titulo", "texto": "..." },
        ...
      ]
    }
  ]
}

Sin explicaciones previas, sin saludo, sin "claro, acá tenés". Solo el JSON.`
}

function buildUserPrompt(
  nota: NotaParaExtractor,
  feedback?: string,
): string {
  const base = `NOTA A TRANSFORMAR EN CARRUSEL:

Título: ${nota.titulo}
Slug: ${nota.slug}
Categoría: ${nota.categoria}
Keywords: ${nota.keywords.join(', ')}
Meta-description: ${nota.meta_description}
Imagen original (si querés reutilizarla en placa "imagen"): ${nota.imagen_url ?? '(no hay)'}

Bajada:
${nota.bajada}

Contenido completo (markdown):
${nota.contenido_markdown}

Diseñá el carrusel. Identificá los 2-4 datos/ángulos más potentes de la nota
y tejé una secuencia de 3-6 placas que empiece con portada y cierre con CTA.
No repitas el mismo tipo de bloque dominante en todas las placas — variá.
Alterná fondos para crear ritmo visual.`

  if (feedback) {
    return `IMPORTANTE: el carrusel anterior fue rechazado por estos problemas.
Corregí ESPECÍFICAMENTE cada uno en este intento:

${feedback}

${base}`
  }
  return base
}

export interface ExtraerResultado {
  ok: boolean
  carrusel?: Carrusel
  razones?: string[]
  intentos: number
}

export async function extraerCarrusel(nota: NotaParaExtractor): Promise<ExtraerResultado> {
  const systemPrompt = buildSystemPrompt()
  let ultimasRazones: string[] = []

  for (let intento = 1; intento <= MAX_INTENTOS; intento++) {
    const feedback = intento > 1 ? ultimasRazones.map((r, i) => `  ${i + 1}. ${r}`).join('\n') : undefined
    const userPrompt = buildUserPrompt(nota, feedback)

    console.log(`[placas/extractor] intento ${intento}/${MAX_INTENTOS} para "${nota.titulo}"`)

    const { texto, inputTokens, outputTokens } = await llamarClaude(
      systemPrompt,
      userPrompt,
      MAX_TOKENS,
      { model: MODEL, temperature: TEMPERATURE },
    )
    console.log(`[placas/extractor] intento ${intento}: in=${inputTokens} out=${outputTokens}`)

    let parsed: unknown
    try {
      parsed = JSON.parse(stripJsonFences(texto))
    } catch (err) {
      ultimasRazones = [
        `JSON inválido: ${err instanceof Error ? err.message : String(err)}`,
      ]
      console.warn(`[placas/extractor] intento ${intento}: JSON parse error`)
      continue
    }

    const resultado = validarCarrusel(parsed)
    if (resultado.ok) {
      console.log(
        `[placas/extractor] intento ${intento}: APROBADO — ${(parsed as Carrusel).placas.length} placas`,
      )
      return { ok: true, carrusel: asCarrusel(parsed), intentos: intento }
    }

    ultimasRazones = resultado.errores
    console.warn(
      `[placas/extractor] intento ${intento}: RECHAZADO por ${resultado.errores.length} errores:\n  ${resultado.errores.join('\n  ')}`,
    )
  }

  return { ok: false, razones: ultimasRazones, intentos: MAX_INTENTOS }
}
