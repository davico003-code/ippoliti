// Página propia (link compartible) de una capacitación. Si el agente está
// logueado (cookie JWT) abre directo; si no, se pide la clave de equipo.
// El contenido lo sirve /api/capacitaciones/[id] (gateado).

import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { verifyAgentToken } from '@/lib/auth'
import { CAPACITACIONES } from '@/components/si-school/capacitaciones'
import CapacitacionVista from './CapacitacionVista'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Capacitación · SI INMOBILIARIA',
  robots: { index: false, follow: false, nocache: true },
}

export default async function CapacitacionPage({ params }: { params: { slug: string } }) {
  const cap = CAPACITACIONES.find((c) => c.id === params.slug)
  if (!cap) notFound()

  const token = cookies().get('si_agent_token')?.value
  const agent = token ? await verifyAgentToken(token) : null

  return <CapacitacionVista id={cap.id} titulo={cap.titulo} isAgent={!!agent} />
}
