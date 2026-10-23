// Root layout del modo KIOSCO / TV (/tv). Route group propio, independiente
// del layout (main): sin Navbar, Footer, WhatsApp flotante ni popups. Pantalla
// completa, fondo oscuro, pensado para dejar corriendo en un televisor.

import type { Metadata } from 'next'
import localFont from 'next/font/local'
import '../(main)/globals.css'

const raleway = localFont({
  // Raleway, en el repo (src/fonts): compilar no depende de Google Fonts.
  src: [
    { path: '../../fonts/raleway-latin.woff2', weight: '300' },
    { path: '../../fonts/raleway-latin.woff2', weight: '400' },
    { path: '../../fonts/raleway-latin.woff2', weight: '600' },
    { path: '../../fonts/raleway-latin.woff2', weight: '700' },
    { path: '../../fonts/raleway-latin.woff2', weight: '800' },
  ],
  variable: '--font-raleway',
  display: 'swap',
})
const poppins = localFont({
  // Poppins, en el repo (src/fonts): compilar no depende de Google Fonts.
  src: [
    { path: '../../fonts/poppins-400-latin.woff2', weight: '400' },
    { path: '../../fonts/poppins-500-latin.woff2', weight: '500' },
    { path: '../../fonts/poppins-600-latin.woff2', weight: '600' },
    { path: '../../fonts/poppins-700-latin.woff2', weight: '700' },
  ],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SI INMOBILIARIA — Pantalla',
  description: 'Propiedades en Funes, Roldán y Rosario',
  robots: { index: false, follow: false },
}

export default function KioskLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${raleway.variable} ${poppins.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body
        style={{
          margin: 0,
          background: '#08100B',
          color: '#fff',
          overflow: 'hidden',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          fontFamily: "var(--font-poppins), system-ui, -apple-system, sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  )
}
