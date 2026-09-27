'use client'

// "Hablemos" (el "Get in Touch" de SERHANT): fondo verde con las letras SI
// gigantes de marca de agua, las tres sedes a la izquierda y un formulario
// corto a la derecha. El formulario no guarda nada: arma el mensaje y abre
// WhatsApp con la consulta ya escrita (la respuesta llega por donde la gente
// ya habla).

import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { SEDES, linkMapa } from '../sedes/datos'
import { RALEWAY, VERDE, VERDE_OSCURO } from './ui'

const MOTIVOS = ['Quiero comprar', 'Quiero alquilar', 'Quiero vender o tasar', 'Otra consulta']
const WHATSAPP = '5493413340916'

export default function ContactoV2() {
  const [nombre, setNombre] = useState('')
  const [motivo, setMotivo] = useState(MOTIVOS[0])
  const [mensaje, setMensaje] = useState('')

  const enviar = (e: React.FormEvent) => {
    e.preventDefault()
    const texto = `Hola! Soy ${nombre.trim() || 'un visitante de la web'}. ${motivo}.${mensaje.trim() ? ` ${mensaje.trim()}` : ''}`
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener')
  }

  const campo = 'w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-[15px] text-gray-900 outline-none transition-colors focus:border-gray-900'

  return (
    <section className="relative overflow-hidden px-5 py-20 text-white md:px-6 md:py-28" style={{ background: `linear-gradient(135deg, ${VERDE} 0%, ${VERDE_OSCURO} 100%)` }}>
      {/* Marca de agua: las letras SI del logo, gigantes */}
      <svg aria-hidden="true" viewBox="10 10 290 203" className="pointer-events-none absolute -left-16 top-1/2 h-[120%] -translate-y-1/2 opacity-[0.08]">
        <g fill="#fff">
          <path d="M219.2 40.1L81.84 40.1C58.793 40.1 40.11 58.783 40.11 81.83C40.11 104.877 58.793 123.56 81.84 123.56L177.47 123.56C187.025 123.56 194.77 131.305 194.77 140.86C194.77 150.415 187.025 158.16 177.47 158.16L40.11 158.16L40.11 182.56L177.47 182.56C200.5 182.56 219.17 163.89 219.17 140.86C219.17 117.83 200.5 99.16 177.47 99.16L81.84 99.16C72.269 99.16 64.51 91.401 64.51 81.83C64.51 72.259 72.269 64.5 81.84 64.5L219.2 64.5Z" />
          <path d="M248.29 40.05L269.24 40.05L269.24 182.63L248.29 182.63Z" />
        </g>
      </svg>

      <div className="relative mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-12 md:grid-cols-[1fr_460px]">
        <div>
          <h2 className="revela" style={{ fontFamily: RALEWAY, fontWeight: 800, fontSize: 'clamp(44px, 6vw, 84px)', lineHeight: 0.98, letterSpacing: '-0.045em' }}>Hablemos.</h2>
          <p className="revela mt-4 max-w-[460px] text-[17px] font-semibold leading-relaxed text-white/80" style={{ fontFamily: RALEWAY }}>
            Escribinos y te responde una persona del equipo. O pasá por cualquiera de nuestras oficinas.
          </p>
          <ul className="revela mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
            {SEDES.map(s => (
              <li key={s.n}>
                <p className="text-[16px] font-extrabold" style={{ fontFamily: RALEWAY }}>{s.nombre}</p>
                <p className="mt-1 text-[14px] text-white/75" style={{ fontFamily: RALEWAY }}>{s.direccion}</p>
                <a href={linkMapa(s)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-[13px] font-bold text-white underline-offset-4 hover:underline" style={{ fontFamily: RALEWAY }}>
                  <MapPin className="h-3.5 w-3.5" /> Cómo llegar
                </a>
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={enviar} className="revela rounded-[28px] bg-white p-6 text-gray-900 md:p-8" style={{ boxShadow: '0 40px 80px -30px rgba(0,0,0,.45)', fontFamily: RALEWAY }}>
          <p className="text-[20px] font-extrabold tracking-[-0.02em]">Dejanos tu consulta</p>
          <div className="mt-5 flex flex-col gap-3">
            <input className={campo} placeholder="Tu nombre" value={nombre} onChange={e => setNombre(e.target.value)} autoComplete="name" aria-label="Tu nombre" />
            <select className={campo} value={motivo} onChange={e => setMotivo(e.target.value)} aria-label="Motivo">
              {MOTIVOS.map(m => <option key={m}>{m}</option>)}
            </select>
            <textarea className={`${campo} min-h-[110px] resize-none`} placeholder="Contanos qué buscás (opcional)" value={mensaje} onChange={e => setMensaje(e.target.value)} aria-label="Mensaje" />
            <button type="submit" className="mt-1 inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-[15px] font-extrabold text-white" style={{ background: VERDE }}>
              Enviar por WhatsApp
            </button>
          </div>
          <p className="mt-3 text-center text-[12px] text-gray-500">Se abre WhatsApp con tu mensaje listo para enviar.</p>
        </form>
      </div>
    </section>
  )
}
