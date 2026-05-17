// Persistencia de progreso del agente en localStorage.
// Fase 1: solo cliente. Fase 2 sincronizará contra Redis vía API.
//
// Convención de keys: `${slug-capacidad}/${slug-capsula|caso}`.
// Por ejemplo: 'capacidad-01/01-bienvenida'.

import { CAPACIDADES_META } from '@/content/si-school/capacidades'
import type {
  AgentProgress,
  CasoSubmission,
  Level,
  LevelNumber,
} from './types'

const STORAGE_KEY = 'si_school_progress'

export const LEVELS: Level[] = [
  {
    numero: 1,
    nombre: 'Iniciado',
    descripcion: 'Empezando el sistema operativo SI.',
    desbloqueaEn: ['Lectura libre de Capacidad I'],
  },
  {
    numero: 2,
    nombre: 'Operativo',
    descripcion: 'Cap I cerrada. Listo para construir presencia y autoridad.',
    desbloqueaEn: ['Acceso a Capacidad II y III'],
  },
  {
    numero: 3,
    nombre: 'Profesional',
    descripcion: 'Caps I-IV completadas. Captás y conducís con criterio SI.',
    desbloqueaEn: ['Acceso a Capacidad V', 'Acuerdos firmados sin asistencia'],
  },
  {
    numero: 4,
    nombre: 'Referente',
    descripcion: 'Cap V + primera operación validada manualmente.',
    desbloqueaEn: ['Aparición en panel de agentes top', 'Validación Fase 2'],
  },
  {
    numero: 5,
    nombre: 'Maestro SI',
    descripcion: 'Cap VI + 6 meses sostenidos. Mentor habilitado.',
    desbloqueaEn: ['Habilitado para mentorear nuevos ingresos'],
  },
]

function emptyProgress(): AgentProgress {
  return {
    startedAt: new Date().toISOString(),
    capsulasCompletadas: [],
    casosEnviados: {},
    casoDrafts: {},
    currentCapacidad: 'capacidad-01',
    level: 1,
    tourDone: false,
  }
}

function safeRead(): AgentProgress | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<AgentProgress>
    return {
      startedAt: typeof parsed.startedAt === 'string' ? parsed.startedAt : new Date().toISOString(),
      capsulasCompletadas: Array.isArray(parsed.capsulasCompletadas)
        ? parsed.capsulasCompletadas
        : [],
      casosEnviados:
        parsed.casosEnviados && typeof parsed.casosEnviados === 'object'
          ? (parsed.casosEnviados as AgentProgress['casosEnviados'])
          : {},
      casoDrafts:
        parsed.casoDrafts && typeof parsed.casoDrafts === 'object'
          ? (parsed.casoDrafts as AgentProgress['casoDrafts'])
          : {},
      currentCapacidad:
        typeof parsed.currentCapacidad === 'string' ? parsed.currentCapacidad : 'capacidad-01',
      level: (parsed.level && [1, 2, 3, 4, 5].includes(parsed.level) ? parsed.level : 1) as LevelNumber,
      tourDone: !!parsed.tourDone,
    }
  } catch {
    return null
  }
}

function safeWrite(progress: AgentProgress): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    // Notificar a otras pestañas / componentes que escuchen.
    window.dispatchEvent(new CustomEvent('si-school-progress-updated'))
  } catch {
    /* full storage o private mode — silenciar */
  }
}

export function initProgress(): AgentProgress {
  const existing = safeRead()
  if (existing) return existing
  const fresh = emptyProgress()
  safeWrite(fresh)
  return fresh
}

export function getProgress(): AgentProgress {
  return safeRead() ?? initProgress()
}

export function markCapsulaDone(capSlug: string, capsulaSlug: string): AgentProgress {
  const key = `${capSlug}/${capsulaSlug}`
  const p = getProgress()
  if (!p.capsulasCompletadas.includes(key)) {
    p.capsulasCompletadas = [...p.capsulasCompletadas, key]
  }
  p.level = computeLevel(p)
  p.currentCapacidad = computeCurrentCapacidad(p)
  safeWrite(p)
  return p
}

