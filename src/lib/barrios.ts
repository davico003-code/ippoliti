// lib/barrios.ts
// SI Inmobiliaria — Barrios privados del corredor de Funes
// Generado: data curada por David Flores, Mat. 0621
// IMPORTANTE: este archivo es la fuente única de verdad para /barrios-privados

// Taxonomía editorial 4-tiers (2026-05): Premium / Consolidado / Consolidado con
// vida joven / En desarrollo. Reemplaza la taxonomía legacy de 3 niveles.
export type BarrioTier =
  | "Premium"
  | "Consolidado"
  | "Consolidado con vida joven"
  | "En desarrollo"
  | "Próximamente";
// Hoy todos los barrios privados que cubrimos son de Funes. Si en el futuro
// sumamos otra zona, extender la union.
export type BarrioZona = "funes";

export interface Amenity {
  id: string;
  label: string;
  icon: string; // nombre del ícono lucide-react
}

export interface MiradaBroker {
  titular: string; // frase corta de cierre
  parrafo: string; // 3-5 oraciones de David como broker
}

// Campos editoriales SEO (provienen de barrios-editorial-data.ts y se mergean
// al BARRIOS al construir el módulo). Todos opcionales — un barrio nuevo que
// no tenga editorial cargado renderea normalmente sin esta sección.
export interface StatEditorial {
  value: string;
  unit: string;
  label: string;
}
export interface ContenidoSEO {
  intro: string;
  vidaAdentro: string;
  ubicacionTexto: string;
  miradaBroker: string;
  comparado: string;
}
export interface FAQItem {
  pregunta: string;
  respuesta: string;
}
export interface BarrioPalette {
  from: string;
  to: string;
  accent: string;
}

export interface Barrio {
  slug: string;
  nombre: string;
  nombreCompleto: string;
  desarrollador: string;
  tier: BarrioTier;
  estado: "consolidado" | "en-desarrollo" | "pre-venta";
  zona: BarrioZona;
  ubicacion: {
    direccionIngreso?: string;
    referencia: string;
    coordenadas?: { lat: number; lng: number };
    distanciaCentroRosarioMin?: number;
    accesos: string[];
  };
  datosDuros: {
    cantidadLotes?: number;
    medidaLoteDesde?: number; // m²
    medidaLoteHasta?: number; // m²
    hectareasTotales?: number;
    espaciosVerdesM2?: number;
    distintivos?: string[]; // ej: "Laguna 23.300 m²", "Campo de golf 18 hoyos"
  };
  amenities: Amenity[];
  infraestructura: string[];
  seguridad: string[];
  miradaBroker: MiradaBroker;
  perfilComprador: string[];
  tags: string[]; // para búsqueda: ["laguna", "golf", "tenis", "deportes-nauticos", etc.]
  // Identificación en Tokko (rellenar antes de deploy)
  tokko: {
    developmentId?: string;
    customTag?: string;
    matchByTitle?: string[]; // fallback: lista de strings a buscar en title/address
  };
  // Assets visuales (placeholders, David va subiendo)
  imagenes: {
    hero?: string;
    galeria?: string[];
    plano?: string;
    logoMarca?: string;
  };
  // SEO
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywordsLongTail: string[];
  };
  // Editorial SEO (opcionales — provienen de barrios-editorial-data.ts)
  subtitulo?: string;
  tierColor?: string;
  palette?: BarrioPalette;
  elementoSvg?: string;
  stats?: StatEditorial[];
  amenitiesEditorial?: string[];
  contenidoSEO?: ContenidoSEO;
  faqExtendida?: FAQItem[];
  keywords?: string;
  comparativaKeys?: string[];
  ubicacionEditorial?: string;
  distanciaRosario?: string;
  // Expensas mensuales aproximadas — texto libre (ej. "$ 180.000/mes (jun 2026)").
  // Si está vacío/undefined, la ficha muestra "Consultar" como placeholder.
  // Próximamente David lo va a poblar barrio por barrio.
  expensas?: string;
}

const ICON = {
  golf: "Flag",
  tenis: "Trophy",
  futbol: "CircleDot",
  paddle: "Square",
  pileta: "Waves",
  laguna: "Droplet",
  playa: "Sun",
  clubhouse: "Home",
  bar: "UtensilsCrossed",
  gym: "Dumbbell",
  juegos: "Baby",
  quincho: "Tent",
  seguridad: "Shield",
  electricidad: "Zap",
  agua: "Droplets",
  gas: "Flame",
  cloacas: "Pipe",
  parquizado: "Trees",
  bicisenda: "Bike",
  coworking: "Briefcase",
  nautico: "Sailboat",
  muelle: "Anchor",
  electrogeno: "Battery",
};

