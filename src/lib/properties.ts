export type PropertyType = 'casa' | 'departamento' | 'terreno' | 'local' | 'chalet';
export type OperationType = 'venta' | 'alquiler';
export type PropertyStatus = 'available' | 'reserved' | 'sold';
export type City = 'Roldán' | 'Rosario' | 'Funes';

export interface Property {
  id: string;
  slug: string;
  title: string;
  type: PropertyType;
  operation: OperationType;
  price: number;
  currency: 'USD' | 'ARS';
  priceDisplay: string;
  city: City;
  neighborhood: string;
  address?: string;
  beds?: number;
  baths?: number;
  m2: number;
  m2Covered?: number;
  parking?: number;
  images: string[];
  description: string;
  features: string[];
  status: PropertyStatus;
  featured: boolean;
  yearBuilt?: number;
}

export const properties: Property[] = [
  {
    id: '1',
    slug: 'casa-moderna-tierra-de-suenos-roldan',
    title: 'Casa Moderna en Tierra de Sueños 3',
    type: 'casa',
    operation: 'venta',
    price: 125000,
    currency: 'USD',
    priceDisplay: 'USD 125.000',
    city: 'Roldán',
    neighborhood: 'Tierra de Sueños 3',
    address: 'Tierra de Sueños 3, Roldán',
    beds: 3,
    baths: 2,
    m2: 180,
    m2Covered: 160,
    parking: 2,
    images: ['/property_modern_house_1774239049878.png'],
    description: 'Hermosa casa moderna ubicada en el exclusivo barrio Tierra de Sueños 3, Roldán. Cuenta con amplios ambientes, cocina integral equipada, living comedor con salida a jardín y piscina. Terminaciones de primera calidad. Ideal para familia. A minutos de todos los servicios.',
    features: [
      'Jardín con piscina',
      'Cocina integral equipada',
      'Garage para 2 autos',
      'Calefacción central',
      'Seguridad 24hs',
      'Barrio privado',
      'Parrilla',
      'Lavadero',
    ],
    status: 'available',
    featured: true,
    yearBuilt: 2019,
  },
  {
    id: '2',
    slug: 'departamento-premium-piso-8-rosario-centro',
    title: 'Departamento Premium Piso 8 - Centro Rosario',
    type: 'departamento',
    operation: 'venta',
    price: 210000,
    currency: 'USD',
    priceDisplay: 'USD 210.000',
    city: 'Rosario',
    neighborhood: 'Centro',
    address: 'Córdoba 1500, Rosario',
    beds: 2,
    baths: 2,
    m2: 110,
    m2Covered: 110,
    parking: 1,
    images: ['/property_luxury_apartment_1774239066903.png'],
    description: 'Departamento de categoría en pleno centro de Rosario. Piso alto con vista panorámica. Dos dormitorios en suite, living comedor amplio, cocina americana integrada. Edificio con amenities completos: suma, pileta, gym y SUM. Excelente inversión o vivienda.',
    features: [
      'Vista panorámica',
      'Amenities completos',
      'Pileta en terraza',
      'Gimnasio equipado',
      'Cocina americana',
      'Balcón corrido',
      'Portería 24hs',
      'Cochera cubierta',
    ],
    status: 'available',
    featured: true,
    yearBuilt: 2021,
  },
  {
    id: '3',
    slug: 'casa-campo-minimalista-funes-hills',
    title: 'Casa de Campo Minimalista en Funes Hills',
    type: 'casa',
    operation: 'venta',
    price: 185000,
    currency: 'USD',
    priceDisplay: 'USD 185.000',
    city: 'Funes',
    neighborhood: 'Funes Hills',
    address: 'Funes Hills, Funes',
    beds: 4,
    baths: 3,
    m2: 280,
    m2Covered: 250,
    parking: 3,
    images: ['/property_modern_house_1774239049878.png'],
    description: 'Imponente casa estilo minimalista en Funes Hills. Cuatro dormitorios, tres baños completos, amplio living con doble altura y ventanales al jardín. Diseño contemporáneo con materiales nobles. Lote de 1200m², pileta climatizada, quincho y garage para 3 autos.',
    features: [
      'Doble altura en living',
      'Pileta climatizada',
      'Quincho con parrilla',
      'Lote 1200m²',
      'Piso radiante',
      'Domótica',
      'Seguridad 24hs',
      'Acceso controlado',
    ],
    status: 'available',
    featured: true,
    yearBuilt: 2022,
  },
  {
    id: '4',
    slug: 'departamento-vista-rio-puerto-norte-rosario',
    title: 'Departamento con Vista al Río - Puerto Norte',
    type: 'departamento',
    operation: 'alquiler',
    price: 800,
    currency: 'USD',
    priceDisplay: 'USD 800 / mes',
    city: 'Rosario',
    neighborhood: 'Puerto Norte',
    address: 'Puerto Norte, Rosario',
    beds: 1,
    baths: 1,
    m2: 65,
    m2Covered: 65,
    parking: 1,
    images: ['/property_luxury_apartment_1774239066903.png'],
    description: 'Moderno monoambiente amplio en el codiciado barrio Puerto Norte de Rosario. Vista directa al río Paraná. Edificio de categoría con amenities premium. Ideal para profesionales o pareja. Totalmente equipado y amoblado. Disponible inmediatamente.',
    features: [
      'Vista al río Paraná',
      'Amoblado y equipado',
      'Piscina en terraza',
      'Gym y sauna',
      'Seguridad 24hs',
      'Cochera cubierta',
      'Lavandería',
      'Concierge',
    ],
    status: 'available',
    featured: true,
    yearBuilt: 2020,
  },
  {
    id: '5',
    slug: 'chalet-clasico-cotos-alameda-roldan',
    title: 'Chalet Clásico Refaccionado - Cotos de la Alameda',
    type: 'chalet',
    operation: 'venta',
    price: 140000,
    currency: 'USD',
    priceDisplay: 'USD 140.000',
    city: 'Roldán',
    neighborhood: 'Cotos de la Alameda',
    address: 'Cotos de la Alameda, Roldán',
    beds: 3,
    baths: 2,
    m2: 200,
    m2Covered: 180,
    parking: 2,
    images: ['/property_modern_house_1774239049878.png'],
    description: 'Encantador chalet estilo clásico totalmente refaccionado en Cotos de la Alameda. Tres dormitorios, dos baños, amplia cocina, living con chimenea y acceso a jardín con piscina y barbecue. Materiales de primera calidad en la refacción. Excelente ubicación dentro del barrio.',
    features: [
      'Chimenea a leña',
      'Jardín con piscina',
      'Parrilla y barbecue',
      'Totalmente refaccionado',
      'Piso de madera',
      'Garage cerrado',
      'Barrio privado',
      'Seguridad 24hs',
    ],
    status: 'available',
    featured: false,
    yearBuilt: 2000,
  },
  {
    id: '6',
    slug: 'piso-exclusivo-estrenar-pichincha-rosario',
    title: 'Piso Exclusivo a Estrenar - Pichincha',
    type: 'departamento',
    operation: 'venta',
    price: 280000,
    currency: 'USD',
    priceDisplay: 'USD 280.000',
    city: 'Rosario',
    neighborhood: 'Pichincha',
    address: 'Pichincha, Rosario',
    beds: 3,
    baths: 3,
    m2: 160,
    m2Covered: 160,
    parking: 2,
    images: ['/property_luxury_apartment_1774239066903.png'],
    description: 'Piso exclusivo a estrenar en el barrio más premium de Rosario. Tres dormitorios con vestidor, tres baños en suite, cocina gourmet con isla, living comedor de amplísimas dimensiones. Dos balcones. Edificio de primer nivel con amenities de lujo y vista a la ciudad.',
    features: [
      'A estrenar',
      'Tres suites',
      'Cocina gourmet con isla',
      'Dos balcones',
      'Amenities premium',
      'Dos cocheras cubiertas',
      'Baulera incluida',
      'Portería 24hs',
    ],
    status: 'available',
    featured: true,
    yearBuilt: 2024,
  },
  {
    id: '7',
    slug: 'terreno-barrio-privado-roldan',
    title: 'Terreno en Barrio Privado - Roldán',
    type: 'terreno',
    operation: 'venta',
    price: 45000,
    currency: 'USD',
    priceDisplay: 'USD 45.000',
    city: 'Roldán',
    neighborhood: 'Nuevo Roldán',
    address: 'Nuevo Roldán, Roldán',
    m2: 600,
    images: ['/property_modern_house_1774239049878.png'],
    description: 'Excelente lote en barrio privado de Roldán. Terreno regular de 600m², ideal para construir la casa de sus sueños. Todos los servicios disponibles: agua, gas, electricidad y cloacas. Escritura al día. Seguridad 24 horas. Excelente acceso desde autopista.',
    features: [
      'Terreno regular',
      'Todos los servicios',
      'Escritura al día',
      'Acceso controlado',
      'Seguridad 24hs',
      'Próximo a colegios',
      'Acceso a autopista',
      'Excelente ubicación',
    ],
    status: 'available',
    featured: false,
  },
  {
    id: '8',
    slug: 'casa-familia-roldan-centro',
    title: 'Casa Familiar en Roldán Centro',
    type: 'casa',
    operation: 'venta',
    price: 95000,
    currency: 'USD',
    priceDisplay: 'USD 95.000',
    city: 'Roldán',
    neighborhood: 'Centro',
    address: 'San Martín 850, Roldán',
    beds: 3,
    baths: 2,
    m2: 160,
    m2Covered: 140,
    parking: 1,
    images: ['/property_modern_house_1774239049878.png'],
    description: 'Cómoda casa familiar ubicada en el corazón de Roldán. Planta baja con living comedor, cocina completa y baño. Primer piso con tres dormitorios y baño. Fondo con parrilla y jardín. A pasos de colegios, comercios y plaza central. Ideal para vivir o invertir.',
    features: [
      'Ubicación céntrica',
      'Jardín y parrilla',
      'Garage cubierto',
      'A pasos de la plaza',
      'Cerca de colegios',
      'Todos los servicios',
      'Luminosa',
      'Bien mantenida',
    ],
    status: 'available',
    featured: false,
    yearBuilt: 2005,
  },
  {
    id: '9',
    slug: 'departamento-alquiler-rosario-echesortu',
    title: 'Departamento 2 Ambientes - Echesortu, Rosario',
    type: 'departamento',
    operation: 'alquiler',
    price: 380000,
    currency: 'ARS',
    priceDisplay: 'ARS 380.000 / mes',
    city: 'Rosario',
    neighborhood: 'Echesortu',
    address: 'Mendoza 3100, Rosario',
    beds: 1,
    baths: 1,
    m2: 55,
    m2Covered: 55,
    parking: 0,
    images: ['/property_luxury_apartment_1774239066903.png'],
    description: 'Luminoso departamento de dos ambientes en el tranquilo barrio Echesortu de Rosario. Primer piso. Living comedor amplio, dormitorio doble, cocina separada, baño completo y balcón. Luminoso y bien mantenido. Expensas bajas. Transporte público a metros.',
    features: [
      'Luminoso',
      'Balcón',
      'Expensas bajas',
      'Transporte a metros',
      'Barrio tranquilo',
      'Primer piso',
      'Cocina separada',
      'Bien mantenido',
    ],
    status: 'available',
    featured: false,
    yearBuilt: 2010,
  },
  {
    id: '10',
    slug: 'casa-lote-grande-funes-centro',
    title: 'Casa en Lote Grande - Funes Centro',
    type: 'casa',
    operation: 'venta',
    price: 165000,
    currency: 'USD',
    priceDisplay: 'USD 165.000',
    city: 'Funes',
    neighborhood: 'Centro',
    address: 'Funes, Santa Fe',
    beds: 4,
    baths: 2,
    m2: 320,
    m2Covered: 200,
    parking: 2,
    images: ['/property_modern_house_1774239049878.png'],
    description: 'Amplia propiedad en Funes con lote de 1500m². Cuatro dormitorios, dos baños, living comedor, cocina, lavadero y dependencia de servicio. Jardín parquizado con piscina, quincho y cancha de tenis. Ideal para familia grande o inversión. A 15 minutos de Rosario.',
    features: [
      'Lote 1500m²',
      'Cancha de tenis',
      'Piscina',
      'Quincho',
      'Dependencia de servicio',
      'Parque parquizado',
      '15 min de Rosario',
      'Excelente acceso',
    ],
    status: 'available',
    featured: false,
    yearBuilt: 1998,
  },
  {
    id: '11',
    slug: 'local-comercial-roldan-san-martin',
    title: 'Local Comercial - San Martín, Roldán',
    type: 'local',
    operation: 'alquiler',
    price: 250000,
    currency: 'ARS',
    priceDisplay: 'ARS 250.000 / mes',
    city: 'Roldán',
    neighborhood: 'Centro',
    address: 'San Martín 600, Roldán',
    m2: 80,
    m2Covered: 80,
    images: ['/property_modern_house_1774239049878.png'],
    description: 'Local comercial en plena arteria comercial de Roldán. 80m² cubiertos, planta libre, doble frente, excelente vidriera. Baño propio, depósito y cocina. Alta visibilidad y tránsito peatonal constante. Ideal para comercio, gastronomía u oficina. Disponible inmediatamente.',
    features: [
      'Doble frente',
      'Alta visibilidad',
      'Planta libre',
      'Baño y depósito',
      'Sobre arteria principal',
      'Tráfico peatonal alto',
      'Disponible inmediato',
      'Fácil estacionamiento',
    ],
    status: 'available',
    featured: false,
  },
  {
    id: '12',
    slug: 'terreno-esquina-rosario-echesortu',
    title: 'Terreno de Esquina - Echesortu, Rosario',
    type: 'terreno',
    operation: 'venta',
    price: 85000,
    currency: 'USD',
    priceDisplay: 'USD 85.000',
    city: 'Rosario',
    neighborhood: 'Echesortu',
    address: 'Echesortu, Rosario',
    m2: 450,
    images: ['/property_luxury_apartment_1774239066903.png'],
    description: 'Valioso terreno en esquina en el consolidado barrio Echesortu de Rosario. 450m², frente a parque. Todos los servicios. Planos aprobados para edificio de 8 pisos disponibles. Excelente oportunidad de inversión en zona de alta demanda. Escritura al día.',
    features: [
      'Terreno de esquina',
      'Frente a parque',
      'Planos aprobados',
      'Todos los servicios',
      'Escritura al día',
      'Zona en valorización',
      'Excelente inversión',
      'Fácil acceso',
    ],
    status: 'available',
    featured: false,
  },
];

export function getPropertyBySlug(slug: string): Property | undefined {
  return properties.find((p) => p.slug === slug);
}

export function getFeaturedProperties(): Property[] {
  return properties.filter((p) => p.featured && p.status === 'available');
}

export function getPropertiesByCity(city: City): Property[] {
  return properties.filter((p) => p.city === city && p.status === 'available');
}

export function filterProperties(filters: {
  type?: string;
  operation?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
}): Property[] {
  return properties.filter((p) => {
    if (p.status !== 'available') return false;
    if (filters.type && p.type !== filters.type) return false;
    if (filters.operation && p.operation !== filters.operation) return false;
    if (filters.city && p.city !== filters.city) return false;
    return true;
  });
}

export const WHATSAPP_NUMBER = '5493412101694';
export const WHATSAPP_URL = `https://wa.me/5493412101694`;
export const PHONE_DISPLAY = '(341) 210-1694';
export const EMAIL = 'ventas@inmobiliariaippoliti.com';
export const ADDRESS = 'Catamarca 775, Roldán, Santa Fe';
export const SITE_URL = 'https://inmobiliariaippoliti.com';
