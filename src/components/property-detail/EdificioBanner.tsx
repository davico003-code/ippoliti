// Banner en la ficha de una unidad: avisa que forma parte de un edificio con
// más departamentos publicados y linkea a la página del edificio.
//
// Recibe solo los datos ya resueltos (nombre, slug, cuántas otras unidades):
// nunca el array de propiedades, para no engordar el payload de la ficha.

import Link from 'next/link'
import { Building2, ArrowRight } from 'lucide-react'

const R = "var(--font-raleway, 'Raleway'), system-ui, sans-serif"

interface Props {
  nombre: string
  slug: string
  otrasUnidades: number
  desde?: string | null
}

// Fondo y borde con tokens del tema (no inline fijos): en oscuro el subtítulo
// gris sí se aclaraba y quedaba sobre el fondo casi blanco, ilegible. Como clases
// y no como style, además, el hover verde vuelve a verse (el inline lo pisaba).
export default function EdificioBanner({ nombre, slug, otrasUnidades, desde }: Props) {
  if (otrasUnidades < 1) return null

  return (
    <Link
      href={`/edificios/${slug}`}
      className="flex items-center gap-3.5 rounded-2xl border border-[color:var(--theme-border,#DCEBE2)] bg-[var(--theme-surface,#FBFEFC)] px-4 py-3.5 transition-colors hover:bg-[var(--theme-tint,#e7f2eb)]"
      style={{ textDecoration: 'none' }}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{ background: 'var(--theme-tint, #e7f2eb)', color: 'var(--theme-accent, #1A5C38)' }}
        aria-hidden
      >
        <Building2 className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className="block text-[14.5px] font-bold text-[#1C1C1E]"
          style={{ fontFamily: R }}
        >
          Parte de {nombre}
        </span>
        <span className="block text-[13px] text-[#6e6e73]">
          Hay <span className="font-numeric">{otrasUnidades}</span> {otrasUnidades === 1 ? 'unidad más' : 'unidades más'} en este
          edificio{desde ? <> · desde <span className="font-numeric">{desde}</span></> : null}
        </span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0" style={{ color: 'var(--theme-accent, #1A5C38)' }} aria-hidden />
    </Link>
  )
}
