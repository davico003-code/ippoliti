// Root layout del link público del plano de lotes.
//
// Route group propio, independiente del layout (main): sin Navbar, sin Footer,
// sin WhatsApp flotante ni popups. La página muestra el plano y nada más — es
// el link que se manda por WhatsApp para ver la disponibilidad desde el
// celular. Mismo patrón que (kiosk) y (autorizacion).
//
// El globals.css del (main) se importa sólo por el preflight de Tailwind.

import type { Metadata } from 'next'
import localFont from 'next/font/local'
import '../(main)/globals.css'
import MetaPixel from '@/components/MetaPixel'
import GoogleAnalytics from '@/components/GoogleAnalytics'

const raleway = localFont({
  // Raleway, en el repo (src/fonts): compilar no depende de Google Fonts.
  src: [
    { path: '../../fonts/raleway-latin.woff2', weight: '300' },
    { path: '../../fonts/raleway-latin.woff2', weight: '400' },
    { path: '../../fonts/raleway-latin.woff2', weight: '600' },
    { path: '../../fonts/raleway-latin.woff2', weight: '700' },
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
  // Absoluta, para que la imagen de vista previa viaje entera en WhatsApp.
  metadataBase: new URL('https://siinmobiliaria.com'),
  robots: { index: false, follow: false },
}

export default function PlanoRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${raleway.variable} ${poppins.variable}`}>
      <body
        style={{
          margin: 0,
          background: '#EDE7DA', // el mismo papel del plano: sin costura en los bordes
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }}
      >
        {children}
        {/* 06-sep-2026: el plano (iframe same-origin) dispara LoteVisto/Lead y
            dr_lote_visto/dr_pedido en la ventana padre. Sin esto, el link que
            se manda por WhatsApp no medía nada. Mismos componentes que (main). */}
        <MetaPixel />
        <GoogleAnalytics />
      </body>
    </html>
  )
}
