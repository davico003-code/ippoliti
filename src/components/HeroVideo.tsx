'use client'

import HeroSearch from './HeroSearch'

export default function HeroVideo() {
  return (
    <section
      className="relative w-full h-[420px] md:h-[520px] bg-cover bg-center"
      style={{ backgroundImage: "url('/hero-home.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/35" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-5 md:px-4">
        <div className="w-full max-w-2xl text-center">
          <h1
            className="text-white font-bold drop-shadow-lg"
            style={{
              fontFamily: 'Raleway, sans-serif',
              fontSize: 'clamp(34px, 5vw, 52px)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            Encontr&aacute; tu hogar
          </h1>
          <p
            className="text-white/85 font-normal mt-2 md:mt-3"
            style={{ fontFamily: 'Raleway, sans-serif', fontSize: 'clamp(15px, 2vw, 18px)' }}
          >
            Propiedades en Funes, Rold&aacute;n y Rosario
          </p>

          <div className="mt-6 md:mt-8">
            <HeroSearch />
          </div>

          <p className="text-white/80 mt-4 md:mt-5" style={{ fontSize: 'clamp(13px, 1.5vw, 14px)' }}>
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
