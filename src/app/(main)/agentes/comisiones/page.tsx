// Calculadora de comisiones del agente (Ventas · Alquileres · Objetivos).
// El layout /agentes ya valida la cookie JWT; acá basta con confirmar que hay
// un agente válido (cualquier rol). Sin scope admin.

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyAgentToken } from '@/lib/auth'
import ComisionesCalculadoras from '@/components/agentes/ComisionesCalculadoras'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Calculadora de comisiones · SI INMOBILIARIA',
  robots: { index: false, follow: false },
}

export default async function ComisionesPage() {
  const cookieStore = cookies()
  const token = cookieStore.get('si_agent_token')?.value
  if (!token) redirect('/agentes/login')

  const agent = await verifyAgentToken(token)
  if (!agent) redirect('/agentes/login')

  return <ComisionesCalculadoras />
}
