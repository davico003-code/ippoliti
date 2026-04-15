export interface Zona {
  id: string
  nombre: string
  ciudad: 'Funes' | 'Roldán' | 'Rosario'
  tipo: 'barrio' | 'barrio_cerrado' | 'zona'
  centro: { lat: number; lng: number }
  bounds?: { north: number; south: number; east: number; west: number }
  poligono?: [number, number][]
  aliases?: string[]
}

// ─── FUNES ──────────────────────────────────────────────────────────────────────

const FUNES: Zona[] = [
  // Barrios cerrados / countries
  {
    id: 'funes-kentucky',
    nombre: 'Kentucky Club de Campo',
    ciudad: 'Funes',
    tipo: 'barrio_cerrado',
    centro: { lat: -32.9230, lng: -60.8310 },
    aliases: ['Kentucky', 'KCC'],
  },
  {
    id: 'funes-tds1',
    nombre: 'Tierra de Sueños 1',
    ciudad: 'Funes',
    tipo: 'barrio_cerrado',
    centro: { lat: -32.9195, lng: -60.8425 },
    aliases: ['TDS1', 'Tierra de Sueños', 'TDS 1'],
  },
  {
    id: 'funes-tds2',
    nombre: 'Tierra de Sueños 2',
    ciudad: 'Funes',
    tipo: 'barrio_cerrado',
    centro: { lat: -32.9160, lng: -60.8470 },
    aliases: ['TDS2', 'TDS 2'],
  },
  {
    id: 'funes-tds3',
    nombre: 'Tierra de Sueños 3',
    ciudad: 'Funes',
    tipo: 'barrio_cerrado',
    centro: { lat: -32.9130, lng: -60.8510 },
    aliases: ['TDS3', 'TDS 3'],
  },
  {
    id: 'funes-hills-san-marino',
    nombre: 'Funes Hills San Marino',
    ciudad: 'Funes',
    tipo: 'barrio_cerrado',
    centro: { lat: -32.9050, lng: -60.8240 },
    aliases: ['San Marino', 'Funes Hills'],
  },
  {
    id: 'funes-hills-miraflores',
    nombre: 'Funes Hills Miraflores',
    ciudad: 'Funes',
    tipo: 'barrio_cerrado',
    centro: { lat: -32.9020, lng: -60.8195 },
    aliases: ['Miraflores'],
  },
  {
    id: 'funes-hills-la-catalina',
    nombre: 'Funes Hills La Catalina',
    ciudad: 'Funes',
    tipo: 'barrio_cerrado',
    centro: { lat: -32.9080, lng: -60.8170 },
    aliases: ['La Catalina'],
  },
  {
    id: 'funes-city',
    nombre: 'Funes City',
    ciudad: 'Funes',
    tipo: 'barrio_cerrado',
    centro: { lat: -32.9175, lng: -60.8080 },
    aliases: [],
  },
  {
    id: 'funes-aldea',
    nombre: 'Aldea',
    ciudad: 'Funes',
    tipo: 'barrio_cerrado',
    centro: { lat: -32.9260, lng: -60.8190 },
    aliases: ['Aldea Funes'],
  },
  {
    id: 'funes-los-pasos',
    nombre: 'Los Pasos',
    ciudad: 'Funes',
    tipo: 'barrio_cerrado',
    centro: { lat: -32.9205, lng: -60.8250 },
    aliases: [],
  },
  {
    id: 'funes-santa-catalina',
    nombre: 'Santa Catalina',
    ciudad: 'Funes',
    tipo: 'barrio_cerrado',
    centro: { lat: -32.9100, lng: -60.8300 },
    aliases: [],
  },
  {
    id: 'funes-la-lomada',
    nombre: 'La Lomada',
    ciudad: 'Funes',
    tipo: 'barrio_cerrado',
    centro: { lat: -32.9140, lng: -60.8360 },
    aliases: [],
  },
  {
    // Vida 3 — Rossetti Desarrollos, 150 ha noroeste Funes, límite Roldán
    id: 'funes-vida-lagoon',
    nombre: 'Vida Lagoon',
    ciudad: 'Funes',
    tipo: 'barrio_cerrado',
    centro: { lat: -32.9070, lng: -60.8400 },
    aliases: ['Vida', 'Lagoon', 'Vida 3', 'Vida III', 'Vida Crystal Lagoon', 'Crystal Lagoon'],
  },
  {
    // Vida 1 — Rossetti Desarrollos, Av. Arturo Illia, límite Rosario
    id: 'funes-vida-club-de-campo',
    nombre: 'Vida Club de Campo',
    ciudad: 'Funes',
    tipo: 'barrio_cerrado',
    centro: { lat: -32.9320, lng: -60.7830 },
    aliases: ['Vida', 'Vida Club', 'Vida 1', 'Vida I', 'Barrio Vida'],
  },
  {
    // Vida 2 — Rossetti Desarrollos, zona norte Funes, Mitre y Colonos de Funes
    id: 'funes-vida-green',
    nombre: 'Vida Green',
    ciudad: 'Funes',
    tipo: 'barrio_cerrado',
    centro: { lat: -32.8950, lng: -60.8150 },
    aliases: ['Vida', 'Green', 'Vida 2', 'Vida II'],
  },
  {
    // Subdivision de Funes Hills (Tokko la clasifica así)
    id: 'funes-cadaques',
    nombre: 'Cadaques',
    ciudad: 'Funes',
    tipo: 'barrio_cerrado',
    centro: { lat: -32.9100, lng: -60.8280 },
    aliases: ['Cadaques Funes Hills', 'Cadaqués'],
  },
  {
    id: 'funes-carlos-pellegrini',
    nombre: 'Carlos Pellegrini',
    ciudad: 'Funes',
    tipo: 'barrio_cerrado',
    centro: { lat: -32.9150, lng: -60.8130 },
    aliases: ['Pellegrini'],
  },
  {
    id: 'funes-quintas-del-norte',
    nombre: 'Quintas del Norte',
    ciudad: 'Funes',
    tipo: 'barrio_cerrado',
    centro: { lat: -32.8980, lng: -60.8200 },
    aliases: ['Quintas'],
  },
  {
    id: 'funes-las-glorietas',
    nombre: 'Las Glorietas',
    ciudad: 'Funes',
    tipo: 'barrio_cerrado',
    centro: { lat: -32.9120, lng: -60.8050 },
    aliases: ['Glorietas'],
  },
  {
    id: 'funes-solares',
    nombre: 'Solares de Funes',
    ciudad: 'Funes',
    tipo: 'barrio_cerrado',
    centro: { lat: -32.9185, lng: -60.8150 },
    aliases: ['Solares'],
  },
  {
    id: 'funes-comarca',
    nombre: 'Comarca Funes',
    ciudad: 'Funes',
    tipo: 'barrio_cerrado',
    centro: { lat: -32.9210, lng: -60.8100 },
    aliases: ['Comarca'],
  },
  {
    id: 'funes-san-sebastian',
    nombre: 'San Sebastián',
    ciudad: 'Funes',
    tipo: 'barrio_cerrado',
    centro: { lat: -32.9090, lng: -60.8350 },
    aliases: [],
  },
  {
    id: 'funes-los-aromos',
    nombre: 'Los Aromos',
    ciudad: 'Funes',
    tipo: 'barrio_cerrado',
    centro: { lat: -32.9250, lng: -60.8380 },
    aliases: ['Aromos'],
  },
  {
    id: 'funes-don-mateo',
    nombre: 'Don Mateo',
    ciudad: 'Funes',
    tipo: 'barrio_cerrado',
    centro: { lat: -32.9170, lng: -60.8400 },
    aliases: [],
  },
  {
    id: 'funes-el-molino',
    nombre: 'El Molino',
    ciudad: 'Funes',
    tipo: 'barrio_cerrado',
    centro: { lat: -32.9200, lng: -60.8450 },
    aliases: ['Molino'],
  },
  {
    id: 'funes-funes-lakes',
    nombre: 'Funes Lakes',
    ciudad: 'Funes',
    tipo: 'barrio_cerrado',
    centro: { lat: -32.9060, lng: -60.8280 },
    aliases: ['Lakes'],
  },
  {
    id: 'funes-aurea',
    nombre: 'Aurea',
    ciudad: 'Funes',
    tipo: 'barrio_cerrado',
    centro: { lat: -32.9110, lng: -60.8220 },
    aliases: [],
  },
  {
    id: 'funes-cotos-alameda',
    nombre: 'Cotos de la Alameda',
    ciudad: 'Funes',
    tipo: 'barrio_cerrado',
    centro: { lat: -32.9240, lng: -60.8270 },
    aliases: ['Cotos', 'Alameda'],
  },
  {
    id: 'funes-paseo-del-norte',
    nombre: 'Paseo del Norte',
    ciudad: 'Funes',
    tipo: 'barrio_cerrado',
    centro: { lat: -32.8990, lng: -60.8150 },
    aliases: ['Paseo Norte'],
  },
  {
    id: 'funes-dockgarden',
    nombre: 'Dockgarden',
    ciudad: 'Funes',
    tipo: 'barrio_cerrado',
    centro: { lat: -32.9130, lng: -60.8100 },
    aliases: ['Dock Garden', 'Dock'],
  },
  // Zonas amplias
  {
    id: 'funes-norte',
    nombre: 'Funes Norte',
    ciudad: 'Funes',
    tipo: 'zona',
    centro: { lat: -32.9000, lng: -60.8130 },
    aliases: [],
  },
  {
    id: 'funes-sur',
    nombre: 'Funes Sur',
    ciudad: 'Funes',
    tipo: 'zona',
    centro: { lat: -32.9280, lng: -60.8130 },
    aliases: [],
  },
  {
    id: 'funes-centro',
    nombre: 'Funes Centro',
    ciudad: 'Funes',
    tipo: 'zona',
    centro: { lat: -32.9117, lng: -60.8133 },
    aliases: ['Centro Funes'],
  },
  // Ciudad
  {
    id: 'funes',
    nombre: 'Funes',
    ciudad: 'Funes',
    tipo: 'zona',
    centro: { lat: -32.9117, lng: -60.8133 },
    aliases: [],
  },
]

