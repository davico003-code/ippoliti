// Sección 3 (mobile) — "Proyectos destacados" como mosaico bento.
// Mismo mosaico compartido que desktop (responsive: 2 columnas en mobile).

import ProyectosMosaico from '@/components/home/ProyectosMosaico'

const R = "var(--font-raleway), 'Raleway', system-ui, sans-serif"

export default function ProyectosCarousel() {
  return (
    <section style={{ background: '#f9fafb', padding: '24px 0 30px', overflow: 'hidden' }}>
      <div style={{ padding: '0 20px' }}>
        <h2 style={{ font: `800 22px/1.2 ${R}`, color: '#111', letterSpacing: '-0.01em', margin: 0 }}>
          Proyectos destacados
        </h2>
        <p style={{ font: `13px ${R}`, color: '#6b7280', margin: '2px 0 0' }}>
          Invertí con respaldo.
        </p>

        <ProyectosMosaico />
      </div>
    </section>
  )
}
