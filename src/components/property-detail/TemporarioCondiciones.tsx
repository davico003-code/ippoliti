// Ficha de un alquiler temporario: los valores por quincena / mes y las
// condiciones (depósito y pago · estadía y horarios · qué incluye), cada cosa en
// su renglón. Los datos salen de la descripción cargada en HILO (lib/temporarios).
import { CalendarDays, Check, Clock, Wallet } from 'lucide-react'
import type { CondicionesTemporario } from '@/lib/temporarios'

const R = "'Raleway', system-ui, sans-serif"
const P = "'Poppins', system-ui, sans-serif"
const GREEN = '#1A5C38'
const CARD = 'bg-white rounded-2xl p-6 shadow-sm border border-gray-100'

function Grupo({ icon, titulo, filas }: { icon: React.ReactNode; titulo: string; filas: [string, string | null][] }) {
  const visibles = filas.filter((f): f is [string, string] => Boolean(f[1]))
  if (!visibles.length) return null
  return (
    <div>
      <h3 className="flex items-center gap-2 mb-2 text-[13px] font-bold uppercase tracking-wide text-gray-500">
        <span style={{ color: GREEN }}>{icon}</span>
        {titulo}
      </h3>
      <dl className="space-y-2">
        {visibles.map(([label, valor]) => (
          <div key={label} className="flex justify-between gap-4 border-b border-gray-100 pb-2 text-sm">
            <dt className="text-gray-500">{label}</dt>
            <dd className="font-semibold text-right text-gray-900" style={{ fontVariantNumeric: 'tabular-nums' }}>{valor}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export function TemporarioPrecios({ precios }: { precios: CondicionesTemporario['precios'] }) {
  return (
    <div className="flex flex-wrap gap-3">
      {precios.map((p) => (
        <div key={p.periodo} className="rounded-xl bg-[#f9fafb] border border-gray-100 px-4 py-3 min-w-[150px]">
          <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wide block mb-1">
            Por {p.periodo}
          </span>
          <span style={{ fontFamily: P, fontWeight: 800, fontSize: 24, fontVariantNumeric: 'tabular-nums', color: '#111', lineHeight: 1 }}>
            {p.texto}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function TemporarioCondiciones({
  condiciones: c,
  comodidades = c.comodidades,
}: {
  condiciones: CondicionesTemporario
  /** Comodidades a mostrar (las escritas + las cargadas: comodidadesTemporario). */
  comodidades?: string[]
}) {
  return (
    <section id="condiciones" className={`${CARD} scroll-mt-40`}>
      <h2 style={{ fontFamily: R, fontWeight: 800, fontSize: 18, color: '#111', marginBottom: 16 }}>
        Condiciones del alquiler temporario
      </h2>
      <div className="grid gap-6 md:grid-cols-2">
        <Grupo
          icon={<Wallet className="w-4 h-4" aria-hidden />}
          titulo="Depósito y pago"
          filas={[
            ['Depósito', c.deposito],
            ['Seña para reservar', c.sena],
            ['Forma de pago', c.formaPago],
          ]}
        />
        <Grupo
          icon={<Clock className="w-4 h-4" aria-hidden />}
          titulo="Estadía y horarios"
          filas={[
            ['Capacidad', c.personas ? `Hasta ${c.personas} persona${c.personas === '1' ? '' : 's'}` : null],
            ['Estadía mínima', c.estadiaMinima],
            ['Entrada', c.entrada],
            ['Salida', c.salida],
          ]}
        />
        {c.disponible && (
          <Grupo
            icon={<CalendarDays className="w-4 h-4" aria-hidden />}
            titulo="Disponibilidad"
            filas={[['Fechas', c.disponible]]}
          />
        )}
      </div>
      {comodidades.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2 text-[13px] font-bold uppercase tracking-wide text-gray-500">Comodidades de la casa</h3>
          <ul className="flex flex-wrap gap-2">
            {comodidades.map((item) => (
              <li key={item} className="rounded-full bg-[#F5F1EA] px-3 py-1 text-[13px] font-semibold text-[#44403C]">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
      {c.incluye.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2 text-[13px] font-bold uppercase tracking-wide text-gray-500">Qué incluye</h3>
          <ul className="flex flex-wrap gap-2">
            {c.incluye.map((item) => (
              <li
                key={item}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f5ee] px-3 py-1 text-[13px] font-semibold"
                style={{ color: GREEN }}
              >
                <Check className="w-3.5 h-3.5" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
