/**
 * Heurística para decidir si una búsqueda califica como "específica".
 *
 * Una búsqueda específica favorece la vista lista por default (mobile),
 * porque el usuario ya tiene una intención puntual y el mapa aporta menos
 * contexto. Una búsqueda amplia mantiene el mapa por default.
 *
 * Se considera específica si cumple AL MENOS UNO de:
 *   - El query contiene un número (sugiere altura de calle).
 *   - El query tiene 4 o más palabras.
 *   - El resultado del fetch devuelve 1 a 3 propiedades.
 */
export function isSpecificSearch(query: string, resultsCount: number): boolean {
  const trimmed = query.trim()
  if (!trimmed) return false

  const hasNumber = /\d+/.test(trimmed)
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length
  const hasFewResults = resultsCount > 0 && resultsCount <= 3

  return hasNumber || wordCount >= 4 || hasFewResults
}
