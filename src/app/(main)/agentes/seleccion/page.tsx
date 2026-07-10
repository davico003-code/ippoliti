import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyAgentToken } from '@/lib/auth'
import AgentSeleccionPanel from '@/components/seleccion/AgentSeleccionPanel'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams?: {
    contactId?: string
    contactoId?: string
    hiloContactId?: string
    leadId?: string
    id?: string
    contactSource?: string
    source?: string
    origen?: string
    name?: string
    nombre?: string
    clientName?: string
    phone?: string
    whatsapp?: string
    telefono?: string
    tel?: string
    clientPhone?: string
    email?: string
    clientEmail?: string
  }
}

function firstValue(...values: Array<string | undefined>) {
  return values.find(value => typeof value === 'string' && value.trim())?.trim() || ''
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
            contactId: firstValue(
              searchParams?.contactId,
              searchParams?.contactoId,
              searchParams?.hiloContactId,
              searchParams?.leadId,
              searchParams?.id,
              searchParams?.email,
              searchParams?.whatsapp,
              searchParams?.phone,
              searchParams?.telefono,
            ),
            contactSource: firstValue(searchParams?.contactSource, searchParams?.source, searchParams?.origen),
            name: firstValue(searchParams?.name, searchParams?.nombre, searchParams?.clientName),
            phone: firstValue(searchParams?.phone, searchParams?.whatsapp, searchParams?.telefono, searchParams?.tel, searchParams?.clientPhone),
            email: firstValue(searchParams?.email, searchParams?.clientEmail),
          }}
        />
      </div>
    </div>
  )
}
