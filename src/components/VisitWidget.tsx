'use client'

import { useEffect, useId, useRef, useState, type FocusEvent } from 'react'
import { Calendar, Check, MessageCircle, Share2, X } from 'lucide-react'
import { events, idEventoMeta, trackFbEvent } from '@/lib/analytics'
import { urlConUtmDePauta } from '@/lib/pauta-visita'
import { escribirContacto, leerContacto } from '@/lib/feed-en-red'
import { haptico } from '@/lib/haptico'
import {
  abrirWhatsApp,
  compartirNativo,
  lineaDatos,
  puedeCompartirNativo,
  registrarCompartir,
  urlCompartible,
  type ContextoCompartir,
} from '@/lib/compartir'

interface Props {
  propertyId: number
  propertyTitle: string
  /** URL pública de la ficha (siinmobiliaria.com/propiedades/{slug}).
   *  Si se pasa, se incluye en el mensaje de WhatsApp al agente. */
  propertyUrl?: string
  /** De dónde viene el lead (para tracking interno). */
  source?: 'mobile-sticky' | 'desktop-sidebar' | 'emprendimiento' | 'otro'
  /** Si se pasa, muestra la X de cerrar (ej. bottom-sheet mobile). */
  onClose?: () => void
  /** WhatsApp (formato wa.me) al que va el pedido; sin esto, el número general. */
  whatsappNumber?: string
  /** Operación de la propiedad, para etiquetar el lead (default venta). */
  tipo?: 'venta' | 'alquiler'
  /** 'tarjeta' (sidebar de la compu, landings) o 'hoja' (dentro de la hoja del
   *  celu: sin marco propio y con el botón pegado al pie, a mano del pulgar). */
  variante?: 'tarjeta' | 'hoja'
  /** Precio y zona, para el texto de "Mandale la ficha a quien te acompaña". */
  propertyPrice?: string
  propertyUbicacion?: string
}

const WHATSAPP_GENERAL = '5493413340916'

function getNextBusinessDays(count: number): Date[] {
  const days: Date[] = []
  const d = new Date()
  d.setDate(d.getDate() + 1)
  while (days.length < count) {
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) days.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return days
}

// Cuándo confirmamos, según la hora en que la persona pide. Antes decía fijo
// "en menos de 2 hs", también un viernes a las 23: promesa rota en el primer
// contacto. Los días ofrecidos (lunes a viernes) no se tocan sin OK de David.
function cuandoTeConfirmamos(ahora = new Date()): string {
  const dow = ahora.getDay()
  const h = ahora.getHours()
  const habil = dow >= 1 && dow <= 5
  if (habil && h >= 9 && h < 19) return 'en menos de 2 h'
  if (habil && h < 9) return 'hoy a primera hora'
  if (dow >= 1 && dow <= 4) return 'mañana a primera hora'
  return 'el lunes a primera hora'
}

// Horarios en slots de 30 min (09:00–18:00).
const HOURS = (() => {
  const out: string[] = []
  for (let h = 9; h <= 18; h++) {
    out.push(`${String(h).padStart(2, '0')}:00`)
    if (h < 18) out.push(`${String(h).padStart(2, '0')}:30`)
  }
  return out
})()

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const GREEN = '#1A5C38'
const ACENTO = 'var(--theme-accent, #1A5C38)'

// Chip elegido: anillo de 2px con box-shadow (sin cambiar el ancho del borde,
// así no salta 1px al tocar) y colores del tema: en oscuro el número del día
// iba en #111 sobre #202224 y el horario elegido en menta sobre casi blanco.
const chipActivo = { border: `1px solid ${ACENTO}`, boxShadow: `inset 0 0 0 1px ${ACENTO}`, background: 'var(--theme-tint, #F4F8F5)' }
const chipInactivo = { border: '1px solid var(--theme-border, #e5e7eb)' }

