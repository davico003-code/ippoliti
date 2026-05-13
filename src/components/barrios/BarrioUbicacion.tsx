interface Props {
  nombre: string
  coords?: { lat: number; lng: number }
  accesos: string[]
  distanciaCentroRosarioMin?: number
}

// Distancias estimadas en min (auto) desde el corredor a puntos de referencia
const DESTINOS = [
  { label: 'Aeropuerto Internacional Rosario', min: 10 },
  { label: 'Centro Funes', min: 5 },
  { label: 'Autopista Rosario–Córdoba', min: 3 },
  { label: 'Centro Rosario', min: 17 },
]

export default function BarrioUbicacion({
  nombre,
  coords,
  accesos,
  distanciaCentroRosarioMin,
}: Props) {
  const center = coords ?? { lat: -32.9159, lng: -60.8073 }
  const q = `${center.lat},${center.lng}`
  const mapSrc = `https://www.google.com/maps?q=${q}&output=embed&z=14`

  const destinos = distanciaCentroRosarioMin
    ? DESTINOS.map((d) => (d.label.includes('Centro Rosario') ? { ...d, min: distanciaCentroRosarioMin } : d))
    : DESTINOS

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="overflow-hidden rounded-xl ring-1 ring-stone-200">
        <iframe
          src={mapSrc}
          title={`Mapa de ${nombre}`}
          loading="lazy"
          className="h-[400px] w-full border-0"
        />
      </div>
      <div className="space-y-5">
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Accesos</h4>
          <ul className="space-y-1 text-sm text-stone-700">
            {accesos.map((a) => (
              <li key={a} className="flex gap-2">
                <span className="text-brand-600">→</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
            Distancias en auto
          </h4>
          <ul className="divide-y divide-stone-100 rounded-lg ring-1 ring-stone-200">
            {destinos.map((d) => (
              <li
                key={d.label}
                className="flex items-center justify-between px-4 py-2.5 text-sm text-stone-700"
              >
                <span>{d.label}</span>
                <span className="font-numeric tabular-nums text-navy-700">{d.min} min</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
