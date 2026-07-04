import type { TokkoProperty } from '@/lib/tokko'
import type { Barrio } from '@/lib/barrios'

const normalize = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    // Puntuación/símbolos → espacio, y colapsar. Así "Vida, Barrio cerrado -
    // Funes" y "Vida Barrio Cerrado" normalizan igual y el match no se rompe.
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

export function propertyMatchesBarrio(
  property: TokkoProperty,
  barrio: Barrio,
): boolean {
  if (
    barrio.tokko.developmentId &&
    property.development?.id?.toString() === barrio.tokko.developmentId
  ) {
    return true
  }

  if (
    barrio.tokko.customTag &&
    property.tags?.some(
      (t) => normalize(t.name) === normalize(barrio.tokko.customTag!),
    )
  ) {
    return true
  }

  if (barrio.tokko.matchByTitle?.length) {
    const haystack = normalize(
      `${property.publication_title ?? ''} ${property.address ?? ''} ${property.fake_address ?? ''}`,
    )
    return barrio.tokko.matchByTitle.some((needle) =>
      haystack.includes(normalize(needle)),
    )
  }

  return false
}
