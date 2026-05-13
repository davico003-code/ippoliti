'use client'

import { useState } from 'react'

const ITEMS = [
  {
    titulo: 'Reserva → Boleto → Escrituración',
    cuerpo:
      'La operación arranca con una reserva (señal). Si todo está OK, en 30–45 días firmás boleto y luego escriturás según el avance del barrio. En barrios consolidados la escritura es inmediata; en proyectos en desarrollo se firma a posesión.',
  },
  {
    titulo: 'Expensas',
    cuerpo:
      'Cada barrio tiene su propia administración y sus expensas se mueven con la inflación y los servicios contratados. Pedinos el valor actualizado por barrio antes de cerrar. // TODO: completar con David valores referenciales al cierre del mes.',
  },
  {
    titulo: 'Valor m² construido',
    cuerpo:
      'Hoy el costo de construcción de buena calidad en Funes se mueve entre USD 1.000 y 1.400 por m² cubierto, según calidad y constructora. // TODO: confirmar con David rango del mes en curso.',
  },
  {
    titulo: 'Plazos típicos',
    cuerpo:
      'Reserva: 24–72hs. Firma de boleto: 30 días desde la reserva. Escritura: depende del barrio (inmediato en consolidados, a posesión en desarrollos). La operación entera, contado, suele cerrar en 60–90 días.',
  },
  {
    titulo: 'Reglamento interno',
    cuerpo:
      'Cada barrio tiene su reglamento de construcción y convivencia. Te lo pasamos antes de cerrar para que valides retiros, alturas, materiales permitidos y plazos máximos para construir.',
  },
]

export default function BarrioComoSeCompra() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="divide-y divide-stone-200 rounded-xl bg-white ring-1 ring-stone-200">
      {ITEMS.map((item, i) => {
        const isOpen = open === i
        return (
          <div key={item.titulo}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-stone-50"
            >
              <span className="font-raleway text-base font-medium text-navy-700">
                {item.titulo}
              </span>
              <span
                className={`text-xl text-brand-600 transition-transform ${isOpen ? 'rotate-45' : ''}`}
                aria-hidden
              >
                +
              </span>
            </button>
            {isOpen && (
              <div className="px-5 pb-5 text-sm leading-relaxed text-stone-700">{item.cuerpo}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}
