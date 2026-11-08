// Ficha individual /barrios-privados/[slug] — rediseño 6 secciones 2026-06.
//
// 1. Hero a pantalla casi completa (portada 01.webp + stats con separadores dorados)
// 2. Intro editorial (storytelling de broker) + chips de amenities destacados
// 3. Galería con lightbox (02.webp en adelante, máx. 6 — oculta si hay 1 sola foto)
// 4. Plano descargable (preview grande + PDF + WhatsApp)
// 5. Mapa Leaflet con POIs de Funes + cercanías con distancias haversine
// 6. Propiedades disponibles (Tokko lotes + casas) + CTA final
//
// Mantiene: metadata, JSON-LD (Place + Breadcrumb + FAQPage), LandingTracker.
// Los assets viven en /public/barrios/{slug}/ (NN.webp + plano.pdf + preview),
// descubiertos al build con fs (getBarrioFotos / getPlanoUrl).

import fs from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BARRIOS, getBarrioBySlug, getBarriosHub } from "@/lib/barrios";
import { buildBarrioFaqs } from "@/lib/barrios/faq";
import { getPlanoLoteoUrl, getPlanoUrl } from "@/lib/barrios/planos";
import { getBarrioFotos, getPlanoPreviewUrl } from "@/lib/barrios/fotos";

import BarrioStockTokko from "@/components/barrios/BarrioStockTokko";
import BarrioCTAFinal from "@/components/barrios/BarrioCTAFinal";
import LandingTracker from "./LandingTracker";

import DetalleHero from "./_components/DetalleHero";
import DetalleSubnav, { type SubnavItem } from "./_components/DetalleSubnav";
import DetalleIntro from "./_components/DetalleIntro";
import DetalleGaleria from "./_components/DetalleGaleria";
import DetalleAmenities from "./_components/DetalleAmenities";
import DetallePlano from "./_components/DetallePlano";
import DetalleMapaCercanias from "./_components/DetalleMapaCercanias";
import { recortarDescripcion, tituloConMarca } from '@/lib/seo/metas'
import CompartirPagina from '@/components/CompartirPagina'

const R = "var(--font-raleway), 'Raleway', system-ui, sans-serif";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return BARRIOS.map((b) => ({ slug: b.slug }));
}

// og:image liviana (25-oct): la portada 01.webp pesa 200-620 KB y WhatsApp no
// arma la tarjeta con WebP pesado (pide JPEG/PNG de menos de ~300 KB). Cada
// barrio tiene su og.jpg 1200×630 (≤200 KB) generado una vez desde 01.webp con
// sharp. Si un barrio nuevo todavía no lo tiene, va la og del sitio: mejor el
// logo que una tarjeta sin foto.
function ogDeBarrio(slug: string): { url: string; width: number; height: number } {
  try {
    if (fs.existsSync(path.join(process.cwd(), "public", "barrios", slug, "og.jpg"))) {
      return { url: `/barrios/${slug}/og.jpg`, width: 1200, height: 630 };
    }
  } catch {
    /* entornos sin fs */
  }
  return { url: "/og-image.jpg", width: 1200, height: 630 };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const barrio = getBarrioBySlug(params.slug);
  if (!barrio) return {};
  const canonical = `https://siinmobiliaria.com/barrios-privados/${barrio.slug}`;

  const title = barrio.subtitulo
    ? tituloConMarca(`${barrio.nombre} · ${barrio.subtitulo}`)
    : barrio.seo.metaTitle;
  // Cortada en el final de una frase (o en palabra entera con "…"): el
  // slice(0, 155) dejaba la tarjeta de WhatsApp y el snippet de Google en
  // "…y legitimó la idea".
  const description = barrio.contenidoSEO?.intro
    ? recortarDescripcion(barrio.contenidoSEO.intro)
    : barrio.seo.metaDescription;
  const keywords = barrio.keywords ?? barrio.seo.keywordsLongTail.join(", ");

  // og:image: og.jpg del barrio (ver ogDeBarrio), nunca el WebP de la portada.
  const ogImage = ogDeBarrio(barrio.slug);

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      images: [{ ...ogImage, alt: barrio.nombreCompleto }],
      type: "website",
      siteName: "SI INMOBILIARIA",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
  };
}

