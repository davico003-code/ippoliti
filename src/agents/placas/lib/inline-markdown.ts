// Parser mínimo de marcadores inline `*italic*` y `**bold**` dentro de un
// string. Devuelve un array de fragmentos con su estilo que los bloques
// pueden renderizar como spans con Satori-compatible inline styles.
//
// Soporta:
//   - **texto** → bold
//   - *texto*   → italic
//   - Escapa \* como asterisco literal
//
// NO soporta:
//   - _underline_, ~strike~, [links], ``code``
//   - Anidamiento (ej: ***bolditalic***)
//
// Se parsea greedy de izq a der. Casos raros como `**foo *bar* baz**`
// priorizan el **bold** y dejan el `*bar*` literal adentro.

export type Fragmento =
  | { kind: 'text'; texto: string }
  | { kind: 'bold'; texto: string }
  | { kind: 'italic'; texto: string }

const BOLD_RE = /\*\*(.+?)\*\*/
const ITALIC_RE = /\*(.+?)\*/

export function parseInlineMarkdown(input: string): Fragmento[] {
  const result: Fragmento[] = []
  let remaining = input

  while (remaining.length > 0) {
    // Intentamos matchear bold primero (es más específico — ** antes que *)
    const boldMatch = remaining.match(BOLD_RE)
    const italicMatch = remaining.match(ITALIC_RE)

    // Decidimos qué viene antes
    const boldIdx = boldMatch?.index ?? Infinity
    const italicIdx = italicMatch?.index ?? Infinity

    if (boldIdx === Infinity && italicIdx === Infinity) {
      // No hay más marcadores — el resto es texto plano
      result.push({ kind: 'text', texto: remaining })
      break
    }

    if (boldIdx <= italicIdx) {
      // Hay bold antes (o ambos empiezan en el mismo lugar → bold gana)
      if (boldIdx > 0) {
        result.push({ kind: 'text', texto: remaining.slice(0, boldIdx) })
      }
      result.push({ kind: 'bold', texto: boldMatch![1] })
      remaining = remaining.slice(boldIdx + boldMatch![0].length)
    } else {
      // Italic viene antes
      if (italicIdx > 0) {
        result.push({ kind: 'text', texto: remaining.slice(0, italicIdx) })
      }
      result.push({ kind: 'italic', texto: italicMatch![1] })
      remaining = remaining.slice(italicIdx + italicMatch![0].length)
    }
  }

  return result.filter(f => f.texto.length > 0)
}
