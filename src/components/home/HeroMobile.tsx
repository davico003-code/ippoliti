'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search } from 'lucide-react'
import { highlightMatch } from '@/lib/highlight'
import { buscarZonas, type Zona } from '@/lib/zonas'

export default function HeroMobile() {
  const [query, setQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const filtered = buscarZonas(query, 6)

  // Click outside → close dropdown
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function navigate(zona: Zona) {
    setShowDropdown(false)
    setQuery(zona.nombre)
    router.push(`/propiedades?q=${encodeURIComponent(zona.nombre)}`)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    router.push(q ? `/propiedades?q=${encodeURIComponent(q)}` : '/propiedades')
    setShowDropdown(false)
  }

  return (
    <section className="relative flex flex-col overflow-hidden" style={{ height: 290 }}>
      {/* Background image + overlay */}
      <Image
        src="/hero-home.jpg"
        alt="Zona oeste del Gran Rosario — Funes y Roldán"
        fill
        className="object-cover"
        sizes="100vw"
        priority
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.15) 100%)',
        }}
      />

      {/* Contenido del hero (header global se encarga del navbar) */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 text-white text-center relative z-10">
        <h1 className="font-raleway font-black text-[34px] leading-[1.02] drop-shadow-lg whitespace-nowrap">
          Encontrá tu hogar
        </h1>
        <p className="font-poppins text-white/95 text-[14px] mt-1 drop-shadow">
          Propiedades en Funes, Roldán y Rosario
        </p>

        {/* Searchbar pill unificado */}
        <div className="w-full mt-3 relative mx-auto" style={{ maxWidth: 460 }} ref={wrapperRef}>
          <form
            onSubmit={submit}
            className="bg-white shadow-xl flex items-center"
            style={{
              borderRadius: 9999,
              padding: '7px 7px 7px 22px',
              gap: 10,
            }}
          >
            <Search size={18} style={{ color: '#888780', flexShrink: 0 }} aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={e => {
                setQuery(e.target.value)
                setShowDropdown(e.target.value.trim().length >= 2)
              }}
              onFocus={() => { if (query.trim().length >= 2 && filtered.length > 0) setShowDropdown(true) }}
              placeholder="¿Dónde querés buscar?"
              aria-label="Buscar por barrio, ciudad o dirección"
              autoComplete="off"
              className="flex-1 min-w-0 outline-none bg-transparent placeholder:text-[#888780]"
              style={{
                fontFamily: 'Raleway, sans-serif',
                fontSize: 15,
                color: '#111',
              }}
            />
            <button
              type="submit"
              className="si-tap shrink-0 border-none cursor-pointer"
              style={{
                // Acento fijo: verde de marca sólido (igual que el hero desktop).
                background: '#1A5C38',
                color: '#fff',
                fontFamily: 'Raleway, sans-serif',
                fontSize: 14,
                fontWeight: 500,
                padding: '11px 24px',
                borderRadius: 9999,
                transition: 'background 180ms',
              }}
            >
              Buscar
            </button>
          </form>

          {/* Dropdown de sugerencias */}
          {showDropdown && filtered.length > 0 && (
            <div
              className="absolute left-0 right-0 bg-white overflow-auto z-50"
              style={{
                top: '100%',
                marginTop: 6,
                borderRadius: 16,
                boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                maxHeight: 280,
              }}
            >
              {filtered.map(zona => (
                <button
                  key={zona.id}
                  type="button"
                  onClick={() => navigate(zona)}
                  onMouseDown={e => e.preventDefault()}
                  className="w-full flex items-baseline gap-2 text-left"
                  style={{
                    padding: '10px 16px',
                    fontSize: 14,
                    color: '#111',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: "'Poppins', sans-serif",
                    borderBottom: '1px solid #f5f5f5',
                  }}
                >
                  <span className="flex-1">{highlightMatch(zona.nombre, query)}</span>
                  <span className="text-xs text-gray-400 shrink-0">
                    {zona.tipo === 'barrio_cerrado' ? `${zona.ciudad} · Country` : zona.ciudad}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