// ─── ROLDÁN ─────────────────────────────────────────────────────────────────────

const ROLDAN: Zona[] = [
  {
    id: 'roldan-tds',
    nombre: 'Tierra de Sueños Roldán',
    ciudad: 'Roldán',
    tipo: 'barrio_cerrado',
    centro: { lat: -32.8890, lng: -60.9140 },
    aliases: ['TDS Roldán', 'Tierra de Sueños'],
  },
  {
    id: 'roldan-plaza',
    nombre: 'Roldán Plaza',
    ciudad: 'Roldán',
    tipo: 'barrio_cerrado',
    centro: { lat: -32.8950, lng: -60.9020 },
    aliases: ['Plaza Roldán'],
  },
  {
    id: 'roldan-san-marino',
    nombre: 'San Marino',
    ciudad: 'Roldán',
    tipo: 'barrio_cerrado',
    centro: { lat: -32.8920, lng: -60.9060 },
    aliases: [],
  },
  {
    id: 'roldan-la-tatenguita',
    nombre: 'La Tatenguita',
    ciudad: 'Roldán',
    tipo: 'barrio_cerrado',
    centro: { lat: -32.8980, lng: -60.9100 },
    aliases: ['Tatenguita'],
  },
  {
    id: 'roldan-pueblos-del-plata',
    nombre: 'Pueblos del Plata',
    ciudad: 'Roldán',
    tipo: 'barrio_cerrado',
    centro: { lat: -32.8870, lng: -60.9050 },
    aliases: ['Pueblos'],
  },
  {
    id: 'roldan-villa-flores',
    nombre: 'Villa Flores',
    ciudad: 'Roldán',
    tipo: 'barrio_cerrado',
    centro: { lat: -32.8940, lng: -60.9150 },
    aliases: [],
  },
  {
    id: 'roldan-distrito',
    nombre: 'Distrito Roldán',
    ciudad: 'Roldán',
    tipo: 'barrio_cerrado',
    centro: { lat: -32.8910, lng: -60.9200 },
    aliases: ['Distrito'],
  },
  {
    id: 'roldan-este',
    nombre: 'Roldán Este',
    ciudad: 'Roldán',
    tipo: 'barrio_cerrado',
    centro: { lat: -32.8960, lng: -60.8950 },
    aliases: [],
  },
  {
    id: 'roldan-hausing',
    nombre: 'Hausing',
    ciudad: 'Roldán',
    tipo: 'barrio_cerrado',
    centro: { lat: -32.8930, lng: -60.9080 },
    aliases: ['Housing'],
  },
  // Zonas
  {
    id: 'roldan-centro',
    nombre: 'Roldán Centro',
    ciudad: 'Roldán',
    tipo: 'zona',
    centro: { lat: -32.8967, lng: -60.9083 },
    aliases: ['Centro Roldán'],
  },
  {
    id: 'roldan-norte',
    nombre: 'Roldán Norte',
    ciudad: 'Roldán',
    tipo: 'zona',
    centro: { lat: -32.8880, lng: -60.9083 },
    aliases: [],
  },
  {
    id: 'roldan-sur',
    nombre: 'Roldán Sur',
    ciudad: 'Roldán',
    tipo: 'zona',
    centro: { lat: -32.9050, lng: -60.9083 },
    aliases: [],
  },
  // Ciudad
  {
    id: 'roldan',
    nombre: 'Roldán',
    ciudad: 'Roldán',
    tipo: 'zona',
    centro: { lat: -32.8967, lng: -60.9083 },
    aliases: [],
  },
]

