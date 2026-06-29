// Análisis de cartera / reporte de mercado. Destino del botón "Ver análisis"
// del panel. Por ahora placeholder: acá se va a embeber el HTML del reporte
// que provea David. Gateado por el JWT de agente.

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
    <div style={{ background: '#FAFAFA', minHeight: '100vh', fontFamily: 'var(--font-raleway), Raleway, system-ui, sans-serif' }}>
      <main style={{ maxWidth: 880, margin: '0 auto', padding: 'clamp(24px, 4vw, 48px) clamp(18px, 4vw, 32px) 80px' }}>
        <Link
          href="/agentes"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-poppins), Poppins, system-ui, sans-serif', fontSize: 12.5, color: '#71717A', textDecoration: 'none', marginBottom: 22 }}
        >
          ← Volver al panel
        </Link>

        <div style={{ background: '#fff', border: '1px solid #E4E4E7', borderRadius: 16, padding: '48px 28px', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-raleway), Raleway, system-ui, sans-serif', fontWeight: 700, fontSize: 'clamp(22px, 3vw, 28px)', margin: '0 0 8px', color: '#1c1c1e' }}>
            Análisis de cartera
          </h1>
          <p style={{ fontFamily: 'var(--font-poppins), Poppins, system-ui, sans-serif', fontWeight: 300, fontSize: 14, color: '#52525B', maxWidth: 420, margin: '0 auto' }}>
            En preparación. Acá va a vivir el reporte de mercado y el análisis de tu cartera.
          </p>
        </div>
      </main>
    </div>
  )
}
