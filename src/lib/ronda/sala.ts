// Salas de la Ronda: una ronda aparte, con su propia grilla y sus pedidos, para
// una reunión con UNA inmobiliaria (David, 27-oct-2026: "necesito hacer una ronda
// especial para hoy para hacer el de Freguglia"). Se entra por /ronda/<sala>; la
// pantalla manda la sala en el encabezado `x-ronda-sala`. Las inmobiliarias y los
// agentes son los de la Ronda (el mismo registro sirve en las dos); lo publicado no
// se mezcla. Reglas de la sala = las del instructivo de la reunión: cada AGENTE
// presenta hasta 3 captaciones (David, 27-oct: "dejá subir hasta 3 propiedades por agente") y 2 búsquedas.

import { CIUDADES_DE_SIEMPRE, sinTildes, type CiudadRonda } from './reglas'

export interface Sala {
  id: string
  /** "Ronda con Pérez" */
  nombre: string
  ciudades: CiudadRonda[]
  maxCaptacionesPorAgente: number
  maxPedidosPorAgente: number
  /** Las únicas inmobiliarias que entran (David, 27-oct: "dá la opción solo de 2 inmobiliarias"). */
  inmobiliarias: string[]
}

/**
 * Las salas abiertas. Hoy ninguna: la de Freguglia se dio de baja (David, 2-nov-2026:
 * "al final no lo usamos… dejalo listo para cuando hagamos con otra inmobiliaria").
 * Para abrir una, sumar la entrada ACÁ y la misma en SALAS de public/ronda/app.js
 * (la pantalla), y queda en verficha.casa/ronda/<id>. Ejemplo:
 *   perez: { id: 'perez', nombre: 'Ronda con Pérez', ciudades: ['Funes', 'Rosario'],
 *            maxCaptacionesPorAgente: 3, maxPedidosPorAgente: 2, inmobiliarias: ['SI INMOBILIARIA', 'Pérez'] },
 */
export const SALAS: Record<string, Sala> = {}

/** La sala del pedido; null = la Ronda de siempre. Una sala que no existe también es la de siempre. */
export function salaDe(req: Request): Sala | null {
  const id = String(req.headers.get('x-ronda-sala') ?? '').trim().toLowerCase()
  return SALAS[id] ?? null
}

/** El nombre oficial si la inmobiliaria entra en la sala ("Pérez Propiedades" → "Pérez"); null si no. Sin sala entran todas. */
export function inmobiliariaDeSala(sala: Sala | null, nombre: string): string | null {
  if (!sala) return nombre
  const n = sinTildes(nombre)
  return sala.inmobiliarias.find((i) => n === sinTildes(i) || n.includes(sinTildes(i))) ?? null
}

/** Lo que contesta el servidor a una inmobiliaria que no es de la sala. */
export const fueraDeSala = (sala: Sala) => `Esta ronda es solo para ${sala.inmobiliarias.join(' y ')}.`

/** Las ciudades que se pueden elegir: las de la sala o Funes y Roldán. */
export function ciudadesDe(sala: Sala | null): readonly CiudadRonda[] {
  return sala?.ciudades ?? CIUDADES_DE_SIEMPRE
}
