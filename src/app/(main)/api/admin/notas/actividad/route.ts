import { NextResponse } from 'next/server'
import { assertTeamCode } from '@/lib/team-auth'
import { leerActividad } from '@/agents/blog/lib/actividad'

export const dynamic = 'force-dynamic'

// Feed de actividad del pipeline autónomo del blog (blog:actividad en Redis).
// Lo consume /admin/notas para mostrar publicaciones automáticas, fallbacks
// a evergreen y errores — reemplazo de las viejas notificaciones por WhatsApp.
export async function GET(req: Request) {
  const unauth = assertTeamCode(req)
  if (unauth) return unauth

  const items = await leerActividad()
  return NextResponse.json({ ok: true, items })
}
