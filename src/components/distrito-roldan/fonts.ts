import localFont from 'next/font/local'

// Tipografía principal definida por el manual de marca de Distrito Roldán.
export const montserrat = localFont({
  // Montserrat, en el repo (src/fonts): compilar no depende de Google Fonts.
  src: [
    { path: '../../fonts/montserrat-latin.woff2', weight: '400' },
    { path: '../../fonts/montserrat-latin.woff2', weight: '500' },
    { path: '../../fonts/montserrat-latin.woff2', weight: '600' },
    { path: '../../fonts/montserrat-latin.woff2', weight: '700' },
    { path: '../../fonts/montserrat-latin.woff2', weight: '800' },
  ],
  variable: '--font-montserrat',
  display: 'swap',
})

export const distritoFontVars = `${montserrat.variable} ${montserrat.className}`
