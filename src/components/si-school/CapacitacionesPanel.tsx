'use client'

// Columna derecha de SI School: lista numerada de "Capacitaciones". Cada placa
// abre su HTML embebido a pantalla completa en un <iframe> aislado (lo sirve
// /api/capacitaciones/[id]). El contenido vive en ./capacitaciones.

import { useCallback, useState } from 'react'
import styles from './si-school.module.css'
import { CAPACITACIONES } from './capacitaciones'
import VisorCapacitacion, { paginaCapacitacion } from './VisorCapacitacion'

const POPPINS = 'var(--font-poppins), Poppins, system-ui, sans-serif'

export default function CapacitacionesPanel() {
  const [openId, setOpenId] = useState<string | null>(null)
  const activa = CAPACITACIONES.find((c) => c.id === openId) || null
  const cerrar = useCallback(() => setOpenId(null), [])



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
                href={paginaCapacitacion(c.id)}
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

      {activa && <VisorCapacitacion cap={activa} onClose={cerrar} />}
    </aside>
  )
}
