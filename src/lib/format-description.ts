/**
 * Parser de descripciones de Tokko CRM.
 * Convierte texto crudo (con \n, -, *, mayúsculas, etc.) en HTML limpio.
 * Uso: dangerouslySetInnerHTML={{ __html: formatDescripcion(rawText) }}
 */
export function formatDescripcion(raw: string): string {
  if (!raw || !raw.trim()) return ''

  const text = raw
    // Normalizar saltos de línea
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Sanitizar HTML peligroso
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')

  // Separar en párrafos por doble salto o más
  const blocks = text.split(/\n{2,}/).map(b => b.trim()).filter(Boolean)

  const html = blocks.map(block => {
    // Detectar líneas tipo título (todo mayúsculas, corto, sin punto)
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean)

    if (lines.length === 1) {
      const line = lines[0]
      // Título si es todo mayúsculas (>3 chars) y no termina en punto
      if (line.length > 3 && line.length < 100 && line === line.toUpperCase() && !line.endsWith('.')) {
        return `<h3 class="font-bold text-[#111] text-base mt-4 mb-2" style="font-family:'Raleway',sans-serif">${escapeHtml(toTitleCase(line))}</h3>`
      }
    }

    // Detectar listas (líneas que empiezan con -, *, •, ✓, ✔)
    const isList = lines.every(l => /^[-*•✓✔]\s/.test(l))
    if (isList) {
      const items = lines.map(l => {
        const content = l.replace(/^[-*•✓✔]\s+/, '')
        return `<li>${formatInline(content)}</li>`
      })
      return `<ul class="list-disc list-inside space-y-1 my-2">${items.join('')}</ul>`
    }

    // Párrafo normal
    const content = lines.map(l => formatInline(l)).join('<br/>')
    return `<p class="mb-3">${content}</p>`
  }).join('')

  return html
}

function formatInline(text: string): string {
  let s = escapeHtml(text)
  // Bold: **texto** o texto entre asteriscos
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  // Negrita para patrones comunes de Tokko: "DORMITORIOS:", "SUPERFICIE:", etc.
  s = s.replace(/^([A-ZÁÉÍÓÚÑ\s]{3,}):/, (_, label) =>
    `<strong>${toTitleCase(label)}:</strong>`)
  return s
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function toTitleCase(s: string): string {
  return s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}
