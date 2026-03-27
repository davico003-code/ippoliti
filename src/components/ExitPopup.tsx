'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, MessageCircle } from 'lucide-react'

const STORAGE_KEY = 'si-popup-shown'
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000 // 1 week

export default function ExitPopup() {
  const [show, setShow] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', tipo: 'Casa', operacion: 'Venta', presupuesto: 'Sin límite' })

  const shouldShow = useCallback(() => {
    const last = localStorage.getItem(STORAGE_KEY)
    if (last && Date.now() - parseInt(last, 10) < COOLDOWN_MS) return false
    return true
  }, [])

  const trigger = useCallback(() => {
    if (!shouldShow()) return
    setShow(true)
    localStorage.setItem(STORAGE_KEY, String(Date.now()))
  }, [shouldShow])

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) trigger()
    }
    document.addEventListener('mouseleave', handleMouseLeave)

    const timer = setTimeout(() => {
      if (window.innerWidth < 768) trigger()
    }, 60000)

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave)
      clearTimeout(timer)
    }
  }, [trigger])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email) return

    setStatus('sending')

    // Save to localStorage as backup
    const leads = JSON.parse(localStorage.getItem('si-leads') || '[]')
    leads.push({ ...form, presupuesto: form.operacion === 'Venta' ? form.presupuesto : undefined, date: new Date().toISOString() })
    localStorage.setItem('si-leads', JSON.stringify(leads))

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.nombre,
          email: form.email,
          phone: form.telefono,
          operation: form.operacion,
          propertyType: form.tipo,
          budget: form.operacion === 'Venta' ? form.presupuesto : undefined,
        }),
      })
      if (res.ok) {
        setStatus('sent')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const whatsappText = encodeURIComponent(
    `Hola! Busco ${form.tipo} en ${form.operacion}${form.operacion === 'Venta' && form.presupuesto !== 'Sin límite' ? ` (${form.presupuesto})` : ''}. Mi nombre: ${form.nombre}, email: ${form.email}`
  )

  if (!show) return null

  const inputClass = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38]'

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-in zoom-in-95">
        <button onClick={() => setShow(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="SI Inmobiliaria" className="h-8 mx-auto mb-4" />

        {status === 'sent' ? (
          <div className="text-center py-4">
            <p className="text-xl font-bold text-gray-900 mb-2 font-poppins">¡Listo! Te contactamos pronto</p>
            <p className="text-gray-500 text-sm">Tu consulta fue registrada en nuestro sistema.</p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-black text-gray-900 text-center mb-1 font-poppins">
              ¿Encontraste lo que buscabas?
            </h2>
            <p className="text-sm text-gray-500 text-center mb-6">
              Dejanos tus datos y te enviamos propiedades según tu búsqueda
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text" placeholder="Tu nombre"
                value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
                className={inputClass}
              />
              <input
                type="email" placeholder="Tu email" required
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className={inputClass}
              />
              <input
                type="tel" placeholder="Teléfono (opcional)"
                value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })}
                className={inputClass}
              />
              <select
                value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}
                className={`${inputClass} bg-white`}
              >
                <option>Casa</option>
                <option>Departamento</option>
                <option>Lote</option>
                <option>Local</option>
              </select>
              {/* Operación */}
              <div className="grid grid-cols-2 gap-2">
                {(['Venta', 'Alquiler'] as const).map(op => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => setForm({ ...form, operacion: op })}
                    className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      form.operacion === op
                        ? 'bg-[#1A5C38] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {op}
                  </button>
                ))}
              </div>
              {/* Presupuesto — solo venta */}
              {form.operacion === 'Venta' && (
                <select
                  value={form.presupuesto} onChange={e => setForm({ ...form, presupuesto: e.target.value })}
                  className={`${inputClass} bg-white`}
                >
                  <option>Sin límite</option>
                  <option>Hasta USD 80.000</option>
                  <option>Hasta USD 150.000</option>
                  <option>Hasta USD 250.000</option>
                  <option>Hasta USD 500.000</option>
                  <option>Más de USD 500.000</option>
                </select>
              )}
              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full py-3 bg-[#1A5C38] text-white rounded-xl font-bold text-sm hover:bg-[#15472c] transition-colors font-poppins disabled:opacity-60"
              >
                {status === 'sending' ? 'Enviando...' : 'Quiero recibir propiedades'}
              </button>
              {status === 'error' && (
                <div className="text-center">
                  <p className="text-red-500 text-xs mb-2">Hubo un error, intentá de nuevo</p>
                  <a
                    href={`https://wa.me/5493412101694?text=${whatsappText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#25D366] hover:underline"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    O escribinos por WhatsApp
                  </a>
                </div>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  )
}
