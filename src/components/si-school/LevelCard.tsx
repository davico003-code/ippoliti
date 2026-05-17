'use client'

import { useEffect, useState } from 'react'

import { getLevel, LEVELS } from '@/lib/si-school/progress'
import type { Level } from '@/lib/si-school/types'
import styles from './si-school.module.css'

export default function LevelCard() {
  const [level, setLevel] = useState<Level>(LEVELS[0])

  useEffect(() => {
    const sync = () => setLevel(getLevel())
    sync()
    window.addEventListener('si-school-progress-updated', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('si-school-progress-updated', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return (
    <div className={styles.levelCard}>
      <div className={styles.levelCardEyebrow}>Tu nivel</div>
      <div className={styles.levelCardTitle}>
        Nivel {level.numero} · {level.nombre}
      </div>
      <div className={styles.levelCardDesc}>{level.descripcion}</div>
      <div className={styles.levelSegments} aria-label={`Nivel ${level.numero} de 5`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            className={[styles.levelSeg, n <= level.numero ? styles.levelSegFilled : '']
              .filter(Boolean)
              .join(' ')}
          />
        ))}
      </div>
    </div>
  )
}
