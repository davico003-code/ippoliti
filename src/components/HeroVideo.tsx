'use client'

import HeroSearch from './HeroSearch'

export default function HeroVideo() {
  return (
    <section
      className="relative w-full h-[500px] md:h-[560px] bg-cover bg-center"
      style={{ backgroundImage: "url('/hero-home.jpg')" }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/50" />

      <div className="relative z-10 h-full flex items-center justify-center px-5 md:px-4">
        <div className="w-full max-w-[720px] text-center">
          {/* Eyebrow — live counter */}
          <p className="flex items-center justify-center gap-2 mb-3 md:mb-4">
            <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
            <span
              className="text-white/90 uppercase"
              style={{
                fontFamily: 'Raleway, sans-serif',
                fontSize: 'clamp(11px, 1.2vw, 13px)',
                fontWeight: 600,
                letterSpacing: '0.15em',
              }}
            >
              200+ propiedades activas en la zona oeste de Rosario
            </span>
          </p>

          {/* Title */}
          <h1
            className="text-white mb-2"
            style={{
              fontFamily: 'Raleway, sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(44px, 6vw, 64px)',
              lineHeight: 0.95,
              letterSpacing: '-0.02em',
              textShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            Encontr&aacute; tu hogar
          </h1>

          {/* Subtitle */}
          <p
            className="text-white/95 mt-1"
            style={{
              fontFamily: 'Raleway, sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(15px, 1.8vw, 18px)',
            }}
          >
            Propiedades en Funes, Rold&aacute;n y Rosario
          </p>

          {/* Search */}
          <div className="mt-6">
            <HeroSearch />
          </div>

          {/* Contact link */}
          <p className="mt-3 md:mt-4" style={{ fontSize: 'clamp(12px, 1.3vw, 14px)', color: 'rgba(255,255,255,0.85)' }}>
            &iquest;Quer&eacute;s vender tu propiedad?{' '}
            <a href="/tasaciones" className="text-white underline underline-offset-2 hover:text-white/90 transition-colors">
              Contactanos
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
