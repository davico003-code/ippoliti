'use client'

import HeroSearch from './HeroSearch'

export default function HeroVideo() {
  return (
    <section
      className="relative w-full h-[70vh] max-h-[500px] md:h-[560px] md:max-h-none bg-cover bg-center"
      style={{ backgroundImage: "url('/hero-home.jpg')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/35 to-black/55" />

      <div className="relative z-10 h-full flex items-center justify-center px-5 md:px-4">
        <div className="w-full max-w-[720px] text-center">
          {/* Title */}
          <h1
            className="text-white mb-2"
            style={{
              fontFamily: 'var(--font-raleway), Raleway, sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(42px, 7vw, 64px)',
              lineHeight: 0.95,
              letterSpacing: '-0.02em',
              textShadow: '0 2px 12px rgba(0,0,0,0.35)',
            }}
          >
            Encontr&aacute; tu hogar
          </h1>

          {/* Subtitle */}
          <p
            className="text-white/90 mt-1"
            style={{
              fontFamily: 'var(--font-raleway), Raleway, sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(14px, 2vw, 18px)',
            }}
          >
            Propiedades en Funes, Rold&aacute;n y Rosario
          </p>

          {/* Search */}
          <div className="mt-5 md:mt-6">
            <HeroSearch />
          </div>

          {/* Contact link */}
          <p className="mt-3 md:mt-4 text-white/80" style={{ fontSize: 'clamp(12px, 1.3vw, 14px)' }}>
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
