// Root layout independiente para la vista pública del cliente
// (/autorizacion/[slug] y subrutas).
//
// NO importa Navbar, Footer, FloatingWhatsApp ni ningún script del shell de SI.
// Tiene su propio <html> y <body>. Patrón análogo al route group (neutral)
// usado por verficha.casa.
//
// Fonts: Raleway (cuerpo del documento legal) + Poppins (marcadores y micro-UI).
// El globals.css del (main) se importa para tener Tailwind preflight + reset.

import type { Metadata } from 'next'
import Image from 'next/image'
import { Raleway, Poppins } from 'next/font/google'
import '../(main)/globals.css'

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-raleway',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-poppins',
  display: 'swap',
})

const LINE = '#E5E5E0'

export const metadata: Metadata = {
  title: 'Autorización de venta · SI INMOBILIARIA',
  description: 'Autorización de venta digital — SI INMOBILIARIA.',
  robots: { index: false, follow: false },
}

export default function AutorizacionRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${raleway.variable} ${poppins.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body
        style={{
          margin: 0,
          background: '#FFFFFF',
          color: '#1A1A1A',
          fontFamily: "'Raleway', system-ui, -apple-system, 'Segoe UI', sans-serif",
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }}
      >
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <header
            style={{
              padding: '16px 20px',
              borderBottom: `1px solid ${LINE}`,
              display: 'flex',
              justifyContent: 'center',
              background: '#FFFFFF',
            }}
          >
            <Image
              src="/logo-si-horizontal.png"
              alt="SI INMOBILIARIA"
              width={140}
              height={36}
              priority
              style={{ height: 36, width: 'auto' }}
            />
          </header>
          <main
            style={{
              flex: 1,
              width: '100%',
              maxWidth: 680,
              margin: '0 auto',
              padding: 'clamp(28px, 5vw, 48px) clamp(22px, 4vw, 56px) 48px',
              boxSizing: 'border-box',
            }}
          >
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
