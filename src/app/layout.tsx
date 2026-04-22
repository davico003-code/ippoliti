import type { Metadata } from "next";
import { Raleway, Poppins, Lora, Playfair_Display } from "next/font/google";
import "./globals.css";

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-raleway",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});
const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

import Navbar from "@/components/Navbar";
import FooterWrapper from "@/components/FooterWrapper";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import MetaPixel from "@/components/MetaPixel";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import TawkTo from "@/components/TawkTo";
import PopupManager from "@/components/PopupManager";
import Clarity from "@/components/Clarity";
import ScrollToTop from "@/components/ScrollToTop";

export const metadata: Metadata = {
  title: "SI Inmobiliaria — Propiedades en Funes, Roldán y Rosario",
  description:
    "Inmobiliaria familiar con más de 40 años en Roldán, Funes y Rosario. Casas, terrenos, emprendimientos. Tasaciones profesionales.",
  metadataBase: new URL('https://siinmobiliaria.com'),
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/icon.png',
  },
  verification: {
    google: 'vzBOIhp_zjfmlEuh_-0vZ6K9PDOyNAY_wSet1AWsNUI',
  },
  openGraph: {
    title: 'SI Inmobiliaria — Propiedades en Funes, Roldán y Rosario',
    description: 'Inmobiliaria familiar con más de 40 años en Roldán, Funes y Rosario. Casas, terrenos, emprendimientos. Tasaciones profesionales.',
    url: 'https://siinmobiliaria.com',
    siteName: 'SI Inmobiliaria',
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'SI Inmobiliaria' }],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SI Inmobiliaria — Propiedades en Funes, Roldán y Rosario',
    description: 'Inmobiliaria familiar con más de 40 años en Roldán, Funes y Rosario.',
    images: ['/logo.png'],
  },
};

const OFFICE_HOURS = [
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "09:00",
    closes: "17:00",
  },
]

const OFFICES = [
  {
    "@type": "LocalBusiness",
    "@id": "https://siinmobiliaria.com/#oficina-roldan-historica",
    name: "SI Inmobiliaria — Oficina Histórica Roldán",
    image: "https://siinmobiliaria.com/logo.png",
    telephone: "+54-341-210-1694",
    address: {
      "@type": "PostalAddress",
      streetAddress: "1ro de Mayo 258",
      addressLocality: "Roldán",
      addressRegion: "Santa Fe",
      postalCode: "S2134",
      addressCountry: "AR",
    },
    geo: { "@type": "GeoCoordinates", latitude: -32.8935, longitude: -60.9016 },
    openingHoursSpecification: OFFICE_HOURS,
    url: "https://siinmobiliaria.com",
    priceRange: "$$",
  },
  {
    "@type": "LocalBusiness",
    "@id": "https://siinmobiliaria.com/#oficina-roldan-catamarca",
    name: "SI Inmobiliaria — Oficina Ventas Roldán",
    image: "https://siinmobiliaria.com/logo.png",
    telephone: "+54-341-210-1694",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Catamarca 775",
      addressLocality: "Roldán",
      addressRegion: "Santa Fe",
      postalCode: "S2134",
      addressCountry: "AR",
    },
    geo: { "@type": "GeoCoordinates", latitude: -32.8940, longitude: -60.9020 },
    openingHoursSpecification: OFFICE_HOURS,
    url: "https://siinmobiliaria.com",
    priceRange: "$$",
  },
  {
    "@type": "LocalBusiness",
    "@id": "https://siinmobiliaria.com/#oficina-funes",
    name: "SI Inmobiliaria — Oficina Funes",
    image: "https://siinmobiliaria.com/logo.png",
    telephone: "+54-341-210-1694",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Hipólito Yrigoyen 2643",
      addressLocality: "Funes",
      addressRegion: "Santa Fe",
      postalCode: "S2132",
      addressCountry: "AR",
    },
    geo: { "@type": "GeoCoordinates", latitude: -32.9181, longitude: -60.8270 },
    openingHoursSpecification: OFFICE_HOURS,
    url: "https://siinmobiliaria.com",
    priceRange: "$$",
  },
]

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": "https://siinmobiliaria.com/#organization",
    name: "SI Inmobiliaria",
    alternateName: "Inmobiliaria Ippoliti",
    url: "https://siinmobiliaria.com",
    logo: "https://siinmobiliaria.com/logo.png",
    foundingDate: "1983",
    telephone: "+54-341-210-1694",
    email: "contacto@siinmobiliaria.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Hipólito Yrigoyen 2643",
      addressLocality: "Funes",
      addressRegion: "Santa Fe",
      postalCode: "S2132",
      addressCountry: "AR",
    },
    location: OFFICES.map(o => ({ "@type": "Place", name: o.name, address: o.address })),
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
    ],
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
  return (
    <html lang="es" className={`${raleway.variable} ${poppins.variable} ${lora.variable} ${playfair.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <link rel="preconnect" href="https://static.tokkobroker.com" />
        <link rel="dns-prefetch" href="https://static.tokkobroker.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <Navbar />
        <main>{children}</main>
        <FooterWrapper />
        <FloatingWhatsApp />
        <ScrollToTop />
        <PopupManager />
        <MetaPixel />
        <GoogleAnalytics />
        <Clarity />
        <TawkTo />
      </body>
    </html>
  );
}
