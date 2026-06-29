'use client'

import { useEffect, useState, type ReactNode } from 'react'

import type { CapacidadMeta } from '@/lib/si-school/types'
import { getDiasActivo, getLevel, initProgress } from '@/lib/si-school/progress'
import { CAPACIDADES_META } from '@/content/si-school/capacidades'
import CapacidadSidebar from './CapacidadSidebar'
import LevelCard from './LevelCard'
import CapacitacionesPanel from './CapacitacionesPanel'
import styles from './si-school.module.css'

interface Props {
  children: ReactNode
  activeCapacidadSlug?: string
  // Se mantiene por compatibilidad con las páginas que aún lo pasan; el chat
  // mock de David se reemplazó por el panel de Capacitaciones.
  mentorThread?: { rol: 'mentor' | 'self'; texto: string }[]
}

export default function SiSchoolShell({
  children,
  activeCapacidadSlug,
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
        <CapacitacionesPanel />
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
          aria-label="Abrir capacitaciones"
        >
          Capacitaciones
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
              <CapacitacionesPanel />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
