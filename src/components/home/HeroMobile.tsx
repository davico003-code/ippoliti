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
        alt="Propiedades en Funes, Roldán y Rosario — SI INMOBILIARIA, inmobiliaria familiar desde 1983"
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

        {/* Searchbar pill estilo Zillow */}
        <div className="w-full mt-3 relative" ref={wrapperRef}>
          <form
            onSubmit={submit}
            className="bg-white rounded-full shadow-xl flex items-center pl-5 pr-1.5 py-1.5"
          >
            <input
              type="text"
              value={query}
              onChange={e => {
                setQuery(e.target.value)
                setShowDropdown(e.target.value.trim().length >= 2)
              }}
              onFocus={() => { if (query.trim().length >= 2 && filtered.length > 0) setShowDropdown(true) }}
              placeholder="Dirección, barrio, ciudad"
              aria-label="Buscar por barrio, ciudad o dirección"
              autoComplete="off"
              className="flex-1 outline-none text-gray-700 placeholder-gray-400 text-sm bg-transparent"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            />
            <button
              type="submit"
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: '#1A5C38' }}
              aria-label="Buscar"
            >
              <Search className="w-4 h-4 text-white" />
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
