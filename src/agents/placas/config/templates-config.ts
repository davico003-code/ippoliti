// Registro de templates — mapping tipo → componente JSX.
//
// Cada template exporta una función `render{Tipo}(props): ReactNode` que el
// renderer llama con el contenido tipado. Este archivo es la tabla que une
// el discriminated union de PlacaExtraida con el componente concreto.
//
// Se completa a medida que se crean los templates (paso 2 en adelante).

import type { ReactNode } from 'react'
import type { PlacaExtraida, TipoPlaca } from '../types'

/** Cada template recibe la placa tipada y devuelve el árbol JSX para Satori. */
export type TemplateRenderer<T extends TipoPlaca = TipoPlaca> = (
  placa: Extract<PlacaExtraida, { tipo: T }>,
) => ReactNode

/**
 * Registro global. Se va llenando en los próximos pasos.
 * Dejar `null` en los que faltan para que el renderer pueda detectar
 * tipos aún no implementados y fallar con un error claro.
 */
export const TEMPLATES: { [K in TipoPlaca]: TemplateRenderer<K> | null } = {
  portada: null,
  'dato-numero': null,
  'dato-lista': null,
  'dato-shock': null,
  'cita-editorial': null,
  comparativa: null,
  grafico: null,
  'imagen-dato': null,
  'cta-final': null,
}

/** Helper para el renderer: trae el template o explota si no existe. */
export function getTemplate<T extends TipoPlaca>(tipo: T): TemplateRenderer<T> {
  const template = TEMPLATES[tipo]
  if (!template) {
    throw new Error(
      `[placas/templates] Template "${tipo}" no está implementado todavía. ` +
        `Revisar src/agents/placas/templates/${tipo}.tsx`,
    )
  }
  return template as TemplateRenderer<T>
}
