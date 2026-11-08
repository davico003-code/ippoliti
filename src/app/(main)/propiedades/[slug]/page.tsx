import type { Metadata } from 'next';
import Image from '@/components/Imagen';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { normalizarTitulo } from '@/lib/titulo';

import ThemeToggle from '@/components/ThemeToggle';
import VolverAlListado from '@/components/VolverAlListado';
import AudioSummary from '@/components/AudioSummary';
import MobileStickyBar from '@/components/MobileStickyBar';
import PropertyViewTracker from '@/components/PropertyViewTracker';
import PropertyDetailZillowDesktopPanel from '@/components/property-detail/PropertyDetailZillowDesktopPanel';
import PropertyGalleryHero from '@/components/property-detail/PropertyGalleryHero';
import PropertyStickyNav from '@/components/property-detail/PropertyStickyNav';
import PropertyDetailBody from '@/components/property-detail/PropertyDetailBody';
import EdificioBanner from '@/components/property-detail/EdificioBanner';
import { detectarEdificios, edificioDe, desdeTexto } from '@/lib/edificios';
import PropertyDetailSimilars from '@/components/property-detail/PropertyDetailSimilars';
import LinkParaColega from '@/components/property-detail/LinkParaColega';
import {
  getPropertyById,
  getPropertiesEstable,
  getIdFromSlug,
  generatePropertySlug,
  isMonoambiente,
  formatPrice,
  mostrarPrecio,
  getTotalSurface,
  getOperationType,
  propertyTypeLabelById,
  getAllPhotos,
  getDescription,
  getBlueprintPhotos,
  sanitizeProperty,
  buildPropertyWhatsappUrl,
  numeroVisitaWhatsapp,
  type TokkoProperty,
  operacionPrincipal,
  tituloVisible,
} from '@/lib/tokko';
import { formatUbicacion, resolverUbicacion } from '@/lib/ubicacion';
import { sinVideosCaidos } from '@/lib/videos-vivos';
import { PROPERTY_SEO, applyPropertySeoOverride } from '@/lib/seoOverrides';
import {
  archivoDeFotoFirmada,
  conFotosFijas,
  esFotoR2,
  fotoAbsoluta,
  fotoPrincipalParaBuscadores,
} from '@/lib/fotos-fijas';
import { cercanosGuardados } from '@/lib/cercanos';
import { tiemposGuardados } from '@/lib/tiempos-viaje';
import { recortarDescripcion, tituloConMarca } from '@/lib/seo/metas';
import { videosPropios } from '@/lib/video-oficina';

export const revalidate = 3600;

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

// Calle con número de la dirección ("Los Mistoles 3200 - Don Mateo" → "Los Mistoles 3200").
function calleDe(dir?: string | null): string {
  return (dir ?? '')
    .split(/\s*[,|/]\s*|\s+[-–—]\s+/)
    .map(s => s.replace(/\s+/g, ' ').trim())
    .find(s => /\d/.test(s)) ?? '';
}

// Varias fichas comparten el mismo título ("Departamento en venta de 2
// dormitorios en Rosario") y Google las ve como duplicadas. Solo a esas se les
// suma la calle (y el código si la calle también coincide); el resto no cambia.
async function tituloUnico(property: TokkoProperty, title: string): Promise<string> {
  let todas: TokkoProperty[] = [];
  try {
    todas = (await getPropertiesEstable()).objects ?? [];
  } catch {
    return title;
  }
  const clave = (t: string) => t.toLowerCase().replace(/\s+/g, ' ').trim();
  const tituloDe = (x: TokkoProperty) =>
    PROPERTY_SEO[x.id]?.title || normalizarTitulo(x.publication_title) || x.address || '';
  const otras = todas.filter(x => x.id !== property.id && clave(tituloDe(x)) === clave(title));
  if (!otras.length) return title;
  const conCalle = (x: TokkoProperty) => {
    const calle = calleDe(x.fake_address || x.address);
    return calle ? `${title}, ${calle}` : title;
  };
  const propio = conCalle(property);
  return otras.some(x => clave(conCalle(x)) === clave(propio))
    ? `${propio} (Cód. ${property.id})`
    : propio;
}

