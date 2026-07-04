// SECURITY: la API key de Tokko es SERVER-ONLY (process.env.TOKKO_API_KEY).
// Se eliminó el fallback a NEXT_PUBLIC_TOKKO_API_KEY (se inlineaba en el bundle
// del cliente). Para fetches desde el cliente, usar el proxy /api/propiedades.

function getApiKey(): string {
  const key = process.env.TOKKO_API_KEY
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
    phone: string | null;
    cellphone?: string | null;
    email: string | null;
    picture: string | null;
  } | null;
  // Enriquecimiento opcional server-side: URL del audio narrado de la
  // propiedad (Vercel Blob) si fue generado en /admin/audio. Populado por
  // enrichCardsWithAudio() en los endpoints que sirven listados al cliente.
  audioUrl?: string | null;
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

// Tokko devuelve campos extra que NO están declarados en las interfaces (p. ej.
// location.url = "/api/v1/location/{id}/"). Cuando el array completo cruza el
// boundary server→client, Next.js serializa esos campos al HTML y Google los
// indexa como URLs bloqueadas por robots.txt.
//
// sanitizeProperty reconstruye el objeto property dejando SOLO los campos
// declarados, así nada interno de la API de Tokko llega al HTML.
export function sanitizeProperty(p: TokkoProperty): TokkoProperty {
  return {
    id: p.id,
    publication_title: p.publication_title,
    address: p.address,
    fake_address: p.fake_address,
    real_address: p.real_address,
    reference_code: p.reference_code,
    description: p.description,
    description_only: p.description_only,
    rich_description: p.rich_description,
    age: p.age,
    roofed_surface: p.roofed_surface,
    surface: p.surface,
    total_surface: p.total_surface,
    semiroofed_surface: p.semiroofed_surface,
    unroofed_surface: p.unroofed_surface,
    lot_number: p.lot_number,
    room_amount: p.room_amount,
    bathroom_amount: p.bathroom_amount,
    toilet_amount: p.toilet_amount,
    parking_lot_amount: p.parking_lot_amount,
    covered_parking_lot: p.covered_parking_lot,
    suite_amount: p.suite_amount,
    floors_amount: p.floors_amount,
    floor: p.floor,
    photos: (p.photos ?? []).map((ph) => ({
      description: ph.description,
      image: ph.image,
      is_blueprint: ph.is_blueprint,
      is_front_cover: ph.is_front_cover,
      order: ph.order,
      original: ph.original,
      thumb: ph.thumb,
    })),
    operations: (p.operations ?? []).map((op) => ({
      operation_id: op.operation_id,
      operation_type: op.operation_type,
      prices: (op.prices ?? []).map((pr) => ({
        currency: pr.currency,
        is_promotional: pr.is_promotional,
        period: pr.period,
        price: pr.price,
      })),
    })),
    type: p.type
      ? { code: p.type.code, id: p.type.id, name: p.type.name }
      : (p.type as TokkoPropertyType),
    location: p.location
      ? {
          id: p.location.id,
          name: p.location.name,
          full_location: p.location.full_location,
          short_location: p.location.short_location,
          divisions: p.location.divisions
            ? p.location.divisions.map((d) => ({ id: d.id, name: d.name }))
            : undefined,
        }
      : (p.location as TokkoLocation),
    geo_lat: p.geo_lat,
    geo_long: p.geo_long,
    web_price: p.web_price,
    is_starred_on_web: p.is_starred_on_web,
    status: p.status,
    deleted_at: p.deleted_at,
    tags: (p.tags ?? []).map((t) => ({ id: t.id, name: t.name, type: t.type })),
    videos: (p.videos ?? []).map((v) => ({
      id: v.id,
      title: v.title,
      description: v.description,
      url: v.url,
      player_url: v.player_url,
      provider: v.provider,
      provider_id: v.provider_id,
      video_id: v.video_id,
      order: v.order,
    })),
    property_condition: p.property_condition,
    orientation: p.orientation,
    disposition: p.disposition,
    situation: p.situation,
    files: (p.files ?? []).map((f) => ({ file: f.file })),
    public_url: p.public_url,
    development: p.development
      ? { id: p.development.id, name: p.development.name }
      : null,
    producer: p.producer
      ? {
          id: p.producer.id,
          name: p.producer.name,
          phone: p.producer.phone ?? null,
          cellphone: p.producer.cellphone ?? null,
          email: p.producer.email ?? null,
          picture: p.producer.picture ?? null,
        }
      : null,
  };
}

