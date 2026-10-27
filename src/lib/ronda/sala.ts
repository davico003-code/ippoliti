// Salas de la Ronda: una ronda aparte, con su propia grilla y sus pedidos, para
// una reunión con UNA inmobiliaria (David, 27-oct-2026: "necesito hacer una ronda
// especial para hoy para hacer el de Freguglia"). Se entra por /ronda/<sala>; la
// pantalla manda la sala en el encabezado `x-ronda-sala`. Las inmobiliarias y los
// agentes son los de la Ronda (el mismo registro sirve en las dos); lo publicado no
// se mezcla. Reglas de la sala = las del instructivo de la reunión: cada AGENTE
// presenta hasta 3 captaciones (David, 27-oct: "dejá subir hasta 3 propiedades por agente") y 2 búsquedas.

import { CIUDADES_DE_SIEMPRE, type CiudadRonda } from './reglas'

export interface Sala {
  id: string
  /** "Ronda con Freguglia" */
  nombre: string
  ciudades: CiudadRonda[]
  maxCaptacionesPorAgente: number
  maxPedidosPorAgente: number
}

export const SALAS: Record<string, Sala> = {
  freguglia: { id: 'freguglia', nombre: 'Ronda con Freguglia', ciudades: ['Funes', 'Rosario'], maxCaptacionesPorAgente: 3, maxPedidosPorAgente: 2 },
}

/** La sala del pedido; null = la Ronda de siempre. Una sala que no existe también es la de siempre. */
export function salaDe(req: Request): Sala | null {
  const id = String(req.headers.get('x-ronda-sala') ?? '').trim().toLowerCase()
  return SALAS[id] ?? null
}

/** Las ciudades que se pueden elegir: las de la sala o Funes y Roldán. */
export function ciudadesDe(sala: Sala | null): readonly CiudadRonda[] {
  return sala?.ciudades ?? CIUDADES_DE_SIEMPRE
}
