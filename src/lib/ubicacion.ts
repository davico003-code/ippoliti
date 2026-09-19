// Ubicación legible de una propiedad: "Barrio, Ciudad" (o sólo "Ciudad").
//
// El path de Tokko/HILO (location.full_location / short_location) no tiene una
// forma fija: según cómo se cargó la propiedad trae "Santa Fe | San Lorenzo |
// Roldan" (provincia | departamento | ciudad), "Argentina | Santa Fe | Roldán"
// (país | provincia | ciudad) o "Santa Fe | Funes | Kentucky" (… | ciudad |
// barrio). Tomar las dos últimas partes daba departamento o provincia en lugar
// de barrio ("Roldan, San Lorenzo", "Roldán, Santa Fe", "Rosario, Rosario").
// Acá se resuelve el path a mano: la última parte que sea una ciudad conocida
// del corredor manda, y lo que venga después de una ciudad es el barrio.

/** Cualquier objeto con el location de Tokko (propiedad completa o proyectada). */
export interface ConUbicacion {
  location?: {
    name?: string | null
    short_location?: string | null
    full_location?: string | null
  } | null
}

const CIUDADES: Record<string, string> = {
  roldan: 'Roldán',
  funes: 'Funes',
  rosario: 'Rosario',
  perez: 'Pérez',
  'san lorenzo': 'San Lorenzo',
  'granadero baigorria': 'Granadero Baigorria',
  ibarlucea: 'Ibarlucea',
  'villa gobernador galvez': 'Villa Gobernador Gálvez',
  'capitan bermudez': 'Capitán Bermúdez',
  'fray luis beltran': 'Fray Luis Beltrán',
  'puerto general san martin': 'Puerto General San Martín',
  'arroyo seco': 'Arroyo Seco',
  'luis palacios': 'Luis Palacios',
  carcarana: 'Carcarañá',
  zavalla: 'Zavalla',
  soldini: 'Soldini',
  alvear: 'Alvear',
  pinero: 'Piñero',
  ricardone: 'Ricardone',
  timbues: 'Timbúes',
}

// País y provincia no son ubicación útil para mostrar.
const NO_ES_LUGAR = new Set(['argentina', 'santa fe', 'provincia de santa fe'])

// Barrios que en el CRM están cargados sin tilde (o con el nombre corto).
// Sólo corrige la escritura: no inventa barrios que la propiedad no tenga.
export const BARRIOS_CANONICOS: Record<string, string> = {
  'san sebastian': 'San Sebastián',
  'tierra de suenos': 'Tierra de Sueños',
  'tierra de suenos 1': 'Tierra de Sueños 1',
  'tierra de suenos 2': 'Tierra de Sueños 2',
  'tierra de suenos 3': 'Tierra de Sueños 3',
  'area industrial roldan': 'Área Industrial Roldán',
  'el charquito': 'El Charquito',
  'funes hills san marino': 'Funes Hills San Marino',
  'funes hills cadaques': 'Funes Hills Cadaqués',
}

