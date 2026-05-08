'use client'

export default function HeroVideoDesktop() {
  return (
    <div
      aria-hidden="true"
      className="hidden md:block absolute inset-0 z-0 overflow-hidden"
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster="/videos/hero-poster.webp"
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/videos/hero-desktop.webm" type="video/webm" />
        <source src="/videos/hero-desktop.mp4" type="video/mp4" />
      </video>
    </div>
  )
}
