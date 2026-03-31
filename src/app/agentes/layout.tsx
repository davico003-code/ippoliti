import { cookies } from 'next/headers'
import { verifyAgentToken } from '@/lib/auth'
import AgentShell from '@/components/seleccion/AgentShell'

export const dynamic = 'force-dynamic'

export default async function AgentesLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies()
  const token = cookieStore.get('si_agent_token')?.value

  // Login page renders without shell
  if (!token) return <>{children}</>

  const agent = await verifyAgentToken(token)
  if (!agent) return <>{children}</>

  return (
    <AgentShell agentName={agent.name} agentRole={agent.role}>
      {children}
    </AgentShell>
  )
}
