// BackLink — link "← Volver a X" reutilizable. Color verde SI, ícono ArrowLeft,
// hover suave. Mismo patrón visual que el "Volver al listado" inline original
// que vivía en /recursos/autorizaciones/[slug].

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Props {
  href: string
  label: string
}

export default function BackLink({ href, label }: Props) {
  return (
    <Link
      href={href}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 13,
        fontFamily: "'Raleway', system-ui, sans-serif",
        color: '#1A5C38',
        textDecoration: 'none',
        transition: 'color 150ms ease',
      }}
      className="back-link"
    >
      <ArrowLeft size={14} /> {label}
      <style dangerouslySetInnerHTML={{ __html: `.back-link:hover { color: #0F3C24; text-decoration: underline; }` }} />
    </Link>
  )
}
