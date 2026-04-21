// Orquestador de placas — end-to-end:
//   1. Lee la nota (slug específico o la última publicada en el Blob)
//   2. Corre el extractor (Claude Sonnet decide los bloques)
//   3. Renderiza cada placa a PNG (Satori)
//   4. Sube los PNGs a Vercel Blob en placas/{slug}/{NN}.png
//   5. Graba un registro CarruselPublicado en Redis con key blog:placas:{slug}
//
// Devuelve un summary con el resultado. La notificación WhatsApp al admin
// la dispara el cron (paso 7) — este orquestador sólo deja todo listo para
// que la UI /admin/placas/{slug} pueda mostrar, aprobar o regenerar.

import { put } from '@vercel/blob'
import { Redis } from '@upstash/redis'
import { extraerCarrusel } from './extractor'
import { leerNotaPorSlug, leerUltimaNota } from './leer-nota'
import { renderPlaca } from './renderer'
import type {
  CarruselPublicado,
  NotaParaExtractor,
  PlacaRenderizada,
} from '../types'

const BASE_URL = 'https://siinmobiliaria.com'

export const PLACAS_REDIS_KEYS = {
  registro: (slug: string) => `blog:placas:${slug}`,
}

function getRedis(): Redis {
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  })
}

export type OrquestadorResultado =
  | {
      ok: true
      slug: string
      titulo: string
      total: number
      placas: Array<{ numero: number; url: string }>
      ms_total: number
      intentos_extractor: number
    }
  | { ok: false; error: string; slug?: string }

interface EjecutarOpciones {
  /** Slug específico. Si se omite, usa la última nota publicada. */
  slug?: string
}

export async function ejecutarOrquestador(
  opts: EjecutarOpciones = {},
): Promise<OrquestadorResultado> {
  const t0 = Date.now()

  // 1. Leer nota
  let nota: NotaParaExtractor | null
  try {
    nota = opts.slug ? await leerNotaPorSlug(opts.slug) : await leerUltimaNota()
  } catch (err) {
    return { ok: false, error: `leer-nota-failed: ${errMsg(err)}`, slug: opts.slug }
  }
  if (!nota) {
    return {
      ok: false,
      error: opts.slug
        ? `no encontré nota con slug "${opts.slug}" en Blob`
        : 'no hay notas publicadas en Blob',
      slug: opts.slug,
    }
  }

  // 2. Extractor Claude (ya trae retry interno)
  const extraccion = await extraerCarrusel(nota)
  if (!extraccion.ok || !extraccion.carrusel) {
    return {
      ok: false,
      error: `extractor-failed: ${(extraccion.razones ?? ['sin razón']).join(' · ')}`,
      slug: nota.slug,
    }
  }
  const carrusel = extraccion.carrusel

  // 3 + 4. Render + upload en paralelo (3-6 placas, vale la pena)
  let renderizadas: PlacaRenderizada[]
  try {
    renderizadas = await Promise.all(
      carrusel.placas.map(async placa => {
        const buffer = await renderPlaca(placa)
        const num = String(placa.orden).padStart(2, '0')
        const blobPath = `placas/${nota.slug}/${num}.png`
        const blob = await put(blobPath, Buffer.from(buffer), {
          access: 'public',
          contentType: 'image/png',
          addRandomSuffix: false,
          allowOverwrite: true,
        })
        const renderizada: PlacaRenderizada = {
          numero: placa.orden,
          placa,
          url_png: blob.url,
          estado: 'pendiente',
        }
        return renderizada
      }),
    )
  } catch (err) {
    return {
      ok: false,
      error: `render-or-upload-failed: ${errMsg(err)}`,
      slug: nota.slug,
    }
  }

  // 5. Registro Redis
  const registro: CarruselPublicado = {
    slug: nota.slug,
    nota_titulo: nota.titulo,
    nota_url: `${BASE_URL}/blog/${nota.slug}`,
    placas: renderizadas.sort((a, b) => a.numero - b.numero),
    generado_en: new Date().toISOString(),
    aprobado_global: false,
    intentos_regeneracion: {},
  }
  await getRedis().set(
    PLACAS_REDIS_KEYS.registro(nota.slug),
    JSON.stringify(registro),
  )

  return {
    ok: true,
    slug: nota.slug,
    titulo: nota.titulo,
    total: registro.placas.length,
    placas: registro.placas.map(p => ({ numero: p.numero, url: p.url_png })),
    ms_total: Date.now() - t0,
    intentos_extractor: extraccion.intentos,
  }
}

export async function marcarAprobado(slug: string): Promise<boolean> {
  const redis = getRedis()
  const raw = await redis.get<string>(PLACAS_REDIS_KEYS.registro(slug))
  if (!raw) return false
  const registro: CarruselPublicado =
    typeof raw === 'string' ? JSON.parse(raw) : (raw as unknown as CarruselPublicado)
  registro.aprobado_global = true
  registro.placas = registro.placas.map(p => ({ ...p, estado: 'aprobada' }))
  await redis.set(PLACAS_REDIS_KEYS.registro(slug), JSON.stringify(registro))
  return true
}

export async function leerRegistro(slug: string): Promise<CarruselPublicado | null> {
  const redis = getRedis()
  const raw = await redis.get<string>(PLACAS_REDIS_KEYS.registro(slug))
  if (!raw) return null
  return typeof raw === 'string' ? JSON.parse(raw) : (raw as unknown as CarruselPublicado)
}

function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}