export function normUbicacion(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

export function resolverUbicacion(p: ConUbicacion): {
  barrio: string | null
  ciudad: string | null
} {
  const loc = p.location
  const path = loc?.full_location || loc?.short_location || loc?.name || ''
  const partes: string[] = []
  for (const parte of path.split('|').map((s) => s.trim())) {
    if (!parte || NO_ES_LUGAR.has(normUbicacion(parte))) continue
    // "Santa Fe | Rosario | Rosario" → una sola Rosario.
    if (partes.length && normUbicacion(partes[partes.length - 1]) === normUbicacion(parte)) continue
    partes.push(parte)
  }
  if (!partes.length) return { barrio: null, ciudad: null }
  const ultima = partes[partes.length - 1]
  const barrioDe = (s: string) => BARRIOS_CANONICOS[normUbicacion(s)] ?? s

  // La última ciudad conocida del path manda y el barrio es la parte más
  // específica que venga después ("Funes | Countries/B. Cerrado (Funes) | Vida
  // Crystal Lagoon" → Vida Crystal Lagoon, Funes: el nivel del medio es una
  // categoría de Tokko, no un barrio). Si la ciudad es la última parte no hay
  // barrio cargado, y lo anterior es el departamento ("San Lorenzo" en "Santa
  // Fe | San Lorenzo | Roldan").
  for (let i = partes.length - 1; i >= 0; i--) {
    const ciudad = CIUDADES[normUbicacion(partes[i])]
    if (ciudad) return { barrio: i < partes.length - 1 ? barrioDe(ultima) : null, ciudad }
  }

  // Fuera del corredor: la última parte es la localidad o el barrio, y la
  // anterior lo que la contiene ("Victoria, Entre Ríos").
  const anterior = partes.length > 1 ? partes[partes.length - 2] : null
  return { barrio: barrioDe(ultima), ciudad: anterior }
}

/**
 * "Barrio, Ciudad" (o "Ciudad" si no hay barrio cargado; "" si no hay nada).
 * Con `junto` (la dirección que se muestra al lado) omite lo que esa dirección
 * ya dice: "Catamarca 755 /Roldán" + "Roldán" no repite la ciudad.
 */
export function formatUbicacion(p: ConUbicacion, junto?: string | null): string {
  const { barrio, ciudad } = resolverUbicacion(p)
  const yaDice = new Set(
    (junto ?? '')
      .split(/\s*[,/|]\s*|\s+[-–—]\s+/)
      .map((s) => normUbicacion(s).replace(/\.+$/, ''))
      .filter(Boolean),
  )
  return [barrio, ciudad]
    .filter((v): v is string => !!v && !yaDice.has(normUbicacion(v)))
    .join(', ')
}

/**
 * "Dirección, Barrio, Ciudad" en una sola línea y sin repetir: la dirección
 * cargada suele traer el barrio y la ciudad adentro ("Los Mistoles 3200 -
 * Barrio Don Mateo - Funes."), así que se parte, se descartan provincia/ciudad
 * y lo que ya diga el barrio, y la calle con número va primero.
 */
export function formatDireccionCompleta(p: ConUbicacion, direccion?: string | null, sep = ', '): string {
  const { barrio, ciudad } = resolverUbicacion(p)
  const clave = (s: string) =>
    normUbicacion(s).replace(/\.+$/, '').replace(/^barrio( cerrado| privado)?\b/, '').trim()
  // "Vida Lagoon" ≈ "Vida Crystal Lagoon", "Kentucky Club de Campo" ≈ "Kentucky":
  // si las palabras de uno están todas en el otro, es el mismo lugar.
  // La ciudad sólo se omite si ya está tal cual ("Funes Lakes" no dice Funes).
  const incluido = (a: string, b: string) => {
    const enB = b.split(' ')
    return a.split(' ').every((w) => enB.includes(w))
  }
  const vistos: string[] = []
  const partes: string[] = []
  const segs = (direccion ?? '')
    .split(/\s*[,/|]\s*|\s+[-–—]\s+/)
    .map((s) => s.trim().replace(/\.+$/, '').replace(/^barrio (cerrado|privado)\s+/i, ''))
    .filter(Boolean)
    .filter((s) => {
      const n = normUbicacion(s)
      return !NO_ES_LUGAR.has(n) && !CIUDADES[n] && clave(s) !== ''
    })
  // Calle con número adelante ("Rosario - Centro - Av. Belgrano al 900").
  segs.sort((a, b) => Number(/\d/.test(b)) - Number(/\d/.test(a)))
  for (const s of [...segs, barrio, ciudad]) {
    if (!s) continue
    const k = clave(s)
    const repetido = s === ciudad
      ? vistos.includes(k)
      : vistos.some((v) => incluido(k, v) || incluido(v, k))
    if (!k || repetido) continue
    vistos.push(k)
    partes.push(s)
  }
  return partes.join(sep)
}
