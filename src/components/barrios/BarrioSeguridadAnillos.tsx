interface Props {
  niveles: string[]
}

export default function BarrioSeguridadAnillos({ niveles }: Props) {
  const usarAnillos = niveles.length >= 3

  if (!usarAnillos) {
    return (
      <ul className="space-y-2 text-sm leading-relaxed text-stone-700">
        {niveles.map((n) => (
          <li key={n} className="flex gap-3">
            <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-brand-600" />
            <span>{n}</span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="grid items-center gap-8 md:grid-cols-[260px_1fr]">
      <div className="relative mx-auto h-[260px] w-[260px]" aria-hidden>
        <div className="absolute inset-0 rounded-full bg-brand-50" />
        <div className="absolute inset-6 rounded-full bg-brand-100" />
        <div className="absolute inset-14 rounded-full bg-brand-200" />
        <div className="absolute inset-24 flex items-center justify-center rounded-full bg-brand-600 text-white">
          <span className="font-raleway text-xs font-medium">Tu lote</span>
        </div>
        <span className="absolute left-1/2 top-1 -translate-x-1/2 rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-brand-700 shadow">
          Anillo 1
        </span>
        <span className="absolute left-1/2 top-7 -translate-x-1/2 rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-brand-700 shadow">
          Anillo 2
        </span>
        <span className="absolute left-1/2 top-[60px] -translate-x-1/2 rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-brand-700 shadow">
          Anillo 3
        </span>
      </div>
      <ol className="space-y-3 text-sm leading-relaxed text-stone-700">
        {niveles.map((n, i) => (
          <li key={n} className="flex gap-3">
            <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-brand-600 font-numeric text-xs font-medium tabular-nums text-white">
              {i + 1}
            </span>
            <span>{n}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