export const BARRIOS: Barrio[] = [
  // -------------------------------------------------------
  {
    slug: "san-sebastian",
    nombre: "San Sebastián",
    nombreCompleto: "San Sebastián — Barrio Privado",
    desarrollador: "Rosseti–Rosental",
    tier: "Consolidado con vida joven",
    estado: "consolidado",
    zona: "funes",
    ubicacion: {
      direccionIngreso: "Av. Arturo Illia 1515, Funes",
      referencia: "Intersección Av. Arturo Illia (Av. Fuerza Aérea) y H. Yrigoyen",
      coordenadas: { lat: -32.9168, lng: -60.8056 },
      distanciaCentroRosarioMin: 15,
      accesos: ["Autopista Rosario–Córdoba", "Av. Arturo Illia"],
    },
    datosDuros: {
      cantidadLotes: 587,
      medidaLoteDesde: 800,
      medidaLoteHasta: 1400,
      hectareasTotales: 68,
      espaciosVerdesM2: 30000,
      distintivos: ["Dos bosques internos", "Plaza central +30.000 m² verde"],
    },
    amenities: [
      { id: "clubhouse", label: "Club House", icon: ICON.clubhouse },
      { id: "bar", label: "Bar / Restaurant", icon: ICON.bar },
      { id: "tenis-6", label: "6 canchas de tenis", icon: ICON.tenis },
      { id: "futbol-7", label: "2 canchas de fútbol 7", icon: ICON.futbol },
      { id: "pileta-climatizada", label: "Pileta climatizada", icon: ICON.pileta },
      { id: "piscinas", label: "Piscinas adultos y niños", icon: ICON.pileta },
      { id: "gym", label: "Gimnasio", icon: ICON.gym },
      { id: "quincho", label: "Quinchos", icon: ICON.quincho },
      { id: "juegos", label: "Juegos para niños", icon: ICON.juegos },
      { id: "laguna", label: "Laguna", icon: ICON.laguna },
      { id: "seguridad-24", label: "Seguridad 24hs", icon: ICON.seguridad },
    ],
    infraestructura: [
      "Calles asfaltadas con cordón cuneta",
      "Red eléctrica subterránea",
      "Agua corriente",
      "Gas natural",
      "Red cloacal",
      "Telefonía, datos y ductos TV cable",
      "Alumbrado público",
      "Forestación planificada",
    ],
    seguridad: ["Vigilancia 24hs", "Cerco olímpico", "Doble ingreso (principal + secundario)", "Generador eléctrico en todo el barrio"],
    miradaBroker: {
      titular: "El barrio más consolidado del corredor.",
      parrafo:
        "Después de quince años vendiendo en el corredor de Funes, San Sebastián es uno de los barrios que recomiendo cuando un comprador me pregunta dónde se conserva mejor el valor. No es el más nuevo ni el de los lotes más grandes, pero tiene tres cosas que el mercado paga: consolidación real (no es un proyecto, es un barrio vivido), acceso directo a la autopista Rosario–Córdoba, y un Club House que funciona todos los días, no sólo en los renders.",
    },
    perfilComprador: [
      "Familias que quieren entrar a un barrio consolidado, no a un proyecto",
      "Compradores que valoran reventa y revalorización demostrada",
      "Inversores que buscan activo con liquidez real en Funes",
    ],
    tags: ["consolidado", "tenis", "futbol", "pileta-climatizada", "gimnasio", "laguna", "diseño-estudio-bo"],
    tokko: {
      matchByTitle: ["san sebastian", "san sebastián"],
    },
    imagenes: {
      hero: "/barrios/san-sebastian/hero.svg",
      galeria: [],
      plano: "/barrios/san-sebastian/plano.jpg",
    },
    seo: {
      metaTitle: "Lotes en San Sebastián, Funes — Precios y disponibilidad | SI Inmobiliaria",
      metaDescription:
        "Lotes y casas en San Sebastián, Funes. 587 lotes de 800 a 1.400 m² en 68 hectáreas. Stock actualizado, análisis de mercado y asesoramiento por SI Inmobiliaria, Mat. 0621.",
      keywordsLongTail: [
        "lotes san sebastian funes",
        "casas en venta san sebastian",
        "barrio cerrado san sebastian funes precios",
        "comprar lote barrio privado funes",
      ],
    },
  },

  // -------------------------------------------------------
  {
    slug: "vida-lagoon",
    nombre: "Vida Lagoon",
    nombreCompleto: "Vida Lagoon — Barrio con Laguna Cristalina",
    desarrollador: "Rosseti–Rosental",
    tier: "En desarrollo",
    estado: "en-desarrollo",
    zona: "funes",
    ubicacion: {
      direccionIngreso: "Pedro A. Ríos y José Hernández, Funes",
      referencia: "Funes — zona noroeste, junto a barrios Funes Town y La Guillermina",
      accesos: ["Calle José Hernández (conecta con Ruta 9 y Autopista Rosario–Córdoba)", "Pedro A. Ríos"],
    },
    datosDuros: {
      cantidadLotes: 1042,
      medidaLoteDesde: 600,
      medidaLoteHasta: 1200,
      hectareasTotales: 60,
      distintivos: [
        "Laguna cristalina 23.300 m² con tecnología de filtrado",
        "Playa de arena de cuarzo",
        "Primer barrio de su tipo en el interior del país",
      ],
    },
    amenities: [
      { id: "laguna-cristalina", label: "Laguna cristalina 23.300 m²", icon: ICON.laguna },
      { id: "playa-cuarzo", label: "Playa de arena de cuarzo", icon: ICON.playa },
      { id: "muelle", label: "Muelle para deportes acuáticos", icon: ICON.muelle },
      { id: "voley-playa", label: "Cancha de vóley playa", icon: ICON.futbol },
      { id: "nautica", label: "Espacio para deportes náuticos", icon: ICON.nautico },
      { id: "restaurant-laguna", label: "Restaurante con vista a la laguna", icon: ICON.bar },
      { id: "clubhouse-eventos", label: "Club House y centro de eventos", icon: ICON.clubhouse },
      { id: "parque-conservacion", label: "Parque de conservación natural", icon: ICON.parquizado },
      { id: "mirador", label: "Mirador en la península", icon: ICON.muelle },
      { id: "tenis", label: "Canchas de tenis", icon: ICON.tenis },
      { id: "paddle", label: "Cancha de pádel", icon: ICON.paddle },
      { id: "futbol", label: "Cancha de fútbol", icon: ICON.futbol },
      { id: "juegos", label: "Juegos para niños", icon: ICON.juegos },
      { id: "quincho", label: "Quinchos", icon: ICON.quincho },
      { id: "seguridad-24", label: "Seguridad 24hs", icon: ICON.seguridad },
    ],
    infraestructura: [
      "Electricidad subterránea",
      "Red interna de agua y gas natural",
      "Red cloacal y telecomunicaciones",
      "Calles pavimentadas e iluminadas",
    ],
    seguridad: ["Vigilancia 24hs", "Control de accesos"],
    miradaBroker: {
      titular: "El primer barrio destino del interior del país.",
      parrafo:
        "Vida Lagoon es el primer barrio del corredor que entiende algo que en Miami ya está hecho hace 20 años: la gente no compra solo una casa, compra un estilo de vida. La laguna de 23.300 m² no es decoración, es la razón por la que vas a usar tu casa los 365 días del año. Si tu comprador puede pagarlo, es el barrio con mayor potencial de revalorización del corredor.",
    },
    perfilComprador: [
      "ABC1 que valora lifestyle sobre m²",
      "Familias con uso permanente + casa de fin de semana en un solo lugar",
      "Inversores apostando a apreciación de largo plazo",
      "Repatriados de Miami/Punta buscando un equivalente local",
    ],
    tags: ["laguna", "playa", "premium", "nautico", "tenis", "paddle", "futbol", "lifestyle"],
    tokko: {
      matchByTitle: ["vida lagoon"],
    },
    imagenes: {
      hero: "/barrios/vida-lagoon/hero.svg",
      galeria: [],
    },
    seo: {
      metaTitle: "Vida Lagoon, Funes — Lotes con vista a la laguna | SI Inmobiliaria",
      metaDescription:
        "Lotes en Vida Lagoon, Funes. 1.042 lotes con laguna cristalina de 23.300 m², playa de arena de cuarzo y deportes náuticos. Stock actualizado por SI Inmobiliaria.",
      keywordsLongTail: [
        "vida lagoon funes precios",
        "lote con laguna funes",
        "barrio con playa funes",
        "barrio con laguna cristalina rosario",
      ],
    },
  },

  // -------------------------------------------------------
  {
    slug: "vida-barrio-cerrado",
    nombre: "Vida Barrio Cerrado",
    nombreCompleto: "Vida — Un Barrio para Vivir",
    desarrollador: "Rosseti–Rosental",
    tier: "Consolidado con vida joven",
    estado: "en-desarrollo",
    zona: "funes",
    ubicacion: {
      direccionIngreso: "Av. Arturo Illia Bis y Golondrinas, Funes",
      referencia: "Acceso estratégico Av. Arturo Illia Bis y Golondrinas",
      accesos: ["Av. Arturo Illia Bis"],
    },
    datosDuros: {
      cantidadLotes: 294,
      medidaLoteDesde: 800,
      medidaLoteHasta: 1400,
      hectareasTotales: 35,
      distintivos: [
        "Centro comercial propio en ingreso (supermercado, locales, oficinas)",
        "Club House con +120 m² de paredes verdes",
        "Cerca del Aeropuerto Internacional Rosario y Shopping Fisherton Mall",
      ],
    },
    amenities: [
      { id: "clubhouse-verde", label: "Club House con paredes verdes", icon: ICON.clubhouse },
      { id: "bar", label: "Bar / Restaurante", icon: ICON.bar },
      { id: "lectura", label: "Sala de lectura", icon: ICON.clubhouse },
      { id: "piletas-2", label: "2 piletas descubiertas", icon: ICON.pileta },
      { id: "solarium", label: "Solárium con mobiliario", icon: ICON.playa },
      { id: "tenis-2", label: "2 canchas de tenis", icon: ICON.tenis },
      { id: "futbol-5", label: "Cancha de fútbol 5", icon: ICON.futbol },
      { id: "paddle", label: "Cancha de pádel", icon: ICON.paddle },
      { id: "quincho", label: "Quinchos", icon: ICON.quincho },
      { id: "juegos", label: "Juegos infantiles con arenero", icon: ICON.juegos },
      { id: "laguna", label: "Laguna", icon: ICON.laguna },
      { id: "comercial", label: "Espacio comercial propio en ingreso", icon: ICON.bar },
      { id: "seguridad-24", label: "Seguridad 24hs", icon: ICON.seguridad },
    ],
    infraestructura: [
      "Red eléctrica subterránea",
      "Planta de ósmosis inversa (agua)",
      "Red cloacal",
      "Red de gas natural",
      "Telecomunicaciones",
    ],
    seguridad: ["Vigilancia 24hs"],
    miradaBroker: {
      titular: "El barrio con servicios reales a la puerta.",
      parrafo:
        "Vida Barrio Cerrado tiene algo que ningún otro del corredor te ofrece: un centro comercial propio en el ingreso. Supermercado, locales, oficinas. Si te importa la comodidad real de vivir todos los días —no tener que manejar 10 minutos por una compra—, este es el barrio. La planificación está pensada por gente que vivió en barrios, no solo por gente que los vende.",
    },
    perfilComprador: [
      "Familias que valoran practicidad sobre lujo puro",
      "Compradores que quieren 'todo a mano' sin ser autosuficientes",
      "Profesionales con oficina en el corredor",
    ],
    tags: ["comercial", "paddle", "tenis", "futbol", "laguna", "ósmosis-inversa"],
    tokko: {
      matchByTitle: ["vida barrio cerrado", "vida un barrio"],
    },
    imagenes: { hero: "/barrios/vida-barrio-cerrado/hero.svg" },
    seo: {
      metaTitle: "Vida Barrio Cerrado, Funes — Lotes con centro comercial | SI Inmobiliaria",
      metaDescription:
        "294 lotes de 800 a 1.400 m² en Vida Barrio Cerrado, Funes. Único con centro comercial propio en el ingreso. Stock y precios por SI Inmobiliaria.",
      keywordsLongTail: [
        "vida barrio cerrado funes",
        "barrio privado con supermercado funes",
        "lote 800 m2 funes",
      ],
    },
  },

  // -------------------------------------------------------
  {
    slug: "vida-club-de-campo",
    nombre: "Vida Club de Campo",
    nombreCompleto: "Vida Club de Campo",
    desarrollador: "Rosseti–Rosental",
    tier: "En desarrollo",
    estado: "en-desarrollo",
    zona: "funes",
    ubicacion: {
      direccionIngreso: "Av. Arturo Illia Bis y Golondrinas, Funes",
      referencia:
        "Funes, sobre Av. Arturo Illia, en el límite con Rosario. A minutos del Aeropuerto Internacional Rosario y del Shopping Fisherton Mall.",
      accesos: ["Av. Arturo Illia Bis", "Acceso al Aeropuerto Rosario", "Autopista (vía Av. Illia)"],
    },
    datosDuros: {
      cantidadLotes: 659,
      medidaLoteDesde: 1000,
      medidaLoteHasta: 1270,
      hectareasTotales: 135,
      distintivos: [
        "Club House de autor en hormigón visto y madera (planta octogonal con jardín central)",
        "Practice de golf propio con 3 greens-isla — caso raro fuera de Kentucky",
        "Set de 7-8 canchas de tenis de polvo de ladrillo junto al reservorio",
        "Portal de ingreso de diseño en hormigón visto sobre canal de agua",
        "Lotes grandes y uniformes (1.000-1.270 m²)",
        "Área comercial proyectada de 50.000 m² (supermercado, locales, oficinas)",
        "Cercanía al Aeropuerto Internacional Rosario",
      ],
    },
    amenities: [
      { id: "clubhouse", label: "Club House de autor", icon: ICON.clubhouse },
      { id: "practice-golf", label: "Practice de golf con greens-isla", icon: ICON.golf },
      { id: "tenis-multi", label: "7-8 canchas de tenis de polvo de ladrillo", icon: ICON.tenis },
      { id: "paddle", label: "Canchas de paddle", icon: ICON.paddle },
      { id: "futbol", label: "Cancha de fútbol", icon: ICON.futbol },
      { id: "bar", label: "Bar / Restaurante en Club House", icon: ICON.bar },
      { id: "lectura", label: "Sala de lectura", icon: ICON.clubhouse },
      { id: "quincho-2", label: "2 quinchos para eventos", icon: ICON.quincho },
      { id: "piscinas", label: "Piscinas adultos y niños", icon: ICON.pileta },
      { id: "solarium", label: "Solárium con mobiliario", icon: ICON.playa },
      { id: "juegos", label: "Juegos infantiles", icon: ICON.juegos },
      { id: "reservorio", label: "Reservorio de agua propio", icon: ICON.laguna },
      { id: "seguridad-24", label: "Seguridad 24hs", icon: ICON.seguridad },
    ],
    infraestructura: [
      "Agua potable",
      "Luz (red eléctrica subterránea)",
      "Cloacas",
      "Calles asfaltadas e iluminadas",
      "Cable e internet",
    ],
    seguridad: ["Vigilancia 24hs", "Portal de control de acceso", "Cerco perimetral"],
    miradaBroker: {
      titular: "Tiene practice de golf propio. El secreto mejor guardado del corredor.",
      parrafo:
        "Vida Club de Campo es el barrio que más me sorprendió cuando lo recorrí en obra. La gente lo conoce por los lotes grandes (1.000-1.270 m² uniformes), pero pocos saben que tiene practice de golf con tres greens-isla dentro del barrio. Eso, sumado a un Club House de autor en hormigón visto y madera, y siete u ocho canchas de tenis de polvo de ladrillo frente al reservorio, te pone a un escalón de Kentucky con un ticket muy distinto. La otra mitad ya tiene casas habitadas, así que no estás comprando una promesa sino un barrio que ya está viviendo. Si viajás seguido, sumá que estás a minutos del Aeropuerto de Rosario.",
    },
    perfilComprador: [
      "Compradores que quieren lote grande (1.000 m²) como base",
      "Golfistas que no quieren pagar Kentucky pero quieren practicar",
      "Familias deportivas (mucho tenis disponible)",
      "Viajeros frecuentes que valoran cercanía al aeropuerto",
    ],
    tags: ["lotes-grandes", "practice-golf", "aeropuerto", "tenis", "paddle", "futbol", "clubhouse-diseño", "reservorio"],
    tokko: { matchByTitle: ["vida club de campo"] },
    imagenes: {
      hero: "/barrios/vida-club-de-campo/hero-clubhouse-octogonal.jpg",
      galeria: [
        "/barrios/vida-club-de-campo/clubhouse-interior-techo-madera.jpg",
        "/barrios/vida-club-de-campo/clubhouse-jardin-central.jpg",
        "/barrios/vida-club-de-campo/clubhouse-vista-frontal.jpg",
        "/barrios/vida-club-de-campo/clubhouse-arquitectura.jpg",
        "/barrios/vida-club-de-campo/aerea-clubhouse-practice.jpg",
        "/barrios/vida-club-de-campo/practice-golf-tenis.jpg",
        "/barrios/vida-club-de-campo/practice-golf-detalle.jpg",
        "/barrios/vida-club-de-campo/tenis-aerea.jpg",
        "/barrios/vida-club-de-campo/tenis-paddle-paisaje.jpg",
        "/barrios/vida-club-de-campo/portal-ingreso-aereo.jpg",
        "/barrios/vida-club-de-campo/portal-ingreso-detalle.jpg",
        "/barrios/vida-club-de-campo/aerea-barrio-completo.jpg",
        "/barrios/vida-club-de-campo/aerea-lotes-casas.jpg",
        "/barrios/vida-club-de-campo/cenital-clubhouse-conjunto.jpg",
        "/barrios/vida-club-de-campo/conjunto-vertical.jpg",
      ],
    },
    seo: {
      metaTitle: "Vida Club de Campo, Funes — Practice de golf, Club House de autor y lotes de 1.000 m² | SI Inmobiliaria",
      metaDescription:
        "Vida Club de Campo: 659 lotes de 1.000 m² con practice de golf, Club House de autor en hormigón visto y 7 canchas de tenis. A minutos del Aeropuerto Rosario. Stock por SI Inmobiliaria.",
      keywordsLongTail: [
        "vida club de campo funes",
        "lote 1000 m2 funes",
        "barrio cerrado cerca aeropuerto rosario",
      ],
    },
  },

  // -------------------------------------------------------
  {
    slug: "vida-jardin",
    nombre: "Vida Jardín",
    nombreCompleto: "Vida Jardín",
    desarrollador: "Rosseti–Rosental",
    tier: "En desarrollo",
    estado: "en-desarrollo",
    zona: "funes",
    ubicacion: {
      referencia: "Funes, sobre autopista Rosario–Córdoba y Av. Fuerza Aérea",
      accesos: ["Autopista Rosario–Córdoba", "Av. Fuerza Aérea"],
    },
    datosDuros: {
      cantidadLotes: 242,
      medidaLoteDesde: 800,
      medidaLoteHasta: 1100,
      distintivos: ["Acceso directo a autopista", "Set deportivo: tenis, pádel y fútbol"],
    },
    amenities: [
      { id: "clubhouse", label: "Club House", icon: ICON.clubhouse },
      { id: "bar", label: "Bar / Restaurant", icon: ICON.bar },
      { id: "piscina", label: "Piscina", icon: ICON.pileta },
      { id: "tenis", label: "Canchas de tenis", icon: ICON.tenis },
      { id: "futbol", label: "Cancha de fútbol", icon: ICON.futbol },
      { id: "paddle", label: "Cancha de pádel", icon: ICON.paddle },
      { id: "vestuarios", label: "Vestuarios", icon: ICON.clubhouse },
      { id: "bicisendas", label: "Bicisendas", icon: ICON.bicisenda },
      { id: "relax", label: "Área de relax", icon: ICON.parquizado },
      { id: "juegos", label: "Juegos para niños", icon: ICON.juegos },
      { id: "quincho", label: "Quinchos", icon: ICON.quincho },
      { id: "laguna", label: "Laguna", icon: ICON.laguna },
      { id: "seguridad-24", label: "Seguridad 24hs", icon: ICON.seguridad },
    ],
    infraestructura: [
      "Energía por tendido subterráneo",
      "Alumbrado público",
      "Agua por ósmosis inversa",
      "Gas natural",
      "Telecomunicaciones",
      "Red cloacal",
    ],
    seguridad: ["Vigilancia 24hs"],
    miradaBroker: {
      titular: "Acceso directo a la autopista y deportes en serio.",
      parrafo:
        "Si te importa más el tiempo de viaje que el branding del barrio, Vida Jardín es muy difícil de superar en Funes. Estás sobre la autopista, sobre Av. Fuerza Aérea, y a la vez adentro del paraguas Vida. Para alguien que va y vuelve a Rosario todos los días, esto cambia la calidad de vida más que cualquier amenity. Sumale tenis, pádel y fútbol dentro del perímetro y te ahorra la cuota de club.",
    },
    perfilComprador: [
      "Familias jóvenes con hijos en edad deportiva",
      "Profesionales que viajan diario a Rosario",
      "Compradores que buscan dentro del universo Rosseti con ticket más accesible",
    ],
    tags: ["paddle", "tenis", "futbol", "deportes", "autopista", "bicisendas", "ósmosis-inversa"],
    tokko: { matchByTitle: ["vida jardin", "vida jardín"] },
    imagenes: { hero: "/barrios/vida-jardin/hero.jpg" },
    seo: {
      metaTitle: "Vida Jardín, Funes — Lotes deportivos sobre autopista | SI Inmobiliaria",
      metaDescription:
        "242 lotes de 800 a 1.100 m² en Vida Jardín, Funes. Acceso directo a la autopista, canchas de tenis, pádel y fútbol. Stock por SI Inmobiliaria.",
      keywordsLongTail: [
        "vida jardin funes",
        "barrio con paddle funes",
        "lote sobre autopista funes",
      ],
    },
  },

  // -------------------------------------------------------
  {
    slug: "vida-green",
    nombre: "Vida Green",
    nombreCompleto: "Vida Green",
    desarrollador: "Rosseti–Rosental",
    tier: "En desarrollo",
    estado: "en-desarrollo",
    zona: "funes",
    ubicacion: {
      direccionIngreso: "Bv. Mitre y Colonos de Funes, Funes",
      referencia: "Funes, sector norte (zona de gran crecimiento y proyección), entre Funes City y Funes Norte",
      accesos: ["Autopista Rosario–Córdoba (cercana)", "Av. Fuerza Aérea (cercana)"],
    },
    datosDuros: {
      cantidadLotes: 419,
      medidaLoteDesde: 500,
      medidaLoteHasta: 700,
      distintivos: ["Ticket más accesible del universo Vida", "Set deportivo amplio", "Entrega prevista: mediados 2026"],
    },
    amenities: [
      { id: "clubhouse", label: "Club House", icon: ICON.clubhouse },
      { id: "paddle-2", label: "2 canchas de pádel", icon: ICON.paddle },
      { id: "futbol-2", label: "2 canchas de fútbol", icon: ICON.futbol },
      { id: "tenis-4", label: "4 canchas de tenis", icon: ICON.tenis },
      { id: "piscinas", label: "Piscinas adultos y niños", icon: ICON.pileta },
      { id: "juegos", label: "Juegos para niños", icon: ICON.juegos },
      { id: "quincho", label: "Quinchos", icon: ICON.quincho },
      { id: "relax", label: "Área de relax", icon: ICON.parquizado },
      { id: "laguna", label: "Laguna", icon: ICON.laguna },
      { id: "seguridad-24", label: "Seguridad 24hs", icon: ICON.seguridad },
    ],
    infraestructura: [
      "Red eléctrica subterránea",
      "Red de telecomunicaciones",
      "Planta de ósmosis inversa (agua)",
      "Red cloacal",
    ],
    seguridad: ["Vigilancia 24hs"],
    miradaBroker: {
      titular: "La entrada accesible al universo Vida.",
      parrafo:
        "Vida Green es la puerta de entrada al ecosistema Vida con el ticket más accesible. Los lotes son más chicos (500-700 m²) que en el resto de los Vida, pero a cambio bajás el precio de entrada considerablemente. Detalle no menor: 4 canchas de tenis y 2 de pádel para 419 lotes; la proporción amenities/lotes acá es mejor que en barrios más caros.",
    },
    perfilComprador: [
      "Familias jóvenes en su primer barrio cerrado",
      "Compradores que priorizan precio de entrada y comunidad armada",
      "Deportistas que quieren amenities accesibles sin pagar premium",
    ],
    tags: ["accesible", "paddle", "tenis", "futbol", "laguna", "ticket-medio"],
    tokko: { matchByTitle: ["vida green"] },
    imagenes: { hero: "/barrios/vida-green/hero.svg" },
    seo: {
      metaTitle: "Vida Green, Funes — Lotes desde 500 m² | SI Inmobiliaria",
      metaDescription:
        "419 lotes de 500 a 700 m² en Vida Green, Funes. La entrada más accesible al universo Vida, con tenis, pádel y fútbol. Stock por SI Inmobiliaria.",
      keywordsLongTail: [
        "vida green funes precios",
        "lote 500 m2 barrio privado funes",
        "barrio cerrado accesible funes",
      ],
    },
  },

  // -------------------------------------------------------
  {
    slug: "kentucky",
    nombre: "Kentucky",
    nombreCompleto: "Kentucky Club de Campo",
    desarrollador: "Kentucky Club de Campo",
    tier: "Premium",
    estado: "consolidado",
    zona: "funes",
    ubicacion: {
      referencia: "Funes, sobre autopista Rosario–Córdoba, en lo más alto de Funes",
      distanciaCentroRosarioMin: 15,
      accesos: ["Autopista Rosario–Córdoba"],
    },
    datosDuros: {
      hectareasTotales: 242,
      cantidadLotes: 676,
      medidaLoteDesde: 1200,
      medidaLoteHasta: 1200,
      distintivos: [
        "Campo de golf de 18 hoyos (único en el corredor)",
        "Lago artificial 7 hectáreas",
        "Añosas arboledas y tierras altas",
        "242 hectáreas — el más grande del corredor",
        "Diseño urbano de Estudio BO (los mismos de San Sebastián y Funes Lakes)",
        "Lotes ocupan solo el 36% del área total (resto verde + amenities)",
      ],
    },
    amenities: [
      { id: "golf-18", label: "Campo de golf 18 hoyos", icon: ICON.golf },
      { id: "lago-7ha", label: "Lago artificial 7 ha", icon: ICON.laguna },
      { id: "clubhouse", label: "Club House", icon: ICON.clubhouse },
      { id: "tenis", label: "Canchas de tenis", icon: ICON.tenis },
      { id: "futbol", label: "Cancha de fútbol", icon: ICON.futbol },
      { id: "parquizado", label: "Añosas arboledas", icon: ICON.parquizado },
      { id: "seguridad-24", label: "Seguridad 24hs", icon: ICON.seguridad },
    ],
    infraestructura: [
      "Servicios completos (agua, luz, gas, cloacas)",
      "Generador eléctrico de respaldo en todo el barrio",
      "Caldera central",
      "Calles internas pavimentadas y forestadas",
    ],
    seguridad: ["Vigilancia 24hs", "Cerco perimetral"],
    miradaBroker: {
      titular: "El único con golf de 18 hoyos. El clásico del corredor.",
      parrafo:
        "Kentucky es el barrio que recomiendo cuando un comprador me dice 'quiero algo distinto'. Es el único del corredor con campo de golf de 18 hoyos dentro del perímetro, sumado a 242 hectáreas y arboledas que tardan 50 años en formarse. No es para todos —el ticket es alto y el barrio es más maduro, no de moda— pero es el de mayor identidad propia de toda la zona. Acá no estás comprando lifestyle, estás comprando pertenencia.",
    },
    perfilComprador: [
      "Golfistas (uso del campo es razón #1 de compra)",
      "Compradores maduros que ya pasaron por barrios de moda",
      "ABC1 que valora arboleda madura y privacidad",
      "Familias que quieren el 'clásico' del corredor",
    ],
    tags: ["golf", "premium", "consolidado", "lago", "tenis", "arboleda-madura", "tierras-altas", "diseño-estudio-bo"],
    tokko: { matchByTitle: ["kentucky"] },
    imagenes: { hero: "/barrios/kentucky/hero.jpg" },
    seo: {
      metaTitle: "Kentucky Club de Campo, Funes — Lotes con golf 18 hoyos | SI Inmobiliaria",
      metaDescription:
        "Kentucky Club de Campo: 242 hectáreas, campo de golf 18 hoyos, lago de 7 ha y arboleda madura. El barrio más consolidado y exclusivo del corredor. SI Inmobiliaria.",
      keywordsLongTail: [
        "kentucky club de campo funes",
        "barrio con golf funes",
        "lote en kentucky precios",
        "barrio cerrado premium funes",
      ],
    },
  },

  // -------------------------------------------------------
  {
    slug: "funes-hills-san-marino",
    nombre: "Funes Hills San Marino",
    nombreCompleto: "Funes Hills San Marino",
    desarrollador: "Funes Hills",
    tier: "Consolidado",
    estado: "consolidado",
    zona: "funes",
    ubicacion: {
      referencia: "Funes, sobre Av. Fuerza Aérea, entre Cadaqués (al norte) y otros barrios consolidados",
      direccionIngreso: "Av. Fuerza Aérea 2300, Funes",
      accesos: ["Av. Fuerza Aérea", "Autopista Rosario–Córdoba (cercana)"],
    },
    datosDuros: {
      distintivos: ["Grupo electrógeno para todas las unidades (raro y diferencial)", "Barrio chico, comunidad consolidada"],
    },
    amenities: [
      { id: "clubhouse", label: "Club House con restaurant", icon: ICON.clubhouse },
      { id: "futbol", label: "Cancha de fútbol", icon: ICON.futbol },
      { id: "tenis-2", label: "2 canchas de tenis", icon: ICON.tenis },
      { id: "quincho", label: "Quincho con parrillero", icon: ICON.quincho },
      { id: "pileta", label: "Pileta", icon: ICON.pileta },
      { id: "electrogeno", label: "Grupo electrógeno para todas las unidades", icon: ICON.electrogeno },
      { id: "seguridad-24", label: "Seguridad 24hs", icon: ICON.seguridad },
    ],
    infraestructura: [
      "Servicios completos (agua, luz, gas, cloacas)",
      "Grupo electrógeno integrado",
      "Calles asfaltadas iluminadas",
    ],
    seguridad: ["Vigilancia 24hs"],
    miradaBroker: {
      titular: "Comunidad chica y grupo electrógeno para todas las unidades.",
      parrafo:
        "Funes Hills San Marino tiene un detalle que casi nadie tiene en el corredor: grupo electrógeno para todas las unidades. Cuando se corta la luz en Funes (y se corta), tu casa sigue funcionando. Para quien trabaja desde casa o tiene chicos, eso vale más que tres amenities. Es un barrio chico, prolijo y muy bien mantenido —y eso es una virtud, no un defecto: te conocés con los vecinos y las decisiones de consorcio son rápidas.",
    },
    perfilComprador: [
      "Compradores que valoran privacidad y comunidad chica",
      "Profesionales que trabajan desde casa (grupo electrógeno)",
      "Familias que no quieren la masa de barrios de +500 lotes",
    ],
    tags: ["comunidad-chica", "grupo-electrogeno", "tenis", "futbol", "pileta"],
    tokko: { matchByTitle: ["san marino", "funes hills san marino"] },
    imagenes: { hero: "/barrios/funes-hills-san-marino/hero.svg" },
    seo: {
      metaTitle: "Funes Hills San Marino — Barrio cerrado con grupo electrógeno | SI Inmobiliaria",
      metaDescription:
        "Funes Hills San Marino: barrio cerrado consolidado en Funes con grupo electrógeno propio. Comunidad chica, tenis, fútbol, pileta. Stock por SI Inmobiliaria.",
      keywordsLongTail: [
        "funes hills san marino",
        "barrio con grupo electrogeno funes",
        "barrio cerrado chico funes",
      ],
    },
  },

  // -------------------------------------------------------
  {
    slug: "funes-hills-cadaques",
    nombre: "Funes Hills Cadaqués",
    nombreCompleto: "Funes Hills Cadaqués",
    desarrollador: "Funes Hills",
    tier: "Consolidado",
    estado: "consolidado",
    zona: "funes",
    ubicacion: {
      referencia: "Funes, tierras altas — sobre Av. Fuerza Aérea (altura 3100), próximo a calle Galindo y al acceso a la Autopista",
      direccionIngreso: "Av. Fuerza Aérea 3100, Funes",
      distanciaCentroRosarioMin: 25,
      accesos: ["Av. Fuerza Aérea", "Autopista Rosario–Córdoba (vía calle Galindo)", "Tres vías de acceso"],
    },
    datosDuros: {
      medidaLoteDesde: 800,
      medidaLoteHasta: 950,
      distintivos: [
        "Boulevard central forestado desde el ingreso",
        "Tierras altas (mejor drenaje)",
        "Lotes estándar 800 m² (20 × 40 m)",
        "Barrio maduro de 15-20+ años (forestación 100% desarrollada)",
      ],
    },
    amenities: [
      { id: "clubhouse", label: "Club House con restaurant", icon: ICON.clubhouse },
      { id: "futbol", label: "Cancha de fútbol", icon: ICON.futbol },
      { id: "tenis", label: "Cancha de tenis", icon: ICON.tenis },
      { id: "quincho", label: "Quincho con parrilleros", icon: ICON.quincho },
      { id: "pileta", label: "Pileta", icon: ICON.pileta },
      { id: "parquizado", label: "Boulevard central forestado", icon: ICON.parquizado },
      { id: "seguridad-24", label: "Seguridad 24hs", icon: ICON.seguridad },
    ],
    infraestructura: [
      "Servicios completos (agua, luz, gas, cloacas)",
      "Calles asfaltadas",
      "Cableado subterráneo",
    ],
    seguridad: ["Vigilancia 24hs", "Acceso controlado"],
    miradaBroker: {
      titular: "Punto medio justo. Tierras altas y boulevard forestado.",
      parrafo:
        "Cadaqués es el barrio que recomiendo cuando alguien me dice 'no quiero algo enorme ni algo chico, quiero el punto medio'. Tiene Boulevard Central forestado, tierras altas (importante para drenaje y vista), y un set de amenities suficiente sin caer en sobreoferta. El detalle de las 'tierras altas' no es marketing —en Funes, la cota importa cuando llueve—. Es de los barrios mejor balanceados del corredor en relación precio-calidad-tamaño.",
    },
    perfilComprador: [
      "Compradores que buscan punto medio (ni mega-barrio ni minúsculo)",
      "Familias que valoran forestación madura desde el día uno",
      "Compradores conscientes de la zona (saben que la cota importa)",
    ],
    tags: ["tierras-altas", "forestacion-madura", "tenis", "futbol", "pileta", "consolidado"],
    tokko: { matchByTitle: ["cadaques", "cadaqués", "funes hills cadaques"] },
    imagenes: { hero: "/barrios/funes-hills-cadaques/hero.svg" },
    seo: {
      metaTitle: "Funes Hills Cadaqués — Barrio cerrado en tierras altas | SI Inmobiliaria",
      metaDescription:
        "Funes Hills Cadaqués: barrio cerrado consolidado en tierras altas de Funes, con boulevard central forestado, tenis, fútbol y pileta. SI Inmobiliaria.",
      keywordsLongTail: [
        "funes hills cadaques",
        "barrio cerrado tierras altas funes",
        "barrio con boulevard forestado",
      ],
    },
  },

  // -------------------------------------------------------
  {
    slug: "funes-lakes",
    nombre: "Funes Lakes",
    nombreCompleto: "Funes Lakes — Barrio Náutico",
    desarrollador: "Funes Lakes (diseño: Estudio BO)",
    tier: "En desarrollo",
    estado: "en-desarrollo",
    zona: "funes",
    ubicacion: {
      direccionIngreso: "Cimarrón entre calle Rodríguez y Av. Fuerza Aérea, Funes",
      referencia: "Funes, junto a San Sebastián, Vida y Aguadas",
      distanciaCentroRosarioMin: 20,
      accesos: [
        "Autopista Rosario–Córdoba (Garita 15 o conexión calle Jujuy)",
        "Ruta Nacional 9",
        "Av. Fuerza Aérea",
      ],
    },
    datosDuros: {
      cantidadLotes: 485,
      medidaLoteDesde: 500,
      medidaLoteHasta: 790,
      hectareasTotales: 50,
      distintivos: [
        "100% de los lotes con salida privada al agua",
        "8 islas independientes interconectadas (Singapur, Sumatra, Borneo, Bali, Java, Timor, Komodo, Guinea)",
        "10 km de costa lineal",
        "20 hectáreas de lagos y canales (de 50 ha totales)",
        "Diseño Estudio BO (los mismos de San Sebastián y Kentucky)",
        "Único barrio náutico del corredor",
      ],
    },
    amenities: [
      { id: "nautica-sin-motor", label: "Deportes náuticos sin motor (kayak, paddle surf, windsurf)", icon: ICON.nautico },
      { id: "playas-arena", label: "Playas de arena artificial", icon: ICON.playa },
      { id: "muelles", label: "Muelles de uso común", icon: ICON.muelle },
      { id: "piletas-3", label: "3 piletas aterrazadas con solárium", icon: ICON.pileta },
      { id: "clubhouse-sum", label: "Club House con SUM", icon: ICON.clubhouse },
      { id: "restaurante", label: "Restaurante", icon: ICON.bar },
      { id: "gym-vidriado", label: "Gimnasio vidriado con vistas a canales", icon: ICON.gym },
      { id: "coworking", label: "Coworking integrado", icon: ICON.coworking },
      { id: "tenis-3", label: "3 canchas de tenis", icon: ICON.tenis },
      { id: "paddle", label: "Canchas de pádel", icon: ICON.paddle },
      { id: "futbol", label: "Cancha de fútbol", icon: ICON.futbol },
      { id: "running", label: "Circuito running perimetral", icon: ICON.bicisenda },
      { id: "juegos", label: "Juegos infantiles", icon: ICON.juegos },
      { id: "seguridad-triple", label: "Seguridad triple anillo", icon: ICON.seguridad },
    ],
    infraestructura: [
      "Planta potabilizadora propia (agua interna)",
      "Red interna de cloacas conectada a infraestructura urbana",
      "Red eléctrica domiciliaria 100% subterránea",
      "Alumbrado público LED",
      "Canalizaciones preparadas para fibra óptica",
      "Conexión proyectada a red de gas natural",
      "Pavimentación de alta resistencia (calles internas + boulevard central)",
    ],
    seguridad: [
      "Primer anillo: control de acceso general 24hs",
      "Segundo anillo: control vehicular independiente por cada una de las 8 islas",
      "Tercer anillo: cerco perimetral inteligente con sensores, cámaras y patrullaje",
    ],
    miradaBroker: {
      titular: "El único barrio náutico real del interior del país.",
      parrafo:
        "Funes Lakes es el único barrio del corredor donde podés sacar el kayak desde el fondo de tu casa. No es un barrio con laguna, es un archipiélago con 10 km de costa privada repartidos en 8 islas. Si tu comprador valoró alguna vez una propiedad frente al agua, este es el único producto del interior del país que se le parece a Tigre o Nordelta sin moverse de Funes. El detalle del segundo anillo de seguridad por isla es algo que ningún otro barrio puede ofrecer por diseño.",
    },
    perfilComprador: [
      "ABC1 que ya conoce Nordelta/Tigre y busca equivalente sin irse de Rosario",
      "Familias con afición náutica (kayak, paddle surf)",
      "Compradores que valoran privacidad por diseño (segundo anillo por isla)",
      "Inversores apostando a la escasez del producto 'lote con agua propia'",
      "Argentinos repatriados que buscan lifestyle internacional cerca de su origen",
    ],
    tags: ["nautico", "laguna", "premium", "diseño-estudio-bo", "playa", "coworking", "kayak", "paddle-surf"],
    tokko: { matchByTitle: ["funes lakes"] },
    imagenes: { hero: "/barrios/funes-lakes/hero.svg" },
    seo: {
      metaTitle: "Funes Lakes — El único barrio náutico de Funes | SI Inmobiliaria",
      metaDescription:
        "Funes Lakes: 409 lotes con salida privada al agua, 8 islas, 10 km de costa. Único barrio náutico del corredor de Funes. Stock y análisis por SI Inmobiliaria.",
      keywordsLongTail: [
        "funes lakes precios",
        "lote con agua privada funes",
        "barrio náutico rosario",
        "lote frente al agua funes",
        "barrio cerrado con kayak funes",
      ],
    },
  },

  // -------------------------------------------------------
  {
    slug: "funes-hills-miraflores",
    nombre: "Funes Hills Miraflores",
    nombreCompleto: "Funes Hills Miraflores",
    desarrollador: "Funes Hills",
    tier: "Consolidado",
    estado: "consolidado",
    zona: "funes",
    ubicacion: {
      direccionIngreso: "Av. Fuerza Aérea 4204, Funes",
      referencia: "Funes, sobre Av. Fuerza Aérea (altura 4200), próximo al acceso de calle Galindo. Cul de sac en sectores premium.",
      distanciaCentroRosarioMin: 20,
      accesos: ["Autopista Rosario–Córdoba", "Av. Fuerza Aérea", "Calle Galindo"],
    },
    datosDuros: {
      cantidadLotes: 308,
      medidaLoteDesde: 800,
      medidaLoteHasta: 1215,
      distintivos: [
        "Rotonda en el ingreso con centros de salud, comercios, panaderías y gimnasios",
        "4 canchas de tenis de polvo de ladrillo",
        "Doble vía de acceso controlado",
        "Forestación desarrollada (uno de los consolidados de referencia)",
        "308 lotes 800-1.215 m² (un caso de cul de sac premium)",
      ],
    },
    amenities: [
      { id: "clubhouse-restaurante", label: "Club House con restaurante exclusivo", icon: ICON.clubhouse },
      { id: "sum", label: "SUM para eventos", icon: ICON.clubhouse },
      { id: "delivery-interno", label: "Delivery interno", icon: ICON.bar },
      { id: "piscina-solarium", label: "Piscina común con solárium parquizado", icon: ICON.pileta },
      { id: "tenis-4-polvo", label: "4 canchas de tenis (polvo de ladrillo)", icon: ICON.tenis },
      { id: "futbol-profesional", label: "Canchas de fútbol profesionales", icon: ICON.futbol },
      { id: "quincho-2", label: "2 quinchos cerrados con parrilleros", icon: ICON.quincho },
      { id: "juegos-madera", label: "Juegos infantiles de madera", icon: ICON.juegos },
      { id: "areas-verdes-bici", label: "Áreas verdes para bicicletas", icon: ICON.bicisenda },
      { id: "seguridad-24", label: "Seguridad 24hs", icon: ICON.seguridad },
    ],
    infraestructura: [
      "Cableado eléctrico subterráneo (sin contaminación visual)",
      "Red interna de agua potable",
      "Gas natural",
      "Cloacas",
      "Calles internas pavimentadas",
      "Alumbrado público integrado",
    ],
    seguridad: [
      "Monitoreo 24hs (cámaras + personal físico)",
      "Doble vía de acceso controlado por guardias",
    ],
    miradaBroker: {
      titular: "El barrio más práctico del corredor. Tenis serio.",
      parrafo:
        "Miraflores tiene algo que casi ningún barrio del corredor te ofrece: salís a la rotonda del ingreso y ya tenés panaderías, centros de salud, gimnasios y comercios. Eso significa que vivir ahí no te obliga a planificar cada salida. Sumado a 4 canchas de tenis de polvo de ladrillo (el formato que importa para el que juega en serio) y un Club House con delivery interno, es un barrio diseñado para usarse, no solo para mostrarse.",
    },
    perfilComprador: [
      "Familias que priorizan 'salir y tener todo cerca'",
      "Tenistas serios (canchas de polvo de ladrillo)",
      "Compradores que buscan barrio consolidado, no proyecto",
      "Profesionales con consultorio/gimnasio cerca del ingreso",
    ],
    tags: ["consolidado", "tenis-polvo-ladrillo", "futbol", "pileta", "servicios-ingreso", "delivery-interno"],
    tokko: { matchByTitle: ["miraflores", "funes hills miraflores"] },
    imagenes: { hero: "/barrios/funes-hills-miraflores/hero.jpg" },
    seo: {
      metaTitle: "Funes Hills Miraflores — Lotes y casas en venta | SI Inmobiliaria",
      metaDescription:
        "Funes Hills Miraflores: barrio consolidado en Av. Fuerza Aérea 3102, Funes. Lotes de 800-850 m², 4 canchas de tenis de polvo de ladrillo y servicios en el ingreso. SI Inmobiliaria.",
      keywordsLongTail: [
        "funes hills miraflores casas en venta",
        "lote en miraflores funes precio",
        "barrio cerrado consolidado funes",
      ],
    },
  },

  // -------------------------------------------------------
  // Datos: masterplan oficial del barrio (public/barrios/aguadas/plano.pdf)
  // + relevamiento web jun-2026 (servicios y amenities publicados del barrio).
  {
    slug: "aguadas",
    nombre: "Aguadas",
    nombreCompleto: "Aguadas Barrio Cerrado",
    desarrollador: "Aguadas Barrio Cerrado",
    tier: "Consolidado",
    estado: "consolidado",
    zona: "funes",
    subtitulo: "El consolidado de la zona sur de Funes",
    ubicacion: {
      direccionIngreso: "H. Yrigoyen, Funes",
      referencia:
        "Zona sur de Funes, sobre la colectora de la autopista Rosario–Córdoba, vecino de San Sebastián",
      coordenadas: { lat: -32.9394, lng: -60.8117 },
      distanciaCentroRosarioMin: 25,
      accesos: ["Autopista Rosario–Córdoba (colectora)", "Calle Mendoza"],
    },
    datosDuros: {
      cantidadLotes: 234,
      medidaLoteDesde: 800,
      medidaLoteHasta: 1176,
      distintivos: [
        "Masterplan de 234 lotes con Club House y putting green",
        "Doble ingreso: H. Yrigoyen y colectora de autopista",
        "Piscina climatizada y kínder dentro del barrio",
        "CCTV digital con acceso web (cámaras internas y perimetrales)",
        "Lote estándar 800 m² (20 × 40 m)",
      ],
    },
    amenities: [
      { id: "clubhouse", label: "Club House", icon: ICON.clubhouse },
      { id: "pileta-climatizada", label: "Piscina climatizada", icon: ICON.pileta },
      { id: "putting-green", label: "Putting green", icon: ICON.golf },
      { id: "tenis", label: "Canchas de tenis", icon: ICON.tenis },
      { id: "gym", label: "Gimnasio", icon: ICON.gym },
      { id: "seguridad-24", label: "Seguridad 24hs", icon: ICON.seguridad },
      { id: "futbol", label: "Cancha de fútbol", icon: ICON.futbol },
      { id: "juegos", label: "Juegos infantiles y kínder", icon: ICON.juegos },
      { id: "bar", label: "Bar y restaurant", icon: ICON.bar },
    ],
    infraestructura: [
      "Agua corriente, gas natural y desagüe cloacal",
      "Tendido eléctrico subterráneo",
      "Internet y circuito cerrado de TV digital con acceso web",
    ],
    seguridad: [
      "Vigilancia 24hs",
      "Cámaras internas y perimetrales con monitoreo digital",
    ],
    miradaBroker: {
      titular: "El consolidado discreto de la zona sur — y vecino del futuro Aguadas Lakes.",
      parrafo:
        "Aguadas es de esos barrios que no hacen ruido pero acumulan valor. Masterplan prolijo de 234 lotes con Club House, putting green y piscina climatizada, servicios completos con cableado subterráneo, y doble acceso que te pone en la autopista en un minuto. El dato que miro como broker: al lado se desarrolla Aguadas Lakes, y cuando un sector recibe un proyecto de esa escala, los barrios consolidados linderos son los primeros en capitalizarlo.",
    },
    perfilComprador: [
      "Familias que buscan un consolidado con amenities completos sin ticket premium",
      "Compradores que priorizan el acceso rápido a la autopista",
      "Inversores atentos a la revalorización de la zona sur por Aguadas Lakes",
    ],
    tags: ["consolidado", "tenis", "futbol", "pileta"],
    tokko: { matchByTitle: ["aguadas"] },
    imagenes: { hero: "/barrios/aguadas/01.webp" },
    seo: {
      metaTitle: "Aguadas Barrio Cerrado, Funes — Lotes y casas en venta | SI Inmobiliaria",
      metaDescription:
        "Aguadas: barrio cerrado consolidado en la zona sur de Funes, sobre la colectora de la autopista. 234 lotes desde 800 m², Club House, piscina climatizada y seguridad 24hs. SI Inmobiliaria.",
      keywordsLongTail: [
        "aguadas barrio cerrado funes",
        "lote en aguadas funes precio",
        "barrio cerrado zona sur funes",
        "aguadas funes casas en venta",
      ],
    },
  },
];