// Meta description cuando el aviso no tiene descripción cargada.
/** "Casa en venta en Funes · 240 m² · USD 250.000": lo que distingue a cada
 *  ficha (las unidades de un edificio comparten el texto del aviso). */
function datosClave(property: TokkoProperty): string {
  const tipo = propertyTypeLabelById(property.type?.id);
  const op = getOperationType(property).toLowerCase();
  const ubic = formatUbicacion(property);
  const sup = getTotalSurface(property);
  const precio = mostrarPrecio(property);
  return [
    `${tipo === 'Otros' ? 'Propiedad' : tipo}${op ? ` en ${op}` : ''}${ubic ? ` en ${ubic}` : ''}`,
    sup ? `${sup.toLocaleString('es-AR')} m²` : '',
    precio ?? '',
  ].filter(Boolean).join(' · ');
}

function descripcionFallback(property: TokkoProperty): string {
  return `${datosClave(property)}. Consultá con SI INMOBILIARIA.`;
}

// ── JSON-LD ─────────────────────────────────────────────────────────────

/** Tipo de schema.org de la vivienda; lo que no es vivienda queda como Place. */
function tipoSchemaVivienda(tipoId: number | undefined): 'Apartment' | 'SingleFamilyResidence' | 'House' | 'Place' {
  if (tipoId === 2) return 'Apartment';
  if (tipoId === 3 || tipoId === 4) return 'SingleFamilyResidence';
  if (tipoId === 13) return 'House'; // PH
  return 'Place';
}

/**
 * Una oferta por operación con precio (venta y alquiler a la vez → dos), la
 * principal primero, como preciosPorOperacion. El alquiler declara que el
 * precio es POR MES: si no, $850.000 de alquiler se leía igual que una venta.
 * Vacío si la propiedad no publica precio ("Sin Precio" / oportunidad).
 */
function ofertasJsonLd(property: TokkoProperty, url: string) {
  if (mostrarPrecio(property) === null) return [];
  const principal = operacionPrincipal(property);
  const vistas = new Set<string>();
  return (property.operations ?? [])
    .filter((op) => (op.prices?.[0]?.price ?? 0) > 0)
    .sort((a, b) => (a === principal ? -1 : b === principal ? 1 : 0))
    .filter((op) => {
      if (vistas.has(op.operation_type)) return false;
      vistas.add(op.operation_type);
      return true;
    })
    .map((op) => {
      const { price, currency } = op.prices[0];
      const priceCurrency = currency || 'USD';
      const esAlquiler = op.operation_type === 'Rent' || op.operation_type === 'Temporary rent';
      return {
        '@type': 'Offer',
        url,
        price,
        priceCurrency,
        availability: 'https://schema.org/InStock',
        businessFunction: esAlquiler
          ? 'http://purl.org/goodrelations/v1#LeaseOut'
          : 'http://purl.org/goodrelations/v1#Sell',
        // El temporario no lleva unidad: el monto puede ser por quincena o por
        // mes según la temporada, y declarar uno equivocado es peor que nada.
        ...(op.operation_type === 'Rent'
          ? { priceSpecification: { '@type': 'UnitPriceSpecification', price, priceCurrency, unitCode: 'MON', unitText: 'MONTH' } }
          : {}),
      };
    });
}

/**
 * Hasta 10 fotos (portada primero, sin planos) con URL ESTABLE: la fija de
 * /fotos/… o la de R2. Nunca la firmada de Supabase, que rota cada 45 días y
 * deja a los buscadores con la foto rota (ver lib/fotos-fijas.ts).
 */
