// Cinta de logos que corre: "Desarrolladoras que confían en nosotros" (David,
// 18-nov-2026). Va debajo del mosaico de emprendimientos. Todos los logos son
// de un solo color: se pasan a gris con brightness-0 + opacidad y toman el
// negro al pasar el mouse. La lista se duplica para que el loop no tenga corte.

import Image from '@/components/Imagen'

const R = "var(--font-raleway), 'Raleway', system-ui, sans-serif"

const DESARROLLADORAS = [
  { nombre: 'Grupo Transatlántica', src: '/images/distrito-roldan/brand/logo-transatlantica-blanco.webp', w: 640, h: 162, alto: 34 },
  { nombre: 'Fundar', src: '/emprendimientos/marcas/fundar-blanco.svg', w: 129, h: 32, alto: 26 },
  { nombre: 'Proyectta', src: '/emprendimientos/marcas/proyectta-blanco.svg', w: 225, h: 64, alto: 30 },
  { nombre: 'Hausing', src: '/hausing-logo.svg', w: 468, h: 114, alto: 26 },
  { nombre: 'Estudio VERS', src: '/emprendimientos/marcas/vers-blanco.webp', w: 640, h: 185, alto: 30 },
  { nombre: 'EDECA', src: '/images/distrito-roldan/brand/logo-edeca-blanco.webp', w: 480, h: 80, alto: 18 },
  { nombre: 'Masea Desarrollos', src: '/emprendimientos/marcas/masea-blanco.webp', w: 640, h: 210, alto: 34 },
  { nombre: 'Desarrolladora G', src: '/emprendimientos/marcas/desarrolladora-g-blanco.webp', w: 200, h: 200, alto: 34 },
]

export default function DesarrolladorasCinta() {
  const fila = [...DESARROLLADORAS, ...DESARROLLADORAS]
  return (
    <section className="dev-cinta" aria-label="Desarrolladoras que confían en nosotros">
      <p className="dev-cinta-titulo">Desarrolladoras que confían en nosotros sus proyectos</p>
      <div className="dev-cinta-marco">
        <ul className="dev-cinta-pista">
          {fila.map((d, i) => (
            <li key={`${d.nombre}-${i}`} aria-hidden={i >= DESARROLLADORAS.length ? true : undefined}>
              <Image src={d.src} alt={d.nombre} width={d.w} height={d.h} style={{ height: d.alto, width: 'auto' }} className="dev-cinta-logo" />
            </li>
          ))}
        </ul>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .dev-cinta{ margin-top:44px; }
        .dev-cinta-titulo{ text-align:center; font:600 13px ${R}; letter-spacing:.14em; text-transform:uppercase; color:#6b7280; margin:0 0 22px; }
        .dev-cinta-marco{ overflow:hidden; -webkit-mask-image:linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent); mask-image:linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent); }
        .dev-cinta-pista{ display:flex; align-items:center; gap:72px; width:max-content; list-style:none; margin:0; padding:6px 0; animation:devCinta 38s linear infinite; }
        .dev-cinta-marco:hover .dev-cinta-pista{ animation-play-state:paused; }
        .dev-cinta-pista li{ flex:none; display:flex; align-items:center; }
        .dev-cinta-logo{ filter:brightness(0); opacity:.5; transition:opacity .3s; }
        .dev-cinta-pista li:hover .dev-cinta-logo{ opacity:.9; }
        :root[data-theme="dark"] .dev-cinta-logo, .dark .dev-cinta-logo{ filter:brightness(0) invert(1); }
        @keyframes devCinta{ from{ transform:translateX(0); } to{ transform:translateX(calc(-50% - 36px)); } }
        @media(max-width:767px){ .dev-cinta-pista{ gap:48px; animation-duration:28s; } .dev-cinta-titulo{ font-size:11px; } }
        @media (prefers-reduced-motion: reduce){ .dev-cinta-pista{ animation:none; flex-wrap:wrap; justify-content:center; width:auto; } .dev-cinta-pista li[aria-hidden]{ display:none; } }
      ` }} />
    </section>
  )
}
