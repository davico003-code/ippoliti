'use client'

import { useState } from 'react'
import { PhoneIncoming } from 'lucide-react'
import ConsultaCalificadaForm from '@/components/consulta/ConsultaCalificadaForm'

/**
 * "Pedí que te contactemos" (David, 4-oct-2026: "hay mucha gente que no quiere
 * contactarnos por WhatsApp; le interesa la propiedad pero quiere que la
 * contactemos"). Al tocarlo se abre ahí mismo el formulario corto: nombre y
 * apellido + WhatsApp. Va a /api/leads → Hilo, con la propiedad, así le llega
 * al agente que la captó.
 */
export default function PedirContacto({
  propertyId,
  propertyTitle,
  propertyPrice,
  whatsappUrl,
  agente,
  className = '',
}: {
  propertyId: number
  propertyTitle: string
  propertyPrice: string
  whatsappUrl: string
  agente: string
  className?: string
}) {
  const [abierto, setAbierto] = useState(false)

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-expanded={false}
        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-semibold text-sm transition-colors hover:bg-[#f2f8f4] ${className}`}
        style={{ border: '1.5px solid #1A5C38', color: '#1A5C38' }}
      >
        <PhoneIncoming className="w-5 h-5" aria-hidden /> Pedí que te contactemos
      </button>
    )
  }

  return (
    <div className={`rounded-2xl border border-gray-200 bg-white p-4 ${className}`}>
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
  )
}
