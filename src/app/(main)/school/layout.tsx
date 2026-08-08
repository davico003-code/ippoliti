import type { Metadata } from 'next'

// /school es un panel interno gateado por password (la page es 'use client' y
// no puede exportar metadata). Este layout existe solo para el noindex, que
// reemplaza al Disallow de robots.ts (ver comentario ahí).
export const metadata: Metadata = {
  title: 'SI School | SI INMOBILIARIA',
  robots: { index: false, follow: false },
}

export default function SchoolLayout({ children }: { children: React.ReactNode }) {
  return children
}
