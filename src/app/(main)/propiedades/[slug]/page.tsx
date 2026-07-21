import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import AudioSummary from '@/components/AudioSummary';
import MobileStickyBar from '@/components/MobileStickyBar';
import PropertyViewTracker from '@/components/PropertyViewTracker';
import PropertyDetailZillowDesktopPanel from '@/components/property-detail/PropertyDetailZillowDesktopPanel';
import PropertyGalleryHero from '@/components/property-detail/PropertyGalleryHero';
import PropertyStickyNav from '@/components/property-detail/PropertyStickyNav';
import PropertyDetailBody from '@/components/property-detail/PropertyDetailBody';
import PropertyDetailSimilars from '@/components/property-detail/PropertyDetailSimilars';
import {
  getPropertyById,
  getIdFromSlug,
  generatePropertySlug,
  isMonoambiente,
  formatPrice,
  mostrarPrecio,
  formatLocation,
  getTotalSurface,
  getMainPhoto,
  getDescription,
  sanitizeProperty,
  buildPropertyWhatsappUrl,
  type TokkoProperty,
} from '@/lib/tokko';
import { PROPERTY_SEO, applyPropertySeoOverride } from '@/lib/seoOverrides';

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
    // Override de SEO por ID (unidades de emprendimientos): title y meta custom.
    // El canonical de abajo usa el publication_title ORIGINAL (el slug no cambia).
    const seo = PROPERTY_SEO[property.id];
    const rawTitle = seo?.title || property.publication_title || property.address;
    const title = rawTitle ? rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1) : 'Propiedad';
    // #1: el texto de Tokko trae whitespace/newlines al inicio; los tags se
    // reemplazan por espacio (no pegar palabras), se colapsan los espacios y se
    // trimea ANTES de cortar a 160, para no desperdiciar el límite con basura.
    const desc = seo?.metaDescription ?? (property.description || property.description_only || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 160);
    const photo = getMainPhoto(property);
    const price = formatPrice(property);
    const loc = formatLocation(property);
    const ogDesc = `${price} - ${loc || property.address}. ${desc}`.slice(0, 200);
    // #3: canonical SIEMPRE al slug canónico del ID (no al slug pedido), para
    // consolidar los duplicados que sirve cualquier sufijo con el ID correcto.
    const canonicalUrl = `https://siinmobiliaria.com/propiedades/${generatePropertySlug(property)}`;
    return {
      title: `${title} | SI Inmobiliaria`,
      description: desc,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title,
        description: ogDesc,
        url: canonicalUrl,
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
    // La propiedad no existe / el feed falló. La ruta hace notFound() pero por
    // una limitación de Next el streaming ya commiteó HTTP 200 (soft-404). El
    // noindex evita que Google indexe esa página de error.
    return { title: 'Propiedad no encontrada | SI Inmobiliaria', robots: { index: false, follow: false } };
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
      // LIMITACIÓN CONOCIDA (#2 soft-404): en esta ruta el notFound() resuelve
      // HTTP 200 (no 404) porque la respuesta hace streaming y commitea 200
      // antes de ejecutarse. Se investigó a fondo: no hay fix de bajo riesgo en
      // Next 14.2.35 sin romper el ISR (force-dynamic) ni meter un denylist en
      // middleware (riesgo de 410 a un listing nuevo). Como la auditoría dio 0
      // fichas con problemas reales de indexación, se deja documentado y NO se
      // toca. No es la causa el <head> manual del layout (una copia de esta
      // página en otra ruta, bajo el mismo layout, sí devuelve 404).
      notFound();
    }
    throw e;
  }

  // #3: slug canónico derivado del ID/título, para que el JSON-LD (url +
  // breadcrumb) apunte siempre a la forma canónica y no al slug pedido.
  const canonicalSlug = generatePropertySlug(property);

  // Override de SEO por ID (unidades de emprendimientos): corrige título (H1,
  // JSON-LD, alts) y typos de la descripción. Va DESPUÉS de canonicalSlug para
  // que la URL no cambie (el slug se genera del título original).
  applyPropertySeoOverride(property);

  const price = formatPrice(property);
  const area = getTotalSurface(property);

  // El wa.me apunta al productor asignado en Tokko (asesor real de la propiedad);
  // si producer es null, cae al número general 5493412101694.
  const whatsappUrl = buildPropertyWhatsappUrl(property, params.slug);

  // ── allProperties ya NO se fetchea SSR ──
  // Los componentes que antes lo necesitaban (Similars, NearbyMap, ZillowPanel)
  // ahora cada uno fetchea su propia data via /api/propiedades/{similar,nearby,list-cards}
  // que están cacheados en CDN (s-maxage=900). Esto saca ~9 MB del RSC payload
  // de la ficha mobile.

  const currentLat = property.geo_lat ? parseFloat(property.geo_lat) : null;
  const currentLng = property.geo_long ? parseFloat(property.geo_long) : null;
  const hasCoords = currentLat != null && !isNaN(currentLat) && currentLng != null && !isNaN(currentLng);
  const description = getDescription(property);

  // JSON-LD — RealEstateListing + BreadcrumbList
  const mainPhotoUrl = getMainPhoto(property);
  const propPrice = property.operations?.[0]?.prices?.[0]?.price ?? 0;
  const propCurrency = property.operations?.[0]?.prices?.[0]?.currency ?? 'USD';
  const propUrl = `https://siinmobiliaria.com/propiedades/${canonicalSlug}`;
  // "Sin Precio" en Tokko (web_price: false): el Offer se omite del JSON-LD
  // para no filtrar el monto que la API igual manda.
  const tienePrecio = mostrarPrecio(property) !== null;
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'RealEstateListing',
      name: property.publication_title || property.address,
      description,
      url: propUrl,
      image: mainPhotoUrl ? [mainPhotoUrl] : [],
      ...(tienePrecio ? {
        offers: {
          '@type': 'Offer',
          price: propPrice.toString(),
          priceCurrency: propCurrency,
          availability: 'https://schema.org/InStock',
        },
      } : {}),
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
      numberOfBedrooms: isMonoambiente(property) ? 0 : (property.suite_amount || property.room_amount || undefined),
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
        <div
          className="sticky top-0 z-40 bg-white border-b border-gray-200 grid items-center px-4"
          style={{ height: 56, gridTemplateColumns: 'minmax(76px,1fr) auto minmax(76px,1fr)' }}
        >
          <Link
            href="/propiedades"
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-700"
            aria-label="Volver al mapa"
            style={{ fontFamily: "'Raleway', system-ui, sans-serif" }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Mapa</span>
          </Link>
          <Link href="/" className="flex items-center justify-center" aria-label="Ir a la página principal">
            <Image
              src="/LOGO_HORIZONTAL.png"
              alt="SI INMOBILIARIA"
              width={120}
              height={24}
              className="h-6 w-[120px] object-contain"
              priority
            />
          </Link>
          <div />
        </div>

        {/* Galería Zillow adaptada a mobile (grande + 2x2 thumbs) */}
        <div className="px-4 pt-3 pb-2">
          <PropertyGalleryHero property={property} />
        </div>

        {/* Audio narrado (solo aparece si la propiedad tiene audio cacheado;
            el componente se auto-oculta si /api/audio/check devuelve hasAudio:false) */}
        <div className="px-4 pb-2">
          <AudioSummary
            propertyId={property.id}
            title={property.publication_title || property.address}
          />
        </div>

        {/* Sticky tabs con scroll horizontal */}
        <PropertyStickyNav
          sections={[
            { id: 'overview', label: 'Resumen' },
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
            whatsappUrl={whatsappUrl}
            showMobileContact
          />
        </div>

        {/* Full-width: "Otras opciones para vos" */}
        <div className="px-4 pb-6">
          <PropertyDetailSimilars property={property} />
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
          DESKTOP LAYOUT — Zillow-style listing+map con la ficha auto-abierta.
          Se monta client-side con gate de viewport (>= md) para que mobile
          NO descargue el chunk de PropiedadesView ni renderice 237 cards
          en HTML. SSR de la ficha mobile queda en el bloque md:hidden de
          arriba, intacto.
          ════════════════════════════════════════════ */}
      <PropertyDetailZillowDesktopPanel
        initialPropertyId={property.id}
      />

      {/* Mobile sticky bar */}
      <MobileStickyBar
        whatsappUrl={whatsappUrl}
        slug={canonicalSlug}
        title={property.publication_title || property.address}
        propertyId={property.id}
        propertyTitle={property.publication_title || property.address}
      />
    </div>
  );
}
