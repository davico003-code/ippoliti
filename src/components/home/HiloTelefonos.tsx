// En pausa en la home (27-sep): David pidió no mostrar HILO ahí todavía. Hoy
// se usa solo en /como-trabajamos; queda listo para sumarlo a la home después
// de Emprendimientos.

// HILO en la home: dos iPhones en 3D con la app real (Hoy + Asistente IA),
// al estilo de las presentaciones de producto. Todo es HTML + CSS: sin
// imágenes pesadas, sin librerías 3D y sin JavaScript. Los teléfonos giran y
// se separan con el scroll mediante scroll-driven animations; donde el
// navegador no las soporta (o se pidió menos movimiento) quedan quietos en su
// pose final. El texto es HTML real, indexable.

import Link from 'next/link'

const RALEWAY = "var(--font-raleway), 'Raleway', system-ui, sans-serif"

function HiloIcono({ size = 40, radio = 11 }: { size?: number; radio?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 1024 1024" aria-hidden="true" style={{ borderRadius: radio, flexShrink: 0 }}>
      <rect width="1024" height="1024" fill="#181A33" />
      <path d="M 400 656 C 542 540, 492 478, 636 366" fill="none" stroke="#fff" strokeWidth="78" strokeLinecap="round" />
      <circle cx="400" cy="656" r="50" fill="#fff" />
      <circle cx="636" cy="366" r="50" fill="#fff" />
    </svg>
  )
}

// Íconos mínimos (trazo 2, estilo lucide) para las pantallas.
const I = {
  bell: 'M6.5 17h11l-1.4-2.2v-3.6a4.1 4.1 0 0 0-8.2 0v3.6L6.5 17Z M10 19.6a2.1 2.1 0 0 0 4 0',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z M20 20l-3.5-3.5',
  spark: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z',
  msg: 'M4 5h16v11H8l-4 4Z',
  send: 'M4 12l16-8-6 16-2-7Z',
  doc: 'M7 3h7l4 4v14H7Z M14 3v4h4 M10 12h5 M10 16h5',
  home: 'M4 11l8-7 8 7v9h-5v-6H9v6H4Z',
  inbox: 'M4 13l3-8h10l3 8v6H4Z M4 13h5l1 2h4l1-2h5',
  grid: 'M4 4h7v7H4Z M13 4h7v7h-7Z M4 13h7v7H4Z M13 13h7v7h-7Z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M4 21a8 8 0 0 1 16 0',
  plus: 'M12 5v14 M5 12h14',
  x: 'M6 6l12 12 M18 6L6 18',
  mic: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z M5 11a7 7 0 0 0 14 0 M12 18v3',
  edit: 'M4 20h4L19 9l-4-4L4 16Z',
}

