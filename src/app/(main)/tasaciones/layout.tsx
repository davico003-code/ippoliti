import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tasaciones profesionales en Funes, Roldán y Rosario | SI INMOBILIARIA',
  description: 'Tasaciones profesionales de propiedades en Roldán, Funes y Rosario. Completá el formulario y te contactamos.',
  alternates: { canonical: 'https://siinmobiliaria.com/tasaciones' },
  openGraph: {
    title: 'Tasaciones profesionales | SI INMOBILIARIA',
    description: 'Tasación de tu propiedad en Funes, Roldán y Rosario. Informe en 24 horas.',
    url: 'https://siinmobiliaria.com/tasaciones',
    // og-image.jpg regenerado como asset real 1200×630.
    images: ['/og-image.jpg'],
  },
}

export default function TasacionesLayout({ children }: { children: React.ReactNode }) {
  return children
}
