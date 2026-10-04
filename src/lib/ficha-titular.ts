// Titular de la ficha neutra: el primer título de la descripción, si es un
// titular de verdad ("Amplitud, calidad y patio en el corazón de Pichincha"),
// y no un encabezado de sección ("Planta baja", "Amenities").
//
// Muchos agentes lo cargan EN MAYÚSCULAS. Se pasa a oración y se recuperan las
// mayúsculas de los nombres propios que la misma descripción escribe con
// mayúscula a mitad de frase (Pichincha, Funes, Kentucky…) y de la zona.

import { formatDescription } from './formatDescription'

const NO_TITULAR =
  /^(planta|terminaciones|equipamiento|amenities|servicios|comodidades|distribuci|detalles?\b|caracter[ií]sticas|el edificio|el barrio|la propiedad|ubicaci|observaci|superficies?|antig[uü]edad|garant[ií]as?|expensas|m[eé]todo de pago|etapa|condiciones|contrato|dormitorios|cocina|living|ba[nñ]os)/i

const SIGLAS = new Set(['PH', 'SUM', 'USD', 'ARS', 'UF', 'GNC'])

function capitalizar(w: string): string {
  return w.charAt(0).toLocaleUpperCase('es') + w.slice(1)
}

export function aOracion(titulo: string, cuerpo: string, zonas: string[]): string {
  const t = titulo.trim().replace(/[.:]+$/, '')
  if (/[a-záéíóúüñ]/.test(t)) return t

  // Palabras que el cuerpo escribe Capitalizadas a mitad de frase = nombres propios.
  const propios = new Set<string>()
  const re = /(?<=[a-záéíóúüñ0-9,;] )([A-ZÁÉÍÓÚÑ][a-záéíóúüñ]+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(cuerpo))) propios.add(m[1].toLocaleLowerCase('es'))
  for (const z of zonas) {
    for (const w of z.split(/[\s,]+/)) if (w.length > 2) propios.add(w.toLocaleLowerCase('es'))
  }

  const palabras = t.split(/(\s+)/)
  return palabras
    .map((w, i) => {
      if (/^\s+$/.test(w)) return w
      const limpia = w.replace(/[^A-ZÁÉÍÓÚÜÑ]/gi, '')
      if (SIGLAS.has(limpia)) return w
      const baja = w.toLocaleLowerCase('es')
      if (i === 0 || propios.has(baja.replace(/[^a-záéíóúüñ]/g, ''))) return capitalizar(baja)
      return baja
    })
    .join('')
}

export function titularDeDescripcion(descripcion: string, zonas: string[]): string | null {
  const bloques = formatDescription(descripcion)
  const primero = bloques[0]
  if (!primero || primero.type !== 'title') return null
  const t = primero.content.trim()
  if (t.length < 15 || t.length > 90 || NO_TITULAR.test(t)) return null
  return aOracion(t, descripcion, zonas)
}

// ── Texto neutro ────────────────────────────────────────────────────────────
// La ficha neutra (verficha.casa) la ven colegas y sus clientes: NADA que
// invite a contactar ni que muestre marca, matrícula o teléfono (David, 3-oct:
// "si le mando una ficha neutra es porque no se pueden contactar conmigo").
// Las descripciones vienen escritas para la web propia y 1 de cada 6 cerraba
// con "Consultanos para coordinar una visita" o "Gestiones a cargo de CI Susana
// Ippoliti mat. 0559…" (medido 4-oct sobre las 673 fichas vivas). Se saca la
// ORACIÓN entera que invita a contactar o trae marca/teléfono; el resto queda.

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
