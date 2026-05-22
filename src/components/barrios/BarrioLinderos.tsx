import Link from 'next/link'
import { BARRIOS, type Barrio } from '@/lib/barrios'

const TICKET_DESCRIPCION: Record<Barrio['tier'], string> = {
  Premium: 'Premium',
  Consolidado: 'Medio-alto',
  'Consolidado con vida joven': 'Medio',
  'En desarrollo': 'Accesible',
  'Próximamente': 'A confirmar',
}

interface Props {
  barrio: Barrio
}

export default function BarrioLinderos({ barrio }: Props) {
  // Linderos = mismos zona, distinto slug, máximo 3
  const linderos = (BARRIOS as Barrio[])
    .filter((b) => b.slug !== barrio.slug && b.zona === barrio.zona)
    .slice(0, 3)

  if (linderos.length === 0) return null

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-stone-200 bg-stone-50 text-left">
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
              Barrio
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
              Lote desde
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
              Estado
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
              Acceso
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
              Ticket
            </th>
          </tr>
        </thead>
        <tbody>
          {linderos.map((b) => (
            <tr key={b.slug} className="border-b border-stone-100 hover:bg-stone-50">
              <td className="px-4 py-3">
                <Link
                  href={`/barrios-privados/${b.slug}`}
                  className="font-raleway font-medium text-navy-700 hover:text-brand-700"
                >
                  {b.nombre}
                </Link>
              </td>
              <td className="px-4 py-3 font-numeric tabular-nums text-stone-700">
                {b.datosDuros.medidaLoteDesde ? `${b.datosDuros.medidaLoteDesde} m²` : '—'}
              </td>
              <td className="px-4 py-3 text-stone-700 capitalize">
                {b.estado.replace('-', ' ')}
              </td>
              <td className="px-4 py-3 text-stone-700">
                {b.ubicacion.accesos[0] ?? '—'}
              </td>
              <td className="px-4 py-3 text-stone-700">{TICKET_DESCRIPCION[b.tier]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
