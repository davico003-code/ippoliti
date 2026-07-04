// HUB /barrios-privados — rediseño 2026-05.
// Composición: Hero (texto + buscador + 2 placas) → Filtros amenities sticky
// → Header grilla + ordenar → Grilla 15 cards → Mapa Leaflet → FAQ acordeón
// → CTA 3 cards (visita/whatsapp/tasación).
//
// Toda la data viene de lib/barrios.ts (BARRIOS + HUB_DATA + PROXIMAMENTE_HUB).
// Las FAQs siguen viviendo en lib/barrios/faq.ts (HUB_FAQS).
//
// State del HUB (búsqueda, filtros, orden) en BarriosHubProvider — context
// client-side, sin URL params (no fragmenta SEO).

import type { Metadata } from "next";
import { BARRIOS, getBarriosHub } from "@/lib/barrios";
import { HUB_FAQS } from "@/lib/barrios/faq";

import HubTracker from "./HubTracker";
import { BarriosHubProvider } from "./_components/BarriosHubProvider";
import HeroBarrios from "./_components/HeroBarrios";
import FiltrosAmenities from "./_components/FiltrosAmenities";
import GrillaBarrios from "./_components/GrillaBarrios";
import MapaBarrios from "./_components/MapaBarrios";
import FaqBarrios from "./_components/FaqBarrios";
import CtaServiciosCards from "./_components/CtaServiciosCards";

const CANONICAL = "https://siinmobiliaria.com/barrios-privados";

export const metadata: Metadata = {
  title: "Barrios cerrados de Funes | SI Inmobiliaria",
  description:
    "Los 11 barrios cerrados de Funes analizados sin filtro. Premium, consolidados y en desarrollo. Conocelos con la mirada de un broker de dos generaciones.",
  keywords: [
    "barrios cerrados funes",
    "barrios privados funes",
    "club de campo funes santa fe",
    "lotes en venta funes",
    "country messi rosario",
  ].join(", "),
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: "Barrios cerrados de Funes | SI Inmobiliaria",
    description:
      "Una guía completa, escrita por brokers que viven y trabajan en la zona. Los 11 barrios cerrados de Funes analizados sin filtro.",
    url: CANONICAL,
    type: "website",
    siteName: "SI INMOBILIARIA",
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Barrios cerrados de Funes",
    description: "11 barrios analizados por SI Inmobiliaria — Mat. 0621",
    images: ["/og-image.jpg"],
  },
};

export default function BarriosPrivadosHubPage() {
  // JSON-LD: ItemList con TODOS los barrios del HUB (incluye los 4
  // Próximamente — Schema.org acepta ItemList con URLs aunque no resuelvan
  // a ficha real todavía). Sigue el orden canónico del HUB.
  const hubBarrios = getBarriosHub();
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Barrios cerrados del corredor de Funes",
    description: `${BARRIOS.length} barrios cerrados analizados por SI INMOBILIARIA — Mat. N° 0621. Funes, Santa Fe, Argentina.`,
    itemListElement: hubBarrios.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${CANONICAL}/${b.slug}`,
      name: b.nombre,
    })),
  };

  // FAQPage JSON-LD: igual que antes, usa HUB_FAQS.
  const hubFaqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HUB_FAQS.map((f) => ({
      "@type": "Question",
      name: f.pregunta,
      acceptedAnswer: { "@type": "Answer", text: f.respuesta },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hubFaqJsonLd) }}
      />
      <HubTracker />

      <BarriosHubProvider>
        <HeroBarrios />
        <FiltrosAmenities />
        <GrillaBarrios />
      </BarriosHubProvider>

      <MapaBarrios />
      <FaqBarrios />
      <CtaServiciosCards />
    </>
  );
}
