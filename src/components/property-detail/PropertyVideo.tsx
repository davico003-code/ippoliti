'use client'

// Facade de video. Muestra de entrada SOLO un poster liviano + el botón play;
// el <iframe>/<video> real se monta recién cuando el usuario hace click.
// Soporta YouTube, Vimeo y MP4.
//
// On play we attempt to enter fullscreen automatically. If the browser
// rejects the request (e.g. Safari iOS without user-gesture chain), we
// silently fall back to inline playback inside the 16:9 container.
import { useRef, useState } from 'react'
import { Play } from 'lucide-react'
import type { TokkoVideo } from '@/lib/tokko'

type EmbedInfo =
  | { kind: 'youtube'; src: string; thumbs: string[] }
  | { kind: 'vimeo'; src: string; thumbs: string[] }
  | { kind: 'mp4'; src: string; thumbs: string[] }
  | null

function parseVideo(v: TokkoVideo, fallbackPoster: string | null): EmbedInfo {
  const rawUrl = v.player_url || v.url || ''
  // YouTube
  const ytId = (() => {
    if (v.provider?.toLowerCase() === 'youtube' && v.video_id) return v.video_id
    const m1 = rawUrl.match(/youtube\.com\/embed\/([\w-]+)/)
    if (m1) return m1[1]
    const m2 = rawUrl.match(/shorts\/([\w-]+)/)
    if (m2) return m2[1]
    const m3 = rawUrl.match(/[?&]v=([\w-]+)/)
    if (m3) return m3[1]
    const m4 = rawUrl.match(/youtu\.be\/([\w-]+)/)
    if (m4) return m4[1]
    return null
  })()
  if (ytId) {
    return {
      kind: 'youtube',
      src: `https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&fs=1`,
      // hqdefault.jpg SIEMPRE existe y es liviano. Evitamos maxresdefault, que
      // a menudo da 404 (no todos los videos lo tienen) y suma latencia. La
      // primera foto de la propiedad queda como fallback (ya cacheada del hero).
      thumbs: [
        `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
        ...(fallbackPoster ? [fallbackPoster] : []),
      ],
    }
  }
  // Vimeo
  const vimeoId = (() => {
    if (v.provider?.toLowerCase() === 'vimeo' && v.video_id) return v.video_id
    const m = rawUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/)
    return m ? m[1] : null
  })()
  if (vimeoId) {
    return {
      kind: 'vimeo',
      src: `https://player.vimeo.com/video/${vimeoId}?fs=1`,
      thumbs: fallbackPoster ? [fallbackPoster] : [],
    }
  }
  // MP4
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(rawUrl)) {
    return { kind: 'mp4', src: rawUrl, thumbs: fallbackPoster ? [fallbackPoster] : [] }
  }
  return null
}

function tryFullscreen(el: HTMLElement | null) {
  if (!el) return
  const req =
    el.requestFullscreen ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (el as any).webkitRequestFullscreen ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (el as any).msRequestFullscreen
  if (typeof req === 'function') {
    try {
      const r = req.call(el)
      if (r && typeof r.catch === 'function') r.catch(() => {})
    } catch {
      // Silently ignore — inline playback is the fallback.
    }
  }
}

function VideoEmbed({ video, fallbackPoster }: { video: TokkoVideo; fallbackPoster: string | null }) {
  const [active, setActive] = useState(false)
  const [thumbIdx, setThumbIdx] = useState(0)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const videoElRef = useRef<HTMLVideoElement>(null)
  const info = parseVideo(video, fallbackPoster)
  if (!info) return null

  const title = video.title || 'Video de la propiedad'
  const currentThumb = info.thumbs[thumbIdx]

  const handlePlay = () => {
    setActive(true)
    // Defer fullscreen until the iframe/video has mounted in the DOM.
    requestAnimationFrame(() => {
      if (info.kind === 'mp4') {
        const v = videoElRef.current
        if (v) {
          v.play().catch(() => {})
          tryFullscreen(v)
          return
        }
      }
      tryFullscreen(wrapperRef.current)
    })
  }

  return (
    <div ref={wrapperRef} className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
      {!active ? (
        <button
          type="button"
          onClick={handlePlay}
          className="group absolute inset-0 flex items-center justify-center focus:outline-none"
          aria-label={`Reproducir ${title}`}
        >
          {currentThumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentThumb}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => setThumbIdx(i => (i + 1 < info.thumbs.length ? i + 1 : i))}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-700" />
          )}
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
          <span
            className="relative z-10 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110"
            style={{
              background: 'rgba(26, 92, 56, 0.92)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '2px solid rgba(255,255,255,0.85)',
            }}
          >
            <Play className="w-9 h-9 md:w-11 md:h-11 text-white ml-1" fill="currentColor" />
          </span>
        </button>
      ) : info.kind === 'mp4' ? (
        <video
          ref={videoElRef}
          src={info.src}
          controls
          autoPlay
          playsInline
          preload="none"
          className="absolute inset-0 w-full h-full"
          poster={currentThumb}
        />
      ) : (
        <iframe
          src={info.src + (info.kind === 'youtube' ? '&autoplay=1' : '&autoplay=1')}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 w-full h-full"
        />
      )}
    </div>
  )
}

export default function PropertyVideo({
  videos,
  fallbackPoster = null,
}: {
  videos: TokkoVideo[] | undefined | null
  fallbackPoster?: string | null
}) {
  const list = (videos ?? []).filter(v => !!(v.player_url || v.url))
  if (list.length === 0) return null

  // La facade es barata (un poster + botón, sin iframe), así que la mostramos
  // de entrada: el poster real aparece al toque y no hay skeleton gris. El
  // <iframe>/<video> sigue montándose recién al click (ver VideoEmbed).
  return (
    <div className="space-y-3">
      {list.map(v => <VideoEmbed key={v.id} video={v} fallbackPoster={fallbackPoster} />)}
    </div>
  )
}
