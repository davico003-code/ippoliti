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

export type Recorrido360 = {
  /** Id del recorrido en Kuula (kuula.co/share/{id}). */
  id: string
  tipologia: Tipologia['id']
  ambiente: string
  /** Portada del recorrido (la de Kuula, sin sello). */
  foto: string
}

// Los 7 recorridos 360° de VERS: son los mismos de los QR de la presentación y
// los de Brickfy. Van fijos porque Brickfy le asigna a la unidad de 2 dorm. el
// dormitorio del 1 dorm. (la 2 dorm. no tiene recorrido propio).
export const RECORRIDOS_360: Recorrido360[] = [
  { id: 'h83cT', tipologia: '1d', ambiente: 'Estar-comedor', foto: `${IMG}/360/1d-estar.webp` },
  { id: 'h83cx', tipologia: '1d', ambiente: 'Dormitorio', foto: `${IMG}/360/1d-dormitorio.webp` },
  { id: 'h83XP', tipologia: '3d', ambiente: 'Estar-comedor', foto: `${IMG}/360/3d-estar.webp` },
  { id: 'h83XG', tipologia: '3d', ambiente: 'Dormitorio', foto: `${IMG}/360/3d-dormitorio.webp` },
  { id: 'h83FW', tipologia: 'duplex', ambiente: 'Estar-comedor', foto: `${IMG}/360/duplex-estar.webp` },
  { id: 'h83Fz', tipologia: 'duplex', ambiente: 'Dormitorio', foto: `${IMG}/360/duplex-dormitorio.webp` },
  { id: 'h839P', tipologia: 'duplex', ambiente: 'Terraza con parrillero', foto: `${IMG}/360/duplex-terraza.webp` },
]

export function urlRecorrido(id: string): string {
  return `https://kuula.co/share/${id}?logo=1&info=1&fs=1&vr=0&thumbs=1`
}

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

// ── Unidades en el edificio (selector "Elegí tu departamento") ────────────

/** Proporciones de la Torre 2 (largo × ancho) para dibujarla en 3D. */
export const TORRE_2 = { largo: 327, ancho: 118 }

/** Planta real de la Torre 2 por piso: el recuadro "Ubicación en el conjunto"
 *  de los PDF vectoriales (AutoCAD) de VERS, renderizado a 2000 dpi. La marca de
 *  la unidad (rellenos rosa y trazos rojos) se anula en el propio contenido del
 *  PDF, así que el resto del dibujo es exactamente el original. Los 4 pisos con
 *  el mismo encuadre (alineados por correlación), así el edificio no salta. */
export const PLANTA = { w: 3780, h: 1400 }
export const PLANTAS: Record<number, string> = {
  1: `${IMG}/plantas/torre2-piso-1.webp`,
  2: `${IMG}/plantas/torre2-piso-2.webp`,
  3: `${IMG}/plantas/torre2-piso-3.webp`,
  4: `${IMG}/plantas/torre2-piso-4.webp`,
}

/** El conjunto completo (4 edificios) y dónde cae la Torre 2 en esa imagen. */
export const CONJUNTO = { src: `${IMG}/plantas/conjunto-vector.webp`, w: 1001, h: 978, torre2: [16, 466, 511, 649] as const }

type Punto = [number, number]

type UnidadPlano = {
  codigo: string
  /** 4 = dúplex en pisos 4 y 5. */
  piso: 1 | 2 | 3 | 4
  unidad: number
  tipologia: Tipologia['id']
  /** Contorno exacto en la PLANTA: el relleno rosa vectorial de su lámina oficial. */
  poligono: Punto[]
  /** Dónde va la etiqueta: el punto más "adentro" de la unidad (sirve para las L). */
  etiqueta: Punto
  superficies: { label: string; m2: string }[]
  total: string
  /** Lámina oficial de VERS con el plano y su ubicación en el conjunto. */
  lamina: string
  /** Id público de la ficha en HILO (/propiedades/{id}-…). */
  ficha?: number
}

// La 3D de la punta (U4) es igual en los pisos 1 y 3 y ninguna de las dos tiene
// PDF vectorial: contorno trazado sobre los muros del plano real (dormitorios,
// palier afuera, cocina, living y balcón).
const P_3D_PUNTA: Punto[] = [[2620,186],[3210,186],[3210,796],[3336,796],[3336,1152],[3210,1152],[3210,1180],[2610,1180],[2610,890],[2720,890],[2720,448],[2620,448]]
const P_CENTRO_ARRIBA: Punto[] = [[1822,176],[1822,577],[1866,578],[1866,692],[2169,692],[2170,575],[2461,577],[2463,595],[2593,594],[2593,176]]

