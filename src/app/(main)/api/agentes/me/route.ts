import { NextResponse } from 'next/server'
import { getAgentFromCookies } from '@/lib/auth'
import { getAgentePhoto } from '@/lib/agente-foto'

// Endpoint chico para que el Navbar (client) sepa si hay sesión sin obligar
// al layout (server) a leer cookies — esa lectura opta-out de cache toda la
// ruta y rompe ISR/SSG de pages como /propiedades/[slug] (DYNAMIC_SERVER_USAGE).
export const dynamic = 'force-dynamic'

export async function GET() {
  const agent = await getAgentFromCookies()
  if (!agent) return NextResponse.json({ agent: null })
  // Foto de perfil del agente (curada en /public/team, fallback Tokko). Para los
  // agentes del equipo resuelve instantáneo desde el mapa local, sin red.
  const foto = await getAgentePhoto(agent.name)
  return NextResponse.json({
    agent: { id: agent.id, name: agent.name, role: agent.role, foto },
  })
}
