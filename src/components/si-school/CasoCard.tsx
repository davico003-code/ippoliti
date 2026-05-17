'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import type { Caso } from '@/lib/si-school/types'
import { getCasoSubmission } from '@/lib/si-school/progress'
import styles from './content.module.css'

interface Props {
  capSlug: string
  caso: Caso
}

export default function CasoCard({ capSlug, caso }: Props) {
  const [enviado, setEnviado] = useState(false)

  useEffect(() => {
    const sync = () => setEnviado(!!getCasoSubmission(capSlug, caso.slug))
    sync()
    window.addEventListener('si-school-progress-updated', sync)
    return () => window.removeEventListener('si-school-progress-updated', sync)
  }, [capSlug, caso.slug])

  return (
    <Link
      href={`/recursos/si-school/capacidad/${capSlug}/caso/${caso.slug}`}
      className={[styles.casoCard, enviado ? styles.casoEnviado : ''].filter(Boolean).join(' ')}
    >
      {enviado && <span className={styles.casoEnviadoBadge}>✓ Enviado</span>}
      <div className={styles.casoNum}>Caso {String(caso.numero).padStart(2, '0')}</div>
      <h4 className={styles.casoTitle}>{caso.titulo}</h4>
      <p className={styles.casoLead}>
        {caso.escenario.length > 180 ? caso.escenario.slice(0, 178) + '…' : caso.escenario}
      </p>
      <div className={styles.casoCta}>Defender mi criterio →</div>
    </Link>
  )
}
