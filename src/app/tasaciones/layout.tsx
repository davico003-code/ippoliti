import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tasaciones | SI Inmobiliaria',
  description: 'Tasaciones profesionales de propiedades en Roldán, Funes y Rosario. Completá el formulario y te contactamos.',
}

export default function TasacionesLayout({ children }: { children: React.ReactNode }) {
  return children
}