export default function BarrioPage({ params }: Props) {
  const barrio = getBarrioBySlug(params.slug);
  if (!barrio) notFound();

  // Assets procesados (build-time, fs)
  const fotos = getBarrioFotos(barrio.slug);
  const portada = fotos[0] ?? null;
  const galeria = fotos.slice(1);
  const planoUrl = getPlanoUrl(barrio.slug);
  const planoLoteoUrl = getPlanoLoteoUrl(barrio.slug);
  const planoPreview = getPlanoPreviewUrl(barrio.slug);

  // Coordenadas verificadas Google Places (HUB_DATA); fallback a la ficha.
  const hub = getBarriosHub().find((h) => h.slug === barrio.slug);
  const lat = hub?.lat ?? barrio.ubicacion.coordenadas?.lat ?? null;
  const lng = hub?.lng ?? barrio.ubicacion.coordenadas?.lng ?? null;

  // Ítems del sub-nav sticky — solo las secciones que efectivamente se renderean.
  const subnavItems: SubnavItem[] = [
    { id: "resumen", label: "Resumen" },
    ...(galeria.length > 0 ? [{ id: "galeria", label: "Galería" }] : []),
    ...(barrio.amenities.length > 0 ? [{ id: "amenities", label: "Amenities" }] : []),
    { id: "plano", label: "Plano" },
    ...(lat != null && lng != null ? [{ id: "ubicacion", label: "Ubicación" }] : []),
  ];

  // JSON-LD (Place + Breadcrumb + FAQ)
  const faqsParaJsonLd = barrio.faqExtendida?.length
    ? barrio.faqExtendida
    : buildBarrioFaqs(barrio);

  const canonical = `https://siinmobiliaria.com/barrios-privados/${barrio.slug}`;
  const description = barrio.contenidoSEO?.intro
    ? barrio.contenidoSEO.intro.slice(0, 300).trim()
    : barrio.seo.metaDescription;
  const jsonLdImage =
    portada ??
    (barrio.imagenes.hero && !barrio.imagenes.hero.endsWith(".svg")
      ? barrio.imagenes.hero
      : undefined);

  const placeJsonLd = {
    "@type": "Place",
    "@id": `${canonical}#place`,
    name: barrio.nombreCompleto,
    description,
    url: canonical,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Funes",
      addressRegion: "Santa Fe",
      addressCountry: "AR",
      streetAddress: barrio.ubicacion.direccionIngreso,
    },
    geo:
      lat != null && lng != null
        ? { "@type": "GeoCoordinates", latitude: lat, longitude: lng }
        : undefined,
    image: jsonLdImage ? `https://siinmobiliaria.com${jsonLdImage}` : undefined,
  };

  const breadcrumbJsonLd = {
    "@type": "BreadcrumbList",
    "@id": `${canonical}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: "https://siinmobiliaria.com" },
      { "@type": "ListItem", position: 2, name: "Barrios cerrados", item: "https://siinmobiliaria.com/barrios-privados" },
      { "@type": "ListItem", position: 3, name: barrio.nombre, item: canonical },
    ],
  };

  const faqJsonLd = {
    "@type": "FAQPage",
    "@id": `${canonical}#faq`,
    mainEntity: faqsParaJsonLd.map((f) => ({
      "@type": "Question",
      name: f.pregunta,
      acceptedAnswer: { "@type": "Answer", text: f.respuesta },
    })),
  };

  const graphJsonLd = {
    "@context": "https://schema.org",
    "@graph": [placeJsonLd, breadcrumbJsonLd, faqJsonLd],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graphJsonLd) }}
      />
      <LandingTracker slug={barrio.slug} nombre={barrio.nombre} />

      {/* 1. HERO inmersivo — portada + stats */}
      <DetalleHero barrio={barrio} portada={portada} />

      {/* Sub-nav sticky con scroll-spy */}
      <DetalleSubnav items={subnavItems} />

      {/* 2. RESUMEN — intro editorial + datos rápidos */}
      <DetalleIntro barrio={barrio} />

      {/* 3. GALERÍA con lightbox (oculta si el barrio tiene 0-1 fotos) */}
      <DetalleGaleria fotos={galeria} nombre={barrio.nombre} />

      {/* 4. AMENITIES */}
      <DetalleAmenities barrio={barrio} />

      {/* 5. PLANO descargable + card destacada */}
      <DetallePlano
        slug={barrio.slug}
        nombre={barrio.nombre}
        planoUrl={planoUrl}
        planoLoteoUrl={planoLoteoUrl}
        previewUrl={planoPreview}
        destacada={galeria[0] ?? portada}
        destacadaTitular={barrio.miradaBroker.titular}
      />

      {/* 6. UBICACIÓN Y CERCANÍAS */}
      {lat != null && lng != null && (
        <DetalleMapaCercanias barrio={barrio} lat={lat} lng={lng} />
      )}

      {/* 6. PROPIEDADES DISPONIBLES — stock vivo Tokko (sin cambios de lógica) */}
      <div className="mx-auto max-w-[1280px] space-y-12 px-6 py-14 md:px-10 md:py-20">
        <section id="lotes" className="scroll-mt-24">
          <h2
            className="mb-5 text-2xl text-[#0a0a0a] md:text-[28px]"
            style={{ fontFamily: R, fontWeight: 700, letterSpacing: "-0.015em" }}
          >
            Lotes disponibles en {barrio.nombre}
          </h2>
          <BarrioStockTokko slug={barrio.slug} nombre={barrio.nombre} tipo="Terreno" />
        </section>

        <section>
          <h2
            className="mb-5 text-2xl text-[#0a0a0a] md:text-[28px]"
            style={{ fontFamily: R, fontWeight: 700, letterSpacing: "-0.015em" }}
          >
            Casas en venta en {barrio.nombre}
          </h2>
          <BarrioStockTokko slug={barrio.slug} nombre={barrio.nombre} tipo="Casa" />
        </section>

        {/* Compartir la ficha del barrio: la eligen familias, y se la pasan por
            WhatsApp. Botón client; la página sigue siendo estática. */}
        <div className="flex flex-col items-start gap-3 border-t border-gray-200 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[15px] font-semibold text-[#0a0a0a]" style={{ fontFamily: R }}>
            ¿Alguien de tu familia está mirando {barrio.nombre}? Pasale esta ficha.
          </p>
          <CompartirPagina
            titulo={barrio.subtitulo ? `${barrio.nombre} · ${barrio.subtitulo}` : barrio.nombreCompleto}
            ruta={`/barrios-privados/${barrio.slug}`}
            contexto="barrio"
          />
        </div>
      </div>

      <BarrioCTAFinal
        slug={barrio.slug}
        ubicacion={`cta-final-${barrio.slug}`}
        title={`Conocer ${barrio.nombre} de la manera correcta.`}
        subtitle="Pedinos una visita guiada al barrio y el listado real de propiedades disponibles. Te respondemos por WhatsApp el mismo día."
        waText={`Hola SI, quiero info sobre ${barrio.nombre}.`}
      />
    </>
  );
}
