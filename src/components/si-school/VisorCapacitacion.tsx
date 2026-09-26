'use client'

// Modal que muestra una capacitación dentro de un <iframe> aislado (lo sirve
// /api/capacitaciones/[id], gateado). Lo usa la sección destacada de
// Capacitaciones en la home de SI School.

import { useEffect, useState } from 'react'
import { numeroCapacitacion, type Capacitacion } from './capacitaciones'

const POPPINS = 'var(--font-poppins), Poppins, system-ui, sans-serif'

export const paginaCapacitacion = (id: string) => `/recursos/si-school/capacitacion/${id}`

export default function VisorCapacitacion({ cap, onClose }: { cap: Capacitacion; onClose: () => void }) {
  // Clave de equipo con la que se entró (la usa el iframe para autorizarse en
  // la API; los agentes logueados ya pasan por su cookie).
  const [tc, setTc] = useState<string | null>(null)
  useEffect(() => {
    setTc(window.localStorage.getItem('si_team_access'))
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [onClose])

  const src = `/api/capacitaciones/${cap.id}${tc ? `?tc=${encodeURIComponent(tc)}` : ''}`

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={cap.titulo}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          width: '100%',
          maxWidth: 820,
          height: '88vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 16px', borderBottom: '1px solid #ececec' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <span style={{ flexShrink: 0, fontFamily: POPPINS, fontSize: 11.5, fontWeight: 700, color: '#fff', background: '#1A5C38', borderRadius: 6, padding: '3px 6px', fontVariantNumeric: 'tabular-nums' }}>
              {numeroCapacitacion(cap.id)}
            </span>
            <span style={{ fontFamily: POPPINS, fontSize: 14, fontWeight: 600, color: '#27272A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {cap.titulo}
            </span>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
            <a
              href={paginaCapacitacion(cap.id)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: POPPINS, fontSize: 12.5, fontWeight: 600, color: '#1A5C38', textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              Abrir en página ↗
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, lineHeight: 1, color: '#71717A', padding: 4 }}
            >
              ✕
            </button>
          </div>
        </div>
        <iframe src={src} title={cap.titulo} style={{ flex: 1, width: '100%', border: 'none', display: 'block' }} />
      </div>
    </div>
  )
}
