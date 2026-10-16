// Títulos y descripciones a la medida de Google.
//
// Google corta el título en ~60 caracteres y la descripción en ~160, y desde
// 2022 muestra el nombre del sitio ("SI INMOBILIARIA", del JSON-LD WebSite)
// arriba de cada resultado. Revisión 16-oct: 661 de 779 títulos pasaban de 65
// (la marca al final se comía lo importante) y 393 descripciones de 165.

const MARCA = ' | SI INMOBILIARIA'
export const LARGO_TITULO = 60
export const LARGO_DESCRIPCION = 160

/** La marca va solo si entra entera; si no, queda el título solo. */
export function tituloConMarca(titulo: string): string {
  const t = titulo.trim()
  return t.length + MARCA.length <= LARGO_TITULO ? `${t}${MARCA}` : t
}

/** Corta antes del límite: en el último punto si deja al menos 60 % del texto;
 *  si no, en la última palabra entera, con "…". */
export function recortarDescripcion(texto: string, max = LARGO_DESCRIPCION): string {
  const t = texto.replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  const corte = t.slice(0, max - 1)
  const punto = corte.lastIndexOf('. ')
  if (punto >= max * 0.6) return corte.slice(0, punto + 1)
  const espacio = corte.lastIndexOf(' ')
  return `${(espacio > 0 ? corte.slice(0, espacio) : corte).replace(/[\s,.;:·–—-]+$/, '')}…`
}
