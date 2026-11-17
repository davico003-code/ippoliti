'use client'

import { useRef, useState } from 'react'
import { X } from 'lucide-react'
import Image from '@/components/Imagen'
import WaGalinda from '@/components/galinda/WaGalinda'
import {
  GAL_BASE,
  UNIDADES,
  entregaDe,
  frenteA,
  m2Comunes,
  nombreUnidad,
  tipoCorto,
  type TipoUnidad,
  type UnidadGalinda,
} from '@/lib/galinda'

// Unidades de Galinda! como en fundar.com.ar (David, 17-nov: "copiale bien a la
// página de Fundar"): tarjeta con el plano a la izquierda y los m² grandes en
// Poppins. Mejoras sobre la de ellos: filtro por tipo en un toque (no un
// select + paginado), dos tarjetas por fila en la compu, el plano se agranda
// ahí mismo, entrega y orientación de cada unidad y el precio por WhatsApp.

type Filtro = 'todas' | TipoUnidad | 'locales'

const FILTROS: { id: Filtro; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: '2d', label: '2 dormitorios' },
  { id: '3d', label: '3 dormitorios' },
  { id: 'of', label: 'Oficina' },
  { id: 'locales', label: 'Locales' },
]

function Tarjeta({ u }: { u: UnidadGalinda }) {
  const ref = useRef<HTMLDialogElement>(null)
  const nombre = nombreUnidad(u)
  const plano = `${GAL_BASE}/plano-${u.id}.webp`
  const abrir = () => ref.current?.showModal()

  return (
    <li className="rounded-2xl bg-[var(--card-surface)] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] md:p-5">
      <div className="grid grid-cols-[112px_1fr] gap-4 sm:grid-cols-[150px_1fr] sm:gap-5">
        <button
          type="button"
          onClick={abrir}
          aria-label={`Ver el plano de la ${nombre.toLowerCase()}`}
          className="relative aspect-square overflow-hidden rounded-xl bg-white ring-1 ring-[var(--line)] transition-shadow hover:ring-[var(--brand)]"
        >
          <Image src={plano} alt="" fill sizes="150px" className="object-contain p-2" />
        </button>
        <div className="min-w-0">
          <p className="font-poppins text-xs font-semibold uppercase tracking-[0.12em] text-[var(--tinta-mute)]">
            Galinda! · {u.id}
          </p>
          <p className="font-poppins mt-1 text-[34px] font-medium leading-none tracking-tight text-[var(--brand)] sm:text-[40px]">
            {u.m2} m²
          </p>
          <p className="font-poppins mt-2 font-medium">{tipoCorto(u.tipo)} · piso {u.piso}</p>
          <p className="text-sm text-[var(--tinta-mute)]">{frenteA(u.frente).replace(/^f/, 'F')}</p>
          <dl className="font-poppins mt-2 grid grid-cols-[auto_1fr] gap-x-2 text-sm">
            <dt className="text-[var(--tinta-mute)]">Propios</dt>
            <dd className="font-medium">{u.m2Exclusivos} m²</dd>
            <dt className="text-[var(--tinta-mute)]">Comunes</dt>
            <dd className="font-medium">{m2Comunes(u)} m²</dd>
            <dt className="text-[var(--tinta-mute)]">Entrega</dt>
            <dd className="font-medium">{entregaDe(u.tipo).replace(' de ', ' ')}</dd>
            <dt className="text-[var(--tinta-mute)]">Cochera</dt>
            <dd className="font-medium">Opcional</dd>
          </dl>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={abrir}
          className="rounded-xl border border-[var(--brand)] px-3 py-3 text-sm font-bold text-[var(--brand)] transition-colors hover:bg-[var(--brand-light)]"
        >
          Ver plano
        </button>
        <WaGalinda
          origen={`unidad-${u.id}`}
          label="Pedir precio"
          className="px-3"
          text={`Hola! Quiero el precio de la ${nombre.toLowerCase()} de Galinda! (${u.m2} m², ${frenteA(u.frente)}).`}
        />
      </div>

      <dialog
        ref={ref}
        onClick={(e) => {
          if (e.target === ref.current) ref.current?.close()
        }}
        className="m-auto w-[min(920px,calc(100vw-32px))] max-w-none rounded-2xl bg-white p-0 backdrop:bg-black/60"
      >
        <div className="flex items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3 text-neutral-900">
          <p className="font-bold">
            {nombre} · <span className="font-poppins font-medium">{u.m2} m²</span>
          </p>
          <button type="button" onClick={() => ref.current?.close()} aria-label="Cerrar plano" className="rounded-lg bg-neutral-100 p-2">
            <X className="h-4 w-4" />
          </button>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- plano a tamaño completo, se pide al abrir */}
        <img src={plano} alt={`Plano de la ${nombre.toLowerCase()}`} loading="lazy" className="block max-h-[78vh] w-full object-contain" />
      </dialog>
    </li>
  )
}

// Locales del paseo comercial: no hay stock cargado, se consultan (David, 17-nov).
function TarjetaLocales() {
  return (
    <li className="rounded-2xl bg-[var(--card-surface)] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] md:p-5">
      <div className="grid grid-cols-[112px_1fr] gap-4 sm:grid-cols-[150px_1fr] sm:gap-5">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-[var(--cream)]">
          <Image src={`${GAL_BASE}/r-paseo.webp`} alt="Render del paseo comercial de Galinda!" fill sizes="150px" className="object-cover" />
        </div>
        <div className="min-w-0">
          <p className="font-poppins text-xs font-semibold uppercase tracking-[0.12em] text-[var(--tinta-mute)]">Galinda! · Paseo comercial</p>
          <p className="font-poppins mt-1 text-[34px] font-medium leading-none tracking-tight text-[var(--brand)] sm:text-[40px]">Locales</p>
          <p className="font-poppins mt-2 font-medium">Locales comerciales en planta baja</p>
          <p className="mt-1 text-sm text-[var(--tinta-mute)]">
            Sobre el paseo comercial y la plazoleta, con el movimiento de los departamentos y las oficinas. Consultanos
            medidas y disponibilidad.
          </p>
        </div>
      </div>
      <WaGalinda
        origen="locales"
        label="Consultar por locales"
        className="mt-4 w-full"
        text="Hola! Quiero consultar por los locales comerciales de Galinda!: medidas, disponibilidad y precio."
      />
    </li>
  )
}

export default function ListaUnidades() {
  const [filtro, setFiltro] = useState<Filtro>('todas')
  const lista = filtro === 'todas' ? UNIDADES : UNIDADES.filter((u) => u.tipo === filtro)
  const conLocales = filtro === 'todas' || filtro === 'locales'

  return (
    <div className="mt-6">
      <div role="tablist" aria-label="Tipo de unidad" className="flex flex-wrap gap-2">
        {FILTROS.map((f) => {
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
                  : 'border border-[var(--line)] bg-[var(--card-surface)] text-[var(--foreground)] hover:border-[var(--brand)]'
              }`}
            >
              <span className="font-poppins font-medium">{f.label}</span>
            </button>
          )
        })}
      </div>
      <ul className="mt-5 grid gap-4 lg:grid-cols-2">
        {lista.map((u) => (
          <Tarjeta key={u.id} u={u} />
        ))}
        {conLocales && <TarjetaLocales />}
      </ul>
    </div>
  )
}
