// Sección 3 (desktop) — "Proyectos destacados" como mosaico bento.
// El mosaico y los datos viven en componentes compartidos; este wrapper solo
// aporta el header de la sección.

import ProyectosMosaico from '@/components/home/ProyectosMosaico'

const R = "var(--font-raleway), 'Raleway', system-ui, sans-serif"

export default function EmprendimientosHome() {
  return (
    <section style={{ background: '#f9fafb', padding: '46px 0 56px', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div>
          <h2 style={{ font: `800 clamp(26px,3vw,32px)/1.2 ${R}`, color: '#111827', letterSpacing: '-0.01em', margin: '0 0 3px' }}>
            Proyectos destacados
          </h2>
          <p style={{ font: `14px ${R}`, color: '#6b7280', margin: 0 }}>
            Invertí con respaldo.
          </p>
        </div>

        <ProyectosMosaico />
      </div>
    </section>
  )
}
