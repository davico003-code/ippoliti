'use client'

import { useEffect, useState } from 'react'

import { isTourDone, markTourDone } from '@/lib/si-school/progress'
import styles from './content.module.css'

const STEPS: { eyebrow: string; titulo: string; cuerpo: string }[] = [
  {
    eyebrow: 'Paso 1 de 5',
    titulo: 'Bienvenido a SI School',
    cuerpo:
      'Este es el sistema operativo del agente SI. No es un curso: es la forma en que vamos a trabajar todos los días durante los próximos meses. Cápsulas cortas, criterios concretos, decisiones reales.',
  },
  {
    eyebrow: 'Paso 2 de 5',
    titulo: 'Las 6 capacidades',
    cuerpo:
      'En la columna izquierda vas a ver el programa entero. Cada capacidad se desbloquea cuando demostrás que la dominás — no cuando terminás de leer. Empezás por la I.',
  },
  {
    eyebrow: 'Paso 3 de 5',
    titulo: 'El panel central',
    cuerpo:
      'Acá vas a leer cápsulas y resolver casos. Marcá una cápsula como leída solo cuando la entendiste. Cada caso te pide que defiendas tu criterio por escrito.',
  },
  {
    eyebrow: 'Paso 4 de 5',
    titulo: 'Cómo funcionan las cápsulas',
    cuerpo:
      'Son cortas a propósito: 2 a 4 minutos cada una. Léelas entre llamado y llamado. Si una sección te dispara algo, anotalo o mandáselo al Mentor.',
  },
  {
    eyebrow: 'Paso 5 de 5',
    titulo: 'Mentor David · a la derecha',
    cuerpo:
      'A la derecha vas a ver al Mentor David. Por ahora está en modo demo — su versión interactiva llega en la Fase 2. Tus respuestas a los casos quedan guardadas y las va a evaluar cuando se active.',
  },
]

export default function WelcomeTour() {
  const [open, setOpen] = useState(false)
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!isTourDone()) setOpen(true)
  }, [])

  if (!open) return null

  const step = STEPS[idx]
  const isLast = idx === STEPS.length - 1

  const closeTour = () => {
    markTourDone()
    setOpen(false)
  }

  return (
    <div className={styles.tourOverlay} role="dialog" aria-modal="true">
      <div className={styles.tourCard}>
        <div className={styles.tourEyebrow}>{step.eyebrow}</div>
        <h2 className={styles.tourTitle}>{step.titulo}</h2>
        <p className={styles.tourBody}>{step.cuerpo}</p>
        <div className={styles.tourFooter}>
          <div className={styles.tourDots} aria-hidden>
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`${styles.tourDot} ${i === idx ? styles.tourDotActive : ''}`}
              />
            ))}
          </div>
          <div className={styles.tourBtns}>
            <button
              type="button"
              className={styles.btnGhost}
              onClick={closeTour}
            >
              Saltar
            </button>
            {!isLast ? (
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => setIdx((n) => Math.min(STEPS.length - 1, n + 1))}
              >
                Siguiente
              </button>
            ) : (
              <button type="button" className={styles.btnPrimary} onClick={closeTour}>
                Arrancar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
