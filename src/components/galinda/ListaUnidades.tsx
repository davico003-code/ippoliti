'use client'

import { useState } from 'react'
import PlanoBoton from '@/components/galinda/PlanoBoton'
import WaGalinda from '@/components/galinda/WaGalinda'
import {
  GAL_BASE,
  TIPO_LABEL,
  UNIDADES,
  entregaDe,
  frenteA,
  nombreUnidad,
  type TipoUnidad,
} from '@/lib/galinda'

// Lista compacta de unidades de Galinda! (David, 17-nov: las tarjetas con foto
// "no son prácticas"). Un renglón por unidad, filtro por tipo arriba; en la
// compu es una tabla, en el celu cada renglón entra en dos líneas + botones.

type Filtro = 'todas' | TipoUnidad

const FILTROS: { id: Filtro; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: '2d', label: '2 dormitorios' },
  { id: '3d', label: '3 dormitorios' },
  { id: 'of', label: 'Oficinas' },
]

export default function ListaUnidades() {
  const [filtro, setFiltro] = useState<Filtro>('todas')
  const lista = filtro === 'todas' ? UNIDADES : UNIDADES.filter((u) => u.tipo === filtro)

  return (
    <div className="mt-6">
      <div role="tablist" aria-label="Tipo de unidad" className="flex flex-wrap gap-2">
        {FILTROS.map((f) => {
          const n = f.id === 'todas' ? UNIDADES.length : UNIDADES.filter((u) => u.tipo === f.id).length
          const activo = filtro === f.id
          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={activo}
              onClick={() => setFiltro(f.id)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                activo
                  ? 'bg-[#17613C] text-white'
                  : 'border border-[var(--line)] text-[var(--foreground)] hover:border-[var(--brand)]'
              }`}
            >
              {f.label} <span className={activo ? 'text-white/75' : 'text-[var(--tinta-mute)]'}>· {n}</span>
            </button>
          )
        })}
      </div>

      {/* Compu: tabla */}
      <div className="mt-5 hidden overflow-hidden rounded-2xl border border-[var(--line)] md:block">
        <table className="w-full text-left tabular-nums">
          <thead className="bg-[var(--cream)] text-sm text-[var(--tinta-mute)]">
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold">Unidad</th>
              <th scope="col" className="px-3 py-3 font-semibold">Tipo</th>
              <th scope="col" className="px-3 py-3 font-semibold">Superficie</th>
              <th scope="col" className="px-3 py-3 font-semibold">Piso</th>
              <th scope="col" className="px-3 py-3 font-semibold">Da a</th>
              <th scope="col" className="px-3 py-3 font-semibold">Entrega</th>
              <th scope="col" className="px-5 py-3"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            {lista.map((u) => {
              const nombre = nombreUnidad(u)
              return (
                <tr key={u.id} className="border-t border-[var(--line)]">
                  <td className="px-5 py-3 font-extrabold">{u.id}</td>
                  <td className="px-3 py-3">{TIPO_LABEL[u.tipo].replace('Oficinas', 'Oficina')}</td>
                  <td className="px-3 py-3">
                    <span className="font-bold">{u.m2} m²</span>{' '}
                    <span className="text-sm text-[var(--tinta-mute)]">({u.m2Exclusivos} propios)</span>
                  </td>
                  <td className="px-3 py-3">{u.piso}.º</td>
                  <td className="px-3 py-3">{u.frente.charAt(0).toUpperCase() + u.frente.slice(1)}</td>
                  <td className="px-3 py-3 text-sm">{entregaDe(u.tipo)}</td>
                  <td className="px-5 py-2.5">
                    <div className="flex justify-end gap-2">
                      <PlanoBoton src={`${GAL_BASE}/plano-${u.id}.webp`} titulo={`Plano · ${nombre} · ${u.m2} m²`} />
                      <WaGalinda
                        origen={`unidad-${u.id}`}
                        label="Consultar precio"
                        text={`Hola! Quiero el precio de la ${nombre.toLowerCase()} de Galinda! (${u.m2} m², ${frenteA(u.frente)}).`}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Celu: renglones */}
      <ul className="mt-5 divide-y divide-[var(--line)] overflow-hidden rounded-2xl border border-[var(--line)] md:hidden">
        {lista.map((u) => {
          const nombre = nombreUnidad(u)
          return (
            <li key={u.id} className="px-4 py-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-lg font-extrabold">{nombre}</p>
                <p className="font-extrabold tabular-nums">{u.m2} m²</p>
              </div>
              <p className="text-sm text-[var(--tinta-mute)]">
                {TIPO_LABEL[u.tipo].replace('Oficinas', 'Oficina')} · piso {u.piso} · {frenteA(u.frente)}
              </p>
              <p className="text-sm text-[var(--tinta-mute)]">Entrega {entregaDe(u.tipo)}</p>
              <div className="mt-3 grid grid-cols-[auto_1fr] gap-2">
                <PlanoBoton src={`${GAL_BASE}/plano-${u.id}.webp`} titulo={`Plano · ${nombre} · ${u.m2} m²`} />
                <WaGalinda
                  origen={`unidad-${u.id}`}
                  label="Consultar precio"
                  text={`Hola! Quiero el precio de la ${nombre.toLowerCase()} de Galinda! (${u.m2} m², ${frenteA(u.frente)}).`}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
