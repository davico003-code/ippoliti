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
