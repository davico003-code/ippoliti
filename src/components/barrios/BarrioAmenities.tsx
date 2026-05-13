import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Amenity } from '@/lib/barrios'

interface Props {
  amenities: Amenity[]
}

function pickIcon(name: string): LucideIcon {
  const lib = Icons as unknown as Record<string, LucideIcon | undefined>
  return lib[name] ?? Icons.Check
}

export default function BarrioAmenities({ amenities }: Props) {
  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {amenities.map((a) => {
        const Icon = pickIcon(a.icon)
        return (
          <li
            key={a.id}
            className="flex items-start gap-3 rounded-lg bg-white p-4 ring-1 ring-stone-200"
          >
            <Icon className="mt-0.5 h-5 w-5 flex-none text-brand-600" />
            <span className="text-sm text-stone-700">{a.label}</span>
          </li>
        )
      })}
    </ul>
  )
}
