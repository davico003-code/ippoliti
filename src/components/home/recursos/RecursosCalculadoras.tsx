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
        .r4{ --green:#1A5C38; --green-dark:#0F3F26; --paper:#F5F5F7; --ink:#1a1a1a; --appmuted:#6b7280;
             background:var(--paper); padding:64px 0 56px; }
        .r4 .r4wrap{ max-width:1440px; margin:0 auto; padding:0 24px; }
        @media(min-width:1024px){ .r4 .r4wrap{ padding:0 40px; } }
        .r4 .r4head{ margin:0 0 30px; }
        .r4 .trio{ display:grid; grid-template-columns:repeat(3,1fr); gap:22px; align-items:stretch; }

        .r4 .card{ position:relative; background:#fff; border-radius:26px; display:flex; flex-direction:column; box-shadow:0 2px 4px rgba(0,0,0,.03), 0 20px 50px -18px rgba(15,63,38,.18); overflow:hidden; transition:transform .4s cubic-bezier(.2,.7,.2,1), box-shadow .4s; }
        .r4 .card:hover{ transform:translateY(-5px); box-shadow:0 4px 8px rgba(0,0,0,.04), 0 30px 60px -18px rgba(15,63,38,.28); }

        .r4 .foto{ position:relative; height:220px; flex-shrink:0; overflow:hidden; background:#e8ece9; }
        .r4 .foto img{ transition:transform .8s cubic-bezier(.2,.7,.2,1); }
        .r4 .card:hover .foto img{ transform:scale(1.04); }
        .r4 .clock{ position:absolute; top:16px; right:16px; z-index:2; display:flex; align-items:center; gap:5px; font:600 12px ${P}; color:var(--ink); background:rgba(255,255,255,.92); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); padding:6px 12px; border-radius:9999px; box-shadow:0 4px 14px rgba(0,0,0,.12); }
        .r4 .clock svg{ color:var(--green); }

        .r4 .body{ position:relative; z-index:1; flex:1; display:flex; flex-direction:column; background:#fff; border-radius:24px 24px 0 0; margin-top:-26px; padding:24px 26px 26px; }
        .r4 .eyebrow{ display:flex; align-items:center; gap:8px; font:700 12px ${R}; color:var(--green); letter-spacing:.14em; text-transform:uppercase; margin:0; }
        .r4 .card h3{ font:800 clamp(22px,2vw,27px)/1.1 ${R}; letter-spacing:-.02em; margin:10px 0 0; color:var(--ink); }
        .r4 .bajada{ font:500 15px/1.45 ${R}; color:#4b5563; margin:8px 0 0; }

        .r4 .cta{ margin-top:auto; display:flex; align-items:center; justify-content:center; gap:10px; min-height:52px; border-radius:14px; background:var(--green-dark); color:#fff; font:700 15.5px ${R}; text-decoration:none; transition:background .25s; }
        .r4 .body > .cta{ margin-top:auto; }
        .r4 .body > :nth-last-child(2){ margin-bottom:22px; }
        .r4 .cta:hover{ background:var(--green); }
        .r4 .cta svg{ transition:transform .3s; }
        .r4 .card:hover .cta svg{ transform:translateX(4px); }

        .r4 .display{ margin-top:18px; background:#f1f5f2; border-radius:16px; padding:16px 20px; }
        .r4 .display .lbl{ font:500 13px ${P}; color:#4b5563; }
        .r4 .display .big{ font:800 clamp(28px,2.7vw,36px) ${P}; color:var(--green-dark); line-height:1.05; margin-top:4px; letter-spacing:-.01em; }
        .r4 .control{ margin-top:14px; }
        .r4 .control .crow{ display:flex; justify-content:space-between; align-items:baseline; margin-bottom:2px; }
        .r4 .control .crow .k{ font:600 12.5px ${R}; color:var(--appmuted); }
        .r4 .control .crow .v{ font:700 14px ${P}; color:var(--ink); }
        .r4 input[type=range]{ -webkit-appearance:none; appearance:none; width:100%; height:40px; border-radius:99px; background:linear-gradient(var(--green),var(--green)) no-repeat left center / var(--range-fill) 6px, linear-gradient(#dfe3e1,#dfe3e1) no-repeat left center / 100% 6px; outline:none; }
        .r4 input[type=range]::-webkit-slider-thumb{ -webkit-appearance:none; width:22px; height:22px; border-radius:50%; background:#fff; border:3px solid var(--green); box-shadow:0 2px 8px rgba(15,63,38,.3); cursor:pointer; }
        .r4 input[type=range]::-moz-range-thumb{ width:22px; height:22px; border-radius:50%; background:#fff; border:3px solid var(--green); box-shadow:0 2px 8px rgba(15,63,38,.3); cursor:pointer; }

        .r4 .feats{ list-style:none; margin:10px 0 0; padding:14px 0 0; border-top:1px solid #eef0ef; display:grid; grid-template-columns:repeat(3,1fr); }
        .r4 .feats li{ display:flex; flex-direction:column; gap:7px; font:600 12.5px/1.3 ${R}; color:#374151; padding:0 12px; }
        .r4 .feats li:first-child{ padding-left:0; }
        .r4 .feats li + li{ border-left:1px solid #eef0ef; }
        .r4 .feats svg{ color:var(--green); }

        .r4 .rentprev{ margin-top:18px; }
        .r4 .rinput{ display:flex; align-items:center; justify-content:space-between; border:1.5px solid #e3e6e4; border-radius:14px; padding:12px 16px; background:#fff; cursor:text; transition:border-color .2s; }
        .r4 .rinput:focus-within{ border-color:var(--green); }
        .r4 .rinput .rl{ font:600 12.5px ${R}; color:var(--appmuted); }
        .r4 .rinput .rv{ font:800 18px ${P}; color:var(--ink); display:flex; align-items:baseline; }
        .r4 .rinput .rfield{ font:800 18px ${P}; color:var(--ink); border:0; outline:0; background:transparent; width:96px; text-align:right; padding:0; }
        .r4 .rinput small{ font:500 11px ${P}; color:var(--appmuted); margin-left:3px; }
        .r4 .rresult{ margin-top:10px; background:#f1f5f2; border-radius:16px; padding:16px 18px; }
        .r4 .rresult .rrl{ font:500 13px ${R}; color:#4b5563; }
        .r4 .rresult .rrv{ font:800 clamp(26px,2.4vw,32px) ${P}; color:var(--green-dark); line-height:1.05; margin-top:4px; letter-spacing:-.01em; }
        .r4 .stack{ display:flex; height:9px; border-radius:99px; overflow:hidden; margin-top:14px; gap:2px; }
        .r4 .stack i{ height:100%; }
        .r4 .legend{ display:grid; grid-template-columns:1fr 1fr; gap:6px 12px; margin-top:11px; }
        .r4 .legend span{ display:flex; align-items:center; gap:7px; font:600 12px ${R}; color:#4b5563; }
        .r4 .legend span::before{ content:''; width:9px; height:9px; border-radius:3px; background:var(--c); }

        .r4 .libro{ position:absolute; right:18px; bottom:40px; z-index:2; width:96px; height:128px; border-radius:4px 8px 8px 4px; background:linear-gradient(160deg,#1f6a42,#0F3F26 70%); box-shadow:inset 5px 0 0 rgba(0,0,0,.18), 0 16px 30px -8px rgba(0,0,0,.45); transform:rotate(5deg); padding:12px 10px 10px 14px; display:flex; flex-direction:column; color:#fff; }
        .r4 .libro .lk{ font:800 15px/1 ${R}; letter-spacing:.02em; }
        .r4 .libro .lt{ font:600 9.5px/1.25 ${R}; margin-top:4px; color:rgba(255,255,255,.85); }
        .r4 .libro .lb{ margin-top:auto; font:600 8px ${P}; color:#fbce07; letter-spacing:.06em; text-transform:uppercase; }
        .r4 .libro .lm{ font:800 6.5px ${R}; letter-spacing:.14em; margin-top:3px; color:rgba(255,255,255,.7); }

        .r4 .checklist{ list-style:none; margin:14px 0 0; padding:0; display:flex; flex-direction:column; }
        .r4 .citem{ display:flex; align-items:center; gap:12px; padding:9px 0; }
        .r4 .citem + .citem{ border-top:1px solid #f1f1f3; }
        .r4 .cmark{ flex-shrink:0; width:24px; height:24px; border-radius:50%; background:var(--green); display:flex; align-items:center; justify-content:center; }
        .r4 .ctxt{ font:600 15px/1.3 ${R}; color:var(--ink); }
        .r4 .cmore{ margin-top:12px; font:600 12.5px ${R}; color:var(--green); background:#eef4f0; padding:9px 14px; border-radius:10px; text-align:center; }

        .r4 .trust{ list-style:none; margin:30px auto 0; padding:14px 10px; max-width:760px; display:flex; justify-content:center; background:#fff; border-radius:9999px; box-shadow:0 2px 4px rgba(0,0,0,.03), 0 12px 30px -16px rgba(15,63,38,.2); }
        .r4 .trust li{ flex:1; display:flex; align-items:center; justify-content:center; gap:10px; font:700 15px ${R}; color:var(--ink); padding:2px 12px; }
        .r4 .trust li + li{ border-left:1px solid #e5e7eb; }
        .r4 .trust svg{ color:var(--green); flex-shrink:0; }
        .r4 .s4foot{ text-align:center; font:500 12px ${R}; color:#6b7280; margin:14px 0 0; }

        @media(max-width:900px){
          .r4{ padding:48px 0 44px; }
          .r4 .trio{ grid-template-columns:1fr; gap:18px; }
          .r4 .foto{ height:190px; }
          .r4 .body{ padding:22px 20px 22px; }
          .r4 .trust{ border-radius:20px; padding:6px 16px; flex-direction:column; }
          .r4 .trust li{ justify-content:flex-start; padding:12px 4px; font-size:14.5px; }
          .r4 .trust li + li{ border-left:0; border-top:1px solid #eef0ef; }
        }
      ` }} />
    </section>
  )
}
