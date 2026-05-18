import { NextResponse } from 'next/server'
import { getAgentFromCookies } from '@/lib/auth'

// Endpoint chico para que el Navbar (client) sepa si hay sesión sin obligar
// al layout (server) a leer cookies — esa lectura opta-out de cache toda la
// ruta y rompe ISR/SSG de pages como /propiedades/[slug] (DYNAMIC_SERVER_USAGE).
export const dynamic = 'force-dynamic'

export async function GET() {
  const agent = await getAgentFromCookies()
  return NextResponse.json({
    agent: agent ? { id: agent.id, name: agent.name, role: agent.role } : null,
  })
}
