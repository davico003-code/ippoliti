import {
  getPropertyById,
  getProperties,
  getIdFromSlug,
  getAllPhotos,
  formatPrice,
  getOperationType,
  getRoofedArea,
  getTotalSurface,
  getLotSurface,
  formatLocation,
  getDescription,
  getBlueprintPhotos,
  translatePropertyType,
  generatePropertySlug,
  type TokkoProperty,
} from '@/lib/tokko';
import type { NearbyProperty } from '@/components/NearbyPropertiesMap';
import type { ReactNode } from 'react';

export interface PropertyPageData {
  property: TokkoProperty;
  photos: string[];
  mainPhoto: string | null;
  price: string;
  operation: string;
  area: number | null;
  roofedArea: number | null;
  lotSurface: number | null;
  location: string;
  propType: string;
  description: string;
  blueprints: string[];
  files: { file: string }[];
  neighborhood: string | undefined;
  whatsappUrl: string;
  similar: TokkoProperty[];
  nearbyForMap: NearbyProperty[];
  specs: { icon: ReactNode; label: string; value: string | number }[];
  slug: string;
  hasCoords: boolean;
  currentLat: number | null;
  currentLng: number | null;
}

export async function fetchPropertyData(
  slug: string,
  icons: { Maximize: ReactNode; Home: ReactNode; Bed: ReactNode; Bath: ReactNode; Car: ReactNode },
): Promise<{ data: PropertyPageData } | { notFound: true } | { error: true }> {
  let property: TokkoProperty | null = null;

  try {
    const id = getIdFromSlug(slug);
    if (isNaN(id)) return { notFound: true };
    property = await getPropertyById(id);
  } catch (e) {
    if (e instanceof Error && e.message.includes('not found')) return { notFound: true };
    return { error: true };
  }

  if (!property) return { error: true };

  const photos = getAllPhotos(property);
  const mainPhoto = photos[0] || null;
  const price = formatPrice(property);
  const operation = getOperationType(property);
  const area = getTotalSurface(property);
  const roofedArea = getRoofedArea(property);
  const lotSurface = getLotSurface(property);
  const location = formatLocation(property);
  const propType = translatePropertyType(property.type?.name);
  const description = getDescription(property);
  const blueprints = getBlueprintPhotos(property);
  const files = (property.files || []).filter((f: { file: string }) => f.file);

  // Resolve real neighborhood
  const addrText = property.fake_address || property.address || '';
  const sortedDivisions = [...(property.location?.divisions ?? [])]
    .sort((a, b) => b.name.length - a.name.length);
  const neighborhood = sortedDivisions.find(d => {
    const escaped = d.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`, 'i').test(addrText);
  })?.name;

  const whatsappMsg = encodeURIComponent(
    `Hola! Me interesa esta propiedad:\n\n*${property.publication_title || property.address}*\n📍 ${property.fake_address || property.address}\n💰 ${price}\n\n🔗 https://siinmobiliaria.com/propiedades/${slug}`
  );
  const whatsappUrl = `https://wa.me/5493412101694?text=${whatsappMsg}`;

  // Similar + nearby
  let allProperties: TokkoProperty[] = [];
  try {
    const allData = await getProperties();
    allProperties = allData.objects ?? [];
  } catch { /* ok */ }

  const distKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const currentLat = property.geo_lat ? parseFloat(property.geo_lat) : null;
  const currentLng = property.geo_long ? parseFloat(property.geo_long) : null;
  const hasCoords = currentLat != null && !isNaN(currentLat) && currentLng != null && !isNaN(currentLng);

  let similar: TokkoProperty[] = [];
  try {
    const currentOp = property.operations?.[0]?.operation_type;
    const currentType = property.type?.name?.toLowerCase() ?? '';
    const currentPrice = property.operations?.[0]?.prices?.[0]?.price ?? 0;
    const locStr = (property.location?.short_location ?? property.location?.name ?? property.fake_address ?? '').toLowerCase();
    const addrStr = (property.fake_address ?? property.address ?? '').toLowerCase();
    const allLocText = `${locStr} ${addrStr}`;
    const NEARBY: Record<string, string[]> = {
      roldan: ['funes', 'fisherton'], funes: ['roldan', 'fisherton', 'rosario'],
      fisherton: ['funes', 'rosario', 'aldea fisherton'], rosario: ['fisherton', 'funes'],
    };
    let currentCity = '';
    for (const city of ['roldan', 'funes', 'fisherton', 'rosario', 'san lorenzo']) {
      if (allLocText.includes(city) || allLocText.includes(city.replace('a', 'á'))) { currentCity = city; break; }
    }
    const nearbyCities = currentCity ? (NEARBY[currentCity] ?? []) : [];
    const candidates = allProperties.filter(p => {
      if (p.id === property!.id) return false;
      if (p.operations?.[0]?.operation_type !== currentOp) return false;
      return (p.type?.name?.toLowerCase() ?? '') === currentType;
    });
    const scored = candidates.map(p => {
      let score = 0;
      const pAll = `${(p.location?.short_location ?? p.location?.name ?? '').toLowerCase()} ${(p.fake_address ?? p.address ?? '').toLowerCase()}`;
      if (currentCity && (pAll.includes(currentCity) || pAll.includes(currentCity.replace('a', 'á')))) score += 10;
      else if (nearbyCities.some(c => pAll.includes(c))) score += 5;
      const pPrice = p.operations?.[0]?.prices?.[0]?.price ?? 0;
      if (currentPrice > 0 && pPrice > 0) { const r = pPrice / currentPrice; if (r >= 0.7 && r <= 1.3) score += 3; }
      let dist = Infinity;
      if (hasCoords && p.geo_lat && p.geo_long) {
        const pLat = parseFloat(p.geo_lat); const pLng = parseFloat(p.geo_long);
        if (!isNaN(pLat) && !isNaN(pLng)) { dist = distKm(currentLat!, currentLng!, pLat, pLng); if (dist < 2) score += 4; else if (dist < 5) score += 2; else if (dist < 15) score += 1; }
      }
      return { p, score, dist };
    });
    scored.sort((a, b) => b.score !== a.score ? b.score - a.score : a.dist - b.dist);
    similar = scored.slice(0, 4).map(x => x.p);
  } catch { /* ok */ }

  const nearbyForMap: NearbyProperty[] = [];
  if (hasCoords) {
    for (const p of allProperties) {
      if (p.id === property.id || !p.geo_lat || !p.geo_long) continue;
      const pLat = parseFloat(p.geo_lat); const pLng = parseFloat(p.geo_long);
      if (isNaN(pLat) || isNaN(pLng)) continue;
      if (distKm(currentLat!, currentLng!, pLat, pLng) <= 5) {
        nearbyForMap.push({ id: p.id, lat: pLat, lng: pLng, title: p.publication_title || p.address, price: formatPrice(p), slug: generatePropertySlug(p) });
      }
    }
  }

  const specs: { icon: ReactNode; label: string; value: string | number }[] = [];
  if (area != null && area > 0) specs.push({ icon: icons.Maximize, label: 'Superficie', value: `${area} m²` });
  if (roofedArea != null && roofedArea > 0) specs.push({ icon: icons.Home, label: 'Cubierta', value: `${roofedArea} m²` });
  if (property.suite_amount > 0) specs.push({ icon: icons.Bed, label: 'Dormitorios', value: property.suite_amount });
  if (property.bathroom_amount > 0) specs.push({ icon: icons.Bath, label: 'Baños', value: property.bathroom_amount });
  if (property.parking_lot_amount > 0) specs.push({ icon: icons.Car, label: 'Cocheras', value: property.parking_lot_amount });
  if (lotSurface != null && lotSurface > 0 && lotSurface !== area) specs.push({ icon: icons.Maximize, label: 'Lote', value: `${lotSurface} m²` });

  return {
    data: {
      property, photos, mainPhoto, price, operation, area, roofedArea, lotSurface,
      location, propType, description, blueprints, files, neighborhood, whatsappUrl,
      similar, nearbyForMap, specs, slug, hasCoords, currentLat, currentLng,
    },
  };
}
