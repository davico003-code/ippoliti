// Sección 3 (mobile) — "Proyectos destacados" como carrusel marquee.
// Mismo marquee compartido que desktop, sin video (imagen estática en mobile).

import ProyectosMarquee from '@/components/home/ProyectosMarquee'

const R = "var(--font-raleway), 'Raleway', system-ui, sans-serif"

export default function ProyectosCarousel() {
  return (
    <section style={{ background: '#f9fafb', padding: '20px 0 26px', overflow: 'hidden' }}>
      <div style={{ padding: '0 20px', marginBottom: 16 }}>
        <h2 style={{ font: `800 22px/1.2 ${R}`, color: '#111', letterSpacing: '-0.01em', margin: 0 }}>
          Proyectos destacados
        </h2>
        <p style={{ font: `13px ${R}`, color: '#6b7280', margin: '2px 0 0' }}>
          Invertí con respaldo.
        </p>
      </div>

      <ProyectosMarquee />
    </section>
  )
}
