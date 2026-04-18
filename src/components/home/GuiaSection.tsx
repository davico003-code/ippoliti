'use client'

import { useState } from 'react'
import GuiaModal from './GuiaModal'

const GREEN = '#1A5C38'

export default function GuiaSection() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      {/* Eyebrow + título */}
      <section className="px-5 pt-8 pb-2 bg-white">
        <p className="font-poppins text-[12px] font-bold tracking-[0.15em] uppercase" style={{ color: GREEN }}>
          Guía gratuita · 14 capítulos
        </p>
        <h2 className="font-raleway font-black text-[26px] leading-[1.1] mt-2 text-gray-900">
          Comprá con <span className="italic" style={{ color: GREEN }}>inteligencia</span>, no con suerte.
        </h2>
      </section>

      {/* Mockup 3 iPhones */}
      <div className="relative bg-white overflow-hidden pt-4 pb-6">
        {/* Sombra elíptica debajo de la imagen */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            bottom: 18, width: '70%', height: 28,
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.12) 45%, transparent 75%)',
            filter: 'blur(6px)', zIndex: 0,
          }}
        />
        <img
          src="/guia-mockup-3iphones.png"
          alt="Guía Comprá con Inteligencia — SI Inmobiliaria"
          className="relative w-full h-auto"
          style={{ zIndex: 1 }}
        />
      </div>

      {/* Texto + specs + CTA */}
      <section className="px-5 pt-6 pb-8 bg-white">
        <p className="font-poppins text-gray-600 text-[14px] leading-relaxed text-center px-2">
          Toda nuestra experiencia en una guía resumida para que no te equivoques.
        </p>

        <div className="mt-4 flex items-center justify-center gap-5 text-center">
          {[
            { num: '14', label: 'Capítulos' },
            { num: '62', label: 'Páginas' },
            { num: '100%', label: 'Online' },
          ].map((s, i) => (
            <div key={s.label} className="flex items-center gap-5">
              {i > 0 && <div className="w-px h-8 bg-gray-200" />}
              <div>
                <p className="font-poppins font-bold text-[18px] leading-none" style={{ color: GREEN, fontVariantNumeric: 'tabular-nums' }}>{s.num}</p>
                <p className="font-poppins text-gray-500 text-[9px] font-semibold tracking-[0.1em] uppercase mt-1">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="mt-5 w-full text-white font-poppins font-bold text-[15px] flex items-center justify-center gap-2 px-5 py-4 rounded-2xl transition"
          style={{ background: GREEN }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          <span>Leer la guía gratuita</span>
        </button>

        <p className="font-poppins text-gray-400 text-[12px] mt-3 text-center">
          Acceso permanente · Solo se pide una vez
        </p>
      </section>

      <GuiaModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
