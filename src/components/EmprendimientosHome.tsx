// Sección 3 (desktop) — "Proyectos destacados" como mosaico bento.
// El mosaico y los datos viven en componentes compartidos; este wrapper solo
// aporta el header de la sección.

import ProyectosMosaico from '@/components/home/ProyectosMosaico'
import EncabezadoSeccion from '@/components/home/EncabezadoSeccion'

export default function EmprendimientosHome() {
  return (
    <section className="[--pad:24px] lg:[--pad:40px]" style={{ background: '#F5F5F7', padding: '64px 0 72px', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 var(--pad)' }}>
        <EncabezadoSeccion
          eyebrow="Emprendimientos"
          titulo="Proyectos destacados"
          bajada="Invertí con respaldo."
          className="mb-7"
        />

        <div className="revela"><ProyectosMosaico /></div>
      </div>
    </section>
  )
}