function Ico({ d, size = 16, color = 'currentColor', w = 2 }: { d: string; size?: number; color?: string; w?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

function BarraEstado({ oscura = false }: { oscura?: boolean }) {
  const c = oscura ? '#fff' : '#181A33'
  return (
    <div className="t-barra" style={{ color: c }}>
      <span>9:41</span>
      <span className="t-barra-ico">
        <svg width="17" height="11" viewBox="0 0 17 11" aria-hidden="true"><g fill={c}><rect x="0" y="7" width="3" height="4" rx="1" /><rect x="4.5" y="5" width="3" height="6" rx="1" /><rect x="9" y="2.5" width="3" height="8.5" rx="1" /><rect x="13.5" y="0" width="3" height="11" rx="1" /></g></svg>
        <svg width="15" height="11" viewBox="0 0 15 11" aria-hidden="true"><path d="M7.5 2.2c2.3 0 4.3.9 5.8 2.4l1.2-1.2A9.8 9.8 0 0 0 7.5.5 9.8 9.8 0 0 0 .5 3.4l1.2 1.2A8.1 8.1 0 0 1 7.5 2.2Zm0 3.4c1.3 0 2.5.5 3.4 1.4l1.2-1.2A6.5 6.5 0 0 0 7.5 3.9 6.5 6.5 0 0 0 2.9 5.8L4.1 7a4.8 4.8 0 0 1 3.4-1.4Zm0 3.4-1.9 1.9L7.5 11l1.9-2.1Z" fill={c} /></svg>
        <svg width="25" height="12" viewBox="0 0 25 12" aria-hidden="true"><rect x=".5" y=".5" width="21" height="11" rx="3.5" fill="none" stroke={c} opacity=".4" /><rect x="2" y="2" width="16" height="8" rx="2" fill={c} /><rect x="23" y="4" width="1.5" height="4" rx=".75" fill={c} opacity=".45" /></svg>
      </span>
    </div>
  )
}

function Telefono({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`t-cuerpo ${className}`}>
      <div className="t-pantalla">
        <span className="t-isla" />
        {children}
        <span className="t-brillo" />
      </div>
    </div>
  )
}

// ─── Pantalla 1 · "Hoy" ──────────────────────────────────────────────────────

const NOVEDADES = [
  { ico: I.msg, bg: '#FCE3DA', ac: '#DD7349', t: 'Consulta nueva', s: 'Casa en Funes · con su agente', h: 'ahora', nuevo: true },
  { ico: I.send, bg: '#DCE7FE', ac: '#2D6CF6', t: 'Publicada', s: 'Web, MercadoLibre y Argenprop', h: '5 min' },
  { ico: I.doc, bg: '#E6DEF8', ac: '#7460D4', t: 'Informe enviado', s: 'Al propietario, con visitas', h: '1 h' },
]

function PantallaHoy() {
  return (
    <div className="t-app" style={{ background: '#F4F5FA' }}>
      <BarraEstado />
      <div style={{ padding: '4px 16px 0' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="t-gris" style={{ fontSize: 11 }}>Sábado 27 de septiembre</p>
            <p style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 1 }}>Buen día</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative grid place-items-center" style={{ width: 36, height: 36, borderRadius: 11, background: '#fff' }}>
              <Ico d={I.bell} size={17} color="#181A33" />
              <span className="absolute" style={{ right: 9, top: 8, width: 6, height: 6, borderRadius: 9, background: '#DD7349' }} />
            </span>
            <span className="grid place-items-center" style={{ width: 36, height: 36, borderRadius: 99, background: '#211E78', color: '#fff', fontSize: 12, fontWeight: 700 }}>SI</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5" style={{ marginTop: 14 }}>
          <div style={{ background: '#211E78', borderRadius: 16, padding: 12, color: '#fff' }}>
            <div className="flex items-center justify-between">
              <span className="grid place-items-center" style={{ width: 26, height: 26, borderRadius: 99, background: 'rgba(255,255,255,.15)' }}><Ico d={I.search} size={13} /></span>
              <span style={{ fontSize: 24, fontWeight: 800, lineHeight: 1 }}>12</span>
            </div>
            <p style={{ fontSize: 12, fontWeight: 800, marginTop: 8 }}>Búsquedas activas</p>
            <p style={{ fontSize: 10, fontWeight: 600, opacity: 0.65 }}>Clientes buscando hoy</p>
          </div>
          <div style={{ background: '#DDF3E4', borderRadius: 16, padding: 12, color: '#14532D' }}>
            <div className="flex items-center justify-between">
              <span className="grid place-items-center" style={{ width: 26, height: 26, borderRadius: 99, background: '#1F8A4C', color: '#fff' }}><Ico d={I.spark} size={13} /></span>
              <span style={{ fontSize: 24, fontWeight: 800, lineHeight: 1 }}>3</span>
            </div>
            <p style={{ fontSize: 12, fontWeight: 800, marginTop: 8 }}>Oportunidades</p>
            <p style={{ fontSize: 10, fontWeight: 600, color: '#4B755E' }}>Para ofrecer hoy</p>
          </div>
        </div>

        <div className="flex items-center justify-between" style={{ marginTop: 16 }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Novedades</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#211E78' }}>Ver todo</span>
        </div>
        <div className="flex flex-col gap-2" style={{ marginTop: 8 }}>
          {NOVEDADES.map((n) => (
            <div key={n.t} className={`flex items-center gap-2.5 ${n.nuevo ? 't-nueva' : ''}`} style={{ background: '#fff', borderRadius: 14, padding: '9px 10px', boxShadow: '0 1px 2px rgba(24,26,51,.05)' }}>
              <span className="grid shrink-0 place-items-center" style={{ width: 32, height: 32, borderRadius: 10, background: n.bg, color: n.ac }}><Ico d={n.ico} size={15} /></span>
              <div className="min-w-0 flex-1">
                <p style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.2 }}>{n.t}</p>
                <p className="t-gris truncate" style={{ fontSize: 10.5 }}>{n.s}</p>
              </div>
              <span className="t-gris shrink-0" style={{ fontSize: 9.5 }}>{n.h}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="t-tabbar">
        <span style={{ color: '#211E78' }}><Ico d={I.home} size={20} /></span>
        <span><Ico d={I.inbox} size={20} /></span>
        <span className="grid place-items-center" style={{ width: 40, height: 40, borderRadius: 99, background: '#211E78', color: '#fff', boxShadow: '0 6px 16px -4px rgba(33,30,120,.6)' }}><Ico d={I.plus} size={18} w={2.4} /></span>
        <span><Ico d={I.grid} size={20} /></span>
        <span><Ico d={I.user} size={20} /></span>
      </div>
    </div>
  )
}

// ─── Pantalla 2 · Asistente IA ───────────────────────────────────────────────

function PantallaAsistente() {
  return (
    <div className="t-app" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F1F1FC 52%, #E6DEF8 100%)' }}>
      <BarraEstado />
      <div className="flex items-center justify-between" style={{ padding: '4px 16px 0', color: '#181A33' }}>
        <Ico d={I.x} size={18} />
        <span className="flex items-center gap-1.5" style={{ fontSize: 13, fontWeight: 700 }}>
          <HiloIcono size={20} radio={6} /> Asistente
        </span>
        <Ico d={I.edit} size={16} />
      </div>

      <div className="flex flex-col items-center text-center" style={{ padding: '44px 22px 0' }}>
        <span className="t-orbe" />
        <p className="t-serif" style={{ fontSize: 25, marginTop: 20, letterSpacing: '-0.01em', color: '#181A33' }}>Buen día.</p>
        <p className="t-serif" style={{ fontSize: 13, lineHeight: 1.45, marginTop: 6, color: '#5A5F7B' }}>
          Tenés 3 consultas para responder y una visita a las 11:00.
        </p>
      </div>

      <div className="flex flex-col gap-2" style={{ padding: '22px 16px 0' }}>
        {['Responder consultas', 'Preparar el informe semanal', 'Buscar comparables en Funes'].map((c) => (
          <span key={c} className="flex items-center gap-2" style={{ background: 'rgba(255,255,255,.85)', border: '1px solid #E8EAF2', borderRadius: 14, padding: '10px 12px', fontSize: 12, fontWeight: 600, color: '#181A33' }}>
            <span style={{ color: '#7460D4' }}><Ico d={I.spark} size={13} /></span>
            {c}
          </span>
        ))}
      </div>

      <div className="absolute inset-x-0" style={{ bottom: 26, padding: '0 14px' }}>
        <div className="flex items-center justify-between" style={{ background: '#fff', borderRadius: 99, padding: '10px 14px', border: '1px solid #E8EAF2', boxShadow: '0 8px 24px -10px rgba(33,30,120,.35)' }}>
          <span style={{ fontSize: 12, color: '#707590' }}>Preguntale a HILO<span className="t-cursor">|</span></span>
          <span style={{ color: '#211E78' }}><Ico d={I.mic} size={16} /></span>
        </div>
      </div>
    </div>
  )
}

// ─── Sección ─────────────────────────────────────────────────────────────────

// Desktop y mobile montan la home por separado: cada uno pasa su id.
export default function HiloTelefonos({ idTitulo = 'hilo-titulo' }: { idTitulo?: string }) {
  return (
    <section aria-labelledby={idTitulo} className="hilo3d bg-white">
      <div className="hilo3d-card">
        <div className="hilo3d-grid">
          <div className="hilo3d-escena" aria-hidden="true">
            <div className="hilo3d-halo" />
            <div className="hilo3d-escala">
              <div className="tel tel-a"><div className="flota"><Telefono><PantallaHoy /></Telefono></div></div>
              <div className="tel tel-b"><div className="flota flota-b"><Telefono><PantallaAsistente /></Telefono></div></div>
            </div>
          </div>

          <div className="hilo3d-texto revela">
            <div className="flex items-center gap-3">
              <HiloIcono size={44} radio={12} />
              <span style={{ fontFamily: RALEWAY, fontWeight: 800, fontSize: 26, letterSpacing: '0.14em' }}>HILO</span>
            </div>
            <h2 id={idTitulo} style={{ fontFamily: RALEWAY, fontWeight: 800, fontSize: 'clamp(32px, 3.9vw, 54px)', lineHeight: 1.02, letterSpacing: '-0.04em', margin: '26px 0 0' }}>
              Conocé HILO. La inteligencia detrás de cada operación.
            </h2>
            <p style={{ fontFamily: RALEWAY, fontWeight: 600, fontSize: 'clamp(15px, 1.25vw, 18px)', lineHeight: 1.6, color: 'rgba(255,255,255,.78)', margin: '22px 0 0', maxWidth: 520 }}>
              HILO es el CRM con inteligencia artificial que desarrollamos en SI INMOBILIARIA. Ordena cada
              consulta, publica tu propiedad en los principales portales y mantiene informado a cada
              propietario, para que tu agente se dedique a lo importante: vos.
            </p>
            <p style={{ fontFamily: RALEWAY, fontWeight: 700, fontSize: 16, color: '#fff', margin: '22px 0 0' }}>
              Tecnología propia, exclusiva del equipo de SI INMOBILIARIA.
            </p>
            <Link href="/tasaciones" className="hilo3d-cta">
              Tasá tu propiedad
            </Link>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .hilo3d { padding: 24px 12px; }
        .hilo3d-card { position: relative; overflow: hidden; border-radius: 30px; color: #fff; isolation: isolate;
          background:
            radial-gradient(60% 70% at 22% 100%, rgba(45,108,246,.55) 0%, rgba(45,108,246,0) 70%),
            radial-gradient(55% 65% at 100% 0%, rgba(116,96,212,.5) 0%, rgba(116,96,212,0) 70%),
            linear-gradient(135deg, #12132F 0%, #1C1A63 48%, #262293 100%); }
        .hilo3d-grid { position: relative; max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr; align-items: center; padding: 0 24px 44px; }
        .hilo3d-escena { position: relative; height: 440px; margin-top: 12px; }
        .hilo3d-escala { position: absolute; inset: 0; transform: translateX(4%) scale(.6); transform-origin: 50% 50%; }
        .hilo3d-halo { position: absolute; left: 50%; top: 52%; width: 420px; height: 420px; transform: translate(-50%, -50%); border-radius: 50%;
          background: radial-gradient(circle, rgba(143,139,255,.45) 0%, rgba(143,139,255,0) 65%); filter: blur(10px); }
        .hilo3d-texto { position: relative; }
        .hilo3d-cta { display: inline-flex; margin-top: 30px; padding: 15px 30px; border-radius: 999px; background: #fff; color: #211E78;
          font: 800 16px ${RALEWAY}; text-decoration: none; transition: transform .3s cubic-bezier(.2,.7,.2,1), box-shadow .3s; box-shadow: 0 10px 30px -10px rgba(0,0,0,.5); }
        .hilo3d-cta:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 16px 40px -12px rgba(0,0,0,.6); }

        @media (min-width: 900px) {
          .hilo3d { padding: 40px 28px; }
          .hilo3d-card { border-radius: 36px; }
          .hilo3d-grid { grid-template-columns: 1.08fr 1fr; gap: 24px; padding: 0 56px; min-height: 680px; }
          .hilo3d-escena { height: 680px; margin-top: 0; }
          .hilo3d-escala { transform: none; }
        }

        /* Teléfono */
        .tel { position: absolute; left: 50%; top: 50%; will-change: transform; }
        .tel-a { transform: perspective(1500px) translate(-98%, -57%) rotateY(20deg) rotateX(6deg) rotateZ(-5deg); z-index: 1; }
        .tel-b { transform: perspective(1500px) translate(-4%, -54%) rotateY(-16deg) rotateX(5deg) rotateZ(3deg) translateZ(70px); z-index: 2; }
        .flota { animation: telFlota 7s ease-in-out infinite; }
        .flota-b { animation-delay: -3.5s; }
        @keyframes telFlota { 0%,100% { transform: translate3d(0,0,0); } 50% { transform: translate3d(0,-10px,0); } }

        .t-cuerpo { position: relative; width: 272px; height: 566px; border-radius: 52px; padding: 10px;
          background: linear-gradient(150deg, #3a3a44 0%, #0c0c11 30%, #15151b 70%, #34343d 100%);
          box-shadow: inset 0 0 0 1.5px rgba(255,255,255,.22), inset 0 0 0 4px #09090d,
            0 70px 120px -40px rgba(4,4,28,.85), 0 30px 60px -30px rgba(0,0,0,.6); }
        .t-cuerpo::before { content: ''; position: absolute; right: -3px; top: 168px; width: 3px; height: 84px; border-radius: 0 3px 3px 0; background: #2b2b33; }
        .t-cuerpo::after { content: ''; position: absolute; left: -3px; top: 132px; width: 3px; height: 54px; border-radius: 3px 0 0 3px; background: #2b2b33; box-shadow: 0 68px 0 #2b2b33; }
        .t-pantalla { position: relative; width: 100%; height: 100%; border-radius: 42px; overflow: hidden; background: #F4F5FA;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', system-ui, sans-serif; color: #181A33; -webkit-font-smoothing: antialiased; }
        .t-isla { position: absolute; top: 10px; left: 50%; transform: translateX(-50%); width: 92px; height: 27px; border-radius: 20px; background: #000; z-index: 5; }
        .t-brillo { position: absolute; inset: 0; z-index: 6; pointer-events: none;
          background: linear-gradient(118deg, rgba(255,255,255,.16) 0%, rgba(255,255,255,.04) 20%, rgba(255,255,255,0) 36%); }
        .t-app { position: absolute; inset: 0; }
        .t-barra { display: flex; justify-content: space-between; align-items: center; height: 46px; padding: 6px 26px 0 30px; font-size: 13px; font-weight: 600; }
        .t-barra-ico { display: flex; gap: 5px; align-items: center; }
        .t-gris { color: #707590; }
        .t-serif { font-family: 'New York', ui-serif, Georgia, 'Times New Roman', serif; }
        .t-tabbar { position: absolute; left: 0; right: 0; bottom: 0; height: 74px; padding: 0 22px 14px; display: flex; align-items: center; justify-content: space-between;
          color: #9DA2BB; background: rgba(255,255,255,.92); border-top: 1px solid #E8EAF2; }
        .t-nueva { animation: tNueva 4.5s cubic-bezier(.2,.7,.2,1) infinite; }
        @keyframes tNueva { 0%, 8% { opacity: 0; transform: translateY(-10px) scale(.97); } 16%, 100% { opacity: 1; transform: none; } }
        .t-orbe { width: 58px; height: 58px; border-radius: 50%;
          background: radial-gradient(circle at 35% 30%, #fff 0%, #8F8BFF 30%, #211E78 75%);
          box-shadow: 0 0 0 8px rgba(143,139,255,.18), 0 0 40px 8px rgba(116,96,212,.45);
          animation: tOrbe 3.2s ease-in-out infinite; }
        @keyframes tOrbe { 0%,100% { transform: scale(1); box-shadow: 0 0 0 8px rgba(143,139,255,.18), 0 0 40px 8px rgba(116,96,212,.45); }
          50% { transform: scale(1.08); box-shadow: 0 0 0 14px rgba(143,139,255,.10), 0 0 56px 14px rgba(116,96,212,.55); } }
        .t-cursor { margin-left: 1px; color: #211E78; animation: tCursor 1.1s steps(2) infinite; }
        @keyframes tCursor { 50% { opacity: 0; } }

        /* Scroll: los teléfonos entran girando y se abren. Solo CSS. */
        @supports (animation-timeline: view()) {
          @media (prefers-reduced-motion: no-preference) {
            .tel-a { animation: telA linear both; animation-timeline: view(); animation-range: entry 5% cover 50%; }
            .tel-b { animation: telB linear both; animation-timeline: view(); animation-range: entry 5% cover 50%; }
            .t-brillo { animation: tBrillo linear both; animation-timeline: view(); animation-range: entry 0% exit 100%; }
          }
        }
        @keyframes telA {
          from { transform: perspective(1500px) translate(-64%, -40%) rotateY(46deg) rotateX(18deg) rotateZ(-14deg); }
          to   { transform: perspective(1500px) translate(-98%, -57%) rotateY(20deg) rotateX(6deg) rotateZ(-5deg); }
        }
        @keyframes telB {
          from { transform: perspective(1500px) translate(-30%, -26%) rotateY(-46deg) rotateX(16deg) rotateZ(12deg) translateZ(0); }
          to   { transform: perspective(1500px) translate(-4%, -54%) rotateY(-16deg) rotateX(5deg) rotateZ(3deg) translateZ(70px); }
        }
        @keyframes tBrillo { from { transform: translateX(-35%); } to { transform: translateX(35%); } }

        @media (prefers-reduced-motion: reduce) {
          .flota, .t-nueva, .t-orbe, .t-cursor { animation: none; }
        }
      ` }} />
    </section>
  )
}
