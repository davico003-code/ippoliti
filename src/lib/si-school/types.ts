// Tipos de SI School. Fase 1: contenido + progreso en localStorage.
// El Mentor IA y la evaluación real llegan en Fase 2.

export type CapacidadEstado = 'completada' | 'activa' | 'bloqueada'
export type CapsulaTipo = 'lectura' | 'practica'
export type LevelNumber = 1 | 2 | 3 | 4 | 5

export interface CapacidadMeta {
  slug: string
  numero: number
  romano: string
  titulo: string
  subtitulo: string
  descripcion: string
  estado: CapacidadEstado
}

export interface Capsula {
  slug: string
  numero: number
  titulo: string
  tipo: CapsulaTipo
  tiempoMin: number
  contenidoMd: string
  contenidoHtml: string
}

export interface Caso {
  slug: string
  numero: number
  titulo: string
  escenario: string
  cita: string
  tarea: string
  criteriosEval: string[]
  contenidoMd: string
  contenidoHtml: string
}

export interface PreguntaComprension {
  capsulaRef: string
  pregunta: string
  criterio: string
}

/** Pregunta multiple choice de cierre de cápsula (autocorregible). */
export interface QuizPregunta {
  pregunta: string
  opciones: string[]
  /** Índice de la opción correcta en `opciones`. */
  correcta: number
  /** Valida el razonamiento cuando responde bien (1 oración). */
  porQue: string
  /** Lo que le tiene que quedar de la cápsula; se muestra cuando falla. */
  recordatorio: string
}

export interface Capacidad extends CapacidadMeta {
  capsulas: Capsula[]
  casos: Caso[]
  reglaDeOro: string
  reglaDeOroHtml: string
  preguntas: PreguntaComprension[]
  cierreMd: string
  cierreHtml: string
}

export interface Level {
  numero: LevelNumber
  nombre: string
  descripcion: string
  desbloqueaEn: string[]
}

export interface CasoSubmission {
  respuesta: string
  enviadoAt: string
}

export interface AgentProgress {
  startedAt: string
  capsulasCompletadas: string[]
  casosEnviados: Record<string, CasoSubmission>
  casoDrafts: Record<string, { texto: string; updatedAt: string }>
  currentCapacidad: string
  level: LevelNumber
  tourDone: boolean
}
