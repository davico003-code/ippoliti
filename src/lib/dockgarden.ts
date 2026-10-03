// Material de confianza de Dock Garden sacado de la presentación oficial de
// VERS Arquitectos (PDF "Aldea Dockgarden", 03-oct-2026): obras terminadas del
// estudio en la Aldea, tiempos a los lugares de referencia, plano y superficies
// de cada tipología y terminaciones con marca. Lo usan la landing del
// emprendimiento (/emprendimientos/67173-…) y /dockgarden.
// Precios y disponibilidad NO van acá: salen vivos de Brickfy (lib/brickfy.ts).

const IMG = '/images/dockgarden'

/** Obras terminadas de VERS en Aldea Fisherton, de la más vieja a la más nueva. */
export const VERS_OBRAS = [
  { nombre: 'Aldea Dock', anio: 2010, direccion: 'Av. Schweitzer 8849', foto: `${IMG}/vers/aldea-dock.webp` },
  { nombre: 'Condominio Dock Haus', anio: 2015, direccion: 'Av. Schweitzer y Malabia', foto: `${IMG}/vers/dock-haus.webp` },
  { nombre: 'Dock Point', anio: 2016, direccion: 'Av. Schweitzer 8883', foto: `${IMG}/vers/dock-point.webp` },
  { nombre: 'Dock Trade', anio: 2020, direccion: 'Av. Schweitzer 8873', foto: `${IMG}/vers/dock-trade.webp` },
  { nombre: 'Fisherton Dock', anio: 2023, direccion: 'Comenius 8226', foto: `${IMG}/vers/fisherton-dock.webp` },
  { nombre: 'Vivre Dock', anio: 2023, direccion: 'Oliveros 624 bis', foto: `${IMG}/vers/vivre-dock.webp` },
] as const

export const VERS_LOGO = { src: `${IMG}/vers/logo-blanco.webp`, width: 640, height: 185 }

export type Cercania = {
  /** Número del punto en el mapa de la presentación (ubicacion-mapa.webp). */
  n: number
  nombre: string
  minutos: number
  tipo: 'aeropuerto' | 'shopping' | 'salud' | 'colegio' | 'golf' | 'hipico' | 'autodromo'
  foto?: string
}

/** Minutos desde Dock Garden, tal cual la presentación del desarrollador. */
export const CERCANIAS: Cercania[] = [
  { n: 1, nombre: 'Aeropuerto Internacional Islas Malvinas', minutos: 6, tipo: 'aeropuerto', foto: `${IMG}/cerca/aeropuerto.webp` },
  { n: 2, nombre: 'Shopping Fisherton Plaza', minutos: 5, tipo: 'shopping' },
  { n: 3, nombre: 'Sanatorio de la Mujer', minutos: 5, tipo: 'salud', foto: `${IMG}/cerca/sanatorio-mujer.webp` },
  { n: 4, nombre: 'Colegio Los Arroyos', minutos: 3, tipo: 'colegio', foto: `${IMG}/cerca/colegio-los-arroyos.webp` },
  { n: 5, nombre: 'Colegio Mirasoles', minutos: 4, tipo: 'colegio' },
  { n: 6, nombre: 'Rosario Golf Club', minutos: 3, tipo: 'golf', foto: `${IMG}/cerca/golf-club.webp` },
  { n: 7, nombre: 'Jockey Club Rosario', minutos: 7, tipo: 'hipico' },
  { n: 8, nombre: 'Autódromo de Rosario', minutos: 4, tipo: 'autodromo', foto: `${IMG}/cerca/autodromo.webp` },
]

export const MAPA_CERCANIAS = { src: `${IMG}/ubicacion-mapa.webp`, width: 1400, height: 1329 }

export type Tipologia = {
  id: string
  /** Etiqueta de la solapa. */
  nombre: string
  /** Para buscar en Brickfy su recorrido 360° y filtrar la lista de precios. */
  dorms: number
  duplex: boolean
  plano: string
  /** Unidad de la que es el plano (nomenclatura de la lista: Torre · Piso · Unidad). */
  referencia: string
  superficies: { label: string; m2: string }[]
  total: string
  ambientes: string[]
}

