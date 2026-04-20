// Validaciones post-Claude del carrusel extraído.
//
// Se ejecutan después de parsear el JSON que devuelve el LLM. Si falla,
// el extractor reintenta (hasta 3 veces) inyectando las razones como
// feedback en el siguiente user prompt.
//
// Reglas:
//  - 3 ≤ total ≤ 6 placas
//  - orden consecutivo 1..N
//  - fondo ∈ {verde-profundo, crema, blanco}
//  - Máx 3 placas con verde-profundo (anti-saturación del carrusel)
//  - Cada placa: chrome fields presentes + no vacíos
//  - bloques array no vacío, cada uno con tipo válido y props obligatorias
//  - Sin emojis en ningún texto
//  - Sin menciones de tabúes (políticos, crypto, competidores)
//  - Sin clichés editoriales
//  - Si hay un bloque numero-shock, el fondo de la placa debería ser oscuro

import type { Bloque, Carrusel, Placa, TipoBloque } from '../types'

export interface ValidacionResultado {
  ok: boolean
  errores: string[]
}

const TIPOS_BLOQUE_VALIDOS: TipoBloque[] = [
  'eyebrow', 'titulo', 'bajada', 'parrafo',
  'numero-hero', 'numero-shock', 'breakdown', 'lista',
  'cita', 'comparativa', 'imagen', 'grafico',
  'fuente', 'cta-actions', 'handle', 'divider', 'spacer',
]

const FONDOS_VALIDOS = ['verde-profundo', 'crema', 'blanco'] as const

// Detección de emoji sin flag `u` (incompatible con target TS de este repo).
// Chequea codepoints por rango.
function contieneEmoji(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    const cp = s.codePointAt(i)
    if (cp == null) continue
    if (
      (cp >= 0x2300 && cp <= 0x23FF) ||
      (cp >= 0x2600 && cp <= 0x27BF) ||
      (cp >= 0x2B00 && cp <= 0x2BFF) ||
      (cp >= 0x1F000 && cp <= 0x1FFFF)
    ) {
      return true
    }
    // Saltar surrogate pair si corresponde
    if (cp > 0xFFFF) i++
  }
  return false
}

// Tabúes compartidos con el writer del blog
const POLITICOS = ['milei', 'kicillof', 'massa', 'macri', 'bullrich', 'villarruel', 'caputo']
const CRYPTO = ['crypto', 'blockchain', 'tokenización', 'tokenizacion', 'nft', 'stablecoin']
const COMPETIDORES = [
  'vanzini', 'crestale', 'squadra', 'squaddra', 'skygarden',
  'altos de funes', 'funes inmobiliaria', 're/max', 'remax', 'eigen',
]
const CLICHES = [
  'en un mundo cambiante',
  'en un mercado cambiante',
  'es importante destacar',
  'cabe mencionar',
  'sin lugar a dudas',
  'oportunidad única',
  'oportunidad unica',
  'imperdible',
  'no te lo pierdas',
  'mirá esto que es fuego',
  'te cambia la jugada',
]

function extraerTextos(bloques: Bloque[]): string[] {
  const textos: string[] = []
  for (const b of bloques) {
    switch (b.tipo) {
      case 'eyebrow': textos.push(b.texto); break
      case 'titulo': textos.push(b.texto); break
      case 'bajada': textos.push(b.texto); break
      case 'parrafo': textos.push(b.texto); break
      case 'numero-hero':
        textos.push(b.valor)
        if (b.sup) textos.push(b.sup)
        if (b.anotacion_valor) textos.push(b.anotacion_valor)
        if (b.anotacion_label) textos.push(b.anotacion_label)
        break
      case 'numero-shock':
        textos.push(b.valor)
        if (b.sup) textos.push(b.sup)
        break
      case 'breakdown':
        for (const it of b.items) { textos.push(it.label); textos.push(it.valor) }
        break
      case 'lista':
        if (b.titulo) textos.push(b.titulo)
        textos.push(...b.items)
        break
      case 'cita':
        textos.push(b.frase); textos.push(b.atribucion); break
      case 'comparativa':
        if (b.titulo) textos.push(b.titulo)
        textos.push(b.izquierda.label, b.izquierda.valor)
        if (b.izquierda.sub) textos.push(b.izquierda.sub)
        textos.push(b.derecha.label, b.derecha.valor)
        if (b.derecha.sub) textos.push(b.derecha.sub)
        break
      case 'imagen':
        if (b.alt) textos.push(b.alt)
        if (b.overlay?.titulo) textos.push(b.overlay.titulo)
        if (b.overlay?.texto) textos.push(b.overlay.texto)
        if (b.overlay?.numero) textos.push(b.overlay.numero)
        break
      case 'grafico':
        if (b.titulo) textos.push(b.titulo)
        if (b.data.tipo !== 'dona' && 'unidad' in b.data && b.data.unidad) {
          textos.push(b.data.unidad)
        }
        for (const d of b.data.datos) textos.push(d.label)
        break
      case 'fuente': textos.push(b.texto); break
      case 'handle': textos.push(b.texto); break
      case 'cta-actions': case 'divider': case 'spacer': break
    }
  }
  return textos
}

