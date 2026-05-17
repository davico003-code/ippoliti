// Loader server-side de contenido de SI School.
// Lee los markdown desde src/content/si-school/<capSlug>/ y devuelve
// estructuras tipadas para las páginas server-component.
//
// IMPORTANTE: solo úsese desde Server Components / Route Handlers
// (usa fs/path). NO importar desde 'use client'.

import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkHtml from 'remark-html'

import { CAPACIDADES_META } from '@/content/si-school/capacidades'
import type {
  Capacidad,
  CapacidadMeta,
  Capsula,
  Caso,
  PreguntaComprension,
} from './types'

const CONTENT_ROOT = path.join(process.cwd(), 'src', 'content', 'si-school')

function mdToHtmlSync(md: string): string {
  // remark().processSync devuelve VFile con .toString() = HTML
  const file = remark().use(remarkHtml).processSync(md)
  return String(file)
}

function safeReadFile(absPath: string): string | null {
  try {
    return fs.readFileSync(absPath, 'utf-8')
  } catch {
    return null
  }
}

function listMdFiles(absDir: string): string[] {
  try {
    return fs
      .readdirSync(absDir)
      .filter((f) => f.endsWith('.md'))
      .sort()
  } catch {
    return []
  }
}

export function getCapacidadesMeta(): CapacidadMeta[] {
  return CAPACIDADES_META
}

export function getCapacidadMeta(slug: string): CapacidadMeta | null {
  return CAPACIDADES_META.find((c) => c.slug === slug) ?? null
}

function loadCapsulasFor(capSlug: string): Capsula[] {
  const dir = path.join(CONTENT_ROOT, capSlug)
  const files = listMdFiles(dir).filter(
    (f) => /^\d{2}-/.test(f), // solo 01-…, 02-…, etc. (las cápsulas)
  )
  const capsulas: Capsula[] = []
  for (const file of files) {
    const raw = safeReadFile(path.join(dir, file))
    if (!raw) continue
    const { data, content } = matter(raw)
    const slug = file.replace(/\.md$/, '')
    capsulas.push({
      slug,
      numero: typeof data.numero === 'number' ? data.numero : 0,
      titulo: typeof data.titulo === 'string' ? data.titulo : slug,
      tipo: data.tipo === 'practica' ? 'practica' : 'lectura',
      tiempoMin: typeof data.tiempoMin === 'number' ? data.tiempoMin : 3,
      contenidoMd: content.trim(),
      contenidoHtml: mdToHtmlSync(content.trim()),
    })
  }
  capsulas.sort((a, b) => a.numero - b.numero)
  return capsulas
}

function loadCasosFor(capSlug: string): Caso[] {
  const dir = path.join(CONTENT_ROOT, capSlug, 'casos')
  const files = listMdFiles(dir)
  const casos: Caso[] = []
  for (const file of files) {
    const raw = safeReadFile(path.join(dir, file))
    if (!raw) continue
    const { data, content } = matter(raw)
    const slug = file.replace(/\.md$/, '')
    const criterios = Array.isArray(data.criteriosEval)
      ? data.criteriosEval.map(String)
      : []
    casos.push({
      slug,
      numero: typeof data.numero === 'number' ? data.numero : 0,
      titulo: typeof data.titulo === 'string' ? data.titulo : slug,
      escenario: typeof data.escenario === 'string' ? data.escenario : '',
      cita: typeof data.cita === 'string' ? data.cita : '',
      tarea: typeof data.tarea === 'string' ? data.tarea : '',
      criteriosEval: criterios,
      contenidoMd: content.trim(),
      contenidoHtml: mdToHtmlSync(content.trim()),
    })
  }
  casos.sort((a, b) => a.numero - b.numero)
  return casos
}

function loadSimpleMd(capSlug: string, fileName: string): { md: string; html: string } {
  const raw = safeReadFile(path.join(CONTENT_ROOT, capSlug, fileName))
  if (!raw) return { md: '', html: '' }
  const { content } = matter(raw)
  return { md: content.trim(), html: mdToHtmlSync(content.trim()) }
}

function loadPreguntas(capSlug: string): PreguntaComprension[] {
  const raw = safeReadFile(path.join(CONTENT_ROOT, capSlug, 'preguntas-comprension.md'))
  if (!raw) return []
  const { content } = matter(raw)
  // Parse "### Después de Cápsula N (...)" + "**Pregunta:** ..." + "**Criterio...**: ..."
  const preguntas: PreguntaComprension[] = []
  const sections = content.split(/^###\s+/m).slice(1)
  for (const sec of sections) {
    const lines = sec.split('\n')
    const heading = (lines.shift() || '').trim()
    const refMatch = heading.match(/Después de\s+(C[áa]psula\s+\d+)/i)
    const capsulaRef = refMatch ? refMatch[1] : heading
    const body = lines.join('\n').trim()
    const preguntaMatch = body.match(/\*\*Pregunta:\*\*\s*\n>\s*([\s\S]*?)(?:\n\n|\*\*Criterio)/)
    const pregunta = preguntaMatch ? preguntaMatch[1].trim().replace(/^>\s?/gm, '') : ''
    const criterioMatch = body.match(/\*\*Criterio[^*]*\*\*\s*([\s\S]*?)$/)
    const criterio = criterioMatch ? criterioMatch[1].trim() : ''
    if (pregunta) {
      preguntas.push({ capsulaRef, pregunta, criterio })
    }
  }
  return preguntas
}

export function getCapacidad(slug: string): Capacidad | null {
  const meta = getCapacidadMeta(slug)
  if (!meta) return null

  const capsulas = loadCapsulasFor(slug)
  const casos = loadCasosFor(slug)
  const regla = loadSimpleMd(slug, 'regla-de-oro.md')
  const cierre = loadSimpleMd(slug, 'cierre.md')
  const preguntas = loadPreguntas(slug)

  return {
    ...meta,
    capsulas,
    casos,
    reglaDeOro: regla.md,
    reglaDeOroHtml: regla.html,
    preguntas,
    cierreMd: cierre.md,
    cierreHtml: cierre.html,
  }
}

export function getCapsula(capSlug: string, capsulaSlug: string): Capsula | null {
  return loadCapsulasFor(capSlug).find((c) => c.slug === capsulaSlug) ?? null
}

export function getCaso(capSlug: string, casoSlug: string): Caso | null {
  return loadCasosFor(capSlug).find((c) => c.slug === casoSlug) ?? null
}
