'use client'

import HeroSearch from './HeroSearch'
import HeroVideoDesktop from './home/HeroVideoDesktop'
import CiudadRotativa from './home/CiudadRotativa'

export default function HeroVideo() {
  return (
    <section
      className="hero-video-section relative w-full md:-mt-[77px] md:pt-[77px]"
      style={{ height: 'clamp(560px, 80svh, 780px)' }}
    >
      <HeroVideoDesktop />
      <div
        data-portada-contenido
        className="relative z-10 h-full flex items-start justify-center px-4"
        style={{ paddingTop: 'clamp(120px, 22svh, 200px)', willChange: 'transform, opacity' }}
      >
        <div className="w-full max-w-[720px] text-center">
          <h2
            className="text-white mb-4"
            style={{
              fontFamily: 'var(--font-raleway), Raleway, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(44px, 6.4vw, 84px)',
              lineHeight: 1,
              letterSpacing: '-0.04em',
              textShadow: '0 2px 24px rgba(0,0,0,0.35)',
            }}
          >
            {['Encontrá', 'tu', 'hogar'].map((w, i) => (
              <span key={w} className="portada-in inline-block" style={{ ['--d' as string]: `${120 + i * 110}ms`, marginRight: i < 2 ? '0.24em' : 0 }}>
                {w}
              </span>
            ))}
          </h2>
          <p className="portada-in mb-6" style={{
            ['--d' as string]: '520ms',
            fontFamily: 'var(--font-raleway), Raleway, sans-serif',
            fontWeight: 600, fontSize: 'clamp(17px, 1.6vw, 21px)', color: 'rgba(255,255,255,0.96)',
            textShadow: '0 2px 12px rgba(0,0,0,0.5)',
          }}>
            Propiedades en <CiudadRotativa />
          </p>
          <div className="portada-in portada-buscador" style={{ ['--d' as string]: '680ms' }}>
            <HeroSearch />
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .portada-buscador form { box-shadow: 0 0 0 1px rgba(255,255,255,.35), 0 18px 50px -12px rgba(0,0,0,.45) !important; transition: box-shadow 300ms ease, transform 300ms cubic-bezier(.2,.7,.2,1); }
        .portada-buscador form:focus-within { transform: scale(1.015); box-shadow: 0 0 0 4px rgba(255,255,255,.28), 0 24px 60px -12px rgba(0,0,0,.5) !important; }
      ` }} />
    </section>
  )
}
