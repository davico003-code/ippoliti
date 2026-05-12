// Root layout neutro para verficha.casa.
//
// IMPORTANTE: este layout es completamente independiente del root layout SI
// (vive en otro route group). NO importa Navbar, Footer, FloatingWhatsApp,
// ningún script de analytics SI ni JSON-LD de SI. La única tipografía es Inter
// y la única paleta es blanco/carbón/gris.
//
// El globals.css se importa para tener Tailwind preflight y reset disponibles
// (los componentes neutros usan algunas utility classes). Si en el futuro hay
// fuga de estilos del root SI, swap por un neutral.css mínimo.

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../(main)/globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

const NEUTRAL_DOMAIN = process.env.NEXT_PUBLIC_NEUTRAL_DOMAIN || 'verficha.casa'

export const metadata: Metadata = {
  title: 'Ficha de propiedad',
  description: 'Información de la propiedad',
  metadataBase: new URL(`https://${NEUTRAL_DOMAIN}`),
  robots: { index: false, follow: false },
  // Sin openGraph default acá: cada page.tsx define el suyo. Si dejara uno
  // genérico, Next.js lo mergearía con el del page y filtraría datos del shell.
  icons: {},
}

export default function NeutralRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body
        style={{
          margin: 0,
          background: '#FFFFFF',
          color: '#1A1A1A',
          fontFamily: 'var(--font-inter), Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }}
      >
        {children}
      </body>
    </html>
  )
}
