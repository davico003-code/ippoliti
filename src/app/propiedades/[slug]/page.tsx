import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Bed, Bath, Maximize, Phone, MessageCircle, Home, Tag } from 'lucide-react';

const PropertyMap = dynamic(() => import('@/components/PropertyMap'), { ssr: false });
const PhotoGallery = dynamic(() => import('@/components/PhotoGallery'), { ssr: false });
const NearbyPlaces = dynamic(() => import('@/components/NearbyPlaces'), { ssr: false });
const NearbyPropertiesMap = dynamic(() => import('@/components/NearbyPropertiesMap'), { ssr: false });
const BlueprintGallery = dynamic(() => import('@/components/BlueprintGallery'), { ssr: false });
import SimilarProperties from '@/components/SimilarProperties'
import ShareButtons from '@/components/ShareButtons';
import MobileStickyBar from '@/components/MobileStickyBar';
import MobileHeroGallery from '@/components/MobileHeroGallery';
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

export async function generateStaticParams() {
  try {
    const data = await getProperties({ limit: 50 });
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
    const title = property.publication_title || property.address;
    const desc = (property.description || property.description_only || '').replace(/<[^>]*>/g, '').slice(0, 160);
    const photo = getMainPhoto(property);
    const price = formatPrice(property);
    const loc = formatLocation(property);
    const ogDesc = `${price} - ${loc || property.address}. ${desc}`.slice(0, 200);
    return {
      title: `${title} | SI Inmobiliaria`,
      description: desc,
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

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center gap-1 p-4 bg-gray-50 rounded-xl">
      <div className="text-brand-600">{icon}</div>
      <span className="text-xs text-gray-500 font-medium">{label}</span>
      <span className="text-gray-900 font-bold font-numeric">{value}</span>
    </div>
  );
}

export default async function PropertyPage({ params }: Props) {
  let property: TokkoProperty | null = null;
  let notFound = false;

  try {
    const id = getIdFromSlug(params.slug);
    if (isNaN(id)) {
      notFound = true;
    } else {
      property = await getPropertyById(id);
    }
  } catch {
    notFound = true;
  }

  if (notFound || !property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Propiedad no encontrada</h1>
        <p className="text-gray-500 mb-8">La propiedad que buscás no existe o ya no está disponible.</p>
        <Link href="/propiedades" className="px-6 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition-colors">
          Ver todas las propiedades
        </Link>
      </div>
    );
  }

  const photos = getAllPhotos(property);
  const mainPhoto = photos[0] || null;
  const price = formatPrice(property);
  const operation = getOperationType(property);
  const area = getTotalSurface(property);
  const roofedArea = getRoofedArea(property);
  const location = formatLocation(property);

  const whatsappText = encodeURIComponent(
    `Hola! Me interesa la propiedad: ${property.publication_title || property.address}`
  );
  const whatsappUrl = `https://wa.me/5493412101694?text=${whatsappText}`;

  // Similar properties — same type + same operation (both mandatory)
  let similar: TokkoProperty[] = [];
  try {
    const allData = await getProperties({ limit: 100 });
    const currentOp = property.operations?.[0]?.operation_type;
    const currentType = property.type?.name?.toLowerCase() ?? '';
    const currentPrice = property.operations?.[0]?.prices?.[0]?.price ?? 0;
    const currentLat = property.geo_lat ? parseFloat(property.geo_lat) : null;
    const currentLng = property.geo_long ? parseFloat(property.geo_long) : null;

    // Resolve current city from location string
    const locStr = (property.location?.short_location ?? property.location?.name ?? property.fake_address ?? '').toLowerCase();
    const addrStr = (property.fake_address ?? property.address ?? '').toLowerCase();
    const allLocText = `${locStr} ${addrStr}`;

    const NEARBY: Record<string, string[]> = {
      roldan:     ['funes', 'fisherton'],
      funes:      ['roldan', 'fisherton', 'rosario'],
      fisherton:  ['funes', 'rosario', 'aldea fisherton'],
      rosario:    ['fisherton', 'funes'],
    };

    // Detect current city
    let currentCity = '';
    for (const city of ['roldan', 'funes', 'fisherton', 'rosario', 'san lorenzo']) {
      if (allLocText.includes(city) || allLocText.includes(city.replace('a', 'á'))) {
        currentCity = city; break;
      }
    }
    const nearbyCities = currentCity ? (NEARBY[currentCity] ?? []) : [];

    // Haversine distance in km
    const distKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    // Step 1: filter — same type + same operation (both mandatory)
    const candidates = (allData.objects ?? []).filter(p => {
      if (p.id === property.id) return false;
      if (p.operations?.[0]?.operation_type !== currentOp) return false;
      if ((p.type?.name?.toLowerCase() ?? '') !== currentType) return false;
      return true;
    });

    // Step 2: score each candidate
    const scored = candidates.map(p => {
      let score = 0;
      const pLoc = (p.location?.short_location ?? p.location?.name ?? p.fake_address ?? '').toLowerCase();
      const pAddr = (p.fake_address ?? p.address ?? '').toLowerCase();
      const pAll = `${pLoc} ${pAddr}`;

      // Same city/barrio → +10
      if (currentCity && (pAll.includes(currentCity) || pAll.includes(currentCity.replace('a', 'á')))) {
        score += 10;
      }
      // Nearby city → +5
      else if (nearbyCities.some(c => pAll.includes(c))) {
        score += 5;
      }

      // Price within ±30% → +3
      const pPrice = p.operations?.[0]?.prices?.[0]?.price ?? 0;
      if (currentPrice > 0 && pPrice > 0) {
        const ratio = pPrice / currentPrice;
        if (ratio >= 0.7 && ratio <= 1.3) score += 3;
      }

      // Geographic distance bonus (closer = higher score)
      let dist = Infinity;
      if (currentLat && currentLng && p.geo_lat && p.geo_long) {
        const pLat = parseFloat(p.geo_lat);
        const pLng = parseFloat(p.geo_long);
        if (!isNaN(pLat) && !isNaN(pLng)) {
          dist = distKm(currentLat, currentLng, pLat, pLng);
          if (dist < 2) score += 4;
          else if (dist < 5) score += 2;
          else if (dist < 15) score += 1;
        }
      }

      return { p, score, dist };
    });

    // Step 3: sort by score desc, then distance asc
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.dist - b.dist;
    });

    similar = scored.slice(0, 4).map(x => x.p);
  } catch {}

  // Nearby properties for map markers (within 5km, with coords)
  const nearbyForMap: NearbyProperty[] = [];
  try {
    const propLat = property.geo_lat ? parseFloat(property.geo_lat) : null;
    const propLng = property.geo_long ? parseFloat(property.geo_long) : null;
    if (propLat && propLng) {
      const allData = await getProperties({ limit: 100 });
      for (const p of allData.objects ?? []) {
        if (p.id === property.id) continue;
        if (!p.geo_lat || !p.geo_long) continue;
        const pLat = parseFloat(p.geo_lat);
        const pLng = parseFloat(p.geo_long);
        if (isNaN(pLat) || isNaN(pLng)) continue;
        const dLat = (pLat - propLat) * Math.PI / 180;
        const dLon = (pLng - propLng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 +
          Math.cos(propLat * Math.PI / 180) * Math.cos(pLat * Math.PI / 180) *
          Math.sin(dLon / 2) ** 2;
        const dist = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        if (dist <= 5) {
          nearbyForMap.push({
            id: p.id,
            lat: pLat,
            lng: pLng,
            title: p.publication_title || p.address,
            price: formatPrice(p),
            slug: generatePropertySlug(p),
          });
        }
      }
    }
  } catch {}

  // JSON-LD structured data
  const mainPhotoUrl = getMainPhoto(property);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: property.publication_title || property.address,
    description: getDescription(property),
    image: mainPhotoUrl ? [mainPhotoUrl] : [],
    offers: {
      '@type': 'Offer',
      price: property.operations?.[0]?.prices?.[0]?.price?.toString() ?? '0',
      priceCurrency: property.operations?.[0]?.prices?.[0]?.currency ?? 'USD',
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-brand-600 transition-colors">Inicio</Link>
            <span>/</span>
            <Link href="/propiedades" className="hover:text-brand-600 transition-colors">Propiedades</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium line-clamp-1">
              {property.publication_title || property.address}
            </span>
          </nav>
        </div>
      </div>

      {/* Mobile: hero + tap to open lightbox */}
      {mainPhoto && (
        <MobileHeroGallery
          photos={photos}
          mainPhoto={mainPhoto}
          title={property.publication_title || property.address}
          price={price}
          operation={operation}
        />
      )}

      {/* Desktop: Full width hero image */}
      {mainPhoto ? (
        <div className="hidden md:block relative w-full h-[70vh]">
          <Image
            src={mainPhoto}
            alt={property.publication_title || property.address}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          {operation && (
            <div className="absolute top-6 left-12 z-10">
              <span className="px-6 py-2 text-sm font-bold rounded-full shadow-lg uppercase tracking-wider backdrop-blur-md bg-brand-600 text-white">
                {operation}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="hidden md:flex w-full h-[40vh] items-center justify-center bg-gray-200">
          <span className="text-gray-400">Sin fotos disponibles</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title, Address & Price */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-100">
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl md:text-3xl font-black text-brand-600 leading-tight">
                  {property.publication_title || property.address}
                </h1>
                <div className="flex items-center text-brand-600 mt-1 mb-2">
                  <MapPin className="w-5 h-5 mr-1.5 flex-shrink-0" />
                  <span className="text-lg font-bold">{property.real_address || property.address}{location ? `, ${location}` : ''}</span>
                </div>
                <div className="text-brand-600 font-black text-3xl mt-2 font-numeric">{price}</div>
              </div>
            </div>

            {/* Photo gallery with lightbox */}
            {photos.length > 1 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Galería de Fotos
                  <span className="text-gray-400 text-sm font-normal ml-2 font-numeric">{photos.length} fotos</span>
                </h2>
                <PhotoGallery photos={photos} alt={property.publication_title || property.address} />
              </div>
            )}

            {/* Video */}
            {property.videos && property.videos.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-brand-600 mb-4">Video de la propiedad</h2>
                <div className="space-y-4">
                  {property.videos.map((video) => {
                    const url = video.player_url || video.url || '';

                    // YouTube embed URL (player_url is already embeddable)
                    if (video.provider === 'youtube' && video.player_url) {
                      const embedUrl = video.player_url.startsWith('https://www.youtube.com/embed/')
                        ? video.player_url
                        : `https://www.youtube.com/embed/${video.video_id}`;
                      return (
                        <div key={video.id} className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
                          <iframe
                            src={embedUrl}
                            title={video.title || 'Video de la propiedad'}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="absolute inset-0 w-full h-full"
                          />
                        </div>
                      );
                    }

                    // YouTube Shorts or other youtube.com URLs
                    if (url.includes('youtube.com') || url.includes('youtu.be')) {
                      let videoId = video.video_id || '';
                      // Extract ID from shorts URL
                      const shortsMatch = url.match(/shorts\/([^?&]+)/);
                      if (shortsMatch) videoId = shortsMatch[1];
                      if (!videoId) {
                        const watchMatch = url.match(/[?&]v=([^&]+)/);
                        if (watchMatch) videoId = watchMatch[1];
                      }
                      if (videoId) {
                        return (
                          <div key={video.id} className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
                            <iframe
                              src={`https://www.youtube.com/embed/${videoId}`}
                              title={video.title || 'Video de la propiedad'}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="absolute inset-0 w-full h-full"
                            />
                          </div>
                        );
                      }
                    }

                    // Instagram embed
                    if (url.includes('instagram.com')) {
                      return (
                        <div key={video.id} className="flex justify-center">
                          <blockquote
                            className="instagram-media"
                            data-instgrm-permalink={url}
                            data-instgrm-version="14"
                            style={{ maxWidth: '540px', width: '100%' }}
                          />
                          <script async src="https://www.instagram.com/embed.js" />
                        </div>
                      );
                    }

                    // Fallback: direct video or link
                    return (
                      <div key={video.id} className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
                        <video
                          src={url}
                          controls
                          className="absolute inset-0 w-full h-full"
                          title={video.title || 'Video de la propiedad'}
                        >
                          <a href={url} target="_blank" rel="noopener noreferrer" className="text-brand-600">
                            Ver video
                          </a>
                        </video>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-brand-600 mb-4">Características Principales</h2>

              {/* Top row — icon cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {area != null && area > 0 && (
                  <StatItem icon={<Maximize className="w-6 h-6" />} label="Superficie" value={`${area} m²`} />
                )}
                {property.room_amount > 0 && (
                  <StatItem icon={<Bed className="w-6 h-6" />} label="Dormitorios" value={property.room_amount} />
                )}
                {property.bathroom_amount > 0 && (
                  <StatItem icon={<Bath className="w-6 h-6" />} label="Baños" value={property.bathroom_amount} />
                )}
                {translatePropertyType(property.type?.name) && (
                  <StatItem icon={<Home className="w-6 h-6" />} label="Tipo" value={translatePropertyType(property.type?.name)} />
                )}
                {operation && (
                  <StatItem icon={<Tag className="w-6 h-6" />} label="Operación" value={operation} />
                )}
              </div>

              {/* Surfaces section */}
              {(roofedArea || parseFloat(property.semiroofed_surface) > 0 || parseFloat(property.total_surface) > 0 || parseFloat(property.surface) > 0) && (
                <>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mt-6 mb-3">Superficies y medidas</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                    {parseFloat(property.surface) > 0 && (
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-500">Terreno</span>
                        <span className="font-semibold text-brand-600 font-numeric">{parseFloat(property.surface)} m²</span>
                      </div>
                    )}
                    {roofedArea != null && roofedArea > 0 && (
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-500">Sup. cubierta</span>
                        <span className="font-semibold text-brand-600 font-numeric">{roofedArea} m²</span>
                      </div>
                    )}
                    {parseFloat(property.semiroofed_surface) > 0 && (
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-500">Sup. semicubierta</span>
                        <span className="font-semibold text-brand-600 font-numeric">{parseFloat(property.semiroofed_surface)} m²</span>
                      </div>
                    )}
                    {parseFloat(property.total_surface) > 0 && (
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-500">Total construido</span>
                        <span className="font-semibold text-brand-600 font-numeric">{parseFloat(property.total_surface)} m²</span>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Details section */}
              {(property.age != null || translateCondition(property.property_condition) || translateOrientation(property.orientation) || property.parking_lot_amount > 0 || property.suite_amount > 0 || property.floors_amount > 0 || translateDisposition(property.disposition)) && (
                <>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mt-6 mb-3">Detalles</h3>
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
                    {property.parking_lot_amount > 0 && (
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-500">Cocheras</span>
                        <span className="font-semibold font-numeric">{property.parking_lot_amount}</span>
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
            {/* Description */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Descripción</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                {getDescription(property) || 'Sin descripción disponible.'}
              </p>
            </div>

            {/* Tags */}
            {property.tags && property.tags.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-brand-600" />
                  Características adicionales
                </h2>
                <div className="flex flex-wrap gap-2">
                  {property.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                    >
                      {translateTag(tag.name)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Planos */}
            {(() => {
              const blueprints = getBlueprintPhotos(property);
              const files = (property.files || []).filter(f => f.file);
              if (blueprints.length === 0 && files.length === 0) return null;
              return (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Maximize className="w-5 h-5 text-brand-600" />
                    Planos
                  </h2>
                  {blueprints.length > 0 && (
                    <div className="mb-4">
                      <BlueprintGallery blueprints={blueprints} />
                    </div>
                  )}
                  {files.length > 0 && (
                    <div className="space-y-2">
                      {files.map((f, i) => {
                        const name = decodeURIComponent(f.file.split('/').pop() || `Documento ${i + 1}`);
                        const isPdf = f.file.toLowerCase().endsWith('.pdf');
                        return (
                          <a key={i} href={f.file} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-brand-50 transition-colors group">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isPdf ? 'bg-red-50 text-red-500' : 'bg-brand-50 text-brand-600'}`}>
                              <span className="text-xs font-black uppercase">{isPdf ? 'PDF' : 'IMG'}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-brand-600 transition-colors">{name}</p>
                              <p className="text-xs text-gray-400">Click para abrir</p>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Right column — Contact */}
          <div className="space-y-6">
            <div className="hidden md:block bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-1">¿Te interesa esta propiedad?</h2>
              <p className="text-gray-500 text-sm mb-6">Contactanos y te respondemos a la brevedad.</p>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg mb-3"
              >
                <MessageCircle className="w-5 h-5" />
                Consultar por WhatsApp
              </a>

              <a
                href="tel:+5493412101694"
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold transition-all shadow-md mt-3"
              >
                <Phone className="w-5 h-5" />
                Llamar <span className="font-numeric">(341) 210-1694</span>
              </a>

              <ShareButtons
                slug={params.slug}
                title={property.publication_title || property.address}
                price={price}
                photo={mainPhoto}
                operation={operation}
                propertyType={translatePropertyType(property.type?.name)}
                area={area}
                rooms={property.room_amount}
                bathrooms={property.bathroom_amount}
              />
            </div>

            <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5 text-sm">
              <p className="font-semibold text-gray-900 mb-1">ID de Propiedad: #{property.id}</p>
              {property.type?.name && <p className="text-gray-600">Tipo: {translatePropertyType(property.type.name)}</p>}
              {operation && <p className="text-gray-600">Operación: {operation}</p>}
            </div>
          </div>
        </div>

        {/* Location map */}
        <div className="mt-10">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ubicación</h2>
            <PropertyMap
              lat={property.geo_lat ? parseFloat(property.geo_lat) : null}
              lng={property.geo_long ? parseFloat(property.geo_long) : null}
              address={property.real_address || property.fake_address || property.address}
            />
            <div className="flex items-center gap-2 mt-4 text-gray-600 text-sm">
              <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <span>
                {property.real_address || property.fake_address || property.address}
                {location ? `, ${location}` : ', Santa Fe'}
              </span>
            </div>
          </div>
        </div>

        {/* Nearby places (Overpass/OSM) */}
        {property.geo_lat && property.geo_long && (
          <div className="mt-6">
            <NearbyPlaces lat={parseFloat(property.geo_lat)} lng={parseFloat(property.geo_long)} />
          </div>
        )}


        {/* Nearby properties map (Zillow-style) */}
        {property.geo_lat && property.geo_long && nearbyForMap.length > 0 && (
          <div className="mt-6">
            <NearbyPropertiesMap
              lat={parseFloat(property.geo_lat)}
              lng={parseFloat(property.geo_long)}
              nearbyProperties={nearbyForMap}
            />
          </div>
        )}

        {/* Similar properties */}
        <SimilarProperties properties={similar} currentPropertyId={property.id} />

        {/* Back link */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link href="/propiedades" className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-bold transition-colors text-lg">
            ← Volver al catálogo
          </Link>
        </div>
      </div>

      {/* Mobile sticky contact bar */}
      <MobileStickyBar
        whatsappUrl={whatsappUrl}
        slug={params.slug}
        title={property.publication_title || property.address}
        price={price}
        photo={mainPhoto}
        operation={operation}
        propertyType={translatePropertyType(property.type?.name)}
        area={area}
        rooms={property.room_amount}
        bathrooms={property.bathroom_amount}
      />
    </div>
  );
}
