// Correcciones de datos del CRM aplicadas al vuelo.
//
// A veces una propiedad queda cargada con un tipo equivocado (un departamento
// tipificado como casa, por ejemplo). Eso rompe los filtros de /propiedades, la
// agrupación por edificio y el copy de las cards. Corregirlo en el CRM es lo
// ideal —así viaja también a los portales—, pero hasta que eso pase acá
// dejamos la web mostrando el dato correcto.
//
// Cada entrada debería tener fecha y motivo, y borrarse cuando el CRM se
// corrige. Si el CRM ya manda el valor correcto, el override no hace daño:
// simplemente escribe lo mismo.

export interface CorreccionTipo {
  /** id del tipo correcto en el catálogo del CRM. */
  typeId: number
  /** code y name del catálogo, para que el resto de la web los traduzca igual. */
  typeCode: string
  typeName: string
  /** Por qué se corrige (queda documentado para poder revertir). */
  motivo: string
}

// id de propiedad → tipo correcto.
export const TIPO_CORREGIDO: Record<number, CorreccionTipo> = {
  // Depto de 3 dormitorios en Juan Manuel de Rosas 2348, cargado como House.
  // Al estar mal tipificado no aparecía en el filtro de departamentos ni se
  // agrupaba con las otras unidades del mismo edificio. (jul-2026)
  900000346: {
    typeId: 2,
    typeCode: 'AP',
    typeName: 'Apartment',
    motivo: 'Departamento cargado como casa en el CRM',
  },
}

/**
 * Aplica la corrección de tipo, si la hay. Muta la propiedad recibida (se usa
 * dentro de sanitizeProperty, sobre un objeto ya reconstruido).
 */
export function corregirTipo<
  T extends { id: number; type: { id: number; code: string; name: string } },
>(property: T): T {
  const fix = TIPO_CORREGIDO[property.id]
  if (!fix || !property.type) return property
  property.type = { id: fix.typeId, code: fix.typeCode, name: fix.typeName }
  return property
}
