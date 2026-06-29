'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import TeamCodeGate from '@/components/si-school/TeamCodeGate'
import SiSchoolShell from '@/components/si-school/SiSchoolShell'
import WelcomeTour from '@/components/si-school/WelcomeTour'
import MentorWelcomeCard from '@/components/si-school/MentorWelcomeCard'
import type { CapacidadMeta } from '@/lib/si-school/types'
import { getProgress, initProgress } from '@/lib/si-school/progress'
import shell from '@/components/si-school/si-school.module.css'
import styles from '@/components/si-school/content.module.css'

const TOTAL_CAPSULAS: Record<string, number> = {
  'capacidad-01': 7,
  'capacidad-02': 5,
  'capacidad-03': 7,
  'capacidad-04': 9,
  'capacidad-05': 8,
  'capacidad-06': 6,
}

// Un pastel por capacidad: fondo suave + tinta legible para el número.
const PASTELES: { bg: string; ink: string }[] = [
  { bg: '#E8F4EC', ink: '#1A5C38' }, // verde
  { bg: '#E7F0FB', ink: '#2B5C9B' }, // azul
  { bg: '#F0EAFB', ink: '#5B46A8' }, // lavanda
  { bg: '#FCEBE3', ink: '#B5562F' }, // durazno
  { bg: '#FBF4D9', ink: '#917512' }, // mantequilla
  { bg: '#FBE9F0', ink: '#A83C66' }, // rosa
]

interface Props {
  capacidades: CapacidadMeta[]
}

export default function SiSchoolOverviewClient({ capacidades }: Props) {
  return (
    <TeamCodeGate>
      {() => (
        <SiSchoolShell>
          <Overview capacidades={capacidades} />
          <WelcomeTour />
        </SiSchoolShell>
      )}
    </TeamCodeGate>
  )
}

function Overview({ capacidades }: { capacidades: CapacidadMeta[] }) {
  const [completedMap, setCompletedMap] = useState<Record<string, number>>({})
  const [currentSlug, setCurrentSlug] = useState<string>('capacidad-01')

  useEffect(() => {
    initProgress()
    const sync = () => {
      const p = getProgress()
      const map: Record<string, number> = {}
      for (const cap of capacidades) {
        const total = TOTAL_CAPSULAS[cap.slug] ?? 0
        const done = p.capsulasCompletadas.filter((k) => k.startsWith(`${cap.slug}/`)).length
        map[cap.slug] = total > 0 ? done / total : 0
      }
      setCompletedMap(map)
      setCurrentSlug(p.currentCapacidad)
    }
    sync()
    window.addEventListener('si-school-progress-updated', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('si-school-progress-updated', sync)
      window.removeEventListener('storage', sync)
    }
  }, [capacidades])

  return (
    <>
      <header className={styles.overviewHero}>
        <div className={styles.eyebrow}>SI School · Sistema operativo del agente</div>
        <h1 className={styles.h1}>Vas a aprender a operar como agente SI</h1>
        <p className={styles.lead}>
          Seis capacidades. Una por mes, más o menos. Cápsulas cortas para leer entre llamado y
          llamado, casos reales del mercado de Funes y Roldán, y el Mentor David al lado tuyo
          para corregir criterio cuando hace falta.
        </p>
      </header>

      <MentorWelcomeCard />

      <div className={styles.gridCaps}>
        {capacidades.map((cap, idx) => {
          const pct = completedMap[cap.slug] ?? 0
          const isFirst = idx === 0
          const prevPct = idx > 0 ? completedMap[capacidades[idx - 1].slug] ?? 0 : 1
          const blocked = !isFirst && prevPct < 1
          const completed = pct >= 1
          const statusText = completed
            ? 'Completada'
            : blocked
              ? 'Bloqueada'
              : pct > 0
                ? `En curso · ${Math.round(pct * 100)}%`
                : 'Activa'
          const statusClass = completed
            ? styles.statusCompleted
            : blocked
              ? styles.statusBlocked
              : styles.statusActive

          const pastel = PASTELES[idx % PASTELES.length]

          const card = (
            <div className={shell.capItem} style={{ display: 'block', padding: 0, margin: 0 }}>
              <div className={styles.capRomanLarge} style={{ color: pastel.ink, opacity: 1 }}>{cap.romano}</div>
              <div className={styles.capCardTitle}>{cap.titulo}</div>
              <div className={styles.capCardSub}>{cap.subtitulo}</div>
              <div className={styles.capCardDesc}>{cap.descripcion}</div>
              <div className={`${styles.capCardStatus} ${statusClass}`}>{statusText}</div>
            </div>
          )

          if (blocked) {
            return (
              <div
                key={cap.slug}
                className={`${styles.capCard} ${styles.capCardBlocked}`}
                style={{ background: pastel.bg }}
                aria-disabled="true"
              >
                {card}
              </div>
            )
          }
          return (
            <Link key={cap.slug} href={`/recursos/si-school/capacidad/${cap.slug}`} className={styles.capCard} style={{ background: pastel.bg }}>
              {card}
            </Link>
          )
        })}
      </div>

      <aside className={styles.cta}>
        <div className={styles.ctaText}>
          <h3 className={styles.ctaTitle}>
            {completedMap[currentSlug] === undefined || completedMap[currentSlug] === 0
              ? 'Empezá por Capacidad 1 — Pensar como SI'
              : 'Continuá donde te quedaste'}
          </h3>
          <p className={styles.ctaSub}>
            7 cápsulas cortas + 3 casos de criterio + regla de oro. Tomate tu tiempo.
          </p>
        </div>
        <Link href={`/recursos/si-school/capacidad/${currentSlug}`} className={styles.ctaBtn}>
          {completedMap[currentSlug] && completedMap[currentSlug] > 0 ? 'Continuar' : 'Empezar Capacidad 1'} →
        </Link>
      </aside>

      <div style={{ marginTop: 24 }}>
        <Link href="/recursos/si-school/progreso" className={styles.btnGhost}>
          Ver tu progreso completo →
        </Link>
      </div>
    </>
  )
}
