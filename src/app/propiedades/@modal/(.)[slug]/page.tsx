import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Bed, Bath, Maximize, Phone, MessageCircle, Home, Car } from 'lucide-react';
import PropertyModal from '@/components/PropertyModal';
import PropertyModalNav from '@/components/PropertyModalNav';
import ShareButtons from '@/components/ShareButtons';
import VisitWidget from '@/components/VisitWidget';
import BackButton from '@/components/BackButton';
import SimilarProperties from '@/components/SimilarProperties';
import {
  translateCondition,
  translateOrientation,
  translateDisposition,
  translateTag,
  type TokkoProperty,
} from '@/lib/tokko';
import { fetchPropertyData } from '@/lib/property-data';

const PropertyMap = dynamic(() => import('@/components/PropertyMap'), { ssr: false });
const PhotoGallery = dynamic(() => import('@/components/PhotoGallery'), { ssr: false });
const BlueprintGallery = dynamic(() => import('@/components/BlueprintGallery'), { ssr: false });
const NearbyPlaces = dynamic(() => import('@/components/NearbyPlaces'), { ssr: false });
const NearbyPropertiesMap = dynamic(() => import('@/components/NearbyPropertiesMap'), { ssr: false });

interface Props {
  params: { slug: string };
}

function SpecCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center text-center gap-1 py-3 px-2 bg-[#f9fafb] rounded-xl">
      <div className="text-[#1A5C38]">{icon}</div>
      <span className="text-gray-900 font-bold text-sm font-numeric">{value}</span>
      <span className="text-[11px] text-gray-400 font-medium">{label}</span>
    </div>
  );
}

function VideoSection({ videos }: { videos: TokkoProperty['videos'] }) {
  if (!videos || videos.length === 0) return null;
  return (
    <div className="space-y-4">
      {videos.map((video) => {
        const url = video.player_url || video.url || '';
        if (video.provider === 'youtube' && video.player_url) {
          const embedUrl = video.player_url.startsWith('https://www.youtube.com/embed/')
            ? video.player_url : `https://www.youtube.com/embed/${video.video_id}`;
          return <div key={video.id} className="relative w-full aspect-video rounded-xl overflow-hidden bg-black"><iframe src={embedUrl} title={video.title || 'Video'} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 w-full h-full" /></div>;
        }
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
          let videoId = video.video_id || '';
          const shortsMatch = url.match(/shorts\/([^?&]+)/);
          if (shortsMatch) videoId = shortsMatch[1];
          if (!videoId) { const watchMatch = url.match(/[?&]v=([^&]+)/); if (watchMatch) videoId = watchMatch[1]; }
          if (videoId) return <div key={video.id} className="relative w-full aspect-video rounded-xl overflow-hidden bg-black"><iframe src={`https://www.youtube.com/embed/${videoId}`} title={video.title || 'Video'} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 w-full h-full" /></div>;
        }
        return <div key={video.id} className="relative w-full aspect-video rounded-xl overflow-hidden bg-black"><video src={url} controls className="absolute inset-0 w-full h-full" title={video.title || 'Video'}><a href={url} target="_blank" rel="noopener noreferrer">Ver video</a></video></div>;
      })}
    </div>
  );
}

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

