'use client'

// Email ofuscado contra scrapers de spam.
//
// Key invariant: el caracter "@" y el email completo NUNCA aparecen en el
// HTML estático (SSR). Solo se agregan al DOM después del mount del cliente.
// Pre-mount los usuarios ven el icono + un placeholder ("Escribinos");
// screen readers ven aria-label descriptivo.
//
// Uso:
//   <EmailLink
//     encoded="aW5mb0BzaWlubW9iaWxpYXJpYS5jb20="
//     icon={<Mail className="w-3.5 h-3.5" />}
//     label="Escribinos a SI INMOBILIARIA"
//     placeholder="Escribinos"
//     textClassName="font-poppins text-[13px]"
//     className="flex items-center gap-2 text-white/70 hover:text-white transition"
//   />

import { useEffect, useState, type ReactNode } from 'react'

interface Props {
  /** Email codificado en base64 (btoa('info@...')). */
  encoded: string
  /** Icono opcional a la izquierda del texto (siempre visible). */
  icon?: ReactNode
  /** Texto a mostrar pre-mount. Default: "Escribinos". */
  placeholder?: string
  /** Descripción para screen readers + meta del enlace. */
  label?: string
  /** Clases del contenedor (a o span). */
  className?: string
  /** Clases aplicadas al <span> de texto (placeholder / email). */
  textClassName?: string
  style?: React.CSSProperties
}

function decode(b64: string): string {
  try {
    return atob(b64)
  } catch {
    return ''
  }
}

export default function EmailLink({
  encoded,
  icon,
  placeholder = 'Escribinos',
  label = 'Escribinos por email',
  className,
  textClassName,
  style,
}: Props) {
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    setEmail(decode(encoded))
  }, [encoded])

  const Inner = (
    <>
      {icon}
      <span className={textClassName}>{email ?? placeholder}</span>
    </>
  )

  if (!email) {
    return (
      <span
        role="button"
        aria-label={label}
        className={className}
        style={style}
      >
        {Inner}
      </span>
    )
  }

  return (
    <a
      href={`mailto:${email}`}
      aria-label={`${label}: ${email}`}
      className={className}
      style={style}
    >
      {Inner}
    </a>
  )
}
