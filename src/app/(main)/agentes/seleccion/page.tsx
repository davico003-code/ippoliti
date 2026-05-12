import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyAgentToken } from '@/lib/auth'
import { listarTodasSelecciones, listarSeleccionesPorAgente } from '@/lib/redis'
import AgentSeleccionPanel from '@/components/seleccion/AgentSeleccionPanel'

export const dynamic = 'force-dynamic'

export default async function AgentesSeleccionPage() {
  const cookieStore = cookies()
  const token = cookieStore.get('si_agent_token')?.value
  if (!token) redirect('/agentes/login')

  const agent = await verifyAgentToken(token)
  if (!agent) redirect('/agentes/login')

  const sessions = agent.role === 'admin'
    ? await listarTodasSelecciones()
    : await listarSeleccionesPorAgente(agent.id)

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/agentes" className="text-gray-400 hover:text-gray-600 text-sm">&larr; Panel</a>
            <span className="text-gray-200">|</span>
            <span className="text-sm font-bold text-gray-900">Selecciones</span>
          </div>
          <span className="text-xs text-gray-400">{agent.name}</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <AgentSeleccionPanel initialSessions={sessions as any[]} agentId={agent.id} />
      </div>
    </div>
  )
}