// Merge editorial SEO data al BARRIOS al cargar el módulo.
// El spread editorial GANA sobre la entrada base — la fuente de verdad del
// contenido SEO (intro, mirada del broker, FAQ, etc.) es barrios-editorial-data.ts.
import { BARRIOS_EDITORIAL as _BARRIOS_EDITORIAL } from "./barrios-editorial-data";
for (const _b of BARRIOS) {
  const _ed = _BARRIOS_EDITORIAL[_b.slug];
  if (_ed) Object.assign(_b, _ed);
}

// Helpers para componentes
export const getBarrioBySlug = (slug: string): Barrio | undefined =>
  BARRIOS.find((b) => b.slug === slug);

export const getBarriosByTier = (tier: BarrioTier): Barrio[] =>
  BARRIOS.filter((b) => b.tier === tier);

export const getBarriosByTag = (tag: string): Barrio[] =>
  BARRIOS.filter((b) => b.tags.includes(tag));

export const getAllTags = (): string[] =>
  Array.from(new Set(BARRIOS.flatMap((b) => b.tags))).sort();

export const TAG_LABELS: Record<string, string> = {
  laguna: "Con laguna",
  golf: "Con golf",
  nautico: "Náutico",
  playa: "Con playa",
  tenis: "Tenis",
  paddle: "Pádel",
  futbol: "Fútbol",
  "grupo-electrogeno": "Grupo electrógeno",
  "tierras-altas": "Tierras altas",
  "lotes-grandes": "Lotes +1.000 m²",
  accesible: "Ticket accesible",
  premium: "Premium",
  consolidado: "Consolidado",
  "diseño-estudio-bo": "Diseño Estudio BO",
};

