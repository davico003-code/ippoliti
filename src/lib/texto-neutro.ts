// Texto neutro de la ficha: la ficha neutra (verficha.casa) la ven colegas y sus clientes: NADA que
// invite a contactar ni que muestre marca, matrícula o teléfono (David, 3-oct:
// "si le mando una ficha neutra es porque no se pueden contactar conmigo").
// Las descripciones vienen escritas para la web propia y 1 de cada 6 cerraba
// con "Consultanos para coordinar una visita" o "Gestiones a cargo de CI Susana
// Ippoliti mat. 0559…" (medido 4-oct sobre las 673 fichas vivas). Se saca la
// ORACIÓN entera que invita a contactar o trae marca/teléfono; el resto queda.
//
// Sin imports a propósito: los tests (node --test) cargan este .ts con el
// type-stripping de Node, que no resuelve imports relativos sin extensión.

const MARCA = /susana\s+ippoliti|david\s+flores|si\s+inmobiliaria|siinmobiliaria|@davidflores|@inmobiliaria\.si|\bcocir\b|gestiones\s+a\s+cargo|\b(?:mat\.|matr[ií]cula)\s*(?:n[°º.]?\s*)?\d{3,5}\b/i

const LLAMADO_INICIO =
  /^[^a-záéíóúñ]*(?:consult(?:a|á)(?:nos|me|r|lo|la)?\b|consulte\b|contact(?:a|á)(?:nos|me|te)\b|escrib(?:i|í)(?:nos|me)\b|llam(?:a|á)(?:nos|me)\b|agend(?:a|á)\b|coordin(?:a|á)\s+tu\b)/i

const LLAMADO =
  /comunic(?:a|á)te|comunicarse|contactarnos|contactarte|ponerte en contacto|no dud(?:e|es) en|\bcontacto\s*:|whats\s?app|\bwsp\b|consult\w*\s+(?:al|con)\s+(?:el\s+)?(?:corredor|nuestro|nosotros|asesor|equipo)|coordin(?:ar|á|a)\s+(?:una|tu|la)\s+visita|agend(?:ar|á|a)\s+(?:una|tu)\s+visita|program(?:ar|á)\s+una\s+visita|\bver datos\b/i

// Teléfono: 10 a 13 dígitos seguidos (con espacios, guiones o paréntesis).
// Los montos con puntos de miles ("$ 1.500.000.000") no cuentan, y una lista
// de medidas ("120 150 200 300 m²") tampoco: sin "+54" adelante, un teléfono
// va en 3 grupos como mucho ("0341 155 123456").
function tieneTelefono(s: string): boolean {
  const candidatos = s.match(/\+?\d[\d\s()-]{8,}\d/g) ?? []
  return candidatos.some(c => {
    const digitos = c.replace(/\D/g, '')
    if (digitos.length < 10 || digitos.length > 13) return false
    if (c.startsWith('+') || digitos.startsWith('54')) return true
    return c.trim().split(/[\s()-]+/).filter(Boolean).length <= 3
  })
}

function oracionDeContacto(o: string): boolean {
  return LLAMADO_INICIO.test(o) || LLAMADO.test(o) || MARCA.test(o) || tieneTelefono(o)
}

export function limpiarTextoNeutro(texto: string | null | undefined): string {
  if (!texto) return ''
  const lineas = texto.split('\n').map(linea => {
    if (!linea.trim()) return linea
    // Corta oraciones antes de mayúscula, emoji o "¡" (no antes de minúscula ni
    // de número: "mat. 0559" o "aprox. 300 m²" no son fin de oración).
    const oraciones = linea.split(/(?<=[.!?])\s+(?![a-záéíóúñ0-9])/)
    const quedan = oraciones
      .filter(o => !oracionDeContacto(o))
      .map(o =>
        o
          .replace(/\s*\(\s*consult[^)]*\)/gi, '')
          .replace(/,?\s+consultar\s*\.?\s*$/i, ''),
      )
      .filter(o => o.trim())
    return quedan.length ? quedan.join(' ') : null
  })
  return lineas
    .filter((l): l is string => l !== null)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
