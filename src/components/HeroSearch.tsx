'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight } from 'lucide-react'
import { highlightMatch } from '@/lib/highlight'
import { buscarZonas, type Zona } from '@/lib/zonas'

export default function HeroSearch() {
  const [query, setQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const filtered = buscarZonas(query, 8)

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
    <div ref={wrapperRef} className="relative mx-auto" style={{ maxWidth: 620 }}>
      <form
        onSubmit={submit}
        className="flex items-center bg-white shadow-xl overflow-hidden"
        style={{ height: 'clamp(52px, 6vw, 60px)', borderRadius: 12 }}
      >
        <Search className="w-5 h-5 flex-shrink-0 ml-4" style={{ color: '#374151' }} />
        <input
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value)
            setShowDropdown(e.target.value.trim().length >= 2)
          }}
          onFocus={() => { if (filtered.length > 0) setShowDropdown(true) }}
          onKeyDown={e => {
            if (e.key === 'Enter') submit(e)
          }}
          placeholder="¿Dónde querés buscar?"
          aria-label="Buscar por barrio, ciudad o dirección"
          autoComplete="off"
          className="flex-1 min-w-0 border-none outline-none bg-transparent px-3 text-[#111] placeholder:text-[#9ca3af]"
          style={{ fontFamily: 'Raleway, sans-serif', fontSize: 'clamp(15px, 2vw, 16px)' as string, fontWeight: 500 }}
        />
        <button
          type="submit"
          className="flex-shrink-0 h-full flex items-center justify-center text-white border-none cursor-pointer"
          style={{ background: '#1A5C38', fontFamily: 'Raleway, sans-serif', fontSize: 14, fontWeight: 700, padding: '0 24px', transition: 'background 180ms' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#144a2c' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#1A5C38' }}
        >
          <span className="hidden md:inline">Buscar</span>
          <ArrowRight className="w-5 h-5 md:hidden" />
        </button>
      </form>

      {showDropdown && filtered.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 6,
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            overflow: 'auto',
            maxHeight: 340,
            zIndex: 50,
          }}
        >
          {filtered.map(zona => (
            <button
              key={zona.id}
              type="button"
              onClick={() => navigate(zona)}
              onMouseDown={e => e.preventDefault()}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 8,
                width: '100%',
                textAlign: 'left',
                padding: '10px 16px',
                fontSize: 14,
                color: '#111',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f0f7f4' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ flex: 1 }}>
                {highlightMatch(zona.nombre, query)}
              </span>
              <span style={{ fontSize: 12, color: '#9ca3af', flexShrink: 0, whiteSpace: 'nowrap' }}>
                {zona.tipo === 'barrio_cerrado' ? `${zona.ciudad} · Country` : zona.ciudad}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