// ═══════════════════════════════════════════════════════════════════════════
// HUB /barrios-privados — datos específicos del rediseño 2026-05
// ═══════════════════════════════════════════════════════════════════════════
//
// Lo de abajo es exclusivo del HUB: marker sigla, descripción 1-línea para card,
// 3 datos cortos, amenities tipadas para chips, coords verificadas con Google
// Places, ruta a la foto principal en /public/barrios/{slug}/.
//
// NO toca el array BARRIOS de arriba (para no romper fichas individuales).
// Los 3 "Próximamente" (la-finca-1, la-finca-2, haras-de-funes) no tienen
// entry en BARRIOS porque aún no hay ficha — solo viven en el HUB.

export type AmenityHubId = "golf" | "laguna" | "grupo-electrogeno" | "acceso-peatonal";
export type HubTierId = "premium" | "consolidado" | "desarrollo" | "proximamente";

export interface HubBarrio {
  slug: string;
  sigla: string;            // 2 letras para marker del mapa
  nombre: string;
  tier: HubTierId;
  descripcion: string;      // 1 línea para card del HUB
  datos: string[];          // 3 datos cortos. El primer chunk numérico se enfatiza.
  amenities: AmenityHubId[];
  lat: number;
  lng: number;
  imagenHero: string;       // path al JPG en /public/barrios/{slug}/...
                            // vacío para Próximamente → gradient fallback.
}