function validarBloque(bloque: unknown, idxPlaca: number, idxBloque: number): string[] {
  const ctx = `placa[${idxPlaca}].bloques[${idxBloque}]`
  const errs: string[] = []

  if (typeof bloque !== 'object' || bloque === null) {
    return [`${ctx} no es un objeto`]
  }
  const b = bloque as Record<string, unknown>
  const tipo = b.tipo
  if (typeof tipo !== 'string') return [`${ctx} no tiene tipo`]
  if (!TIPOS_BLOQUE_VALIDOS.includes(tipo as TipoBloque)) {
    return [`${ctx} tipo "${tipo}" no es válido. Válidos: ${TIPOS_BLOQUE_VALIDOS.join(', ')}`]
  }

  // Props obligatorias por tipo
  const reqTexto = () => {
    if (typeof b.texto !== 'string' || !b.texto.trim()) errs.push(`${ctx} (${tipo}) requiere texto no vacío`)
  }
  const reqValor = () => {
    if (typeof b.valor !== 'string' || !b.valor.trim()) errs.push(`${ctx} (${tipo}) requiere valor no vacío`)
  }

  switch (tipo) {
    case 'eyebrow': case 'titulo': case 'bajada': case 'parrafo':
    case 'fuente': case 'handle':
      reqTexto(); break
    case 'numero-hero':
      reqValor(); break
    case 'numero-shock':
      reqValor(); break
    case 'breakdown':
      if (!Array.isArray(b.items) || b.items.length < 2 || b.items.length > 4) {
        errs.push(`${ctx} breakdown requiere 2-4 items (tiene ${Array.isArray(b.items) ? b.items.length : 0})`)
      }
      break
    case 'lista':
      if (!Array.isArray(b.items) || b.items.length < 2 || b.items.length > 6) {
        errs.push(`${ctx} lista requiere 2-6 items`)
      }
      break
    case 'cita':
      if (typeof b.frase !== 'string' || !b.frase.trim()) errs.push(`${ctx} cita.frase requerido`)
      if (typeof b.atribucion !== 'string' || !b.atribucion.trim()) errs.push(`${ctx} cita.atribucion requerido`)
      break
    case 'comparativa':
      if (typeof b.izquierda !== 'object' || typeof b.derecha !== 'object') {
        errs.push(`${ctx} comparativa requiere izquierda y derecha`)
      }
      break
    case 'imagen':
      if (typeof b.url !== 'string' || !b.url.startsWith('http')) errs.push(`${ctx} imagen.url inválida`)
      break
    case 'grafico':
      if (typeof b.data !== 'object' || b.data === null) errs.push(`${ctx} grafico.data requerido`)
      else {
        const d = b.data as Record<string, unknown>
        if (!['barras', 'linea', 'dona'].includes(d.tipo as string)) {
          errs.push(`${ctx} grafico.data.tipo inválido`)
        }
        if (!Array.isArray(d.datos) || d.datos.length < 2) errs.push(`${ctx} grafico.data.datos requiere ≥ 2`)
      }
      break
    case 'cta-actions': case 'divider': case 'spacer':
      break // no obligatorias
  }
  return errs
}