export default async function PropertyModalPage({ params }: Props) {
  const icons = {
    Maximize: <Maximize className="w-5 h-5" />,
    Home: <Home className="w-5 h-5" />,
    Bed: <Bed className="w-5 h-5" />,
    Bath: <Bath className="w-5 h-5" />,
    Car: <Car className="w-5 h-5" />,
  };

  const result = await fetchPropertyData(params.slug, icons);

  if ('notFound' in result || 'error' in result) {
    return (
      <PropertyModal slug={params.slug}>
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Propiedad no encontrada</h1>
          <Link href="/propiedades" className="text-[#1A5C38] font-semibold hover:underline">
            Volver al catálogo
          </Link>
        </div>
      </PropertyModal>
    );
  }

  const {
    property, photos, mainPhoto, price, operation, area, roofedArea, lotSurface,
    location, propType, description, blueprints, files, neighborhood, whatsappUrl,
    similar, nearbyForMap, specs, hasCoords, currentLat, currentLng,
  } = result.data;

  // 64px header + 44px tabs + 16px padding
  const scrollMargin = { scrollMarginTop: 124 };

  return (
    <PropertyModal slug={params.slug}>
      {/* Tabs de navegación sticky debajo del header */}
      <PropertyModalNav />

      {/* Hero image */}
      {mainPhoto ? (
        <div className="relative w-full h-[40vh] md:h-[50vh]">
          <Image src={mainPhoto} alt={property.publication_title || property.address} fill className="object-cover" sizes="100vw" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>
      ) : (
        <div className="w-full h-[30vh] flex items-center justify-center bg-gray-200"><span className="text-gray-400">Sin fotos</span></div>
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-10">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
          {/* ── LEFT COLUMN ── */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Title + badges + price */}
            <div id="resumen" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100" style={scrollMargin}>
              <BackButton />
              <h1 className="text-xl md:text-3xl font-black text-gray-900 leading-tight mb-3">
                {property.publication_title || property.address}
              </h1>
              <div className="flex gap-2 mb-3">
                {operation && <span className="px-3 py-1 bg-[#1A5C38] text-white text-[11px] font-bold rounded-full uppercase tracking-wide">{operation}</span>}
                {propType && <span className="px-3 py-1 bg-[#e8f5ee] text-[#1A5C38] text-[11px] font-bold rounded-full uppercase tracking-wide">{propType}</span>}
              </div>
              <div className="flex items-center gap-1.5 mb-5">
                <MapPin className="w-4 h-4 text-[#1A5C38] flex-shrink-0" />
                <span className="text-[13px] text-gray-500">{property.real_address || property.address}{location ? `, ${location}` : ''}</span>
              </div>
              <div>
                <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wide block mb-0.5">Precio</span>
                <span className="text-[28px] md:text-[32px] font-extrabold text-[#111] font-numeric leading-none">{price}</span>
              </div>
            </div>

            {/* Specs */}
            {specs.length > 0 && (
              <div id="caracteristicas" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100" style={scrollMargin}>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Características</h2>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {specs.map((s, i) => <SpecCard key={i} icon={s.icon} label={s.label} value={s.value} />)}
                </div>
              </div>
            )}

            {/* Gallery */}
            {photos.length > 1 && (
              <div id="galeria" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100" style={scrollMargin}>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Galería <span className="text-gray-400 text-sm font-normal font-numeric">{photos.length} fotos</span></h2>
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
              <div id="descripcion" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100" style={scrollMargin}>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Descripción</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line text-[15px]">{description}</p>
              </div>
            )}

            {/* Surfaces */}
            {(roofedArea || parseFloat(property.semiroofed_surface) > 0 || parseFloat(property.total_surface) > 0 || parseFloat(property.surface) > 0) && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Superficies</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                  {parseFloat(property.surface) > 0 && <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Terreno</span><span className="font-semibold font-numeric">{parseFloat(property.surface)} m²</span></div>}
                  {roofedArea != null && roofedArea > 0 && <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Cubierta</span><span className="font-semibold font-numeric">{roofedArea} m²</span></div>}
                  {parseFloat(property.semiroofed_surface) > 0 && <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Semicubierta</span><span className="font-semibold font-numeric">{parseFloat(property.semiroofed_surface)} m²</span></div>}
                  {parseFloat(property.total_surface) > 0 && <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Total</span><span className="font-semibold font-numeric">{parseFloat(property.total_surface)} m²</span></div>}
                </div>
              </div>
            )}

            {/* Details */}
            {(property.age != null || translateCondition(property.property_condition) || translateOrientation(property.orientation) || property.suite_amount > 0 || property.floors_amount > 0 || translateDisposition(property.disposition)) && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Detalles</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                  {property.age != null && property.age >= 0 && <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Antigüedad</span><span className="font-semibold font-numeric">{property.age === 0 ? 'A estrenar' : `${property.age} años`}</span></div>}
                  {translateCondition(property.property_condition) && <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Estado</span><span className="font-semibold">{translateCondition(property.property_condition)}</span></div>}
                  {translateOrientation(property.orientation) && <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Orientación</span><span className="font-semibold">{translateOrientation(property.orientation)}</span></div>}
                  {property.suite_amount > 0 && <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Suites</span><span className="font-semibold font-numeric">{property.suite_amount}</span></div>}
                  {property.floors_amount > 0 && <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Plantas</span><span className="font-semibold font-numeric">{property.floors_amount}</span></div>}
                  {translateDisposition(property.disposition) && <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Disposición</span><span className="font-semibold">{translateDisposition(property.disposition)}</span></div>}
                </div>
              </div>
            )}

            {/* Tags */}
            {property.tags && property.tags.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Servicios y amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {property.tags.map((tag) => <span key={tag.id} className="px-3 py-1.5 bg-[#f7f7f7] text-gray-600 rounded-full text-sm font-medium">{translateTag(tag.name)}</span>)}
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
            <div id="ubicacion" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100" style={scrollMargin}>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Ubicación</h2>
              <PropertyMap
                lat={property.geo_lat ? parseFloat(property.geo_lat) : null}
                lng={property.geo_long ? parseFloat(property.geo_long) : null}
                address={property.real_address || property.fake_address || property.address}
              />
            </div>

            {/* Nearby */}
            {hasCoords && <NearbyPlaces lat={currentLat!} lng={currentLng!} />}
            {hasCoords && nearbyForMap.length > 0 && <NearbyPropertiesMap lat={currentLat!} lng={currentLng!} nearbyProperties={nearbyForMap} />}

            {/* Similar */}
            <SimilarProperties properties={similar} currentPropertyId={property.id} />
          </div>

          {/* ── RIGHT COLUMN (sidebar sticky) ── */}
          <div id="contacto" className="w-full md:w-[380px] md:shrink-0" style={scrollMargin}>
            <div className="md:sticky md:top-[124px] space-y-4 md:max-h-[calc(100vh-140px)] md:overflow-y-auto md:scrollbar-none">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#25D366] hover:bg-[#1ea952] text-white rounded-xl font-bold text-sm transition-colors mb-2">
                  <MessageCircle className="w-5 h-5" />Consultar por WhatsApp
                </a>
                <a href="tel:+5493412101694"
                  className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-colors hover:bg-gray-50 mb-4">
                  <Phone className="w-5 h-5" />Llamar <span className="font-numeric">(341) 210-1694</span>
                </a>
                <hr className="border-gray-100 mb-4" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full bg-[#1A5C38] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">DF</div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-gray-900 block">David Flores</span>
                    <span className="text-xs text-gray-400">Mat. N° 0621</span>
                  </div>
                  <span className="text-[10px] font-semibold text-[#1A5C38] bg-[#e8f5ee] px-2 py-0.5 rounded-full uppercase">Agente</span>
                </div>
                <hr className="border-gray-100" />
                <ShareButtons slug={params.slug} title={property.publication_title || property.address} price={price} photo={mainPhoto} operation={operation} propertyType={propType} area={area} rooms={property.suite_amount || property.room_amount || 0} bathrooms={property.bathroom_amount} lotSurface={lotSurface} parking={property.parking_lot_amount} city={property.location?.name} neighborhood={neighborhood} />
              </div>
              {operation?.toLowerCase().includes('venta') && (
                <VisitWidget propertyId={property.id} propertyTitle={property.publication_title || property.address} />
              )}
            </div>
          </div>
        </div>
      </div>
    </PropertyModal>
  );
}
