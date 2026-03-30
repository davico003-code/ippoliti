'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface Props {
  photos: string[]
  title: string
  price: string
}

export default function MobileGallery({ photos, title, price }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const total = photos.length

  const scrollTo = useCallback((index: number) => {
    const el = containerRef.current
    if (!el) return
    const target = index * el.clientHeight
    el.scrollTo({ top: target, behavior: 'smooth' })
  }, [])

  // Detect current photo from scroll position
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const h = el.clientHeight
        if (h > 0) setCurrent(Math.round(el.scrollTop / h))
        ticking = false
      })
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  // Autoplay
  useEffect(() => {
    if (paused || total <= 1) return
    autoTimer.current = setTimeout(() => {
      const next = current + 1 < total ? current + 1 : 0
      scrollTo(next)
    }, 3000)
    return () => { if (autoTimer.current) clearTimeout(autoTimer.current) }
  }, [current, paused, total, scrollTo])

  // Pause on touch, resume after 5s idle
  const handleInteraction = useCallback(() => {
    setPaused(true)
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    resumeTimer.current = setTimeout(() => setPaused(false), 5000)
  }, [])

  useEffect(() => {
    return () => { if (resumeTimer.current) clearTimeout(resumeTimer.current) }
  }, [])

  if (total === 0) return null

  return (
    <div className="md:hidden relative" style={{ height: '70vh' }}>
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 px-3 pt-3">
        {photos.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.3)' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                background: '#fff',
                width: i < current ? '100%' : i === current ? '100%' : '0%',
                opacity: i <= current ? 1 : 0.3,
              }}
            />
          </div>
        ))}
      </div>

      {/* Scroll container */}
      <div
        ref={containerRef}
        onTouchStart={handleInteraction}
        onMouseDown={handleInteraction}
        className="h-full overflow-y-scroll"
        style={{
          scrollSnapType: 'y mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style>{`.mobile-gallery::-webkit-scrollbar{display:none}`}</style>
        {photos.map((photo, i) => (
          <div
            key={i}
            className="relative w-full"
            style={{ height: '70vh', scrollSnapAlign: 'start' }}
          >
            <Image
              src={photo}
              alt={`${title} - Foto ${i + 1}`}
              fill
              className="object-cover"
              sizes="100vw"
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {/* Bottom overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-20" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)' }}>
        <div className="px-5 pb-5 pt-12">
          <p className="text-white font-bold text-lg leading-tight line-clamp-2">{title}</p>
          <p className="text-white font-black text-2xl mt-1 font-numeric">{price}</p>
          <p className="text-white/50 text-xs mt-1">{current + 1} / {total} fotos</p>
        </div>
      </div>
    </div>
  )
}
