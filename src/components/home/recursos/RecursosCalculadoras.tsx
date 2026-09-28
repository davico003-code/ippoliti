// Sección 4 — "Antes de dar el paso, hacé los números." 3 cards (Construir /
// Alquilar / Comprar) con foto de cabecera y el cuerpo blanco montado encima.
// Responsive: grid de 3 en ≥900px, apiladas en mobile. Compartida por
// GuiaDesktop y GuiaSection. Todo el CSS está scopeado bajo `.r4` para no
// filtrar las clases genéricas (.card, .body, .cta…) al resto de la home.
// Fotos: Unsplash (licencia libre), en public/images/herramientas.

import ConstruirCard from './ConstruirCard'
import AlquilarCard from './AlquilarCard'
import ComprarCard from './ComprarCard'
import EncabezadoSeccion from '../EncabezadoSeccion'

const R = "var(--font-raleway), 'Raleway', system-ui, sans-serif"
const P = "var(--font-poppins), 'Poppins', system-ui, sans-serif"

export default function RecursosCalculadoras() {
  return (
    <section className="r4">
      <div className="r4wrap">
        <EncabezadoSeccion
          eyebrow="Herramientas gratis"
          titulo={<>Antes de dar el paso, <span style={{ color: '#1A5C38' }}>hacé los números.</span></>}
          bajada="Para construir, alquilar o comprar con criterio."
          className="r4head"
        />

        <div className="trio revela">
          <ConstruirCard />
          <AlquilarCard />
          <ComprarCard />
        </div>

        <ul className="trust">
          <li>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M5 12v9h14v-9M12 8v13M12 8S10.5 3.5 8 4.2 8.5 8 12 8zM12 8s1.5-4.5 4-3.8S15.5 8 12 8z" /></svg>
            100% gratis
          </li>
          <li>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>
            Sin registro
          </li>
          <li>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6z" /><path d="m8.5 12 2.5 2.5 4.5-5" /></svg>
            Información actualizada
          </li>
        </ul>
        <p className="s4foot">Valores orientativos · el cálculo exacto lo hacés dentro de cada herramienta</p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .r4{ --green:#1A5C38; --green-dark:#0F3F26; --paper:#F5F5F7; --ink:#111; --muted:#5b6170; --line:#eceeed;
             background:var(--paper); padding:64px 0 56px; }
        .r4 .r4wrap{ max-width:1440px; margin:0 auto; padding:0 24px; }
        @media(min-width:1024px){ .r4 .r4wrap{ padding:0 40px; } }
        .r4 .r4head{ margin:0 0 32px; }
        .r4 .trio{ display:grid; grid-template-columns:repeat(3,1fr); gap:24px; align-items:stretch; }

        .r4 .card{ position:relative; background:#fff; border-radius:24px; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 1px 2px rgba(0,0,0,.04), 0 14px 40px -20px rgba(0,0,0,.14); transition:transform .4s cubic-bezier(.2,.7,.2,1), box-shadow .4s; }
        .r4 .card:hover{ transform:translateY(-4px); box-shadow:0 1px 2px rgba(0,0,0,.04), 0 24px 50px -20px rgba(0,0,0,.2); }

        .r4 .foto{ position:relative; height:250px; flex-shrink:0; background:#e8ece9; }
        .r4 .foto > img{ transition:transform .8s cubic-bezier(.2,.7,.2,1); }
        .r4 .card:hover .foto > img{ transform:scale(1.03); }
        .r4 .clock{ position:absolute; top:16px; right:16px; z-index:3; display:flex; align-items:center; gap:6px; font:600 13px ${P}; color:var(--ink); background:rgba(255,255,255,.94); padding:7px 13px; border-radius:9999px; }
        .r4 .clock svg{ color:var(--ink); }

        .r4 .body{ position:relative; z-index:1; flex:1; display:flex; flex-direction:column; background:#fff; border-radius:24px 24px 0 0; margin-top:-28px; padding:26px 26px 26px; }
        .r4 .eyebrow{ display:flex; align-items:center; gap:9px; font:700 12.5px ${R}; color:var(--green); letter-spacing:.12em; text-transform:uppercase; margin:0; }
        .r4 .card h3{ font:800 clamp(23px,2vw,28px)/1.1 ${R}; letter-spacing:-.025em; margin:12px 0 0; color:var(--ink); }
        .r4 .bajada{ font:500 15.5px/1.45 ${R}; color:var(--muted); margin:8px 0 0; }

        .r4 .caja{ margin-top:18px; background:#f4f5f4; border-radius:14px; padding:16px 20px; }
        .r4 .caja .lbl{ display:flex; align-items:baseline; gap:4px; font:500 14px ${R}; color:var(--muted); }
        .r4 .caja .num{ font:600 14px ${P}; color:var(--ink); background:transparent; border:0; border-bottom:1.5px dashed #b9c2bd; outline:0; padding:0 0 1px; text-align:center; border-radius:0; }
        .r4 .auto{ display:inline-grid; }
        .r4 .auto > *{ grid-area:1/1; font:inherit; min-width:1ch; width:100%; }
        .r4 .auto > span{ visibility:hidden; white-space:pre; padding:0 1px; }
        .r4 .auto > input{ width:0; min-width:100%; }
        .r4 .caja .num:focus{ border-bottom-color:var(--green); border-bottom-style:solid; }
        .r4 .caja .big{ font:700 clamp(28px,2.6vw,36px)/1.1 ${P}; color:var(--green-dark); letter-spacing:-.02em; margin-top:4px; }
        .r4 .split{ display:grid; grid-template-columns:1fr 1fr; padding:14px 0; }
        .r4 .split .mitad{ display:flex; flex-direction:column; gap:4px; padding:0 18px; min-width:0; }
        .r4 .split .mitad + .mitad{ border-left:1px solid #e1e4e2; }
        .r4 .split .lbl{ font:500 13px ${R}; }
        .r4 .split .val{ display:flex; align-items:baseline; font:700 clamp(18px,1.55vw,22px) ${P}; color:var(--green-dark); letter-spacing:-.01em; white-space:nowrap; }
        .r4 .split .val .num{ font:inherit; color:inherit; text-align:left; }
        .r4 .split .val small{ font:500 11px ${P}; color:var(--muted); margin-left:2px; }

        .r4 .feats{ list-style:none; margin:18px 0 0; padding:0; display:grid; grid-template-columns:repeat(3,1fr); }
        .r4 .feats.cuatro{ grid-template-columns:repeat(4,1fr); }
        .r4 .feats li{ display:flex; flex-direction:column; gap:8px; font:500 13px/1.3 ${R}; color:#374151; padding:2px 12px; }
        .r4 .feats li:first-child{ padding-left:0; }
        .r4 .feats li + li{ border-left:1px solid var(--line); }
        .r4 .feats svg{ color:var(--green-dark); }

        .r4 .checklist{ list-style:none; margin:16px 0 0; padding:0; display:flex; flex-direction:column; gap:12px; }
        .r4 .checklist li{ display:flex; align-items:center; gap:12px; font:500 15px/1.3 ${R}; color:var(--ink); }
        .r4 .cmark{ flex-shrink:0; width:24px; height:24px; border-radius:50%; background:var(--green-dark); display:flex; align-items:center; justify-content:center; }

        .r4 .libro{ position:absolute; right:22px; bottom:-10px; z-index:2; width:128px; height:168px; background:#fff; border-radius:3px 6px 6px 3px; box-shadow:inset 3px 0 0 #e7e9e8, 0 18px 36px -12px rgba(0,0,0,.4); transform:rotate(5deg); padding:14px 12px 10px; display:flex; flex-direction:column; text-align:center; }
        .r4 .libro .lt{ font:800 13px/1.12 ${R}; color:var(--ink); letter-spacing:-.01em; text-transform:uppercase; }
        .r4 .libro .ls{ font:500 8px ${R}; color:var(--muted); margin-top:5px; }
        .r4 .libro .lf{ position:relative; flex:1; margin-top:8px; border-radius:2px; overflow:hidden; }
        .r4 .libro .lm{ font:800 6.5px ${R}; letter-spacing:.16em; color:var(--green); margin-top:7px; }

        .r4 .cta{ margin-top:auto; display:flex; align-items:center; justify-content:center; gap:10px; min-height:54px; border-radius:14px; background:var(--green-dark); color:#fff; font:600 16px ${R}; text-decoration:none; transition:background .25s; }
        .r4 .body > .cta{ margin-top:auto; }
        .r4 .body > :nth-last-child(2){ margin-bottom:24px; }
        .r4 .cta:hover{ background:var(--green); }
        .r4 .cta svg{ transition:transform .3s; }
        .r4 .card:hover .cta svg{ transform:translateX(4px); }

        .r4 .trust{ list-style:none; margin:32px auto 0; padding:16px 10px; max-width:820px; display:flex; background:#fff; border-radius:9999px; box-shadow:0 1px 2px rgba(0,0,0,.04), 0 10px 30px -18px rgba(0,0,0,.14); }
        .r4 .trust li{ flex:1; display:flex; align-items:center; justify-content:center; gap:11px; font:600 15.5px ${R}; color:var(--ink); padding:2px 12px; }
        .r4 .trust li + li{ border-left:1px solid #e5e7eb; }
        .r4 .trust svg{ color:var(--ink); flex-shrink:0; }
        .r4 .s4foot{ text-align:center; font:500 12px ${R}; color:#8a8f98; margin:14px 0 0; }

        @media(max-width:900px){
          .r4{ padding:48px 0 44px; }
          .r4 .trio{ grid-template-columns:1fr; gap:20px; }
          .r4 .foto{ height:210px; }
          .r4 .body{ padding:24px 20px 22px; }
          .r4 .libro{ width:94px; height:124px; right:16px; bottom:-22px; padding:10px 9px 8px; }
          .r4 .libro .lt{ font-size:10.5px; }
          .r4 .libro .ls{ font-size:7px; }
          .r4 .libro .lm{ font-size:5.5px; margin-top:5px; }
          .r4 .split .mitad{ padding:0 14px; }
          .r4 .trust{ border-radius:20px; padding:6px 18px; flex-direction:column; }
          .r4 .trust li{ justify-content:flex-start; padding:12px 2px; font-size:15px; }
          .r4 .trust li + li{ border-left:0; border-top:1px solid var(--line); }
        }
        @media(max-width:380px){ .r4 .feats.cuatro li{ padding:2px 6px; font-size:12px; } }
      ` }} />
    </section>
  )
}
