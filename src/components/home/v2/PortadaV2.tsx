// Portada a pantalla completa (como SERHANT): video de fondo, titular grande
// centrado y buscador. Usa la misma portada viva de la home (desenfoque al
// bajar). La sección siguiente se monta encima con las esquinas redondeadas.

import HeroSearch from '@/components/HeroSearch'
import PortadaViva from '../PortadaViva'
import CiudadRotativa from '../CiudadRotativa'
import { RALEWAY } from './ui'

const VELO = 'radial-gradient(65% 55% at 50% 45%, rgba(0,0,0,.38) 0%, rgba(0,0,0,0) 100%), linear-gradient(to bottom, rgba(0,0,0,.45) 0%, rgba(0,0,0,.12) 30%, rgba(0,0,0,.18) 70%, rgba(0,0,0,.5) 100%)'

export default function PortadaV2() {
  return (
    <section className="relative w-full" style={{ height: '100svh', minHeight: 620 }}>
      <div className="hidden md:block">
        <PortadaViva poster="/images/hero/portada-viva.webp" video="/videos/portada-viva.mp4" sizes="(min-width: 768px) 100vw, 1px" velo={VELO} />
      </div>
      <div className="md:hidden">
        <PortadaViva poster="/images/hero/portada-viva-mobile.webp" video="/videos/portada-viva-mobile.mp4" sizes="(max-width: 767px) 100vw, 1px" velo={VELO} />
      </div>
      <div data-portada-contenido className="relative z-10 flex h-full items-center justify-center px-5 pb-16" style={{ willChange: 'transform' }}>
        <div className="w-full max-w-[860px] text-center text-white">
          <h1 style={{ fontFamily: RALEWAY, fontWeight: 800, fontSize: 'clamp(46px, 7.6vw, 104px)', lineHeight: 0.98, letterSpacing: '-0.045em', textShadow: '0 4px 30px rgba(0,0,0,.35)' }}>
            {['Encontrá', 'tu', 'hogar'].map((w, i) => (
              <span key={w} className="portada-in inline-block" style={{ ['--d' as string]: `${120 + i * 110}ms`, marginRight: i < 2 ? '0.22em' : 0 }}>{w}</span>
            ))}
          </h1>
          <p className="portada-in mt-4" style={{ ['--d' as string]: '520ms', fontFamily: RALEWAY, fontWeight: 600, fontSize: 'clamp(16px, 1.6vw, 21px)', color: 'rgba(255,255,255,.95)', textShadow: '0 2px 12px rgba(0,0,0,.5)' }}>
            Desde 1983, propiedades en <CiudadRotativa />
          </p>
          <div className="portada-in mx-auto mt-8 max-w-[620px]" style={{ ['--d' as string]: '680ms' }}>
            <HeroSearch />
          </div>
        </div>
      </div>
    </section>
  )
}
