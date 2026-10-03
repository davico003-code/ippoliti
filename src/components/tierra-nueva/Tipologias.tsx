'use client'

// Selector de departamento: filtro por dormitorios, chips A–I y la ficha de la
// tipología elegida con su plano oficial. Tocar el plano lo abre en grande con
// zoom (el lightbox se carga recién al abrirlo).

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { Compass, ZoomIn } from 'lucide-react'
import { COCHERA_M2, TIPOLOGIAS, TN_BASE, TN_PRECIOS, cuotaMensual, m2, usd } from '@/lib/tierra-nueva'
import WaCta from './WaCta'

const PlanoZoom = dynamic(() => import('@/components/fisherton-work/PlanoZoom'), { ssr: false })

type Filtro = 0 | 1 | 2

const FILTROS: { id: Filtro; label: string }[] = [
  { id: 0, label: 'Todos' },
  { id: 1, label: '1 dormitorio' },
  { id: 2, label: '2 dormitorios' },
]

export default function Tipologias() {
  const [filtro, setFiltro] = useState<Filtro>(0)
  const [letra, setLetra] = useState('A')
  const [plano, setPlano] = useState(0)
  const [zoom, setZoom] = useState(false)

  const lista = useMemo(() => TIPOLOGIAS.filter((t) => !filtro || t.dormitorios === filtro), [filtro])
  const t = lista.find((x) => x.letra === letra) ?? lista[0]
  const p = t.planos[Math.min(plano, t.planos.length - 1)]
  const financiado = t.dormitorios === 1 ? TN_PRECIOS.unDorm.financiado : TN_PRECIOS.dosDorm.financiado

  const elegir = (l: string) => {
    setLetra(l)
    setPlano(0)
  }

  return (
    // Orden del DOM = orden en el celular: letras → plano → ficha. En desktop el
    // plano ocupa la columna derecha a lo alto de las dos filas.
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:grid-rows-[auto_1fr] lg:gap-x-12">
      <div className="lg:col-start-1 lg:row-start-1">
        <div role="tablist" aria-label="Filtrar por dormitorios" className="inline-flex rounded-full border border-gray-200 bg-white p-1">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              role="tab"
              type="button"
              aria-selected={filtro === f.id}
              onClick={() => {
                setFiltro(f.id)
                setPlano(0)
              }}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-colors md:text-sm ${
                filtro === f.id ? 'bg-[#1A5C38] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5">
          {lista.map((x) => {
            const on = x.letra === t.letra
            return (
              <button
                key={x.letra}
                type="button"
                onClick={() => elegir(x.letra)}
                aria-pressed={on}
                className={`rounded-2xl border px-2 py-3 text-center transition-all ${
                  on ? 'border-[#1A5C38] bg-[#1A5C38] text-white shadow-md' : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300'
                }`}
              >
                <span className="block text-2xl font-black leading-none">{x.letra}</span>
                <span className={`mt-1 block text-[11px] font-semibold ${on ? 'text-white/75' : 'text-gray-500'}`}>
                  {x.dormitorios} dorm · <span className="font-numeric">{Math.round(x.cubierta)}</span> m²
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1">
        {t.planos.length > 1 && (
          <div className="mb-3 inline-flex rounded-full border border-gray-200 bg-white p-1">
            {t.planos.map((pl, i) => (
              <button
                key={pl.img}
                type="button"
                onClick={() => setPlano(i)}
                aria-pressed={plano === i}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                  plano === i ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {pl.pisos}
              </button>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => setZoom(true)}
          className="group relative block w-full overflow-hidden rounded-3xl border border-gray-200 bg-white"
          aria-label={`Ampliar plano de la unidad ${t.letra}`}
        >
          <div className="relative aspect-[14/11] w-full">
            <Image
              key={p.img}
              src={`${TN_BASE}/planos/${p.img}.webp`}
              alt={`Plano de la unidad ${t.letra}, ${p.pisos}, Condos Tierra Nueva`}
              fill
              className="object-contain p-2"
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
          </div>
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-gray-900/85 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
            <ZoomIn className="h-3.5 w-3.5" /> Ver en grande
          </span>
        </button>
        <p className="mt-2 text-xs text-gray-400">{p.pisos} · plano orientativo, sujeto a cambios del proyecto.</p>
      </div>

      <article className="rounded-3xl lg:col-start-1 lg:row-start-2 border border-gray-200 bg-white p-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1A5C38]">Unidad {t.letra}</p>
        <h3 className="mt-1 text-2xl font-black tracking-tight text-gray-900">
          {t.dormitorios === 1 ? '1 dormitorio' : '2 dormitorios'} + balcón + cochera
        </h3>
        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
          <Dato label="Cubierta" valor={m2(t.cubierta)} />
          <Dato label="Balcón" valor={m2(t.semicubierta)} />
          <Dato label="Cochera" valor={m2(COCHERA_M2)} />
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Orientación</dt>
            <dd className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-base font-bold text-gray-900">
              <Compass className="h-4 w-4 text-[#1A5C38]" /> {t.orientacion}
              <span className="text-xs font-medium text-gray-500">{t.orientacion === 'Este' ? 'sol de mañana' : 'sol de tarde'}</span>
            </dd>
          </div>
        </dl>
        <div className="mt-5 rounded-2xl bg-[#F1F8F4] px-4 py-3 text-sm text-gray-700">
          Desde <span className="font-numeric font-black text-gray-900">{usd(cuotaMensual(financiado))}</span> por mes en{' '}
          <span className="font-numeric">{TN_PRECIOS.cuotas}</span> cuotas fijas en dólares, sin anticipo.
        </div>
        <div className="mt-5">
          <WaCta
            origen={`tipologia-${t.letra}`}
            label={`Consultar unidad ${t.letra}`}
            text={`Hola! Me interesa la unidad ${t.letra} (${t.dormitorios} dorm, ${m2(t.cubierta)}) de Tierra Nueva. ¿Qué disponibilidad hay?`}
          />
        </div>
      </article>

      {zoom && (
        <PlanoZoom
          index={0}
          onClose={() => setZoom(false)}
          slides={[{ src: `${TN_BASE}/planos/${p.img}.webp`, width: 1400, height: 1100, title: `Unidad ${t.letra} · ${p.pisos}` }]}
        />
      )}
    </div>
  )
}

function Dato({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <dt className="text-[11px] font-bold uppercase tracking-widest text-gray-400">{label}</dt>
      <dd className="font-numeric mt-0.5 text-base font-bold text-gray-900">{valor}</dd>
    </div>
  )
}