function fotosParaBuscadores(property: TokkoProperty, max = 10): string[] {
  const fotos = (property.photos ?? []).filter((f) => !f.is_blueprint);
  const portada = fotos.find((f) => f.is_front_cover);
  const ordenadas = [
    ...(portada ? [portada] : []),
    ...fotos.filter((f) => f !== portada).sort((a, b) => a.order - b.order),
  ];
  const estables = ordenadas.map((f) => {
    const fija = fotoAbsoluta(esFotoR2(f.image) ? f.original ?? f.image : f.image);
    if (fija && !archivoDeFotoFirmada(fija)) return fija;
    return esFotoR2(f.image) ? f.image : null;
  });
  return Array.from(new Set(estables.filter((u): u is string => !!u))).slice(0, max);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const id = getIdFromSlug(params.slug);
    const property = await getPropertyById(id);
    // Override de SEO por ID (unidades de emprendimientos): title y meta custom.
    // El canonical de abajo usa el publication_title ORIGINAL (el slug no cambia).
    const seo = PROPERTY_SEO[property.id];
    // normalizarTitulo: si el aviso se cargó TODO EN MAYÚSCULAS, el <title> y
    // el OG salían gritados (generateMetadata no pasa por sanitizeProperty).
    const rawTitle = seo?.title || normalizarTitulo(tituloVisible(property)) || property.address;
    const tituloBase = rawTitle ? rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1) : 'Propiedad';
    const title = seo?.title ? tituloBase : await tituloUnico(property, tituloBase);
    // #1: el texto de Tokko trae whitespace/newlines al inicio; los tags se
    // reemplazan por espacio (no pegar palabras) y se colapsan los espacios.
    // Adelante van los datos clave (precio incluido): es lo que se lee en
    // Google y lo que separa a las unidades de un mismo edificio.
    const texto = (property.description || property.description_only || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const desc = seo?.metaDescription ?? recortarDescripcion(texto ? `${datosClave(property)}. ${texto}` : descripcionFallback(property));
    const price = formatPrice(property);
    const loc = formatUbicacion(property);
    const ogDesc = seo?.metaDescription ? `${price} - ${loc || property.address}. ${desc}`.slice(0, 200) : desc;
    // En la tarjeta de WhatsApp/iMessage lo que se lee en negrita es el título
    // (la descripción se corta a 1-2 renglones): el precio va ahí, igual que en
    // la ficha neutra. "Sin precio"/oportunidad: el título solo. El <title> de
    // Google queda como estaba.
    const precioOg = mostrarPrecio(property);
    const ogTitle = precioOg ? `${title} · ${precioOg}` : title;
    // #3: canonical SIEMPRE al slug canónico del ID (no al slug pedido), para
    // consolidar los duplicados que sirve cualquier sufijo con el ID correcto.
    const canonicalUrl = `https://siinmobiliaria.com/propiedades/${generatePropertySlug(property)}`;
    return {
      title: tituloConMarca(title),
      description: desc,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title: ogTitle,
        description: ogDesc,
        url: canonicalUrl,
        type: 'article',
        // El openGraph de la página reemplaza ENTERO al del layout: sin
        // repetirlos, la ficha salía sin og:site_name ni og:locale.
        siteName: 'SI INMOBILIARIA',
        locale: 'es_AR',
        // SIN clave `images` a propósito: la imagen la arma opengraph-image.tsx
        // (1200 × 630, portada + precio + zona, JPEG liviano, con medidas).
        // Next solo usa la del archivo si acá no hay `images`; antes iba la
        // foto cruda (/fotos/…): cualquier proporción y de hasta varios MB.
      },
      twitter: {
        card: 'summary_large_image',
        title: ogTitle,
        description: ogDesc,
        // Sin `images`: Next le copia la del openGraph (la generada).
      },
    };
  } catch (e) {
    // La propiedad no existe / el feed falló. La ruta hace notFound() pero por
    // una limitación de Next el streaming ya commiteó HTTP 200 (soft-404). El
    // noindex evita que Google indexe esa página de error. Cuando la página
    // termina en notFound() Next ya agrega su propio noindex: sumar el nuestro
    // dejaba dos <meta name="robots">.
    const esNotFound =
      isNaN(getIdFromSlug(params.slug)) || (e instanceof Error && e.message.includes('not found'));
    return {
      title: 'Propiedad no encontrada | SI INMOBILIARIA',
      ...(esNotFound ? {} : { robots: { index: false, follow: false } }),
    };
  }
}

