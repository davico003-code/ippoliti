'use client'

// Carrusel marquee de proyectos destacados (Sección 3), compartido por el
// árbol desktop (EmprendimientosHome) y mobile (ProyectosCarousel).
//
// - Auto-scroll horizontal infinito en CSS (38s linear), PAUSA en hover.
// - Lista duplicada x2 en el DOM para el loop continuo (-50% - gap/2).
// - Máscara de fade en los bordes (mask-image).
// - Cards 1:1 ~300px, badge glass, hover = zoom + "Ver proyecto →".
// - withVideo: en desktop usa ProjectMediaCard (video al hover). En mobile
//   se pasa false → imagen estática (no se descarga video).

import { useState } from 'react'
import Link from 'next/link'
import ProjectMediaCard from '@/components/home/ProjectMediaCard'
import { PROYECTOS_DESTACADOS } from './proyectosDestacados'

const R = "var(--font-raleway), 'Raleway', system-ui, sans-serif"
const P = "var(--font-poppins), 'Poppins', system-ui, sans-serif"

export default function ProyectosMarquee({ withVideo = false }: { withVideo?: boolean }) {
  // Solo una card (por instancia duplicada) reproduce video a la vez.
  const [hoveringKey, setHoveringKey] = useState<string | null>(null)

  // x2 para el loop continuo sin corte.
  const loop = [...PROYECTOS_DESTACADOS, ...PROYECTOS_DESTACADOS]

  return (
    <div className="pm-marquee">
      <div className="pm-track">
        {loop.map((item, i) => {
          const key = `${item.id}-${i}`
          return (
            <Link key={key} href={item.href} className="pm-card" aria-label={item.title}
              onMouseEnter={() => setHoveringKey(key)}
              onMouseLeave={() => setHoveringKey(prev => (prev === key ? null : prev))}
            >
              <ProjectMediaCard
                imageUrl={item.image}
                videoUrl={withVideo ? item.videoUrl : undefined}
                alt={item.title}
                sizes="300px"
                isHovering={hoveringKey === key}
              />
              <div className="pm-ov" />
              <span className="pm-badge">{item.badge}</span>
              <div className="pm-content">
                <h3>{item.title}</h3>
                <p className="pm-loc">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  {item.location}
                </p>
                <p className="pm-pr">{item.pago}</p>
                <div className="pm-reveal">
                  <span>Ver proyecto →</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <style>{`
        .pm-marquee{
          position:relative; width:100%; overflow:hidden;
          -webkit-mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent);
          mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent);
        }
        .pm-track{
          display:flex; gap:22px; width:max-content; padding:6px 24px;
          animation:pm-scroll 38s linear infinite;
        }
        .pm-marquee:hover .pm-track{ animation-play-state:paused; }
        @keyframes pm-scroll{
          from{ transform:translateX(0); }
          to{ transform:translateX(calc(-50% - 11px)); }
        }
        .pm-card{
          position:relative; flex:0 0 auto; width:300px; aspect-ratio:1/1;
          border-radius:22px; overflow:hidden; text-decoration:none;
          box-shadow:0 6px 20px rgba(0,0,0,.12);
          transition:transform .4s cubic-bezier(.2,.7,.2,1), box-shadow .4s;
        }
        .pm-card:hover{ transform:translateY(-6px) scale(1.02); box-shadow:0 20px 44px rgba(0,0,0,.22); }
        .pm-card .emp-card-img{ transition:transform .7s ease; }
        .pm-card:hover .emp-card-img{ transform:scale(1.1); }
        .pm-ov{
          position:absolute; inset:0; pointer-events:none;
          background:linear-gradient(to top,rgba(0,0,0,.8) 0%,rgba(0,0,0,.12) 55%,transparent 100%);
        }
        .pm-badge{
          position:absolute; top:14px; left:14px;
          background:rgba(255,255,255,.16); backdrop-filter:blur(10px);
          border:1px solid rgba(255,255,255,.28); color:#fff;
          font:600 10.5px ${P}; text-transform:uppercase; letter-spacing:.6px;
          padding:6px 12px; border-radius:9999px;
        }
        .pm-content{ position:absolute; left:0; right:0; bottom:0; padding:20px; color:#fff; }
        .pm-content h3{ font:700 21px ${R}; letter-spacing:-.01em; margin:0; }
        .pm-loc{ font:500 13px ${P}; color:rgba(255,255,255,.92); margin:5px 0 0; display:flex; align-items:center; gap:4px; }
        .pm-pr{ font:400 12.5px ${P}; color:rgba(255,255,255,.78); margin:6px 0 0; }
        .pm-reveal{ max-height:0; opacity:0; overflow:hidden; transition:max-height .4s ease, opacity .4s ease, margin .4s; }
        .pm-card:hover .pm-reveal{ max-height:40px; opacity:1; margin-top:10px; }
        .pm-reveal span{ display:inline-flex; align-items:center; gap:5px; font:700 13px ${P}; color:#fff; }
        @media (prefers-reduced-motion: reduce){
          .pm-track{ animation:none; }
          .pm-card .emp-card-img{ transition:none; }
          .pm-card:hover .emp-card-img{ transform:none; }
        }
      `}</style>
    </div>
  )
}
