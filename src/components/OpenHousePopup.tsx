'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const STORAGE_KEY = 'openhouse-cadaques-seen'
const R = "'Raleway', system-ui, sans-serif"
const P = "'Poppins', system-ui, sans-serif"

export default function OpenHousePopup() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return
    const timer = setTimeout(() => setVisible(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  function close() {
    setVisible(false)
    localStorage.setItem(STORAGE_KEY, '1')
  }

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ animation: 'fadeIn 0.3s ease' }}
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Open House Casa Cadaques"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Card */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          maxWidth: 420,
          height: 640,
          borderRadius: 24,
          backgroundImage: "url('/casa-cadaques-openhouse.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.75) 75%, rgba(0,0,0,0.92) 100%)',
        }} />

        {/* Badge */}
        <span className="absolute" style={{
          top: 20, left: 20,
          fontFamily: R, fontSize: 10, fontWeight: 500, color: '#fff',
          padding: '7px 14px', border: '1px solid rgba(255,255,255,0.5)',
          borderRadius: 20, textTransform: 'uppercase', letterSpacing: 2,
          backdropFilter: 'blur(8px)',
        }}>
          Evento exclusivo
        </span>

        {/* Close */}
        <button
          onClick={close}
          aria-label="Cerrar"
          className="absolute flex items-center justify-center"
          style={{
            top: 16, right: 16, width: 34, height: 34,
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.25)', borderRadius: '50%',
            cursor: 'pointer', transition: 'background 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.3)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)' }}
        >
          <X size={14} color="#fff" />
        </button>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0" style={{ padding: 28 }}>
          {/* Date */}
          <p style={{ fontFamily: R, fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 3, color: 'rgba(255,255,255,0.85)', marginBottom: 14 }}>
            Jueves 16 de abril
          </p>

          {/* Subtitle */}
          <p style={{ fontFamily: R, fontSize: 11, fontWeight: 300, textTransform: 'uppercase', letterSpacing: 3, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>
            Open House Experience
          </p>

          {/* Title */}
          <h2 style={{ fontFamily: R, fontSize: 42, fontWeight: 300, lineHeight: 1, letterSpacing: '-0.5px', color: '#fff', margin: '0 0 8px' }}>
            Casa Cadaques
          </h2>

          {/* Location */}
          <p style={{ fontFamily: P, fontSize: 13, fontWeight: 300, color: 'rgba(255,255,255,0.75)', marginBottom: 18 }}>
            Barrio Cadaques · Funes
          </p>

          {/* Description */}
          <p style={{ fontFamily: P, fontSize: 13, fontWeight: 300, lineHeight: 1.6, color: 'rgba(255,255,255,0.85)', maxWidth: 340, marginBottom: 22 }}>
            Una invitación exclusiva a vivir una obra terminada. Donde cada decisión de diseño refleja una forma distinta de construir.
          </p>

          {/* CTA */}
          <a
            href="https://wa.me/5493416847745?text=Hola!%20Quiero%20asistir%20al%20Open%20House%20de%20Casa%20Cadaques"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full"
            style={{
              background: '#fff', color: '#1a1a1a',
              padding: '15px 24px', borderRadius: 999,
              fontFamily: R, fontSize: 14, fontWeight: 500, letterSpacing: '0.5px',
              textDecoration: 'none', transition: 'transform 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Quiero asistir
          </a>

          {/* Partners */}
          <p style={{ marginTop: 16, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.55)', fontFamily: P, fontWeight: 300, lineHeight: 1.6 }}>
            <span style={{ fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>Hausing</span> construye · <span style={{ fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>Morada · DeGuardia</span> decoran
          </p>
        </div>
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  )
}
