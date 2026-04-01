import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import Analytics from "@/components/Analytics";
import TawkTo from "@/components/TawkTo";
import ExitPopup from "@/components/ExitPopup";
import Clarity from "@/components/Clarity";

export const metadata: Metadata = {
  title: "SI Inmobiliaria | Venta y Alquiler en Roldán y Funes - Desde 1983",
  description:
    "Inmobiliaria con 43 años de trayectoria en Roldán, Funes y Gran Rosario. Casas, departamentos, terrenos y emprendimientos. Tasaciones profesionales.",
  metadataBase: new URL('https://siinmobiliaria.com'),
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/icon.png',
  },
  verification: {
    google: 'vzBOIhp_zjfmlEuh_-0vZ6K9PDOyNAY_wSet1AWsNUI',
  },
  openGraph: {
    title: "SI Inmobiliaria | Venta y Alquiler en Roldán y Funes",
    description:
      "Inmobiliaria con 43 años de trayectoria en Roldán, Funes y Gran Rosario. Propiedades disponibles.",
    url: "https://siinmobiliaria.com",
    siteName: "SI Inmobiliaria",
    locale: "es_AR",
    type: "website",
    images: [{ url: '/logo.png', width: 400, height: 400, alt: 'SI Inmobiliaria' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SI Inmobiliaria | Venta y Alquiler en Roldán y Funes',
    description: 'Inmobiliaria con 43 años en Roldán, Funes y Rosario.',
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
    "Inmobiliaria familiar con más de 40 años de experiencia en Roldán, Funes y Rosario. Venta, alquiler y tasaciones de propiedades. Estudio jurídico propio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://static.tokkobroker.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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
        <ExitPopup />
        <Analytics />
        <Clarity />
        <TawkTo />
      </body>
    </html>
  );
}
