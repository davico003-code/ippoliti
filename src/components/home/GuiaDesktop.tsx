'use client'

import { useState } from 'react'
import Image from 'next/image'
import { BookOpen } from 'lucide-react'
import GuiaModal from './GuiaModal'

const GREEN = '#1A5C38'

const SPECS = [
  { num: '14', label: 'Capítulos' },
  { num: '62', label: 'Páginas' },
  { num: '100%', label: 'Online' },
]

export default function GuiaDesktop() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Columna izquierda: texto */}
            <div>
              <p className="font-poppins text-[13px] font-bold tracking-[0.2em] uppercase" style={{ color: GREEN }}>
                Guía gratuita · 14 capítulos
              </p>

              <h2 className="font-raleway font-black text-[56px] leading-[1.05] mt-3 text-gray-900">
                Comprá con <span className="italic" style={{ color: GREEN }}>inteligencia</span>, no con suerte.
              </h2>

              <p className="font-poppins text-gray-600 text-[18px] mt-5 leading-relaxed max-w-[480px]">
                Toda nuestra experiencia en una guía resumida para que no te equivoques.
              </p>

              {/* Specs */}
              <div className="mt-8 flex items-center gap-6">
                {SPECS.map((s, i) => (
                  <div key={s.label} className="flex items-center gap-6">
                    {i > 0 && <div className="w-px h-12 bg-gray-200" />}
                    <div>
                      <p className="font-poppins font-bold text-[28px] leading-none" style={{ color: GREEN, fontVariantNumeric: 'tabular-nums' }}>{s.num}</p>
                      <p className="font-poppins text-gray-500 text-[11px] font-semibold tracking-[0.15em] uppercase mt-2">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={() => setModalOpen(true)}
                className="mt-8 inline-flex items-center gap-2 px-7 py-4 rounded-2xl text-white font-poppins font-bold text-[16px] transition hover:opacity-95"
                style={{ background: GREEN }}
              >
                <BookOpen className="w-5 h-5" />
                <span>Leer la guía gratuita</span>
              </button>

              <p className="font-poppins text-gray-400 text-[13px] mt-4">
                Acceso permanente · Solo se pide una vez
              </p>
            </div>

            {/* Columna derecha: imagen 3 iPhones */}
            <div className="relative">
              <div
                className="absolute left-1/2 -translate-x-1/2 bottom-4"
                style={{
                  width: '70%', height: 32,
                  background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.10) 45%, transparent 75%)',
                  filter: 'blur(8px)', zIndex: 0,
                }}
              />
              <Image
                src="/guia-mockup-3iphones.png"
                alt="Guía Comprá con Inteligencia — SI Inmobiliaria"
                width={1200}
                height={1200}
                className="relative w-full h-auto"
                style={{ zIndex: 1 }}
              />
            </div>

          </div>
        </div>
      </section>

      <GuiaModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
