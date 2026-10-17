'use client'

import { useEffect, useRef, useState, type AnchorHTMLAttributes, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Calendar, MessageCircle, X } from 'lucide-react'
import { events, idEventoMeta, trackEvent, trackFbEvent } from '@/lib/analytics'
import { escribirContacto, leerContacto } from '@/lib/feed-en-red'
import { marcarVisitaDePauta, urlConUtmDePauta } from '@/lib/pauta-visita'
import {
  WHATSAPP_CON_DATOS_ACTIVO,
  consultaYaEnviada,
  contarWcd,
  guardarConsultaEnviada,
  guardarTurnoPedido,
  pedirTurno,
  urlWhatsappConDatos,
  type AgenteFicha,
  type ConsultaEnviada,
  type TurnosFicha,
} from '@/lib/whatsapp-con-datos'

/**
 * El botón verde "Consultar por WhatsApp" de la ficha (lib/whatsapp-con-datos).
 * Sin pauta es el mismo <a> de siempre. Al que vino de un anuncio le pide
 * nombre + celular en una hoja, manda la consulta a Hilo y abre WhatsApp con el
 * agente que Hilo le asignó. Después (17-oct-2026, el "segundo filtro"), la
 * misma hoja le ofrece elegir día + franja para una visita: opcional, sin
 * pedirle nada más; Hilo se la agenda al mismo agente, que confirma la hora
 * por WhatsApp. Los días y franjas los manda Hilo con la consulta.
 */

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'> & {
  href: string
  propertyId: number
  propertyTitle: string
  propertyPrice?: string
  children: ReactNode
}

const TOPE_MS = 6000
const VERDE = '#1A5C38'

type RespuestaLeads = { agente?: AgenteFicha | null; metaEventId?: string; conversationId?: string | null; turnos?: TurnosFicha | null }

export default function WhatsappConDatos({ href, propertyId, propertyTitle, propertyPrice, children, ...rest }: Props) {
  const [pauta, setPauta] = useState(false)
  const [abierta, setAbierta] = useState(false)

  useEffect(() => {
    setPauta(WHATSAPP_CON_DATOS_ACTIVO && marcarVisitaDePauta())
  }, [])

  return (
    <>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        {...rest}
        onClick={(e) => {
          events.contactoPropiedad(propertyId, propertyTitle, 'whatsapp')
          if (!pauta) return
          e.preventDefault()
          contarWcd('toque')
          setAbierta(true)
        }}
      >
        {children}
      </a>
      {abierta &&
        createPortal(
          <HojaWhatsapp
            hrefFicha={href}
            propertyId={propertyId}
            propertyTitle={propertyTitle}
            propertyPrice={propertyPrice}
            onCerrar={() => setAbierta(false)}
          />,
          document.body,
        )}
    </>
  )
}

function abrirWhatsapp(url: string) {
  // En el celu, navegar abre la app; en la compu, otra pestaña (como el botón de siempre).
  if (window.matchMedia?.('(pointer: coarse)').matches) {
    window.location.href = url
    return
  }
  const w = window.open(url, '_blank')
  if (w) w.opener = null
}

