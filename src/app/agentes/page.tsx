import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyAgentToken } from '@/lib/auth'
import AgentDashboard from '@/components/seleccion/AgentDashboard'

export const dynamic = 'force-dynamic'

export default async function AgentesPage() {
  const cookieStore = cookies()
  const token = cookieStore.get('si_agent_token')?.value
  if (!token) redirect('/agentes/login')

  const agent = await verifyAgentToken(token)
  if (!agent) redirect('/agentes/login')

  return <AgentDashboard agentId={agent.id} agentName={agent.name} agentRole={agent.role} />
}