// Superficies: "unidad" = superficie exclusiva de la unidad; la cochera es de
// uso exclusivo. La lista de precios de Brickfy muestra el TOTAL (unidad +
// cochera), por eso acá se desarma: es la duda más común al comparar.
export const TIPOLOGIAS: Tipologia[] = [
  {
    id: '1d',
    nombre: '1 dormitorio',
    dorms: 1,
    duplex: false,
    plano: `${IMG}/planos/1-dormitorio.webp`,
    referencia: 'Torre 2 · Piso 3 · Unidad 6',
    superficies: [
      { label: 'Departamento', m2: '80,10' },
      { label: 'Cochera', m2: '13,80' },
    ],
    total: '93,90',
    ambientes: [
      'Suite con vestidor',
      'Baño completo y toilette',
      'Cocina abierta al estar-comedor',
      'Lavadero independiente',
      'Balcón de 5,25 × 1,78 m',
    ],
  },
  {
    id: '2d',
    nombre: '2 dormitorios',
    dorms: 2,
    duplex: false,
    plano: `${IMG}/planos/2-dormitorios.webp`,
    referencia: 'Torre 2 · Piso 1 · Unidad 5',
    superficies: [
      { label: 'Departamento', m2: '93,50' },
      { label: 'Cochera', m2: '13,80' },
    ],
    total: '107,30',
    ambientes: [
      'Suite con vestidor y un segundo dormitorio',
      '2 baños completos',
      'Cocina abierta al estar-comedor',
      'Lavadero independiente',
      'Balcón de 5,25 × 1,78 m',
    ],
  },
  {
    id: '3d',
    nombre: '3 dormitorios',
    dorms: 3,
    duplex: false,
    plano: `${IMG}/planos/3-dormitorios.webp`,
    referencia: 'Torre 2 · Piso 1 · Unidad 4',
    superficies: [
      { label: 'Departamento', m2: '156,70' },
      { label: 'Cochera doble', m2: '23,30' },
    ],
    total: '180,00',
    ambientes: [
      'Suite con vestidor y 2 dormitorios',
      '2 baños completos y toilette',
      'Cocina con isla, comedor y estar',
      'Lavadero independiente',
      'Balcón de 5,53 × 3,49 m',
    ],
  },
  {
    id: 'duplex',
    nombre: 'Dúplex 3 dorm.',
    dorms: 3,
    duplex: true,
    plano: `${IMG}/planos/duplex.webp`,
    referencia: 'Torre 2 · Pisos 4 y 5 · Unidad 1',
    superficies: [
      { label: 'Departamento', m2: '127,20' },
      { label: 'Terrazas y balcón', m2: '92,60' },
      { label: 'Cochera doble', m2: '26,10' },
    ],
    total: '245,90',
    ambientes: [
      'Abajo: estar-comedor, cocina, suite con vestidor y 2 dormitorios',
      '2 baños completos y toilette',
      'Balcón-terraza verde a lo largo de todo el frente (22,88 m)',
      'Arriba: terraza exclusiva con parrillero',
      'Lavadero en la planta de la terraza',
    ],
  },
]

/** Terminaciones de todas las unidades, agrupadas para leerlas de un vistazo. */
export const TERMINACIONES: { titulo: string; items: string[] }[] = [
  {
    titulo: 'Aberturas',
    items: ['Aluar A40 con doble vidriado hermético (DVH): aíslan del frío, el calor y el ruido'],
  },
  {
    titulo: 'Cocina',
    items: [
      'Mesadas de cuarzo',
      'Muebles en melamina símil roble',
      'Horno eléctrico y anafe vitrocerámico TST',
      'Pileta Johnson Luxor',
    ],
  },
  {
    titulo: 'Baños',
    items: [
      'Revestimientos de porcelanato Ilva',
      'Vanitorys en paraíso macizo',
      'Griferías Peirano y sanitarios Ferrum Bari',
      'Bachas Piazza',
    ],
  },
  {
    titulo: 'Climatización',
    items: ['Preinstalación para aire acondicionado multisplit y sistema de calefacción por radiadores'],
  },
  {
    titulo: 'Pisos y puertas',
    items: [
      'Piso símil madera Vision en estar y dormitorios',
      'Porcelanato en baños y balcones',
      'Puertas interiores en melamina símil roble Faplac',
    ],
  },
  {
    titulo: 'Exterior propio',
    items: ['Todas las unidades tienen balcón, terraza o patio privado'],
  },
]

/** Oficina de ventas que figura en la presentación (la de SI en Funes). */
export const OFICINA_VENTAS = {
  direccion: 'Hipólito Yrigoyen 2643, Funes',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Hip%C3%B3lito+Yrigoyen+2643%2C+Funes%2C+Santa+Fe',
}

/** Link a Google Maps de una obra, para que el cliente pueda ir a verla. */
export function mapsObra(direccion: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${direccion}, Fisherton, Rosario`)}`
}