// HUB data por slug — coords verificadas Google Places (2026-05). Estas
// coords pueden diferir de barrio.ubicacion.coordenadas (las del HUB son las
// que se muestran en el mapa principal; las de la ficha mantienen su flujo).
const HUB_DATA: Record<string, Omit<HubBarrio, "nombre" | "tier" | "slug">> = {
  "kentucky": {
    sigla: "KE",
    descripcion: "El country tradicional de Funes con golf 18 hoyos. Marca histórica, vecindario discreto.",
    datos: ["676 lotes", "242 ha", "Golf 18 hoyos"],
    amenities: ["golf"],
    lat: -32.9407, lng: -60.8273,
    imagenHero: "/barrios/kentucky/dji_fly_20260120_174120_0248_1768942128667_photo.jpg",
  },
  "funes-hills-san-marino": {
    sigla: "FH",
    descripcion: "Comunidad chica con grupo electrógeno integrado al 100% del barrio.",
    datos: ["Escala chica", "Electrógeno 100%", "Familiar"],
    amenities: ["grupo-electrogeno"],
    lat: -32.9276, lng: -60.8246,
    imagenHero: "/barrios/funes-hills-san-marino/dji_fly_20241128_131904_0705_1732842535526_photo.jpg",
  },
  "funes-hills-cadaques": {
    sigla: "FH",
    descripcion: "Lotes de 800 m² en las tierras altas de Funes. Diseño espacioso y consolidado.",
    datos: ["800 m² típico", "Tierras altas", "100% habitado"],
    amenities: [],
    lat: -32.9296, lng: -60.8278,
    imagenHero: "/barrios/funes-hills-cadaques/DJI_0093.jpg",
  },
  "funes-hills-miraflores": {
    sigla: "FH",
    descripcion: "Polo tenístico del cluster Funes Hills. Reventa demostrada y vecindario consolidado.",
    datos: ["308 lotes", "800–1.215 m²", "Tenis"],
    amenities: [],
    lat: -32.9298, lng: -60.8398,
    imagenHero: "/barrios/funes-hills-miraflores/339F719E-1BB0-4A2F-B487-A96A61CC4F03.jpg",
  },
  "san-sebastian": {
    sigla: "SS",
    descripcion: "Generador eléctrico para todo el barrio. Comunidad joven y dinámica con escala media.",
    datos: ["587 lotes", "68 ha", "Generador"],
    amenities: ["grupo-electrogeno"],
    lat: -32.9296, lng: -60.8115,
    imagenHero: "/barrios/san-sebastian/dji_fly_20250123_163818_0326_1738178485894_photo.jpg",
  },
  "vida-barrio-cerrado": {
    sigla: "VB",
    descripcion: "Centro comercial propio integrado al ingreso. Vecindario joven con servicios.",
    datos: ["294 lotes", "35 ha", "Centro comercial"],
    amenities: ["acceso-peatonal"],
    lat: -32.9291, lng: -60.7931,
    imagenHero: "/barrios/vida-barrio-cerrado/dji_fly_20250217_175840_0535_1739834666297_photo.jpg",
  },
  "vida-lagoon": {
    sigla: "VL",
    descripcion: "Laguna cristalina de 23.300 m² en Funes. Oportunidad de entrar antes de la entrega final.",
    datos: ["1.042 lotes", "100 ha", "Laguna 23.300 m²"],
    amenities: ["laguna"],
    lat: -32.9100, lng: -60.8422,
    imagenHero: "/barrios/vida-lagoon/dji_fly_20241209_135900_0075_1733763810528_photo.jpg",
  },
  "vida-club-de-campo": {
    sigla: "VC",
    descripcion: "Practice de golf y Club House de autor. Diseño contemporáneo a escala campestre.",
    datos: ["659 lotes", "135 ha", "Golf practice"],
    amenities: ["golf"],
    lat: -32.9300, lng: -60.7857,
    imagenHero: "/barrios/vida-club-de-campo/aerea-barrio-completo.jpg",
  },
  "vida-jardin": {
    sigla: "VJ",
    descripcion: "Acceso directo a la autopista. Lotes amplios y ubicación estratégica.",
    datos: ["242 lotes", "800–1.100 m²", "A autopista"],
    amenities: [],
    lat: -32.9307, lng: -60.8468,
    imagenHero: "/barrios/vida-jardin/foto-2.jpg",
  },
  "vida-green": {
    sigla: "VG",
    descripcion: "Entrada al cluster Vida desde valor. Ideal para entrar al ecosistema sin ticket alto.",
    datos: ["419 lotes", "500–700 m²", "Entry-level"],
    amenities: [],
    lat: -32.8968, lng: -60.8014,
    imagenHero: "/barrios/vida-green/vida green.jpg",
  },
  "funes-lakes": {
    sigla: "FL",
    descripcion: "Barrio náutico de 8 islas conectadas. Único en el corredor con esta tipología.",
    datos: ["485 lotes", "50 ha", "8 islas"],
    amenities: ["laguna"],
    lat: -32.9377, lng: -60.8024,
    imagenHero: "/barrios/funes-lakes/IMG_8508.JPG",
  },
  "aguadas": {
    sigla: "AG",
    descripcion: "El consolidado discreto de la zona sur, vecino del futuro Aguadas Lakes.",
    datos: ["234 lotes", "800 m² típico", "Club House"],
    amenities: [],
    lat: -32.9394, lng: -60.8117,
    imagenHero: "/barrios/aguadas/01.webp",
  },
};

