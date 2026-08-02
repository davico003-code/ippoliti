import type { Metadata } from 'next'
// InformesDashboard (recharts) se carga vía InformesDashboardLazy ("use client"):
// un import estático acá metía recharts entero en el First Load JS de la ruta.
import InformesDashboardLazy from './InformesDashboardLazy'

export const metadata: Metadata = {
  title: 'Informes de Mercado Inmobiliario | SI INMOBILIARIA',
  description: 'Dólar, inflación IPC, índice de alquileres ICL y costo de construcción CAC actualizados cada semana. Datos oficiales para decidir mejor en Funes y Roldán.',
  alternates: { canonical: 'https://siinmobiliaria.com/informes' },
}

export default function InformesPage() {
  return <InformesDashboardLazy />
}
