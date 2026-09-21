'use client'

import { useEffect, useMemo, useState } from 'react'
import { priorizarOperacion, type TokkoOperation, type TokkoProperty } from '@/lib/tokko'

type Foco = TokkoOperation['operation_type'] | null

function focoDeLaUrl(): Foco {
  const sp = new URLSearchParams(window.location.search)
  const op = (sp.get('operacion') ?? sp.get('op') ?? '').toLowerCase()
  if (op === 'alquiler') return 'Rent'
  if (op === 'venta') return 'Sale'
  return null
}

/**
 * La ficha de una propiedad en venta Y alquiler, vista por alguien que viene
 * buscando solo alquiler (o solo venta): la operación buscada pasa al frente,
 * así el alquiler muestra sus costos de ingreso y el link a la calculadora /
 * planilla igual que cualquier otro alquiler.
 *
 * El foco viaja en la URL (`?operacion=alquiler`): el panel de /propiedades
 * conserva el query del listado y las cards mobile lo agregan al link. Se lee
 * en un efecto y NO con useSearchParams/searchParams: la ficha es ISR y leer el
 * query en el server la volvería dinámica.
 */
export function usePropiedadConFoco(property: TokkoProperty): TokkoProperty {
  const [foco, setFoco] = useState<Foco>(null)
  useEffect(() => setFoco(focoDeLaUrl()), [property.id])
  return useMemo(() => priorizarOperacion(property, foco), [property, foco])
}
