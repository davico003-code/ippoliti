// Contenido de /como-trabajamos. TODO es material real de SI INMOBILIARIA:
// fotos de propiedades publicadas (copiadas a public/como-trabajamos para que
// no venzan los links firmados de HILO), videos del canal de YouTube, notas de
// prensa verificadas y cifras públicas relevadas el 27-sep-2026.
// Al actualizar una cifra, actualizar también la fecha de relevamiento.

const P = '/como-trabajamos'

export const RELEVADO = 'septiembre de 2026'

/* ── Fotos de propiedades (fotos profesionales, sin retoque IA ni renders) ── */
export const FOTOS = [
  { src: `${P}/kentucky-pileta.webp`, alt: 'Casa con pileta en Kentucky Club de Campo, Funes', lugar: 'Kentucky · Funes', href: '/propiedades/7872050-casa-en-venta-de-4-dormitorios-en-kentucky-club-de-campo-funes', ancho: true },
  { src: `${P}/cadaques-fachada.webp`, alt: 'Fachada de casa con palmeras en Cadaqués, Funes', lugar: 'Cadaqués · Funes', href: '/propiedades/7875941-casa-en-venta-de-3-dormitorios-con-pileta-en-cadaques-barrio-cerrado-funes' },
  { src: `${P}/vida-pileta.webp`, alt: 'Pileta y casa en barrio Vida, Funes', lugar: 'Vida · Funes', href: '/propiedades/7868679-casa-en-venta-de-3-dormitorios-con-pileta-en-vida-barrio-cerrado-funes' },
  { src: `${P}/quinquela-balcon-rio.webp`, alt: 'Balcón con vista al río Paraná en Rosario', lugar: 'Vista al río · Rosario', href: '/propiedades/7763055-departamento-en-venta-3-dormitorios-en-rosario' },
  { src: `${P}/puerto-roldan-jardin.webp`, alt: 'Jardín con pileta en Puerto Roldán', lugar: 'Puerto Roldán', href: '/propiedades/900000552-casa-en-barrio-cerrado-puerto-roldan', ancho: true },
  { src: `${P}/castillo-roldan.webp`, alt: 'Casona con enredadera en Roldán', lugar: 'Casona · Roldán', href: '/propiedades/6890652-castillo-en-venta-5-dormitorios-en-roldan' },
  { src: `${P}/cadaques-quincho.webp`, alt: 'Quincho con parrilla en Cadaqués, Funes', lugar: 'Cadaqués · Funes', href: '/propiedades/7875941-casa-en-venta-de-3-dormitorios-con-pileta-en-cadaques-barrio-cerrado-funes' },
  { src: `${P}/vida-galeria.webp`, alt: 'Galería con techo de madera en barrio Vida', lugar: 'Vida · Funes', href: '/propiedades/7868679-casa-en-venta-de-3-dormitorios-con-pileta-en-vida-barrio-cerrado-funes' },
  { src: `${P}/san-sebastian-pileta.webp`, alt: 'Pileta en San Sebastián, Funes', lugar: 'San Sebastián · Funes', href: '/propiedades/8424243-casa-en-venta-3-dormitorios-en-funes-san-sebastian-barrio-privado' },
  { src: `${P}/puerto-roldan-living.webp`, alt: 'Living luminoso en Puerto Roldán', lugar: 'Puerto Roldán', href: '/propiedades/900000552-casa-en-barrio-cerrado-puerto-roldan' },
]

/* ── Drone ── */
export const AEREAS = [
  { src: `${P}/ruta9-aerea-cenital.webp`, alt: 'Toma cenital con drone de una casa con cancha de tenis y pileta en Funes', lugar: 'Casa sobre Ruta 9 · Funes' },
  { src: '/barrios/kentucky/hero-cover.webp', alt: 'Vista aérea de Kentucky Club de Campo', lugar: 'Kentucky Club de Campo' },
  { src: '/barrios/san-sebastian/hero-cover.webp', alt: 'Vista aérea del club house de San Sebastián', lugar: 'San Sebastián · Funes' },
]

