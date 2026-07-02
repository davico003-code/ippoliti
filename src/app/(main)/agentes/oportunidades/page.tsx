// Gestor del popup de Oportunidades (solo admin): elegí propiedades y su
// gancho comercial; se muestran en el popup esquinero del sitio público.

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyAgentToken } from '@/lib/auth'
import { listOportunidades } from '@/lib/oportunidades'
import OportunidadesManager from '@/components/agentes/OportunidadesManager'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Oportunidades · SI INMOBILIARIA',
  robots: { index: false, follow: false },
}

export default async function OportunidadesPage() {
  const token = cookies().get('si_agent_token')?.value
  if (!token) redirect('/agentes/login')
  const agent = await verifyAgentToken(token)
  if (!agent) redirect('/agentes/login')
  if (agent.role !== 'admin') redirect('/agentes')

  const items = await listOportunidades()
  return <OportunidadesManager initialItems={items} />
}