// Próximamente — entries solo para el HUB (no hay Barrio completo aún).
const PROXIMAMENTE_HUB: HubBarrio[] = [
  { slug: "la-finca-1", sigla: "LF", nombre: "La Finca 1", tier: "proximamente",
    descripcion: "Próximo lanzamiento en el corredor. Más información se actualiza pronto.",
    datos: [], amenities: [], lat: -32.9277, lng: -60.7732, imagenHero: "" },
  { slug: "la-finca-2", sigla: "LF", nombre: "La Finca 2", tier: "proximamente",
    descripcion: "Próximo lanzamiento en el corredor. Más información se actualiza pronto.",
    datos: [], amenities: [], lat: -32.9097, lng: -60.8187, imagenHero: "" },
  { slug: "haras-de-funes", sigla: "HD", nombre: "Haras de Funes", tier: "proximamente",
    descripcion: "Próximo lanzamiento en el corredor. Más información se actualiza pronto.",
    datos: [], amenities: [], lat: -32.9530, lng: -60.8371, imagenHero: "" },
];

// Mapeo del tier rico (modelo Barrio) al tier simplificado del HUB (4 buckets).
export function mapTierToHubTier(t: BarrioTier): HubTierId {
  if (t === "Premium") return "premium";
  if (t === "Consolidado" || t === "Consolidado con vida joven") return "consolidado";
  if (t === "En desarrollo") return "desarrollo";
  return "proximamente";
}

