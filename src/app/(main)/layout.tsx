import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const raleway = localFont({
  // Raleway, en el repo (src/fonts): compilar no depende de Google Fonts.
  // 500: el texto de lectura (descripción de la propiedad) va en 500, no 400.
  src: [
    { path: "../../fonts/raleway-latin.woff2", weight: "400" },
    { path: "../../fonts/raleway-latin.woff2", weight: "500" },
    { path: "../../fonts/raleway-latin.woff2", weight: "600" },
    { path: "../../fonts/raleway-latin.woff2", weight: "700" },
    { path: "../../fonts/raleway-latin.woff2", weight: "800" },
  ],
  variable: "--font-raleway",
  display: "swap",
});

const poppins = localFont({
  // Poppins, en el repo (src/fonts): compilar no depende de Google Fonts.
  // 700: unos 50 números piden negrita (font-bold, fontWeight 700) y sin esta
  // cara el navegador los dibujaba con la 800, más gordos de lo diseñado.
  // 300 queda: Hausing y el masterplan de Distrito Roldán dibujan sus números
  // grandes finitos (font-extralight / 300); sin ella saldrían en 400.
  src: [
    { path: "../../fonts/poppins-300-latin.woff2", weight: "300" },
    { path: "../../fonts/poppins-400-latin.woff2", weight: "400" },
    { path: "../../fonts/poppins-500-latin.woff2", weight: "500" },
    { path: "../../fonts/poppins-600-latin.woff2", weight: "600" },
    { path: "../../fonts/poppins-700-latin.woff2", weight: "700" },
    { path: "../../fonts/poppins-800-latin.woff2", weight: "800" },
  ],
  variable: "--font-poppins",
  display: "swap",
});

import { esEdicionMundial } from "@/lib/mundial";
import ConditionalChrome from "@/components/ConditionalChrome";
import FooterWrapper from "@/components/FooterWrapper";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import OportunidadesPopup from "@/components/OportunidadesPopup";
// NewsletterPopup ("Oportunidades con IA", modal a los 90s) retirado a pedido de
// David (22-sep-2026). El componente queda en src/components por si se revive.
// PopupManager (Open House, venció el 17-abr-2026: siempre null) y TawkTo (ID
// de ejemplo, nunca se configuró; el canal es WhatsApp) se sacaron el 25-oct:
// se hidrataban en cada página para no mostrar nada. Quedan en el historial de
// git si se revive un Open House.
import MetaPixel from "@/components/MetaPixel";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import Clarity from "@/components/Clarity";
import CapturaCompartido from "@/components/CapturaCompartido";
import { AudioPlayerProvider } from "@/components/audio/AudioPlayerProvider";
import { OG_BASE } from "@/lib/seo/og-base";
import { COLOR_BARRA_CLARO, COLOR_BARRA_OSCURO, SCRIPT_TEMA_INICIAL } from "@/lib/color-barra-navegador";

export const metadata: Metadata = {
  title: "SI INMOBILIARIA — Propiedades en Funes, Roldán y Rosario",
  description:
    "Inmobiliaria familiar con más de 40 años en Roldán, Funes y Rosario. Casas, terrenos, emprendimientos. Tasaciones profesionales.",
  metadataBase: new URL('https://siinmobiliaria.com'),
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  verification: {
    google: 'vzBOIhp_zjfmlEuh_-0vZ6K9PDOyNAY_wSet1AWsNUI',
    // Bing Webmaster Tools (cuenta de David, 16-oct). No sacarla: Bing la re-chequea.
    other: { 'msvalidate.01': 'D6A3E4255C7F24CD2154E6225C5AAEC2' },
  },
  // OG_BASE (siteName, locale, type): las páginas con openGraph propio lo
  // pisan entero (Next no mezcla en profundidad), así que la esparcen también.
  openGraph: {
    ...OG_BASE,
    title: 'SI INMOBILIARIA — Propiedades en Funes, Roldán y Rosario',
    description: 'Inmobiliaria familiar con más de 40 años en Roldán, Funes y Rosario. Casas, terrenos, emprendimientos. Tasaciones profesionales.',
    url: 'https://siinmobiliaria.com',
    // og-image.jpg: asset OG real 1200×630 (logo sobre fondo blanco).
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'SI INMOBILIARIA' }],
  },
  // Solo el tipo de tarjeta. Con título e imagen acá, el blog, las landings y
  // el listado heredaban en X y Slack el twitter:title de la home; sin
  // twitter:* propio, esos clientes usan el og:* de cada página.
  twitter: {
    card: 'summary_large_image',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  // La barra del navegador acompaña el tema: un color por media query del
  // sistema, y si el tema se eligió a mano, el script del <head> y ThemeToggle
  // prenden el que corresponde (ver src/lib/color-barra-navegador.ts).
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: COLOR_BARRA_CLARO },
    { media: '(prefers-color-scheme: dark)', color: COLOR_BARRA_OSCURO },
  ],
}

const OFFICE_HOURS = [
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "09:00",
    closes: "17:00",
  },
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: "Saturday",
    opens: "09:00",
    closes: "13:00",
  },
]

