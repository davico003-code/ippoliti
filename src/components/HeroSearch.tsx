'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Navigation, Loader2 } from 'lucide-react'

export default function HeroSearch() {
  const [query, setQuery] = useState('')
  const [locating, setLocating] = useState(false)
  const router = useRouter()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    router.push(q ? `/propiedades?q=${encodeURIComponent(q)}` : '/propiedades')
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
        onChange={e => setQuery(e.target.value)}
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
  )
}