/* ── Equipo técnico ── */
// Fotos: imágenes oficiales de producto (DJI y el newsroom de Apple), a
// pedido de David; se reemplazan por fotos propias cuando las haya.
export const EQUIPOS = [
  { nombre: 'DJI Mavic 4 Pro', uso: 'Drone para tomas aéreas: el terreno, el barrio, los accesos y el entorno desde arriba.', icono: 'drone', foto: `${P}/equipos/dji-mavic-4-pro.webp`, oscura: false },
  { nombre: 'DJI Osmo Pocket 4P', uso: 'Cámara estabilizada para recorridos fluidos por dentro de la casa, sin saltos.', icono: 'video', foto: `${P}/equipos/dji-osmo-pocket-4p.webp`, oscura: false },
  { nombre: 'iPhone 17 Pro', uso: 'Reels y videos verticales en 4K, pensados para Instagram, TikTok y YouTube Shorts.', icono: 'celular', foto: `${P}/equipos/iphone-17-pro.webp`, oscura: true },
  { nombre: 'DJI Mic 2', uso: 'Micrófonos inalámbricos: el agente cuenta la propiedad con audio limpio.', icono: 'mic', foto: `${P}/equipos/dji-mic-2.webp`, oscura: false },
] as const

/* ── YouTube ── */
export const CANAL_YOUTUBE = 'https://www.youtube.com/@mundosiinmobiliaria'

export const VIDEOTOURS = [
  { id: 'LLY5qIkvOxg', titulo: 'House tour · Casa en Vida (Hausing)', dur: '11:33' },
  { id: 'oWvuqAjRcjo', titulo: 'House tour · Casa en Cadaqués, Funes', dur: '1:35' },
  { id: 'yHKtmtX5xro', titulo: 'San Lorenzo al 2500', dur: '3:25' },
  { id: '6KEmzX_IRn4', titulo: 'Av. San Martín 1200 · Roldán', dur: '1:35' },
  { id: 'YX9pK6oOn7Q', titulo: 'Casa en Vida · Lote 253', dur: '' },
  { id: 'ROwXy-N7lAA', titulo: 'Piso 16 con vista al río · Rosario', dur: '' },
]

export const SHORTS = [
  { id: 'IsWpeY7tfQY', titulo: 'Casa en Aguadas, Funes' },
  { id: 'OjCsnKpg5bQ', titulo: 'Recorrido casa en Vida' },
  { id: 'D-GcXUJLnvY', titulo: 'Country Golf Aldea Fisherton' },
  { id: 'pU7Zm_a5x54', titulo: 'Casa en San Marino, Funes Hills' },
  { id: 'UuEPucwevZQ', titulo: 'Casa en Las Tardes, Roldán' },
  { id: 'ulBYdV7QJcA', titulo: 'Casa reciclada · Rosario' },
  { id: 'vKiyWNX6B0o', titulo: 'Moreno 1717, Funes' },
  { id: 'fvFZCWj7khE', titulo: 'Funes Lakes' },
]

export const CHARLA_DESTACADA = {
  id: 'hx7wlATWXT0',
  titulo: 'Susana Ippoliti: 43 años de experiencia en el mercado inmobiliario',
}
export const CHARLAS_INVITADOS = ['Gonzalo Sánchez Hermelo', 'Diego Ferreyra', 'Carlos Olmedo', 'Santiago Tamalet', 'Loana Aisa', 'Colegas de la zona']

/* ── Redes (cifras públicas de cada perfil) ── */
export const REDES = [
  { red: 'Instagram', usuario: '@inmobiliaria.si', cifra: '21K', detalle: 'seguidores · 451 publicaciones', href: 'https://www.instagram.com/inmobiliaria.si' },
  { red: 'Instagram', usuario: '@davidflores.pov', cifra: '3.010', detalle: 'seguidores · 469 publicaciones', href: 'https://www.instagram.com/davidflores.pov' },
  { red: 'TikTok', usuario: '@si.inmobiliaria', cifra: '1.301', detalle: 'seguidores · 26K me gusta', href: 'https://www.tiktok.com/@si.inmobiliaria' },
  { red: 'YouTube', usuario: '@mundosiinmobiliaria', cifra: '70+', detalle: 'videotours, recorridos y charlas', href: CANAL_YOUTUBE },
]

