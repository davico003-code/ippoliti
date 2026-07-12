// Stock de Colegas — el MLS privado (solo admin).
//
// TODO el inventario relevado y deduplicado de los 9 barrios (Zonaprop +
// Argenprop), refrescado a diario por el motor de Cowork. Esta página NUNCA
// busca en vivo: lee el feed ya verificado desde Redis → abre instantáneo.

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyAgentToken } from '@/lib/auth'
import { getStockFeed, getStockMeta, getOppFeed } from '@/lib/stock-colegas'
import StockColegasExplorer from '@/components/agentes/StockColegasExplorer'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Stock de Colegas · SI INMOBILIARIA',
  robots: { index: false, follow: false },
}

export default async function StockColegasPage() {
  const token = cookies().get('si_agent_token')?.value
  if (!token) redirect('/agentes/login')
  const agent = await verifyAgentToken(token)
  if (!agent) redirect('/agentes/login')
  if (agent.role !== 'admin') redirect('/agentes')

  const [feed, meta, opp] = await Promise.all([getStockFeed(), getStockMeta(), getOppFeed()])

  // Fotos de las frutillas (el stock ancho no trae foto): mapa (portal:id) → url
  const fotos: Record<string, string> = {}
  if (opp) {
    for (const o of opp.oportunidades) {
      if (o.fotos && o.fotos[0]) fotos[`${o.portal}:${o.id}`] = o.fotos[0]
    }
  }

  if (!feed) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-navy">Stock de Colegas</h1>
        <p className="mt-4 text-navy-400">
          Todavía no llegó ningún feed del motor. El diario de las 13:09 lo envía solo
          (POST /api/stock/sync); también podés dispararlo desde Cowork con
          &ldquo;mandá el stock a Hilo&rdquo;.
        </p>
      </div>
    )
  }

  return <StockColegasExplorer feed={feed} meta={meta} fotos={fotos} />
}
