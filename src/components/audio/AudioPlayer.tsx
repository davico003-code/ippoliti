'use client'

// Player de audio narrado por IA — estilo Apple Podcasts minimalista.
//
// Reutilizado por:
//   - AudioSummary (siinmobiliaria.com, variant 'main', verde SI)
//   - AudioSummaryNeutral (verficha.casa, variant 'neutral', azul)
//   - /admin/audio (preview tras generar)
//
// Render: card horizontal con play 48px + barra de progreso + tiempos +
// selector de velocidad. Mobile compacto vertical. Texto descriptivo visible
// solo cuando no reproduce.
//
// Asume audioUrl ya cacheada (Vercel Blob). NO genera audio — el front sabe
// que existe gracias a /api/audio/check.

import { useEffect, useRef, useState } from 'react'
import { Loader2, Pause, Play } from 'lucide-react'

interface Props {
  audioUrl: string
  variant?: 'main' | 'neutral'
  propertyId?: number
  title?: string
}

const COLOR_MAIN = '#1A5C38'
const COLOR_NEUTRAL = '#2563EB'
const TRACK_BG = '#E5E7EB'
const TEXT_MUTED = '#6B7280'
const TIME_COLOR = '#4B5563'
const SPEED_BG = '#F3F4F6'

const SPEED_OPTIONS = [1, 1.25, 1.5, 2] as const
type Speed = (typeof SPEED_OPTIONS)[number]

const SPEED_STORAGE_KEY = 'audio_playback_rate'

function fmtTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function readStoredSpeed(): Speed {
  if (typeof window === 'undefined') return 1
  // try/catch: con storage bloqueado (Safari "Bloquear todas las cookies",
  // Lockdown, webviews in-app) el acceso a localStorage tira SecurityError.
  let raw: string | null = null
  try { raw = window.localStorage.getItem(SPEED_STORAGE_KEY) } catch { /* ignore */ }
  const parsed = Number(raw)
  return (SPEED_OPTIONS as readonly number[]).includes(parsed) ? (parsed as Speed) : 1
}

// Eventos opcionales para gtag / Meta Pixel. Wrappeo en try/catch silencioso
// porque si no hay tracking instalado no queremos romper el player.
function track(event: string, label?: string, propertyId?: number) {
  if (typeof window === 'undefined') return
  try {
    const w = window as unknown as {
      gtag?: (...args: unknown[]) => void
      fbq?: (...args: unknown[]) => void
    }
    if (typeof w.gtag === 'function') {
      w.gtag('event', event, { event_label: label, property_id: propertyId })
    }
    if (typeof w.fbq === 'function') {
      w.fbq('trackCustom', event, { label, property_id: propertyId })
    }
  } catch { /* silencioso */ }
}

