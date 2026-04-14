'use client'

import HeroSearch from './HeroSearch'

export default function HeroVideo() {
  return (
    <section
      className="relative w-full bg-cover bg-center"
      style={{ backgroundImage: "url('/hero-home.jpg')", height: 410 }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/35 to-black/55" />

      <div className="relative z-10 h-full flex items-center justify-center px-4">
        <div className="w-full max-w-[620px] text-center">
          <h1
            className="text-white mb-3"
            style={{
              fontFamily: 'var(--font-raleway), Raleway, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(38px, 7vw, 56px)',
              lineHeight: 1,
              letterSpacing: '-0.03em',
              textShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            Encontr&aacute; tu hogar
          </h1>
          <p className="mb-6 md:mb-8" style={{
            fontFamily: 'var(--font-raleway), Raleway, sans-serif',
            fontWeight: 500, fontSize: 'clamp(15px, 2vw, 17px)' as string, color: 'rgba(255,255,255,0.85)',
          }}>
            Propiedades en Funes, Rold&aacute;n y Rosario
          </p>
          <HeroSearch />
        </div>
      </div>
    </section>
  )
}
