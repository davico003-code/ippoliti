// Ficha individual /barrios-privados/[slug] — rediseño compacto 2026-05.
//
// Composición orientada a INFO ÚTIL, no a storytelling editorial. Cada sección
// solo se renderea si el barrio tiene la data correspondiente (no inventar).
// Slot de Expensas con placeholder "Consultar" hasta que David popule el campo
// barrio.expensas en lib/barrios.ts.
//
// Mantiene: metadata, JSON-LD (Place + Breadcrumb + FAQPage), LandingTracker,
// stock vivo de Tokko (lotes + casas), form de captura (BarrioNewsletter),
// CTA final con WhatsApp + visita guiada.

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BARRIOS, getBarrioBySlug } from "@/lib/barrios";
import { buildBarrioFaqs } from "@/lib/barrios/faq";
import { getPlanoUrl } from "@/lib/barrios/planos";

import BarrioStockTokko from "@/components/barrios/BarrioStockTokko";
import BarrioNewsletter from "@/components/barrios/BarrioNewsletter";
import BarrioCTAFinal from "@/components/barrios/BarrioCTAFinal";
import LandingTracker from "./LandingTracker";

import FichaHero from "./_components/FichaHero";
import FichaDatosDuros from "./_components/FichaDatosDuros";
import FichaExpensasSlot from "./_components/FichaExpensasSlot";
import FichaCaracteristicas from "./_components/FichaCaracteristicas";
import FichaUbicacion from "./_components/FichaUbicacion";
import FichaPlano from "./_components/FichaPlano";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return BARRIOS.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const barrio = getBarrioBySlug(params.slug);
  if (!barrio) return {};
  const canonical = `https://siinmobiliaria.com/barrios-privados/${barrio.slug}`;

  const title = barrio.subtitulo
    ? `${barrio.nombre} · ${barrio.subtitulo} | SI Inmobiliaria`
    : barrio.seo.metaTitle;
  const description = barrio.contenidoSEO?.intro
    ? barrio.contenidoSEO.intro.slice(0, 155).trim()
    : barrio.seo.metaDescription;
  const keywords = barrio.keywords ?? barrio.seo.keywordsLongTail.join(", ");

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      images: [barrio.imagenes.hero ?? "/og-default.jpg"],
      type: "website",
      siteName: "SI INMOBILIARIA",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [barrio.imagenes.hero ?? "/og-default.jpg"],
    },
  };
}

export default function BarrioPage({ params }: Props) {
  const barrio = getBarrioBySlug(params.slug);
  if (!barrio) notFound();

  // JSON-LD (sin cambios respecto a la versión anterior)
  const faqsParaJsonLd = barrio.faqExtendida?.length
    ? barrio.faqExtendida
    : buildBarrioFaqs(barrio);

  const canonical = `https://siinmobiliaria.com/barrios-privados/${barrio.slug}`;
  const description = barrio.contenidoSEO?.intro
    ? barrio.contenidoSEO.intro.slice(0, 300).trim()
    : barrio.seo.metaDescription;

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
    geo: barrio.ubicacion.coordenadas
      ? {
          "@type": "GeoCoordinates",
          latitude: barrio.ubicacion.coordenadas.lat,
          longitude: barrio.ubicacion.coordenadas.lng,
        }
      : undefined,
    image: barrio.imagenes.hero ? `https://siinmobiliaria.com${barrio.imagenes.hero}` : undefined,
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

      {/* 1. Hero compacto (320px alto / 240px mobile) — foto + breadcrumb + tier + nombre */}
      <FichaHero barrio={barrio} />

      {/* 2. Datos duros — grid de números (lotes, ha, m² lote, espacios verdes) */}
      <FichaDatosDuros barrio={barrio} />

      {/* 3. Expensas — slot con placeholder hasta que tengamos el dato real */}
      <FichaExpensasSlot barrio={barrio} />

      {/* 4. Características — amenities + infraestructura + seguridad */}
      <FichaCaracteristicas barrio={barrio} />

      {/* 5. Ubicación — dirección + accesos + distancia centro Rosario */}
      <FichaUbicacion barrio={barrio} />

      {/* 6. Plano descargable */}
      <FichaPlano slug={barrio.slug} nombre={barrio.nombre} planoUrl={getPlanoUrl(barrio.slug)} />

      {/* 7. Stock disponible — lotes + casas (live Tokko) */}
      <div className="mx-auto max-w-[1280px] space-y-12 px-6 py-12 md:px-10">
        <section id="lotes" className="scroll-mt-24">
          <h2
            style={{
              fontFamily: "var(--font-raleway), 'Raleway', system-ui, sans-serif",
              fontWeight: 700,
              fontSize: 20,
              color: "#0a0a0a",
              margin: "0 0 18px",
              letterSpacing: "-0.01em",
            }}
          >
            Lotes disponibles en {barrio.nombre}
          </h2>
          <BarrioStockTokko slug={barrio.slug} nombre={barrio.nombre} tipo="Terreno" />
        </section>

        <section>
          <h2
            style={{
              fontFamily: "var(--font-raleway), 'Raleway', system-ui, sans-serif",
              fontWeight: 700,
              fontSize: 20,
              color: "#0a0a0a",
              margin: "0 0 18px",
              letterSpacing: "-0.01em",
            }}
          >
            Casas en venta en {barrio.nombre}
          </h2>
          <BarrioStockTokko slug={barrio.slug} nombre={barrio.nombre} tipo="Casa" />
        </section>

        {/* 8. Newsletter — form compacto para captura lead */}
        <section id="contacto" className="scroll-mt-24">
          <BarrioNewsletter
            defaultBarrioSlug={barrio.slug}
            origen={`barrio-${barrio.slug}-interesado`}
            title={`Avísenme cuando entre un lote en ${barrio.nombre}`}
            subtitle="Dejanos tu contacto. Cuando entre un lote nuevo en este barrio, te avisamos primero por WhatsApp."
          />
        </section>
      </div>

      {/* 9. CTA final — visita guiada + WhatsApp */}
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
