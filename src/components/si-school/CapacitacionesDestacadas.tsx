'use client'

// Sección protagonista de la home: las Capacitaciones del equipo (aparte del
// programa SI School, que es el ABC para los que arrancan y va más abajo).
// La última cargada va grande arriba; todas en grilla, en su orden (01, 02…).

import { useCallback, useState } from 'react'
import { CAPACITACIONES, numeroCapacitacion } from './capacitaciones'
import VisorCapacitacion from './VisorCapacitacion'
import styles from './si-school.module.css'

export default function CapacitacionesDestacadas() {
  const [openId, setOpenId] = useState<string | null>(null)
  const cerrar = useCallback(() => setOpenId(null), [])
  const activa = CAPACITACIONES.find((c) => c.id === openId) || null
  const ultima = CAPACITACIONES[CAPACITACIONES.length - 1]

  if (!ultima) return null

  return (
    <section className={styles.dest} aria-labelledby="capacitaciones-titulo">
      <div className={styles.destHead}>
        <div className={styles.destEyebrow}>Para todo el equipo</div>
        <h1 id="capacitaciones-titulo" className={styles.destTitulo}>
          Capacitaciones <span className={styles.destCount}>{CAPACITACIONES.length}</span>
        </h1>
        <p className={styles.destSub}>Las presentaciones del equipo, en orden. Tocá una para verla.</p>
      </div>

      {/* La última, grande */}
      <button type="button" className={styles.destUltima} onClick={() => setOpenId(ultima.id)}>
        <span className={styles.destUltimaFoto}>
          {ultima.imagen && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ultima.imagen} alt="" width={640} height={360} />
          )}
        </span>
        <span className={styles.destUltimaBody}>
          <span className={styles.destUltimaLabel}>Última capacitación · {numeroCapacitacion(ultima.id)}</span>
          <span className={styles.destUltimaTitulo}>{ultima.titulo}</span>
          {ultima.bajada && <span className={styles.destUltimaBajada}>{ultima.bajada}</span>}
          <span className={styles.destUltimaCta}>Ver capacitación →</span>
        </span>
      </button>

      {/* Todas */}
      <div className={styles.destGrid}>
        {CAPACITACIONES.map((c) => (
          <button key={c.id} type="button" className={styles.destCard} onClick={() => setOpenId(c.id)}>
            <span className={styles.destCardFoto}>
              {c.imagen && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.imagen} alt="" width={320} height={180} loading="lazy" />
              )}
              <span className={styles.capsNum}>{numeroCapacitacion(c.id)}</span>
            </span>
            <span className={styles.destCardBody}>
              {c.etiqueta && <span className={styles.capsTag}>{c.etiqueta}</span>}
              <span className={styles.destCardTitulo}>{c.titulo}</span>
              {c.bajada && <span className={styles.destCardBajada}>{c.bajada}</span>}
            </span>
          </button>
        ))}
      </div>

      {activa && <VisorCapacitacion cap={activa} onClose={cerrar} />}
    </section>
  )
}
