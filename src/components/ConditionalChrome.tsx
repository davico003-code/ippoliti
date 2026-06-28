'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'

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
      {/* El header es sticky top:0 y ocupa su propio espacio de flujo, por eso
          main no lleva spacer. (La barra Mundial 2026 se removió post-torneo.) */}
      {!hide && <Navbar />}
      <main>{children}</main>
    </>
  )
}
