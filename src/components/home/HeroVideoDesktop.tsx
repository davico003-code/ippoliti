'use client'

import { useEffect, useRef } from 'react'

export default function HeroVideoDesktop() {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const setVideoRef = (node: HTMLVideoElement | null) => {
    videoRef.current = node
    if (node) {
      node.defaultMuted = true
      node.muted = true
    }
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = true
    const playPromise = video.play()
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        const resume = () => {
          video.play().catch(() => {})
        }
        document.addEventListener('click', resume, { once: true })
        document.addEventListener('touchstart', resume, { once: true })
      })
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className="hidden md:block absolute inset-0 z-0 overflow-hidden"
    >
      <video
        ref={setVideoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/videos/hero-poster.webp"
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
        onLoadedData={(e) => {
          const v = e.currentTarget
          v.muted = true
          v.play().catch(() => {})
        }}
      >
        <source src="/videos/hero-desktop.mp4" type="video/mp4" />
        <source src="/videos/hero-desktop.webm" type="video/webm" />
      </video>
    </div>
  )
}
