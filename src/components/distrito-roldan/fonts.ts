import { Montserrat, Orbitron, Raleway } from 'next/font/google'

// Montserrat 800 → nombre "Distrito Roldán"; 700 → avatar "DF" del agente.
export const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-montserrat',
  display: 'swap',
})

// Orbitron 900 → "SI" de la marca (footer/branding del rediseño).
export const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['900'],
  variable: '--font-orbitron',
  display: 'swap',
})

// Raleway con pesos finos (200/300) + itálicas que el Raleway global del
// layout no incluye. Scope: solo el rediseño de Distrito Roldán.
export const ralewayDistrito = Raleway({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-raleway-distrito',
  display: 'swap',
})

// Clase combinada para aplicar las variables en el contenedor de la página.
export const distritoFontVars = `${montserrat.variable} ${orbitron.variable} ${ralewayDistrito.variable}`