// ─── Productor (asesor asignado en Tokko) ───────────────────────────────────
//
// Tokko expone el `producer` por property — quien recibe las consultas. Antes
// la ficha mostraba "David Flores" hardcodeado y el WhatsApp iba al número
// general; ahora cada propiedad rutea al asesor real.

const FALLBACK_WA_NUMBER = '5493412101694'
const FALLBACK_PRODUCER_NAME = 'SI Inmobiliaria'

// Normaliza un teléfono crudo a formato wa.me (54 + 9 + área + número, sin
// símbolos). Si no se puede inferir, devuelve el número general.
export function getProducerWhatsappNumber(property: TokkoProperty): string {
  const raw = property.producer?.cellphone || property.producer?.phone || ''
  const digits = String(raw).replace(/\D/g, '')
  if (!digits) return FALLBACK_WA_NUMBER
  if (digits.startsWith('549')) return digits
  if (digits.startsWith('54')) return `549${digits.slice(2)}`
  if (digits.startsWith('0')) return `549${digits.slice(1)}`
  // Asume número AR sin código país ni 0 → completar con 549
  return `549${digits}`
}

export function getProducerName(property: TokkoProperty): string {
  return property.producer?.name?.trim() || FALLBACK_PRODUCER_NAME
}

// Construye el wa.me con mensaje pre-armado dirigido al productor real.
export function buildPropertyWhatsappUrl(property: TokkoProperty, slug: string): string {
  const number = getProducerWhatsappNumber(property)
  const name = getProducerName(property)
  const address = property.fake_address || property.address || ''
  const code = property.reference_code ? ` (cod ${property.reference_code})` : ''
  const url = `https://siinmobiliaria.com/propiedades/${slug}`
  const text = `Hola ${name}, te escribo por la propiedad ${address}${code}.\n\n${url}`
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}

// Variante para propiedades sin precio publicado (web_price: false): mismo
// número (productor real con fallback al general) y misma estructura de
// mensaje que buildPropertyWhatsappUrl, pero pidiendo el precio.
export function buildPriceConsultWhatsappUrl(property: TokkoProperty, slug: string): string {
  const number = getProducerWhatsappNumber(property)
  const name = getProducerName(property)
  const address = property.fake_address || property.address || ''
  const code = property.reference_code ? ` (cod ${property.reference_code})` : ''
  const url = `https://siinmobiliaria.com/propiedades/${slug}`
  const text = `Hola ${name}! Quiero consultar el precio de la propiedad ${address}${code}.\n\n${url}`
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}

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
  if (raw.includes('temporary') || raw.includes('vacation')) return 'Alquiler temporario';
  return String(type);
}

// Extrae el nombre de calle sin número, para mostrar en /v sin filtrar dirección.
//   "Bv Sarmiento 578" → "Bv Sarmiento"
//   "Casilda 621 - Villa Elvira - Funes" → "Casilda"
//   "Bv Sarmiento al 500" → "Bv Sarmiento" (drop conectores finales)
export function parseStreetOnly(address: string | null | undefined): string {
  const a = (address || '').replace(/\s+/g, ' ').trim()
  if (!a) return ''
  const m = a.match(/^(.+?)\s+\d/)
  let street = m ? m[1] : a
  street = street.replace(/[-,.]+$/, '').trim()
  // Drop palabras conectoras finales que aparecen en formatos tipo "Calle al 500"
  const stopWords = new Set(['al', 'a', 'esquina', 'esq', 'y'])
  const words = street.split(' ')
  while (words.length > 1 && stopWords.has(words[words.length - 1].toLowerCase())) {
    words.pop()
  }
  return words.join(' ')
}

