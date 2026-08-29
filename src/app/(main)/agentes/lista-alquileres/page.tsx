// Lista de alquileres para imprimir (hoja A4) — panel de agentes.
//
// Lee el mismo feed que /propiedades (getProperties), filtra las propiedades
// con operación de alquiler y las proyecta con lib/listado-alquileres (misma
// fuente que el PDF descargable). El layout imprimible vive en
// ListaAlquileresSheet (client: window.print).

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyAgentToken } from '@/lib/auth'
import { getProperties, sanitizeProperty } from '@/lib/tokko'
import {
  fechaListadoAR,
  proyectarAlquiler,
  type AlquilerItem,
} from '@/lib/listado-alquileres'
import ListaAlquileresSheet from '@/components/agentes/ListaAlquileresSheet'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Alquileres para imprimir · SI INMOBILIARIA',
  robots: { index: false, follow: false },
}

export default async function ListaAlquileresPage() {
  const token = cookies().get('si_agent_token')?.value
  if (!token) redirect('/agentes/login')
  const agent = await verifyAgentToken(token)
  if (!agent) redirect('/agentes/login')

  let items: AlquilerItem[] = []
  try {
    const data = await getProperties()
    items = (data.objects ?? [])
      .map(sanitizeProperty)
      .map(proyectarAlquiler)
      .filter((i): i is AlquilerItem => i !== null)
  } catch (err) {
    console.error(
      '[lista-alquileres] Error fetching properties:',
      err instanceof Error ? err.message : err,
    )
  }

  return <ListaAlquileresSheet items={items} fecha={fechaListadoAR()} />
}
