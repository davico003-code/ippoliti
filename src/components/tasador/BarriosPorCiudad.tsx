// Los barrios medidos de cada ciudad, con un link por tipo a su landing
// (/tasar/… o /vender/…). Es el mapa para que Google llegue a cada barrio y
// para el que prefiere elegir de una lista. Solo lo que da número (Hilo).

import Link from 'next/link'
import { CIUDADES_TASAR, TEXTO_TIPO, TIPOS_TASAR, type IndiceTasar, type Landing } from '@/lib/seo/tasar'

type Props = { indice: IndiceTasar; base: '/tasar' | '/vender' }

export default function BarriosPorCiudad({ indice, base }: Props) {
  const verbo = base === '/vender' ? 'Vender' : 'Tasar'
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {CIUDADES_TASAR.map((ciudad) => {
        // Una fila por zona, con los tipos que dan número en ella.
        const filas = new Map<Landing['zona'], Landing[]>()
        for (const l of Array.from(indice.landings.values())) {
          if (l.zona.ciudad !== ciudad || !l.conNumero) continue
          filas.set(l.zona, [...(filas.get(l.zona) ?? []), l])
        }
        const total = (z: Landing['zona']) => TIPOS_TASAR.reduce((s, t) => s + (z.params[t]?.n ?? 0), 0)
        const orden = Array.from(filas.entries()).sort(([a], [b]) => Number(b.esCiudad) - Number(a.esCiudad) || total(b) - total(a))
        if (!orden.length) return null
        return (
          <section key={ciudad} aria-labelledby={`${base.slice(1)}-${ciudad}`} className="rounded-[24px] border border-[#E1E6E1] p-5 sm:p-6">
            <h3 id={`${base.slice(1)}-${ciudad}`} className="font-raleway text-[24px] font-extrabold text-[#121A15]">
              {ciudad}
            </h3>
            <ul className="mt-3">
              {orden.map(([zona, ls]) => (
                <li key={`${zona.nombre}|${zona.esCiudad}`} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-t border-[#E1E6E1] py-3">
                  <span className="text-[16px] font-bold leading-tight text-[#121A15]">{zona.esCiudad ? `${ciudad}, fuera de barrios` : zona.nombre}</span>
                  <span className="flex gap-1.5">
                    {TIPOS_TASAR.map((t) => ls.find((l) => l.tipo === t))
                      .filter((l): l is Landing => !!l)
                      .map((l) => (
                        <Link
                          key={l.slug}
                          href={`${base}/${l.slug}`}
                          aria-label={`${verbo} ${TEXTO_TIPO[l.tipo].una} en ${zona.esCiudad ? ciudad : zona.nombre}`}
                          className="inline-flex min-h-10 items-center rounded-full bg-[#F3F7F4] px-3.5 text-[14.5px] font-semibold text-[#3C4A42] transition-colors hover:bg-[#e7f2eb] hover:text-[#17613C]"
                        >
                          {TEXTO_TIPO[l.tipo].corto}
                        </Link>
                      ))}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
