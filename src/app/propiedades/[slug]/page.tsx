import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Bed, Bath, Maximize, Phone, MessageCircle, Home, Car } from 'lucide-react';

const PropertyMap = dynamic(() => import('@/components/PropertyMap'), { ssr: false });
const PhotoGallery = dynamic(() => import('@/components/PhotoGallery'), { ssr: false });
const NearbyPlaces = dynamic(() => import('@/components/NearbyPlaces'), { ssr: false });
const NearbyPropertiesMap = dynamic(() => import('@/components/NearbyPropertiesMap'), { ssr: false });
const BlueprintGallery = dynamic(() => import('@/components/BlueprintGallery'), { ssr: false });
import SimilarProperties from '@/components/SimilarProperties'
import ShareButtons from '@/components/ShareButtons';
import MobileStickyBar from '@/components/MobileStickyBar';
import PropertyDescription from '@/components/PropertyDescription';
import VisitWidget, { VisitMobileTrigger } from '@/components/VisitWidget';
import BackButton from '@/components/BackButton';
import PropertyViewTracker from '@/components/PropertyViewTracker';
import type { NearbyProperty } from '@/components/NearbyPropertiesMap';
import {
  getPropertyById,
  getProperties,
  getIdFromSlug,
  generatePropertySlug,
  getAllPhotos,
  formatPrice,
  getOperationType,
  getRoofedArea,
  getTotalSurface,
  getLotSurface,
  formatLocation,
  getMainPhoto,
  getDescription,
  getBlueprintPhotos,
  translatePropertyType,
  translateCondition,
  translateOrientation,
  translateDisposition,
  translateTag,
  type TokkoProperty,
} from '@/lib/tokko';

export const revalidate = 21600;

interface Props {
  params: { slug: string };
}

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const data = await getProperties({ limit: 500 });
    return (data.objects || []).map((p) => ({
      slug: generatePropertySlug(p),
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const id = getIdFromSlug(params.slug);
    const property = await getPropertyById(id);
    const rawTitle = property.publication_title || property.address;
    const title = rawTitle ? rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1) : 'Propiedad';
    const desc = (property.description || property.description_only || '').replace(/<[^>]*>/g, '').slice(0, 160);
    const photo = getMainPhoto(property);
    const price = formatPrice(property);
    const loc = formatLocation(property);
    const ogDesc = `${price} - ${loc || property.address}. ${desc}`.slice(0, 200);
    return {
      title: `${title} | SI Inmobiliaria`,
      description: desc,
      alternates: { canonical: `https://siinmobiliaria.com/propiedades/${params.slug}` },
      openGraph: {
        title,
        description: ogDesc,
        url: `https://siinmobiliaria.com/propiedades/${params.slug}`,
        type: 'article',
        ...(photo ? { images: [{ url: photo, width: 800, height: 600, alt: title }] } : {}),
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description: ogDesc,
        ...(photo ? { images: [photo] } : {}),
      },
    };
  } catch {
    return { title: 'Propiedad | SI Inmobiliaria' };
  }
}

/* ── Stat card (mobile specs grid) ── */
function SpecCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center gap-1.5 p-3 bg-[#f7f7f7] rounded-xl">
      <div className="text-[#1A5C38]">{icon}</div>
      <span className="text-gray-900 font-bold text-sm font-numeric">{value}</span>
      <span className="text-[11px] text-gray-400 font-medium">{label}</span>
    </div>
  );
}

