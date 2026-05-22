// Server-side gate por role admin para la vista "Suscriptores Newsletter".
// El layout /agentes ya valida la cookie JWT; acá filtramos por rol.

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyAgentToken } from '@/lib/auth'
import { listNewsletterLeads } from '@/lib/leads'
import NewsletterClient from '@/components/agentes/NewsletterClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Suscriptores Newsletter · SI INMOBILIARIA',
  robots: { index: false, follow: false },
}

export default async function NewsletterAdminPage() {
  const cookieStore = cookies()
  const token = cookieStore.get('si_agent_token')?.value
  if (!token) redirect('/agentes/login')

  const agent = await verifyAgentToken(token)
  if (!agent) redirect('/agentes/login')
  if (agent.role !== 'admin') redirect('/agentes')

  // Pre-render con la lista actual; el cliente puede refrescar manualmente.
  const items = await listNewsletterLeads().catch(() => [])

  return <NewsletterClient initialItems={items} />
}
