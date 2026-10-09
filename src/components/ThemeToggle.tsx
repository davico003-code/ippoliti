'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

const STORAGE_KEY = 'si-color-theme'

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.dataset.theme === 'dark')
  }, [])

  function toggle() {
    const next = !dark
    document.documentElement.dataset.theme = next ? 'dark' : 'light'
    document.documentElement.style.colorScheme = next ? 'dark' : 'light'
    try { localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light') } catch { /* Preferencia de esta sesión. */ }
    setDark(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`si-theme-toggle ${className}`}
      aria-label={dark ? 'Activar vista clara' : 'Activar vista oscura'}
      title={dark ? 'Vista clara' : 'Vista oscura'}
      aria-pressed={dark}
    >
      {dark ? <Sun size={19} strokeWidth={1.9} aria-hidden="true" /> : <Moon size={19} strokeWidth={1.9} aria-hidden="true" />}
    </button>
  )
}
