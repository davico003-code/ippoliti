// Sección 3 — "Proyectos destacados" como MOSAICO estático (bento).
// Reemplaza al marquee. Sin animación de scroll, sin duplicado, sin video:
// los 4 proyectos se renderizan una sola vez, imagen de fondo con zoom suave
// al hover. Compartido por el árbol desktop (EmprendimientosHome) y mobile
// (ProyectosCarousel); el layout es responsive (≤767px apila sin solaparse).
//
// Tamaño por posición:  [0] big (2×2) · [1] wide (2×1) · [2] y [3] sm (1×1).

import Link from 'next/link'
import Image from 'next/image'
import { PROYECTOS_DESTACADOS } from './proyectosDestacados'

const R = "var(--font-raleway), 'Raleway', system-ui, sans-serif"
const P = "var(--font-poppins), 'Poppins', system-ui, sans-serif"

const SIZES = ['big', 'wide', 'sm', 'sm'] as const

export default function ProyectosMosaico() {
  return (
    <div className="proj-bento">
      <div className="bento">
        {PROYECTOS_DESTACADOS.map((item, i) => {
          const size = SIZES[i] ?? 'sm'
          const isSm = size === 'sm'
          const imgSizes = isSm
            ? '(max-width:767px) 50vw, 300px'
            : '(max-width:767px) 100vw, 600px'
          return (
            <Link key={item.id} href={item.href} className={`tile ${size}`} aria-label={item.title}>
              <div className="bg">
                <Image src={item.image} alt={item.title} fill className="tile-img" sizes={imgSizes} />
              </div>
              <div className="ov" />
              <span className="pbadge">{item.badge}</span>
              <div className="pc">
                <h3>{item.title}</h3>
                {isSm ? (
                  <p className="loc">📍 {item.location} · {item.pago.split(' · ')[0]}</p>
                ) : (
                  <>
                    <p className="loc">📍 {item.location}</p>
                    <p className="pr">{item.pago}</p>
                  </>
                )}
                <p className="go">Ver proyecto →</p>
              </div>
            </Link>
          )
        })}
      </div>

      <Link href="/emprendimientos" className="seehint">Ver todos los emprendimientos →</Link>

      <style dangerouslySetInnerHTML={{ __html: `
        .proj-bento{ --green:#1A5C38; }
        .proj-bento .bento{ display:grid; grid-template-columns:repeat(4,1fr); grid-auto-rows:198px; gap:14px; margin-top:20px; }
        .proj-bento .big{ grid-column:span 2; grid-row:span 2; }
        .proj-bento .wide{ grid-column:span 2; }

        .proj-bento .tile{ position:relative; border-radius:20px; overflow:hidden; display:block; text-decoration:none; color:inherit; box-shadow:0 6px 20px rgba(0,0,0,.10); }
        .proj-bento .bg{ position:absolute; inset:0; overflow:hidden; transition:transform .7s cubic-bezier(.2,.7,.2,1); }
        .proj-bento .tile:hover .bg{ transform:scale(1.07); }
        .proj-bento .tile-img{ object-fit:cover; }
        .proj-bento .ov{ position:absolute; inset:0; background:linear-gradient(to top,rgba(0,0,0,.82) 0%,rgba(0,0,0,.16) 52%,rgba(0,0,0,.05) 100%); }
        .proj-bento .pbadge{ position:absolute; top:14px; left:14px; z-index:2; background:rgba(255,255,255,.16); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,.3); color:#fff; font:600 10.5px ${P}; text-transform:uppercase; letter-spacing:.5px; padding:6px 12px; border-radius:9999px; }
        .proj-bento .pc{ position:absolute; left:0; right:0; bottom:0; z-index:2; padding:18px 20px; color:#fff; }
        .proj-bento .pc h3{ font:700 21px ${R}; letter-spacing:-.01em; line-height:1.1; margin:0; }
        .proj-bento .big h3{ font-size:30px; }
        .proj-bento .wide h3{ font-size:21px; }
        .proj-bento .sm h3{ font-size:19px; }
        .proj-bento .pc .loc{ font:500 13px ${P}; color:rgba(255,255,255,.92); margin:5px 0 0; }
        .proj-bento .pc .pr{ font:400 12.5px ${P}; color:rgba(255,255,255,.82); margin:5px 0 0; }
        .proj-bento .pc .go{ max-height:0; opacity:0; overflow:hidden; transition:max-height .4s, opacity .4s, margin .4s; font:700 13px ${P}; color:#fff; margin:0; }
        .proj-bento .tile:hover .pc .go{ max-height:34px; opacity:1; margin-top:10px; }
        .proj-bento .seehint{ display:block; text-align:right; margin-top:18px; font:700 14px ${P}; color:var(--green); text-decoration:none; }

        @media(max-width:767px){
          .proj-bento .bento{ grid-template-columns:1fr 1fr; grid-auto-rows:auto; gap:12px; }
          .proj-bento .tile{ grid-column:auto; grid-row:auto; }
          .proj-bento .big{ grid-column:1 / -1; aspect-ratio:4/3; }
          .proj-bento .wide{ grid-column:1 / -1; aspect-ratio:16/9; }
          .proj-bento .sm{ grid-column:span 1; aspect-ratio:3/4; }
          .proj-bento .big h3{ font-size:26px; }
          .proj-bento .pc .go{ display:none; }
        }
        @media (prefers-reduced-motion: reduce){
          .proj-bento .bg{ transition:none; }
          .proj-bento .tile:hover .bg{ transform:none; }
        }
      ` }} />
    </div>
  )
}
