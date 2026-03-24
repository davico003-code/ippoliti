import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export const metadata: Metadata = {
  title: "SI Inmobiliaria | Venta y Alquiler en Roldán y Rosario - Desde 1983",
  description:
    "SI Inmobiliaria - Más de 40 años en el mercado inmobiliario de Roldán y Rosario. Susana Ippoliti. Venta, alquiler y tasaciones profesionales.",
  verification: {
    google: 'vzBOIhp_zjfmlEuh_-0vZ6K9PDOyNAY_wSet1AWsNUI',
  },
  openGraph: {
    title: "SI Inmobiliaria | Venta y Alquiler en Roldán y Rosario - Desde 1983",
    description:
      "SI Inmobiliaria - Más de 40 años en el mercado inmobiliario de Roldán y Rosario.",
    url: "https://www.inmobiliariaippoliti.com",
    siteName: "SI Inmobiliaria",
    locale: "es_AR",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "SI Inmobiliaria",
  url: "https://www.inmobiliariaippoliti.com",
  logo: "https://www.inmobiliariaippoliti.com/logo.png",
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
      </body>
    </html>
  );
}
