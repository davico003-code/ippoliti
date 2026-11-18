'use client'
// SOLO PARA ELEGIR (no va a main): ?logo=a|b|c cambia cómo se ve el logo del
// desarrollador en el mosaico.
import { useEffect } from 'react'
export default function VarianteLogoPreview() {
  useEffect(() => {
    const v = new URLSearchParams(location.search).get('logo') || 'a'
    document.querySelectorAll('.proj-bento').forEach((el) => el.setAttribute('data-logo', v))
  }, [])
  return null
}
