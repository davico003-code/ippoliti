'use client'

// Reproducción global de audios narrados desde las placas de propiedad.
//
// Una sola instancia de HTMLAudioElement vive en el provider — garantiza que
// solo un audio suena en toda la web. El hook useAudioPlayer() expone:
//   - currentId / status: para que cada placa sepa si es la que está sonando
//   - toggle(id, url): play/pause inteligente
//   - pause(): detener cualquier audio (interno; los consumidores usan toggle)
//
// El audio se corta automáticamente al cambiar de ruta (usePathname).

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { usePathname } from 'next/navigation'
import { Loader2, Pause, Play } from 'lucide-react'

type Status = 'idle' | 'loading' | 'playing'

interface AudioPlayerContextValue {
  currentId: number | null
  status: Status
  toggle: (propertyId: number, audioUrl: string) => void
  pause: () => void
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null)

export function useAudioPlayer(): AudioPlayerContextValue {
  const ctx = useContext(AudioPlayerContext)
  if (!ctx) {
    throw new Error('useAudioPlayer debe usarse dentro de <AudioPlayerProvider>')
  }
  return ctx
}

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentId, setCurrentId] = useState<number | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const pathname = usePathname()

  // Inicialización lazy del Audio element + listeners para sincronizar estado
  // con eventos del browser (end of track, errores de red).
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (audioRef.current) return

    const audio = new Audio()
    audio.preload = 'none'
    audioRef.current = audio

    const onPlaying = () => setStatus('playing')
    const onEnded = () => {
      setStatus('idle')
      setCurrentId(null)
    }
    const onError = () => {
      setStatus('idle')
      setCurrentId(null)
    }
    audio.addEventListener('playing', onPlaying)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)

    return () => {
      audio.removeEventListener('playing', onPlaying)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
      audio.pause()
      audio.removeAttribute('src')
    }
  }, [])

  const pause = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    setStatus('idle')
    setCurrentId(null)
  }, [])

  const toggle = useCallback(
    (propertyId: number, audioUrl: string) => {
      const audio = audioRef.current
      if (!audio) return

      // Mismo id sonando → pausa.
      if (propertyId === currentId && status === 'playing') {
        audio.pause()
        setStatus('idle')
        return
      }

      // Mismo id pausado → reanudar.
      if (propertyId === currentId && status !== 'playing') {
        setStatus('loading')
        void audio.play().catch(() => setStatus('idle'))
        return
      }

      // Id nuevo (o nada estaba sonando) → cambiar track.
      audio.pause()
      audio.src = audioUrl
      audio.load()
      setCurrentId(propertyId)
      setStatus('loading')
      void audio.play().catch(() => {
        setStatus('idle')
        setCurrentId(null)
      })
    },
    [currentId, status],
  )

  // Cortar al cambiar de ruta — evita que el audio siga sonando en otro
  // contexto (ej. user pasa de /propiedades a /nosotros).
  const lastPathnameRef = useRef(pathname)
  useEffect(() => {
    if (lastPathnameRef.current !== pathname) {
      lastPathnameRef.current = pathname
      const audio = audioRef.current
      if (audio && !audio.paused) {
        audio.pause()
        audio.removeAttribute('src')
        audio.load()
      }
      setStatus('idle')
      setCurrentId(null)
    }
  }, [pathname])

  const value = useMemo<AudioPlayerContextValue>(
    () => ({ currentId, status, toggle, pause }),
    [currentId, status, toggle, pause],
  )

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  )
}

// ── Botón circular para placas ─────────────────────────────────────────────
//
// Reemplaza al viejo botón de favoritos en la esquina superior derecha de la
// imagen. Geometría idéntica a la del botón de compartir (36×36, fondo
// blanco, sombra suave). Solo se renderiza si la propiedad tiene audio.

export function PlayAudioButton({
  propertyId,
  audioUrl,
  // `size` en px (default 36, histórico). `className` controla layout/posición
  // (default absolute top-right); para el cluster play+like se pasa un className
  // sin `absolute` y queda como item de un flex. Lógica/AudioPlayer intactos.
  size = 36,
  className = 'absolute top-2.5 right-2.5',
}: {
  propertyId: number
  audioUrl: string
  size?: number
  className?: string
}) {
  const { currentId, status, toggle } = useAudioPlayer()
  const isThis = currentId === propertyId
  const isPlaying = isThis && status === 'playing'
  const isLoading = isThis && status === 'loading'

  const label = isPlaying ? 'Pausar' : isLoading ? 'Cargando audio' : 'Escuchar descripción'
  const Icon = isPlaying ? Pause : isLoading ? Loader2 : Play
  const icon = Math.round(size * 0.5)

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isThis}
      onClick={e => {
        e.preventDefault()
        e.stopPropagation()
        toggle(propertyId, audioUrl)
      }}
      className={`${className} rounded-full bg-white/95 backdrop-blur flex items-center justify-center hover:scale-105 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5C38]`}
      style={{ width: size, height: size }}
    >
      <Icon
        className={`text-gray-700${isLoading ? ' animate-spin' : ''}`}
        // Play tiene una asimetría visual; un pelín de offset lo centra ópticamente.
        style={{ width: icon, height: icon, ...(!isPlaying && !isLoading ? { marginLeft: 2 } : {}) }}
      />
    </button>
  )
}