export default function AudioPlayer({
  audioUrl,
  variant = 'main',
  propertyId,
  title,
}: Props) {
  const color = variant === 'neutral' ? COLOR_NEUTRAL : COLOR_MAIN

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const hasPlayedOnce = useRef(false)

  const [visible, setVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [speed, setSpeed] = useState<Speed>(1)

  // Fade-in al mount (consistente con el comportamiento histórico del player).
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 500)
    return () => clearTimeout(t)
  }, [])

  // Responsive: <640px = mobile.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(max-width: 639px)')
    const onChange = () => setIsMobile(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Levanto el audio una sola vez (preload metadata para tener duración rápido).
  useEffect(() => {
    const audio = new Audio(audioUrl)
    audio.preload = 'metadata'
    audioRef.current = audio

    const storedSpeed = readStoredSpeed()
    audio.playbackRate = storedSpeed
    setSpeed(storedSpeed)

    const onLoaded = () => setDuration(audio.duration || 0)
    const onTime = () => setCurrentTime(audio.currentTime)
    const onPlay = () => { setPlaying(true); setLoading(false) }
    const onPause = () => setPlaying(false)
    const onEnded = () => {
      setPlaying(false)
      setCurrentTime(0)
      audio.currentTime = 0
      track('audio_completed', undefined, propertyId)
    }
    const onError = () => {
      setLoading(false)
      setPlaying(false)
      setError('No se pudo cargar el audio')
    }
    const onWaiting = () => setLoading(true)
    const onPlaying = () => setLoading(false)

    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)
    audio.addEventListener('waiting', onWaiting)
    audio.addEventListener('playing', onPlaying)

    return () => {
      audio.pause()
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
      audio.removeEventListener('waiting', onWaiting)
      audio.removeEventListener('playing', onPlaying)
      audio.src = ''
      audioRef.current = null
    }
  }, [audioUrl, propertyId])

  // MediaSession para lockscreen mobile.
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: title || 'Resumen de propiedad',
        artist: variant === 'neutral' ? 'verficha.casa' : 'siinmobiliaria.com',
      })
    } catch { /* not critical */ }
  }, [title, variant])

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return
    setError(null)
    if (audio.paused) {
      try {
        if (!hasPlayedOnce.current) {
          setLoading(true)
          hasPlayedOnce.current = true
          track('audio_play', undefined, propertyId)
        }
        await audio.play()
      } catch {
        setLoading(false)
        setError('No se pudo cargar el audio')
      }
    } else {
      audio.pause()
      track('audio_pause', undefined, propertyId)
    }
  }

  const seekTo = (clientX: number) => {
    const trackEl = trackRef.current
    const audio = audioRef.current
    if (!trackEl || !audio || !duration) return
    const rect = trackEl.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    audio.currentTime = ratio * duration
    setCurrentTime(audio.currentTime)
    track('audio_scrub', undefined, propertyId)
  }

  const onTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    seekTo(e.clientX)
  }

  const onTrackKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !duration) return
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      audio.currentTime = Math.min(duration, audio.currentTime + 5)
      setCurrentTime(audio.currentTime)
      track('audio_scrub', undefined, propertyId)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      audio.currentTime = Math.max(0, audio.currentTime - 5)
      setCurrentTime(audio.currentTime)
      track('audio_scrub', undefined, propertyId)
    } else if (e.code === 'Space') {
      e.preventDefault()
      void togglePlay()
    }
  }

  const changeSpeed = (s: Speed) => {
    const audio = audioRef.current
    if (!audio) return
    audio.playbackRate = s
    setSpeed(s)
    if (typeof window !== 'undefined') {
      try { window.localStorage.setItem(SPEED_STORAGE_KEY, String(s)) } catch { /* ignore */ }
    }
    track('audio_speed_change', String(s), propertyId)
  }

  const nextSpeed = (s: Speed): Speed =>
    s === 1 ? 1.25 : s === 1.25 ? 1.5 : s === 1.5 ? 2 : 1

  const cycleSpeed = () => changeSpeed(nextSpeed(speed))

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0
  const showHelperText = !playing && currentTime === 0

  // ── Subcomponentes inline ─────────────────────────────────────────────────

  const playButton = (
    <button
      type="button"
      onClick={togglePlay}
      aria-label={playing ? 'Pausar audio' : 'Reproducir audio'}
      className={`ap-play ${playing ? 'ap-play--pulse' : ''}`}
      style={{
        width: 48,
        height: 48,
        borderRadius: 999,
        background: color,
        color: '#fff',
        border: 'none',
        cursor: loading ? 'wait' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {loading
        ? <Loader2 size={20} className="ap-spin" />
        : playing
          ? <Pause size={20} fill="currentColor" />
          : <Play size={20} fill="currentColor" style={{ marginLeft: 2 }} />}
    </button>
  )

  const progressBar = (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label="Progreso del audio"
        aria-valuemin={0}
        aria-valuemax={Math.round(duration) || 0}
        aria-valuenow={Math.round(currentTime)}
        onClick={onTrackClick}
        onKeyDown={onTrackKeyDown}
        className="ap-track"
        style={{
          position: 'relative',
          flex: 1,
          height: 16,
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: 4,
            background: TRACK_BG,
            borderRadius: 2,
          }}
          aria-hidden
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: `${progressPct}%`,
            height: 4,
            background: color,
            borderRadius: 2,
            transition: 'width 120ms linear',
          }}
          aria-hidden
        />
        <div
          className="ap-thumb"
          style={{
            position: 'absolute',
            left: `calc(${progressPct}% - 6px)`,
            width: 12,
            height: 12,
            borderRadius: 999,
            background: color,
            boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
            opacity: 0,
            transition: 'opacity 120ms ease',
            pointerEvents: 'none',
          }}
          aria-hidden
        />
      </div>
    </div>
  )

  const times = (
    <div
      style={{
        fontFamily: "'Poppins', system-ui, sans-serif",
        fontSize: 13,
        color: TIME_COLOR,
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {fmtTime(currentTime)}/{fmtTime(duration)}
    </div>
  )

  const speedActive = speed !== 1
  const speedToggle = (
    <button
      type="button"
      onClick={cycleSpeed}
      aria-label={`Velocidad actual: ${speed}x. Tocá para cambiar.`}
      className="ap-speed"
      style={{
        flexShrink: 0,
        background: speedActive ? color : SPEED_BG,
        color: speedActive ? '#fff' : TIME_COLOR,
        padding: '6px 10px',
        borderRadius: 8,
        border: 'none',
        cursor: 'pointer',
        fontFamily: "'Poppins', system-ui, sans-serif",
        fontSize: 12,
        fontWeight: 500,
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1,
      }}
    >
      {speed}x
    </button>
  )

  const helperText = (
    <div
      style={{
        fontFamily: "'Poppins', system-ui, sans-serif",
        fontSize: 13,
        color: TEXT_MUTED,
        marginTop: 8,
        opacity: showHelperText ? 1 : 0,
        height: showHelperText ? 'auto' : 0,
        overflow: 'hidden',
        transition: 'opacity 200ms ease',
      }}
    >
      🎙 Conocé esta propiedad — narrada por IA
    </div>
  )

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 400ms ease',
        background: '#fff',
        border: '1px solid #E5E7EB',
        borderRadius: 12,
        padding: 16,
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      {isMobile ? (
        <>
          {showHelperText && (
            <div
              style={{
                fontFamily: "'Poppins', system-ui, sans-serif",
                fontSize: 13,
                color: TEXT_MUTED,
                marginBottom: 12,
              }}
            >
              🎙 Conocé esta propiedad
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {speedToggle}
            {playButton}
            {progressBar}
            {times}
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {speedToggle}
            {playButton}
            {progressBar}
            {times}
          </div>
          {helperText}
        </>
      )}
      {error && (
        <div
          role="alert"
          style={{
            fontFamily: "'Poppins', system-ui, sans-serif",
            fontSize: 12,
            color: '#B91C1C',
            marginTop: 10,
          }}
        >
          {error}
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ap-spin { to { transform: rotate(360deg); } }
        .ap-spin { animation: ap-spin 1s linear infinite; }

        @keyframes ap-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .ap-play--pulse { animation: ap-pulse 2s ease-in-out infinite; }

        .ap-speed { transition: transform 150ms ease, background 150ms ease; }

        @media (hover: hover) {
          .ap-play { transition: transform 150ms ease; }
          .ap-play:hover { transform: scale(1.05); }
          .ap-speed:hover { transform: scale(1.05); }
          .ap-track:hover .ap-thumb,
          .ap-track:focus-visible .ap-thumb { opacity: 1; }
        }
      ` }} />
    </div>
  )
}
