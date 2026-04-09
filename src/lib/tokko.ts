// SECURITY NOTE: Never use NEXT_PUBLIC_TOKKO_API_KEY in client components.
// Always use the API proxy route at /api/propiedades for client-side fetches.
// Server components can use TOKKO_API_KEY directly (no NEXT_PUBLIC_ prefix).

function getApiKey(): string {
  // Server-only: TOKKO_API_KEY preferred, NEXT_PUBLIC_ as fallback for Vercel compat
  const key = process.env.TOKKO_API_KEY || process.env.NEXT_PUBLIC_TOKKO_API_KEY
  if (!key) throw new Error('TOKKO_API_KEY is not configured')
  return key
}
const BASE_URL = 'https://www.tokkobroker.com/api/v1';

// --- Types (basadas en respuesta real de la API) ---

export interface TokkoPhoto {
  description: string | null;
  image: string;
  is_blueprint: boolean;
  is_front_cover: boolean;
  order: number;
  original: string;
  thumb: string;
}

export interface TokkoPrice {
  currency: string;
  is_promotional: boolean;
  period: number | null;
  price: number;
}

export interface TokkoOperation {
  operation_id: number;
  operation_type: 'Sale' | 'Rent';
  prices: TokkoPrice[];
}

export interface TokkoPropertyType {
  code: string;
  id: number;
  name: string;
}

export interface TokkoLocation {
  id: number;
  name: string;
  full_location: string;
  short_location: string;
  divisions?: { id: number; name: string }[];
}

export interface TokkoTag {
  id: number;
  name: string;
  type: number;
}

export interface TokkoVideo {
  id: number;
  title: string;
  description: string;
  url: string;
  player_url: string;
  provider: string;
  provider_id: number;
  video_id: string;
  order: number;
}

export interface TokkoProperty {
  id: number;
  publication_title: string;
  address: string;
  fake_address: string;
  real_address: string;
  reference_code: string;
  description: string;
  description_only: string;
  rich_description: string;
  age: number;
  // Superficies — la API devuelve strings
  roofed_surface: string;
  surface: string;
  total_surface: string;
  semiroofed_surface: string;
  unroofed_surface: string;
  lot_number: string;
  room_amount: number;
  bathroom_amount: number;
  toilet_amount: number;
  parking_lot_amount: number;
  covered_parking_lot: number;
  suite_amount: number;
  floors_amount: number;
  floor: string;
  photos: TokkoPhoto[];
  operations: TokkoOperation[];
  type: TokkoPropertyType;
  location: TokkoLocation;
  geo_lat: string | null;
  geo_long: string | null;
  web_price: boolean;
  is_starred_on_web: boolean;
  status: number;
  deleted_at: string | null;
  tags: TokkoTag[];
  videos: TokkoVideo[];
  property_condition: string | null;
  orientation: string | null;
  disposition: string | null;
  situation: string | null;
  files: { file: string }[];
  public_url: string;
  development: { id: number; name: string } | null;
  producer: {
    id: number;
    name: string;
    phone: string;
    email: string;
    picture: string;
  } | null;
}

export interface TokkoMeta {
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total_count: number;
}

export interface TokkoListResponse {
  meta: TokkoMeta;
  objects: TokkoProperty[];
}

// --- Helpers ---