// Orden canónico del HUB: premium → consolidado → desarrollo → proximamente.
// Dentro de cada bucket, sigue el orden del array BARRIOS (ya curado por David).
const TIER_ORDER: Record<HubTierId, number> = {
  premium: 0,
  consolidado: 1,
  desarrollo: 2,
  proximamente: 3,
};

export function getBarriosHub(): HubBarrio[] {
  const fromBarrios: HubBarrio[] = BARRIOS
    .filter((b) => HUB_DATA[b.slug])
    .map((b) => ({
      slug: b.slug,
      nombre: b.nombre,
      tier: mapTierToHubTier(b.tier),
      ...HUB_DATA[b.slug]!,
    }));
  const all = [...fromBarrios, ...PROXIMAMENTE_HUB];
  // Sort estable por tier-bucket (sin reordenar dentro de cada bucket).
  return all.sort((a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier]);
}

export const AMENITIES_HUB_META: ReadonlyArray<{
  id: AmenityHubId;
  label: string;
  icon: string;        // nombre del ícono Lucide
  colorFrom: string;
  colorTo: string;
}> = [
  { id: "golf",              label: "Golf",                        icon: "Flag",       colorFrom: "#2d8a4f", colorTo: "#1A5C38" },
  { id: "laguna",            label: "Laguna",                      icon: "Waves",      colorFrom: "#5b9bd5", colorTo: "#2d5a8a" },
  { id: "grupo-electrogeno", label: "Grupo electrógeno",           icon: "Zap",        colorFrom: "#d4a04a", colorTo: "#B8935A" },
  { id: "acceso-peatonal",   label: "Acceso peatonal a servicios", icon: "Footprints", colorFrom: "#a89070", colorTo: "#6e5a3a" },
];

export const TIER_HUB_META: Record<HubTierId, { label: string; badgeBg: string; badgeColor: string }> = {
  premium:      { label: "Premium",       badgeBg: "rgba(255,255,255,0.95)", badgeColor: "#1A5C38" },
  consolidado:  { label: "Consolidado",   badgeBg: "rgba(255,255,255,0.95)", badgeColor: "#B8935A" },
  desarrollo:   { label: "En desarrollo", badgeBg: "#B8935A",                badgeColor: "#ffffff" },
  proximamente: { label: "Próximamente",  badgeBg: "#0a0a0a",                badgeColor: "#ffffff" },
};