/** Datos fijos por unidad (clave = id de Brickfy). Precio y estado vienen vivos de Brickfy. */
export const UNIDADES_PLANO: Record<string, UnidadPlano> = {
  'DOCK_GARDEN-2-1-1': {
    codigo: '01.01', piso: 1, unidad: 1, tipologia: '3d',
    poligono: [[78,176],[78,618],[225,619],[225,1208],[864,1208],[863,908],[754,907],[756,509],[863,508],[864,176]], etiqueta: [474, 466],
    superficies: [{ label: 'Departamento', m2: '156,70' }, { label: 'Cochera doble', m2: '26,60' }], total: '183,30',
    lamina: `${IMG}/unidades/2-1-1.webp`, ficha: 7268088,
  },
  'DOCK_GARDEN-2-1-4': {
    codigo: '01.04', piso: 1, unidad: 4, tipologia: '3d', poligono: P_3D_PUNTA, etiqueta: [2976, 919],
    superficies: [{ label: 'Departamento', m2: '156,70' }, { label: 'Cochera doble', m2: '23,30' }], total: '180,00',
    lamina: `${IMG}/unidades/2-1-4.webp`, ficha: 900000589,
  },
  'DOCK_GARDEN-2-1-6': {
    codigo: '01.06', piso: 1, unidad: 6, tipologia: '1d',
    poligono: [[1582,695],[1278,694],[1277,812],[1257,812],[1256,809],[987,809],[986,791],[856,791],[856,1211],[1625,1211],[1625,809],[1582,808]], etiqueta: [1405, 991],
    superficies: [{ label: 'Departamento', m2: '80,10' }, { label: 'Cochera', m2: '13,80' }], total: '93,90',
    lamina: `${IMG}/unidades/2-1-6.webp`,
  },
  'DOCK_GARDEN-2-2-3': {
    codigo: '02.03', piso: 2, unidad: 3, tipologia: '2d', poligono: P_CENTRO_ARRIBA, etiqueta: [2042, 396],
    superficies: [{ label: 'Departamento', m2: '81,80' }, { label: 'Cochera', m2: '13,80' }], total: '95,60',
    lamina: `${IMG}/unidades/2-2-3.webp`, ficha: 7407995,
  },
  'DOCK_GARDEN-2-3-3': {
    codigo: '03.03', piso: 3, unidad: 3, tipologia: '1d', poligono: P_CENTRO_ARRIBA, etiqueta: [2042, 396],
    superficies: [{ label: 'Departamento', m2: '80,10' }, { label: 'Cochera', m2: '13,80' }], total: '93,90',
    lamina: `${IMG}/unidades/2-3-3.webp`, ficha: 900000591,
  },
  'DOCK_GARDEN-2-3-4': {
    codigo: '03.04', piso: 3, unidad: 4, tipologia: '3d', poligono: P_3D_PUNTA, etiqueta: [2976, 919],
    superficies: [{ label: 'Departamento', m2: '156,70' }, { label: 'Cochera doble', m2: '26,10' }], total: '182,80',
    lamina: `${IMG}/unidades/2-3-4.webp`, ficha: 900000590,
  },
  'DOCK_GARDEN-2-4-1': {
    codigo: '04.01', piso: 4, unidad: 1, tipologia: 'duplex',
    poligono: [[230,683],[230,1199],[1731,1199],[1731,798],[1724,797],[1724,683],[1286,683],[1285,798],[763,798],[762,683]], etiqueta: [488, 941],
    superficies: [{ label: 'Departamento', m2: '127,20' }, { label: 'Terrazas y balcón', m2: '92,60' }, { label: 'Cochera doble', m2: '26,10' }], total: '245,90',
    lamina: `${IMG}/unidades/2-4-1.webp`, ficha: 900000592,
  },
  'DOCK_GARDEN-2-4-3': {
    codigo: '04.03', piso: 4, unidad: 3, tipologia: 'duplex',
    poligono: [[1732,165],[1732,567],[1738,568],[1739,682],[2177,682],[2178,567],[2700,567],[2701,682],[3233,681],[3232,165]], etiqueta: [2916, 423],
    superficies: [{ label: 'Departamento', m2: '127,20' }, { label: 'Terrazas y balcón', m2: '92,60' }, { label: 'Cochera doble', m2: '26,10' }], total: '245,90',
    lamina: `${IMG}/unidades/2-4-3.webp`, ficha: 7268078,
  },
}

export type UnidadExplorador = UnidadPlano & {
  id: string
  nombre: string
  dorms: number
  precio: number
  preferencial: boolean
  estado: 'disponible' | 'reservada' | 'vendida'
}

/** Cruza la lista viva de Brickfy con los datos fijos de cada unidad. */
export function unidadesExplorador(
  units: { id: string; status: string; price: number; bedrooms: number; preferencial?: boolean }[],
): UnidadExplorador[] {
  return units
    .filter((u) => UNIDADES_PLANO[u.id])
    .map((u): UnidadExplorador => {
      const p = UNIDADES_PLANO[u.id]
      return {
        ...p,
        id: u.id,
        nombre: TIPOLOGIAS.find((t) => t.id === p.tipologia)?.nombre ?? `${u.bedrooms} dorm.`,
        dorms: u.bedrooms,
        precio: u.price,
        preferencial: !!u.preferencial,
        estado: u.status === 'available' ? 'disponible' : u.status === 'reserved' ? 'reservada' : 'vendida',
      }
    })
    .sort((a, b) => a.piso - b.piso || a.unidad - b.unidad)
}
