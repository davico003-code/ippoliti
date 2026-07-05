// Root layout del modo KIOSCO / TV (/tv). Route group propio, independiente
// del layout (main): sin Navbar, Footer, WhatsApp flotante ni popups. Pantalla
// completa, fondo oscuro, pensado para dejar corriendo en un televisor.

import type { Metadata } from 'next'
import { Raleway, Poppins } from 'next/font/google'
import '../(main)/globals.css'

const raleway = Raleway({ subsets: ['latin'], weight: ['300', '400', '600', '700', '800'], variable: '--font-raleway', display: 'swap' })
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-poppins', display: 'swap' })

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
