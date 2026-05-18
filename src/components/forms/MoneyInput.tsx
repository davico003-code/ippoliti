'use client'

// MoneyInput — input de moneda con separador de miles AR (1.500.000) en pantalla,
// pero expone número limpio al padre. Aguanta paste de "USD 300.000", "$300,000",
// etc. Preserva posición del cursor cuando reformatea.

import { useEffect, useRef, useState } from 'react'

function format(n: number | undefined): string {
  if (n == null || !Number.isFinite(n)) return ''
  return n.toLocaleString('es-AR', { maximumFractionDigits: 0 })
}

function sanitize(raw: string): number | undefined {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return undefined
  const n = Number(digits)
  return Number.isFinite(n) ? n : undefined
}

interface Props
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'value' | 'onChange' | 'type' | 'inputMode'
  > {
  value: number | undefined
  onChange: (n: number | undefined) => void
}

export default function MoneyInput({ value, onChange, ...rest }: Props) {
  const ref = useRef<HTMLInputElement>(null)
  const [display, setDisplay] = useState<string>(() => format(value))

  // Sync display si el padre cambia el value externamente (ej. cargar acuerdo
  // para editar). No pisar si el usuario está tipeando y el sanitizado coincide.
  useEffect(() => {
    setDisplay((prev) => {
      const prevSan = sanitize(prev)
      if (prevSan === value) return prev
      return format(value)
    })
  }, [value])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target
    const raw = input.value
    const cursorBefore = input.selectionStart ?? raw.length
    // Posición del cursor medida en dígitos (saltea separadores).
    const digitsBeforeCursor = (raw.slice(0, cursorBefore).match(/\d/g) ?? []).length

    const num = sanitize(raw)
    const formatted = format(num)

    setDisplay(formatted)
    onChange(num)

    // Restaurar cursor contando dígitos en el string formateado.
    requestAnimationFrame(() => {
      if (!ref.current) return
      let pos = formatted.length
      let count = 0
      for (let i = 0; i < formatted.length; i++) {
        if (/\d/.test(formatted[i]!)) {
          count++
          if (count === digitsBeforeCursor) {
            pos = i + 1
            break
          }
        }
      }
      ref.current.setSelectionRange(pos, pos)
    })
  }

  return (
    <input
      {...rest}
      ref={ref}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={display}
      onChange={handleChange}
    />
  )
}