/* ── Prensa (notas verificadas; links a la nota original) ── */
export const PRENSA = [
  { medio: 'El Roldanense', fecha: 'jun 2026', titulo: 'A tres meses del inicio de obras, Distrito Roldán lleva vendidos más del 35% de sus lotes', img: `${P}/prensa/roldanense-distrito-35.webp`, href: 'https://elroldanense.com/a-tres-meses-del-inicio-de-obras-distrito-roldan-lleva-vendidos-mas-del-35-de-sus-lotes-113870' },
  { medio: 'InfoFunes', fecha: 'sep 2026', titulo: 'Dock Garden crece en Aldea Fisherton con viviendas, verde y un paseo comercial propio', img: `${P}/prensa/infofunes-dockgarden.webp`, href: 'https://infofunes.com.ar/fisherton/dock-garden-crece-en-aldea-fisherton-con-viviendas--verde-y-un-paseo-comercial-propio-frente-al-rosario-golf_a6ab6f245a5276c9dc3ee4da7' },
  { medio: 'InfoFunes', fecha: 'feb 2026', titulo: '"La casa correcta para cada barrio": ¿cuánto cuesta el metro cuadrado terminado hoy en Funes?', img: `${P}/prensa/infofunes-m2-terminado.webp`, href: 'https://infofunes.com.ar/noticias/la-casa-correcta-para-cada-barrio-cuanto-cuesta-el-metro-cuadrado-terminado-hoy-en-funes', firma: 'David Flores, fuente' },
  { medio: 'El Roldanense', fecha: 'mar 2026', titulo: 'Comenzaron las obras de Distrito Roldán, el desarrollo del Grupo Transatlántica en la ciudad', img: `${P}/prensa/roldanense-distrito-obras.webp`, href: 'https://elroldanense.com/comenzaron-las-obras-de-distrito-roldan-el-desarrollo-del-grupo-transatlantica-en-la-ciudad-111440' },
  { medio: 'InfoFunes', fecha: 'may 2025', titulo: 'Funes y Roldán: el nuevo refugio de valor inmobiliario en 2025', img: `${P}/prensa/infofunes-refugio.webp`, href: 'https://infofunes.com.ar/noticias/funes-y-roldan-el-nuevo-refugio-de-valor-inmobiliario-en-2025', firma: 'Columna de David Flores' },
  { medio: 'InfoFunes', fecha: 'may 2025', titulo: 'Rentabilidad inmobiliaria: ¿cuánto pueden rendir sus inversiones?', img: `${P}/prensa/infofunes-rentabilidad.webp`, href: 'https://infofunes.com.ar/noticias/rentabilidad-inmobiliaria-cuanto-pueden-rendir-sus-inversiones', firma: 'Columna de David Flores' },
  { medio: 'InfoFunes', fecha: 'oct 2024', titulo: '¿Qué está pasando en el mercado inmobiliario en 2024? Tres claves para entenderlo', img: `${P}/prensa/infofunes-mercado-2024.webp`, href: 'https://infofunes.com.ar/noticias/que-esta-pasando-en-el-mercado-inmobiliario-en-2024-tres-claves-para-entenderlo', firma: 'Columna de David Flores' },
  { medio: 'InfoFunes', fecha: 'ago 2024', titulo: 'De Roldán a Funes: Susana Ippoliti Inmobiliaria expande sus negocios con nueva marca', img: `${P}/prensa/infofunes-nueva-marca.webp`, href: 'https://infofunes.com.ar/noticias/de-roldan-a-funes-susana-ippoliti-inmobiliaria-expande-sus-negocios-con-nueva-marca' },
]

/* ── Emprendimientos que asesoramos (solo estos dos: David, 27-sep) ── */
export const EMPRENDIMIENTOS = [
  {
    nombre: 'Distrito Roldán',
    desarrolla: 'Grupo Transatlántica',
    tipo: 'Barrio abierto · lotes y locales · Roldán',
    dato: 'Más del 35% de los lotes vendidos a tres meses del inicio de obra',
    fuente: 'El Roldanense, junio 2026',
    img: `${P}/prensa/roldanense-distrito-35.webp`,
    href: '/emprendimientos/67178-distrito-roldan',
  },
  {
    nombre: 'Dock Garden',
    desarrolla: 'VERS Desarrollos',
    tipo: 'Condominio y paseo comercial · Aldea Fisherton',
    dato: 'Análisis de mercado previo al lanzamiento y comercialización de las unidades',
    fuente: '',
    img: '/images/dockgarden/obra-2026-09/01.webp',
    href: '/emprendimientos/67173-dockgarden-aldea-fisherton',
  },
]

/* ── Informes reales entregados a desarrolladores ──
   Se muestran como libro (tapa + páginas en abanico) y, al lado, cuatro
   páginas reales legibles que se abren en grande (David, 27-sep: "que se
   vea que no son chamuyos"). */
