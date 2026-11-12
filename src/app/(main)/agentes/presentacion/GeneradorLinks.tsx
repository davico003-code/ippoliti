'use client'

// Panel de agentes: genera links de un solo uso para mandarle la presentación
// /como-trabajamos a un cliente. Copiar y WhatsApp se hacen con un toque
// aparte (nunca clipboard después de un await: Safari lo bloquea).

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, Check, Copy, MessageCircle, MonitorPlay } from 'lucide-react'
import { copiarTexto } from '@/lib/share-ficha'

interface LinkItem {
  token: string
  cliente: string
  creadoEn: string
  usadoEn?: string
  visitas?: number
  url: string
}

const GREEN = '#1A5C38'

function fecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function GeneradorLinks() {
  const [cliente, setCliente] = useState('')
  const [nuevo, setNuevo] = useState<LinkItem | null>(null)
  const [links, setLinks] = useState<LinkItem[]>([])
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [copiado, setCopiado] = useState('')

  const cargar = useCallback(async () => {
    const r = await fetch('/api/agentes/presentacion-link', { credentials: 'include' })
    if (r.ok) setLinks((await r.json()).links ?? [])
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  async function generar(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      const r = await fetch('/api/agentes/presentacion-link', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || 'No se pudo generar el link')
      setNuevo({ ...data.link, url: data.url })
      setCliente('')
      cargar()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setCargando(false)
    }
  }

  async function copiar(url: string) {
    if (await copiarTexto(url)) {
      setCopiado(url)
      setTimeout(() => setCopiado(''), 2000)
    }
  }

  const mensaje = (l: LinkItem) =>
    `Hola ${l.cliente.split(' ')[0]}, ¿cómo estás? Te comparto cómo trabajamos en SI INMOBILIARIA con cada propiedad. Es un link personal, para abrir desde tu celular o computadora: ${l.url}`

  return (
    <main className="mx-auto max-w-[760px] px-4 py-8 font-raleway md:py-12">
      <Link href="/agentes" className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-neutral-600 no-underline">
        <ArrowLeft size={16} /> Volver al panel
      </Link>
      <h1 className="mt-4 text-[28px] font-extrabold tracking-tight text-neutral-900">Presentación &quot;Cómo trabajamos&quot;</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-neutral-600">
        Generá un link personal para cada cliente: <strong>el link es la clave</strong>, no hay contraseña que pasar. Se
        abre solo en el primer dispositivo (no se puede compartir) y el cliente la puede ver <strong>2 veces en 48 horas</strong>.
        Si no lo abre, vence a los 3 días. En la TV de la oficina se ve directo con tu sesión de agente.
      </p>

      <Link
        href="/como-trabajamos"
        className="mt-4 inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-[14px] font-semibold text-neutral-800 no-underline"
      >
        <MonitorPlay size={16} /> Abrir la presentación (TV)
      </Link>

      <form onSubmit={generar} className="mt-8 rounded-2xl border border-neutral-200 bg-white p-5">
        <label className="block text-[13px] font-bold uppercase tracking-wider text-neutral-500" htmlFor="cliente">
          Nombre del cliente
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            id="cliente"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            placeholder="Ej: Marcela Pérez"
            className="min-h-[48px] flex-1 rounded-xl border border-neutral-300 px-4 text-[16px] outline-none focus:border-neutral-500"
          />
          <button
            type="submit"
            disabled={cargando}
            className="min-h-[48px] rounded-xl px-5 text-[15px] font-bold text-white disabled:opacity-60"
            style={{ background: GREEN }}
          >
            {cargando ? 'Generando…' : 'Generar link'}
          </button>
        </div>
        {error && <p className="mt-2 text-[14px] font-semibold text-red-700">{error}</p>}
        <p className="mt-2 text-[12.5px] text-neutral-500">El nombre aparece en la presentación: &quot;Presentación privada para …&quot;.</p>
        <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-[12.5px] font-semibold text-amber-900">
          No abras el link vos para probarlo: se gasta y al cliente ya no le abre. Para verla, usá &quot;Abrir la presentación&quot;.
        </p>
      </form>

      {nuevo && (
        <div className="mt-4 rounded-2xl p-5 text-white" style={{ background: GREEN }}>
          <p className="m-0 text-[13px] font-bold uppercase tracking-wider opacity-80">Link para {nuevo.cliente}</p>
          <p className="mt-1 break-all font-mono text-[13px]">{nuevo.url}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => copiar(nuevo.url)} className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-white px-4 text-[14px] font-bold" style={{ color: GREEN }}>
              {copiado === nuevo.url ? <Check size={16} /> : <Copy size={16} />} {copiado === nuevo.url ? 'Copiado' : 'Copiar link'}
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(mensaje(nuevo))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/60 px-4 text-[14px] font-bold text-white no-underline"
            >
              <MessageCircle size={16} /> Enviar por WhatsApp
            </a>
          </div>
        </div>
      )}

      <h2 className="mt-10 text-[18px] font-extrabold text-neutral-900">Tus últimos links</h2>
      {links.length === 0 ? (
        <p className="mt-2 text-[14px] text-neutral-500">Todavía no generaste ninguno.</p>
      ) : (
        <ul className="m-0 mt-3 grid list-none gap-2 p-0">
          {links.map((l) => (
            <li key={l.token} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3">
              <span>
                <span className="block text-[15px] font-bold text-neutral-900">{l.cliente}</span>
                <span className="block text-[12.5px] text-neutral-500">Creado {fecha(l.creadoEn)}</span>
              </span>
              {l.usadoEn ? (
                <span className="rounded-full bg-green-50 px-3 py-1 text-[12.5px] font-bold" style={{ color: GREEN }}>
                  Abierto {fecha(l.usadoEn)} · {l.visitas ?? 1} de 2 visitas
                </span>
              ) : (
                <button type="button" onClick={() => copiar(l.url)} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 px-3 py-1 text-[12.5px] font-bold text-neutral-700">
                  {copiado === l.url ? <Check size={14} /> : <Copy size={14} />} {copiado === l.url ? 'Copiado' : 'Sin abrir · copiar'}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
