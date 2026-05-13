import { BARRIOS, type Barrio } from '@/lib/barrios'

interface Props {
  barrio: Barrio
}

// Heurística: "no te conviene si" se construye comparando tags que tienen otros barrios
// y que este barrio NO tiene.
function generarNoTeConviene(b: Barrio): string[] {
  const otrosTags = new Set<string>()
  for (const otro of BARRIOS as Barrio[]) {
    if (otro.slug === b.slug) continue
    for (const t of otro.tags) otrosTags.add(t)
  }

  const flags: string[] = []
  if (!b.tags.includes('golf') && otrosTags.has('golf')) {
    flags.push('Tu prioridad #1 es el golf (acá no hay campo dentro del barrio).')
  }
  if (!b.tags.some((t) => ['nautico', 'playa', 'laguna'].includes(t))) {
    flags.push('Necesitás acceso al agua o playa privada.')
  }
  if ((b.datosDuros.medidaLoteDesde ?? 0) < 800 && otrosTags.has('lotes-grandes')) {
    flags.push('Buscás lotes de 1.000+ m² (acá los lotes son más chicos).')
  }
  if (b.tier === 'Premium') {
    flags.push('Tu presupuesto está pensado para barrios accesibles.')
  }
  if (b.tier === 'En desarrollo' && b.estado !== 'consolidado') {
    flags.push('Querés mudarte ya con todo armado (este barrio todavía está en desarrollo).')
  }
  if (!b.amenities.some((a) => a.id.includes('seguridad'))) {
    flags.push('Necesitás vigilancia 24hs probada (consultar protocolo).')
  }
  return flags.slice(0, 4)
}

export default function BarrioPerfil({ barrio }: Props) {
  const noTeConviene = generarNoTeConviene(barrio)
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-xl bg-brand-50 p-6 ring-1 ring-brand-100">
        <h4 className="mb-4 font-raleway text-xl font-semibold text-brand-700">Te conviene si</h4>
        <ul className="space-y-2 text-sm leading-relaxed text-stone-700">
          {barrio.perfilComprador.map((p) => (
            <li key={p} className="flex gap-2">
              <span className="text-brand-600">✓</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl bg-stone-50 p-6 ring-1 ring-stone-200">
        <h4 className="mb-4 font-raleway text-xl font-semibold text-stone-600">
          Probablemente no
        </h4>
        {noTeConviene.length > 0 ? (
          <ul className="space-y-2 text-sm leading-relaxed text-stone-600">
            {noTeConviene.map((p) => (
              <li key={p} className="flex gap-2">
                <span className="text-stone-400">×</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-stone-600">
            Es un barrio bien balanceado — sirve para casi cualquier perfil. Hablemos para chequear
            tu caso puntual.
          </p>
        )}
      </div>
    </div>
  )
}
