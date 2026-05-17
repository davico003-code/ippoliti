'use client'

import { useEffect, useState, type ReactNode } from 'react'

import type { CapacidadMeta } from '@/lib/si-school/types'
import { getDiasActivo, getLevel, initProgress } from '@/lib/si-school/progress'
import { CAPACIDADES_META } from '@/content/si-school/capacidades'
import CapacidadSidebar from './CapacidadSidebar'
import LevelCard from './LevelCard'
import MentorChatMock from './MentorChatMock'
import styles from './si-school.module.css'

interface Props {
  children: ReactNode
  activeCapacidadSlug?: string
  mentorThread?: { rol: 'mentor' | 'self'; texto: string }[]
}

export default function SiSchoolShell({
  children,
  activeCapacidadSlug,
  mentorThread,
}: Props) {
  const [levelNumber, setLevelNumber] = useState<number>(1)
  const [levelName, setLevelName] = useState<string>('Iniciado')
  const [days, setDays] = useState<number>(1)
  const [drawer, setDrawer] = useState<'caps' | 'mentor' | null>(null)
  const capacidades: CapacidadMeta[] = CAPACIDADES_META

  useEffect(() => {
    initProgress()
    const sync = () => {
      const lvl = getLevel()
      setLevelNumber(lvl.numero)
      setLevelName(lvl.nombre)
      setDays(getDiasActivo())
    }
    sync()
    window.addEventListener('si-school-progress-updated', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('si-school-progress-updated', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return (
    <div className={styles.root}>
      {/* Topbar */}
      <header className={styles.topbar}>
        <div className={styles.topbarBrand}>
          SI<span>·</span>School
        </div>
        <input
          type="search"
          className={styles.topbarSearch}
          placeholder="Buscar cápsula, caso o concepto… (próximamente)"
          aria-label="Buscar contenido"
          disabled
        />
        <div className={styles.topbarRight}>
          <span className={styles.levelPill}>
            Nivel {levelNumber} · {levelName}
          </span>
          <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, color: '#71717A' }}>
            Día {days}
          </span>
          <span className={styles.avatar} aria-hidden>
            SI
          </span>
        </div>
      </header>

      {/* Shell de 3 columnas */}
      <div className={styles.shell}>
        <CapacidadSidebar capacidades={capacidades} activeSlug={activeCapacidadSlug} />
        <main className={styles.center}>
          <div style={{ paddingBottom: 12 }}>
            <LevelCard />
          </div>
          {children}
        </main>
        <MentorChatMock thread={mentorThread} />
      </div>

      {/* Mobile triggers */}
      <div className={styles.mobileTriggers}>
        <button
          type="button"
          className={styles.mobileBtn}
          onClick={() => setDrawer('caps')}
          aria-label="Abrir capacidades"
        >
          Capacidades
        </button>
        <button
          type="button"
          className={`${styles.mobileBtn} ${styles.mobileBtnPrimary}`}
          onClick={() => setDrawer('mentor')}
          aria-label="Abrir mentor David"
        >
          Mentor
        </button>
      </div>

      {drawer && (
        <div
          className={styles.mobileSheet}
          onClick={(e) => {
            if (e.target === e.currentTarget) setDrawer(null)
          }}
        >
          <div className={styles.mobileSheetBody}>
            <button
              type="button"
              className={styles.mobileSheetClose}
              onClick={() => setDrawer(null)}
            >
              Cerrar ✕
            </button>
            {drawer === 'caps' ? (
              <CapacidadSidebar capacidades={capacidades} activeSlug={activeCapacidadSlug} />
            ) : (
              <MentorChatMock thread={mentorThread} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
