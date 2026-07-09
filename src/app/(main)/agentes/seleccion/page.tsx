import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyAgentToken } from '@/lib/auth'
import AgentSeleccionPanel from '@/components/seleccion/AgentSeleccionPanel'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams?: {
    contactId?: string
    contactSource?: string
    name?: string
    phone?: string
    email?: string
  }
}

export default async function AgentesSeleccionPage({ searchParams }: Props) {
  const cookieStore = cookies()
  const token = cookieStore.get('si_agent_token')?.value
  if (!token) redirect('/agentes/login')

  const agent = await verifyAgentToken(token)
  if (!agent) redirect('/agentes/login')

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1160px] mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/agentes" className="text-gray-400 hover:text-gray-600 text-sm">&larr; Panel</a>
            <span className="text-gray-200">|</span>
            <span className="text-sm font-bold text-gray-900">Nueva selección</span>
          </div>
          <span className="text-xs text-gray-400">{agent.name}</span>
        </div>
      </div>

      <div className="max-w-[1160px] mx-auto px-4 py-8">
        <AgentSeleccionPanel
          initialContact={{
            contactId: searchParams?.contactId || searchParams?.email || searchParams?.phone || '',
            contactSource: searchParams?.contactSource || '',
            name: searchParams?.name || '',
            phone: searchParams?.phone || '',
            email: searchParams?.email || '',
          }}
        />
      </div>
    </div>
  )
}
