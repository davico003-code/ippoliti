'use client'

// Lazy-loaded video embed. Renders a poster with a play button and mounts
// the real iframe/video element only after the user clicks (or the section
// enters the viewport, whichever comes first). Supports YouTube, Vimeo, MP4.
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Play } from 'lucide-react'
import type { TokkoVideo } from '@/lib/tokko'

type EmbedInfo =
  | { kind: 'youtube'; src: string; thumb: string }
  | { kind: 'vimeo'; src: string; thumb: string | null }
  | { kind: 'mp4'; src: string; thumb: string | null }
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
      src: `https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`,
      thumb: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
    }
  }
  // Vimeo
  const vimeoId = (() => {
    if (v.provider?.toLowerCase() === 'vimeo' && v.video_id) return v.video_id
    const m = rawUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/)
    return m ? m[1] : null
  })()
  if (vimeoId) {
    return { kind: 'vimeo', src: `https://player.vimeo.com/video/${vimeoId}`, thumb: fallbackPoster }
  }
  // MP4
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(rawUrl)) {
    return { kind: 'mp4', src: rawUrl, thumb: fallbackPoster }
  }
  return null
}

function VideoEmbed({ video, fallbackPoster }: { video: TokkoVideo; fallbackPoster: string | null }) {
  const [active, setActive] = useState(false)
  const info = parseVideo(video, fallbackPoster)
  if (!info) return null

  const title = video.title || 'Video de la propiedad'

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
      {!active ? (
        <button
          type="button"
          onClick={() => setActive(true)}
          className="group absolute inset-0 flex items-center justify-center focus:outline-none"
          aria-label={`Reproducir ${title}`}
        >
          {info.thumb ? (
            <Image
              src={info.thumb}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 900px"
              className="object-cover"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-700" />
          )}
          <div className="absolute inset-0 bg-black/35 group-hover:bg-black/25 transition-colors" />
          <span className="relative z-10 w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/95 group-hover:scale-105 transition-transform flex items-center justify-center shadow-lg">
            <Play className="w-7 h-7 md:w-8 md:h-8 text-[#1A5C38] ml-1" fill="currentColor" />
          </span>
        </button>
      ) : info.kind === 'mp4' ? (
        <video
          src={info.src}
          controls
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full"
          poster={info.thumb ?? undefined}
        />
      ) : (
        <iframe
          src={info.src + (info.kind === 'youtube' ? '&autoplay=1' : '?autoplay=1')}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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
  const rootRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const list = (videos ?? []).filter(v => !!(v.player_url || v.url))

  useEffect(() => {
    if (visible) return
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting) { setVisible(true); io.disconnect() }
    }, { rootMargin: '300px' })
    io.observe(el)
    return () => io.disconnect()
  }, [visible])

  if (list.length === 0) return null

  return (
    <div ref={rootRef} className="space-y-3">
      {visible ? (
        list.map(v => <VideoEmbed key={v.id} video={v} fallbackPoster={fallbackPoster} />)
      ) : (
        // Skeleton with aspect-video para no causar CLS
        <div className="w-full aspect-video rounded-xl bg-gray-100 animate-pulse" />
      )}
    </div>
  )
}
