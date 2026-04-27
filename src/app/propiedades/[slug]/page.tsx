import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import MobileStickyBar from '@/components/MobileStickyBar';
import PropertyViewTracker from '@/components/PropertyViewTracker';
import PropiedadesView from '@/components/PropiedadesView';
import PropertyGalleryHero from '@/components/property-detail/PropertyGalleryHero';
import PropertyStickyNav from '@/components/property-detail/PropertyStickyNav';
import PropertyDetailBody from '@/components/property-detail/PropertyDetailBody';
import PropertyDetailSimilars from '@/components/property-detail/PropertyDetailSimilars';
import {
  getPropertyById,
  getProperties,
  getIdFromSlug,
  formatPrice,
  formatLocation,
  getTotalSurface,
  getMainPhoto,
  getDescription,
  sanitizeProperty,
  type TokkoProperty,
} from '@/lib/tokko';

export const revalidate = 21600;

interface Props {
  params: { slug: string };
}

export const dynamicParams = true;

// Lazy SSG: generate slug pages on-demand (first request) instead of at build time.
// Tokko rate-limits (403) under the concurrent prerender load of ~219 properties,
// which previously caused empty HTML on /propiedades.
export async function generateStaticParams() {
  return [];
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

export default async function PropertyPage({ params }: Props) {
  const id = getIdFromSlug(params.slug);
  if (isNaN(id)) {
    notFound();
  }

  let property: TokkoProperty;
  try {
    property = sanitizeProperty(await getPropertyById(id));
  } catch (e) {
    if (e instanceof Error && e.message.includes('not found')) {
      notFound();
    }
    throw e;
  }

  const price = formatPrice(property);
  const area = getTotalSurface(property);

  const whatsappMsg = encodeURIComponent(
    `Hola! Me interesa esta propiedad:\n\n*${property.publication_title || property.address}*\n📍 ${property.fake_address || property.address}\n💰 ${price}\n\n🔗 https://siinmobiliaria.com/propiedades/${params.slug}`
  );
  const whatsappUrl = `https://wa.me/5493412101694?text=${whatsappMsg}`;

  // ── Fetch all properties once (shared by similar + nearby) ──
  let allProperties: TokkoProperty[] = [];
  try {
    const allData = await getProperties();
    allProperties = (allData.objects ?? []).map(sanitizeProperty);
  } catch (err) {
    console.error('[property-detail] Error fetching all properties:', err instanceof Error ? err.message : err);
  }

  const currentLat = property.geo_lat ? parseFloat(property.geo_lat) : null;
  const currentLng = property.geo_long ? parseFloat(property.geo_long) : null;
  const hasCoords = currentLat != null && !isNaN(currentLat) && currentLng != null && !isNaN(currentLng);
  const description = getDescription(property);

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
          Usa los mismos componentes compartidos que desktop (gallery, sticky
          nav, detail body) para mantener paridad. El MobileStickyBar flotante
          de abajo queda intacto — por eso el wrapper tiene pb-28 para que el
          contenido no quede tapado por la barra flotante.
          ════════════════════════════════════════════ */}
      <div className="md:hidden min-h-screen bg-[#fafafa]" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 112px)' }}>
        {/* Header propio de la ficha mobile — back + logo + (acciones) */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 grid grid-cols-3 items-center px-4" style={{ height: 56 }}>
          <Link
            href="/propiedades"
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-700"
            aria-label="Volver al mapa"
            style={{ fontFamily: "'Raleway', system-ui, sans-serif" }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="truncate">Volver al mapa</span>
          </Link>
          <Link href="/" className="flex items-center justify-center" aria-label="Ir a la página principal">
            <Image
              src="/LOGO_HORIZONTAL.png"
              alt="SI Inmobiliaria"
              width={120}
              height={24}
              className="object-contain"
              style={{ height: 24, width: 'auto' }}
              priority
            />
          </Link>
          <div />
        </div>

        {/* Galería Zillow adaptada a mobile (grande + 2x2 thumbs) */}
        <div className="px-4 pt-3 pb-2">
          <PropertyGalleryHero property={property} />
        </div>

        {/* Sticky tabs con scroll horizontal */}
        <PropertyStickyNav
          sections={[
            { id: 'overview', label: 'Overview' },
            { id: 'caracteristicas', label: 'Características' },
            { id: 'descripcion', label: 'Descripción' },
            { id: 'planos', label: 'Planos' },
            { id: 'ubicacion', label: 'Ubicación' },
            { id: 'similares', label: 'Similares' },
          ]}
          stickyTop={56}
        />

        {/* Contenido compartido */}
        <div className="px-4 py-4">
          <PropertyDetailBody
            property={property}
            allProperties={allProperties}
            whatsappUrl={whatsappUrl}
            showMobileContact
          />
        </div>

        {/* Full-width: "Otras opciones para vos" */}
        <div className="px-4 pb-6">
          <PropertyDetailSimilars property={property} allProperties={allProperties} />
        </div>

        {/* Link "Volver al catálogo" */}
        <div className="px-4 pb-6 pt-2 border-t border-gray-100">
          <Link
            href="/propiedades"
            className="inline-flex items-center gap-2 text-[#1A5C38] hover:text-[#0F3A23] font-bold text-base"
            style={{ fontFamily: "'Raleway', system-ui, sans-serif" }}
          >
            ← Volver al catálogo
          </Link>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          DESKTOP LAYOUT (hidden md:block)
          Zillow-style: render the listing+map with the property panel
          auto-opened on top. The shared PropertyPanel manages its own
          URL/history so navigating between properties doesn't remount.
          ════════════════════════════════════════════ */}
      <div className="hidden md:block">
        <PropiedadesView properties={allProperties} initialPropertyId={property.id} />
      </div>

      {/* Mobile sticky bar */}
      <MobileStickyBar
        whatsappUrl={whatsappUrl}
        slug={params.slug}
        title={property.publication_title || property.address}
        propertyId={property.id}
        propertyTitle={property.publication_title || property.address}
      />
    </div>
  );
}

