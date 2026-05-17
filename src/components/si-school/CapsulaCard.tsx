'use client'

import { useEffect, useState } from 'react'

import type { Capsula } from '@/lib/si-school/types'
import { getProgress, markCapsulaDone } from '@/lib/si-school/progress'
import styles from './content.module.css'

interface Props {
  capSlug: string
  capsula: Capsula
  defaultOpen?: boolean
}

export default function CapsulaCard({ capSlug, capsula, defaultOpen = false }: Props) {
  const [open, setOpen] = useState<boolean>(defaultOpen)
  const [done, setDone] = useState<boolean>(false)

  useEffect(() => {
    const sync = () => {
      const p = getProgress()
      setDone(p.capsulasCompletadas.includes(`${capSlug}/${capsula.slug}`))
    }
    sync()
    window.addEventListener('si-school-progress-updated', sync)
    return () => window.removeEventListener('si-school-progress-updated', sync)
  }, [capSlug, capsula.slug])

  const handleMarkDone = () => {
    markCapsulaDone(capSlug, capsula.slug)
  }

  return (
    <article
      className={[styles.capsulaCard, done ? styles.capsulaCardDone : '']
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles.capsulaNum} aria-hidden>
        {done ? '✓' : String(capsula.numero).padStart(2, '0')}
      </div>
      <div className={styles.capsulaBody}>
        <h4 className={styles.capsulaTitle}>{capsula.titulo}</h4>
        <div className={styles.capsulaMeta}>
          {capsula.tipo === 'lectura' ? 'Lectura' : 'Práctica'} · {capsula.tiempoMin} min
          {done && ' · Completada'}
        </div>

        {open && (
          <>
            <hr style={{ border: 0, borderTop: '1px solid #E4E4E7', margin: '14px 0' }} />
            <div
              className={styles.prose}
              dangerouslySetInnerHTML={{ __html: capsula.contenidoHtml }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              {!done && (
                <button type="button" className={styles.btnPrimary} onClick={handleMarkDone}>
                  Marcar como leída
                </button>
              )}
              <button
                type="button"
                className={styles.btnGhost}
                onClick={() => setOpen(false)}
              >
                Cerrar
              </button>
            </div>
          </>
        )}
      </div>
      {!open && (
        <div className={styles.capsulaActions}>
          <button type="button" className={styles.btnPrimary} onClick={() => setOpen(true)}>
            {done ? 'Releer' : 'Empezar'}
          </button>
        </div>
      )}
    </article>
  )
}
