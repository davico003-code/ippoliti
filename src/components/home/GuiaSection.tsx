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

      {/* Escena 3D multi-device */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '1/1.05', background: 'radial-gradient(ellipse at 30% 40%, #f8f8f5 0%, #ebebe6 100%)', perspective: 2000, WebkitPerspective: 2000, transformStyle: 'preserve-3d' as const }}>

        {/* Mesh gradient */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 80% 20%, rgba(26,92,56,0.06) 0%, transparent 40%), radial-gradient(ellipse at 20% 80%, rgba(13,61,36,0.04) 0%, transparent 40%)',
        }} />

        {/* Glow verde animado */}
        <div className="absolute animate-pulse" style={{ width: '80%', height: '80%', left: '10%', top: '10%', background: 'radial-gradient(circle, rgba(26,92,56,0.25) 0%, rgba(26,92,56,0.08) 35%, transparent 65%)', filter: 'blur(30px)' }} />

        {/* Particles */}
        {[
          { top: '15%', left: '75%', delay: '0s', size: 4 },
          { top: '25%', left: '5%', delay: '1s', size: 3 },
          { top: '70%', left: '12%', delay: '2s', size: 4 },
          { top: '85%', left: '80%', delay: '3s', size: 5 },
        ].map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              top: p.top, left: p.left,
              width: p.size, height: p.size,
              background: GREEN, opacity: 0.4,
              animation: `guiaFloat 6s ease-in-out ${p.delay} infinite`,
            }}
          />
        ))}

        {/* iPad */}
        <div className="absolute" style={{
          width: '60%', aspectRatio: '4/5.4', left: '8%', top: '6%',
          background: 'linear-gradient(135deg, #2a2a2a 0%, #0a0a0a 100%)',
          borderRadius: 18, padding: 6,
          boxShadow: '0 50px 80px -20px rgba(0,0,0,0.45), 0 30px 50px -25px rgba(26,92,56,0.3), inset 0 0 1px rgba(255,255,255,0.2)',
          transform: 'perspective(2000px) rotateY(-14deg) rotateX(6deg)',
          zIndex: 1,
        }}>
          <div className="bg-white rounded-[13px] w-full h-full overflow-hidden relative">
            {/* Status bar */}
            <div className="flex justify-between items-center px-4 pt-2 pb-1">
              <span className="font-poppins text-[7px] font-bold text-black" style={{ fontVariantNumeric: 'tabular-nums' }}>9:41</span>
              <div className="flex items-center gap-1">
                <div className="w-[13px] h-[6px] border border-black rounded-sm" style={{ borderWidth: 0.7, padding: '0.5px' }}>
                  <div className="w-full h-full bg-black rounded-[0.5px]" />
                </div>
              </div>
            </div>
            {/* Header */}
            <div className="flex justify-between items-center px-5 pb-2.5 border-b border-gray-100">
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded flex items-center justify-center text-white font-black" style={{ background: GREEN, fontSize: 7, fontFamily: "'Raleway'" }}>SI</div>
                <p className="font-poppins text-[7px] font-bold text-gray-400 tracking-[0.15em] uppercase">Guía 2026</p>
              </div>
              <p className="font-poppins text-[7px] font-bold text-gray-400" style={{ fontVariantNumeric: 'tabular-nums' }}>03 / 14</p>
            </div>
            {/* Contenido Lora */}
            <div className="px-5 pt-3.5">
              <p className="font-poppins text-[7px] font-bold tracking-[0.2em] uppercase" style={{ color: GREEN }}>Capítulo 03</p>
              <h3 className="font-lora font-bold text-[17px] leading-[1.1] text-gray-900 mt-1 mb-2">
                Negociar sin<br />perder dinero.
              </h3>
              <p className="font-lora italic text-[7.5px] text-gray-400 mb-3.5">
                Estrategias probadas para cerrar al mejor precio.
              </p>
              <p className="font-lora text-[8.5px] leading-[1.65] text-gray-800">
                <span className="font-lora font-bold text-[26px] leading-[0.85] float-left mr-1 mt-0.5" style={{ color: GREEN }}>L</span>
                a negociación inmobiliaria no es un juego de azar. Cada movimiento tiene una razón, cada cifra un margen, y cada silencio puede valer miles de dólares.
              </p>
              <p className="font-lora text-[8.5px] leading-[1.65] text-gray-800 mt-2">
                En Funes y Roldán, los compradores que se preparan llegan a cerrar entre 8% y 15% por debajo del precio publicado.
              </p>
              <div className="border-l-2 pl-2 mt-3" style={{ borderColor: GREEN }}>
                <p className="font-lora italic text-[8px] leading-[1.5] text-gray-500">
                  &ldquo;El que necesita vender baja el precio. El que sabe esperar lo sube.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* iPhone */}
        <div className="absolute" style={{
          width: '33%', aspectRatio: '9/17', right: '6%', bottom: '14%',
          background: 'linear-gradient(160deg, #2a2a2a 0%, #0a0a0a 100%)',
          borderRadius: 28, padding: 5,
          boxShadow: '0 40px 60px -15px rgba(0,0,0,0.55), 0 20px 40px -20px rgba(26,92,56,0.35), inset 0 0 1px rgba(255,255,255,0.25)',
          transform: 'perspective(2000px) rotateY(-22deg) rotateX(8deg) translateZ(80px)',
          zIndex: 2,
        }}>
          <div className="bg-white rounded-[23px] w-full h-full overflow-hidden relative">
            {/* Dynamic Island */}
            <div className="absolute top-[7px] left-1/2 -translate-x-1/2 bg-black rounded-[20px] z-20" style={{ width: '48%', height: 14 }} />
            {/* Status bar */}
            <div className="flex justify-between items-center px-3 pt-1.5" style={{ height: 18 }}>
              <span className="font-poppins text-[6.5px] font-bold text-black" style={{ fontVariantNumeric: 'tabular-nums' }}>9:41</span>
              <div className="flex-1" />
              <div className="w-[11px] h-[5px] border border-black rounded-[1.2px]" style={{ borderWidth: 0.6, padding: '0.4px' }}>
                <div className="bg-black rounded-[0.4px]" style={{ width: '85%', height: '100%' }} />
              </div>
            </div>
            <div style={{ height: 14 }} />
            {/* Header */}
            <div className="flex justify-between items-center px-2.5 pb-1.5 border-b border-gray-100">
              <div className="flex items-center gap-1">
                <div className="rounded flex items-center justify-center text-white font-black" style={{ width: 8, height: 8, background: GREEN, fontSize: 4, fontFamily: "'Raleway'" }}>SI</div>
                <p className="font-poppins text-[5px] font-bold text-gray-400 tracking-[0.15em] uppercase">Guía</p>
              </div>
              <p className="font-poppins text-[5px] font-bold text-gray-400" style={{ fontVariantNumeric: 'tabular-nums' }}>03/14</p>
            </div>
            {/* Contenido */}
            <div className="px-2.5 pt-2">
              <p className="font-poppins text-[5px] font-bold tracking-[0.2em] uppercase" style={{ color: GREEN }}>Cap 03</p>
              <h3 className="font-lora font-bold text-[11px] leading-[1.1] text-gray-900 mt-0.5 mb-1.5">
                Negociar sin perder dinero.
              </h3>
              <p className="font-lora text-[5.8px] leading-[1.55] text-gray-800">
                <span className="font-lora font-bold text-[15px] leading-[0.85] float-left mr-0.5 mt-px" style={{ color: GREEN }}>L</span>
                a negociación inmobiliaria no es un juego de azar. Cada movimiento tiene razón, cada silencio vale dinero.
              </p>
              <div className="border-l pl-1.5 mt-2" style={{ borderColor: GREEN, borderWidth: 1.5 }}>
                <p className="font-lora italic text-[5.8px] leading-[1.45] text-gray-500">
                  &ldquo;El que necesita vender baja el precio.&rdquo;
                </p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="absolute bottom-2 left-2.5 right-2.5">
              <div className="h-[1.5px] bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: '22%', background: GREEN }} />
              </div>
            </div>
          </div>
        </div>

        {/* Badge "Lectura en vivo" */}
        <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border font-poppins text-[9px] font-bold tracking-[0.15em] uppercase" style={{
          background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)',
          borderColor: 'rgba(26,92,56,0.15)', color: GREEN,
        }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: GREEN, boxShadow: `0 0 8px ${GREEN}` }} />
          Lectura en vivo
        </div>
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

      <style>{`
        @keyframes guiaFloat {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(-12px); opacity: 0.6; }
        }
      `}</style>
    </>
  )
}