// Motion corto: la confirmación entra 220ms (ease-out) y el check crece 200ms.
const ESTILOS = `
@keyframes si-visita-aparece{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes si-visita-check{from{transform:scale(.8)}to{transform:scale(1)}}
.si-visita-exito{animation:si-visita-aparece 220ms cubic-bezier(.22,1,.36,1)}
.si-visita-check{animation:si-visita-check 200ms ease-out}
.si-visita-chip{transition:background-color 150ms ease-out,box-shadow 150ms ease-out,border-color 150ms ease-out;-webkit-tap-highlight-color:transparent}
.si-visita-cta{transition:transform 120ms ease-out,opacity 150ms ease-out;-webkit-tap-highlight-color:transparent}
.si-visita-cta:active:not(:disabled){transform:scale(.98)}
@media (prefers-reduced-motion: reduce){
  .si-visita-exito,.si-visita-check{animation:none}
  .si-visita-chip,.si-visita-cta{transition:none}
  .si-visita-cta:active:not(:disabled){transform:none;opacity:.85}
}`

// Diseño: header con ícono, días y horarios como tiras que se deslizan con el
// pulgar (en la compu, grilla: se ven todos sin flechas) y el verde solo en el
// botón. Antes eran ventanas de 3 con flechas: llegar a las 17:00 eran 14 toques.
// Al pedir, abre WhatsApp al agente y registra el lead en segundo plano.
// Pide nombre + WhatsApp (17-oct-2026): sin el celular, Hilo rechazaba el pedido
// ("Falta correo o teléfono") y NINGUNA visita pedida desde la web entraba al
// CRM. Es un solo campo más, prellenado si ya lo dejó en este navegador.
export default function VisitWidget({
  propertyId,
  propertyTitle,
  propertyUrl,
  source = 'otro',
  tipo = 'venta',
  onClose,
  whatsappNumber = WHATSAPP_GENERAL,
  variante = 'tarjeta',
  propertyPrice,
  propertyUbicacion,
}: Props) {
  const hoja = variante === 'hoja'
  const uid = useId()
  const idNombre = `${uid}-nombre`
  const idWhatsapp = `${uid}-whatsapp`
  const whatsappRef = useRef<HTMLInputElement>(null)

  // Los días se calculan en el navegador, nunca en el render del server: el
  // HTML ISR (UTC, cacheado horas) pintaba otros días que el cliente → hydration
  // mismatch y re-render completo en la landing de pauta. Mientras, esqueletos.
  const [days, setDays] = useState<Date[] | null>(null)
  // La app propone el primer día hábil; la persona solo confirma o cambia.
  const [selectedDay, setSelectedDay] = useState(0)
  const [selectedHour, setSelectedHour] = useState('')
  const [nombre, setNombre] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    setDays(getNextBusinessDays(7))
  }, [])

  // Lo que ya dejó en este navegador (mismo contacto que el WhatsApp con datos).
  useEffect(() => {
    const c = leerContacto()
    if (c.nombre) setNombre((n) => n || c.nombre)
    if (c.whatsapp) setWhatsapp((w) => w || c.whatsapp)
  }, [])

  const selectedDate = days?.[selectedDay] ?? null
  const dateLabel = selectedDate
    ? `${DAY_NAMES[selectedDate.getDay()]} ${selectedDate.getDate()} ${MONTH_NAMES[selectedDate.getMonth()]}`
    : ''
  const digitos = whatsapp.replace(/\D/g, '')
  const faltaHorario = selectedHour === ''
  const faltaNombre = nombre.trim() === ''
  const faltaWhatsapp = digitos.length < 10
  const canSubmit = !!selectedDate && !faltaHorario && !faltaNombre && !faltaWhatsapp
  // El botón dice qué falta en vez de quedar gris sin explicación.
  const textoBoton = faltaHorario
    ? 'Elegí un horario'
    : faltaNombre
      ? 'Falta tu nombre'
      : faltaWhatsapp
        ? 'Falta tu WhatsApp'
        : 'Pedir visita por WhatsApp'

  // Link de WhatsApp con el pedido pre-cargado. Se reusa en el submit y en la
  // confirmación (por si el popup se bloqueó o el cliente no llegó a enviarlo).
  const waHref = selectedDate
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        [
          `Hola! Vengo de la propiedad "${propertyTitle}"${propertyUrl ? `:\n${propertyUrl}` : '.'}`,
          ``,
          `Me gustaría coordinar una visita el ${dateLabel} a las ${selectedHour} hs.`,
          nombre.trim() ? `\nSoy ${nombre.trim()}.` : '',
        ].join('\n'),
      )}`
    : ''

  // Sin async: todo lo que necesita el gesto (vibrar, abrir WhatsApp) va en el
  // acto, y la confirmación aparece al instante (optimista). El registro sigue
  // en segundo plano con keepalive (iOS puede suspender la pestaña al saltar a
  // WhatsApp); si falla, WhatsApp ya se abrió y el cliente igual llega al agente.
  function handleSubmit() {
    if (!canSubmit || !selectedDate) return

    haptico()
    // Abrir WhatsApp SINCRÓNICO, dentro del gesto del click: si va después de
    // un await, iOS Safari lo bloquea y el flujo principal de leads mobile no
    // abre WhatsApp.
    if (waHref) window.open(waHref, '_blank')
    if (propertyId) events.contactoPropiedad(propertyId, propertyTitle, 'visita')
    escribirContacto({ nombre: nombre.trim(), whatsapp: digitos })
    setSent(true)

    const fechaStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
    // El mismo id va al píxel (Lead) y a Hilo (Conversions API): Meta cuenta
    // UNA visita aunque el navegador bloquee el píxel. El Contact de arriba se
    // mantiene: es la señal de la pauta de catálogo.
    const metaEventId = idEventoMeta()

    void fetch('/api/agendar-visita', {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: nombre.trim() || null,
        telefono: digitos,
        email: null,
        fecha_preferida: fechaStr,
        horario: `${selectedHour} hs`,
        propiedad_id: propertyId,
        propiedad_titulo: propertyTitle,
        propiedad_url: propertyUrl,
        tipo,
        source,
        pageUrl: urlConUtmDePauta(),
        metaEventId,
      }),
    })
      .then(async (res) => {
        if (res.ok) {
          // Si Hilo ya tenía la consulta, el Lead por CAPI salió con SU id (lo
          // devuelve la ruta): el píxel tiene que usar ese o Meta cuenta dos.
          // Mismo patrón que ConsultaCalificadaForm.
          const data = (await res.json().catch(() => ({}))) as { metaEventId?: string }
          if (propertyId) {
            trackFbEvent(
              'Lead',
              { content_ids: [String(propertyId)], content_name: propertyTitle, content_category: 'visita' },
              data.metaEventId ?? metaEventId,
            )
          }
          return
        }
        // Solo se deja rastro para no volver a perder visitas sin enterarnos.
        console.warn('[VisitWidget] agendar-visita respondió', res.status)
      })
      .catch((e) => console.warn('[VisitWidget] agendar-visita falló', e))
  }

  // La salida del éxito: quien pide una visita casi nunca va solo. Hoja nativa
  // en el celu (sincrónica, dentro del toque); en la compu, WhatsApp.
  function compartirConAcompanante() {
    const contexto: ContextoCompartir = source === 'emprendimiento' ? 'emprendimiento' : 'ficha'
    const ruta = propertyUrl || window.location.pathname
    const datos = lineaDatos({ precio: propertyPrice, ubicacion: propertyUbicacion })
    const visita = dateLabel && selectedHour ? `Pedí visita para el ${dateLabel} a las ${selectedHour} hs.` : ''
    if (puedeCompartirNativo()) {
      haptico()
      const url = urlCompartible(ruta, 'nativo', contexto)
      void compartirNativo({ title: propertyTitle, text: [propertyTitle, datos, visita].filter(Boolean).join('\n'), url }).then(
        (r) => {
          if (r === 'ok') registrarCompartir('nativo', contexto, propertyId)
        },
      )
      return
    }
    const url = urlCompartible(ruta, 'whatsapp', contexto)
    abrirWhatsApp(['Mirá esta propiedad:', propertyTitle, datos, visita, url].filter(Boolean).join('\n'))
    registrarCompartir('whatsapp', contexto, propertyId)
  }

  // En la hoja del celu, el teclado tapaba lo que se estaba escribiendo: al
  // enfocar, se centra el campo (el botón va pegado al pie de la hoja).
  function alEnfocar(e: FocusEvent<HTMLInputElement>) {
    if (!hoja) return
    const campo = e.currentTarget
    window.setTimeout(() => {
      try {
        campo.scrollIntoView({ block: 'center', behavior: 'smooth' })
      } catch {
        /* navegador viejo */
      }
    }, 300)
  }

  const CARD = 'bg-white rounded-3xl p-6 border border-gray-200 shadow-sm'
  const RAIZ = hoja ? 'px-5 pt-1' : CARD

  const botonCerrar = onClose ? (
    <button
      type="button"
      onClick={onClose}
      aria-label="Cerrar"
      className="-mr-2 ml-auto flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100"
    >
      <X className="h-5 w-5" aria-hidden />
    </button>
  ) : null

  // ── Confirmación ──
  if (sent) {
    return (
      <div
        className={`${RAIZ} si-visita-exito text-center ${hoja ? 'pb-[max(20px,env(safe-area-inset-bottom))]' : ''}`}
        role="status"
      >
        <style dangerouslySetInnerHTML={{ __html: ESTILOS }} />
        {botonCerrar && <div className="-mt-1 flex">{botonCerrar}</div>}
        <div
          className="si-visita-check w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ background: 'var(--theme-tint, #E8F1ED)' }}
        >
          <Check className="w-7 h-7" style={{ color: ACENTO }} aria-hidden />
        </div>
        <p className="text-[17px] font-bold text-gray-900 mb-1.5">¡Casi listo!</p>
        <p className="text-sm text-gray-600 mb-4">
          Mandá el mensaje que te abrimos en WhatsApp y te confirmamos la visita {cuandoTeConfirmamos()}.
        </p>
        <div className="rounded-xl p-3.5 text-left text-sm space-y-1 bg-gray-50 mb-4">
          <p><span className="text-gray-500">Día:</span> <span className="font-semibold text-gray-900">{dateLabel}</span></p>
          <p><span className="text-gray-500">Horario:</span> <span className="font-semibold font-numeric text-gray-900">{selectedHour} hs</span></p>
        </div>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="si-visita-cta w-full flex min-h-[48px] items-center justify-center gap-2 rounded-2xl font-bold text-sm text-white"
          style={{ background: '#25D366' }}
        >
          <MessageCircle className="w-4 h-4" aria-hidden />
          Enviar por WhatsApp
        </a>
        {/* Acción secundaria, de texto: no compite con el verde. */}
        <button
          type="button"
          onClick={compartirConAcompanante}
          className="mt-2 inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl px-3 text-[14px] font-semibold"
          style={{ color: ACENTO }}
        >
          <Share2 className="h-4 w-4" aria-hidden />
          Mandale la ficha a quien te acompaña
        </button>
      </div>
    )
  }

  const label = 'block text-[15px] font-bold text-gray-900 mb-3'
  const input =
    'w-full rounded-xl px-3.5 py-3 text-base font-medium text-gray-900 placeholder-gray-400 outline-none bg-gray-50 border border-gray-200 focus:border-[color:var(--theme-accent,#1A5C38)] transition-colors'

  return (
    <form
      className={RAIZ}
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmit()
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: ESTILOS }} />
      {/* Header: un solo verbo en barra, título y botón ("Pedir visita"). */}
      <div className="flex items-center gap-3 mb-5">
        <span
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--theme-tint, #E8F1ED)' }}
        >
          <Calendar className="w-5 h-5" style={{ color: ACENTO }} aria-hidden />
        </span>
        <h3 className="text-xl font-bold text-gray-900">Pedir visita</h3>
        {botonCerrar}
      </div>

      {/* Fecha: tira con snap en el celu; grilla de 7 en la compu. */}
      <p className={label}>Elegí un día</p>
      <div
        role="group"
        aria-label="Día"
        className={
          hoja
            ? 'flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-none py-0.5 mb-6 -mx-5 px-5 scroll-px-5'
            : 'flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-none py-0.5 mb-6 -mx-6 px-6 scroll-px-6 md:mx-0 md:px-0 md:grid md:grid-cols-7 md:gap-1.5 md:overflow-visible'
        }
      >
        {days
          ? days.map((d, i) => {
              const active = selectedDay === i
              return (
                <button
                  type="button"
                  key={d.toDateString()}
                  onClick={() => setSelectedDay(i)}
                  aria-pressed={active}
                  className="si-visita-chip snap-start shrink-0 w-[62px] md:w-auto min-h-[68px] flex flex-col items-center justify-center gap-0.5 rounded-xl"
                  style={active ? chipActivo : chipInactivo}
                >
                  <span className="text-[11px] font-semibold" style={{ color: active ? ACENTO : 'var(--theme-muted, #6B7280)' }}>
                    {DAY_NAMES[d.getDay()]}
                  </span>
                  <span className="text-2xl font-bold font-numeric leading-none" style={{ color: active ? ACENTO : 'var(--foreground, #111)' }}>
                    {d.getDate()}
                  </span>
                  <span className="text-[11px] font-medium" style={{ color: active ? ACENTO : 'var(--theme-muted, #6B7280)' }}>
                    {MONTH_NAMES[d.getMonth()]}
                  </span>
                </button>
              )
            })
          : Array.from({ length: 7 }, (_, i) => (
              <span key={i} aria-hidden className="shrink-0 w-[62px] md:w-auto min-h-[68px] rounded-xl bg-gray-100" />
            ))}
      </div>

      {/* Horario: los 19 a la vista deslizando (celu) o en grilla de 4 (compu). */}
      <p className={label}>Elegí un horario</p>
      <div
        role="group"
        aria-label="Horario"
        className={
          hoja
            ? 'flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-none py-0.5 mb-6 -mx-5 px-5 scroll-px-5'
            : 'flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-none py-0.5 mb-6 -mx-6 px-6 scroll-px-6 md:mx-0 md:px-0 md:grid md:grid-cols-4 md:overflow-visible'
        }
      >
        {HOURS.map((h) => {
          const active = selectedHour === h
          return (
            <button
              type="button"
              key={h}
              onClick={() => setSelectedHour(h)}
              aria-pressed={active}
              className="si-visita-chip snap-start shrink-0 min-w-[76px] md:min-w-0 min-h-[44px] flex items-center justify-center rounded-xl px-3 text-[15px] font-semibold font-numeric"
              style={
                active
                  ? { ...chipActivo, color: ACENTO }
                  : { ...chipInactivo, color: 'var(--theme-ink, #374151)' }
              }
            >
              {h}
            </button>
          )
        })}
      </div>

      {/* Nombre */}
      <label htmlFor={idNombre} className={label}>Tu nombre</label>
      <input
        id={idNombre}
        name="name"
        type="text"
        autoComplete="name"
        inputMode="text"
        // Si el WhatsApp ya está, Enter envía; si no, pasa al campo siguiente.
        enterKeyHint={faltaWhatsapp ? 'next' : 'send'}
        placeholder="Nombre y apellido"
        value={nombre}
        onChange={e => setNombre(e.target.value)}
        onFocus={alEnfocar}
        onKeyDown={e => {
          if (e.key === 'Enter' && faltaWhatsapp) {
            e.preventDefault()
            whatsappRef.current?.focus()
          }
        }}
        className={`${input} mb-4`}
      />

      {/* WhatsApp: con esto el pedido entra a Hilo y te confirman por ahí */}
      <label htmlFor={idWhatsapp} className={label}>Tu WhatsApp</label>
      <input
        ref={whatsappRef}
        id={idWhatsapp}
        type="tel"
        name="tel"
        autoComplete="tel-national"
        inputMode="numeric"
        enterKeyHint="send"
        placeholder="341 555 1234"
        value={whatsapp}
        onChange={e => setWhatsapp(e.target.value)}
        onFocus={alEnfocar}
        className={input}
      />

      {/* En la hoja, el botón queda pegado al pie (a mano del pulgar y a la
          vista aunque se scrollee); en la tarjeta, al final como siempre. */}
      <div
        className={
          hoja
            ? 'sticky bottom-0 z-[1] -mx-5 mt-6 border-t border-gray-100 px-5 pt-3 pb-[max(16px,env(safe-area-inset-bottom))]'
            : 'mt-6 border-t border-gray-100 pt-5'
        }
        style={hoja ? { background: 'var(--theme-surface, #fff)' } : undefined}
      >
        <button
          type="submit"
          disabled={!canSubmit}
          className="si-visita-cta w-full min-h-[52px] rounded-2xl font-bold text-[15px] text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: GREEN }}
        >
          {canSubmit && <MessageCircle className="w-[18px] h-[18px]" aria-hidden />}
          {textoBoton}
        </button>
      </div>
    </form>
  )
}
