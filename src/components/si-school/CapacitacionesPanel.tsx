'use client'

// Columna derecha de SI School: reemplaza el chat mock de David por placas
// chicas de "Capacitaciones". Cada placa abre su HTML embebido en un modal
// con <iframe srcDoc> aislado. El contenido vive en ./capacitaciones.

import { useEffect, useState } from 'react'
import styles from './si-school.module.css'
import { CAPACITACIONES } from './capacitaciones'

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
      <div
        style={{
          fontFamily: POPPINS,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.08em',
          color: '#71717A',
          textTransform: 'uppercase',
          marginBottom: 12,
        }}
      >
        Capacitaciones
      </div>

      {CAPACITACIONES.length === 0 ? (
        <p style={{ fontFamily: POPPINS, fontSize: 12.5, color: '#A1A1AA', lineHeight: 1.5, margin: 0 }}>
          Pronto vas a tener tus capacitaciones acá.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {CAPACITACIONES.map((c) => (
            <div
              key={c.id}
              role="button"
              tabIndex={0}
              onClick={() => setOpenId(c.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenId(c.id) } }}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 11,
                textAlign: 'left',
                background: '#fff',
                border: '1px solid var(--line, #E4E4E7)',
                borderRadius: 12,
                padding: 9,
                paddingRight: 30,
                cursor: 'pointer',
                transition: 'border-color .15s, box-shadow .15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1A5C38'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(26,92,56,.08)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line, #E4E4E7)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              {c.imagen && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.imagen}
                  alt=""
                  width={52}
                  height={52}
                  style={{ width: 52, height: 52, borderRadius: 9, objectFit: 'cover', flexShrink: 0 }}
                />
              )}
              <span style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                {c.etiqueta && (
                  <span style={{ fontFamily: POPPINS, fontSize: 9, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: '#1A5C38', background: 'rgba(26,92,56,.08)', borderRadius: 6, padding: '2px 7px', alignSelf: 'flex-start' }}>
                    {c.etiqueta}
                  </span>
                )}
                <span style={{ fontFamily: POPPINS, fontSize: 13, fontWeight: 600, color: '#27272A', lineHeight: 1.3 }}>
                  {c.titulo}
                </span>
              </span>
              <a
                href={pageHref(c.id)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                title="Abrir en su propia página"
                aria-label="Abrir en su propia página"
                style={{ position: 'absolute', top: 8, right: 8, fontFamily: POPPINS, fontSize: 13, color: '#A1A1AA', textDecoration: 'none', lineHeight: 1, padding: 2 }}
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
              <span style={{ fontFamily: POPPINS, fontSize: 14, fontWeight: 600, color: '#27272A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activa.titulo}
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
