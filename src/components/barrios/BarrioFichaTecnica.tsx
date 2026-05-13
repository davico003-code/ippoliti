import type { Barrio } from '@/lib/barrios'

interface Props {
  barrio: Barrio
}

export default function BarrioFichaTecnica({ barrio }: Props) {
  const items: { label: string; value: string }[] = []
  const d = barrio.datosDuros

  if (d.cantidadLotes) items.push({ label: 'Cantidad de lotes', value: String(d.cantidadLotes) })
  if (d.medidaLoteDesde) {
    const hasta = d.medidaLoteHasta ?? d.medidaLoteDesde
    items.push({
      label: 'Tamaño de lote',
      value: hasta === d.medidaLoteDesde ? `${d.medidaLoteDesde} m²` : `${d.medidaLoteDesde}–${hasta} m²`,
    })
  }
  if (d.hectareasTotales) items.push({ label: 'Hectáreas totales', value: `${d.hectareasTotales} ha` })
  if (d.espaciosVerdesM2) items.push({ label: 'Espacios verdes', value: `${d.espaciosVerdesM2.toLocaleString('es-AR')} m²` })
  if (barrio.ubicacion.distanciaCentroRosarioMin) {
    items.push({
      label: 'Min al centro Rosario',
      value: `${barrio.ubicacion.distanciaCentroRosarioMin} min`,
    })
  }
  items.push({
    label: 'Estado',
    value: barrio.estado.charAt(0).toUpperCase() + barrio.estado.slice(1).replace('-', ' '),
  })
  items.push({ label: 'Desarrollador', value: barrio.desarrollador })
  if (barrio.comercial.precioLoteDesdeUSD) {
    items.push({
      label: 'Lote desde',
      value: `USD ${barrio.comercial.precioLoteDesdeUSD.toLocaleString('es-AR')}`,
    })
  } else {
    items.push({ label: 'Lote desde', value: 'Consultar precio actualizado' })
  }

  return (
    <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {items.map((it) => (
        <div key={it.label} className="rounded-lg bg-white p-4 ring-1 ring-stone-200">
          <dt className="text-xs uppercase tracking-wide text-stone-500">{it.label}</dt>
          <dd className="mt-1 font-numeric text-lg font-semibold tabular-nums text-navy-700">
            {it.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
