import type { Metadata } from "next";
import { Raleway, Poppins } from "next/font/google";
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
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import Analytics from "@/components/Analytics";
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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "SI Inmobiliaria",
  url: "https://siinmobiliaria.com",
  logo: "https://siinmobiliaria.com/logo.png",
  foundingDate: "1983",
  telephone: "+54-341-210-1694",
  location: [
    {
      "@type": "Place",
      name: "SI Inmobiliaria - Funes",
      telephone: "+54-341-210-1694",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Funes",
        addressRegion: "Santa Fe",
        addressCountry: "AR",
      },
    },
    {
      "@type": "Place",
      name: "SI Inmobiliaria - Roldán Principal",
      telephone: "+54-341-210-1694",
      address: {
        "@type": "PostalAddress",
        streetAddress: "1ro de Mayo 258",
        addressLocality: "Roldán",
        addressRegion: "Santa Fe",
        addressCountry: "AR",
      },
    },
    {
      "@type": "Place",
      name: "SI Inmobiliaria - Roldán Ventas",
      telephone: "+54-341-210-1694",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Catamarca 775",
        addressLocality: "Roldán",
        addressRegion: "Santa Fe",
        addressCountry: "AR",
      },
    },
  ],
  areaServed: [
    { "@type": "City", name: "Roldán" },
    { "@type": "City", name: "Funes" },
    { "@type": "City", name: "Rosario" },
    { "@type": "City", name: "Granadero Baigorria" },
    { "@type": "City", name: "San Lorenzo" },
  ],
  description:
    "Inmobiliaria familiar fundada en 1983. Especialistas en Funes, Roldán y Rosario.",
  sameAs: [
    "https://www.instagram.com/inmobiliaria.si",
    "https://www.tiktok.com/@si.inmobiliaria",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${raleway.variable} ${poppins.variable}`}>
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
        <Footer />
        <FloatingWhatsApp />
        <ScrollToTop />
        <PopupManager />
        <Analytics />
        <Clarity />
        <TawkTo />
      </body>
    </html>
  );
}