export const INFORMES = [
  {
    proyecto: 'Dock Garden',
    tipo: 'Análisis de mercado',
    titulo: 'Condominios en pozo en Fisherton',
    fecha: 'Julio 2025',
    detalle: 'Comparables reales, precio por m² y posicionamiento para definir la estrategia comercial antes del lanzamiento.',
    formato: 'a4' as const,
    tapa: `${P}/informes/dockgarden-mercado-tapa.webp`,
    paginas: [`${P}/informes/dockgarden-mercado-p4.webp`, `${P}/informes/dockgarden-mercado-p5.webp`, `${P}/informes/dockgarden-mercado-p8.webp`],
    muestras: [
      { src: `${P}/informes/paginas/dockgarden-mercado-3.webp`, ancho: 1100, alto: 1556, etiqueta: 'Objetivo y primeros comparables' },
      { src: `${P}/informes/paginas/dockgarden-mercado-4.webp`, ancho: 1100, alto: 1556, etiqueta: 'Fichas de comparables' },
      { src: `${P}/informes/paginas/dockgarden-mercado-8.webp`, ancho: 1100, alto: 1556, etiqueta: 'Tabla de comparables y mapa' },
      { src: `${P}/informes/paginas/dockgarden-mercado-9.webp`, ancho: 1100, alto: 1556, etiqueta: 'Conclusión y precio sugerido' },
    ],
  },
  {
    proyecto: 'Distrito Roldán',
    tipo: 'Análisis comercial y plan de acción',
    titulo: 'Línea de tiempo, competencia y propuesta',
    fecha: 'Cuarto trimestre 2025',
    detalle: 'Cómo venía la venta, contra quién competía el proyecto y qué condiciones proponíamos cambiar.',
    formato: 'slide' as const,
    tapa: `${P}/informes/distrito-plan-tapa.webp`,
    paginas: [`${P}/informes/distrito-plan-p04.webp`, `${P}/informes/distrito-plan-p05.webp`, `${P}/informes/distrito-plan-p09.webp`],
    muestras: [
      { src: `${P}/informes/paginas/distrito-plan-04.webp`, ancho: 1600, alto: 900, etiqueta: 'Línea de tiempo comercial' },
      { src: `${P}/informes/paginas/distrito-plan-06.webp`, ancho: 1600, alto: 900, etiqueta: 'Comparación con la competencia' },
      { src: `${P}/informes/paginas/distrito-plan-08.webp`, ancho: 1600, alto: 900, etiqueta: 'Propuesta concreta' },
      { src: `${P}/informes/paginas/distrito-plan-09.webp`, ancho: 1600, alto: 900, etiqueta: 'Lógica del movimiento' },
    ],
  },
  {
    proyecto: 'Distrito Roldán',
    tipo: 'Avance comercial',
    titulo: 'Informe estratégico de evolución comercial',
    fecha: 'Primer trimestre 2026',
    detalle: 'Estado de las ventas, ritmo de absorción, contexto del mercado y plan de comercialización para el período.',
    formato: 'a4' as const,
    tapa: `${P}/informes/distrito-q1-tapa.webp`,
    paginas: [`${P}/informes/distrito-q1-p2.webp`, `${P}/informes/distrito-q1-p3.webp`, `${P}/informes/distrito-q1-p7.webp`],
    muestras: [
      { src: `${P}/informes/paginas/distrito-q1-2.webp`, ancho: 1100, alto: 1556, etiqueta: 'Estado actual y velocidad de venta' },
      { src: `${P}/informes/paginas/distrito-q1-4.webp`, ancho: 1100, alto: 1556, etiqueta: 'Costo de construcción vs. lote' },
      { src: `${P}/informes/paginas/distrito-q1-6.webp`, ancho: 1100, alto: 1556, etiqueta: 'Competencia y ventajas' },
      { src: `${P}/informes/paginas/distrito-q1-8.webp`, ancho: 1100, alto: 1556, etiqueta: 'Plan de comercialización' },
    ],
  },
]

/* ── Equipo (roster público de /nosotros) ── */
export const DIRECCION = [
  { nombre: 'Susana Ippoliti', cargo: 'Fundadora', detalle: 'Corredora inmobiliaria · Mat. 0559 COCIR · más de 40 años en el mercado', foto: '/team/susana-ippoliti.jpg' },
  { nombre: 'David Flores', cargo: 'Corredor inmobiliario · Funes', detalle: 'Mat. 0621 COCIR · más de 15 años de experiencia', foto: '/team/david-flores.jpg' },
  { nombre: 'Laura Flores', cargo: 'Corredora inmobiliaria · Roldán', detalle: 'Administradora de empresas · gestión del equipo', foto: '/team/laura-flores.jpg' },
]

