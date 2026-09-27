'use client'

import PortadaViva from './PortadaViva'

export default function HeroVideoDesktop() {
  return (
    <div className="hidden md:block">
      <PortadaViva
        poster="/images/hero/portada-viva.webp"
        video="/videos/portada-viva.mp4"
        sizes="(min-width: 768px) 100vw, 1px"
        radio={36}
        margen={28}
        velo={
          'radial-gradient(60% 50% at 50% 38%, rgba(0,0,0,0.34) 0%, rgba(0,0,0,0) 100%),' +
          'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.12) 22%, rgba(0,0,0,0.1) 70%, rgba(0,0,0,0.38) 100%)'
        }
      />
    </div>
  )
}
