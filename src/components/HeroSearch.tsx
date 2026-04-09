'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { highlightMatch } from '@/lib/highlight'

const SUGERENCIAS = [
  'Funes', 'Roldán', 'Rosario', 'Fisherton',
  'San Sebastián', 'Los Aromos', 'Don Mateo', 'El Molino',
  'Funes Lakes', 'Aurea', 'Cotos de la Alameda',
  'Vida Lagoon', 'Paseo del Norte', 'Dockgarden',
  'Hausing', 'Distrito Roldán', 'Roldán Este',
  'Catamarca', 'Hipólito Yrigoyen', '1ro de Mayo',
]

export default function HeroSearch() {
  const [query, setQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const filtered = query.length >= 2
    ? SUGERENCIAS.filter(s => s.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : []

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function navigate(q: string) {
    setShowDropdown(false)
    setQuery(q)
    router.push(`/propiedades?q=${encodeURIComponent(q)}`)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    router.push(q ? `/propiedades?q=${encodeURIComponent(q)}` : '/propiedades')
    setShowDropdown(false)
  }

  return (
    <div ref={wrapperRef} className="relative max-w-2xl mx-auto">
      <form
        onSubmit={submit}
        className="flex items-center h-12 md:h-14 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 pl-6 pr-2"
      >
        <Search className="w-5 h-5 flex-shrink-0" style={{ color: '#6b7280' }} />
        <input
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value)
            setShowDropdown(e.target.value.length >= 2)
          }}
          onFocus={() => { if (filtered.length > 0) setShowDropdown(true) }}
          onKeyDown={e => {
            if (e.key === 'Enter') submit(e)
          }}
          placeholder="¿Dónde querés buscar?"
          autoComplete="off"
          className="flex-1 min-w-0 border-none outline-none bg-transparent px-3 text-[#111] placeholder:text-[#9ca3af]"
          style={{ fontFamily: 'Raleway, sans-serif', fontSize: 16, fontWeight: 400 }}
        />
        <button
          type="submit"
          className="flex-shrink-0 h-10 md:h-11 rounded-full px-7 text-white border-none cursor-pointer"
          style={{
            background: '#1A5C38',
            fontFamily: 'Raleway, sans-serif',
            fontSize: 15,
            fontWeight: 600,
            transition: 'background 180ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#144a2c' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#1A5C38' }}
        >
          Buscar
        </button>
      </form>

      <style>{`
        @media (max-width: 480px) {
          .relative.max-w-2xl input::placeholder { font-size: 14px; }
        }
      `}</style>

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
            overflow: 'hidden',
            zIndex: 50,
          }}
        >
          {filtered.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => navigate(s)}
              onMouseDown={e => e.preventDefault()}
              style={{
                display: 'block',
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
              {highlightMatch(s, query)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
