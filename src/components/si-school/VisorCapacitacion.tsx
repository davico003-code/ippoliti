'use client'

// Visor a pantalla completa de una capacitación (<iframe> aislado que sirve
// /api/capacitaciones/[id]). Va por portal a <body>: dentro de columnas
// sticky un modal quedaba debajo del Navbar, con el título y el cerrar
// tapados. Lo usan la sección destacada de la home y el panel lateral.

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { numeroCapacitacion, type Capacitacion } from './capacitaciones'
import styles from './si-school.module.css'

const POPPINS = 'var(--font-poppins), Poppins, system-ui, sans-serif'

export const paginaCapacitacion = (id: string) => `/recursos/si-school/capacitacion/${id}`

export default function VisorCapacitacion({ cap, onClose }: { cap: Capacitacion; onClose: () => void }) {
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={cap.titulo}
      style={{ position: 'fixed', inset: 0, zIndex: 10000, background: '#0d2f1d', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 12px 10px 16px', background: '#fff', borderBottom: '1px solid #ececec' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ flexShrink: 0, fontFamily: POPPINS, fontSize: 12, fontWeight: 700, color: '#fff', background: '#1A5C38', borderRadius: 6, padding: '4px 7px', fontVariantNumeric: 'tabular-nums' }}>
            {numeroCapacitacion(cap.id)}
          </span>
          <span style={{ fontFamily: 'var(--font-raleway), Raleway, system-ui, sans-serif', fontSize: 15, fontWeight: 700, color: '#18181B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {cap.titulo}
          </span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <a href={paginaCapacitacion(cap.id)} target="_blank" rel="noopener noreferrer" className={styles.visorLink}>
            Abrir en página ↗
          </a>
          <button type="button" onClick={onClose} className={styles.visorCerrar}>
            Cerrar ✕
          </button>
        </div>
      </div>
      <iframe src={`/api/capacitaciones/${cap.id}`} title={cap.titulo} allow="fullscreen" style={{ flex: 1, width: '100%', border: 'none', display: 'block' }} />
    </div>,
    document.body,
  )
}
