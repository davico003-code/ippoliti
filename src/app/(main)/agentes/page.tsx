import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyAgentToken } from '@/lib/auth'
import AgentDashboardV2 from '@/components/agentes/AgentDashboardV2'
import { getAllClientes } from '@/lib/clientes'
import { listAutorizaciones } from '@/lib/autorizaciones'
import { countNewsletterLeads } from '@/lib/leads'
import { redis } from '@/lib/redis'

export const dynamic = 'force-dynamic'

export default async function AgentesPage() {
  const cookieStore = cookies()
  const token = cookieStore.get('si_agent_token')?.value
  if (!token) redirect('/agentes/login')

  const agent = await verifyAgentToken(token)
  if (!agent) redirect('/agentes/login')

  // Newsletter solo se consulta para admins (la placa no se renderiza para
  // agentes comunes). Evita pegarle a Redis innecesariamente.
  const isAdmin = agent.role === 'admin'

  // Stats globales (Fase 1 sin scope por agente; TODO Fase 2: filtrar por agentId).
  const [clientes, autorizaciones, newsletter, feedbackCostos] = await Promise.all([
    getAllClientes().catch(() => []),
    listAutorizaciones({ status: 'all', limit: 200 }).catch(() => ({ items: [], hasMore: false })),
    isAdmin ? countNewsletterLeads() : Promise.resolve({ total: 0, esteMes: 0 }),
    // Feedback de caritas de la calculadora de costos (visible para todos)
    Promise.all([
      redis.get<number>('feedback:costos:up'),
      redis.get<number>('feedback:costos:mid'),
      redis.get<number>('feedback:costos:down'),
    ])
      .then(([up, mid, down]) => ({
        up: Number(up) || 0,
        mid: Number(mid) || 0,
        down: Number(down) || 0,
      }))
      .catch(() => ({ up: 0, mid: 0, down: 0 })),
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
      newsletterTotal={newsletter.total}
      newsletterEsteMes={newsletter.esteMes}
      feedbackCostos={feedbackCostos}
    />
  )
}