export const AGENTES = [
  ['Mauro Matteucci', 'mauro-matteucci'],
  ['Gino Pecchenino', 'gino-pecchenino'],
  ['Leticia Alexenicer', 'leticia-alexenicer'],
  ['Carolina Echen', 'carolina-echen'],
  ['Aldana Ruiz', 'aldana-ruiz'],
  ['Mariana Orlate', 'mariana-orlate'],
  ['Micaela Gonzalez', 'micaela-gonzalez'],
  ['Gisela Ramallo', 'gisela-ramallo'],
  ['María José Espilocin', 'maria-jose-espilocin'],
  ['Lucía Wilson', 'lucia-wilson'],
  ['Marisa Benitez', 'marisa-benitez'],
  ['Sabrina Rogani', 'sabrina-rogani'],
  ['Eliana Rojas', 'eliana-rojas'],
  ['Jeremías Caraballo', 'jeremias-caraballo'],
  ['Claudia', 'claudia'],
  ['Florencia Acquarone', 'florencia-acquarone'],
].map(([nombre, slug]) => ({ nombre, foto: `/team/${slug}.jpg` }))

export const OFICINAS = [
  { nombre: 'Funes', direccion: 'Hipólito Yrigoyen 2643', nota: 'Inmobiliaria + galería de arte PARED', foto: '/nosotros/si-inmobiliaria-oficina-funes-interior.webp' },
  { nombre: 'Roldán · casa matriz', direccion: 'Primero de Mayo 258', nota: 'Donde empezó todo, en 1983', foto: '/oficina-historica.webp' },
  { nombre: 'Roldán · sede comercial', direccion: 'Catamarca 775', nota: 'Sede comercial', foto: '/oficina-ruta9.webp' },
]

export const BARRIOS = [
  'Kentucky', 'Funes Hills', 'San Sebastián', 'Cadaqués', 'Vida', 'Aguadas', 'Funes Lakes', 'Haras de Funes',
  'Don Mateo', 'La Finca', 'Puerto Roldán', 'Los Aromos', 'El Molino', 'Aldea Fisherton', 'Country Golf', 'Cotos de la Alameda',
]

/* ── Vendidas recientemente ──
   Ventas PROPIAS reales (cierres de HILO/Tokko con vendido_por = nosotros,
   solo operaciones de venta), con la foto original de la publicación. Sin
   montos. Relevado en septiembre de 2026. */
export const VENDIDAS = [
  { slug: 'casa-loft-pileta-las-acequias', tipo: 'Casa con pileta', zona: 'Las Acequias, Roldán', fecha: 'Abril 2026' },
  { slug: 'casa-pileta-don-mateo', tipo: 'Casa con pileta', zona: 'Don Mateo, Funes', fecha: 'Febrero 2026' },
  { slug: 'casa-piscina-ruta-9-roldan', tipo: 'Casa de 3 dormitorios con piscina', zona: 'Ruta 9, Roldán', fecha: 'Octubre 2025' },
  { slug: 'casa-pileta-punta-chacra', tipo: 'Casa con pileta', zona: 'Punta Chacra, Roldán', fecha: 'Octubre 2025' },
  { slug: 'casa-a-estrenar-las-acequias', tipo: 'Casa a estrenar con piscina', zona: 'Las Acequias, Roldán', fecha: 'Junio 2025' },
  { slug: 'depto-tierra-nueva-fisherton', tipo: 'Departamento', zona: 'Tierra Nueva, Fisherton', fecha: 'Abril 2026' },
  { slug: 'casa-funes-city', tipo: 'Casa de 2 dormitorios', zona: 'Funes City, Funes', fecha: 'Febrero 2026' },
  { slug: 'casa-pileta-acequias-del-aire', tipo: 'Casa con pileta', zona: 'Acequias del Aire, Roldán', fecha: 'Marzo 2026' },
  { slug: 'depto-aldea-fisherton', tipo: 'Departamento de 90 m²', zona: 'Aldea, Fisherton', fecha: 'Julio 2025' },
  { slug: 'local-vidriera-funes', tipo: 'Local con vidriera', zona: 'Funes', fecha: 'Febrero 2026' },
  { slug: 'terreno-tierra-de-suenos-3', tipo: 'Terreno escriturado', zona: 'Tierra de Sueños 3, Roldán', fecha: 'Junio 2026' },
  { slug: 'quincho-pileta-roldan', tipo: 'Quincho con pileta', zona: 'Roldán', fecha: 'Julio 2025' },
].map((v) => ({ ...v, foto: `${P}/vendidas/${v.slug}.webp` }))

/* ── Muro de propiedades publicadas (portadas reales, para el mockup de HILO) ── */
export const MURO = Array.from({ length: 19 }, (_, i) => `${P}/muro/${String(i + 1).padStart(2, '0')}.webp`)
