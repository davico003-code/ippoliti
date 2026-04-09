'use client'

import HeroSearch from './HeroSearch'

export default function HeroVideo() {
  return (
    <section
      className="relative w-full h-[400px] md:h-[480px] bg-cover bg-center"
      style={{ backgroundImage: "url('/hero-home.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-5 md:px-4">
        <div className="w-full max-w-2xl text-center" style={{ transform: 'translateY(clamp(-16px, -1.5vw, -20px))' }}>
          <h1
            className="text-white font-bold drop-shadow-lg mb-1 md:mb-2"
            style={{
              fontFamily: 'Raleway, sans-serif',
              fontSize: 'clamp(32px, 4.5vw, 44px)',
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}
          >
            Encontr&aacute; tu hogar
          </h1>
          <p
            className="text-white/85 font-normal mt-1"
            style={{ fontFamily: 'Raleway, sans-serif', fontSize: 'clamp(14px, 1.8vw, 16px)' }}
          >
            Propiedades en Funes, Rold&aacute;n y Rosario
          </p>

          <div className="mt-4 md:mt-5">
            <HeroSearch />
          </div>

          <p className="text-white/80 mt-3" style={{ fontSize: 'clamp(12px, 1.3vw, 14px)' }}>
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
