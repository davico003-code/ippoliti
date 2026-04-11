import type { ReactNode } from 'react'

export default function PropiedadesLayout({ children }: { children: ReactNode }) {
  return <div className="h-[100dvh] overflow-hidden">{children}</div>
}
