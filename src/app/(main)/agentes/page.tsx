import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyAgentToken } from '@/lib/auth'
import AgentDashboardV2 from '@/components/agentes/AgentDashboardV2'
import { getAllClientes } from '@/lib/clientes'
import { listAutorizaciones } from '@/lib/autorizaciones'

export const dynamic = 'force-dynamic'

export default async function AgentesPage() {
  const cookieStore = cookies()
  const token = cookieStore.get('si_agent_token')?.value
  if (!token) redirect('/agentes/login')

  const agent = await verifyAgentToken(token)
  if (!agent) redirect('/agentes/login')

  // Stats globales (Fase 1 sin scope por agente; TODO Fase 2: filtrar por agentId).
  const [clientes, autorizaciones] = await Promise.all([
    getAllClientes().catch(() => []),
    listAutorizaciones({ status: 'all', limit: 200 }).catch(() => ({ items: [], hasMore: false })),
  ])

  // Autorizaciones creadas este mes.
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
  const autorizacionesEsteMes = autorizaciones.items.filter((a) => {
    const t = Date.parse(a.created_at)
    return Number.isFinite(t) && t >= startOfMonth
  }).length

  return (
    <AgentDashboardV2
      agentName={agent.name}
      agentRole={agent.role}
      clientesEnCartera={clientes.length}
      autorizacionesEsteMes={autorizacionesEsteMes}
    />
  )
}
