// Carga de los temporarios publicados (sección /alquileres-temporarios y la
// fila de la home). La lista del feed viene sin descripción, y de ella salen
// los precios por quincena/mes y las condiciones: se trae la ficha de cada una
// (son pocas; el fetch de la ficha queda cacheado 1 h).
import {
  getProperties,
  getPropertyById,
  sanitizeProperty,
  getDescription,
  type TokkoProperty,
} from './tokko'
import { leerCondicionesTemporario, type CondicionesTemporario } from './temporarios'

export type Temporario = { property: TokkoProperty; condiciones: CondicionesTemporario }

export async function cargarTemporarios(limite = 60): Promise<Temporario[]> {
  let lista: TokkoProperty[] = []
  try {
    const data = await getProperties({ operation: 'Temporary rent', limit: limite })
    lista = data.objects ?? []
  } catch {
    return []
  }
  const fichas = await Promise.all(
    lista.map(async (p) => {
      try {
        return sanitizeProperty(await getPropertyById(p.id))
      } catch {
        return sanitizeProperty(p)
      }
    }),
  )
  return fichas.map((property) => {
    const op = property.operations?.find((o) => o.operation_type === 'Temporary rent')
    const pr = op?.prices?.[0]
    const precioFeed =
      property.web_price !== false && pr && pr.price > 0 ? `${pr.currency} ${pr.price.toLocaleString('es-AR')}` : null
    return { property, condiciones: leerCondicionesTemporario(getDescription(property), precioFeed) }
  })
}

/** Noviembre a febrero: temporada de verano (la fila de la home sube). */
export function esTemporadaVerano(fecha = new Date()): boolean {
  const mes = Number(new Intl.DateTimeFormat('en-US', { month: 'numeric', timeZone: 'America/Argentina/Buenos_Aires' }).format(fecha))
  return mes >= 11 || mes <= 2
}