export function markCasoSubmitted(
  capSlug: string,
  casoSlug: string,
  respuesta: string,
): AgentProgress {
  const key = `${capSlug}/${casoSlug}`
  const p = getProgress()
  const submission: CasoSubmission = {
    respuesta,
    enviadoAt: new Date().toISOString(),
  }
  p.casosEnviados = { ...p.casosEnviados, [key]: submission }
  // Al enviar, limpiamos el draft.
  if (p.casoDrafts[key]) {
    const next = { ...p.casoDrafts }
    delete next[key]
    p.casoDrafts = next
  }
  safeWrite(p)
  return p
}

export function saveCasoDraft(capSlug: string, casoSlug: string, texto: string): void {
  const key = `${capSlug}/${casoSlug}`
  const p = getProgress()
  if (!texto.trim()) {
    // Si quedó vacío, borramos.
    const next = { ...p.casoDrafts }
    delete next[key]
    p.casoDrafts = next
  } else {
    p.casoDrafts = {
      ...p.casoDrafts,
      [key]: { texto, updatedAt: new Date().toISOString() },
    }
  }
  safeWrite(p)
}

export function getCasoDraft(capSlug: string, casoSlug: string): string {
  const key = `${capSlug}/${casoSlug}`
  return getProgress().casoDrafts[key]?.texto ?? ''
}

export function getCasoSubmission(capSlug: string, casoSlug: string): CasoSubmission | null {
  const key = `${capSlug}/${casoSlug}`
  return getProgress().casosEnviados[key] ?? null
}

export function getCapacidadProgress(capSlug: string, totalCapsulas: number): number {
  if (totalCapsulas <= 0) return 0
  const p = getProgress()
  const done = p.capsulasCompletadas.filter((k) => k.startsWith(`${capSlug}/`)).length
  return Math.min(1, done / totalCapsulas)
}

export function isCapacidadCompleta(
  capSlug: string,
  totalCapsulas: number,
  capsulasSlugs: string[],
): boolean {
  if (totalCapsulas <= 0) return false
  const p = getProgress()
  return capsulasSlugs.every((s) => p.capsulasCompletadas.includes(`${capSlug}/${s}`))
}

export function canUnlockCapacidad(slug: string): boolean {
  // Cap I siempre desbloqueada. Cualquier otra requiere la previa completa.
  const idx = CAPACIDADES_META.findIndex((c) => c.slug === slug)
  if (idx <= 0) return idx === 0
  const prev = CAPACIDADES_META[idx - 1]
  // En Fase 1 sin contenido, sólo Cap I tiene cápsulas reales. Las otras
  // permanecen bloqueadas por defecto (no se desbloquean automáticamente
  // a menos que el agente haya completado al menos 1 cápsula de la previa).
  const p = getProgress()
  const algunaCompletada = p.capsulasCompletadas.some((k) =>
    k.startsWith(`${prev.slug}/`),
  )
  return algunaCompletada && /* placeholder: en Fase 2 evaluamos casos+preguntas */ false
}

function computeLevel(p: AgentProgress): LevelNumber {
  // Heurística simple. En Fase 2 incorporamos casos aprobados.
  // - Nivel 2 al completar al menos 5/7 cápsulas de Cap I.
  // - Nivel 3 al completar Cap I+II+III+IV (Fase 2).
  // - Nivel 4 y 5 requieren validación manual (Fase 2).
  const cap1Done = p.capsulasCompletadas.filter((k) => k.startsWith('capacidad-01/')).length
  if (cap1Done >= 7) return 2
  return 1
}

function computeCurrentCapacidad(p: AgentProgress): string {
  // Por ahora, siempre cap-01 mientras no esté completa (sin lógica de
  // desbloqueo Fase 2). Volverá a cambiar cuando se carguen II-VI.
  return p.currentCapacidad || 'capacidad-01'
}

export function getLevel(): Level {
  const p = getProgress()
  return LEVELS.find((l) => l.numero === p.level) ?? LEVELS[0]
}

export function getDiasActivo(): number {
  const p = getProgress()
  const startedMs = Date.parse(p.startedAt)
  if (Number.isNaN(startedMs)) return 0
  const diffMs = Date.now() - startedMs
  return Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1)
}

export function markTourDone(): void {
  const p = getProgress()
  p.tourDone = true
  safeWrite(p)
}

export function isTourDone(): boolean {
  return getProgress().tourDone
}

export function resetProgress(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new CustomEvent('si-school-progress-updated'))
}
