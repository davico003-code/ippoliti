'use client'

// Columna derecha de SI School: lista numerada de "Capacitaciones". Cada placa
// abre su HTML embebido en un modal con <iframe> aislado (lo sirve
// /api/capacitaciones/[id], gateado). El contenido vive en ./capacitaciones.

import { useEffect, useState } from 'react'
import styles from './si-school.module.css'
import { CAPACITACIONES, numeroCapacitacion } from './capacitaciones'

const POPPINS = 'var(--font-poppins), Poppins, system-ui, sans-serif'

export default function CapacitacionesPanel() {
  const [openId, setOpenId] = useState<string | null>(null)
  const [tc, setTc] = useState<string | null>(null)
  const activa = CAPACITACIONES.find((c) => c.id === openId) || null

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
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setOpenId(null) }}
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
                  {numeroCapacitacion(activa.id)}
                </span>
                <span style={{ fontFamily: POPPINS, fontSize: 14, fontWeight: 600, color: '#27272A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {activa.titulo}
                </span>
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                <a
                  href={pageHref(activa.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontFamily: POPPINS, fontSize: 12.5, fontWeight: 600, color: '#1A5C38', textDecoration: 'none', whiteSpace: 'nowrap' }}
                >
                  Abrir en página ↗
                </a>
                <button
                  type="button"
                  onClick={() => setOpenId(null)}
                  aria-label="Cerrar"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, lineHeight: 1, color: '#71717A', padding: 4 }}
                >
                  ✕
                </button>
              </div>
            </div>
            <iframe
              src={apiSrc(activa.id)}
              title={activa.titulo}
              style={{ flex: 1, width: '100%', border: 'none', display: 'block' }}
            />
          </div>
        </div>
      )}
    </aside>
  )
}
