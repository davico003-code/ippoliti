// Resumen narrado por IA + audio TTS para /propiedades/[slug] y verficha.casa.
//
// Pipeline:
//   1. generateResumen(propertyId, snapshot?) → llama Anthropic Haiku con un
//      system prompt orientado a un resumen oral natural argentino. Cachea el
//      texto en Redis (audio:resumen:v3:{id}:text TTL 30d).
//   2. generateAudio(propertyId, snapshot?) → reusa generateResumen + llama
//      ElevenLabs (eleven_multilingual_v2, voice configurada por env) → sube
//      el buffer a Vercel Blob como audio/v3/{id}.mp3 → cachea la URL en
//      Redis (audio:resumen:v3:{id}:url TTL 365d, las URLs del Blob son estables).
//
// El snapshot opcional permite reusar datos ya leídos (caso verficha.casa
// que ya tiene el snapshot en mano) y evita el round-trip a Tokko.
//
// La generación es OPT-IN: se dispara únicamente desde /admin/audio. La ficha
// no precachea audio automáticamente — si no hay audio cacheado, el componente
// AudioSummary no se renderiza.

import Anthropic from '@anthropic-ai/sdk'
import { put } from '@vercel/blob'

import { redis } from './redis'
import {
  getPropertyById,
  getOperationType,
  getDescription,
  getRoofedArea,
  getTotalSurface,
  translatePropertyType,
  translateTag,
  type TokkoProperty,
} from './tokko'
import type { FichaSnapshot } from './ficha'

const TEXT_TTL_SECONDS = 30 * 24 * 60 * 60 // 30d
const URL_TTL_SECONDS = 365 * 24 * 60 * 60 // 365d (la URL del Blob es estable)

// Bump esto cuando cambies SYSTEM_PROMPT, el proveedor TTS o ajustes el formato
// esperado del resumen. Las keys viejas quedan huérfanas en Redis (expiran
// solas) y los blobs huérfanos en Vercel Blob se limpian a mano.
//   v2 → OpenAI tts-1 voice nova (legacy)
//   v3 → ElevenLabs eleven_multilingual_v2
const PIPELINE_VERSION = 'v3'

const TEXT_KEY = (id: number) => `audio:resumen:${PIPELINE_VERSION}:${id}:text`
const URL_KEY = (id: number) => `audio:resumen:${PIPELINE_VERSION}:${id}:url`
const BLOB_PATH = (id: number) => `audio/${PIPELINE_VERSION}/${id}.mp3`

const HAIKU_MODEL = 'claude-haiku-4-5-20251001'

// ElevenLabs TTS config
const ELEVENLABS_MODEL = 'eleven_multilingual_v2'
const ELEVENLABS_VOICE_FALLBACK = 'QK4xDwo9ESPHA4JNUpX3'
const ELEVENLABS_OUTPUT_FORMAT = 'mp3_44100_128'
const ELEVENLABS_VOICE_SETTINGS = {
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.0,
  use_speaker_boost: true,
} as const

// ── System prompt: voz argentina, conversacional, 600-800 chars (~45-55s TTS) ──
const SYSTEM_PROMPT = `Sos un asesor inmobiliario argentino con muchos años de oficio, describiendo una propiedad para un audio de presentación. Tu trabajo es generar un resumen oral que sea PLACENTERO de escuchar, como si la persona te tuviera al lado caminando por la propiedad. Lo va a escuchar alguien de 40 a 65 años desde su celular.

LARGO Y FORMATO
- Entre 600 y 800 caracteres (aproximadamente 45 a 55 segundos de audio).
- Un solo párrafo continuo, sin listas, sin saltos de línea, sin bullets.
- Sin comillas, sin emojis, sin signos especiales raros.
- Devolvé SOLO el texto, sin prefijos tipo "Acá va:".

VOZ
- Español rioplatense argentino. "Tenés", "te vas a encontrar", "esta casa", "este departamento".
- Nunca uses "vivienda", "inmueble", "unidad funcional" — eso es lenguaje de escribanía.
- Frases medianas, ritmo respirable. Imaginá que lo estás contando en persona, no leyendo un folleto.

CONTENIDO
- La FUENTE PRINCIPAL del resumen es la descripción que viene en el input — leéla con atención y traducila a oral.
- Apoyate también en los datos estructurados (tipo, ambientes, m², zona) pero no los recités como ficha técnica.
- Empezá ubicando al oyente: tipo de propiedad, ambientes, dónde queda.
- Después llevá al oyente por dentro: mencioná las terminaciones, los espacios destacables (pileta, parrilla, galería, jardín, vista, cocina, comedor), y cómo se siente vivir ahí.
- Cerrá con una observación específica de ESTA propiedad — algo concreto que la diferencie. NUNCA cierres con clichés tipo "para disfrutar en familia", "tu próximo hogar", "ideal para vivir", "el momento de mudarte", "no esperes más", "una oportunidad única".

PROHIBIDO INCLUIR
- Precio (los precios se ven en pantalla).
- Dirección exacta con número (no digas "Bv Sarmiento 578").
- Nombres de inmobiliaria o de asesor.
- Frases hechas de publicidad inmobiliaria.

NÚMEROS
- Escribilos SIEMPRE en palabras para que el TTS los lea naturalmente.
  Ej: "ciento cuarenta y cuatro metros cubiertos", no "144 m²".
  Ej: "cuatro ambientes", no "4 ambientes".
  Ej: "mil cuatrocientos metros de terreno", no "1.400 m²".
- Las medidas en metros decí "metros", no "m" ni "m²".`

