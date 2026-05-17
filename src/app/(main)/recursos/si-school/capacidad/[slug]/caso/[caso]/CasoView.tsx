'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import TeamCodeGate from '@/components/si-school/TeamCodeGate'
import SiSchoolShell from '@/components/si-school/SiSchoolShell'
import {
  getCasoDraft,
  getCasoSubmission,
  markCasoSubmitted,
  saveCasoDraft,
} from '@/lib/si-school/progress'
import type { Caso } from '@/lib/si-school/types'
import styles from '@/components/si-school/content.module.css'

interface Props {
  capSlug: string
  capRomano: string
  capTitulo: string
  caso: Caso
}

const AUTOSAVE_MS = 5000

export default function CasoView({ capSlug, capRomano, capTitulo, caso }: Props) {
  return (
    <TeamCodeGate>
      {() => (
        <SiSchoolShell activeCapacidadSlug={capSlug}>
          <CasoBody capSlug={capSlug} capRomano={capRomano} capTitulo={capTitulo} caso={caso} />
        </SiSchoolShell>
      )}
    </TeamCodeGate>
  )
}

function CasoBody({ capSlug, capRomano, capTitulo, caso }: Props) {
  const [texto, setTexto] = useState<string>('')
  const [submission, setSubmission] = useState<{ respuesta: string; enviadoAt: string } | null>(
    null,
  )
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const lastSavedRef = useRef<string>('')

  useEffect(() => {
    setTexto(getCasoDraft(capSlug, caso.slug) || '')
    setSubmission(getCasoSubmission(capSlug, caso.slug))
  }, [capSlug, caso.slug])

  // Autosave cada AUTOSAVE_MS ms si el texto cambió y no es submission.
  useEffect(() => {
    const id = setInterval(() => {
      if (submission) return
      if (texto === lastSavedRef.current) return
      saveCasoDraft(capSlug, caso.slug, texto)
      lastSavedRef.current = texto
      setSavedAt(new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }))
    }, AUTOSAVE_MS)
    return () => clearInterval(id)
  }, [texto, submission, capSlug, caso.slug])

  const guardarBorrador = useCallback(() => {
    saveCasoDraft(capSlug, caso.slug, texto)
    lastSavedRef.current = texto
    setSavedAt(new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }))
  }, [capSlug, caso.slug, texto])

  const enviar = useCallback(() => {
    if (!texto.trim()) return
    markCasoSubmitted(capSlug, caso.slug, texto)
    setSubmission({ respuesta: texto, enviadoAt: new Date().toISOString() })
  }, [capSlug, caso.slug, texto])

  const wordCount = useMemo(() => texto.trim().split(/\s+/).filter(Boolean).length, [texto])

  return (
    <>
      <Link
        href={`/recursos/si-school/capacidad/${capSlug}`}
        style={{
          fontFamily: 'var(--font-poppins)',
          fontSize: 12,
          color: '#71717A',
          textDecoration: 'none',
        }}
      >
        ← Capacidad {capRomano} · {capTitulo}
      </Link>

      <header className={styles.casoHero} style={{ marginTop: 14 }}>
        <div className={styles.eyebrow} style={{ color: '#B8935A' }}>
          Caso {String(caso.numero).padStart(2, '0')} · Defensa de criterio · Nivel 2
        </div>
        <h1 className={styles.h1}>{caso.titulo}</h1>
        <p className={styles.lead}>
          Tu trabajo no es responder lo que crees que está bien — es defender por escrito por
          qué pensás lo que pensás.
        </p>
      </header>

      <section className={styles.casoEscenario}>
        <div className={styles.casoEscenarioLabel}>Escenario</div>
        <p className={styles.casoEscenarioText}>{caso.escenario}</p>
        {caso.cita && (
          <blockquote className={styles.casoCita}>
            <span style={{ display: 'block', marginBottom: 4, fontStyle: 'normal', fontFamily: 'var(--font-poppins)', fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#71717A', fontWeight: 600 }}>
              Cita textual
            </span>
            “{caso.cita}”
          </blockquote>
        )}
      </section>

      <section className={styles.casoTareaCard}>
        <div className={styles.casoTareaLabel}>Tu tarea</div>
        <p className={styles.casoTareaText}>{caso.tarea}</p>
      </section>

      <label
        htmlFor="caso-respuesta"
        style={{
          display: 'block',
          fontFamily: 'var(--font-poppins)',
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          fontWeight: 600,
          color: '#71717A',
          marginBottom: 6,
        }}
      >
        Tu respuesta
      </label>
      <textarea
        id="caso-respuesta"
        className={styles.respuestaTextarea}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Escribí acá. Defendé tu decisión paso a paso. Aplicá los 3 principios y la frase fundacional. No hay respuesta única, hay criterio bien argumentado."
        disabled={!!submission}
      />

      {caso.criteriosEval.length > 0 && (
        <div className={styles.criteriosList}>
          <div className={styles.criteriosLabel}>Mentor David va a evaluar</div>
          <ul>
            {caso.criteriosEval.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.casoActions}>
        {!submission ? (
          <>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={enviar}
              disabled={!texto.trim()}
            >
              Enviar respuesta
            </button>
            <button type="button" className={styles.btnGhost} onClick={guardarBorrador}>
              Guardar borrador
            </button>
          </>
        ) : (
          <span className={styles.btnGhost} style={{ cursor: 'default' }}>
            ✓ Respuesta enviada
          </span>
        )}
        <span className={styles.autoSaveNote}>
          {wordCount} palabras
          {savedAt && !submission ? ` · Guardado ${savedAt}` : ''}
          {!savedAt && !submission ? ' · Autosave activo' : ''}
        </span>
      </div>

      {submission && (
        <div className={styles.confirmacionEnviado}>
          <strong>Respuesta guardada.</strong>
          {' '}El Mentor David la va a evaluar cuando se active la Fase 2 (próximamente).
          Mientras tanto tu respuesta queda registrada en este dispositivo.
        </div>
      )}

      <div style={{ marginTop: 32 }}>
        <Link
          href={`/recursos/si-school/capacidad/${capSlug}`}
          className={styles.btnGhost}
        >
          ← Volver a la capacidad
        </Link>
      </div>
    </>
  )
}
