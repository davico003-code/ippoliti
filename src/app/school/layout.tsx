import type { Metadata } from 'next'

// Área interna de SI INMOBILIARIA (training / recursos para el equipo).
// No debe indexarse — protegida con password del lado cliente.
export const metadata: Metadata = {
  title: 'SI School — Área interna | SI INMOBILIARIA',
  description: 'Acceso al área de formación y recursos internos de SI INMOBILIARIA.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
}

export default function SchoolLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