// ─── ROSARIO ────────────────────────────────────────────────────────────────────

const ROSARIO: Zona[] = [
  {
    id: 'rosario-fisherton',
    nombre: 'Fisherton',
    ciudad: 'Rosario',
    tipo: 'barrio',
    centro: { lat: -32.9320, lng: -60.7080 },
    aliases: ['Fisherton Rosario'],
  },
  {
    id: 'rosario-fisherton-r',
    nombre: 'Fisherton R',
    ciudad: 'Rosario',
    tipo: 'barrio',
    centro: { lat: -32.9280, lng: -60.7150 },
    aliases: [],
  },
  {
    id: 'rosario-lourdes',
    nombre: 'Lourdes',
    ciudad: 'Rosario',
    tipo: 'barrio',
    centro: { lat: -32.9350, lng: -60.7000 },
    aliases: [],
  },
  {
    id: 'rosario-alberdi',
    nombre: 'Alberdi',
    ciudad: 'Rosario',
    tipo: 'barrio',
    centro: { lat: -32.9350, lng: -60.6550 },
    aliases: [],
  },
  {
    id: 'rosario-echesortu',
    nombre: 'Echesortu',
    ciudad: 'Rosario',
    tipo: 'barrio',
    centro: { lat: -32.9550, lng: -60.6580 },
    aliases: [],
  },
  {
    id: 'rosario-pichincha',
    nombre: 'Pichincha',
    ciudad: 'Rosario',
    tipo: 'barrio',
    centro: { lat: -32.9380, lng: -60.6370 },
    aliases: [],
  },
  {
    id: 'rosario-centro',
    nombre: 'Centro',
    ciudad: 'Rosario',
    tipo: 'barrio',
    centro: { lat: -32.9468, lng: -60.6393 },
    aliases: ['Centro Rosario', 'Microcentro'],
  },
  {
    id: 'rosario-martin',
    nombre: 'Martin',
    ciudad: 'Rosario',
    tipo: 'barrio',
    centro: { lat: -32.9520, lng: -60.6450 },
    aliases: ['Barrio Martin'],
  },
  {
    id: 'rosario-republica-sexta',
    nombre: 'República de la Sexta',
    ciudad: 'Rosario',
    tipo: 'barrio',
    centro: { lat: -32.9560, lng: -60.6400 },
    aliases: ['La Sexta', 'Sexta'],
  },
  {
    id: 'rosario-abasto',
    nombre: 'Abasto',
    ciudad: 'Rosario',
    tipo: 'barrio',
    centro: { lat: -32.9600, lng: -60.6550 },
    aliases: [],
  },
  {
    id: 'rosario-parque',
    nombre: 'Parque',
    ciudad: 'Rosario',
    tipo: 'barrio',
    centro: { lat: -32.9580, lng: -60.6350 },
    aliases: ['Parque Independencia'],
  },
  {
    id: 'rosario-saladillo',
    nombre: 'Saladillo',
    ciudad: 'Rosario',
    tipo: 'barrio',
    centro: { lat: -32.9850, lng: -60.6450 },
    aliases: [],
  },
  {
    id: 'rosario-las-delicias',
    nombre: 'Las Delicias',
    ciudad: 'Rosario',
    tipo: 'barrio',
    centro: { lat: -32.9500, lng: -60.6700 },
    aliases: ['Delicias'],
  },
  {
    id: 'rosario-tiro-suizo',
    nombre: 'Tiro Suizo',
    ciudad: 'Rosario',
    tipo: 'barrio',
    centro: { lat: -32.9430, lng: -60.6900 },
    aliases: [],
  },
  {
    id: 'rosario-belgrano',
    nombre: 'Belgrano',
    ciudad: 'Rosario',
    tipo: 'barrio',
    centro: { lat: -32.9600, lng: -60.6300 },
    aliases: [],
  },
  {
    id: 'rosario-refineria',
    nombre: 'Refinería',
    ciudad: 'Rosario',
    tipo: 'barrio',
    centro: { lat: -32.9260, lng: -60.6480 },
    aliases: ['Refinerías'],
  },
  {
    id: 'rosario-arroyito',
    nombre: 'Arroyito',
    ciudad: 'Rosario',
    tipo: 'barrio',
    centro: { lat: -32.9200, lng: -60.6530 },
    aliases: [],
  },
  {
    id: 'rosario-sorrento',
    nombre: 'Sorrento',
    ciudad: 'Rosario',
    tipo: 'barrio',
    centro: { lat: -32.9150, lng: -60.6600 },
    aliases: [],
  },
  {
    id: 'rosario-empalme-graneros',
    nombre: 'Empalme Graneros',
    ciudad: 'Rosario',
    tipo: 'barrio',
    centro: { lat: -32.9100, lng: -60.6700 },
    aliases: ['Graneros', 'Empalme'],
  },
  {
    id: 'rosario-bella-vista',
    nombre: 'Bella Vista',
    ciudad: 'Rosario',
    tipo: 'barrio',
    centro: { lat: -32.9300, lng: -60.6700 },
    aliases: [],
  },
  {
    id: 'rosario-la-florida',
    nombre: 'La Florida',
    ciudad: 'Rosario',
    tipo: 'barrio',
    centro: { lat: -32.9180, lng: -60.6400 },
    aliases: ['Florida'],
  },
  {
    id: 'rosario-hostal-del-sol',
    nombre: 'Hostal del Sol',
    ciudad: 'Rosario',
    tipo: 'barrio',
    centro: { lat: -32.9400, lng: -60.7200 },
    aliases: ['Hostal'],
  },
  {
    id: 'rosario-antartida',
    nombre: 'Antártida Argentina',
    ciudad: 'Rosario',
    tipo: 'barrio',
    centro: { lat: -32.9250, lng: -60.6850 },
    aliases: ['Antártida'],
  },
  {
    id: 'rosario-parque-field',
    nombre: 'Parque Field',
    ciudad: 'Rosario',
    tipo: 'barrio',
    centro: { lat: -32.9480, lng: -60.6750 },
    aliases: ['Field'],
  },
  {
    id: 'rosario-cinco-esquinas',
    nombre: 'Cinco Esquinas',
    ciudad: 'Rosario',
    tipo: 'barrio',
    centro: { lat: -32.9530, lng: -60.6520 },
    aliases: ['5 Esquinas'],
  },
  {
    id: 'rosario-azcuenaga',
    nombre: 'Azcuénaga',
    ciudad: 'Rosario',
    tipo: 'barrio',
    centro: { lat: -32.9430, lng: -60.6550 },
    aliases: ['Azcuenaga'],
  },
  {
    id: 'rosario-tablada',
    nombre: 'Tablada',
    ciudad: 'Rosario',
    tipo: 'barrio',
    centro: { lat: -32.9700, lng: -60.6400 },
    aliases: [],
  },
  {
    id: 'rosario-las-heras',
    nombre: 'General Las Heras',
    ciudad: 'Rosario',
    tipo: 'barrio',
    centro: { lat: -32.9650, lng: -60.6500 },
    aliases: ['Las Heras'],
  },
  {
    id: 'rosario-triangulo',
    nombre: 'Triángulo',
    ciudad: 'Rosario',
    tipo: 'barrio',
    centro: { lat: -32.9580, lng: -60.6700 },
    aliases: ['Triangulo'],
  },
  {
    id: 'rosario-industrial',
    nombre: 'Industrial',
    ciudad: 'Rosario',
    tipo: 'barrio',
    centro: { lat: -32.9330, lng: -60.6620 },
    aliases: [],
  },
  {
    id: 'rosario-mataderos',
    nombre: 'Mataderos',
    ciudad: 'Rosario',
    tipo: 'barrio',
    centro: { lat: -32.9160, lng: -60.6750 },
    aliases: [],
  },
  // Ciudad
  {
    id: 'rosario',
    nombre: 'Rosario',
    ciudad: 'Rosario',
    tipo: 'zona',
    centro: { lat: -32.9468, lng: -60.6393 },
    aliases: [],
  },
]

