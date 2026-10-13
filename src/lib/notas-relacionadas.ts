/**
 * Las notas relacionadas de una nota: las siguientes de su categoría, en ronda
 * (después de la última viene la primera), y siempre la siguiente del blog
 * entero. Con "las 3 más nuevas de la categoría", todas linkeaban a las mismas
 * tres y el resto no recibía ningún link. Así TODA nota recibe al menos uno (el
 * de la anterior del blog), aunque esté sola en su categoría.
 */
export function notasRelacionadas<T extends { slug: string }>(slug: string, todas: T[], categoriaDe: (p: T) => string, n = 3): T[] {
  const yo = todas.find((p) => p.slug === slug)
  if (!yo) return todas.slice(0, n)
  const ronda = (lista: T[]) => {
    const i = lista.findIndex((p) => p.slug === slug)
    return [...lista.slice(i + 1), ...lista.slice(0, i)]
  }
  const categoria = categoriaDe(yo)
  const deCategoria = ronda(todas.filter((p) => categoriaDe(p) === categoria))
  const delBlog = ronda(todas)
  // La siguiente del blog tiene su lugar asegurado; el resto, de la categoría.
  const elegidas = delBlog.slice(0, 1)
  for (const p of [...deCategoria, ...delBlog]) {
    if (elegidas.length >= n) break
    if (!elegidas.includes(p)) elegidas.push(p)
  }
  // Primero las de la categoría (las más afines), como se leen en la página.
  return elegidas.sort((a, b) => Number(categoriaDe(b) === categoria) - Number(categoriaDe(a) === categoria))
}
