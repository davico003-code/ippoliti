'use client'

// Columna derecha de SI School: lista numerada de "Capacitaciones". Cada placa
// abre su HTML embebido a pantalla completa en un <iframe> aislado (lo sirve
// /api/capacitaciones/[id], gateado). El contenido vive en ./capacitaciones.

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './si-school.module.css'
import { CAPACITACIONES, numeroCapacitacion } from './capacitaciones'

const POPPINS = 'var(--font-poppins), Poppins, system-ui, sans-serif'

export default function CapacitacionesPanel() {
  const [openId, setOpenId] = useState<string | null>(null)
  const [tc, setTc] = useState<string | null>(null)
  const activa = CAPACITACIONES.find((c) => c.id === openId) || null
  const cerrar = useCallback(() => setOpenId(null), [])

  // Clave de equipo con la que se entró a SI School (la usa el iframe para
  // autorizarse en la API; los agentes logueados ya pasan por su cookie).
  useEffect(() => {
    setTc(typeof window !== 'undefined' ? window.localStorage.getItem('si_team_access') : null)
  }, [])

  const apiSrc = (id: string) => `/api/capacitaciones/${id}${tc ? `?tc=${encodeURIComponent(tc)}` : ''}`
  const pageHref = (id: string) => `/recursos/si-school/capacitacion/${id}`

  return (
    <aside className={styles.mentor} aria-label="Capacitaciones">
      <header className={styles.capsHead}>
        <div className={styles.capsTitleRow}>
          <h2 className={styles.capsTitle}>Capacitaciones</h2>
          {CAPACITACIONES.length > 0 && <span className={styles.capsCount}>{CAPACITACIONES.length}</span>}
        </div>
        <p className={styles.capsSub}>Las presentaciones del equipo, en orden. Tocá una para verla acá.</p>
      </header>

      {CAPACITACIONES.length === 0 ? (
        <p style={{ fontFamily: POPPINS, fontSize: 12.5, color: '#A1A1AA', lineHeight: 1.5, margin: 0 }}>
          Pronto vas a tener tus capacitaciones acá.
        </p>
      ) : (
        <div className={styles.capsList}>
          {CAPACITACIONES.map((c, i) => (
            <div
              key={c.id}
              role="button"
              tabIndex={0}
              className={styles.capsCard}
              onClick={() => setOpenId(c.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenId(c.id) } }}
              aria-label={`Capacitación ${i + 1}: ${c.titulo}`}
            >
              <span className={styles.capsThumb}>
                {c.imagen && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.imagen} alt="" width={92} height={69} loading="lazy" />
                )}
                <span className={styles.capsNum}>{String(i + 1).padStart(2, '0')}</span>
              </span>
              <span className={styles.capsBody}>
                {c.etiqueta && <span className={styles.capsTag}>{c.etiqueta}</span>}
                <span className={styles.capsCardTitle}>{c.titulo}</span>
                {c.bajada && <span className={styles.capsBajada}>{c.bajada}</span>}
              </span>
              <a
                href={pageHref(c.id)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                title="Abrir en su propia página"
                aria-label="Abrir en su propia página"
                className={styles.capsOpen}
              >
                ↗
              </a>
            </div>
          ))}
        </div>
      )}

      {activa && (
        <VisorCapacitacion
          numero={numeroCapacitacion(activa.id)}
          titulo={activa.titulo}
          src={apiSrc(activa.id)}
          pageHref={pageHref(activa.id)}
          onClose={cerrar}
        />
      )}
    </aside>
  )
}

// Visor a pantalla completa. Va por portal a <body>: la columna derecha es
// sticky (crea su propio contexto de apilado) y un modal adentro quedaba
// debajo del Navbar, con la barra de título y el cerrar tapados.
function VisorCapacitacion({
  numero,
  titulo,
  src,
  pageHref,
  onClose,
}: {
  numero: string
  titulo: string
  src: string
  pageHref: string
  onClose: () => void
}) {
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
      aria-label={titulo}
      style={{ position: 'fixed', inset: 0, zIndex: 10000, background: '#0d2f1d', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 12px 10px 16px', background: '#fff', borderBottom: '1px solid #ececec' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ flexShrink: 0, fontFamily: POPPINS, fontSize: 12, fontWeight: 700, color: '#fff', background: '#1A5C38', borderRadius: 6, padding: '4px 7px', fontVariantNumeric: 'tabular-nums' }}>
            {numero}
          </span>
          <span style={{ fontFamily: 'var(--font-raleway), Raleway, system-ui, sans-serif', fontSize: 15, fontWeight: 700, color: '#18181B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {titulo}
          </span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <a
            href={pageHref}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.visorLink}
          >
            Abrir en página ↗
          </a>
          <button type="button" onClick={onClose} className={styles.visorCerrar}>
            Cerrar ✕
          </button>
        </div>
      </div>
      <iframe src={src} title={titulo} allow="fullscreen" style={{ flex: 1, width: '100%', border: 'none', display: 'block' }} />
    </div>,
    document.body,
  )
}
