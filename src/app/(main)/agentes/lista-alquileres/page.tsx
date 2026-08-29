// Lista de alquileres para imprimir (hoja A4) — panel de agentes.
//
// Lee el mismo feed que /propiedades (getProperties), filtra las propiedades
// con operación de alquiler y las proyecta a la shape mínima que necesita la
// hoja. El layout imprimible vive en ListaAlquileresSheet (client: window.print).

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyAgentToken } from '@/lib/auth'
import {
  getProperties,
  sanitizeProperty,
  getMainPhoto,
  getTotalSurface,
  formatLocation,
  type TokkoProperty,
} from '@/lib/tokko'
import ListaAlquileresSheet, { type AlquilerItem } from '@/components/agentes/ListaAlquileresSheet'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Alquileres para imprimir · SI INMOBILIARIA',
  robots: { index: false, follow: false },
}

// Precio de la operación de ALQUILER específicamente — no operacionPrincipal,
// que en una propiedad publicada en venta Y alquiler puede elegir la venta.
function proyectar(p: TokkoProperty): AlquilerItem | null {
  const op = (p.operations ?? []).find((o) => o.operation_type === 'Rent')
  if (!op) return null
  const pr = op.prices?.[0]
  const conPrecio = p.web_price !== false && !!pr?.price
  return {
    id: p.id,
    direccion: p.address || p.publication_title,
    ubicacion: formatLocation(p),
    tipoId: p.type?.id ?? null,
    foto: getMainPhoto(p),
    precio: conPrecio ? pr.price : null,
    moneda: conPrecio ? pr.currency : null,
    dormitorios: Number(p.suite_amount) || 0,
    banos: Number(p.bathroom_amount) || 0,
    superficie: getTotalSurface(p),
    cocheras: (Number(p.parking_lot_amount) || 0) + (Number(p.covered_parking_lot) || 0),
    referencia: p.reference_code || String(p.id),
  }
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
      .map(proyectar)
      .filter((i): i is AlquilerItem => i !== null)
  } catch (err) {
    console.error(
      '[lista-alquileres] Error fetching properties:',
      err instanceof Error ? err.message : err,
    )
  }

  const fecha = new Date().toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Argentina/Cordoba',
  })

  return <ListaAlquileresSheet items={items} fecha={fecha} />
}