function HojaWhatsapp({
  hrefFicha,
  propertyId,
  propertyTitle,
  propertyPrice,
  onCerrar,
}: {
  hrefFicha: string
  propertyId: number
  propertyTitle: string
  propertyPrice?: string
  onCerrar: () => void
}) {
  const [nombre, setNombre] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [estado, setEstado] = useState<'form' | 'enviando' | 'listo'>('form')
  const [error, setError] = useState<string | null>(null)
  const [destino, setDestino] = useState<{ url: string; consulta: ConsultaEnviada } | null>(null)
  const nombreRef = useRef<HTMLInputElement>(null)
  const whatsappRef = useRef<HTMLInputElement>(null)

  function irAWhatsapp(consulta: ConsultaEnviada, opts: { abrir: boolean } = { abrir: true }) {
    const url = urlWhatsappConDatos(hrefFicha, consulta.nombre, consulta.agente)
    setDestino({ url, consulta })
    setEstado('listo')
    if (opts.abrir) abrirWhatsapp(url)
  }

  async function enviar(n: string, w: string) {
    const digitos = w.replace(/\D/g, '')
    if (n.trim().length < 2) {
      setError('Contanos tu nombre y apellido.')
      nombreRef.current?.focus()
      return
    }
    if (digitos.length < 10) {
      setError('Tu WhatsApp: código de área + número, sin el 15 (ej. 341 555 1234).')
      whatsappRef.current?.focus()
      return
    }
    setError(null)
    setEstado('enviando')
    // Mismo id para el píxel y para la Conversions API (Hilo): Meta cuenta UNA consulta.
    const metaEventId = idEventoMeta()
    const envio = fetch('/api/leads', {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: n.trim(),
        whatsapp: digitos,
        origen: 'whatsapp_ficha',
        propertyId,
        propertyTitle,
        propertyPrice,
        pageUrl: urlConUtmDePauta(),
        eventType: 'property.inquiry',
        metaEventId,
      }),
    })
      .then(async (r) => (r.ok ? ((await r.json().catch(() => ({}))) as RespuestaLeads) : null))
      .catch(() => null)
    // Con tope: si Hilo tarda, igual se le abre el chat (la consulta sigue entrando).
    const res = await Promise.race([envio, new Promise<'tarde'>((r) => window.setTimeout(() => r('tarde'), TOPE_MS))])
    const respondio = res && res !== 'tarde' ? res : null
    const consulta: ConsultaEnviada = {
      nombre: n.trim(),
      whatsapp: digitos,
      agente: respondio?.agente ?? null,
      conversationId: respondio?.conversationId ?? null,
      turnos: respondio?.turnos ?? null,
      turnoPedido: null,
    }
    if (respondio) {
      escribirContacto({ nombre: n.trim(), whatsapp: digitos })
      guardarConsultaEnviada(propertyId, consulta)
      contarWcd('datos')
      trackFbEvent('Lead', { content_name: propertyTitle, content_ids: [String(propertyId)], content_category: 'whatsapp_ficha' }, respondio.metaEventId ?? metaEventId)
      trackEvent('generate_lead', { origen: 'whatsapp_ficha' })
    }
    irAWhatsapp(consulta)
  }

  // Al abrir: si esta ficha ya se consultó en la pestaña, la hoja vuelve a
  // "Listo" (mismo chat a un toque, sin otra consulta, y el turno si no lo
  // pidió) SIN saltar sola a WhatsApp: en el celu, al volver de WhatsApp y
  // tocar de nuevo, saltaba otra vez y nunca se veía el turno. Si ya dejó sus
  // datos en este navegador, se manda sin preguntar.
  useEffect(() => {
    const previa = consultaYaEnviada(propertyId)
    if (previa) {
      irAWhatsapp(previa, { abrir: false })
      return
    }
    const c = leerContacto()
    setNombre(c.nombre)
    setWhatsapp(c.whatsapp)
    if (c.nombre.trim().length >= 2 && c.whatsapp.replace(/\D/g, '').length >= 10) void enviar(c.nombre, c.whatsapp)
    else window.setTimeout(() => (c.nombre.trim() ? whatsappRef.current : nombreRef.current)?.focus(), 50)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Escape cierra SOLO la hoja (en la compu la ficha es un panel que también se
  // cierra con Escape: se escucha en captura y no se deja seguir) y el fondo no
  // se mueve mientras está abierta.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopImmediatePropagation()
      e.preventDefault()
      onCerrar()
    }
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey, true)
    return () => {
      document.body.style.overflow = previo
      window.removeEventListener('keydown', onKey, true)
    }
  }, [onCerrar])

  const input =
    'min-h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-[16px] text-neutral-900 focus:border-neutral-900 focus:outline-none'

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/50 sm:items-center"
      onClick={onCerrar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="wcd-titulo"
        className="max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 pb-[max(20px,env(safe-area-inset-bottom))] shadow-xl sm:max-w-[420px] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-start justify-between gap-3">
          <h2 id="wcd-titulo" className="text-[18px] font-bold text-neutral-900">
            {estado === 'listo' ? 'Listo' : 'Antes de abrir WhatsApp'}
          </h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="-mr-2 -mt-1 flex h-11 w-11 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {estado === 'listo' && destino ? (
          <div>
            <p className="mb-4 text-[15px] text-neutral-700">
              {destino.consulta.agente?.nombre ? `Te atiende ${destino.consulta.agente.nombre}. ` : ''}Si WhatsApp no se abrió solo, tocá acá:
            </p>
            <a
              href={destino.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-bold text-white"
              style={{ background: '#25d366' }}
            >
              <MessageCircle className="h-5 w-5" aria-hidden /> Abrir WhatsApp
            </a>
            {destino.consulta.conversationId && destino.consulta.turnos ? (
              <TurnoVisita propertyId={propertyId} consulta={destino.consulta} />
            ) : null}
          </div>
        ) : (
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              if (estado !== 'enviando') void enviar(nombre, whatsapp)
            }}
          >
            <p className="mb-4 text-[16px] font-medium leading-snug text-neutral-800">
              Dejanos tu nombre y celular: así te atiende siempre la misma persona.
            </p>
            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-[13px] font-semibold uppercase tracking-wide text-neutral-600">Nombre y apellido</span>
                <input
                  ref={nombreRef}
                  type="text"
                  name="name"
                  autoComplete="name"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre y apellido"
                  className={input}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[13px] font-semibold uppercase tracking-wide text-neutral-600">Tu WhatsApp</span>
                <input
                  ref={whatsappRef}
                  type="tel"
                  name="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="341 555 1234"
                  className={input}
                />
              </label>
            </div>
            {error ? (
              <p role="alert" className="mt-3 text-[14px] font-medium text-red-700">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={estado === 'enviando'}
              className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-bold text-white transition hover:brightness-105 disabled:opacity-70"
              style={{ background: '#25d366' }}
            >
              <MessageCircle className="h-5 w-5" aria-hidden />
              {estado === 'enviando' ? 'Abriendo WhatsApp…' : 'Abrir WhatsApp'}
            </button>
            <p className="mt-3 text-center text-[13px] text-neutral-600">
              Solo para responderte esta consulta.{' '}
              <a href="/privacidad" className="underline">
                Política de privacidad
              </a>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

/**
 * El "segundo filtro": elegir día + franja después de abrir WhatsApp. Opcional
 * (se puede cerrar la hoja sin tocar nada). Un toque por día, uno por franja y
 * "Pedir turno"; la hora exacta la confirma el agente por WhatsApp.
 */
function TurnoVisita({ propertyId, consulta }: { propertyId: number; consulta: ConsultaEnviada }) {
  const turnos = consulta.turnos as TurnosFicha
  const [fecha, setFecha] = useState<string | null>(null)
  const [franja, setFranja] = useState<string | null>(null)
  const [estado, setEstado] = useState<'elegir' | 'enviando' | 'listo'>(consulta.turnoPedido ? 'listo' : 'elegir')
  const [pedido, setPedido] = useState<string | null>(consulta.turnoPedido)
  const [error, setError] = useState<string | null>(null)
  const agente = consulta.agente?.nombre || 'El asesor'

  async function pedir() {
    if (!fecha || !franja || !consulta.conversationId || estado === 'enviando') return
    setEstado('enviando')
    setError(null)
    const r = await pedirTurno({ conversationId: consulta.conversationId, whatsapp: consulta.whatsapp, fecha, franja })
    if (!r.ok) {
      setError(r.error)
      setEstado('elegir')
      return
    }
    const etiqueta = `${turnos.dias.find((d) => d.fecha === fecha)?.etiqueta ?? fecha}, ${turnos.franjas.find((f) => f.id === franja)?.etiqueta ?? franja}`
    guardarTurnoPedido(propertyId, etiqueta)
    contarWcd('turno')
    trackEvent('turno_visita', { origen: 'whatsapp_ficha' })
    setPedido(etiqueta)
    setEstado('listo')
  }

  if (estado === 'listo' && pedido) {
    return (
      <div className="mt-5 rounded-2xl bg-neutral-50 p-4" role="status">
        <p className="text-[16px] font-bold text-neutral-900">Turno pedido: {pedido}.</p>
        <p className="mt-1 text-[15px] text-neutral-700">{agente} te confirma la hora por WhatsApp.</p>
      </div>
    )
  }

  const chip = (activo: boolean) =>
    `min-h-11 shrink-0 rounded-full border-2 px-4 text-[15px] font-semibold transition ${
      activo ? 'border-[#1A5C38] bg-[#F4F8F5] text-[#1A5C38]' : 'border-neutral-200 bg-white text-neutral-900'
    }`

  return (
    <div className="mt-5 border-t border-neutral-200 pt-4">
      <p className="text-[16px] font-bold text-neutral-900">¿Querés agendar una visita?</p>
      <p className="mt-1 text-[15px] text-neutral-700">Elegí un día y una franja. {agente} te confirma la hora por WhatsApp.</p>
      <div role="group" aria-label="Día" className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1">
        {turnos.dias.map((d) => (
          <button type="button" key={d.fecha} aria-pressed={fecha === d.fecha} onClick={() => setFecha(d.fecha)} className={chip(fecha === d.fecha)}>
            {d.etiqueta}
          </button>
        ))}
      </div>
      <div role="group" aria-label="Franja" className="mt-2 grid grid-cols-2 gap-2">
        {turnos.franjas.map((f) => (
          <button type="button" key={f.id} aria-pressed={franja === f.id} onClick={() => setFranja(f.id)} className={chip(franja === f.id)}>
            {f.etiqueta}
          </button>
        ))}
      </div>
      {error ? (
        <p role="alert" className="mt-3 text-[14px] font-medium text-red-700">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => void pedir()}
        disabled={!fecha || !franja || estado === 'enviando'}
        className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-bold text-white transition hover:brightness-105 disabled:opacity-40"
        style={{ background: VERDE }}
      >
        <Calendar className="h-5 w-5" aria-hidden />
        {estado === 'enviando' ? 'Pidiendo turno…' : 'Pedir turno'}
      </button>
    </div>
  )
}
