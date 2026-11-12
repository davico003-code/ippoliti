'use client'

// Wrapper para /propiedades/[slug] (siinmobiliaria.com) que decide al mount
// si renderizar el AudioPlayer.
//
// La generación de audio es opt-in (se hace desde /admin/audio), así que la
// inmensa mayoría de las propiedades NO tiene audio cacheado. Para evitar
// botones huérfanos, consultamos /api/audio/check al mount y solo renderizamos
// el player si existe URL.
//
// No se resuelve en el servidor a propósito: la ficha es ISR y leer Redis crudo
// ahí da 500 en todas las fichas (bug recurrente del repo). Reservar el alto
// tampoco sirve (casi ninguna tiene audio: quedaría un hueco en todas). Por eso,
// cuando llega, el player se ABRE en 200 ms (alto de 0 a su tamaño, ease-out)
// en vez de aparecer de golpe y empujar todo lo de abajo de un tirón.

import { useEffect, useState } from 'react'
import AudioPlayer from './audio/AudioPlayer'

interface Props {
  propertyId: number
  title?: string
  /** Clases del contenedor (ej. la línea divisoria del sidebar): solo existen si hay audio. */
  className?: string
}

export default function AudioSummary({ propertyId, title, className }: Props) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [abierto, setAbierto] = useState(false)
  // Terminada la apertura se saca el overflow-hidden, para no recortar el foco
  // del botón ni la sombra del player.
  const [listo, setListo] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/audio/check?propertyId=${propertyId}`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (cancelled || !data?.hasAudio || !data?.url) return
        setAudioUrl(data.url as string)
      })
      .catch(() => { /* sin audio, sin render */ })
    return () => { cancelled = true }
  }, [propertyId])

  // Doble rAF: el primer cuadro se pinta cerrado (0fr) y recién ahí se abre, si
  // no el navegador saltea la transición. El "listo" va por tiempo y no por
  // transitionend: con movimiento reducido (o un Safari viejo sin esta
  // transición) ese evento nunca llega.
  useEffect(() => {
    if (!audioUrl) return
    let r2 = 0
    let t = 0
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => {
        setAbierto(true)
        t = window.setTimeout(() => setListo(true), 260)
      })
    })
    return () => {
      cancelAnimationFrame(r1)
      cancelAnimationFrame(r2)
      window.clearTimeout(t)
    }
  }, [audioUrl])

  if (!audioUrl) return null

  return (
    <div
      className="grid transition-[grid-template-rows,margin] duration-200 ease-out motion-reduce:transition-none"
      // Cerrado también sin margen: el space-y de la ficha del celu le pone 24 px
      // arriba y saltaría igual. Abierto, vuelve el de la clase del padre.
      style={{ gridTemplateRows: abierto ? '1fr' : '0fr', marginTop: abierto ? undefined : 0 }}
    >
      <div className={`min-h-0 ${listo ? '' : 'overflow-hidden'}`}>
        <div className={className}>
          <div style={{ marginBottom: 14 }}>
            <AudioPlayer
              audioUrl={audioUrl}
              variant="main"
              propertyId={propertyId}
              title={title}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