// Único lugar de verdad sobre si una propiedad publica precio. Devuelve el
// precio formateado, o null cuando corresponde "Consultar precio": la
// propiedad está tildada "Sin Precio" en Tokko (web_price: false — la API
// igual manda el monto en operations, NO exponerlo) o no tiene precio cargado.
export function mostrarPrecio(
  property: Pick<TokkoProperty, 'operations' | 'web_price'>,
): string | null {
  if (property.web_price === false) return null;
  if (!property.operations || property.operations.length === 0) return null;
  const op = property.operations[0];
  if (!op.prices || op.prices.length === 0) return null;
  const p = op.prices[0];
  if (!p.price || p.price === 0) return null;
  const formatted = p.price.toLocaleString('es-AR');
  const suffix = op.operation_type === 'Rent' ? '/mes' : '';
  return `${p.currency} ${formatted}${suffix ? ' ' + suffix : ''}`;
}

export function formatPrice(
  property: Pick<TokkoProperty, 'operations' | 'web_price'>,
): string {
  return mostrarPrecio(property) ?? 'Consultar precio';
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

// ─── Tipología por ID (única fuente de verdad) ───────────────────────────────
// Mapa explícito de Tokko PROPERTY_TYPE_CHOICES → label en español. El filtrado
// y el label de las cards se hacen por `type.id` exacto contra este mapa, NUNCA
// por substring de nombre (p.ej. "warehouse" contiene "house" → un filtro por
// nombre arrastraba galpones bajo "Casa"). Un id desconocido cae a 'Otros',
// jamás a 'Casa'.
export const PROPERTY_TYPE_LABELS: Record<number, string> = {
  1: 'Terreno', 2: 'Departamento', 3: 'Casa', 4: 'Casa quinta', 5: 'Oficina',
  7: 'Local comercial', 9: 'Campo', 10: 'Cochera', 12: 'Galpón', 13: 'PH',
  14: 'Depósito', 24: 'Galpón',
}

export function propertyTypeLabelById(id: number | undefined | null): string {
  if (id == null) return 'Otros'
  return PROPERTY_TYPE_LABELS[id] ?? 'Otros'
}

// Grupos del filtro de tipología: cada opción lleva su(s) id(s) de Tokko.
// 12 y 24 (Galpón / Warehouse) se agrupan bajo la misma opción "Galpón".
// El dropdown surface solo los grupos con al menos un id presente en el
// inventario cargado (ver PropiedadesView).
export const TYPE_FILTER_GROUPS: { value: string; label: string; ids: number[] }[] = [
  { value: 'terreno',     label: 'Terreno',         ids: [1] },
  { value: 'departamento', label: 'Departamento',   ids: [2] },
  { value: 'casa',        label: 'Casa',            ids: [3] },
  { value: 'casa-quinta', label: 'Casa quinta',     ids: [4] },
  { value: 'oficina',     label: 'Oficina',         ids: [5] },
  { value: 'local',       label: 'Local comercial', ids: [7] },
  { value: 'campo',       label: 'Campo',           ids: [9] },
  { value: 'cochera',     label: 'Cochera',         ids: [10] },
  { value: 'galpon',      label: 'Galpón',          ids: [12, 24] },
  { value: 'ph',          label: 'PH',              ids: [13] },
  { value: 'deposito',    label: 'Depósito',        ids: [14] },
]

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

  // Faltantes que venían crudos en inglés
  'General radiant floor heating': 'Losa radiante',
  'Radiant floor heating': 'Losa radiante',
  'Radiant floor': 'Losa radiante',
  'Optical fiber': 'Fibra óptica',
  'Fiber optic': 'Fibra óptica',
  'Fiber Optic': 'Fibra óptica',
  'Club house': 'Club house',
  'Clubhouse': 'Club house',
  'Paddle court': 'Cancha de pádel',
  'Padel court': 'Cancha de pádel',
  'Tennis court': 'Cancha de tenis',
  'Private security': 'Seguridad privada',
}

