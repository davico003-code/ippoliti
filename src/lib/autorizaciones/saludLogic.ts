// Evaluación del semáforo de Salud del acuerdo (interno).
//
// Reglas:
//   - Título OK = al menos uno de Escritura o Boleto en "Sí"
//   - Planos OK = "Sí"
//   - VEP/Mensura OK = "Sí" o "N/A"
//
// Estado:
//   - verde  → los 3 OK
//   - amarillo → 2 OK + al menos 1 fail (No respondido a "no")
//   - rojo → 0 o 1 OK + al menos 1 fail
//   - sin_datos → no se contestaron las preguntas críticas todavía
//     (incluye respuestas parciales sin fails explícitos)

import type { Salud } from './index'

export type EstadoSalud = 'rojo' | 'amarillo' | 'verde' | 'sin_datos'

export interface SaludEvaluation {
  estado: EstadoSalud
  titulo_ok: boolean
  planos_ok: boolean
  mensura_ok: boolean
  /** Listado de lo que falta cuando estado es rojo/amarillo */
  falta: string[]
  /** Detalle de qué está OK cuando estado es verde */
  detalle_verde: string[]
}

export function evaluarSalud(salud: Salud | null | undefined): SaludEvaluation {
  if (!salud) {
    return {
      estado: 'sin_datos',
      titulo_ok: false,
      planos_ok: false,
      mensura_ok: false,
      falta: [],
      detalle_verde: [],
    }
  }

  // Título: OK si Escritura O Boleto en Sí
  const tituloOk = salud.escritura === 'si' || salud.boleto === 'si'
  const tituloAnswered = salud.escritura !== null && salud.boleto !== null
  const tituloFail = tituloAnswered && salud.escritura === 'no' && salud.boleto === 'no'

  // Planos: OK si Sí
  const planosOk = salud.planos === 'si'
  const planosFail = salud.planos === 'no'

  // VEP/Mensura: OK si Sí o N/A
  const mensuraOk = salud.mensura === 'si' || salud.mensura === 'na'
  const mensuraFail = salud.mensura === 'no'

  let ok = 0
  if (tituloOk) ok++
  if (planosOk) ok++
  if (mensuraOk) ok++

  const algunoFail = tituloFail || planosFail || mensuraFail

  let estado: EstadoSalud = 'sin_datos'
  const falta: string[] = []
  const detalleVerde: string[] = []

  if (ok === 3) {
    estado = 'verde'
    if (salud.escritura === 'si' && salud.boleto === 'si') detalleVerde.push('Escritura + Boleto')
    else if (salud.escritura === 'si') detalleVerde.push('Escritura')
    else if (salud.boleto === 'si') detalleVerde.push('Boleto')
    detalleVerde.push('Planos')
    if (salud.mensura === 'si') detalleVerde.push('VEP/Mensura')
    else if (salud.mensura === 'na') detalleVerde.push('VEP/Mensura no aplica')
  } else if (algunoFail) {
    estado = ok === 2 ? 'amarillo' : 'rojo'
    if (!tituloOk && tituloAnswered) falta.push('Título (Escritura o Boleto)')
    if (!planosOk && salud.planos !== null) falta.push('Planos')
    if (!mensuraOk && salud.mensura !== null) falta.push('VEP o Mensura')
  } else {
    estado = 'sin_datos'
  }

  return {
    estado,
    titulo_ok: tituloOk,
    planos_ok: planosOk,
    mensura_ok: mensuraOk,
    falta,
    detalle_verde: detalleVerde,
  }
}

/** Subtítulo dinámico para el header de la sección Salud según estado. */
export function subtituloSalud(ev: SaludEvaluation): string {
  switch (ev.estado) {
    case 'verde':
      return 'Vendible · documentación esencial completa'
    case 'amarillo':
      return 'Casi vendible · falta poco'
    case 'rojo':
      return 'No vendible · faltan documentos esenciales'
    case 'sin_datos':
    default:
      return 'Sin datos cargados todavía'
  }
}

/** Texto de tooltip para las luces en el listado. */
export function tooltipSalud(ev: SaludEvaluation): string {
  switch (ev.estado) {
    case 'verde':
      return 'Salud del acuerdo · Vendible'
    case 'amarillo':
      return 'Salud del acuerdo · Casi vendible'
    case 'rojo':
      return 'Salud del acuerdo · No vendible'
    case 'sin_datos':
    default:
      return 'Salud del acuerdo · Sin datos cargados'
  }
}
