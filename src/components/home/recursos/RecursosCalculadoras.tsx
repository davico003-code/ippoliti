// Sección 4 — "Antes de dar el paso, hacé los números." 3 cards (Construir /
// Alquilar / Comprar). Responsive: grid de 3 en ≥900px, apiladas en mobile.
// Compartida por GuiaDesktop y GuiaSection. Todo el CSS está scopeado bajo
// `.r4` para no filtrar las clases genéricas (.card, .head, .link…) al resto
// de la home.

import ConstruirCard from './ConstruirCard'
import AlquilarCard from './AlquilarCard'
import ComprarCard from './ComprarCard'

const R = "var(--font-raleway), 'Raleway', system-ui, sans-serif"
const P = "var(--font-poppins), 'Poppins', system-ui, sans-serif"

export default function RecursosCalculadoras() {
  return (
    <section className="r4">
      <div className="r4wrap">
        <div className="r4head">
          <h2>Antes de dar el paso, hacé los números.</h2>
          <p>Herramientas gratis para construir, alquilar o comprar con criterio.</p>
        </div>

        <div className="trio">
          <ConstruirCard />
          <AlquilarCard />
          <ComprarCard />
        </div>

        <p className="s4foot">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
          Valores orientativos · el cálculo exacto lo hacés dentro de cada herramienta
        </p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .r4{ --green:#1A5C38; --green-dark:#0F3F26; --paper:#FAF7F2; --ink:#1a1a1a; --appmuted:#6b7280;
             background:var(--paper); padding:60px 0 50px; }
        .r4 .r4wrap{ max-width:1200px; margin:0 auto; padding:0 24px; }
        .r4 .r4head{ text-align:center; max-width:680px; margin:0 auto 34px; }
        .r4 .r4head h2{ font:800 clamp(26px,3vw,34px) ${R}; color:#111827; letter-spacing:-.01em; margin:0; }
        .r4 .r4head p{ font:400 16px ${P}; color:var(--appmuted); margin:8px 0 0; }
        .r4 .trio{ display:grid; grid-template-columns:repeat(3,1fr); gap:20px; align-items:stretch; }

        .r4 .card{ position:relative; background:#fff; border-radius:26px; padding:30px 26px; display:flex; flex-direction:column; box-shadow:0 2px 4px rgba(0,0,0,.03), 0 20px 50px -18px rgba(15,63,38,.18); overflow:hidden; transition:transform .4s cubic-bezier(.2,.7,.2,1), box-shadow .4s; }
        .r4 .card:hover{ transform:translateY(-5px); box-shadow:0 4px 8px rgba(0,0,0,.04), 0 30px 60px -18px rgba(15,63,38,.28); }
        .r4 .card h3{ font:800 clamp(22px,2vw,26px)/1.1 ${R}; letter-spacing:-.015em; margin:6px 0 0; color:var(--ink); padding-right:64px; }
        .r4 .eyebrow{ font:600 13px ${P}; color:var(--green); letter-spacing:.08em; text-transform:uppercase; margin:0; }
        .r4 .clock{ position:absolute; top:22px; right:22px; display:flex; align-items:center; gap:4px; font:600 11px ${P}; color:#6e7d75; background:#f1f5f2; padding:5px 10px; border-radius:9999px; }
        .r4 .clock svg{ color:var(--green); }
        .r4 .ctaR{ margin-top:auto; padding-top:20px; text-decoration:none; }
        .r4 .link{ display:inline-flex; align-items:center; gap:5px; color:var(--green); font:700 15px ${P}; text-decoration:none; }
        .r4 .link svg{ transition:transform .3s; }
        .r4 .card:hover .link svg{ transform:translateX(4px); }

        .r4 .display{ margin-top:18px; background:var(--green-dark); border-radius:16px; padding:18px 20px; color:#fff; position:relative; overflow:hidden; }
        .r4 .display::after{ content:''; position:absolute; right:-30px; top:-30px; width:120px; height:120px; border-radius:50%; background:radial-gradient(circle,rgba(255,255,255,.07),transparent 70%); }
        .r4 .display .lbl{ font:600 10px ${P}; letter-spacing:.12em; text-transform:uppercase; color:rgba(255,255,255,.6); }
        .r4 .display .big{ font:800 clamp(26px,2.6vw,32px) ${P}; line-height:1.05; margin-top:5px; }
        .r4 .display .sub{ font:500 12px ${P}; color:rgba(255,255,255,.72); margin-top:5px; }
        .r4 .control{ margin-top:16px; }
        .r4 .control .crow{ display:flex; justify-content:space-between; align-items:baseline; margin-bottom:9px; }
        .r4 .control .crow .k{ font:600 12px ${P}; color:var(--appmuted); }
        .r4 .control .crow .v{ font:700 14px ${P}; color:var(--ink); }
        .r4 input[type=range]{ -webkit-appearance:none; appearance:none; width:100%; height:6px; border-radius:99px; background:linear-gradient(var(--green),var(--green)) no-repeat, #ececed; background-size:46% 100%; outline:none; }
        .r4 input[type=range]::-webkit-slider-thumb{ -webkit-appearance:none; width:22px; height:22px; border-radius:50%; background:#fff; border:3px solid var(--green); box-shadow:0 2px 8px rgba(15,63,38,.3); cursor:pointer; }
        .r4 input[type=range]::-moz-range-thumb{ width:22px; height:22px; border-radius:50%; background:#fff; border:3px solid var(--green); box-shadow:0 2px 8px rgba(15,63,38,.3); cursor:pointer; }

        .r4 .rentprev{ margin-top:18px; }
        .r4 .rinput{ display:flex; align-items:center; justify-content:space-between; border:1.5px solid #e3e6e4; border-radius:13px; padding:13px 16px; background:#fff; }
        .r4 .rinput .rl{ font:600 12px ${P}; color:var(--appmuted); }
        .r4 .rinput .rv{ font:800 18px ${P}; color:var(--ink); display:flex; align-items:baseline; }
        .r4 .rinput .rfield{ font:800 18px ${P}; color:var(--ink); border:0; outline:0; background:transparent; width:96px; text-align:right; padding:0; }
        .r4 .rinput small{ font:500 11px ${P}; color:var(--appmuted); margin-left:3px; }
        .r4 .rcaret{ display:flex; justify-content:center; margin:7px 0; color:#c7cdc9; }
        .r4 .rresult{ background:#f3f6f4; border-radius:13px; padding:15px 16px; }
        .r4 .rresult .rrl{ font:600 10px ${P}; letter-spacing:.1em; text-transform:uppercase; color:#7d8a83; }
        .r4 .rresult .rrv{ font:800 24px ${P}; color:var(--green-dark); line-height:1; margin-top:4px; }
        .r4 .stack{ display:flex; height:9px; border-radius:99px; overflow:hidden; margin-top:14px; gap:2px; }
        .r4 .stack i{ height:100%; }
        .r4 .legend{ display:grid; grid-template-columns:1fr 1fr; gap:5px 12px; margin-top:11px; }
        .r4 .legend span{ display:flex; align-items:center; gap:6px; font:500 11.5px ${P}; color:#5f6b64; }
        .r4 .legend span::before{ content:''; width:8px; height:8px; border-radius:3px; background:var(--c); }

        .r4 .checklist{ margin-top:18px; display:flex; flex-direction:column; }
        .r4 .citem{ display:flex; align-items:flex-start; gap:12px; padding:11px 0; }
        .r4 .citem + .citem{ border-top:1px solid #f1f1f3; }
        .r4 .cmark{ flex-shrink:0; width:24px; height:24px; border-radius:50%; background:var(--green); display:flex; align-items:center; justify-content:center; margin-top:1px; }
        .r4 .ctxt{ font:600 14.5px/1.3 ${P}; color:var(--ink); }
        .r4 .cmore{ margin-top:14px; font:600 12.5px ${P}; color:var(--green); background:#eef4f0; padding:9px 14px; border-radius:10px; text-align:center; }

        .r4 .s4foot{ text-align:center; font:500 12px ${P}; color:#9a958c; margin-top:26px; display:flex; align-items:center; justify-content:center; gap:7px; }
        .r4 .s4foot svg{ color:var(--green); }

        @media(max-width:900px){ .r4 .trio{ grid-template-columns:1fr; } }
      ` }} />
    </section>
  )
}
