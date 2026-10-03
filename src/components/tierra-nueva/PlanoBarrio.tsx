'use client'

// Plano del barrio Tierra Nueva redibujado (de la planta de emplazamiento
// oficial): los condos nuevos en verde y clickeables, el resto del barrio en
// gris con su nombre. Al elegir un condo se ve su render, ubicación y entrega.

import { useState } from 'react'
import Image from 'next/image'
import { CalendarCheck, MapPin } from 'lucide-react'
import { CALLES_BARRIO, CONDOS, LOTES_BARRIO, TN_BASE, VERDE_BARRIO, type CondoId } from '@/lib/tierra-nueva'
import WaCta from './WaCta'

const GREEN = '#1A5C38'

export default function PlanoBarrio() {
  const [sel, setSel] = useState<CondoId>('condo-22')
  const condo = CONDOS.find((c) => c.id === sel)!

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-10">
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-[#F7F8F7] p-2 md:p-4">
        <svg viewBox="20 236 600 490" className="h-auto w-full" role="group" aria-label="Plano del barrio Tierra Nueva">
          {/* Espacio verde y reservorio */}
          <polygon points={VERDE_BARRIO} fill="#DDEFE3" stroke="#B9DCC5" strokeWidth="1" />
          <text x="120" y="595" textAnchor="middle" className="fill-[#3E7D57] text-[9px] font-bold uppercase tracking-wider">
            Espacio verde
          </text>

          {CALLES_BARRIO.map((c) => (
            <text
              key={c.label}
              x={c.x}
              y={c.y}
              textAnchor="middle"
              transform={c.vertical ? `rotate(90 ${c.x} ${c.y})` : undefined}
              className="fill-gray-400 text-[9px] font-semibold uppercase tracking-[0.18em]"
            >
              {c.label}
            </text>
          ))}

          {LOTES_BARRIO.map((l, i) => {
            const [x, y, w, h] = l.rect
            const nuevo = !!l.condo
            const activo = l.condo === sel
            return (
              <g
                key={i}
                onClick={nuevo ? () => setSel(l.condo!) : undefined}
                className={nuevo ? 'cursor-pointer' : undefined}
                role={nuevo ? 'button' : undefined}
                aria-label={nuevo ? `Ver ${l.nombre}` : undefined}
                aria-pressed={nuevo ? activo : undefined}
                tabIndex={nuevo ? 0 : undefined}
                onKeyDown={nuevo ? (e) => (e.key === 'Enter' || e.key === ' ') && setSel(l.condo!) : undefined}
              >
                <rect
                  x={x + 1.5}
                  y={y + 1.5}
                  width={w - 3}
                  height={h - 3}
                  rx="4"
                  fill={activo ? GREEN : nuevo ? '#7FD1A3' : '#FFFFFF'}
                  stroke={nuevo ? GREEN : '#D9DDDA'}
                  strokeWidth={nuevo ? 2 : 1}
                  className="transition-colors duration-200"
                />
                {activo && (
                  <rect x={x - 2} y={y - 2} width={w + 4} height={h + 4} rx="6" fill="none" stroke={GREEN} strokeOpacity=".35" strokeWidth="3">
                    <animate attributeName="stroke-opacity" values=".45;.05;.45" dur="2.2s" repeatCount="indefinite" />
                  </rect>
                )}
                {l.nombre && (
                  <text
                    x={x + w / 2}
                    y={y + h / 2 + (nuevo ? 4 : 3)}
                    textAnchor="middle"
                    className={
                      nuevo
                        ? `pointer-events-none text-[11px] font-black ${activo ? 'fill-white' : 'fill-[#0B2A19]'}`
                        : 'pointer-events-none fill-gray-400 text-[7.5px] font-semibold'
                    }
                  >
                    {nuevo ? l.nombre.replace('Condo ', '') : l.nombre}
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-2 pb-1 pt-2 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm border-2 border-[#1A5C38] bg-[#7FD1A3]" /> Condos 22, 23 y 24 (en venta)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm border border-gray-300 bg-white" /> Otros condos del barrio
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-[#DDEFE3]" /> Espacio verde
          </span>
        </div>
      </div>

      <div>
        <div role="tablist" aria-label="Elegí el condo" className="grid grid-cols-3 gap-2">
          {CONDOS.map((c) => (
            <button
              key={c.id}
              role="tab"
              type="button"
              aria-selected={sel === c.id}
              onClick={() => setSel(c.id)}
              className={`rounded-2xl border px-3 py-3 text-center transition-colors ${
                sel === c.id ? 'border-[#1A5C38] bg-[#1A5C38] text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="block text-[10px] font-bold uppercase tracking-widest opacity-70">Condo</span>
              <span className="font-numeric block text-2xl font-black leading-tight">{c.numero}</span>
            </button>
          ))}
        </div>

        <article className="mt-4 overflow-hidden rounded-3xl border border-gray-200 bg-white">
          <div className="relative aspect-[4/3] bg-gray-100">
            <Image
              key={condo.id}
              src={`${TN_BASE}/${condo.render}`}
              alt={`Render de Condo ${condo.numero}, Tierra Nueva, Fisherton`}
              fill
              className="animate-fade-in object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          </div>
          <div className="p-5 md:p-6">
            <h3 className="text-2xl font-black tracking-tight text-gray-900">
              Condo <span className="font-numeric">{condo.numero}</span>
            </h3>
            <p className="mt-2 flex items-start gap-2 text-sm text-gray-600">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#1A5C38]" />
              {condo.calle} · {condo.manzana}, {condo.lote}
            </p>
            <p className="mt-1.5 flex items-start gap-2 text-sm text-gray-600">
              <CalendarCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#1A5C38]" />
              {condo.entrega ? (
                <span>
                  Entrega estimada: <strong className="text-gray-900">{condo.entrega}</strong>
                </span>
              ) : (
                'Entrega: consultá la fecha estimada'
              )}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-gray-500">
              <span className="font-numeric">4</span> pisos · <span className="font-numeric">36</span> departamentos ·{' '}
              <span className="font-numeric">36</span> cocheras · pileta, SUM y parrilla propios.
            </p>
            <div className="mt-5">
              <WaCta
                origen={`plano-${condo.id}`}
                label={`Consultar Condo ${condo.numero}`}
                text={`Hola! Quiero información sobre Condo ${condo.numero} de Tierra Nueva: unidades disponibles, precios y cuotas.`}
              />
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
