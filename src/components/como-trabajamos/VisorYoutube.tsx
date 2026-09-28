'use client'

// Videos de YouTube dentro de la presentación: al tocar play el video se abre
// en un visor mediano sobre la página (no en la tarjeta chica ni en YouTube),
// para que se vea en buena calidad y nunca se pierda la presentación.
// - Tamaño: lo más grande que entra sin tapar todo (YouTube elige la calidad
//   según el tamaño del reproductor: más grande = HD). vq=hd1080 lo pide
//   explícito donde YouTube todavía lo respeta.
// - Maximizar: el botón de pantalla completa del propio reproductor.
// - Cerrar: la X, Esc, tocar afuera o cuando el video termina.
// - Se monta en un portal sobre <body>: los .ct-rev de la página
//   llevan transform y romperían el position:fixed del visor.

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

/**
 * Capa oscura a pantalla completa con el contenido centrado y la X arriba a la
 * derecha. Cierra con Esc o tocando afuera y bloquea el scroll de la página
 * mientras está abierta.
 */
function CapaVisor({ etiqueta, onCerrar, children }: { etiqueta: string; onCerrar: () => void; children: React.ReactNode }) {
  const cerrar = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previo = document.activeElement as HTMLElement | null
    cerrar.current?.focus()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar()
    }
    window.addEventListener('keydown', alTeclear)
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('keydown', alTeclear)
      previo?.focus?.()
    }
  }, [onCerrar])

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={etiqueta}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8"
      style={{ background: 'rgba(4,12,8,.86)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar()
      }}
    >
      {children}
      <button
        ref={cerrar}
        type="button"
        onClick={onCerrar}
        aria-label="Cerrar y volver a la presentación"
        className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 md:right-6 md:top-6"
      >
        <X size={22} aria-hidden />
      </button>
    </div>,
    document.body,
  )
}

function Visor({ id, titulo, vertical, onCerrar }: { id: string; titulo: string; vertical: boolean; onCerrar: () => void }) {
  const iframe = useRef<HTMLIFrameElement>(null)

  // Cuando el video termina (estado 0 de la API del iframe) volvemos solos a
  // la presentación.
  useEffect(() => {
    const alMensaje = (e: MessageEvent) => {
      if (!/^https:\/\/www\.youtube(-nocookie)?\.com$/.test(e.origin)) return
      try {
        const d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data
        const estado = d?.event === 'onStateChange' ? d.info : d?.info?.playerState
        if (estado === 0) onCerrar()
      } catch {
        // Mensaje que no es de la API: se ignora.
      }
    }
    window.addEventListener('message', alMensaje)
    return () => window.removeEventListener('message', alMensaje)
  }, [onCerrar])

  const escuchar = () => iframe.current?.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), '*')

  const params = new URLSearchParams({ autoplay: '1', rel: '0', playsinline: '1', vq: 'hd1080', iv_load_policy: '3', enablejsapi: '1' })

  return (
    <CapaVisor etiqueta={titulo} onCerrar={onCerrar}>
      <figure className="m-0 flex flex-col items-center">
        <div
          className="relative overflow-hidden rounded-[18px] bg-black shadow-2xl"
          style={
            vertical
              ? { height: 'min(84svh, 860px, calc((100vw - 32px) * 16 / 9))', aspectRatio: '9 / 16' }
              : { width: 'min(1120px, calc(100vw - 32px), calc((84svh - 40px) * 16 / 9))', aspectRatio: '16 / 9' }
          }
        >
          <iframe
            ref={iframe}
            src={`https://www.youtube.com/embed/${id}?${params}`}
            title={titulo}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            onLoad={escuchar}
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
        <figcaption className="mt-3 max-w-full truncate text-center text-[14px] font-bold text-white/85">{titulo}</figcaption>
      </figure>
    </CapaVisor>
  )
}

/**
 * Póster con botón de play que abre el video en el visor. El póster lo
 * dibuja quien lo usa (children), así cada sección mantiene su tarjeta.
 */
export default function VisorYoutube({
  id,
  titulo,
  vertical = false,
  className = '',
  children,
}: {
  id: string
  titulo: string
  vertical?: boolean
  className?: string
  children: React.ReactNode
}) {
  const [abierto, setAbierto] = useState(false)
  const cerrar = useCallback(() => setAbierto(false), [])
  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-label={`Reproducir: ${titulo}`}
        className={`group relative block w-full cursor-pointer overflow-hidden border-0 bg-black p-0 text-left ${className}`}
      >
        {children}
      </button>
      {abierto && <Visor id={id} titulo={titulo} vertical={vertical} onCerrar={cerrar} />}
    </>
  )
}

/** Botón de play blanco con el triángulo verde, centrado sobre el póster. */
export function BotonPlay({ chico = false }: { chico?: boolean }) {
  const t = chico ? 'h-12 w-12' : 'h-16 w-16 md:h-20 md:w-20'
  return (
    <span className="absolute inset-0 flex items-center justify-center">
      <span
        className={`${t} flex items-center justify-center rounded-full shadow-2xl transition-transform group-hover:scale-110`}
        style={{ background: 'rgba(255,255,255,0.95)' }}
      >
        <svg width={chico ? 18 : 26} height={chico ? 18 : 26} viewBox="0 0 26 26" aria-hidden style={{ marginLeft: chico ? 3 : 4 }}>
          <path d="M3 1 L24 13 L3 25 Z" fill="#1A5C38" />
        </svg>
      </span>
    </span>
  )
}

/**
 * Póster del video en alta (maxresdefault). No todos los videos lo tienen:
 * si falla, cae al de calidad media.
 */
export function PosterYoutube({ id }: { id: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`}
      onError={(e) => {
        const img = e.currentTarget
        if (!img.src.includes('hqdefault')) img.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
      }}
      alt=""
      loading="lazy"
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
    />
  )
}
