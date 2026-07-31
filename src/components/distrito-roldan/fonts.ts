import { Montserrat } from 'next/font/google'

// Tipografía principal definida por el manual de marca de Distrito Roldán.
export const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const distritoFontVars = `${montserrat.variable} ${montserrat.className}`