// ── Input compacto que entra al prompt ─────────────────────────────────────

interface AudioInput {
  tipo: string
  ambientes?: number | null
  dormitorios?: number | null
  banos?: number | null
  cocheras?: number | null
  m2cubiertos?: number | null
  m2totales?: number | null
  descripcion: string
  zona: string
  caracteristicas: string[]
  operacion: string
}

function buildInputFromSnapshot(s: FichaSnapshot): AudioInput {
  return {
    tipo: s.tipo,
    ambientes: s.ambientes,
    dormitorios: s.dormitorios,
    banos: s.banos,
    cocheras: s.cocheras,
    m2cubiertos: s.m2cubiertos,
    m2totales: s.m2totales,
    descripcion: s.descripcion,
    zona: s.zonaCompleta || s.zonaAprox,
    caracteristicas: s.caracteristicas,
    operacion: s.operacion,
  }
}

function buildInputFromTokko(property: TokkoProperty): AudioInput {
  return {
    tipo: translatePropertyType(property.type?.name),
    ambientes: property.room_amount || null,
    dormitorios: property.suite_amount || null,
    banos: property.bathroom_amount || null,
    cocheras: property.parking_lot_amount || null,
    m2cubiertos: getRoofedArea(property),
    m2totales: getTotalSurface(property),
    descripcion: getDescription(property),
    zona: deriveZonaFromTokko(property),
    caracteristicas: Array.from(
      new Set((property.tags || []).map(t => translateTag(t.name)).filter(Boolean)),
    ),
    operacion: getOperationType(property),
  }
}

function deriveZonaFromTokko(property: TokkoProperty): string {
  const loc = property.location
  if (!loc) return ''
  const parts = (loc.short_location || '').split('|').map(s => s.trim()).filter(Boolean)
  if (parts.length >= 2) return `${parts[parts.length - 1]}, ${parts[parts.length - 2]}`
  return loc.name || (parts[0] ?? '')
}

// ── Generate resumen (texto) ────────────────────────────────────────────────

let _anthropic: Anthropic | null = null
function anthropic(): Anthropic {
  if (_anthropic) return _anthropic
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY no configurada')
  _anthropic = new Anthropic({ apiKey })
  return _anthropic
}

export async function generateResumen(
  propertyId: number,
  snapshot?: FichaSnapshot,
): Promise<string> {
  const cached = await redis.get<string>(TEXT_KEY(propertyId))
  if (cached && typeof cached === 'string') return cached

  const input: AudioInput = snapshot
    ? buildInputFromSnapshot(snapshot)
    : buildInputFromTokko(await getPropertyById(propertyId))

  // Datos compactos para el modelo (no mandamos getAllPhotos ni nada visual)
  const userMessage = JSON.stringify(input, null, 2)

  const msg = await anthropic().messages.create({
    model: HAIKU_MODEL,
    max_tokens: 700,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  })

  const textBlock = msg.content.find(b => b.type === 'text')
  const text = (textBlock && textBlock.type === 'text' ? textBlock.text : '').trim()
  if (!text) throw new Error('Resumen vacío del modelo')

  await redis.set(TEXT_KEY(propertyId), text, { ex: TEXT_TTL_SECONDS })
  return text
}

// ── Generate audio (ElevenLabs TTS + Blob) ──────────────────────────────────

async function synthesizeWithElevenLabs(text: string): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY no configurada')

  const voiceId = process.env.ELEVENLABS_VOICE_ID || ELEVENLABS_VOICE_FALLBACK
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=${ELEVENLABS_OUTPUT_FORMAT}`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: ELEVENLABS_MODEL,
      voice_settings: ELEVENLABS_VOICE_SETTINGS,
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`ElevenLabs ${res.status}: ${detail.slice(0, 300) || res.statusText}`)
  }

  return Buffer.from(await res.arrayBuffer())
}

export async function generateAudio(
  propertyId: number,
  snapshot?: FichaSnapshot,
): Promise<string> {
  const cachedUrl = await redis.get<string>(URL_KEY(propertyId))
  if (cachedUrl && typeof cachedUrl === 'string') return cachedUrl

  const text = await generateResumen(propertyId, snapshot)
  const buffer = await synthesizeWithElevenLabs(text)

  // allowOverwrite porque si la URL del cache expira pero queremos regenerar,
  // pisamos el blob existente. Las URLs nuevas pueden cambiar (Vercel agrega
  // un sufijo random al pathname), así que cacheamos la nueva URL devuelta.
  const blob = await put(BLOB_PATH(propertyId), buffer, {
    access: 'public',
    contentType: 'audio/mpeg',
    allowOverwrite: true,
  })

  await redis.set(URL_KEY(propertyId), blob.url, { ex: URL_TTL_SECONDS })
  return blob.url
}

// ── Lookup-only (no genera) ─────────────────────────────────────────────────

export async function getCachedAudioUrl(propertyId: number): Promise<string | null> {
  const cached = await redis.get<string>(URL_KEY(propertyId))
  return typeof cached === 'string' ? cached : null
}
