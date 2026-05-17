'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import TeamCodeGate from '@/components/si-school/TeamCodeGate'
import SiSchoolShell from '@/components/si-school/SiSchoolShell'
import CapsulaCard from '@/components/si-school/CapsulaCard'
import CasoCard from '@/components/si-school/CasoCard'
import ReglaDeOro from '@/components/si-school/ReglaDeOro'
import { CAPACIDADES_META } from '@/content/si-school/capacidades'
import { getProgress } from '@/lib/si-school/progress'
import type { Capacidad } from '@/lib/si-school/types'
import styles from '@/components/si-school/content.module.css'

interface Props {
  capacidad: Capacidad
}

const TOTAL_CAPSULAS: Record<string, number> = {
  'capacidad-01': 7,
  'capacidad-02': 5,
  'capacidad-03': 7,
  'capacidad-04': 9,
  'capacidad-05': 8,
  'capacidad-06': 6,
}

export default function CapacidadView({ capacidad }: Props) {
  return (
    <TeamCodeGate>
      {() => (
        <SiSchoolShell activeCapacidadSlug={capacidad.slug}>
          <CapacidadBody cap={capacidad} />
        </SiSchoolShell>
      )}
    </TeamCodeGate>
  )
}

function CapacidadBody({ cap }: { cap: Capacidad }) {
  const [unlocked, setUnlocked] = useState(true)
  const [progressPct, setProgressPct] = useState(0)

  useEffect(() => {
    const sync = () => {
      const idx = CAPACIDADES_META.findIndex((c) => c.slug === cap.slug)
      const p = getProgress()
      const total = TOTAL_CAPSULAS[cap.slug] ?? cap.capsulas.length
      const done = p.capsulasCompletadas.filter((k) => k.startsWith(`${cap.slug}/`)).length
      setProgressPct(total > 0 ? done / total : 0)
      if (idx <= 0) {
        setUnlocked(true)
        return
      }
      const prev = CAPACIDADES_META[idx - 1]
      const prevTotal = TOTAL_CAPSULAS[prev.slug] ?? 0
      const prevDone = p.capsulasCompletadas.filter((k) => k.startsWith(`${prev.slug}/`)).length
      const prevPct = prevTotal > 0 ? prevDone / prevTotal : 0
      setUnlocked(prevPct >= 1)
    }
    sync()
    window.addEventListener('si-school-progress-updated', sync)
    return () => window.removeEventListener('si-school-progress-updated', sync)
  }, [cap.slug, cap.capsulas.length])

  if (!unlocked) {
    return (
      <section style={{ textAlign: 'center', padding: '60px 0' }}>
        <div className={styles.eyebrow}>Capacidad bloqueada</div>
        <h1 className={styles.h1}>
          {cap.romano} · {cap.titulo}
        </h1>
        <p className={styles.lead} style={{ margin: '12px auto 24px', maxWidth: 460 }}>
          Esta capacidad se desbloquea cuando completes la anterior. Volvé cuando termines
          todas las cápsulas de la capacidad previa.
        </p>
        <Link href="/recursos/si-school" className={styles.btnPrimary}>
          ← Volver al programa
        </Link>
      </section>
    )
  }

  const totalCap = cap.capsulas.length
  const totalTime = cap.capsulas.reduce((sum, c) => sum + c.tiempoMin, 0)

  return (
    <>
      <header className={styles.capHero}>
        <div className={styles.capHeroRoman} aria-hidden>
          {cap.romano}
        </div>
        <div className={styles.capHeroInner}>
          <div className={styles.capHeroEyebrow}>Capacidad {cap.romano}</div>
          <h1 className={styles.capHeroTitle}>{cap.titulo}</h1>
          <p className={styles.capHeroSub}>{cap.subtitulo}</p>
          <div className={styles.capHeroMeta}>
            <span>
              <strong>{totalCap}</strong> cápsulas
            </span>
            <span>
              <strong>~{totalTime}</strong> min totales
            </span>
            <span>
              <strong>{cap.casos.length}</strong> casos de criterio
            </span>
            <span>
              <strong>{Math.round(progressPct * 100)}%</strong> de progreso
            </span>
          </div>
        </div>
      </header>

      <div className={styles.sectionHead}>
        <span className={styles.sectionNum}>01</span>
        <h2 className={styles.sectionTitle}>Cápsulas</h2>
      </div>
      <div className={styles.capsulaList}>
        {cap.capsulas.map((c) => (
          <CapsulaCard key={c.slug} capSlug={cap.slug} capsula={c} />
        ))}
      </div>

      {cap.reglaDeOroHtml && (
        <ReglaDeOro capacidadRomano={cap.romano} textoHtml={cap.reglaDeOroHtml} />
      )}

      {cap.casos.length > 0 && (
        <>
          <div className={styles.sectionHead}>
            <span className={styles.sectionNum}>02</span>
            <h2 className={styles.sectionTitle}>Casos de defensa de criterio</h2>
          </div>
          <p
            style={{
              fontSize: 13.5,
              color: '#52525B',
              margin: '0 0 16px',
              lineHeight: 1.5,
            }}
          >
            Cada caso te pide defender por escrito por qué tomarías una decisión y no otra.
            Tu respuesta queda guardada. En Fase 2, el Mentor David la evalúa contra los
            criterios listados.
          </p>
          <div className={styles.gridCasos}>
            {cap.casos.map((c) => (
              <CasoCard key={c.slug} capSlug={cap.slug} caso={c} />
            ))}
          </div>
        </>
      )}

      {cap.cierreHtml && (
        <section style={{ marginTop: 28 }}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionNum}>03</span>
            <h2 className={styles.sectionTitle}>Cierre de Capacidad {cap.romano}</h2>
          </div>
          <div className={styles.prose} dangerouslySetInnerHTML={{ __html: cap.cierreHtml }} />
        </section>
      )}

      <div style={{ marginTop: 32 }}>
        <Link href="/recursos/si-school" className={styles.btnGhost}>
          ← Volver al programa
        </Link>
      </div>
    </>
  )
}
