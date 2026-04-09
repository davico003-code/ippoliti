'use client'

import HeroSearch from './HeroSearch'

export default function HeroVideo() {
  return (
    <section
      className="relative h-[60vh] md:h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: "url('/hero-home.jpg')" }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
        <div className="w-[90%] max-w-[480px]">
          {/* H1 heading */}
          <h1 className="text-white text-3xl md:text-5xl font-bold text-center drop-shadow-lg" style={{fontFamily: 'Raleway, sans-serif'}}>
            Encontr&aacute; tu hogar
          </h1>
          <p className="text-white/80 text-lg md:text-xl font-normal text-center mt-1 mb-4" style={{fontFamily: 'Raleway, sans-serif'}}>
            Propiedades en Funes, Rold&aacute;n y Rosario
          </p>

          {/* Search */}
          <HeroSearch />

          <p className="text-white/60 text-sm text-center mt-3">
            &iquest;Quer&eacute;s vender tu propiedad?{' '}
            <a href="/tasaciones" className="text-white/80 underline underline-offset-2 hover:text-white transition-colors">
              Contactanos
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
