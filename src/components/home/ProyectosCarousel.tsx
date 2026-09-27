// Sección 3 (mobile) — "Proyectos destacados" como mosaico bento.
// Mismo mosaico compartido que desktop (responsive: 2 columnas en mobile).

import ProyectosMosaico from '@/components/home/ProyectosMosaico'
import EncabezadoSeccion from '@/components/home/EncabezadoSeccion'

export default function ProyectosCarousel() {
  return (
    <section style={{ background: '#F5F5F7', padding: '36px 0 36px', overflow: 'hidden' }}>
      <div style={{ padding: '0 20px' }}>
        <EncabezadoSeccion eyebrow="Emprendimientos" titulo="Proyectos destacados" bajada="Invertí con respaldo." className="mb-4" />

        <ProyectosMosaico />
      </div>
    </section>
  )
}
