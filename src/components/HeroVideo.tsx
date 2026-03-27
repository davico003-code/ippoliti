'use client'

import Link from 'next/link'
import { Map } from 'lucide-react'
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
        <div className="w-[90%] max-w-[800px]">
          {/* H1 heading */}
          <h1 className="text-white text-4xl md:text-6xl font-bold text-center drop-shadow-lg mb-8" style={{fontFamily: 'Raleway, sans-serif'}}>
            Encontr&aacute; tu hogar<br/>
            <span className="text-3xl md:text-4xl font-normal">Propiedades en Funes, Rold&aacute;n y Rosario zona oeste</span>
          </h1>

          {/* Search */}
          <HeroSearch />

          {/* Map link */}
          <div className="flex justify-center mt-4">
            <Link
              href="/propiedades"
              className="inline-flex items-center gap-2 border-2 border-white/60 text-white hover:bg-white hover:text-brand-600 px-6 py-3 rounded-full font-semibold text-sm transition-all backdrop-blur-sm"
            >
              <Map className="w-4 h-4" />
              Búsqueda por Mapa
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