const OFFICES = [
  {
    "@type": "LocalBusiness",
    "@id": "https://siinmobiliaria.com/#oficina-roldan-historica",
    name: "SI INMOBILIARIA — Oficina Histórica Roldán",
    image: "https://siinmobiliaria.com/logo-si-horizontal.png",
    telephone: "+54-341-341-5159",
    address: {
      "@type": "PostalAddress",
      streetAddress: "1ro de Mayo 258",
      addressLocality: "Roldán",
      addressRegion: "Santa Fe",
      postalCode: "S2134",
      addressCountry: "AR",
    },
    geo: { "@type": "GeoCoordinates", latitude: -32.9018631, longitude: -60.9107469 },
    url: "https://siinmobiliaria.com",
    sameAs: "https://www.google.com/maps?cid=13179481715321306790",
    priceRange: "$$",
  },
  {
    "@type": "LocalBusiness",
    "@id": "https://siinmobiliaria.com/#oficina-roldan-catamarca",
    name: "SI INMOBILIARIA — Oficina Ventas Roldán",
    image: "https://siinmobiliaria.com/logo-si-horizontal.png",
    telephone: "+54-341-334-0916",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Catamarca 775",
      addressLocality: "Roldán",
      addressRegion: "Santa Fe",
      postalCode: "S2134",
      addressCountry: "AR",
    },
    geo: { "@type": "GeoCoordinates", latitude: -32.905467, longitude: -60.909775 },
    url: "https://siinmobiliaria.com",
    sameAs: "https://www.google.com/maps?cid=3917523507085031295",
    priceRange: "$$",
  },
  {
    "@type": "LocalBusiness",
    "@id": "https://siinmobiliaria.com/#oficina-funes",
    name: "SI INMOBILIARIA — Oficina Funes",
    image: "https://siinmobiliaria.com/logo-si-horizontal.png",
    telephone: "+54-341-334-0916",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Hipólito Yrigoyen 2643",
      addressLocality: "Funes",
      addressRegion: "Santa Fe",
      postalCode: "S2132",
      addressCountry: "AR",
    },
    geo: { "@type": "GeoCoordinates", latitude: -32.9263509, longitude: -60.8115424 },
    openingHoursSpecification: OFFICE_HOURS,
    url: "https://siinmobiliaria.com",
    sameAs: "https://www.google.com/maps?cid=9299536952583055353",
    priceRange: "$$",
  },
]

const jsonLd = [
  // WebSite + SearchAction: habilita la sitelinks searchbox de Google.
  // El buscador real del sitio es /propiedades?q=<término> (HeroSearch/HeroMobile).
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://siinmobiliaria.com/#website",
    url: "https://siinmobiliaria.com",
    name: "SI INMOBILIARIA",
    inLanguage: "es-AR",
    publisher: { "@id": "https://siinmobiliaria.com/#organization" },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://siinmobiliaria.com/propiedades?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": "https://siinmobiliaria.com/#organization",
    name: "SI INMOBILIARIA",
    alternateName: "Inmobiliaria Ippoliti",
    url: "https://siinmobiliaria.com",
    logo: "https://siinmobiliaria.com/logo-si-horizontal.png",
    foundingDate: "1983",
    founder: { "@type": "Person", name: "Susana Ippoliti" },
    telephone: "+54-341-334-0916",
    email: "contacto@siinmobiliaria.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Hipólito Yrigoyen 2643",
      addressLocality: "Funes",
      addressRegion: "Santa Fe",
      postalCode: "S2132",
      addressCountry: "AR",
    },
    location: OFFICES.map(o => ({ "@id": o["@id"] })),
    areaServed: [
      { "@type": "City", name: "Roldán" },
      { "@type": "City", name: "Funes" },
      { "@type": "City", name: "Rosario" },
      { "@type": "City", name: "Granadero Baigorria" },
      { "@type": "City", name: "San Lorenzo" },
      { "@type": "City", name: "Fisherton" },
    ],
    knowsAbout: ["compra-venta inmobiliaria", "tasaciones", "alquileres", "emprendimientos inmobiliarios"],
    description:
      "Inmobiliaria familiar fundada en 1983. Especialistas en casas, terrenos, departamentos y emprendimientos en Funes, Roldán y Rosario, Santa Fe, Argentina.",
    sameAs: [
      "https://www.instagram.com/inmobiliaria.si",
      "https://www.tiktok.com/@si.inmobiliaria",
      "https://www.facebook.com/inmobiliariaippoliti/",
      "https://www.youtube.com/@mundosiinmobiliaria",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "consultas inmobiliarias",
      telephone: "+54-9-341-334-0916",
      availableLanguage: "Spanish",
      areaServed: "AR",
    },
  },
  ...OFFICES.map(office => ({
    "@context": "https://schema.org",
    ...office,
    parentOrganization: { "@id": "https://siinmobiliaria.com/#organization" },
  })),
]

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Edición Mundial 2026: la clase `mundial` (server-side, sin flash ni mismatch)
  // activa el token de acento celeste y el ::selection. Fuera del rango, sin clase
  // → todo verde como siempre.
  const mundial = esEdicionMundial()
  return (
    <html lang="es-AR" suppressHydrationWarning className={`${raleway.variable} ${poppins.variable}${mundial ? ' mundial' : ''}`}>
      <head>
        {/* Tema (data-theme) y color de la barra del navegador antes de pintar. */}
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA_INICIAL }} />
        {/* Favicon Edición Mundial (placeholder /favicon-mundial.png — reemplazar). */}
        {mundial && <link rel="icon" type="image/png" href="/favicon-mundial.png" />}
        {/* Sin preconnect a CDNs de fotos: las imágenes salen todas por
            /_next/image (mismo origen). Los que había apuntaban a Tokko, que la
            web ya no usa (cdn.tokkobroker.com ni resuelve): eran dos conexiones
            tiradas en cada página. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <AudioPlayerProvider>
          <ConditionalChrome>{children}</ConditionalChrome>
          <FooterWrapper />
          <FloatingWhatsApp />
          <OportunidadesPopup />
          <MetaPixel />
          <GoogleAnalytics />
          <Clarity />
          <CapturaCompartido />
        </AudioPlayerProvider>
      </body>
    </html>
  );
}
