'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'

interface Props {
  photos: string[]
  title: string
  price: string
  initialIndex: number
  onClose: () => void
}

export default function MobileGallery({ photos, title, price, initialIndex, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(initialIndex)
  const [paused, setPaused] = useState(false)
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didScroll = useRef(false)

  const total = photos.length

  const scrollTo = useCallback((index: number) => {
    const el = containerRef.current
    if (!el) return
    el.scrollTo({ top: index * el.clientHeight, behavior: 'smooth' })
  }, [])

  // Scroll to initial index on mount
  useEffect(() => {
    if (didScroll.current) return
    didScroll.current = true
    const el = containerRef.current
    if (!el) return
    requestAnimationFrame(() => {
      el.scrollTo({ top: initialIndex * el.clientHeight, behavior: 'instant' as ScrollBehavior })
    })
  }, [initialIndex])

  // Detect current from scroll
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

  // Pause on interaction, resume after 5s
  const handleInteraction = useCallback(() => {
    setPaused(true)
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    resumeTimer.current = setTimeout(() => setPaused(false), 5000)
  }, [])

  useEffect(() => {
    return () => { if (resumeTimer.current) clearTimeout(resumeTimer.current) }
  }, [])

  // Close on escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  if (total === 0) return null

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-40 flex gap-1 px-3 pt-3">
        {photos.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.3)' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                background: '#fff',
                width: i <= current ? '100%' : '0%',
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
        <style>{`.mobile-gallery-fs::-webkit-scrollbar{display:none}`}</style>
        {photos.map((photo, i) => (
          <div key={i} className="relative w-full h-screen" style={{ scrollSnapAlign: 'start' }}>
            <Image
              src={photo}
              alt={`${title} - Foto ${i + 1}`}
              fill
              className="object-cover"
              sizes="100vw"
              priority={i === initialIndex}
            />
          </div>
        ))}
      </div>

      {/* Bottom overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-40 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)' }}>
        <div className="px-5 pb-8 pt-16">
          <p className="text-white font-bold text-lg leading-tight line-clamp-2">{title}</p>
          <p className="text-white font-black text-2xl mt-1 font-numeric">{price}</p>
          <p className="text-white/50 text-xs mt-1">{current + 1} / {total}</p>
        </div>
      </div>
    </div>
  )
}