export default async function PropertyPage({ params }: Props) {
  let property: TokkoProperty | null = null;
  let notFound = false;
  let fetchError = false;

  try {
    const id = getIdFromSlug(params.slug);
    if (isNaN(id)) {
      notFound = true;
    } else {
      property = await getPropertyById(id);
    }
  } catch (e) {
    if (e instanceof Error && e.message.includes('not found')) {
      notFound = true;
    } else {
      fetchError = true;
    }
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Propiedad no encontrada</h1>
        <p className="text-gray-500 mb-8">La propiedad que buscás no existe o ya no está disponible.</p>
        <Link href="/propiedades" className="px-6 py-3 bg-[#1A5C38] text-white rounded-xl font-semibold hover:bg-[#0F3A23] transition-colors">
          Ver todas las propiedades
        </Link>
      </div>
    );
  }

  if (fetchError || !property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] px-4 text-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#1A5C38] rounded-full animate-spin mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Cargando propiedad...</h1>
        <p className="text-gray-500 mb-6">Si la página no carga, intentá recargar.</p>
        <a href={`/propiedades/${params.slug}`} className="px-6 py-3 bg-[#1A5C38] text-white rounded-xl font-semibold hover:bg-[#0F3A23] transition-colors">
          Recargar página
        </a>
      </div>
    );
  }

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
  const files = (property.files || []).filter(f => f.file);

  const whatsappMsg = encodeURIComponent(
    `Hola! Me interesa esta propiedad:\n\n*${property.publication_title || property.address}*\n📍 ${property.fake_address || property.address}\n💰 ${price}\n\n🔗 https://siinmobiliaria.com/propiedades/${params.slug}`
  );
  const whatsappUrl = `https://wa.me/5493412101694?text=${whatsappMsg}`;

  // ── Fetch all properties once (shared by similar + nearby) ──
  let allProperties: TokkoProperty[] = [];
  try {
    const allData = await getProperties();
    allProperties = allData.objects ?? [];
  } catch (err) {
    console.error('[property-detail] Error fetching all properties:', err instanceof Error ? err.message : err);
  }

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

  // ── Similar properties logic ──
  let similar: TokkoProperty[] = [];
  try {
    const currentOp = property.operations?.[0]?.operation_type;
    const currentType = property.type?.name?.toLowerCase() ?? '';
    const currentPrice = property.operations?.[0]?.prices?.[0]?.price ?? 0;
    const locStr = (property.location?.short_location ?? property.location?.name ?? property.fake_address ?? '').toLowerCase();
    const addrStr = (property.fake_address ?? property.address ?? '').toLowerCase();
    const allLocText = `${locStr} ${addrStr}`;
    const NEARBY: Record<string, string[]> = {
      roldan: ['funes', 'fisherton'],
      funes: ['roldan', 'fisherton', 'rosario'],
      fisherton: ['funes', 'rosario', 'aldea fisherton'],
      rosario: ['fisherton', 'funes'],
    };
    let currentCity = '';
    for (const city of ['roldan', 'funes', 'fisherton', 'rosario', 'san lorenzo']) {
      if (allLocText.includes(city) || allLocText.includes(city.replace('a', 'á'))) {
        currentCity = city; break;
      }
    }
    const nearbyCities = currentCity ? (NEARBY[currentCity] ?? []) : [];
    const candidates = allProperties.filter(p => {
      if (p.id === property!.id) return false;
      if (p.operations?.[0]?.operation_type !== currentOp) return false;
      if ((p.type?.name?.toLowerCase() ?? '') !== currentType) return false;
      return true;
    });
    const scored = candidates.map(p => {
      let score = 0;
      const pLoc = (p.location?.short_location ?? p.location?.name ?? p.fake_address ?? '').toLowerCase();
      const pAddr = (p.fake_address ?? p.address ?? '').toLowerCase();
      const pAll = `${pLoc} ${pAddr}`;
      if (currentCity && (pAll.includes(currentCity) || pAll.includes(currentCity.replace('a', 'á')))) score += 10;
      else if (nearbyCities.some(c => pAll.includes(c))) score += 5;
      const pPrice = p.operations?.[0]?.prices?.[0]?.price ?? 0;
      if (currentPrice > 0 && pPrice > 0) {
        const ratio = pPrice / currentPrice;
        if (ratio >= 0.7 && ratio <= 1.3) score += 3;
      }
      let dist = Infinity;
      if (hasCoords && p.geo_lat && p.geo_long) {
        const pLat = parseFloat(p.geo_lat);
        const pLng = parseFloat(p.geo_long);
        if (!isNaN(pLat) && !isNaN(pLng)) {
          dist = distKm(currentLat!, currentLng!, pLat, pLng);
          if (dist < 2) score += 4;
          else if (dist < 5) score += 2;
          else if (dist < 15) score += 1;
        }
      }
      return { p, score, dist };
    });
    scored.sort((a, b) => b.score !== a.score ? b.score - a.score : a.dist - b.dist);
    similar = scored.slice(0, 4).map(x => x.p);
  } catch (err) {
    console.error('[property-detail] Error computing similar properties:', err instanceof Error ? err.message : err);
  }

  // ── Nearby properties for map (reuses allProperties, no second fetch) ──
  const nearbyForMap: NearbyProperty[] = [];
  if (hasCoords) {
    for (const p of allProperties) {
      if (p.id === property.id) continue;
      if (!p.geo_lat || !p.geo_long) continue;
      const pLat = parseFloat(p.geo_lat);
      const pLng = parseFloat(p.geo_long);
      if (isNaN(pLat) || isNaN(pLng)) continue;
      const dist = distKm(currentLat!, currentLng!, pLat, pLng);
      if (dist <= 5) {
        nearbyForMap.push({
          id: p.id, lat: pLat, lng: pLng,
          title: p.publication_title || p.address,
          price: formatPrice(p),
          slug: generatePropertySlug(p),
        });
      }
    }
  }

  // ── Spec items ──
  const specs: { icon: React.ReactNode; label: string; value: string | number }[] = [];
  if (area != null && area > 0) specs.push({ icon: <Maximize className="w-5 h-5" />, label: 'Superficie', value: `${area} m²` });
  if (roofedArea != null && roofedArea > 0) specs.push({ icon: <Home className="w-5 h-5" />, label: 'Cubierta', value: `${roofedArea} m²` });
  if (property.suite_amount > 0) specs.push({ icon: <Bed className="w-5 h-5" />, label: 'Dormitorios', value: property.suite_amount });
  if (property.bathroom_amount > 0) specs.push({ icon: <Bath className="w-5 h-5" />, label: 'Baños', value: property.bathroom_amount });
  if (property.parking_lot_amount > 0) specs.push({ icon: <Car className="w-5 h-5" />, label: 'Cocheras', value: property.parking_lot_amount });
  if (lotSurface != null && lotSurface > 0 && lotSurface !== area) specs.push({ icon: <Maximize className="w-5 h-5" />, label: 'Lote', value: `${lotSurface} m²` });

  // JSON-LD — RealEstateListing + BreadcrumbList
  const mainPhotoUrl = getMainPhoto(property);
  const propPrice = property.operations?.[0]?.prices?.[0]?.price ?? 0;
  const propCurrency = property.operations?.[0]?.prices?.[0]?.currency ?? 'USD';
  const propUrl = `https://siinmobiliaria.com/propiedades/${params.slug}`;
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'RealEstateListing',
      name: property.publication_title || property.address,
      description,
      url: propUrl,
      image: mainPhotoUrl ? [mainPhotoUrl] : [],
      offers: {
        '@type': 'Offer',
        price: propPrice.toString(),
        priceCurrency: propCurrency,
        availability: 'https://schema.org/InStock',
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: property.real_address || property.fake_address || property.address,
        addressLocality: property.location?.name || '',
        addressRegion: 'Santa Fe',
        addressCountry: 'AR',
      },
      ...(hasCoords ? {
        geo: {
          '@type': 'GeoCoordinates',
          latitude: currentLat,
          longitude: currentLng,
        },
      } : {}),
      numberOfRooms: (property.suite_amount || property.room_amount || 0) + (property.bathroom_amount || 0),
      numberOfBedrooms: property.suite_amount || property.room_amount || undefined,
      numberOfBathroomsTotal: property.bathroom_amount || undefined,
      floorSize: area ? { '@type': 'QuantitativeValue', value: area, unitCode: 'MTK' } : undefined,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://siinmobiliaria.com' },
        { '@type': 'ListItem', position: 2, name: 'Propiedades', item: 'https://siinmobiliaria.com/propiedades' },
        { '@type': 'ListItem', position: 3, name: property.publication_title || property.address, item: propUrl },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PropertyViewTracker propertyId={property.id} title={property.publication_title || property.address} price={price} />

      {/* ════════════════════════════════════════════
          MOBILE LAYOUT (md:hidden)
          ════════════════════════════════════════════ */}
      <div className="md:hidden pb-[120px]">
        {/* Hero photo */}
        {mainPhoto ? (
          <div className="relative w-full h-[280px]">
            <Image
              src={mainPhoto}
              alt={property.publication_title || property.address}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            {/* Back button */}
            <Link
              href="/propiedades"
              className="absolute top-4 left-4 w-9 h-9 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
            >
              <span className="text-lg leading-none">&larr;</span>
            </Link>
          </div>
        ) : (
          <div className="w-full h-[200px] flex items-center justify-center bg-gray-200">
            <span className="text-gray-400">Sin fotos</span>
          </div>
        )}

        {/* Info card */}
        <div className="mx-3 -mt-6 relative z-10 bg-white rounded-[20px] shadow-[0_2px_20px_rgba(0,0,0,0.08)] p-5 mb-4">
          <BackButton />
          {/* Badges */}
          <div className="flex gap-2 mb-3">
            {operation && (
              <span className="px-3 py-1 bg-[#1A5C38] text-white text-[11px] font-bold rounded-full uppercase tracking-wide">
                {operation}
              </span>
            )}
            {propType && (
              <span className="px-3 py-1 bg-[#e8f5ee] text-[#1A5C38] text-[11px] font-bold rounded-full uppercase tracking-wide">
                {propType}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-xl font-bold text-gray-900 leading-[1.3] mb-2">
            {property.publication_title || property.address}
          </h1>

          {/* Location */}
          <div className="flex items-center gap-1.5 mb-4">
            <MapPin className="w-4 h-4 text-[#1A5C38] flex-shrink-0" />
            <span className="text-[13px] text-gray-500">
              {property.real_address || property.address}{location ? `, ${location}` : ''}
            </span>
          </div>

          {/* Price */}
          <div className="mb-5">
            <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wide block mb-0.5">Precio</span>
            <span className="text-[28px] font-black text-gray-900 font-numeric leading-none">{price}</span>
          </div>

          <hr className="border-gray-100 mb-5" />

          {/* Specs grid */}
          {specs.length > 0 && (
            <>
              <div className="grid grid-cols-3 gap-2 mb-5">
                {specs.slice(0, 6).map((s, i) => (
                  <SpecCard key={i} icon={s.icon} label={s.label} value={s.value} />
                ))}
              </div>
              <hr className="border-gray-100 mb-5" />
            </>
          )}

          {/* Agent card */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-full bg-[#1A5C38] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              DF
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-bold text-gray-900 block">David Flores</span>
              <span className="text-xs text-gray-400">Mat. N° 0621</span>
            </div>
            <span className="text-[10px] font-semibold text-[#1A5C38] bg-[#e8f5ee] px-2 py-0.5 rounded-full uppercase">Agente</span>
          </div>

          {/* Contact buttons */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#25D366] text-white rounded-xl font-bold text-sm transition-colors hover:bg-[#1ea952] mb-2"
          >
            <MessageCircle className="w-5 h-5" />
            Consultar por WhatsApp
          </a>
          <a
            href="tel:+5493412101694"
            className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-colors hover:bg-gray-50"
          >
            <Phone className="w-5 h-5" />
            Llamar al agente
          </a>
        </div>

        {/* Photo gallery */}
        {photos.length > 1 && (
          <div className="mx-3 bg-white rounded-[20px] shadow-[0_2px_20px_rgba(0,0,0,0.08)] p-5 mb-4">
            <h2 className="text-base font-bold text-gray-900 mb-3">
              Fotos <span className="text-gray-400 text-sm font-normal font-numeric">{photos.length}</span>
            </h2>
            <PhotoGallery photos={photos} alt={property.publication_title || property.address} />
          </div>
        )}

        {/* Description */}
        {description && (
          <div className="mx-3 bg-white rounded-[20px] shadow-[0_2px_20px_rgba(0,0,0,0.08)] p-5 mb-4">
            <h2 className="text-base font-bold text-gray-900 mb-3">Descripción</h2>
            <PropertyDescription text={description} />
          </div>
        )}

        {/* Video */}
        {property.videos && property.videos.length > 0 && (
          <div className="mx-3 bg-white rounded-[20px] shadow-[0_2px_20px_rgba(0,0,0,0.08)] p-5 mb-4">
            <h2 className="text-base font-bold text-gray-900 mb-3">Video</h2>
            <VideoSection videos={property.videos} />
          </div>
        )}

        {/* Tags */}
        {property.tags && property.tags.length > 0 && (
          <div className="mx-3 bg-white rounded-[20px] shadow-[0_2px_20px_rgba(0,0,0,0.08)] p-5 mb-4">
            <h2 className="text-base font-bold text-gray-900 mb-3">Servicios y amenities</h2>
            <div className="flex flex-wrap gap-2">
              {property.tags.map((tag) => (
                <span key={tag.id} className="px-3 py-1.5 bg-[#f7f7f7] text-gray-600 rounded-full text-xs font-medium">
                  {translateTag(tag.name)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Surfaces & details */}
        <SurfacesAndDetails property={property} roofedArea={roofedArea} />

        {/* Blueprints */}
        {(blueprints.length > 0 || files.length > 0) && (
          <div className="mx-3 bg-white rounded-[20px] shadow-[0_2px_20px_rgba(0,0,0,0.08)] p-5 mb-4">
            <h2 className="text-base font-bold text-gray-900 mb-3">Planos</h2>
            {blueprints.length > 0 && <BlueprintGallery blueprints={blueprints} />}
            {files.length > 0 && <FilesList files={files} />}
          </div>
        )}

        {/* Map */}
        <div className="mx-3 bg-white rounded-[20px] shadow-[0_2px_20px_rgba(0,0,0,0.08)] p-5 mb-4 overflow-hidden relative">
          <h2 className="text-base font-bold text-gray-900 mb-3">Ubicación</h2>
          <PropertyMap
            lat={property.geo_lat ? parseFloat(property.geo_lat) : null}
            lng={property.geo_long ? parseFloat(property.geo_long) : null}
            address={property.real_address || property.fake_address || property.address}
          />
        </div>

        {/* Nearby places */}
        {property.geo_lat && property.geo_long && (
          <div className="mx-3 mb-4">
            <NearbyPlaces lat={parseFloat(property.geo_lat)} lng={parseFloat(property.geo_long)} />
          </div>
        )}

        {/* Nearby properties map */}
        {property.geo_lat && property.geo_long && nearbyForMap.length > 0 && (
          <div className="mx-3 mb-4">
            <NearbyPropertiesMap
              lat={parseFloat(property.geo_lat)}
              lng={parseFloat(property.geo_long)}
              nearbyProperties={nearbyForMap}
            />
          </div>
        )}

        {/* Similar */}
        <div className="mx-3 mb-24">
          <SimilarProperties properties={similar} currentPropertyId={property.id} />
        </div>
      </div>

      {/* ════════════════════════════════════════════
          DESKTOP LAYOUT (hidden md:block)
          ════════════════════════════════════════════ */}
      <div className="hidden md:block">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
            <nav className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-[#1A5C38] transition-colors">Inicio</Link>
              <span>/</span>
              <Link href="/propiedades" className="hover:text-[#1A5C38] transition-colors">Propiedades</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium line-clamp-1">
                {property.publication_title || property.address}
              </span>
            </nav>
          </div>
        </div>

        {/* Full-width hero image */}
        {mainPhoto ? (
          <div className="relative w-full h-[70vh]">
            <Image
              src={mainPhoto}
              alt={property.publication_title || property.address}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </div>
        ) : (
          <div className="w-full h-[40vh] flex items-center justify-center bg-gray-200">
            <span className="text-gray-400">Sin fotos disponibles</span>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <div className="flex gap-10 items-start">
            {/* ── LEFT COLUMN (2/3) ── */}
            <div className="flex-1 min-w-0 space-y-6">
              {/* Title + badges + location */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <BackButton />
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight mb-3">
                  {property.publication_title || property.address}
                </h1>
                <div className="flex gap-2 mb-3">
                  {operation && (
                    <span className="px-3 py-1 bg-[#1A5C38] text-white text-[11px] font-bold rounded-full uppercase tracking-wide">
                      {operation}
                    </span>
                  )}
                  {propType && (
                    <span className="px-3 py-1 bg-[#e8f5ee] text-[#1A5C38] text-[11px] font-bold rounded-full uppercase tracking-wide">
                      {propType}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mb-5">
                  <MapPin className="w-4 h-4 text-[#1A5C38] flex-shrink-0" />
                  <span className="text-[13px] text-gray-500">
                    {property.real_address || property.address}{location ? `, ${location}` : ''}
                  </span>
                </div>

                {/* Price */}
                <div>
                  <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wide block mb-0.5">Precio</span>
                  <span className="text-[32px] font-extrabold text-[#111] font-numeric leading-none">{price}</span>
                </div>
              </div>

              {/* Características (icon specs) */}
              {specs.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Características</h2>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {specs.map((s, i) => (
                      <SpecCard key={i} icon={s.icon} label={s.label} value={s.value} />
                    ))}
                  </div>
                </div>
              )}

              {/* Photo gallery */}
              {photos.length > 1 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    Galería <span className="text-gray-400 text-sm font-normal font-numeric">{photos.length} fotos</span>
                  </h2>
                  <PhotoGallery photos={photos} alt={property.publication_title || property.address} />
                </div>
              )}

              {/* Video */}
              {property.videos && property.videos.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Video</h2>
                  <VideoSection videos={property.videos} />
                </div>
              )}

              {/* Description */}
              {description && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Descripción</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line text-[15px]">{description}</p>
                </div>
              )}

              {/* Superficies */}
              {(roofedArea || parseFloat(property.semiroofed_surface) > 0 || parseFloat(property.total_surface) > 0 || parseFloat(property.surface) > 0) && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Superficies</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                    {parseFloat(property.surface) > 0 && (
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-500">Terreno</span>
                        <span className="font-semibold font-numeric">{parseFloat(property.surface)} m²</span>
                      </div>
                    )}
                    {roofedArea != null && roofedArea > 0 && (
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-500">Cubierta</span>
                        <span className="font-semibold font-numeric">{roofedArea} m²</span>
                      </div>
                    )}
                    {parseFloat(property.semiroofed_surface) > 0 && (
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-500">Semicubierta</span>
                        <span className="font-semibold font-numeric">{parseFloat(property.semiroofed_surface)} m²</span>
                      </div>
                    )}
                    {parseFloat(property.total_surface) > 0 && (
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-500">Total construido</span>
                        <span className="font-semibold font-numeric">{parseFloat(property.total_surface)} m²</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Detalles */}
              {(property.age != null || translateCondition(property.property_condition) || translateOrientation(property.orientation) || property.suite_amount > 0 || property.floors_amount > 0 || translateDisposition(property.disposition)) && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Detalles</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                    {property.age != null && property.age >= 0 && (
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-500">Antigüedad</span>
                        <span className="font-semibold font-numeric">{property.age === 0 ? 'A estrenar' : `${property.age} años`}</span>
                      </div>
                    )}
                    {translateCondition(property.property_condition) && (
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-500">Estado</span>
                        <span className="font-semibold">{translateCondition(property.property_condition)}</span>
                      </div>
                    )}
                    {translateOrientation(property.orientation) && (
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-500">Orientación</span>
                        <span className="font-semibold">{translateOrientation(property.orientation)}</span>
                      </div>
                    )}
                    {property.suite_amount > 0 && (
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-500">Suites</span>
                        <span className="font-semibold font-numeric">{property.suite_amount}</span>
                      </div>
                    )}
                    {property.floors_amount > 0 && (
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-500">Plantas</span>
                        <span className="font-semibold font-numeric">{property.floors_amount}</span>
                      </div>
                    )}
                    {translateDisposition(property.disposition) && (
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-500">Disposición</span>
                        <span className="font-semibold">{translateDisposition(property.disposition)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tags */}
              {property.tags && property.tags.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Servicios y amenities</h2>
                  <div className="flex flex-wrap gap-2">
                    {property.tags.map((tag) => (
                      <span key={tag.id} className="px-3 py-1.5 bg-[#f7f7f7] text-gray-600 rounded-full text-sm font-medium">
                        {translateTag(tag.name)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Blueprints */}
              {(blueprints.length > 0 || files.length > 0) && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Planos</h2>
                  {blueprints.length > 0 && <div className="mb-4"><BlueprintGallery blueprints={blueprints} /></div>}
                  {files.length > 0 && <FilesList files={files} />}
                </div>
              )}

              {/* Map */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Ubicación</h2>
                <PropertyMap
                  lat={property.geo_lat ? parseFloat(property.geo_lat) : null}
                  lng={property.geo_long ? parseFloat(property.geo_long) : null}
                  address={property.real_address || property.fake_address || property.address}
                />
                <div className="flex items-center gap-2 mt-4 text-gray-500 text-sm">
                  <MapPin className="w-4 h-4 text-[#1A5C38] flex-shrink-0" />
                  <span>
                    {property.real_address || property.fake_address || property.address}
                    {location ? `, ${location}` : ', Santa Fe'}
                  </span>
                </div>
              </div>

              {/* Nearby places */}
              {property.geo_lat && property.geo_long && (
                <NearbyPlaces lat={parseFloat(property.geo_lat)} lng={parseFloat(property.geo_long)} />
              )}

              {/* Nearby properties map */}
              {property.geo_lat && property.geo_long && nearbyForMap.length > 0 && (
                <NearbyPropertiesMap
                  lat={parseFloat(property.geo_lat)}
                  lng={parseFloat(property.geo_long)}
                  nearbyProperties={nearbyForMap}
                />
              )}
            </div>

            {/* ── RIGHT COLUMN (1/3) sticky ── */}
            <div className="w-[380px] shrink-0">
              <div className="sticky top-24 space-y-4 max-h-[calc(100vh-112px)] overflow-y-auto scrollbar-none">
                {/* Main card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  {/* WhatsApp button */}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#25D366] hover:bg-[#1ea952] text-white rounded-xl font-bold text-sm transition-colors mb-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Consultar por WhatsApp
                  </a>

                  {/* Call button */}
                  <a
                    href="tel:+5493412101694"
                    className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-colors hover:bg-gray-50 mb-4"
                  >
                    <Phone className="w-5 h-5" />
                    Llamar <span className="font-numeric">(341) 210-1694</span>
                  </a>

                  <hr className="border-gray-100 mb-4" />

                  {/* Agent card */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-full bg-[#1A5C38] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      DF
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-bold text-gray-900 block">David Flores</span>
                      <span className="text-xs text-gray-400">Mat. N° 0621</span>
                    </div>
                    <span className="text-[10px] font-semibold text-[#1A5C38] bg-[#e8f5ee] px-2 py-0.5 rounded-full uppercase">Agente</span>
                  </div>

                  <hr className="border-gray-100" />

                  {/* Share buttons */}
                  <ShareButtons
                    slug={params.slug}
                    title={property.publication_title || property.address}
                    price={price}
                    photo={mainPhoto}
                    operation={operation}
                    propertyType={propType}
                    area={area}
                    rooms={property.suite_amount || property.room_amount || 0}
                    bathrooms={property.bathroom_amount}
                    lotSurface={lotSurface}
                    parking={property.parking_lot_amount}
                    city={property.location?.name}
                    neighborhood={property.location?.divisions?.[0]?.name}
                  />
                </div>

                {/* Visit widget — only for VENTA */}
                {operation?.toLowerCase().includes('venta') && (
                  <VisitWidget propertyId={property.id} propertyTitle={property.publication_title || property.address} />
                )}
              </div>
            </div>
          </div>

          {/* Similar properties */}
          <div className="mt-10">
            <SimilarProperties properties={similar} currentPropertyId={property.id} />
          </div>

          {/* Back */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link href="/propiedades" className="inline-flex items-center gap-2 text-[#1A5C38] hover:text-[#0F3A23] font-bold transition-colors text-lg">
              &larr; Volver al catálogo
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile visit trigger — only for VENTA */}
      {operation?.toLowerCase().includes('venta') && (
        <VisitMobileTrigger propertyId={property.id} propertyTitle={property.publication_title || property.address} />
      )}

      {/* Mobile sticky bar */}
      <MobileStickyBar
        whatsappUrl={whatsappUrl}
        slug={params.slug}
        title={property.publication_title || property.address}
        price={price}
        photo={mainPhoto}
        operation={operation}
        propertyType={propType}
        area={area}
        rooms={property.suite_amount || property.room_amount || 0}
        bathrooms={property.bathroom_amount}
        lotSurface={lotSurface}
        parking={property.parking_lot_amount}
        city={property.location?.name}
        neighborhood={property.location?.divisions?.[0]?.name}
      />
    </div>
  );
}

/* ── Video section (shared between mobile and desktop) ── */
function VideoSection({ videos }: { videos: TokkoProperty['videos'] }) {
  if (!videos || videos.length === 0) return null;
  return (
    <div className="space-y-4">
      {videos.map((video) => {
        const url = video.player_url || video.url || '';
        if (video.provider === 'youtube' && video.player_url) {
          const embedUrl = video.player_url.startsWith('https://www.youtube.com/embed/')
            ? video.player_url
            : `https://www.youtube.com/embed/${video.video_id}`;
          return (
            <div key={video.id} className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
              <iframe src={embedUrl} title={video.title || 'Video'} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 w-full h-full" />
            </div>
          );
        }
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
          let videoId = video.video_id || '';
          const shortsMatch = url.match(/shorts\/([^?&]+)/);
          if (shortsMatch) videoId = shortsMatch[1];
          if (!videoId) { const watchMatch = url.match(/[?&]v=([^&]+)/); if (watchMatch) videoId = watchMatch[1]; }
          if (videoId) {
            return (
              <div key={video.id} className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
                <iframe src={`https://www.youtube.com/embed/${videoId}`} title={video.title || 'Video'} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 w-full h-full" />
              </div>
            );
          }
        }
        if (url.includes('instagram.com')) {
          return (
            <div key={video.id} className="flex justify-center">
              <blockquote className="instagram-media" data-instgrm-permalink={url} data-instgrm-version="14" style={{ maxWidth: '540px', width: '100%' }} />
              <script async src="https://www.instagram.com/embed.js" />
            </div>
          );
        }
        return (
          <div key={video.id} className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
            <video src={url} controls className="absolute inset-0 w-full h-full" title={video.title || 'Video'}>
              <a href={url} target="_blank" rel="noopener noreferrer">Ver video</a>
            </video>
          </div>
        );
      })}
    </div>
  );
}

/* ── Surfaces & details card (mobile only) ── */
function SurfacesAndDetails({ property, roofedArea }: { property: TokkoProperty; roofedArea: number | null }) {
  const hasSurfaces = roofedArea || parseFloat(property.semiroofed_surface) > 0 || parseFloat(property.total_surface) > 0 || parseFloat(property.surface) > 0;
  const hasDetails = property.age != null || translateCondition(property.property_condition) || translateOrientation(property.orientation) || property.suite_amount > 0 || property.floors_amount > 0 || translateDisposition(property.disposition);
  if (!hasSurfaces && !hasDetails) return null;

  return (
    <div className="mx-3 bg-white rounded-[20px] shadow-[0_2px_20px_rgba(0,0,0,0.08)] p-5 mb-4">
      {hasSurfaces && (
        <>
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Superficies</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-4">
            {parseFloat(property.surface) > 0 && (
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Terreno</span>
                <span className="font-semibold font-numeric">{parseFloat(property.surface)} m²</span>
              </div>
            )}
            {roofedArea != null && roofedArea > 0 && (
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Cubierta</span>
                <span className="font-semibold font-numeric">{roofedArea} m²</span>
              </div>
            )}
            {parseFloat(property.semiroofed_surface) > 0 && (
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Semicubierta</span>
                <span className="font-semibold font-numeric">{parseFloat(property.semiroofed_surface)} m²</span>
              </div>
            )}
            {parseFloat(property.total_surface) > 0 && (
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Total</span>
                <span className="font-semibold font-numeric">{parseFloat(property.total_surface)} m²</span>
              </div>
            )}
          </div>
        </>
      )}
      {hasDetails && (
        <>
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Detalles</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {property.age != null && property.age >= 0 && (
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Antigüedad</span>
                <span className="font-semibold font-numeric">{property.age === 0 ? 'A estrenar' : `${property.age} años`}</span>
              </div>
            )}
            {translateCondition(property.property_condition) && (
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Estado</span>
                <span className="font-semibold">{translateCondition(property.property_condition)}</span>
              </div>
            )}
            {translateOrientation(property.orientation) && (
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Orientación</span>
                <span className="font-semibold">{translateOrientation(property.orientation)}</span>
              </div>
            )}
            {property.suite_amount > 0 && (
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Suites</span>
                <span className="font-semibold font-numeric">{property.suite_amount}</span>
              </div>
            )}
            {property.floors_amount > 0 && (
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Plantas</span>
                <span className="font-semibold font-numeric">{property.floors_amount}</span>
              </div>
            )}
            {translateDisposition(property.disposition) && (
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Disposición</span>
                <span className="font-semibold">{translateDisposition(property.disposition)}</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Files list ── */
function FilesList({ files }: { files: { file: string }[] }) {
  return (
    <div className="space-y-2 mt-3">
      {files.map((f, i) => {
        const name = decodeURIComponent(f.file.split('/').pop() || `Documento ${i + 1}`);
        const isPdf = f.file.toLowerCase().endsWith('.pdf');
        return (
          <a key={i} href={f.file} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-[#e8f5ee] transition-colors group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isPdf ? 'bg-red-50 text-red-500' : 'bg-[#e8f5ee] text-[#1A5C38]'}`}>
              <span className="text-xs font-black uppercase">{isPdf ? 'PDF' : 'IMG'}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#1A5C38] transition-colors">{name}</p>
              <p className="text-xs text-gray-400">Click para abrir</p>
            </div>
          </a>
        );
      })}
    </div>
  );
}
