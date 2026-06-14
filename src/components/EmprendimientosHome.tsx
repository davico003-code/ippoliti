// Sección 3 (desktop) — "Proyectos destacados" como carrusel marquee.
// El marquee y los datos viven en componentes compartidos; este wrapper
// solo aporta el header de la sección. Video al hover (withVideo).

import ProyectosMarquee from '@/components/home/ProyectosMarquee'

const R = "var(--font-raleway), 'Raleway', system-ui, sans-serif"

export default function EmprendimientosHome() {
  return (
    <section style={{ background: '#f9fafb', padding: '46px 0 54px', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto 22px', padding: '0 24px' }}>
        <h2 style={{ font: `800 clamp(26px,3vw,32px)/1.2 ${R}`, color: '#111827', letterSpacing: '-0.01em', margin: '0 0 2px' }}>
          Proyectos destacados
        </h2>
        <p style={{ font: `14px ${R}`, color: '#6b7280', margin: 0 }}>
          Invertí con respaldo.
        </p>
      </div>

      <ProyectosMarquee withVideo />
    </section>
  )
}