function validarPlaca(placa: unknown, idx: number): string[] {
  const ctx = `placa[${idx}]`
  const errs: string[] = []
  if (typeof placa !== 'object' || placa === null) return [`${ctx} no es un objeto`]
  const p = placa as Record<string, unknown>

  if (typeof p.orden !== 'number') errs.push(`${ctx}.orden debe ser número`)
  if (!FONDOS_VALIDOS.includes(p.fondo as never)) {
    errs.push(`${ctx}.fondo inválido: "${String(p.fondo)}". Debe ser: ${FONDOS_VALIDOS.join(', ')}`)
  }
  for (const k of ['head_bar_izquierda', 'head_bar_derecha', 'meta_foot'] as const) {
    if (typeof p[k] !== 'string' || !(p[k] as string).trim()) {
      errs.push(`${ctx}.${k} requerido (chrome)`)
    }
  }
  if (!Array.isArray(p.bloques) || p.bloques.length === 0) {
    errs.push(`${ctx}.bloques debe ser array no vacío`)
    return errs // no sigo iterando
  }
  const bloques = p.bloques as unknown[]
  for (let i = 0; i < bloques.length; i++) {
    errs.push(...validarBloque(bloques[i], idx, i))
  }
  return errs
}

export function validarCarrusel(raw: unknown): ValidacionResultado {
  const errs: string[] = []

  if (typeof raw !== 'object' || raw === null) {
    return { ok: false, errores: ['Respuesta no es un objeto JSON'] }
  }
  const c = raw as Record<string, unknown>

  if (typeof c.total !== 'number') errs.push('total debe ser número')
  if (!Array.isArray(c.placas)) {
    return { ok: false, errores: ['placas debe ser array'] }
  }
  const placas = c.placas as unknown[]

  // Cantidad
  if (placas.length < 3 || placas.length > 6) {
    errs.push(`total debe ser 3-6 placas (hay ${placas.length})`)
  }
  if (typeof c.total === 'number' && c.total !== placas.length) {
    errs.push(`total (${c.total}) no coincide con placas.length (${placas.length})`)
  }

  // Orden consecutivo
  const ordenes = placas
    .map((p): number | null =>
      typeof p === 'object' && p !== null && typeof (p as { orden?: unknown }).orden === 'number'
        ? (p as { orden: number }).orden
        : null,
    )
    .filter((n): n is number => n !== null)
  if (ordenes.length === placas.length) {
    const sorted = [...ordenes].sort((a, b) => a - b)
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i] !== i + 1) {
        errs.push(`orden debe ser consecutivo 1..${placas.length}`)
        break
      }
    }
  }

  // Validar cada placa
  for (let i = 0; i < placas.length; i++) {
    errs.push(...validarPlaca(placas[i], i))
  }

  // Anti-saturación: máx 3 placas con verde-profundo
  const darkCount = placas.filter(
    p => (p as { fondo?: string } | null)?.fondo === 'verde-profundo',
  ).length
  if (darkCount > 3) {
    errs.push(`máximo 3 placas con fondo verde-profundo por carrusel (hay ${darkCount})`)
  }

  // Textos: emojis, tabúes, clichés
  for (let i = 0; i < placas.length; i++) {
    const p = placas[i] as Placa | null
    if (!p || !Array.isArray(p.bloques)) continue
    const todosLosTextos = [
      p.head_bar_izquierda,
      p.head_bar_derecha,
      p.meta_foot,
      ...extraerTextos(p.bloques),
    ].filter((t): t is string => typeof t === 'string')

    const merged = todosLosTextos.join(' ').toLowerCase()

    if (todosLosTextos.some(t => contieneEmoji(t))) {
      errs.push(`placa[${i}] contiene emojis — prohibidos en toda placa`)
    }
    for (const p of POLITICOS) {
      if (merged.includes(p)) { errs.push(`placa[${i}] menciona político prohibido: "${p}"`); break }
    }
    for (const c of CRYPTO) {
      if (merged.includes(c)) { errs.push(`placa[${i}] menciona tema crypto prohibido: "${c}"`); break }
    }
    for (const c of COMPETIDORES) {
      if (merged.includes(c)) { errs.push(`placa[${i}] menciona competidor prohibido: "${c}"`); break }
    }
    for (const c of CLICHES) {
      if (merged.includes(c)) { errs.push(`placa[${i}] usa cliché prohibido: "${c}"`); break }
    }
  }

  // CTA al final: última placa debería tener cta-actions o handle
  const ultima = placas[placas.length - 1] as Placa | undefined
  if (ultima && Array.isArray(ultima.bloques)) {
    const tieneCTA = ultima.bloques.some(
      b => b?.tipo === 'cta-actions' || b?.tipo === 'handle',
    )
    if (!tieneCTA) {
      errs.push('última placa debería incluir cta-actions o handle (CTA de cierre)')
    }
  }

  return { ok: errs.length === 0, errores: errs }
}

/** Narrowing: asume que `raw` ya pasó validarCarrusel(). */
export function asCarrusel(raw: unknown): Carrusel {
  return raw as Carrusel
}
