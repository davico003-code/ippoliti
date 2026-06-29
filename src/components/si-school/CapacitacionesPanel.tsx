'use client'

// Columna derecha de SI School: reemplaza el chat mock de David por placas
// chicas de "Capacitaciones". Cada placa abre su HTML embebido en un modal
// con <iframe srcDoc> aislado. El contenido vive en ./capacitaciones.

import { useState } from 'react'
import styles from './si-school.module.css'
import { CAPACITACIONES } from './capacitaciones'

const POPPINS = 'var(--font-poppins), Poppins, system-ui, sans-serif'

export default function CapacitacionesPanel() {
  const [openId, setOpenId] = useState<string | null>(null)
  const activa = CAPACITACIONES.find((c) => c.id === openId) || null

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
            <button
              key={c.id}
              type="button"
              onClick={() => setOpenId(c.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 11,
                textAlign: 'left',
                background: '#fff',
                border: '1px solid var(--line, #E4E4E7)',
                borderRadius: 12,
                padding: 9,
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
            </button>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #ececec' }}>
              <span style={{ fontFamily: POPPINS, fontSize: 14, fontWeight: 600, color: '#27272A' }}>
                {activa.titulo}
              </span>
              <button
                type="button"
                onClick={() => setOpenId(null)}
                aria-label="Cerrar"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, lineHeight: 1, color: '#71717A', padding: 4 }}
              >
                ✕
              </button>
            </div>
            <iframe
              src={`/api/capacitaciones/${activa.id}`}
              title={activa.titulo}
              style={{ flex: 1, width: '100%', border: 'none', display: 'block' }}
            />
          </div>
        </div>
      )}
    </aside>
  )
}
