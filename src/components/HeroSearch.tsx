'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Navigation, Loader2 } from 'lucide-react'
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
  const [locating, setLocating] = useState(false)
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

  function locate() {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocating(false)
        router.push(`/propiedades?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`)
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <form
        onSubmit={submit}
        style={{
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
          display: 'flex',
          alignItems: 'center',
          height: 52,
          overflow: 'hidden',
        }}
      >
        <Search className="w-4 h-4 text-gray-400" style={{ marginLeft: 18, flexShrink: 0 }} />
        <input
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value)
            setShowDropdown(e.target.value.length >= 2)
          }}
          onFocus={() => { if (filtered.length > 0) setShowDropdown(true) }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              submit(e)
            }
          }}
          placeholder="¿Dónde querés buscar?"
          autoComplete="off"
          style={{
            flex: 1,
            minWidth: 0,
            border: 'none',
            outline: 'none',
            padding: '0 14px',
            fontSize: 15,
            background: 'transparent',
            color: '#111',
          }}
        />
        <button
          type="button"
          onClick={locate}
          title="Usar mi ubicación"
          aria-label="Usar mi ubicación"
          style={{
            flexShrink: 0,
            width: 40,
            height: 40,
            marginRight: 6,
            borderRadius: 10,
            border: 'none',
            background: 'transparent',
            color: '#1A5C38',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          {locating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
        </button>
        <button
          type="submit"
          style={{
            flexShrink: 0,
            height: '100%',
            background: '#1A5C38',
            color: '#fff',
            border: 'none',
            padding: '0 22px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Buscar
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
