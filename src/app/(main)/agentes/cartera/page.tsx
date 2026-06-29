// Análisis de cartera — embebe tal cual el dashboard "Panel de Acción"
// (HTML autocontenido con Chart.js y su dataset) que vive como estático en
// public/agentes/cartera-dashboard.html. Gateado por el JWT de agente.

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { verifyAgentToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Análisis de cartera · SI INMOBILIARIA',
  robots: { index: false, follow: false },
}

export default async function CarteraPage() {
  const token = cookies().get('si_agent_token')?.value
  if (!token) redirect('/agentes/login')
  const agent = await verifyAgentToken(token)
  if (!agent) redirect('/agentes/login')

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f4f7f4' }}>
      <div style={{ flexShrink: 0, padding: '10px 16px', borderBottom: '1px solid #e3ebe5', background: '#fff' }}>
        <Link
          href="/agentes"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'var(--font-poppins), Poppins, system-ui, sans-serif',
            fontSize: 13,
            fontWeight: 600,
            color: '#0e5a3c',
            textDecoration: 'none',
          }}
        >
          ← Volver al panel
        </Link>
      </div>
      <iframe
        src="/agentes/cartera-dashboard.html"
        title="Análisis de cartera"
        style={{ flex: 1, width: '100%', border: 'none', display: 'block' }}
      />
    </div>
  )
}
