'use client'

import { useState } from 'react'
import { Phone } from 'lucide-react'
import ConsultaCalificadaForm from '@/components/consulta/ConsultaCalificadaForm'
import { events } from '@/lib/analytics'

/**
 * Fila secundaria de contacto, debajo del botón principal de WhatsApp (David,
 * 4-oct-2026: "son demasiados botones, confunden"): Llamar | Que me contacten.
 * "Que me contacten" es para el que no quiere escribir: abre ahí mismo, a todo
 * el ancho, el formulario corto (nombre y apellido + WhatsApp) que va a Hilo con
 * la propiedad (/api/leads, origen 'pedir_contacto').
 */
export default function ContactoSecundario({
  propertyId,
  propertyTitle,
  propertyPrice,
  whatsappUrl,
  agente,
  callHref,
  telefono,
}: {
  propertyId: number
  propertyTitle: string
  propertyPrice: string
  whatsappUrl: string
  agente: string
  callHref: string
  /** En la compu se muestra el número (no se puede llamar desde el navegador); en el celu, "Llamar". */
  telefono?: string | null
}) {
  const [abierto, setAbierto] = useState(false)
  const boton = 'flex min-h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-2 text-[13px] font-semibold transition-colors'

  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        <a
          href={callHref}
          onClick={() => events.contactoPropiedad(propertyId, propertyTitle, 'llamada')}
          className={`${boton} hover:bg-gray-50`}
          style={{ border: '1.5px solid #e5e7eb', color: '#111' }}
        >
          <Phone className="h-4 w-4 shrink-0" aria-hidden />
          {telefono ? <span className="font-numeric">{telefono}</span> : 'Llamar'}
        </a>
        <button
          type="button"
          onClick={() => setAbierto((a) => !a)}
          aria-expanded={abierto}
          className={`${boton} ${abierto ? 'bg-[#1A5C38] text-white' : 'hover:bg-[#f2f8f4]'}`}
          style={abierto ? { border: '1.5px solid #1A5C38' } : { border: '1.5px solid #1A5C38', color: '#1A5C38' }}
        >
          Que me contacten
        </button>
      </div>
      {abierto && (
        <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-4">
          <p className="mb-3 text-[15px] font-semibold text-neutral-900">Dejanos tus datos y te contactamos</p>
          <ConsultaCalificadaForm
            propertyId={propertyId}
            hiloPropertyId={null}
            propertyTitle={propertyTitle}
            propertyPrice={propertyPrice}
            whatsappUrl={whatsappUrl}
            agente={agente}
            preguntas={false}
            origen="pedir_contacto"
            boton="Quiero que me contacten"
          />
        </div>
      )}
    </div>
  )
}
