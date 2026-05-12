'use client'

// Audio narrado por IA — versión SI (paleta verde, Raleway).
// Vive en el sidebar derecho de /propiedades/[slug], arriba del botón
// "Consultar por WhatsApp".
//
// Estados:
//   - initial: botón "▶ Escuchá esta propiedad en 25 segundos"
//   - loading: spinner "Preparando el audio…" (solo primera vez)
//   - playing: pause + barra de progreso + tiempo + cerrar
//   - paused:  play (barra mantiene posición)
//   - ended:   vuelve a initial
//
// Carga lazy en el primer click. Fade-in del botón a los 500ms para no
// distraer al primer paint. Si la generación falla, oculta el componente
// (return null) — no rompe la página.

import { useEffect, useRef, useState } from 'react'
import { Loader2, Pause, Play, Volume2, X } from 'lucide-react'

const GREEN = '#1A5C38'
const R = "'Raleway', system-ui, sans-serif"

type Mode = 'initial' | 'loading' | 'ready' | 'error'

interface Props {
  propertyId: number
  title?: string
}

function fmtTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function AudioSummary({ propertyId, title }: Props) {
  const [mode, setMode] = useState<Mode>('initial')
  const [visible, setVisible] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 500)
    return () => clearTimeout(t)
  }, [])

  // Cleanup: pausar si el componente se desmonta mientras suena
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [])

  const startPlayback = async () => {
    if (mode === 'loading') return
    if (mode === 'ready' && audioRef.current) {
      // Toggle play/pause si ya está cargado
      if (audioRef.current.paused) {
        await audioRef.current.play()
      } else {
        audioRef.current.pause()
      }
      return
    }
    setMode('loading')
    try {
      const res = await fetch('/api/audio/generar-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId }),
      })
      if (!res.ok) {
        setMode('error')
        return
      }
      const data = await res.json()
      if (!data?.url) {
        setMode('error')
        return
      }
      const audio = new Audio(data.url)
      audio.preload = 'auto'
      audioRef.current = audio

      audio.addEventListener('loadedmetadata', () => setDuration(audio.duration || 0))
      audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime))
      audio.addEventListener('play', () => setPlaying(true))
      audio.addEventListener('pause', () => setPlaying(false))
      audio.addEventListener('ended', () => {
        setPlaying(false)
        setCurrentTime(0)
      })

      // MediaSession para mostrar metadata en lockscreen mobile
      if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
        try {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: title || 'Resumen de propiedad',
            artist: 'siinmobiliaria.com',
          })
        } catch { /* not critical */ }
      }

      setMode('ready')
      await audio.play()
    } catch {
      setMode('error')
    }
  }

  const close = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setMode('initial')
    setPlaying(false)
    setCurrentTime(0)
    setDuration(0)
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault()
      void startPlayback()
    }
  }

  // Si falló silenciosamente, ocultar el componente
  if (mode === 'error') return null

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 400ms ease',
        marginBottom: 14,
      }}
    >
      {(mode === 'initial' || mode === 'loading') && (
        <button
          type="button"
          onClick={startPlayback}
          onKeyDown={onKey}
          aria-label="Escuchá esta propiedad"
          disabled={mode === 'loading'}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '14px 18px',
            background: '#fff',
            border: `1.5px solid ${GREEN}`,
            borderRadius: 14,
            cursor: mode === 'loading' ? 'wait' : 'pointer',
            fontFamily: R,
            color: GREEN,
            textAlign: 'left',
            transition: 'background 150ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#F0F7F2' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
        >
          <div
            style={{
              width: 38, height: 38, borderRadius: 999,
              background: GREEN, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {mode === 'loading'
              ? <Loader2 size={18} className="audio-spin" />
              : <Play size={18} fill="currentColor" />}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>
              {mode === 'loading' ? 'Preparando el audio…' : 'Escuchá esta propiedad'}
            </div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
              Resumen narrado, 25 segundos
            </div>
          </div>
          <Volume2 size={16} style={{ color: '#9CA3AF', marginLeft: 'auto', flexShrink: 0 }} />
        </button>
      )}

      {mode === 'ready' && (
        <div
          style={{
            background: '#fff',
            border: `1.5px solid ${GREEN}`,
            borderRadius: 14,
            padding: 14,
            fontFamily: R,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={startPlayback}
              onKeyDown={onKey}
              aria-label={playing ? 'Pausar' : 'Reproducir'}
              style={{
                width: 38, height: 38, borderRadius: 999,
                background: GREEN, color: '#fff',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            </button>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                height: 6, background: '#E5E7EB', borderRadius: 3, overflow: 'hidden',
              }}>
                <div
                  style={{
                    height: '100%',
                    width: `${progressPct}%`,
                    background: GREEN,
                    transition: 'width 200ms linear',
                  }}
                  aria-hidden
                />
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: 11, color: '#6B7280', marginTop: 6,
                fontVariantNumeric: 'tabular-nums',
              }}>
                <span>{fmtTime(currentTime)}</span>
                <span>{fmtTime(duration)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={close}
              aria-label="Cerrar"
              style={{
                width: 32, height: 32, borderRadius: 999,
                background: 'transparent', border: 'none',
                color: '#6B7280', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes audio-spin { to { transform: rotate(360deg); } }
        .audio-spin { animation: audio-spin 1s linear infinite; }
      `}</style>
    </div>
  )
}