export function translateTag(name: string): string {
  return TAG_ES[name] ?? name
}

// ─── Categorización de tags para la ficha ────────────────────────────────────
// La ficha agrupa los tags en categorías claras en vez de mezclar todo. Un tag
// que no esté acá NO se muestra (evita inglés crudo y "varios" sin sentido).
export type TagCategoria = 'servicios' | 'seguridad' | 'amenities' | 'ambientes' | 'confort'

const TAG_CAT: Record<string, TagCategoria> = {
  // Servicios (infraestructura)
  'Water': 'servicios', 'Drinking Water': 'servicios', 'Sewage': 'servicios',
  'Natural Gas': 'servicios', 'Electricity': 'servicios', 'Underground electricity': 'servicios',
  'Trifasic energy': 'servicios', 'Internet': 'servicios', 'WiFi': 'servicios',
  'Cable': 'servicios', 'Cable TV building': 'servicios', 'Satellite TV': 'servicios',
  'Phone': 'servicios', 'Pavement': 'servicios', 'Paved Street': 'servicios',
  'Public lighting': 'servicios', 'Rainwater drainage': 'servicios',
  'Gas Storage': 'servicios', 'Gas burners': 'servicios', 'Biodigesters': 'servicios',
  'Generator': 'servicios', 'Automatic watering': 'servicios',
  'Optical fiber': 'servicios', 'Fiber optic': 'servicios', 'Fiber Optic': 'servicios',
  // Seguridad
  '24 Hour Security': 'seguridad', '24 hr reception': 'seguridad', 'Security': 'seguridad',
  'Security Guard': 'seguridad', 'Entrance Security': 'seguridad', 'Alarm': 'seguridad',
  'Video Cameras': 'seguridad', 'Electric Gates': 'seguridad', 'Private security': 'seguridad',
  // Amenities (barrio/edificio)
  'Pool': 'amenities', 'Swimming Pool': 'amenities', 'Gym': 'amenities', 'SUM': 'amenities',
  'Sauna': 'amenities', 'Jacuzzi': 'amenities', 'Solarium': 'amenities',
  'Soccer Field': 'amenities', 'Sport center': 'amenities', 'Game room': 'amenities',
  'Recreational area': 'amenities', 'Amenities': 'amenities', 'Deck': 'amenities',
  'Playground': 'amenities', 'Lift': 'amenities', 'Elevator': 'amenities', 'Lobby': 'amenities',
  'Club house': 'amenities', 'Clubhouse': 'amenities', 'Paddle court': 'amenities',
  'Padel court': 'amenities', 'Tennis court': 'amenities',
  // Ambientes y espacios (de la propiedad)
  'Barbecue': 'ambientes', 'Barbecue area': 'ambientes', 'Covered BBQ': 'ambientes',
  'Individual grill in the apartment': 'ambientes', 'Garden': 'ambientes', 'Backyard': 'ambientes',
  'Terrace': 'ambientes', 'Balcony': 'ambientes', 'Balcony terrace': 'ambientes',
  'Gallery': 'ambientes', 'Attic': 'ambientes', 'Hall': 'ambientes', 'Landing': 'ambientes',
  'Storage room': 'ambientes', 'Storage': 'ambientes', 'Laundry': 'ambientes',
  'Laundry room': 'ambientes', 'Public Laundry': 'ambientes', 'Kitchen': 'ambientes',
  'Kitchenette': 'ambientes', 'Diary dining': 'ambientes', 'Dining lounge': 'ambientes',
  'Toilette': 'ambientes', 'Service bathroom': 'ambientes', 'Dresser': 'ambientes',
  'Fitted Wardrobes': 'ambientes', 'Independent Studio': 'ambientes', 'Office': 'ambientes',
  'Fixed garage': 'ambientes', 'Garage attendants': 'ambientes', 'Parking': 'ambientes',
  // Confort y climatización
  'Heating': 'confort', 'Central Heating': 'confort', 'Gas heating': 'confort',
  'Split heating': 'confort', 'Radiator heating': 'confort', 'Individual Air conditioner': 'confort',
  'Pre-installed Air-Conditioning': 'confort', 'Air Conditioning': 'confort', 'Fireplace': 'confort',
  'Luminous': 'confort', 'General radiant floor heating': 'confort',
  'Radiant floor heating': 'confort', 'Radiant floor': 'confort',
}

