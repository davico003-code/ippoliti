// Banner en la ficha de una unidad: avisa que forma parte de un edificio con
// más departamentos publicados y linkea a la página del edificio.
//
// Recibe solo los datos ya resueltos (nombre, slug, cuántas otras unidades):
// nunca el array de propiedades, para no engordar el payload de la ficha.

import Link from 'next/link'
import { Building2, ArrowRight } from 'lucide-react'

const GREEN = '#1A5C38'
const R = "'Raleway', system-ui, sans-serif"

interface Props {
  nombre: string
  slug: string
  otrasUnidades: number
  desde?: string | null
}

export default function EdificioBanner({ nombre, slug, otrasUnidades, desde }: Props) {
  if (otrasUnidades < 1) return null

  return (
    <Link
      href={`/edificios/${slug}`}
      className="flex items-center gap-3.5 rounded-2xl border px-4 py-3.5 transition-colors hover:bg-[#e7f2eb]"
      style={{ borderColor: '#DCEBE2', background: '#FBFEFC', textDecoration: 'none' }}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{ background: '#e7f2eb', color: GREEN }}
        aria-hidden
      >
        <Building2 className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className="block text-[14.5px] font-bold text-[#111]"
          style={{ fontFamily: R }}
        >
          Parte de {nombre}
        </span>
        <span className="block text-[13px] text-[#6e6e73]">
          Hay {otrasUnidades} {otrasUnidades === 1 ? 'unidad más' : 'unidades más'} en este
          edificio{desde ? ` · desde ${desde}` : ''}
        </span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0" style={{ color: GREEN }} aria-hidden />
    </Link>
  )
}
