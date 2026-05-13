import Link from 'next/link'
import Image from 'next/image'

// TODO: completar con David — links reales a columnas en InfoFunes / El Roldanense
const COLUMNAS = [
  {
    titulo: 'Por qué el corredor Funes–Roldán sigue absorbiendo demanda en 2026',
    medio: 'InfoFunes',
    fecha: 'Marzo 2026',
    url: '#',
  },
  {
    titulo: 'Lo que cambió en los precios de lotes después del último año',
    medio: 'InfoFunes',
    fecha: 'Febrero 2026',
    url: '#',
  },
  {
    titulo: 'Roldán y Funes: dos perfiles distintos, mismo corredor',
    medio: 'El Roldanense',
    fecha: 'Enero 2026',
    url: '#',
  },
  {
    titulo: 'El boom de los barrios náuticos: qué busca el ABC1 ahora',
    medio: 'InfoFunes',
    fecha: 'Diciembre 2025',
    url: '#',
  },
]

export default function BarrioMediosLocales() {
  return (
    <section className="bg-[#FAF7F2] px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-start gap-12 lg:grid-cols-[280px_1fr]">
          <div>
            <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-full bg-stone-200 ring-4 ring-white">
              {/* TODO: subir foto real a /public/team/david-flores.jpg */}
              <Image
                src="/team/david-flores.jpg"
                alt="David Flores — Mat. N° 0621"
                fill
                className="object-cover"
                sizes="160px"
              />
            </div>
            <p className="mt-4 text-center font-raleway text-lg font-semibold text-navy-700">
              David Flores
            </p>
            <p className="text-center text-xs text-stone-600">
              Mat. N° 0621
              <br />
              Co-director SI INMOBILIARIA
              <br />
              Columnista en InfoFunes y El Roldanense
            </p>
          </div>

          <div>
            <h2 className="mb-2 font-raleway text-3xl font-semibold text-navy-700">
              Análisis del corredor, en primera persona
            </h2>
            <p className="mb-6 text-base leading-relaxed text-stone-600">
              David escribe columnas mensuales sobre el mercado de Funes y Roldán para los medios
              locales. Si querés entender cómo se mueven los precios, dónde está la demanda y qué
              esperar de los próximos meses, leelo directo desde la fuente.
            </p>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
              Últimas columnas
            </h3>
            <ul className="divide-y divide-stone-200 rounded-xl bg-white ring-1 ring-stone-200">
              {COLUMNAS.map((c) => (
                <li key={c.titulo} className="px-5 py-4">
                  <Link href={c.url} className="block">
                    <p className="font-raleway text-base font-medium text-navy-700 hover:text-brand-700">
                      {c.titulo}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      {c.medio} · {c.fecha}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-stone-500">
              {/* TODO: cargar links reales y agregar CTA "Leer todas las columnas" */}
              Próximamente: archivo completo de columnas con enlaces a InfoFunes y El Roldanense.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
