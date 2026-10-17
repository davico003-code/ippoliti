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
import Link from "next/link";
import { recortarDescripcion, tituloConMarca } from '@/lib/seo/metas'
import { fraseMercado, mercadoDelBarrio, usdCorto, type MercadoBarrio } from '@/lib/seo/barrio-mercado'

const R = "var(--font-raleway), 'Raleway', system-ui, sans-serif";

interface Props {
  params: { slug: string };
}

// El mercado del barrio (casas y lotes en venta) se rearma cada 6 h.
export const revalidate = 21600;

/** "Haras de Funes" ya dice la ciudad; "La Finca 2" → "La Finca 2, Funes". */
const conCiudad = (nombre: string) => (/funes/i.test(nombre) ? nombre : `${nombre}, Funes`);

/** Lo que se busca: "haras de funes", "la finca 2 funes" → precios y qué hay en venta. */
function tituloConMercado(nombre: string, m: MercadoBarrio): string {
  const que = m.casas && m.lotes ? "casas y lotes" : m.casas ? "casas" : "lotes";
  return `${conCiudad(nombre)}: precios, ${que} en venta`;
}

export function generateStaticParams() {
  return BARRIOS.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const barrio = getBarrioBySlug(params.slug);
  if (!barrio) return {};
  const canonical = `https://siinmobiliaria.com/barrios-privados/${barrio.slug}`;

  const mercado = await mercadoDelBarrio(barrio.nombre);
  const title = mercado
    ? tituloConMarca(tituloConMercado(barrio.nombre, mercado))
    : barrio.subtitulo
      ? tituloConMarca(`${barrio.nombre} · ${barrio.subtitulo}`)
      : barrio.seo.metaTitle;
  const intro = barrio.contenidoSEO?.intro ?? barrio.seo.metaDescription;
  const description = mercado
    ? recortarDescripcion(`${conCiudad(barrio.nombre)}: ${fraseMercado(mercado)}. ${barrio.subtitulo ? `${barrio.subtitulo}. ` : ""}${intro}`)
    : recortarDescripcion(intro);
  const keywords = barrio.keywords ?? barrio.seo.keywordsLongTail.join(", ");

  // og:image: portada procesada 01.webp; fallback al hero legacy / default.
  // El hero legacy ".svg" es un placeholder inexistente en /public → se excluye
  // para no apuntar el OG a un 404 (además SVG no es válido como og:image).
  const [portada] = getBarrioFotos(barrio.slug);
  const legacyHero =
    barrio.imagenes.hero && !barrio.imagenes.hero.endsWith(".svg")
      ? barrio.imagenes.hero
      : null;
  const ogImage = portada ?? legacyHero ?? "/og-image.jpg";

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      images: [ogImage],
      type: "website",
      siteName: "SI INMOBILIARIA",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function BarrioPage({ params }: Props) {
  const barrio = getBarrioBySlug(params.slug);
  if (!barrio) notFound();
  const mercado = await mercadoDelBarrio(barrio.nombre);

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
    ...(mercado ? [{ id: "precios", label: "Precios" }] : []),
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
        {mercado && <PreciosDelBarrio nombre={barrio.nombre} mercado={mercado} />}

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

/** Lo que se pide hoy en el barrio (relevamiento de Hilo). Server: queda en el HTML. */
function PreciosDelBarrio({ nombre, mercado }: { nombre: string; mercado: MercadoBarrio }) {
  const filas = [
    { label: "Casas", singular: "casa", m: mercado.casas },
    { label: "Lotes", singular: "lote", m: mercado.lotes },
  ].filter((f) => f.m);
  return (
    <section id="precios" className="scroll-mt-24">
      <h2
        className="mb-5 text-2xl md:text-[28px]"
        style={{ fontFamily: R, fontWeight: 700, letterSpacing: "-0.015em", color: "var(--foreground)" }}
      >
        Cuánto se pide hoy en {nombre}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {filas.map(({ label, singular, m }) => (
          <div key={label} className="rounded-2xl border border-gray-200 bg-white p-5" style={{ color: "var(--foreground)" }}>
            <p className="text-[15px]" style={{ color: "var(--tinta-soft)" }}>{label} en venta</p>
            <p className="mt-1 text-4xl font-bold" style={{ fontFamily: R, fontVariantNumeric: "tabular-nums" }}>
              {m!.n.toLocaleString("es-AR")}
            </p>
            <p className="mt-2 text-[16px] leading-snug">
              La mitad pide entre <b>{usdCorto(m!.p25)}</b> y <b>{usdCorto(m!.p75)}</b>.
              {singular === "lote" && m!.lote ? ` Lote típico: ${m!.lote.toLocaleString("es-AR")} m².` : ""}
              {singular === "casa" && m!.m2 ? ` Casa típica: ${m!.m2.toLocaleString("es-AR")} m² cubiertos.` : ""}
            </p>
            {m!.tasar && (
              <Link href={m!.tasar} className="mt-3 inline-block text-[15px] font-semibold underline-offset-2 hover:underline" style={{ color: "var(--brand)" }}>
                Cuánto vale tu {singular} en {nombre} →
              </Link>
            )}
          </div>
        ))}
      </div>
      <p className="mt-3 text-[13px]" style={{ color: "var(--tinta-soft)" }}>
        Relevamiento propio de los avisos publicados{mercado.actualizado ? `, actualizado el ${mercado.actualizado}` : ""}. Es precio de
        publicación: el de venta lo fija la tasación.
      </p>
    </section>
  );
}
