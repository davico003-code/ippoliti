'use client'

import { useState } from 'react'
import { Mail, Check } from 'lucide-react'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    const leads = JSON.parse(localStorage.getItem('si-leads') || '[]')
    leads.push({ nombre: '', email, tipo: 'Newsletter', date: new Date().toISOString() })
    localStorage.setItem('si-leads', JSON.stringify(leads))
    setSent(true)
    setEmail('')
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <div className="bg-[#1A5C38] rounded-2xl p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <h3 className="text-white font-black text-lg font-poppins mb-1">
            Recib&iacute; propiedades por email
          </h3>
          <p className="text-white/60 text-sm font-poppins">
            Nuevas propiedades y oportunidades de inversi&oacute;n directo a tu casilla.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Tu email"
            required
            className="flex-1 md:w-64 px-4 py-3 rounded-xl text-sm bg-white/10 text-white placeholder-white/40 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 font-poppins"
          />
          <button
            type="submit"
            className="px-5 py-3 bg-white text-[#1A5C38] rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 whitespace-nowrap font-poppins"
          >
            {sent ? <><Check className="w-4 h-4" /> Listo!</> : <><Mail className="w-4 h-4" /> Suscribirme</>}
          </button>
        </form>
      </div>
    </div>
  )
}