const CAT_ORDEN: { cat: TagCategoria; label: string }[] = [
  { cat: 'servicios', label: 'Servicios' },
  { cat: 'seguridad', label: 'Seguridad' },
  { cat: 'amenities', label: 'Amenities' },
  { cat: 'ambientes', label: 'Ambientes y espacios' },
  { cat: 'confort', label: 'Confort y climatización' },
]

/**
 * Agrupa los tags de una propiedad en las categorías de la ficha. Traduce,
 * deduplica (varios tags mapean al mismo label, ej. Laundry/Laundry room →
 * Lavadero) y descarta los que no tengan categoría (misc / inglés desconocido).
 * Devuelve solo las categorías con items, en orden.
 */
export function agruparTags(tags: { name: string }[]): { cat: TagCategoria; label: string; items: string[] }[] {
  const porCat = new Map<TagCategoria, Set<string>>()
  for (const t of tags) {
    const cat = TAG_CAT[t.name]
    if (!cat) continue
    if (!porCat.has(cat)) porCat.set(cat, new Set())
    porCat.get(cat)!.add(translateTag(t.name))
  }
  return CAT_ORDEN
    .filter((c) => porCat.has(c.cat))
    .map((c) => ({ cat: c.cat, label: c.label, items: Array.from(porCat.get(c.cat)!) }))
}

// Texto genérico que Tokko pone como footer/default en todas las propiedades
const BOILERPLATE = [
  'conocé el valor real de tu propiedad',
  'solicitalo y te lo entregamos en 24',
];

// Devuelve la descripción limpia (texto plano, sin HTML, sin boilerplate)
export function getDescription(property: TokkoProperty): string {
  const raw = property.description || property.description_only || property.rich_description || '';
  let clean = raw.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  if (!clean) return '';

  // Strip the explicit footer field if Tokko sent it appended.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const footer = (property as any).footer;
  if (typeof footer === 'string' && footer.trim()) {
    const footerClean = footer.replace(/<[^>]*>/g, '').trim();
    if (footerClean && clean.includes(footerClean)) {
      clean = clean.replace(footerClean, '').trim();
    }
  }

  // Tokko appends a boilerplate sales pitch at the bottom of every description.
  // Cut it from the first occurrence of any boilerplate phrase to the end —
  // earlier logic dropped the entire field when both phrases were present, which
  // wiped out real content above the footer.
  const lower = clean.toLowerCase();
  let cutIndex = -1;
  for (const phrase of BOILERPLATE) {
    const idx = lower.indexOf(phrase);
    if (idx !== -1 && (cutIndex === -1 || idx < cutIndex)) cutIndex = idx;
  }
  if (cutIndex !== -1) clean = clean.slice(0, cutIndex).trim();

  return clean;
}

// --- API calls ---

// ─── Puente Hilo (flag DATA_SOURCE=hilo) — lee de Hilo en vez de Tokko ───────
// Misma forma (TokkoProperty) y misma caché. El sitio no cambia: getProperties /
// getPropertyById delegan acá cuando el flag está en 'hilo'. Reversible al toque.
function isHiloSource(): boolean {
  return (process.env.DATA_SOURCE || '').toLowerCase() === 'hilo';
}
const HILO_BASE = process.env.HILO_FEED_URL || 'https://meethilo.com';