export default async function PropertyPage({ params }: Props) {
  const id = getIdFromSlug(params.slug);
  if (isNaN(id)) {
    notFound();
  }

  let property: TokkoProperty;
  try {
    // Fotos con URL fija: la clave de /_next/image y la URL que ve Google
    // Imágenes ya no cambian cada 45 días (ver lib/fotos-fijas.ts).
    property = conFotosFijas(await sinVideosCaidos(sanitizeProperty(await getPropertyById(id))));
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
      // Desde el 12-oct-2026 el middleware (fichaDadaDeBaja) responde antes de
      // llegar acá: 301 al listado parecido o 410. Esto queda de red, para la
      // ventana en que la propiedad se dio de baja y la lista de ids no se enteró.
      notFound();
    }
    throw e;
  }

  // OJO: NO usar deleted_at como señal de despublicada. El feed de Hilo trae
  // deleted_at con fechas históricas de la migración desde Tokko en propiedades
  // ACTIVAS (verificado 08-ago-2026: 8382331 y 7245443, ambas publicadas,
  // traían deleted_at ≠ null y el notFound() de acá tiró abajo la ficha de San
  // Marino en prod). La señal real de despublicada YA la da el feed: responde
  // 404 y eso cae en el catch de arriba.

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
  // si producer es null, cae al número general 5493413340916.
  const whatsappUrl = buildPropertyWhatsappUrl(property, params.slug);

  // ── allProperties ya NO se fetchea SSR ──
  // Los componentes que antes lo necesitaban (Similars, NearbyMap, ZillowPanel)
  // ahora cada uno fetchea su propia data via /api/propiedades/{similar,nearby,list-cards}
  // que están cacheados en CDN (s-maxage=900). Esto saca ~9 MB del RSC payload
  // de la ficha mobile.

  // ¿La unidad pertenece a un edificio con más departamentos publicados?
  // El listado está cacheado y compartido; acá solo derivamos el dato
  // resuelto (nombre, slug, cuántas otras) — el array no viaja al cliente.
  // getPropertiesEstable y NO getProperties: con el listado "vivo" la ficha
  // quedaba atada a su tag y cada edición de CUALQUIER propiedad en HILO
  // regeneraba todas las fichas (ver CACHE_TAG_LISTA en lib/tokko).
  let edificioInfo: { nombre: string; slug: string; otras: number; desde: string | null } | null = null;
  try {
    const todas = await getPropertiesEstable();
    const eds = detectarEdificios((todas.objects ?? []).map(sanitizeProperty));
    const ed = edificioDe(property, eds);
    if (ed && ed.unidades.length > 1) {
      edificioInfo = {
        nombre: ed.nombre,
        slug: ed.slug,
        otras: ed.unidades.length - 1,
        desde: desdeTexto(ed),
      };
    }
  } catch {
    edificioInfo = null;
  }

  const currentLat = property.geo_lat ? parseFloat(property.geo_lat) : null;
  const currentLng = property.geo_long ? parseFloat(property.geo_long) : null;
  const hasCoords = currentLat != null && !isNaN(currentLat) && currentLng != null && !isNaN(currentLng);
  // Lugares cercanos y "¿Cuánto tardás?" ya guardados → en el HTML (Google
  // indexa la versión celu). A la vez: cada uno corta a los 800 ms.
  const [cercanos, tiempos] = hasCoords
    ? await Promise.all([cercanosGuardados(currentLat!, currentLng!), tiemposGuardados(currentLat!, currentLng!)])
    : [null, null];
  const description = getDescription(property);

  // JSON-LD — RealEstateListing + BreadcrumbList
  const mainPhotoUrl = fotoPrincipalParaBuscadores(property);
  const fotosBuscadores = fotosParaBuscadores(property);
  const propUrl = `https://siinmobiliaria.com/propiedades/${canonicalSlug}`;
  // "Sin Precio" en Tokko (web_price: false): sin Offer, para no filtrar el
  // monto que la API igual manda (ofertasJsonLd lo respeta).
  const ofertas = ofertasJsonLd(property, propUrl);
  // RealEstateListing es un WebPage en schema.org: la dirección, el geo, los
  // ambientes y la superficie son de la VIVIENDA y van en `about` (colgados
  // del aviso los validadores los daban como propiedades desconocidas).
  // addressLocality es la ciudad (antes el barrio: "Cotos de la Alameda" en
  // vez de Roldán) y el barrio va en containedInPlace.
  const { barrio, ciudad } = resolverUbicacion(property);
  const tipoVivienda = tipoSchemaVivienda(property.type?.id);
  const esVivienda = tipoVivienda !== 'Place';
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'RealEstateListing',
      name: tituloVisible(property) || property.address,
      description,
      url: propUrl,
      ...(property.created_at ? { datePosted: property.created_at.slice(0, 10) } : {}),
      image: fotosBuscadores.length ? fotosBuscadores : mainPhotoUrl ? [mainPhotoUrl] : [],
      ...(ofertas.length ? { offers: ofertas } : {}),
      about: {
        '@type': tipoVivienda,
        name: tituloVisible(property) || property.address,
        address: {
          '@type': 'PostalAddress',
          streetAddress: property.real_address || property.fake_address || property.address,
          addressLocality: ciudad || property.location?.name || '',
          addressRegion: 'Santa Fe',
          addressCountry: 'AR',
        },
        ...(barrio ? { containedInPlace: { '@type': 'Place', name: barrio } } : {}),
        ...(hasCoords ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: currentLat,
            longitude: currentLng,
          },
        } : {}),
        // Schema.org: numberOfRooms son los ambientes, NO incluye baños (esos
        // van en numberOfBathroomsTotal; sumarlos acá duplicaba el dato).
        // Solo en viviendas: un lote o un local no tiene dormitorios.
        ...(esVivienda ? {
          numberOfRooms: property.room_amount || property.suite_amount || undefined,
          numberOfBedrooms: isMonoambiente(property) ? 0 : (property.suite_amount || property.room_amount || undefined),
          numberOfBathroomsTotal: property.bathroom_amount || undefined,
          floorSize: area ? { '@type': 'QuantitativeValue', value: area, unitCode: 'MTK' } : undefined,
        } : {}),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://siinmobiliaria.com' },
        { '@type': 'ListItem', position: 2, name: 'Propiedades', item: 'https://siinmobiliaria.com/propiedades' },
        { '@type': 'ListItem', position: 3, name: tituloVisible(property) || property.address, item: propUrl },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PropertyViewTracker propertyId={property.id} title={tituloVisible(property) || property.address} price={price} />

      {/* ════════════════════════════════════════════
          MOBILE LAYOUT (md:hidden)
          Usa los mismos componentes compartidos que desktop (gallery, sticky
          nav, detail body) para mantener paridad. El aire para la barra
          flotante de abajo (MobileStickyBar) lo pone el footer (FooterWrapper),
          que es lo último de la página: con los 112 px acá, el contenido
          quedaba libre pero la última fila del footer (© y matrícula) seguía
          tapada por la barra.
          ════════════════════════════════════════════ */}
      <div className="md:hidden min-h-screen bg-[#fafafa]" style={{ paddingBottom: 24 }}>
        {/* Header propio de la ficha mobile — back + logo + (acciones).
            Con el área segura de arriba: en la web instalada en el iPhone el
            header quedaba debajo del reloj (el Navbar del resto del sitio ya
            la respeta). En Safari común vale 0 y no cambia nada. */}
        <div
          // El Tinder la esconde al abrir "Ver la ficha completa" (mazo/ficha-oscura.ts).
          data-ficha-barra-arriba=""
          className="sticky top-0 z-40 bg-white border-b border-gray-200 grid items-center px-4"
          style={{
            height: 'calc(56px + env(safe-area-inset-top, 0px))',
            paddingTop: 'env(safe-area-inset-top, 0px)',
            gridTemplateColumns: 'minmax(76px,1fr) auto minmax(76px,1fr)',
          }}
        >
          <div className="flex items-center"><VolverAlListado /></div>
          <Link href="/" className="flex items-center justify-center" aria-label="Ir a la página principal">
            <Image
              src="/LOGO_HORIZONTAL.png"
              alt="SI INMOBILIARIA"
              width={120}
              height={24}
              className="h-6 w-[120px] object-contain si-theme-logo"
              priority
            />
          </Link>
          <div className="flex justify-end"><ThemeToggle /></div>
        </div>

        {/* Galería Zillow adaptada a mobile (grande + 2x2 thumbs) */}
        <div className="px-4 pt-3 pb-2">
          <PropertyGalleryHero property={property} />
        </div>

        {/* Sticky tabs con scroll horizontal. Se pegan debajo del header, que
            ahora suma el área segura de arriba: PropertyStickyNav solo acepta
            px fijos (56), así que el calc va por CSS. Con el área en 0 es lo
            mismo de antes, y adentro del Tinder (mazo/ficha-oscura.ts esconde el
            header y pone la tira en top 0, con un selector más específico)
            sigue mandando esa regla. */}
        <style dangerouslySetInnerHTML={{ __html: '[data-ficha-barra-arriba]~nav.sticky{top:calc(56px + env(safe-area-inset-top,0px))!important}' }} />
        <PropertyStickyNav
          sections={[
            { id: 'overview', label: 'Resumen' },
            { id: 'caracteristicas', label: 'Características' },
            // "Video" solo si la propiedad tiene recorrido (misma condición que
            // la sección #video en PropertyDetailBody).
            ...(videosPropios(property.videos).length > 0
              ? [{ id: 'video', label: 'Video' }]
              : []),
            // Igual que "Video": la pestaña se muestra solo si abajo existe la
            // sección. Si no, queda un botón visible que no lleva a ningún lado
            // (pasa en ~1 de cada 10 fichas, las que no tienen plano cargado).
            ...(description ? [{ id: 'descripcion', label: 'Descripción' }] : []),
            ...(getBlueprintPhotos(property).length > 0
              ? [{ id: 'planos', label: 'Planos' }]
              : []),
            { id: 'ubicacion', label: 'Ubicación' },
            { id: 'similares', label: 'Similares' },
          ]}
          stickyTop={56}
        />

        {/* Contenido compartido */}
        <div className="px-4 py-4">
          {edificioInfo && (
            <div className="mb-4">
              <EdificioBanner
                nombre={edificioInfo.nombre}
                slug={edificioInfo.slug}
                otrasUnidades={edificioInfo.otras}
                desde={edificioInfo.desde}
              />
            </div>
          )}
          <PropertyDetailBody
            property={property}
            whatsappUrl={whatsappUrl}
            showMobileContact
            cercanos={cercanos?.ficha ?? null}
            tiempos={tiempos}
            // Audio narrado: debajo de los datos, no arriba del título (el precio
            // tiene que entrar en la primera pantalla). Se auto-oculta sin audio.
            despuesDeDatos={
              <AudioSummary
                propertyId={property.id}
                title={tituloVisible(property) || property.address}
              />
            }
          />
        </div>

        {/* Full-width: "Otras opciones para vos" */}
        <div className="px-4 pb-6">
          <PropertyDetailSimilars property={property} />
        </div>

        {/* Cierre: el link neutro para colegas (discreto: el visitante común
            comparte con la hoja nativa del celu y no lo ve en ningún menú) y
            "Volver al catálogo", que vuelve igual que el "Volver" del header
            (a la misma búsqueda, no al listado entero). */}
        <div className="px-4 pb-2 pt-2 border-t border-gray-100 flex flex-col items-start gap-1">
          <LinkParaColega propertyId={property.id} />
          <VolverAlListado variante="pie" />
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
        // Lo que ya está acá para que el link abierto en la compu muestre la
        // ficha en el primer pintado (antes: pantalla en blanco hasta hidratar).
        previa={{
          titulo: tituloVisible(property) || property.address,
          precio: price,
          direccion: [
            property.real_address || property.fake_address || property.address,
            formatUbicacion(property, property.real_address || property.fake_address || property.address),
          ].filter(Boolean).join(', '),
          // Las mismas 5 que la galería del panel (mismo orden y URL): la foto
          // ya bajada se reusa cuando el panel real aparece.
          fotos: getAllPhotos(property).slice(0, 5),
        }}
      />

      {/* Mobile sticky bar */}
      <MobileStickyBar
        whatsappUrl={whatsappUrl}
        slug={canonicalSlug}
        title={tituloVisible(property) || property.address}
        propertyId={property.id}
        propertyTitle={tituloVisible(property) || property.address}
        propertyPrice={price}
        // "precio · zona" en el texto que se comparte (lib/compartir lineaDatos).
        propertyUbicacion={formatUbicacion(property)}
        visitWhatsappNumber={numeroVisitaWhatsapp(property)}
        visitTipo={
          !property.operations?.some(o => o.operation_type === 'Sale') &&
          property.operations?.some(o => o.operation_type === 'Rent' || o.operation_type === 'Temporary rent')
            ? 'alquiler'
            : 'venta'
        }
      />
    </div>
  );
}
