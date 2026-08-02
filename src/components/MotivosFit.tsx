'use client'

// Por qué esta propiedad aparece en la búsqueda que la persona armó.
//
// Es lo que diferencia al asistente de un filtro más: en vez de devolver una
// lista muda, cada propiedad dice qué cumple ("3 dormitorios", "dentro de tu
// presupuesto") y qué no ("excede 7% tu presupuesto"). El que mira entiende por
// qué está viendo eso y confía en el orden.
//
// Se muestra debajo de la card y solo con el asistente activo.

import { Check, AlertCircle } from 'lucide-react'
import type { TokkoProperty } from '@/lib/tokko'
import { scorePropertyFit, type SmartProfile } from '@/lib/property-fit'

const VERDE = '#1A5C38'

export default function MotivosFit({
  property,
  profile,
}: {
  property: TokkoProperty
  profile: SmartProfile
}) {
  const fit = scorePropertyFit(property, profile)
  // Sin nada que decir no ponemos una tira vacía debajo de la card.
  if (fit.reasons.length === 0 && fit.caveats.length === 0) return null

  // Se muestran tres motivos, así que importa cuáles. El del presupuesto es el
  // que más pesa en la decisión y venía último en el orden en que se generan:
  // en las propiedades que SÍ entraban justo se cortaba, y quedaban a la vista
  // solo "está en una de tus zonas" y "tipología pedida", que dicen menos.
  const prioridad = (texto: string) =>
    /presupuesto|debajo de tu tope/i.test(texto) ? 0
      : /dormitorio|m²|superficie/i.test(texto) ? 1
        : 2
  const motivos = [...fit.reasons].sort((a, b) => prioridad(a) - prioridad(b))

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 px-1 pb-2">
      {motivos.slice(0, 3).map(motivo => (
        <span key={motivo} className="inline-flex items-center gap-1 text-[12px]" style={{ color: VERDE }}>
          <Check className="h-3 w-3 shrink-0" aria-hidden />
          {motivo}
        </span>
      ))}
      {fit.caveats.slice(0, 2).map(pero => (
        <span key={pero} className="inline-flex items-center gap-1 text-[12px] text-[#8a5a12]">
          <AlertCircle className="h-3 w-3 shrink-0" aria-hidden />
          {pero}
        </span>
      ))}
    </div>
  )
}
