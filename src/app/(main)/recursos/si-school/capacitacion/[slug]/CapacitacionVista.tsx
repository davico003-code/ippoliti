'use client'

import Link from 'next/link'

const POPPINS = 'var(--font-poppins), Poppins, system-ui, sans-serif'

function Vista({ id, titulo }: { id: string; titulo: string }) {
  const src = `/api/capacitaciones/${id}`
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <div style={{ flexShrink: 0, padding: '10px 16px', borderBottom: '1px solid #e3ebe5', display: 'flex', alignItems: 'center', gap: 14 }}>
        <Link
          href="/recursos/si-school"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: POPPINS, fontSize: 13, fontWeight: 600, color: '#1A5C38', textDecoration: 'none', whiteSpace: 'nowrap' }}
        >
          ← SI School
        </Link>
        <span style={{ fontFamily: POPPINS, fontSize: 13, color: '#71717A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {titulo}
        </span>
      </div>
      <iframe src={src} title={titulo} style={{ flex: 1, width: '100%', border: 'none', display: 'block' }} />
    </div>
  )
}

// Acceso libre: SI School ya no pide clave (pedido de David, 26-sep-2026).
export default function CapacitacionVista({ id, titulo }: { id: string; titulo: string }) {
  return <Vista id={id} titulo={titulo} />
}
