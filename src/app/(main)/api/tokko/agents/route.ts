import { NextResponse } from 'next/server'
import { getTokkoAgents } from '@/lib/tokko-agents'

export const revalidate = 86400 // 24h

export type { TokkoAgent } from '@/lib/tokko-agents'

export async function GET() {
  const { agents, cached } = await getTokkoAgents()

  // Sin agentes y sin API key = configuración incompleta; mantenemos la señal
  // 500 para monitoreo. Con key pero fetch fallido, devolvemos [] (el front cae
  // a fundadores + extras y no rompe).
  if (agents.length === 0 && !process.env.TOKKO_API_KEY) {
    return NextResponse.json({ error: 'TOKKO_API_KEY missing' }, { status: 500 })
  }

  return NextResponse.json({ agents, cached })
}
