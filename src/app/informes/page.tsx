import type { Metadata } from 'next'
import InformesDashboard from './InformesDashboard'

export const metadata: Metadata = {
  title: 'Informes de Mercado Inmobiliario | SI Inmobiliaria',
  description: 'Dólar, inflación IPC, índice de alquileres ICL y costo de construcción CAC actualizados cada semana. Datos oficiales para decidir mejor en Funes y Roldán.',
}

export default function InformesPage() {
  return <InformesDashboard />
}
