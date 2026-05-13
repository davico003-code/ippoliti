'use client'

import { useEffect, useState } from 'react'

interface TabItem {
  id: string
  label: string
}

interface Props {
  items: TabItem[]
}

export default function BarrioTabsNav({ items }: Props) {
  const [active, setActive] = useState<string>(items[0]?.id ?? '')
  const [stuck, setStuck] = useState(false)

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const observers: IntersectionObserver[] = []
    for (const item of items) {
      const el = document.getElementById(item.id)
      if (!el) continue
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(item.id)
        },
        { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
      )
      obs.observe(el)
      observers.push(obs)
    }
    return () => observers.forEach((o) => o.disconnect())
  }, [items])

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 600)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`sticky top-0 z-30 -mx-4 overflow-x-auto border-b transition-all md:mx-0 ${
        stuck ? 'border-stone-200 bg-white/95 shadow-sm backdrop-blur' : 'border-transparent bg-[#FAF7F2]'
      }`}
      aria-label="Navegación del barrio"
    >
      <ul className="mx-auto flex max-w-6xl gap-1 px-4 py-2 text-sm">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`block whitespace-nowrap rounded-full px-3 py-1.5 transition ${
                active === item.id
                  ? 'bg-brand-600 text-white'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
