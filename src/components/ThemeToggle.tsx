'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

const STORAGE_KEY = 'si-color-theme'

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const sync = () => setDark(document.documentElement.dataset.theme === 'dark')
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return
      const next = event.newValue === 'dark' || (!event.newValue && matchMedia('(prefers-color-scheme: dark)').matches)
      document.documentElement.dataset.theme = next ? 'dark' : 'light'
      document.documentElement.style.colorScheme = next ? 'dark' : 'light'
    }
    window.addEventListener('storage', onStorage)
    return () => { observer.disconnect(); window.removeEventListener('storage', onStorage) }
  }, [])

  function toggle() {
    const next = document.documentElement.dataset.theme !== 'dark'
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