export function generatePropertySlug(property: TokkoProperty): string {
  const base =
    property.publication_title ||
    property.fake_address ||
    property.address ||
    `propiedad-${property.id}`;
  const slugified = base
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${property.id}-${slugified}`;
}

export function getIdFromSlug(slug: string): number {
  return parseInt(slug.split('-')[0], 10);
}

export function getMainPhoto(property: TokkoProperty): string | null {
  if (!property.photos || property.photos.length === 0) return null;
  const cover = property.photos.find((p) => p.is_front_cover && !p.is_blueprint);
  const first = property.photos.find((p) => !p.is_blueprint);
  return (cover || first || property.photos[0]).image;
}

export function getAllPhotos(property: TokkoProperty): string[] {
  if (!property.photos || property.photos.length === 0) return [];
  return property.photos
    .filter((p) => !p.is_blueprint)
    .sort((a, b) => a.order - b.order)
    .map((p) => p.image);
}

export function getBlueprintPhotos(property: TokkoProperty): string[] {
  if (!property.photos || property.photos.length === 0) return [];
  return property.photos
    .filter((p) => p.is_blueprint)
    .sort((a, b) => a.order - b.order)
    .map((p) => p.image);
}

// Mapea operation_type de Tokko a español
export function getOperationType(property: TokkoProperty): string {
  if (!property.operations || property.operations.length === 0) return '';
  const type = property.operations[0].operation_type;
  if (type === 'Sale') return 'Venta';
  if (type === 'Rent') return 'Alquiler';
  const raw = String(type).toLowerCase();
  if (raw.includes('temporary') || raw.includes('vacation')) return 'Temporario';
  return String(type);
}

export function formatPrice(property: TokkoProperty): string {
  if (!property.operations || property.operations.length === 0) return 'Consultar';
  const op = property.operations[0];
  if (!op.prices || op.prices.length === 0) return 'Consultar';
  const p = op.prices[0];
  if (!p.price || p.price === 0) return 'Consultar';
  const formatted = p.price.toLocaleString('es-AR');
  const suffix = op.operation_type === 'Rent' ? '/mes' : '';
  return `${p.currency} ${formatted}${suffix ? ' ' + suffix : ''}`;
}

// Superficie cubierta principal (en m²), parseando el string de la API
export function getRoofedArea(property: TokkoProperty): number | null {
  const v = parseFloat(property.roofed_surface);
  return v > 0 ? v : null;
}

export function getTotalSurface(property: TokkoProperty): number | null {
  const total = parseFloat(property.total_surface);
  if (total > 0) return total;
  const roofed = parseFloat(property.roofed_surface);
  if (roofed > 0) return roofed;
  const surface = parseFloat(property.surface);
  if (surface > 0) return surface;
  return null;
}

// Superficie del terreno/lote (campo "surface" en Tokko)
export function getLotSurface(property: TokkoProperty): number | null {
  const v = parseFloat(property.surface);
  return v > 0 ? v : null;
}

// Determina si la propiedad es un terreno/lote
export function isLand(property: TokkoProperty): boolean {
  const name = (property.type?.name ?? '').toLowerCase();
  return name === 'land' || name === 'terreno';
}

// Formato de ubicación legible: "Santa Fe | San Lorenzo | Roldan" → "Roldan, San Lorenzo"
export function formatLocation(property: TokkoProperty): string {
  const loc = property.location;
  if (!loc) return property.fake_address || property.address;
  // short_location: "Santa Fe | San Lorenzo | Roldan"
  const parts = loc.short_location?.split('|').map((s) => s.trim()) || [];
  if (parts.length >= 2) {
    // Mostrar las últimas dos partes (ciudad y departamento)
    return parts.slice(-2).reverse().join(', ');
  }
  return loc.name || property.fake_address || property.address;
}

// ─── Traducciones inglés → español ──────────────────────────────────────────

const TYPE_ES: Record<string, string> = {
  'Land': 'Terreno',
  'House': 'Casa',
  'Apartment': 'Departamento',
  'Office': 'Oficina',
  'Store': 'Local comercial',
  'Bussiness Premises': 'Local comercial',
  'Garage': 'Cochera',
  'Warehouse': 'Galpón',
  'Building': 'Edificio',
  'Country House': 'Casa de campo',
  'Countryside': 'Campo / Chacra',
  'Condo': 'Condominio',
  'Farm': 'Campo',
  'PH': 'PH',
}

export function translatePropertyType(name: string | undefined | null): string {
  if (!name) return ''
  return TYPE_ES[name] ?? name
}

const CONDITION_ES: Record<string, string> = {
  'Excellent': 'Excelente',
  'Very good': 'Muy bueno',
  'Good': 'Bueno',
  'Recicled': 'Reciclado',
  'To refurbish': 'A reciclar',
  '---': '',
  'excelente': 'Excelente',
  'bueno': 'Bueno',
}

export function translateCondition(value: string | undefined | null): string {
  if (!value || value === '---') return ''
  return CONDITION_ES[value] ?? value
}

const ORIENTATION_ES: Record<string, string> = {
  'North': 'Norte', 'South': 'Sur', 'East': 'Este', 'West': 'Oeste',
  'North-East': 'Noreste', 'North-West': 'Noroeste',
  'South-East': 'Sureste', 'South-West': 'Suroeste',
}

export function translateOrientation(value: string | undefined | null): string {
  if (!value) return ''
  return ORIENTATION_ES[value] ?? value
}

const DISPOSITION_ES: Record<string, string> = {
  'Front': 'Frente', 'Internal': 'Interno', 'BackFront': 'Contrafrente',
}

export function translateDisposition(value: string | undefined | null): string {
  if (!value) return ''
  return DISPOSITION_ES[value] ?? value
}

const SITUATION_ES: Record<string, string> = {
  'Tenant': 'Inquilino', 'Empty': 'Vacío', 'In use': 'En uso',
  'Construction company': 'Constructora', '---': '',
}

export function translateSituation(value: string | undefined | null): string {
  if (!value || value === '---') return ''
  return SITUATION_ES[value] ?? value
}

const TAG_ES: Record<string, string> = {
  // Servicios
  'Water': 'Agua corriente', 'Drinking Water': 'Agua potable',
  'Sewage': 'Cloacas', 'Natural Gas': 'Gas natural',
  'Electricity': 'Electricidad', 'Underground electricity': 'Electricidad subterránea',
  'Trifasic energy': 'Energía trifásica', 'Internet': 'Internet',
  'WiFi': 'WiFi', 'Cable': 'Cable', 'Cable TV building': 'Cable en edificio',
  'Phone': 'Teléfono', 'Pavement': 'Pavimento',
  'Public lighting': 'Iluminación pública',
  'Rainwater drainage': 'Desagüe pluvial',
  'Gas Storage': 'Almacenamiento de gas', 'Gas burners': 'Calefones a gas',

  // Seguridad
  '24 Hour Security': 'Seguridad 24hs', '24 hr reception': 'Recepción 24hs',
  'Security': 'Seguridad', 'Security Guard': 'Guardia de seguridad',
  'Entrance Security': 'Seguridad en acceso', 'Alarm': 'Alarma',
  'Video Cameras': 'Cámaras de video',

  // Amenities
  'Pool': 'Pileta', 'Gym': 'Gimnasio', 'SUM': 'SUM',
  'Sauna': 'Sauna', 'Jacuzzi': 'Jacuzzi', 'Solarium': 'Solarium',
  'Soccer Field': 'Cancha de fútbol', 'Sport center': 'Centro deportivo',
  'Game room': 'Sala de juegos', 'Recreational area': 'Área recreativa',
  'Amenities': 'Amenities', 'Deck': 'Deck',

  // Espacios
  'Barbecue': 'Parrilla', 'Barbecue area': 'Área de parrilla',
  'Covered BBQ': 'Quincho cubierto', 'Individual grill in the apartment': 'Parrilla individual',
  'Garden': 'Jardín', 'Backyard': 'Patio', 'Terrace': 'Terraza',
  'Balcony': 'Balcón', 'Balcony terrace': 'Balcón terraza',
  'Gallery': 'Galería', 'Attic': 'Altillo', 'Hall': 'Hall',
  'Landing': 'Descanso', 'Storage room': 'Baulera',
  'Laundry': 'Lavadero', 'Laundry room': 'Lavadero',
  'Public Laundry': 'Lavadero público',

  // Cocina y baño
  'Kitchen': 'Cocina', 'Kitchenette': 'Kitchenette',
  'Diary dining': 'Comedor diario', 'Dining lounge': 'Living comedor',
  'Toilette': 'Toilette', 'Service bathroom': 'Baño de servicio',

  // Dormitorios
  'Dresser': 'Vestidor', 'Fitted Wardrobes': 'Placard',
  'Independent Studio': 'Estudio independiente', 'Office': 'Escritorio',

  // Calefacción y climatización
  'Heating': 'Calefacción', 'Central Heating': 'Calefacción central',
  'Gas heating': 'Calefacción a gas', 'Split heating': 'Split',
  'Radiator heating': 'Calefacción por radiadores',
  'Individual Air conditioner': 'Aire acondicionado',
  'Pre-installed Air-Conditioning': 'Preinstalación de A/C',
  'Fireplace': 'Hogar a leña',

  // Construcción
  'Aluminium Carpentry': 'Carpintería de aluminio',
  'Slab roof': 'Techo de losa', 'Wood Flooring': 'Piso de madera',
  'Blinds': 'Persianas', 'Sliding Door': 'Puerta corrediza',
  'Furniture': 'Amoblado',

  // Estacionamiento
  'Fixed garage': 'Cochera fija',
  'Garage attendants': 'Encargado de cochera',

  // Edificio
  'Lift': 'Ascensor', 'Superintendent': 'Encargado',
  'Generator': 'Grupo electrógeno',
  'Satellite TV': 'TV Satelital',

  // Varios
  'Luminous': 'Luminoso', 'Pets allowed': 'Acepta mascotas',
  'Good Rental Potential': 'Buena rentabilidad',
  'Immediate deed': 'Escritura inmediata',
  'Under Construction': 'En construcción',
  'Automatic watering': 'Riego automático',
  'Biodigesters': 'Biodigestores',
  'Private urbanization': 'Urbanización privada',
  'Exchange': 'Permuta',
  'Internal Land': 'Lote interno',
  'Subdivisible land': 'Lote subdivisible',
  'Work able': 'Apto profesional',
  'Accessibility With Reduced Mobility': 'Accesibilidad para movilidad reducida',
  'Temporary rent': 'Alquiler temporal',

  // Estilo
  'Modern Style': 'Estilo moderno',
  'Classic Style': 'Estilo clásico',
  'Colonial Style': 'Estilo colonial',

  // Accesos
  'Electric Gates': 'Portones eléctricos',
  'Paved Street': 'Pavimento',
  'Air Conditioning': 'Aire acondicionado',
  'Swimming Pool': 'Piscina',
  'Parking': 'Estacionamiento',
  'Storage': 'Baulera',
  'Playground': 'Área de juegos',
  'Lobby': 'Lobby',
  'Elevator': 'Ascensor',

  // Etiquetas ya en español (pass-through)
  'Financed': 'Financiado',
  'Quiet Location': 'Ubicación tranquila',
  'Direct sale': 'Venta directa',
}

export function translateTag(name: string): string {
  return TAG_ES[name] ?? name
}

// Texto genérico que Tokko pone como footer/default en todas las propiedades
const BOILERPLATE = [
  'conocé el valor real de tu propiedad',
  'solicitalo y te lo entregamos en 24',
];

// Devuelve la descripción limpia (texto plano, sin HTML, sin boilerplate)
export function getDescription(property: TokkoProperty): string {
  const raw = property.description || property.description_only || '';
  const clean = raw.replace(/<[^>]*>/g, '').trim();
  if (!clean) return '';

  // Remove the boilerplate footer if present (it might be appended to real content)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const footer = (property as any).footer;
  if (typeof footer === 'string' && footer.trim()) {
    const footerClean = footer.replace(/<[^>]*>/g, '').trim();
    if (footerClean && clean.includes(footerClean)) {
      const stripped = clean.replace(footerClean, '').trim();
      return stripped;
    }
  }

  // Fallback: if the entire text IS the boilerplate, discard it
  const lower = clean.toLowerCase();
  if (BOILERPLATE.every(phrase => lower.includes(phrase))) return '';
  return clean;
}

// --- API calls ---

export async function getProperties(params?: {
  operation?: 'Sale' | 'Rent';
  typeId?: number;
  limit?: number;
  offset?: number;
}): Promise<TokkoListResponse> {
  const fetchPage = async (limit: number, offset: number) => {
    const url = new URL(`${BASE_URL}/property/`);
    url.searchParams.set('key', getApiKey());
    url.searchParams.set('format', 'json');
    url.searchParams.set('lang', 'es');
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('offset', String(offset));

    if (params?.operation) {
      const opId = params.operation === 'Sale' ? 1 : 2;
      url.searchParams.set('operation_types', `[${opId}]`);
    }

    if (params?.typeId) {
      url.searchParams.set('property_types', `[${params.typeId}]`);
    }

    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`Tokko API error: ${res.status} ${res.statusText}`);
    }

    return res.json() as Promise<TokkoListResponse>;
  };

  const initialLimit = params?.limit ?? 100;
  const initialOffset = params?.offset ?? 0;

  const firstPage = await fetchPage(initialLimit, initialOffset);
  const totalCount = firstPage.meta.total_count;
  const fetchedCount = firstPage.objects.length;

  // TODO: add integration test — getProperties() sin params debe traer total_count completo (>100)
  if (fetchedCount < totalCount) {
    const remainingPages = Math.ceil((totalCount - fetchedCount) / initialLimit);
    const promises = [];

    for (let i = 1; i <= remainingPages; i++) {
      promises.push(fetchPage(initialLimit, initialOffset + i * initialLimit));
    }

    const results = await Promise.all(promises);
    for (const result of results) {
      firstPage.objects.push(...result.objects);
    }
    
    firstPage.meta.limit = totalCount;
  }

  return firstPage;
}

export async function getPropertyById(id: number): Promise<TokkoProperty> {
  const url = `${BASE_URL}/property/${id}/?key=${getApiKey()}&format=json&lang=es`;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, {
        next: { revalidate: 21600 },
      });

      if (res.status === 404) {
        throw new Error(`Property ${id} not found`);
      }

      if (!res.ok) {
        if (attempt < 2) { await new Promise(r => setTimeout(r, 500 * (attempt + 1))); continue; }
        throw new Error(`Tokko API error: ${res.status} ${res.statusText}`);
      }

      return res.json();
    } catch (e) {
      if (attempt >= 2 || (e instanceof Error && e.message.includes('not found'))) throw e;
      await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
    }
  }

  throw new Error(`Tokko API failed after 3 attempts for property ${id}`);
}

export async function getFeaturedProperties(limit = 6): Promise<TokkoProperty[]> {
  const data = await getProperties({ limit: 100 });
  const starred = data.objects.filter((p) => p.is_starred_on_web);
  const source = starred.length > 0 ? starred : data.objects;
  return source.slice(0, limit);
}
