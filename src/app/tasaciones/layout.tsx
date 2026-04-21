import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tasaciones inmobiliarias en Funes, Roldán y Rosario | SI INMOBILIARIA',
  description:
    'Tasación inmobiliaria profesional en 24 horas con respaldo de Mat. N° 0621. Casas, departamentos, terrenos y locales en Funes, Roldán y Rosario. Solicitá la tuya sin cargo.',
  keywords: [
    'tasaciones inmobiliarias',
    'tasación Funes',
    'tasación Roldán',
    'tasación Rosario',
    'tasar casa',
    'tasar departamento',
    'tasar terreno',
  ],
  alternates: { canonical: 'https://siinmobiliaria.com/tasaciones' },
  openGraph: {
    title: 'Tasaciones inmobiliarias en Funes, Roldán y Rosario | SI INMOBILIARIA',
    description:
      'Tasación profesional en 24 horas con Mat. N° 0621. SI INMOBILIARIA — inmobiliaria familiar desde 1983.',
    url: 'https://siinmobiliaria.com/tasaciones',
    siteName: 'SI INMOBILIARIA',
    images: ['/og-image.jpg'],
    type: 'website',
  },
}

export default function TasacionesLayout({ children }: { children: React.ReactNode }) {
  return children
}
