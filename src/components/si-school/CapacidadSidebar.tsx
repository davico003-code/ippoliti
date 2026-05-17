'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import type { CapacidadMeta } from '@/lib/si-school/types'
import { getProgress } from '@/lib/si-school/progress'
import styles from './si-school.module.css'

interface Props {
  capacidades: CapacidadMeta[]
  activeSlug?: string
}

interface ResolvedCap {
  meta: CapacidadMeta
  estado: 'completada' | 'activa' | 'bloqueada'
  pct: number
}

const TOTAL_CAPSULAS_PER_CAP: Record<string, number> = {
  'capacidad-01': 7,
  'capacidad-02': 5,
  'capacidad-03': 7,
}

function resolveEstados(metas: CapacidadMeta[]): ResolvedCap[] {
  if (typeof window === 'undefined') {
    return metas.map((m) => ({ meta: m, estado: m.estado, pct: 0 }))
  }
  const p = getProgress()
  return metas.map((m, idx) => {
    const total = TOTAL_CAPSULAS_PER_CAP[m.slug] ?? 0
    const done = p.capsulasCompletadas.filter((k) => k.startsWith(`${m.slug}/`)).length
    const pct = total > 0 ? Math.min(1, done / total) : 0
    let estado: 'completada' | 'activa' | 'bloqueada' = 'bloqueada'
    if (idx === 0) {
      estado = pct >= 1 ? 'completada' : 'activa'
    } else {
      // Próxima en orden — activa solo si la previa está completa.
      const prevSlug = metas[idx - 1].slug
      const prevTotal = TOTAL_CAPSULAS_PER_CAP[prevSlug] ?? 0
      const prevDone = p.capsulasCompletadas.filter((k) => k.startsWith(`${prevSlug}/`)).length
      const prevPct = prevTotal > 0 ? prevDone / prevTotal : 0
      estado = prevPct >= 1 ? (pct >= 1 ? 'completada' : 'activa') : 'bloqueada'
    }
    return { meta: m, estado, pct }
  })
}

export default function CapacidadSidebar({ capacidades, activeSlug }: Props) {
  const [resolved, setResolved] = useState<ResolvedCap[]>(() =>
    capacidades.map((m) => ({ meta: m, estado: m.estado, pct: 0 })),
  )

  useEffect(() => {
    const sync = () => setResolved(resolveEstados(capacidades))
    sync()
    window.addEventListener('si-school-progress-updated', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('si-school-progress-updated', sync)
      window.removeEventListener('storage', sync)
    }
  }, [capacidades])

  return (
    <aside className={styles.sidebar} aria-label="Capacidades del programa">
      <div className={styles.sidebarLabel}>Programa</div>
      <nav>
        {resolved.map(({ meta, estado, pct }) => {
          const isActive = meta.slug === activeSlug
          const isBlocked = estado === 'bloqueada'
          const className = [
            styles.capItem,
            isActive ? styles.capItemActive : '',
            isBlocked ? styles.capItemBlocked : '',
          ]
            .filter(Boolean)
            .join(' ')
          const content = (
            <>
              <div className={styles.capRoman}>{meta.romano}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className={styles.capTitle}>{meta.titulo}</div>
                <div className={styles.capSub}>{meta.subtitulo}</div>
                <div
                  className={[
                    styles.capStatus,
                    estado === 'completada'
                      ? styles.capStatusCompleted
                      : estado === 'activa'
                        ? styles.capStatusActive
                        : styles.capStatusBlocked,
                  ].join(' ')}
                >
                  {estado === 'completada'
                    ? '✓ Completada'
                    : estado === 'activa'
                      ? pct > 0
                        ? `En curso · ${Math.round(pct * 100)}%`
                        : 'Activa'
                      : 'Bloqueada'}
                </div>
              </div>
            </>
          )

          if (isBlocked) {
            return (
              <div key={meta.slug} className={className} aria-disabled="true">
                {content}
              </div>
            )
          }

          return (
            <Link
              key={meta.slug}
              href={`/recursos/si-school/capacidad/${meta.slug}`}
              className={className}
            >
              {content}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
