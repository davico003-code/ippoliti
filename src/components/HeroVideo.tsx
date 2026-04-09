'use client'

import HeroSearch from './HeroSearch'

export default function HeroVideo() {
  return (
    <section
      className="relative w-full h-[440px] md:h-[520px] bg-cover bg-center"
      style={{ backgroundImage: "url('/hero-home.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/45" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-2xl text-center">
          <h1
            className="text-white text-4xl md:text-5xl font-bold leading-tight drop-shadow-lg"
            style={{ fontFamily: 'Raleway, sans-serif' }}
          >
            Encontr&aacute; tu hogar
          </h1>
          <p
            className="text-white/80 text-base md:text-lg font-normal mt-3"
            style={{ fontFamily: 'Raleway, sans-serif' }}
          >
            Propiedades en Funes, Rold&aacute;n y Rosario
          </p>

          <div className="mt-8">
            <HeroSearch />
          </div>

          <p className="text-white/80 text-sm mt-5">
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
