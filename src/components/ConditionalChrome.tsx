'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import BarraMundial from './BarraMundial'

const HIDE_CHROME_PREFIXES = ['/emprendimientos/67178']

function shouldHideChrome(pathname: string | null): boolean {
  if (!pathname) return false
  return HIDE_CHROME_PREFIXES.some(prefix => pathname.startsWith(prefix))
}

export default function ConditionalChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hide = shouldHideChrome(pathname)

  return (
    <>
      {/* Edición Mundial 2026 — barra en flujo normal arriba del header (se va al
          scrollear). El header es sticky top:0 y ocupa su propio espacio de flujo,
          por eso main ya no lleva el spacer pt-[73px] del nav fijo anterior. */}
      {!hide && <BarraMundial />}
      {!hide && <Navbar />}
      <main>{children}</main>
    </>
  )
}
