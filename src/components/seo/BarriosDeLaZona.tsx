import Link from 'next/link'
import { barriosDe } from '@/lib/zonas-links'

// Los barrios privados de una localidad, linkeados desde sus páginas (casas,
// terrenos, inmobiliaria): cada /barrios-privados/{slug} solo recibía el link
// del índice y Google no llegaba a rastrearlos.
export default function BarriosDeLaZona({ zona, nombre }: { zona: 'funes'; nombre: string }) {
  const barrios = barriosDe(zona)
  if (!barrios.length) return null
  return (
    <section className="border-t border-gray-100 bg-white px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: 'var(--font-raleway)' }}>
          Barrios privados de {nombre}
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {barrios.map((b) => (
            <Link key={b.href} href={b.href} className="rounded-full bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-[#e7f2eb] hover:text-[#1A5C38]">
              {b.label}
            </Link>
          ))}
          <Link href="/barrios-privados" className="rounded-full px-4 py-2.5 text-sm font-bold text-[#1A5C38]">
            Comparar todos →
          </Link>
        </div>
      </div>
    </section>
  )
}
