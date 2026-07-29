// Panel de control del plano de Distrito Roldán — embebe tal cual la
// herramienta autocontenida que vive como estático en
// public/agentes/panel-lotes-distrito-roldan.html. Gateado por el JWT de agente,
// igual que /agentes/cartera.
//
// Qué hace: permite editar frente, fondo, superficie, precio y estado
// (disponible / no disponible / vendido) de los 180 lotes, y descargar el plano
// actualizado listo para reemplazar public/planos/distrito-roldan.html.

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { verifyAgentToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Plano de lotes · Distrito Roldán · SI INMOBILIARIA',
  robots: { index: false, follow: false },
}

export default async function PlanoDistritoRoldanPage() {
  const token = cookies().get('si_agent_token')?.value
  if (!token) redirect('/agentes/login')
  const agent = await verifyAgentToken(token)
  if (!agent) redirect('/agentes/login')

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#F4F1EA' }}>
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
        src="/agentes/panel-lotes-distrito-roldan.html"
        title="Panel de control del plano de lotes — Distrito Roldán"
        style={{ flex: 1, width: '100%', border: 'none', display: 'block' }}
      />
    </div>
  )
}
