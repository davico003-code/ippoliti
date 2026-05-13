const STATS = [
  { value: '11', label: 'Barrios privados' },
  { value: '+5.000', label: 'Lotes residenciales' },
  { value: '+2.500', label: 'Hectáreas urbanizadas' },
  { value: '15–20', label: 'Min al centro Rosario' },
  { value: '8', label: 'Colegios bilingües' },
  { value: '4', label: 'Supermercados grandes' },
  { value: '5', label: 'Min al aeropuerto' },
]

export default function BarrioStatStrip() {
  return (
    <section className="bg-navy-700 px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-8 text-center text-xs font-semibold uppercase tracking-wider text-white/60">
          El corredor en números
        </h2>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4 lg:grid-cols-7">
          {STATS.map((s) => (
            <li key={s.label} className="text-center">
              <p className="font-numeric text-3xl font-semibold tabular-nums text-gold-300 md:text-4xl">
                {s.value}
              </p>
              <p className="mt-1 text-xs text-white/70">{s.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
