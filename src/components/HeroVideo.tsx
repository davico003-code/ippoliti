'use client'

import HeroSearch from './HeroSearch'
import HeroVideoDesktop from './home/HeroVideoDesktop'

export default function HeroVideo() {
  return (
    <section
      className="hero-video-section relative w-full h-[547px] md:-mt-[77px] md:pt-[77px]"
    >
      <HeroVideoDesktop />
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/30 to-black/45" />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[120px] bg-gradient-to-b from-black/60 to-transparent pointer-events-none"
      />

      <div className="relative z-10 h-full flex items-start justify-center px-4 pt-[140px]">
        <div className="w-full max-w-[620px] text-center">
          <h1
            className="text-white mb-3"
            style={{
              fontFamily: 'var(--font-raleway), Raleway, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(38px, 7vw, 56px)',
              lineHeight: 1,
              letterSpacing: '-0.03em',
              textShadow: '0 2px 8px rgba(0,0,0,0.6), 0 0 20px rgba(0,0,0,0.4)',
            }}
          >
            Encontr&aacute; tu hogar
          </h1>
          <p className="mb-3 md:mb-4" style={{
            fontFamily: 'var(--font-raleway), Raleway, sans-serif',
            fontWeight: 600, fontSize: 'clamp(15px, 2vw, 17px)' as string, color: 'rgba(255,255,255,0.95)',
            textShadow: '0 2px 8px rgba(0,0,0,0.6), 0 0 20px rgba(0,0,0,0.4)',
          }}>
            Propiedades en Funes, Rold&aacute;n y Rosario
          </p>
          <HeroSearch />
        </div>
      </div>
    </section>
  )
}