// ─── CATÁLOGO COMPLETO ──────────────────────────────────────────────────────────

export const ZONAS: Zona[] = [...FUNES, ...ROLDAN, ...ROSARIO]

// ─── BÚSQUEDA ───────────────────────────────────────────────────────────────────

function normalize(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function buscarZonas(query: string, max = 8): Zona[] {
  const q = normalize(query.trim())
  if (q.length < 2) return []

  // Score each zona
  const scored: { zona: Zona; score: number }[] = []

  for (const zona of ZONAS) {
    const nombre = normalize(zona.nombre)
    const ciudad = normalize(zona.ciudad)
    const aliasNorm = (zona.aliases ?? []).map(normalize)

    let score = 0

    // Exact prefix on nombre → highest priority
    if (nombre.startsWith(q)) {
      score = 3
    }
    // Contains in nombre
    else if (nombre.includes(q)) {
      score = 2
    }
    // Match in ciudad
    else if (ciudad.startsWith(q)) {
      score = 1.5
    }
    // Match in aliases
    else if (aliasNorm.some(a => a.includes(q))) {
      score = 1
    }

    if (score > 0) {
      scored.push({ zona, score })
    }
  }

  // Sort by score desc, then alphabetically
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.zona.nombre.localeCompare(b.zona.nombre, 'es')
  })

  return scored.slice(0, max).map(s => s.zona)
}
