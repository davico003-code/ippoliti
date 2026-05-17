'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import TeamCodeGate from '@/components/si-school/TeamCodeGate'
import SiSchoolShell from '@/components/si-school/SiSchoolShell'
import { getDiasActivo, getLevel, getProgress, resetProgress } from '@/lib/si-school/progress'
import type { AgentProgress, CapacidadMeta, Level } from '@/lib/si-school/types'
import { LEVELS } from '@/lib/si-school/progress'
import styles from '@/components/si-school/content.module.css'

const TOTAL_CAPSULAS: Record<string, number> = {
  'capacidad-01': 7,
  'capacidad-02': 5,
  'capacidad-03': 7,
  'capacidad-04': 9,
  'capacidad-05': 8,
  'capacidad-06': 6,
}

interface Props {
  capacidades: CapacidadMeta[]
}

export default function ProgresoView({ capacidades }: Props) {
  return (
    <TeamCodeGate>
      {() => (
        <SiSchoolShell>
          <ProgresoBody capacidades={capacidades} />
        </SiSchoolShell>
      )}
    </TeamCodeGate>
  )
}

function ProgresoBody({ capacidades }: { capacidades: CapacidadMeta[] }) {
  const [progress, setProgress] = useState<AgentProgress | null>(null)
  const [level, setLevel] = useState<Level>(LEVELS[0])
  const [days, setDays] = useState(1)

  useEffect(() => {
    const sync = () => {
      setProgress(getProgress())
      setLevel(getLevel())
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

  if (!progress) return null

  const totalCapacidades = capacidades.length
  const completadas = capacidades.filter((cap) => {
    const total = TOTAL_CAPSULAS[cap.slug] ?? 0
    if (total === 0) return false
    const done = progress.capsulasCompletadas.filter((k) => k.startsWith(`${cap.slug}/`)).length
    return done >= total
  }).length
  const totalCasos = Object.keys(progress.casosEnviados).length

  const startedFormatted = new Date(progress.startedAt).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const handleReset = () => {
    if (typeof window === 'undefined') return
    if (window.confirm('¿Reiniciar todo el progreso de SI School en este dispositivo?')) {
      resetProgress()
    }
  }

  return (
    <>
      <header className={styles.overviewHero}>
        <div className={styles.eyebrow}>Tu progreso en SI School</div>
        <h1 className={styles.h1}>
          {days} {days === 1 ? 'día' : 'días'} adentro
        </h1>
        <p className={styles.lead}>
          Empezaste el {startedFormatted}. Estás en Nivel {level.numero} · {level.nombre}.
        </p>
      </header>

      {/* Stats grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginBottom: 28,
        }}
      >
        <StatCard valor={`${completadas} / ${totalCapacidades}`} etiqueta="Capacidades completadas" />
        <StatCard
          valor={`${progress.capsulasCompletadas.length}`}
          etiqueta="Cápsulas leídas"
        />
        <StatCard valor={`${totalCasos}`} etiqueta="Casos enviados" />
      </div>

      <div className={styles.sectionHead}>
        <span className={styles.sectionNum}>01</span>
        <h2 className={styles.sectionTitle}>Timeline de las 6 capacidades</h2>
      </div>

      <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {capacidades.map((cap, idx) => {
          const total = TOTAL_CAPSULAS[cap.slug] ?? 0
          const done = progress.capsulasCompletadas.filter((k) =>
            k.startsWith(`${cap.slug}/`),
          ).length
          const pct = total > 0 ? done / total : 0
          const isCurrent = idx === 0 || (idx > 0 && pct > 0 && pct < 1)
          const isCompleted = pct >= 1
          const isLocked = idx > 0 && pct === 0 && !isCompleted
          return (
            <li
              key={cap.slug}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                padding: '14px 16px',
                background: '#fff',
                border: '1px solid #E4E4E7',
                borderRadius: 12,
                marginBottom: 10,
                opacity: isLocked ? 0.5 : 1,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: isCompleted ? '#2A8B5A' : isCurrent ? '#E8F1ED' : '#F4F4F5',
                  color: isCompleted ? '#fff' : '#1A5C38',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-poppins)',
                  fontWeight: 700,
                  fontSize: 13,
                  flexShrink: 0,
                }}
              >
                {isCompleted ? '✓' : cap.romano}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14.5 }}>{cap.titulo}</div>
                <div style={{ fontSize: 12, color: '#71717A', marginTop: 2 }}>
                  {cap.subtitulo}
                </div>
                {total > 0 && (
                  <div
                    style={{
                      marginTop: 8,
                      height: 4,
                      background: '#F4F4F5',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.round(pct * 100)}%`,
                        background: isCompleted ? '#2A8B5A' : '#B8935A',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                )}
                <div
                  style={{
                    marginTop: 6,
                    fontFamily: 'var(--font-poppins)',
                    fontSize: 11,
                    letterSpacing: '0.08em',
                    color: '#71717A',
                  }}
                >
                  {total === 0
                    ? 'En preparación · Fase 2'
                    : isCompleted
                      ? 'Completada'
                      : isCurrent
                        ? `En curso · ${done}/${total} cápsulas`
                        : 'Pendiente'}
                </div>
              </div>
              {total > 0 && !isLocked && (
                <Link
                  href={`/recursos/si-school/capacidad/${cap.slug}`}
                  className={styles.btnGhost}
                  style={{ alignSelf: 'center' }}
                >
                  {isCompleted ? 'Revisar' : 'Continuar'} →
                </Link>
              )}
            </li>
          )
        })}
      </ol>

      <div style={{ marginTop: 32, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Link href="/recursos/si-school" className={styles.btnPrimary}>
          ← Volver al programa
        </Link>
        <button
          type="button"
          className={styles.btnGhost}
          onClick={handleReset}
          style={{ marginLeft: 'auto' }}
        >
          Reiniciar progreso
        </button>
      </div>
    </>
  )
}

function StatCard({ valor, etiqueta }: { valor: string; etiqueta: string }) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #E4E4E7',
        borderRadius: 14,
        padding: 18,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-poppins)',
          fontSize: 28,
          fontWeight: 700,
          color: '#09090B',
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
        }}
      >
        {valor}
      </div>
      <div
        style={{
          fontSize: 12,
          color: '#71717A',
          marginTop: 6,
          fontFamily: 'var(--font-poppins)',
          letterSpacing: '0.04em',
        }}
      >
        {etiqueta}
      </div>
    </div>
  )
}
