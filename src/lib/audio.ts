// Resumen narrado por IA + audio TTS para /propiedades/[slug] y verficha.casa.
//
// Pipeline:
//   1. generateResumen(propertyId, snapshot?) → llama Anthropic Haiku con un
//      system prompt orientado a un resumen oral natural argentino. Cachea el
//      texto en Redis (audio:resumen:{id}:text TTL 30d).
//   2. generateAudio(propertyId, snapshot?) → reusa generateResumen + llama
//      OpenAI TTS (tts-1 / nova / 1.05x speed / mp3) → sube el buffer a
//      Vercel Blob como audio/{id}.mp3 → cachea la URL en Redis
//      (audio:resumen:{id}:url TTL 365d, las URLs del Blob son estables).
//
// El snapshot opcional permite reusar datos ya leídos (caso verficha.casa
// que ya tiene el snapshot en mano) y evita el round-trip a Tokko.

import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
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
const TEXT_KEY = (id: number) => `audio:resumen:${id}:text`
const URL_KEY = (id: number) => `audio:resumen:${id}:url`
const BLOB_PATH = (id: number) => `audio/${id}.mp3`

const HAIKU_MODEL = 'claude-haiku-4-5-20251001'
const TTS_MODEL = 'tts-1'
const TTS_VOICE = 'nova'
const TTS_SPEED = 1.05

// ── System prompt: voz argentina, conversacional, 300-450 chars ──
const SYSTEM_PROMPT = `Sos un broker inmobiliario argentino describiendo una propiedad para un audio de presentación. Tu trabajo es generar un resumen oral natural, conversacional, de 300 a 450 caracteres. El texto se va a convertir en audio TTS y lo va a escuchar alguien de 40 a 65 años desde su celular.

Reglas estrictas:
- Español rioplatense argentino. Decí "esta casa" o "este departamento", no "esta vivienda" ni "este inmueble".
- Empezar siempre con el tipo y los ambientes.
- Mencionar superficie cubierta, dormitorios, baños, cocheras si existen.
- Mencionar la zona/barrio (sin número de calle exacto).
- Mencionar 1-2 características destacadas (pileta, parrilla, jardín, vista, ubicación estratégica).
- NO incluir precio (los precios se ven en pantalla).
- NO incluir dirección exacta.
- NO usar listas ni "primero, segundo".
- Sin emojis, sin signos especiales.
- Como si caminaras por la casa contándosela a un amigo.
- Cerrar con una línea evocativa breve, no genérica.

Devolvé SOLO el texto, sin comillas, sin prefijos como "Acá va:" ni nada.`

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
    max_tokens: 400,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  })

  const textBlock = msg.content.find(b => b.type === 'text')
  const text = (textBlock && textBlock.type === 'text' ? textBlock.text : '').trim()
  if (!text) throw new Error('Resumen vacío del modelo')

  await redis.set(TEXT_KEY(propertyId), text, { ex: TEXT_TTL_SECONDS })
  return text
}

// ── Generate audio (TTS + Blob) ─────────────────────────────────────────────

let _openai: OpenAI | null = null
function openai(): OpenAI {
  if (_openai) return _openai
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY no configurada')
  _openai = new OpenAI({ apiKey })
  return _openai
}

export async function generateAudio(
  propertyId: number,
  snapshot?: FichaSnapshot,
): Promise<string> {
  const cachedUrl = await redis.get<string>(URL_KEY(propertyId))
  if (cachedUrl && typeof cachedUrl === 'string') return cachedUrl

  const text = await generateResumen(propertyId, snapshot)

  const speech = await openai().audio.speech.create({
    model: TTS_MODEL,
    voice: TTS_VOICE,
    input: text,
    speed: TTS_SPEED,
    response_format: 'mp3',
  })

  const buffer = Buffer.from(await speech.arrayBuffer())

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
