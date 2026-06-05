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
      {/* Edición Mundial 2026 — barra sticky arriba del header (auto on/off por fecha). */}
      {!hide && <BarraMundial />}
      {!hide && <Navbar />}
      <main className={hide ? '' : 'md:pt-[73px]'}>{children}</main>
    </>
  )
}