async function hiloGetPropertyById(id: number): Promise<TokkoProperty> {
  const res = await fetch(`${HILO_BASE}/api/public/propiedades/${id}`, {
    next: { revalidate: 21600, tags: ['tokko-properties', `tokko-property-${id}`] },
  });
  if (res.status === 404) throw new Error(`Property ${id} not found`);
  if (!res.ok) throw new Error(`Hilo feed error: ${res.status} ${res.statusText}`);
  return (await res.json()) as TokkoProperty;
}

async function hiloGetProperties(params?: {
  operation?: 'Sale' | 'Rent';
  typeId?: number;
  limit?: number;
  offset?: number;
}): Promise<TokkoListResponse> {
  const res = await fetch(`${HILO_BASE}/api/public/propiedades?limit=1000`, {
    next: { revalidate: 3600, tags: ['tokko-properties'] },
  });
  if (!res.ok) throw new Error(`Hilo feed error: ${res.status} ${res.statusText}`);
  const data = (await res.json()) as TokkoListResponse;
  let objects = data.objects ?? [];
  // El filtrado por operación/tipo lo hacemos acá (tenemos los ids de Tokko en type.id).
  if (params?.operation) {
    objects = objects.filter((o) => (o.operations || []).some((op) => op.operation_type === params.operation));
  }
  if (params?.typeId) {
    objects = objects.filter((o) => o.type?.id === params.typeId);
  }
  const offset = params?.offset ?? 0;
  const limit = params?.limit ?? objects.length;
  return {
    meta: { limit, offset, total_count: objects.length, next: null, previous: null },
    objects: objects.slice(offset, offset + limit),
  };
}

export async function getProperties(params?: {
  operation?: 'Sale' | 'Rent';
  typeId?: number;
  limit?: number;
  offset?: number;
}): Promise<TokkoListResponse> {
  if (isHiloSource()) return hiloGetProperties(params);

  const fetchPage = async (limit: number, offset: number): Promise<TokkoListResponse> => {
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

    // Retry transient failures (403/429/5xx) — Tokko rate-limits cold renders.
    let lastErr: unknown = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(url.toString(), {
          next: { revalidate: 3600, tags: ['tokko-properties'] },
        });
        if (!res.ok) {
          lastErr = new Error(`Tokko API error: ${res.status} ${res.statusText}`);
          if (attempt < 2) { await new Promise(r => setTimeout(r, 500 * (attempt + 1))); continue; }
          throw lastErr;
        }
        return (await res.json()) as TokkoListResponse;
      } catch (e) {
        lastErr = e;
        if (attempt < 2) { await new Promise(r => setTimeout(r, 500 * (attempt + 1))); continue; }
        throw e;
      }
    }
    throw lastErr ?? new Error('Tokko API: unreachable');
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
    // Dedup por id tras el merge de páginas. Cada página es un request HTTP
    // independiente (y en paralelo): si el orden upstream de Tokko cambia
    // entre requests (alta/baja/edición en el medio), un registro del borde
    // puede venir repetido en dos páginas. Ese dupe transitorio duplicaba la
    // ficha en el listado y el marker en el mapa (React: "two children with
    // the same key"). Nos quedamos con la primera aparición, preservando orden.
    const seenIds = new Set<number>();
    firstPage.objects = firstPage.objects.filter(o => {
      if (seenIds.has(o.id)) return false;
      seenIds.add(o.id);
      return true;
    });

    firstPage.meta.limit = totalCount;
  }

  return firstPage;
}

export async function getPropertyById(id: number): Promise<TokkoProperty> {
  if (isHiloSource()) return hiloGetPropertyById(id);

  const url = `${BASE_URL}/property/${id}/?key=${getApiKey()}&format=json&lang=es`;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, {
        next: { revalidate: 21600, tags: ['tokko-properties', `tokko-property-${id}`] },
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
