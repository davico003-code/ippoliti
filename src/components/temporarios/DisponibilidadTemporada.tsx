// Cuadro de disponibilidad de la temporada: Dic · Ene · Feb, cada mes partido en
// 1ra y 2da quincena. Se completa a medida que se alquila (renglón "Alquilado:"
// de la descripción en HILO → lib/temporarios).
import { MESES_TEMPORADA, type QuincenaClave } from '@/lib/temporarios'

export type ColoresDisponibilidad = {
  libreFondo: string
  libreBorde: string
  libreTexto: string
  acento: string
}

// Paleta café del arena (home y ficha): libre = blanco con borde tierra.
const CAFE: ColoresDisponibilidad = { libreFondo: '#FFFFFF', libreBorde: '#CDB892', libreTexto: '#2F2418', acento: '#2F2418' }

export default function DisponibilidadTemporada({
  alquiladas,
  tamano = 'sm',
  colores = CAFE,
}: {
  alquiladas: QuincenaClave[]
  tamano?: 'sm' | 'md'
  colores?: ColoresDisponibilidad
}) {
  const ocupada = new Set(alquiladas)
  const libres = MESES_TEMPORADA.length * 2 - ocupada.size
  const alto = tamano === 'md' ? 'h-9 text-[12px]' : 'h-7 text-[11px]'
  const libre = { background: colores.libreFondo, color: colores.libreTexto, boxShadow: `inset 0 0 0 1px ${colores.libreBorde}` }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2" role="list" aria-label="Disponibilidad de la temporada por quincena">
        {MESES_TEMPORADA.map((m) => (
          <div key={m.clave} role="listitem">
            <span className="block mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">{m.nombre}</span>
            <div className="grid grid-cols-2 gap-1">
              {([1, 2] as const).map((q) => {
                const alquilada = ocupada.has(`${m.clave}-${q}`)
                return (
                  <span
                    key={q}
                    className={`${alto} rounded-md flex items-center justify-center font-bold`}
                    style={alquilada ? { background: '#ECEAE6', color: '#A8A29E', textDecoration: 'line-through' } : libre}
                    title={`${q === 1 ? '1ra' : '2da'} quincena de ${m.nombre}: ${alquilada ? 'alquilada' : 'libre'}`}
                  >
                    {q === 1 ? '1ra' : '2da'}
                  </span>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="flex items-center gap-3 text-[11px] text-gray-500" style={{ margin: '6px 0 0' }}>
        <span className="inline-flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: colores.libreFondo, boxShadow: `inset 0 0 0 1px ${colores.libreBorde}` }} /> Libre
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: '#ECEAE6' }} /> Alquilada
        </span>
        <span className="ml-auto font-semibold" style={{ color: libres > 0 ? colores.acento : '#78716C' }}>
          {libres > 0 ? `${libres} quincena${libres > 1 ? 's' : ''} libre${libres > 1 ? 's' : ''}` : 'Temporada completa'}
        </span>
      </p>
    </div>
  )
}
